import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Retell } from "retell-sdk";
import { sendSalesLeadNotification } from "@/src/lib/email/resend";
import { notify } from "@/src/lib/notify/router";

// ---------------------------------------------------------------------------
// Retell webhook payload types (sales-specific subset)
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
// Helpers (same patterns as intake webhook)
// ---------------------------------------------------------------------------

function keysOf(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.keys(value as Record<string, unknown>);
}

function nonEmptyStr(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return undefined;
}

function logDecision(fields: Record<string, unknown>) {
  console.log(JSON.stringify({ _tag: "retell_sales_webhook", ...fields }));
}

/**
 * Probe multiple payload paths for extracted analysis data.
 * Same multi-path strategy as intake webhook.
 */
function probeExtractedData(
  call: RetellCall | undefined,
  payload: RetellWebhookPayload,
): { data: Record<string, unknown>; path: string } {
  const cad = call?.call_analysis?.custom_analysis_data;
  if (cad && typeof cad === "object" && Object.keys(cad).length > 0) {
    return { data: cad as Record<string, unknown>, path: "call.call_analysis.custom_analysis_data" };
  }

  const ca = call?.analysis;
  if (ca && typeof ca === "object" && Object.keys(ca).length > 0) {
    return { data: ca as Record<string, unknown>, path: "call.analysis" };
  }

  const md = call?.metadata;
  if (md && typeof md === "object" && Object.keys(md).length > 0) {
    return { data: md as Record<string, unknown>, path: "call.metadata" };
  }

  const topExtra: Record<string, unknown> = {};
  for (const k of Object.keys(payload)) {
    if (k !== "event" && k !== "call") {
      topExtra[k] = payload[k];
    }
  }
  if (Object.keys(topExtra).length > 0) {
    return { data: topExtra, path: "payload_top_level" };
  }

  return { data: {}, path: "none" };
}

// ---------------------------------------------------------------------------
// GET /api/retell/sales — health check
// ---------------------------------------------------------------------------

export function GET() {
  return new NextResponse("ok", { status: 200 });
}

// ---------------------------------------------------------------------------
// POST /api/retell/sales — Sales Voice Agent webhook
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  Sentry.setTag("area", "sales");
  Sentry.setTag("provider", "retell");
  Sentry.setTag("endpoint", "/api/retell/sales");
  Sentry.setTag("_tag", "retell_sales_webhook");

  // ── Signature verification ──────────────────────────────────────────
  const signature = req.headers.get("x-retell-signature");
  if (!signature) {
    Sentry.captureMessage("Sales webhook missing x-retell-signature header", {
      level: "warning",
      tags: { stage: "verify", decision: "rejected", error_code: "NO_SIG_HEADER" },
    });
    logDecision({ decision: "rejected", reason: "missing_signature" });
    return NextResponse.json({ error: "missing_signature_header" }, { status: 401 });
  }

  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) {
    Sentry.captureMessage("RETELL_API_KEY missing on server", {
      level: "error",
      tags: { stage: "verify", decision: "rejected", error_code: "NO_API_KEY" },
    });
    logDecision({ decision: "rejected", reason: "no_api_key" });
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const rawBody = await req.text();

  try {
    const verified = await Retell.verify(rawBody, apiKey, signature);
    if (!verified) {
      Sentry.captureMessage("Invalid Retell sales webhook signature", {
        level: "warning",
        tags: { stage: "verify", decision: "rejected", error_code: "INVALID_SIG" },
      });
      logDecision({ decision: "rejected", reason: "invalid_signature" });
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  } catch (e) {
    Sentry.captureException(e, {
      tags: { stage: "verify", decision: "rejected", error_code: "VERIFY_EXCEPTION" },
    });
    logDecision({ decision: "rejected", reason: "signature_error" });
    return NextResponse.json({ error: "signature_verification_error" }, { status: 401 });
  }

  // ── Parse payload ───────────────────────────────────────────────────
  let payload: RetellWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RetellWebhookPayload;
  } catch (e) {
    Sentry.captureException(e, {
      tags: { stage: "parse", decision: "rejected", error_code: "PARSE_ERROR" },
    });
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
    category: "retell.sales_webhook",
    level: "info",
    message: "payload_keys",
    data: { event, topKeys, callKeys, analysisKeys, customDataKeys },
  });

  // ── Event gating ───────────────────────────────────────────────────
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

  // ── Extract sales-specific fields ──────────────────────────────────
  const callerName = nonEmptyStr(extractedData.caller_name);
  const companyName = nonEmptyStr(extractedData.company_name);
  const interestLevel = nonEmptyStr(extractedData.interest_level) ?? "nicht angegeben";
  const demoRequested = nonEmptyStr(extractedData.demo_requested) ?? "nicht angegeben";
  const callSummary =
    nonEmptyStr(extractedData.call_summary) ??
    nonEmptyStr(call?.call_analysis?.call_summary) ??
    nonEmptyStr(call?.transcript) ??
    "Keine Zusammenfassung verfügbar";
  const fromNumber = nonEmptyStr(call?.from_number);

  logDecision({
    decision: "processing",
    event,
    call_id: retellCallId,
    extracted_path_used: extractedPath,
    extracted_keys: extractedKeys,
    has_caller_name: !!callerName,
    has_company_name: !!companyName,
    interest_level: interestLevel,
    demo_requested: demoRequested,
    has_from_number: !!fromNumber,
  });

  // ── Send lead email to founder ─────────────────────────────────────
  try {
    const emailSent = await sendSalesLeadNotification({
      callerName,
      companyName,
      fromNumber,
      interestLevel,
      demoRequested,
      callSummary,
      retellCallId,
    });

    // RED alert if email dispatch failed
    let waSent = false;
    let waSid: string | undefined;

    if (!emailSent) {
      const wa = await notify({
        severity: "RED",
        code: "SALES_EMAIL_FAILED",
        refs: { call_id: retellCallId },
      });
      waSent = wa.sent;
      waSid = wa.messageSid;
    }

    Sentry.setTag("decision", emailSent ? "lead_sent" : "email_failed");
    Sentry.captureMessage("sales_lead_processed", {
      level: "info",
      tags: {
        area: "sales",
        provider: "retell",
        retell_call_id: retellCallId,
        decision: emailSent ? "lead_sent" : "email_failed",
        stage: "complete",
      },
    });

    logDecision({
      decision: emailSent ? "lead_sent" : "email_failed",
      call_id: retellCallId,
      email_sent: emailSent,
      ...(waSent && { wa_sent: true, wa_sid: waSid }),
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    Sentry.setTag("decision", "unexpected_error");
    Sentry.captureException(err, {
      tags: {
        area: "sales",
        provider: "retell",
        decision: "unexpected_error",
        stage: "email",
        error_code: "UNEXPECTED",
      },
    });
    const wa = await notify({
      severity: "RED",
      code: "SALES_EMAIL_FAILED",
      refs: { call_id: retellCallId },
    });
    logDecision({
      decision: "unexpected_error",
      call_id: retellCallId,
      wa_sent: wa.sent,
      wa_sid: wa.messageSid,
    });
    return new NextResponse(null, { status: 204 });
  }
}
