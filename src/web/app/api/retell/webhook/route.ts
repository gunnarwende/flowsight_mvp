import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Retell } from "retell-sdk";
import { resolveTenant } from "@/src/lib/tenants/resolveTenant";
import { getServiceClient } from "@/src/lib/supabase/server";
import { sendCaseNotification } from "@/src/lib/email/resend";

// ---------------------------------------------------------------------------
// Retell webhook payload types (from retell-sdk analysis)
// ---------------------------------------------------------------------------

interface RetellCallAnalysis {
  call_summary?: string;
  custom_analysis_data?: Record<string, unknown>;
}

interface RetellCall {
  call_id?: string;
  call_status?: string;
  from_number?: string;
  to_number?: string;
  direction?: string;
  transcript?: string;
  call_analysis?: RetellCallAnalysis;
  // Fallback paths — Retell may evolve its payload shape
  analysis?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface RetellWebhookPayload {
  event?: string;
  call?: RetellCall;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Urgency values (must match case_contract.md)
// ---------------------------------------------------------------------------

const VALID_URGENCIES = ["notfall", "dringend", "normal"] as const;
type CaseUrgency = (typeof VALID_URGENCIES)[number];

function isValidUrgency(v: unknown): v is CaseUrgency {
  return typeof v === "string" && VALID_URGENCIES.includes(v as CaseUrgency);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function keysOf(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.keys(value as Record<string, unknown>);
}

function nonEmptyStr(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return undefined;
}

/** Structured log line for Vercel Function Logs (no PII, machine-parseable). */
function logDecision(fields: Record<string, unknown>) {
  console.log(JSON.stringify({ _tag: "retell_webhook", ...fields }));
}

/**
 * Probe multiple payload paths for extracted analysis data.
 * Returns { data, path } where path indicates which location had data.
 */
function probeExtractedData(
  call: RetellCall | undefined,
  payload: RetellWebhookPayload,
): { data: Record<string, unknown>; path: string } {
  // Path 1: canonical SDK path
  const cad = call?.call_analysis?.custom_analysis_data;
  if (cad && typeof cad === "object" && Object.keys(cad).length > 0) {
    return { data: cad as Record<string, unknown>, path: "call.call_analysis.custom_analysis_data" };
  }

  // Path 2: call.analysis (possible alternative)
  const ca = call?.analysis;
  if (ca && typeof ca === "object" && Object.keys(ca).length > 0) {
    return { data: ca as Record<string, unknown>, path: "call.analysis" };
  }

  // Path 3: call.metadata (some integrations put data here)
  const md = call?.metadata;
  if (md && typeof md === "object" && Object.keys(md).length > 0) {
    return { data: md as Record<string, unknown>, path: "call.metadata" };
  }

  // Path 4: top-level payload keys besides event/call
  const topExtra: Record<string, unknown> = {};
  for (const k of Object.keys(payload)) {
    if (k !== "event" && k !== "call") {
      topExtra[k] = payload[k];
    }
  }
  if (Object.keys(topExtra).length > 0) {
    return { data: topExtra, path: "payload_top_level" };
  }

  // Nothing found
  return { data: {}, path: "none" };
}

// ---------------------------------------------------------------------------
// GET /api/retell/webhook — health check (no secrets)
// ---------------------------------------------------------------------------

export function GET() {
  return new NextResponse("ok", { status: 200 });
}

// ---------------------------------------------------------------------------
// POST /api/retell/webhook
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  Sentry.setTag("area", "voice");
  Sentry.setTag("provider", "retell");
  Sentry.setTag("endpoint", "/api/retell/webhook");

  // ── Signature verification ──────────────────────────────────────────
  const signature = req.headers.get("x-retell-signature");
  if (!signature) {
    Sentry.captureMessage("Retell webhook missing x-retell-signature header", "warning");
    logDecision({ decision: "rejected", reason: "missing_signature" });
    return NextResponse.json({ error: "missing_signature_header" }, { status: 401 });
  }

  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) {
    Sentry.captureMessage("RETELL_API_KEY missing on server", "error");
    logDecision({ decision: "rejected", reason: "no_api_key" });
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const rawBody = await req.text();

  try {
    const verified = await Retell.verify(rawBody, apiKey, signature);
    if (!verified) {
      Sentry.captureMessage("Invalid Retell webhook signature", "warning");
      logDecision({ decision: "rejected", reason: "invalid_signature" });
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  } catch (e) {
    Sentry.captureException(e);
    logDecision({ decision: "rejected", reason: "signature_error" });
    return NextResponse.json({ error: "signature_verification_error" }, { status: 401 });
  }

  // ── Parse payload ───────────────────────────────────────────────────
  let payload: RetellWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RetellWebhookPayload;
  } catch (e) {
    Sentry.captureException(e);
    logDecision({ decision: "rejected", reason: "invalid_json" });
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const call = payload.call;
  const retellCallId = call?.call_id ?? "unknown";
  const event = payload.event ?? "unknown";

  if (call?.call_id) Sentry.setTag("retell_call_id", retellCallId);
  Sentry.setTag("retell_event", event);

  // Evidence breadcrumb (keys only, no PII)
  const topKeys = keysOf(payload);
  const callKeys = keysOf(call);
  const analysisKeys = keysOf(call?.call_analysis);
  const customDataKeys = keysOf(call?.call_analysis?.custom_analysis_data);

  Sentry.addBreadcrumb({
    category: "retell.webhook",
    level: "info",
    message: "payload_keys",
    data: { event, topKeys, callKeys, analysisKeys, customDataKeys },
  });

  // ── Event gating ───────────────────────────────────────────────────
  // ONLY process call_analyzed — this is when post-call extraction data
  // is populated. call_ended fires BEFORE analysis and has no extracted
  // fields, causing false missing_fields decisions.
  if (event !== "call_analyzed") {
    logDecision({
      decision: "event_skipped",
      event,
      call_id: retellCallId,
      call_keys: callKeys,
      analysis_keys: analysisKeys,
    });
    return new NextResponse(null, { status: 204 });
  }

  // ── Probe extraction paths ──────────────────────────────────────────
  const { data: extractedData, path: extractedPath } = probeExtractedData(call, payload);
  const extractedKeys = Object.keys(extractedData);

  // ── Extract fields ─────────────────────────────────────────────────
  const callerPhone = nonEmptyStr(call?.from_number);
  const calledNumber = nonEmptyStr(call?.to_number);

  // Structured fields — read from whichever path had data
  const plz = nonEmptyStr(extractedData.plz ?? extractedData.postal_code ?? extractedData.zip);
  const city = nonEmptyStr(extractedData.city ?? extractedData.ort ?? extractedData.stadt);
  const category = nonEmptyStr(extractedData.category ?? extractedData.kategorie);
  const urgencyRaw = nonEmptyStr(extractedData.urgency ?? extractedData.dringlichkeit);
  const description =
    nonEmptyStr(extractedData.description ?? extractedData.beschreibung) ??
    nonEmptyStr(call?.call_analysis?.call_summary) ??
    nonEmptyStr(call?.transcript);

  // ── Strict validation — NO SILENT DEFAULTS ─────────────────────────
  const missing: string[] = [];
  if (!callerPhone) missing.push("contact_phone");
  if (!plz) missing.push("plz");
  if (!city) missing.push("city");
  if (!category) missing.push("category");
  if (!urgencyRaw || !isValidUrgency(urgencyRaw)) missing.push("urgency");
  if (!description) missing.push("description");

  if (missing.length > 0) {
    Sentry.setTag("decision", "missing_fields");
    Sentry.captureMessage("voice_case_missing_fields", {
      level: "warning",
      tags: {
        area: "voice",
        provider: "retell",
        retell_call_id: retellCallId,
        decision: "missing_fields",
      },
      extra: {
        missing_fields: missing,
        event,
        extracted_path_used: extractedPath,
        extracted_keys: extractedKeys,
        has_transcript: !!call?.transcript,
        has_call_summary: !!call?.call_analysis?.call_summary,
        call_keys: callKeys,
        analysis_keys: analysisKeys,
      },
    });
    logDecision({
      decision: "missing_fields",
      event,
      call_id: retellCallId,
      extracted_path_used: extractedPath,
      extracted_keys: extractedKeys,
      missing_fields: missing,
      has_transcript: !!call?.transcript,
      has_call_summary: !!call?.call_analysis?.call_summary,
      call_keys: callKeys,
      analysis_keys: analysisKeys,
    });
    return new NextResponse(null, { status: 204 });
  }

  // ── Resolve tenant ─────────────────────────────────────────────────
  const tenantId = await resolveTenant(calledNumber);
  if (!tenantId) {
    Sentry.setTag("decision", "no_tenant");
    Sentry.captureMessage("voice_case_no_tenant", {
      level: "error",
      tags: {
        area: "voice",
        provider: "retell",
        retell_call_id: retellCallId,
        decision: "no_tenant",
      },
    });
    logDecision({ decision: "no_tenant", event, call_id: retellCallId });
    return new NextResponse(null, { status: 204 });
  }

  Sentry.setTag("tenant_id", tenantId);

  // ── Create case (direct DB insert via service role) ────────────────
  try {
    const supabase = getServiceClient();

    const { data: row, error } = await supabase
      .from("cases")
      .insert({
        tenant_id: tenantId,
        source: "voice" as const,
        contact_phone: callerPhone!,
        contact_email: null,
        plz: plz!,
        city: city!,
        category: category!,
        urgency: urgencyRaw as CaseUrgency,
        description: description!,
        photo_url: null,
        raw_payload: {
          provider: "retell",
          retell_call_id: retellCallId,
          event,
        },
      })
      .select("id")
      .single();

    if (error) {
      Sentry.setTag("decision", "insert_error");
      Sentry.captureException(error, {
        tags: {
          area: "voice",
          provider: "retell",
          feature: "cases",
          tenant_id: tenantId,
          retell_call_id: retellCallId,
          decision: "insert_error",
        },
      });
      logDecision({
        decision: "insert_error",
        event,
        call_id: retellCallId,
        tenant_id: tenantId,
        error_code: error.code,
        error_message: error.message,
      });
      return new NextResponse(null, { status: 204 });
    }

    const caseId = row.id;
    Sentry.setTag("case_id", caseId);
    Sentry.setTag("decision", "created");

    // MUST await — fire-and-forget causes Vercel to kill the invocation
    // before the Resend API call + console.log complete (msgLen=0 bug).
    await sendCaseNotification({
      caseId,
      tenantId,
      source: "voice",
      category: category!,
      urgency: urgencyRaw as CaseUrgency,
      city: city!,
      plz: plz!,
      description: description!,
      contactPhone: callerPhone ?? undefined,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    Sentry.setTag("decision", "unexpected_error");
    Sentry.captureException(err, {
      tags: {
        area: "voice",
        provider: "retell",
        feature: "cases",
        tenant_id: tenantId,
        decision: "unexpected_error",
      },
    });
    logDecision({
      decision: "unexpected_error",
      event,
      call_id: retellCallId,
      tenant_id: tenantId,
    });
    return new NextResponse(null, { status: 204 });
  }
}
