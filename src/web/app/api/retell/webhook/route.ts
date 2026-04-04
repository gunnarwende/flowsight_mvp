import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Retell } from "retell-sdk";
import { resolveTenant } from "@/src/lib/tenants/resolveTenant";
import { hasModule } from "@/src/lib/tenants/hasModule";
import { getServiceClient } from "@/src/lib/supabase/server";
import { sendCaseNotification } from "@/src/lib/email/resend";
import { notify } from "@/src/lib/notify/router";
import { getTenantSmsConfig } from "@/src/lib/tenants/getTenantSmsConfig";
import { sendPostCallSms } from "@/src/lib/sms/postCallSms";
import { PLZ_CITY_MAP } from "@/src/lib/plz/plzCityMap";
import { APP_BASE_URL } from "@/src/lib/config/appUrl";

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

/** Normalize urgency: lowercase + alias mapping → valid enum or null */
function normalizeUrgency(raw: string | undefined | null): CaseUrgency | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (VALID_URGENCIES.includes(lower as CaseUrgency)) return lower as CaseUrgency;
  // Alias map: common Retell outputs → valid enum
  const aliases: Record<string, CaseUrgency> = {
    emergency: "notfall", urgent: "notfall", kritisch: "notfall",
    eilig: "dringend", wichtig: "dringend", hoch: "dringend", high: "dringend",
    mittel: "dringend", medium: "dringend",
    niedrig: "normal", low: "normal", gering: "normal", standard: "normal",
  };
  return aliases[lower] ?? null;
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
// PLZ → City auto-correction: imported from shared plzCityMap.ts

// ---------------------------------------------------------------------------
// House number text→digit normalization (STT often produces words)
// ---------------------------------------------------------------------------

function normalizeHouseNumber(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const trimmed = v.trim();
  const WORD_TO_DIGIT: Record<string, string> = {
    "eins": "1", "zwei": "2", "drei": "3", "vier": "4", "fünf": "5",
    "sechs": "6", "sieben": "7", "acht": "8", "neun": "9", "zehn": "10",
    "elf": "11", "zwölf": "12", "dreizehn": "13", "vierzehn": "14",
    "fünfzehn": "15", "sechzehn": "16", "siebzehn": "17", "achtzehn": "18",
    "neunzehn": "19", "zwanzig": "20",
  };
  const lower = trimmed.toLowerCase();
  return WORD_TO_DIGIT[lower] ?? trimmed;
}

/** Swiss German: replace ß with ss (e.g. "Straße" → "Strasse"). */
function deCH(v: string | undefined): string | undefined {
  return v?.replace(/ß/g, "ss");
}

/** Extract exactly 4 consecutive digits from any PLZ format (e.g. "PLZ 8800", "8800 Thalwil", "acht-acht-null-null"). */
function normalizePlz(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const match = v.match(/\d{4}/);
  return match ? match[0] : undefined;
}

/**
 * Calls from Twilio-owned numbers (SIP demo or FlowSight Sales) arrive with
 * from_number = a Twilio number. SMS to those numbers silently fails.
 *
 * Three-tier SMS target resolution:
 * 1. Tenant-specific demo_sms_target (for Prospect Demo — prospect's phone)
 * 2. Global DEMO_SIP_CALLER_ID (for Internal Test — founder's phone)
 * 3. No override → real caller phone (Production)
 */
const TWILIO_OWNED_NUMBERS = [
  "+41445053019", // Dörfler SIP trunk
  "+41445520919", // FlowSight Sales number
  "+41435051101", // Weinberger SIP trunk
];

