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
  metadata?: Record<string, unknown>;
}

interface RetellWebhookPayload {
  event?: string;
  call?: RetellCall;
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
    return NextResponse.json({ error: "missing_signature_header" }, { status: 401 });
  }

  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) {
    Sentry.captureMessage("RETELL_API_KEY missing on server", "error");
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const rawBody = await req.text();

  try {
    const verified = await Retell.verify(rawBody, apiKey, signature);
    if (!verified) {
      Sentry.captureMessage("Invalid Retell webhook signature", "warning");
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "signature_verification_error" }, { status: 401 });
  }

  // ── Parse payload ───────────────────────────────────────────────────
  let payload: RetellWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RetellWebhookPayload;
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Evidence breadcrumb (keys only, no PII)
  Sentry.addBreadcrumb({
    category: "retell.webhook",
    level: "info",
    message: "payload_keys",
    data: {
      event: payload.event ?? "unknown",
      topKeys: keysOf(payload),
      callKeys: keysOf(payload.call),
      analysisKeys: keysOf(payload.call?.call_analysis),
      customDataKeys: keysOf(payload.call?.call_analysis?.custom_analysis_data),
    },
  });

  const call = payload.call;
  const retellCallId = call?.call_id;
  if (retellCallId) Sentry.setTag("retell_call_id", retellCallId);

  // ── Event gating ───────────────────────────────────────────────────
  // Only process call_ended and call_analyzed events for case creation.
  // Other events (call_started, transcript_updated, etc.) → ack silently.
  const event = payload.event;
  if (event !== "call_ended" && event !== "call_analyzed") {
    Sentry.addBreadcrumb({
      category: "retell.webhook",
      level: "info",
      message: `Acknowledged event: ${event ?? "unknown"} (no case action)`,
    });
    return new NextResponse(null, { status: 204 });
  }

  // ── Extract fields ─────────────────────────────────────────────────
  const callerPhone = nonEmptyStr(call?.from_number);
  const calledNumber = nonEmptyStr(call?.to_number);
  const customData = call?.call_analysis?.custom_analysis_data ?? {};

  // Structured fields from Retell agent's custom_analysis_data
  const plz = nonEmptyStr(customData.plz ?? customData.postal_code ?? customData.zip);
  const city = nonEmptyStr(customData.city ?? customData.ort ?? customData.stadt);
  const category = nonEmptyStr(customData.category ?? customData.kategorie);
  const urgencyRaw = nonEmptyStr(customData.urgency ?? customData.dringlichkeit);
  const description =
    nonEmptyStr(customData.description ?? customData.beschreibung) ??
    nonEmptyStr(call?.call_analysis?.call_summary) ??
    nonEmptyStr(call?.transcript);

  // ── Strict validation — NO SILENT DEFAULTS ─────────────────────────
  const missing: string[] = [];
  if (!callerPhone) missing.push("contact_phone (from_number)");
  if (!plz) missing.push("plz");
  if (!city) missing.push("city");
  if (!category) missing.push("category");
  if (!urgencyRaw || !isValidUrgency(urgencyRaw)) missing.push("urgency");
  if (!description) missing.push("description");

  if (missing.length > 0) {
    Sentry.captureMessage("voice_case_missing_fields", {
      level: "warning",
      tags: {
        area: "voice",
        provider: "retell",
        retell_call_id: retellCallId ?? "unknown",
      },
      extra: {
        missing_fields: missing,
        event,
        has_custom_analysis_data: Object.keys(customData).length > 0,
        custom_data_keys: Object.keys(customData),
        has_transcript: !!call?.transcript,
        has_call_summary: !!call?.call_analysis?.call_summary,
      },
    });
    return new NextResponse(null, { status: 204 });
  }

  // ── Resolve tenant ─────────────────────────────────────────────────
  const tenantId = await resolveTenant(calledNumber);
  if (!tenantId) {
    Sentry.captureMessage("voice_case_no_tenant", {
      level: "error",
      tags: {
        area: "voice",
        provider: "retell",
        retell_call_id: retellCallId ?? "unknown",
      },
    });
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
      Sentry.captureException(error, {
        tags: {
          area: "voice",
          provider: "retell",
          feature: "cases",
          tenant_id: tenantId,
          retell_call_id: retellCallId ?? "unknown",
        },
      });
      return new NextResponse(null, { status: 204 });
    }

    const caseId = row.id;
    Sentry.setTag("case_id", caseId);

    // Fire-and-forget email (non-blocking)
    sendCaseNotification({
      caseId,
      tenantId,
      source: "voice",
      category: category!,
      urgency: urgencyRaw as CaseUrgency,
      city: city!,
      plz: plz!,
      description: description!,
    }).catch(() => {
      // Already captured in Sentry inside sendCaseNotification
    });

    Sentry.addBreadcrumb({
      category: "retell.webhook",
      level: "info",
      message: `Case created: ${caseId}`,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        area: "voice",
        provider: "retell",
        feature: "cases",
        tenant_id: tenantId,
      },
    });
    return new NextResponse(null, { status: 204 });
  }
}