function resolveSmsTarget(
  callerPhone: string | undefined,
  tenantDemoTarget?: string,
): string | undefined {
  if (!callerPhone) return undefined;
  if (TWILIO_OWNED_NUMBERS.includes(callerPhone)) {
    // SIP call: resolve demo target
    if (tenantDemoTarget) return tenantDemoTarget;
    const override = (process.env.DEMO_SIP_CALLER_ID ?? "").trim();
    if (override.length > 0) return override;
    return undefined; // No target configured — skip SMS
  }
  return callerPhone;
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
  Sentry.setTag("_tag", "retell_webhook");

  // ── Signature verification ──────────────────────────────────────────
  const signature = req.headers.get("x-retell-signature");
  if (!signature) {
    Sentry.captureMessage("Retell webhook missing x-retell-signature header", {
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
      Sentry.captureMessage("Invalid Retell webhook signature", {
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

  // ── Minimum duration gate (25s) ─────────────────────────────────────
  // Calls < 25s are accidental hangups or aborted calls. No case, no SMS.
  // Retell provides start_timestamp and end_timestamp in milliseconds.
  const callStart = typeof call?.start_timestamp === "number" ? call.start_timestamp : 0;
  const callEnd = typeof call?.end_timestamp === "number" ? call.end_timestamp : 0;
  const callDurationMs = callEnd > callStart ? callEnd - callStart : 0;
  const MIN_CALL_DURATION_MS = 25_000; // 25 seconds

  if (callDurationMs > 0 && callDurationMs < MIN_CALL_DURATION_MS) {
    logDecision({
      decision: "too_short",
      event,
      call_id: retellCallId,
      duration_ms: callDurationMs,
      min_required_ms: MIN_CALL_DURATION_MS,
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
  const plz = normalizePlz(extractedData.plz) ?? normalizePlz(extractedData.postal_code) ?? normalizePlz(extractedData.zip);
  const city = (plz && PLZ_CITY_MAP[plz]) ? PLZ_CITY_MAP[plz] : deCH(nonEmptyStr(extractedData.city ?? extractedData.ort ?? extractedData.stadt));
  const street = deCH(nonEmptyStr(extractedData.street ?? extractedData.strasse));
  const houseNumber = normalizeHouseNumber(nonEmptyStr(extractedData.house_number ?? extractedData.hausnummer));
  const reporterName = deCH(nonEmptyStr(extractedData.reporter_name ?? extractedData.name ?? extractedData.melder));
  const category = nonEmptyStr(extractedData.category ?? extractedData.kategorie);
  const urgencyRaw = nonEmptyStr(extractedData.urgency ?? extractedData.dringlichkeit);
  // Priority: custom extracted field (German) → transcript (raw conversation)
  // NOTE: call_analysis.call_summary is SKIPPED — Retell generates it in English
  // regardless of agent language, which produces English text in German emails.
  const description = deCH(
    nonEmptyStr(extractedData.description ?? extractedData.beschreibung) ??
    nonEmptyStr(call?.transcript),
  );

  // ── Normalize urgency (aliases + lowercase) ────────────────────────
  const urgencyNormalized = normalizeUrgency(urgencyRaw) ?? "normal";

  // ── Validation: HARD reject only if no phone. Everything else = defaults + warn
  if (!callerPhone) {
    Sentry.captureMessage("voice_case_no_phone", {
      level: "error",
      tags: { area: "voice", provider: "retell", retell_call_id: retellCallId, decision: "no_phone" },
    });
    logDecision({ decision: "no_phone", event, call_id: retellCallId });
    return new NextResponse(null, { status: 204 });
  }

  // Track which fields needed defaults (for quality monitoring)
  const defaulted: string[] = [];
  const finalPlz = plz ?? "";
  const finalCity = city ?? (plz && PLZ_CITY_MAP[plz]) ?? "";
  const finalCategory = category ?? "Allgemein";
  const finalDescription = description ?? nonEmptyStr(call?.transcript) ?? "Telefonische Meldung (Details fehlen)";

  if (!plz) defaulted.push("plz");
  if (!city) defaulted.push("city");
  if (!category) defaulted.push("category");
  if (!urgencyRaw || !normalizeUrgency(urgencyRaw)) defaulted.push("urgency");
  if (!description) defaulted.push("description");

  if (defaulted.length > 0) {
    Sentry.captureMessage("voice_case_partial_fields", {
      level: "warning",
      tags: {
        area: "voice",
        provider: "retell",
        retell_call_id: retellCallId,
        decision: "partial_fields",
        stage: "validate",
      },
      extra: {
        defaulted_fields: defaulted,
        event,
        extracted_path_used: extractedPath,
        extracted_keys: extractedKeys,
        has_transcript: !!call?.transcript,
      },
    });
    logDecision({
      decision: "partial_fields",
      event,
      call_id: retellCallId,
      defaulted_fields: defaulted,
      extracted_path_used: extractedPath,
      extracted_keys: extractedKeys,
    });
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
        stage: "validate",
        error_code: "NO_TENANT",
      },
    });
    logDecision({ decision: "no_tenant", event, call_id: retellCallId });
    return new NextResponse(null, { status: 204 });
  }

  Sentry.setTag("tenant_id", tenantId);

  // Resolve tenant display name + case_id_prefix for email branding (Identity Contract E4)
  const supabaseEarly = getServiceClient();
  const { data: tenantRow } = await supabaseEarly
    .from("tenants")
    .select("name, case_id_prefix, modules")
    .eq("id", tenantId)
    .single();
  const tenantDisplayName = tenantRow?.name ?? undefined;
  const caseIdPrefix = tenantRow?.case_id_prefix ?? "FS";
  const tenantModules = tenantRow?.modules as Record<string, unknown> | null;
  const tenantNotificationEmail = typeof tenantModules?.notification_email === "string" ? tenantModules.notification_email : undefined;

  // ── Module check: voice ─────────────────────────────────────────────
  if (!(await hasModule(tenantId, "voice"))) {
    Sentry.captureMessage("voice_module_disabled", {
      level: "warning",
      tags: { stage: "entitlement", decision: "module_disabled", error_code: "MODULE_DISABLED", tenant_id: tenantId },
    });
    logDecision({ decision: "module_disabled", module: "voice", event, call_id: retellCallId, tenant_id: tenantId });
    return new NextResponse(null, { status: 204 });
  }

  // ── Create case (direct DB insert via service role) ────────────────
  try {
    const supabase = getServiceClient();

    // Build insert payload — street/house_number are optional columns
    // that may not exist if the address migration hasn't been applied yet.
    // Include them only when we have values to avoid DB errors on missing columns.
    const insertPayload: Record<string, unknown> = {
      tenant_id: tenantId,
      source: "voice" as const,
      reporter_name: reporterName ?? null,
      contact_phone: callerPhone,
      contact_email: null,
      plz: finalPlz,
      city: finalCity,
      category: finalCategory,
      urgency: urgencyNormalized,
      description: finalDescription,
      photo_url: null,
      raw_payload: {
        provider: "retell",
        retell_call_id: retellCallId,
        event,
        ...(defaulted.length > 0 ? { defaulted_fields: defaulted } : {}),
      },
    };
    if (street) insertPayload.street = street;
    if (houseNumber) insertPayload.house_number = houseNumber;

    const { data: row, error } = await supabase
      .from("cases")
      .insert(insertPayload)
      .select("id, seq_number, created_at")
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
          stage: "db",
          error_code: "DB_INSERT_ERROR",
        },
      });
      const wa = await notify({
        severity: "RED",
        code: "CASE_CREATE_FAILED",
        refs: { call_id: retellCallId },
      });
      logDecision({
        decision: "insert_error",
        event,
        call_id: retellCallId,
        tenant_id: tenantId,
        error_code: error.code,
        error_message: error.message,
        wa_sent: wa.sent,
        wa_sid: wa.messageSid,
      });
      return new NextResponse(null, { status: 204 });
    }

    const caseId = row.id;
    Sentry.setTag("case_id", caseId);
    Sentry.setTag("decision", "created");

    // case_created event (fire-and-forget, errors → Sentry)
    await supabase.from("case_events").insert({
      case_id: caseId,
      event_type: "case_created",
      title: "Fall erstellt via Voice Agent",
      metadata: { source: "voice", retell_call_id: retellCallId },
    }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });

    // Push notification for Notfall cases (best-effort, never blocks)
    if (urgencyNormalized === "notfall") {
      import("@/src/lib/push/sendOpsPush").then(({ sendOpsPush }) =>
        sendOpsPush({
          tenantId,
          eventType: "notfall",
          title: "Notfall eingegangen",
          body: `${finalCategory}: ${finalCity} — ${reporterName ?? "Unbekannt"}`,
          url: `/ops/cases/${caseId}`,
          tag: `notfall-${caseId}`,
        })
      ).catch(() => {});
    }

    // MUST await — fire-and-forget causes Vercel to kill the invocation
    // before the Resend API call + console.log complete (msgLen=0 bug).
    const emailSent = await sendCaseNotification({
      caseId,
      seqNumber: row.seq_number,
      caseIdPrefix,
      tenantId,
      tenantDisplayName,
      notificationEmail: tenantNotificationEmail,
      source: "voice",
      category: category!,
      urgency: urgencyRaw as CaseUrgency,
      city: city!,
      plz: plz!,
      description: description!,
      contactPhone: callerPhone ?? undefined,
      reporterName: reporterName ?? undefined,
      street: street ?? undefined,
      houseNumber: houseNumber ?? undefined,
    });

    // Email event (fire-and-forget)
    if (emailSent) {
      await supabase.from("case_events").insert({
        case_id: caseId,
        event_type: "email_notification_sent",
        title: "Benachrichtigung an Betrieb gesendet",
      }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });
    }

    // ── Post-call SMS ─────────────────────────────────────────────
    // SMS target: 3-tier resolution (tenant demo target → global override → real caller)
    // Load tenant demo_sms_target for prospect demo mode
    let tenantDemoTarget: string | undefined;
    {
      const { data: tenantRow } = await supabase
        .from("tenants")
        .select("modules")
        .eq("id", tenantId)
        .single();
      const mods = tenantRow?.modules as Record<string, unknown> | null;
      if (typeof mods?.demo_sms_target === "string" && mods.demo_sms_target.length > 0) {
        tenantDemoTarget = mods.demo_sms_target;
      }
    }
    const smsTarget = resolveSmsTarget(callerPhone, tenantDemoTarget);

    let smsSent = false;
    let smsSid: string | undefined;
    let smsSkipReason: string | undefined;

    // SMS quality gate: only send if the call produced at least one real
    // extracted field (not all defaults). A 30s "wrong number" call where
    // Retell defaults everything should NOT trigger an SMS — it would be
    // a false confirmation ("Ihre Meldung wurde aufgenommen") for a case
    // that has no real content. The case is still created (for monitoring),
    // but the customer is not told it was "aufgenommen".
    const hasRealContent = defaulted.length < 3; // at least 2 of 5 fields came from the caller

    if (!hasRealContent) {
      smsSkipReason = "no_real_content";
    } else if (!smsTarget) {
      smsSkipReason = "no_caller_phone";
    } else {
      const smsConfig = await getTenantSmsConfig(tenantId);
      if (!smsConfig) {
        smsSkipReason = "no_sms_config";
        Sentry.addBreadcrumb({
          category: "sms",
          level: "info",
          message: "SMS skipped — tenant has no sms config (modules.sms !== true or sms_sender_name missing)",
          data: { tenant_id: tenantId, case_id: caseId },
        });
      } else {
        const smsResult = await sendPostCallSms({
          caseId,
          createdAt: row.created_at,
          seqNumber: row.seq_number,
          caseIdPrefix,
          callerPhone: smsTarget,
          smsSenderName: smsConfig.senderName,
          plz: plz!,
          city: city!,
          category: category!,
          street: street ?? undefined,
          houseNumber: houseNumber ?? undefined,
          reporterName: reporterName ?? undefined,
        });
        smsSent = smsResult.sent;
        smsSid = smsResult.messageSid;
        if (smsResult.sent) {
          await supabase.from("case_events").insert({
            case_id: caseId,
            event_type: "sms_verification_sent",
            title: "SMS-Bestätigung an Kunden gesendet",
            metadata: { sms_sid: smsResult.messageSid },
          }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });
        } else {
          smsSkipReason = `send_failed:${smsResult.reason}`;
          Sentry.captureMessage("post_call_sms_failed", {
            level: "warning",
            tags: {
              _tag: "sms",
              area: "sms",
              case_id: caseId,
              tenant_id: tenantId,
              decision: "sms_failed",
              error_code: "SMS_SEND_FAILED",
            },
            extra: { reason: smsResult.reason },
          });
        }
      }
    }

    // Notify: system failures only (email dispatch fail → RED alert)
    let waSent = false;
    let waSid: string | undefined;

    if (!emailSent) {
      const wa = await notify({
        severity: "RED",
        code: "EMAIL_DISPATCH_FAILED",
        refs: { case_id: caseId, call_id: retellCallId },
        opsLink: `${APP_BASE_URL}/ops/cases/${caseId}`,
      });
      waSent = wa.sent;
      waSid = wa.messageSid;
    }

    logDecision({
      decision: "created",
      event,
      call_id: retellCallId,
      tenant_id: tenantId,
      case_id: caseId,
      email_attempted: true,
      email_sent: !!emailSent,
      sms_sent: smsSent,
      ...(smsSid && { sms_sid: smsSid }),
      ...(smsSkipReason && { sms_skip: smsSkipReason }),
      ...(waSent && { wa_sent: true, wa_sid: waSid }),
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
        stage: "db",
        error_code: "UNEXPECTED",
      },
    });
    const wa = await notify({
      severity: "RED",
      code: "CASE_CREATE_FAILED",
      refs: { call_id: retellCallId },
    });
    logDecision({
      decision: "unexpected_error",
      event,
      call_id: retellCallId,
      tenant_id: tenantId,
      wa_sent: wa.sent,
      wa_sid: wa.messageSid,
    });
    return new NextResponse(null, { status: 204 });
  }
}
