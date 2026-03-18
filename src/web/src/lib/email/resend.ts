import "server-only";

import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Missing RESEND_API_KEY");
    _resend = new Resend(key);
  }
  return _resend;
}

interface CaseEmailPayload {
  caseId: string;
  seqNumber?: number | null;
  tenantId: string;
  tenantDisplayName?: string;
  /** Tenant case ID prefix, e.g. "WB". Falls back to "FS". */
  caseIdPrefix?: string;
  source: string;
  category: string;
  urgency: string;
  city: string;
  plz: string;
  description: string;
  contactPhone?: string;
  contactEmail?: string;
  reporterName?: string;
  street?: string;
  houseNumber?: string;
  /** Injected by caller — result of sendReporterConfirmation (no extra log). */
  reporterEmailSent?: boolean;
}

/** Format case ID for display: WB-0029 if seq_number available, else UUID fragment. */
function formatCaseLabel(caseId: string, seqNumber?: number | null, prefix: string = "FS"): string {
  if (seqNumber != null) return `${prefix}-${String(seqNumber).padStart(4, "0")}`;
  return caseId.slice(0, 8);
}

// ---------------------------------------------------------------------------
// Source labels (shared)
// ---------------------------------------------------------------------------

const SOURCE_LABELS: Record<string, string> = {
  voice: "Voice Agent",
  wizard: "Website-Formular",
  manual: "Manuell erfasst",
};

// ---------------------------------------------------------------------------
// HTML email builders
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build RFC 5322 From address with tenant branding.
 * Identity Contract E4: "{display_name} via FlowSight <noreply@...>"
 */
function buildFromAddress(tenantDisplayName?: string): string {
  const addr = process.env.MAIL_FROM ?? "noreply@send.flowsight.ch";
  if (!tenantDisplayName) return addr;
  const safe = tenantDisplayName.replace(/[<>"]/g, "");
  return `${safe} via FlowSight <${addr}>`;
}

function buildOpsNotificationHtml(p: CaseEmailPayload, deepLink: string): string {
  const label = formatCaseLabel(p.caseId, p.seqNumber, p.caseIdPrefix);
  const sourceLabel = SOURCE_LABELS[p.source] ?? p.source;

  // Urgency styling
  const urgencyConfig: Record<string, { bg: string; text: string }> = {
    notfall: { bg: "#dc2626", text: "NOTFALL" },
    dringend: { bg: "#d97706", text: "Dringend" },
    normal: { bg: "#475569", text: "Neuer Fall" },
  };
  const urg = urgencyConfig[p.urgency] ?? urgencyConfig.normal;

  // Address line
  const addressParts: string[] = [];
  if (p.street) {
    addressParts.push(p.street + (p.houseNumber ? ` ${p.houseNumber}` : ""));
  }

  // Data rows
  const rows: [string, string][] = [
    ["Herkunft", sourceLabel],
    ["Kategorie", p.category],
    ["Priorität", p.urgency.charAt(0).toUpperCase() + p.urgency.slice(1)],
    ["PLZ / Ort", `${p.plz} ${p.city}`],
  ];
  if (addressParts.length > 0) rows.push(["Adresse", addressParts[0]]);
  if (p.reporterName) rows.push(["Kunde", p.reporterName]);
  if (p.contactPhone) rows.push(["Telefon", p.contactPhone]);
  if (p.contactEmail) rows.push(["E-Mail", p.contactEmail]);

  const dataRowsHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#94a3b8;font-size:14px;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0;color:#e2e8f0;font-size:14px">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0b1120;border-radius:8px;overflow:hidden">
<!-- Gold accent bar -->
<tr><td style="height:4px;background:#d4a853;font-size:0;line-height:0">&nbsp;</td></tr>
<!-- Logo -->
<tr><td style="padding:20px 24px 12px;color:#d4a853;font-size:20px;font-weight:700;letter-spacing:0.5px">${escapeHtml(p.tenantDisplayName ?? "FlowSight")}</td></tr>
<!-- Urgency header -->
<tr><td style="padding:0 24px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${urg.bg};border-radius:6px">
  <tr>
    <td style="padding:14px 16px;color:#ffffff;font-size:16px;font-weight:700">${escapeHtml(urg.text)}</td>
    <td style="padding:14px 16px;color:#ffffff;font-size:16px;font-weight:700;text-align:right">${escapeHtml(label)}</td>
  </tr>
  <tr>
    <td colspan="2" style="padding:0 16px 14px;color:rgba(255,255,255,0.9);font-size:14px">${escapeHtml(p.category)} &mdash; ${escapeHtml(p.plz)} ${escapeHtml(p.city)}</td>
  </tr>
  </table>
</td></tr>
<!-- Data table -->
<tr><td style="padding:20px 24px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  ${dataRowsHtml}
  </table>
</td></tr>
<!-- Description -->
<tr><td style="padding:20px 24px 0">
  <div style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Beschreibung</div>
  <div style="background:#1e293b;border-radius:6px;padding:14px 16px;color:#e2e8f0;font-size:14px;line-height:1.5;white-space:pre-wrap">${escapeHtml(p.description)}</div>
</td></tr>
<!-- CTA button -->
<tr><td style="padding:24px 24px 8px" align="center">
  <a href="${escapeHtml(deepLink)}" target="_blank" style="display:inline-block;background:#d4a853;color:#0b1120;font-size:15px;font-weight:700;text-decoration:none;padding:12px 32px;border-radius:6px">Fall im Leitstand &ouml;ffnen</a>
</td></tr>
<!-- Footer -->
<tr><td style="padding:20px 24px;border-top:1px solid #1e293b;margin-top:16px">
  <div style="color:#64748b;font-size:12px;text-align:center">${escapeHtml(p.tenantDisplayName ?? "FlowSight")} &middot; via FlowSight</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildReporterConfirmationHtml(
  label: string,
  category: string,
): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden">
<!-- Brand accent bar -->
<tr><td style="height:4px;background:#0b1120;font-size:0;line-height:0">&nbsp;</td></tr>
<!-- Heading -->
<tr><td style="padding:32px 32px 0;color:#0f172a;font-size:20px;font-weight:700">Ihre Meldung wurde erfasst.</td></tr>
<!-- Body -->
<tr><td style="padding:20px 32px 0;color:#334155;font-size:15px;line-height:1.6">
Guten Tag<br><br>
Vielen Dank f&uuml;r Ihre Meldung. Wir haben Ihre Anfrage erhalten und melden uns schnellstm&ouml;glich bei Ihnen.
</td></tr>
<!-- Reference -->
<tr><td style="padding:20px 32px 0">
  <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:6px;width:100%">
  <tr>
    <td style="padding:12px 16px;color:#64748b;font-size:14px">Referenz</td>
    <td style="padding:12px 16px;color:#0f172a;font-size:14px;font-weight:600;text-align:right">${escapeHtml(label)}</td>
  </tr>
  <tr>
    <td style="padding:0 16px 12px;color:#64748b;font-size:14px">Kategorie</td>
    <td style="padding:0 16px 12px;color:#0f172a;font-size:14px;text-align:right">${escapeHtml(category)}</td>
  </tr>
  </table>
</td></tr>
<!-- Sign-off -->
<tr><td style="padding:24px 32px 0;color:#334155;font-size:15px;line-height:1.6">
Freundliche Gr&uuml;sse<br>Ihr Service-Team
</td></tr>
<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:1px solid #e2e8f0;margin-top:24px">
  <div style="color:#94a3b8;font-size:12px;text-align:center">Diese E-Mail wurde automatisch erstellt.</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Send a case-created notification email.
 * MUST be awaited by callers — fire-and-forget causes Vercel to terminate
 * before the Resend API call + console.log complete.
 *
 * Errors are captured to Sentry but never thrown.
 * Owns the SINGLE console.log per invocation (Vercel Hobby limit).
 */
export async function sendCaseNotification(
  payload: CaseEmailPayload
): Promise<boolean> {
  const from = buildFromAddress(payload.tenantDisplayName);
  const to = process.env.MAIL_REPLY_TO;

  // Base log fields — always present, no PII (no actual addresses)
  const fromAddr = process.env.MAIL_FROM ?? "noreply@send.flowsight.ch";
  const base: Record<string, unknown> = {
    _tag: "resend",
    case_id: payload.caseId,
    source: payload.source,
    tenant_id: payload.tenantId,
    recipient_env: "MAIL_REPLY_TO",
    recipient_present: !!to,
    from_env: process.env.MAIL_FROM ? "MAIL_FROM" : "default",
    from_domain: fromAddr.split("@")[1] ?? "unknown",
    ...(payload.reporterEmailSent !== undefined && {
      reporter_email_sent: payload.reporterEmailSent,
    }),
  };

  if (!process.env.RESEND_API_KEY) {
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "no_RESEND_API_KEY" }));
    return false;
  }

  if (!to) {
    Sentry.captureMessage("MAIL_REPLY_TO not configured — skipping email", {
      level: "warning",
      tags: { _tag: "resend", area: "email", provider: "resend", source: payload.source, decision: "skipped", error_code: "NO_REPLY_TO" },
    });
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "no_MAIL_REPLY_TO" }));
    return false;
  }

  const urgencyLabel =
    payload.urgency === "notfall"
      ? "🔴 NOTFALL"
      : payload.urgency === "dringend"
        ? "🟡 Dringend"
        : "Neuer Fall";

  try {
    const baseUrl =
      process.env.APP_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://flowsight.ch";
    const deepLink = `${baseUrl}/ops/cases/${payload.caseId}`;

    const contactLines: string[] = [];
    if (payload.contactPhone) contactLines.push(`Telefon:   ${payload.contactPhone}`);
    if (payload.contactEmail) contactLines.push(`E-Mail:    ${payload.contactEmail}`);

    const addressLine =
      payload.street
        ? `Adresse:   ${payload.street}${payload.houseNumber ? ` ${payload.houseNumber}` : ""}`
        : undefined;

    const sourceLabel = SOURCE_LABELS[payload.source] ?? payload.source;

    const { data, error } = await getResend().emails.send({
      from,
      to,
      subject: `${urgencyLabel} – ${formatCaseLabel(payload.caseId, payload.seqNumber, payload.caseIdPrefix)} – ${payload.category} (${payload.city})`,
      html: buildOpsNotificationHtml(payload, deepLink),
      text: [
        `Neuer Fall erstellt`,
        `──────────────────────`,
        `Fall-Nr:   ${formatCaseLabel(payload.caseId, payload.seqNumber, payload.caseIdPrefix)}`,
        `Herkunft:  ${sourceLabel}`,
        `Kategorie: ${payload.category}`,
        `Priorität: ${payload.urgency}`,
        `PLZ/Ort:   ${payload.plz} ${payload.city}`,
        ...(addressLine ? [addressLine] : []),
        ...(payload.reporterName ? [`Kunde:     ${payload.reporterName}`] : []),
        ...(contactLines.length > 0 ? contactLines : []),
        `──────────────────────`,
        `Beschreibung:`,
        payload.description,
        ``,
        `──────────────────────`,
        `Fall öffnen: ${deepLink}`,
        `(Login erforderlich)`,
      ].join("\n"),
    });

    if (error) {
      Sentry.captureException(error, {
        tags: {
          _tag: "resend",
          area: "email",
          provider: "resend",
          source: payload.source,
          tenant_id: payload.tenantId,
          case_id: payload.caseId,
          decision: "failed",
          stage: "email",
          error_code: "RESEND_API_ERROR",
        },
      });
      const apiErr = error as Record<string, unknown>;
      console.log(JSON.stringify({
        ...base,
        decision: "failed",
        reason: "resend_api_error",
        error_code: apiErr.name ?? null,
        error_message: typeof apiErr.message === "string" ? apiErr.message : null,
        http_status: apiErr.statusCode ?? null,
      }));
      return false;
    }

    console.log(JSON.stringify({
      ...base,
      decision: "sent",
      provider_message_id: data?.id ?? null,
    }));
    return true;
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        _tag: "resend",
        area: "email",
        provider: "resend",
        source: payload.source,
        tenant_id: payload.tenantId,
        case_id: payload.caseId,
        decision: "failed",
        stage: "email",
        error_code: "RESEND_EXCEPTION",
      },
    });
    console.log(JSON.stringify({
      ...base,
      decision: "failed",
      reason: "exception",
      error_code: err instanceof Error ? err.name : "unknown",
      error_message: err instanceof Error ? err.message : "unknown",
    }));
    return false;
  }
}

// ---------------------------------------------------------------------------
// Reporter confirmation email (Wizard only)
// ---------------------------------------------------------------------------

interface ReporterConfirmationPayload {
  caseId: string;
  seqNumber?: number | null;
  tenantId: string;
  tenantDisplayName?: string;
  caseIdPrefix?: string;
  contactEmail: string;
  category: string;
}

/**
 * Send a short confirmation email to the person who submitted the case.
 * Plain text, minimal content, no PII in logs.
 *
 * NO console.log — the caller (route) merges the boolean result into
 * sendCaseNotification's log to respect the 1-log-per-invocation rule.
 *
 * Errors are captured to Sentry but never thrown.
 */
export async function sendReporterConfirmation(
  payload: ReporterConfirmationPayload
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;

  const from = buildFromAddress(payload.tenantDisplayName);
  // Identity Contract R4: never show "FlowSight" to end users
  const tenantLabel = payload.tenantDisplayName ?? "Ihr Servicebetrieb";

  try {
    const caseLabel = formatCaseLabel(payload.caseId, payload.seqNumber, payload.caseIdPrefix);

    const { error } = await getResend().emails.send({
      from,
      to: payload.contactEmail,
      subject: `Ihre Meldung wurde erfasst — ${tenantLabel}`,
      html: buildReporterConfirmationHtml(caseLabel, payload.category),
      text: [
        `Guten Tag`,
        ``,
        `Vielen Dank für Ihre Meldung (${payload.category}).`,
        `Wir haben Ihre Anfrage erhalten und melden uns schnellstmöglich bei Ihnen.`,
        ``,
        `Referenz: ${caseLabel}`,
        ``,
        `Freundliche Grüsse`,
        `Ihr Service-Team`,
      ].join("\n"),
    });

    if (error) {
      Sentry.captureException(error, {
        tags: {
          _tag: "resend",
          area: "email",
          provider: "resend",
          email_type: "reporter_confirmation",
          case_id: payload.caseId,
          tenant_id: payload.tenantId,
          decision: "failed",
          stage: "email",
          error_code: "RESEND_API_ERROR",
        },
      });
      return false;
    }

    return true;
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        _tag: "resend",
        area: "email",
        provider: "resend",
        email_type: "reporter_confirmation",
        case_id: payload.caseId,
        tenant_id: payload.tenantId,
        decision: "failed",
        stage: "email",
        error_code: "RESEND_EXCEPTION",
      },
    });
    return false;
  }
}

// ---------------------------------------------------------------------------
// Review request email (Ops-triggered)
// ---------------------------------------------------------------------------

interface ReviewRequestPayload {
  caseId: string;
  tenantId: string;
  tenantDisplayName?: string;
  contactEmail: string;
  /** Our own review surface URL — always the primary link */
  reviewSurfaceUrl: string;
  /** Optional Google Review URL — only used as fallback on the review surface itself */
  googleReviewUrl?: string;
}

/**
 * Send a review request email after a completed job.
 * Plain text, minimal, one-time. Owns its own console.log
 * (this runs in a separate invocation via the request-review route).
 *
 * Errors are captured to Sentry but never thrown.
 */
export async function sendReviewRequest(
  payload: ReviewRequestPayload
): Promise<boolean> {
  const from = buildFromAddress(payload.tenantDisplayName);
  // Identity Contract R4: never show "FlowSight" to end users
  const tenantLabel = payload.tenantDisplayName ?? "Ihr Servicebetrieb";

  const base: Record<string, unknown> = {
    _tag: "resend",
    email_type: "review_request",
    case_id: payload.caseId,
    tenant_id: payload.tenantId,
  };

  if (!process.env.RESEND_API_KEY) {
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "no_RESEND_API_KEY" }));
    return false;
  }

  try {
    const reviewLink = payload.reviewSurfaceUrl;

    const { error } = await getResend().emails.send({
      from,
      to: payload.contactEmail,
      subject: `Wie war unser Service? — ${tenantLabel}`,
      text: [
        `Guten Tag`,
        ``,
        `Wir hoffen, dass Sie mit unserem Service zufrieden waren.`,
        `Über eine kurze Bewertung würden wir uns sehr freuen:`,
        ``,
        reviewLink,
        ``,
        `Vielen Dank für Ihr Vertrauen.`,
        ``,
        `Freundliche Grüsse`,
        `Ihr Service-Team`,
        ``,
        `Sie erhalten diese Nachricht, weil wir einen Auftrag für Sie erledigt haben.`,
      ].join("\n"),
    });

    if (error) {
      Sentry.captureException(error, {
        tags: {
          _tag: "resend",
          area: "email",
          provider: "resend",
          email_type: "review_request",
          case_id: payload.caseId,
          tenant_id: payload.tenantId,
          decision: "failed",
          stage: "email",
          error_code: "RESEND_API_ERROR",
        },
      });
      console.log(JSON.stringify({ ...base, decision: "failed", reason: "resend_api_error" }));
      return false;
    }

    console.log(JSON.stringify({ ...base, decision: "sent" }));
    return true;
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        _tag: "resend",
        area: "email",
        provider: "resend",
        email_type: "review_request",
        case_id: payload.caseId,
        tenant_id: payload.tenantId,
        decision: "failed",
        stage: "email",
        error_code: "RESEND_EXCEPTION",
      },
    });
    console.log(JSON.stringify({ ...base, decision: "failed", reason: "exception" }));
    return false;
  }
}

// ---------------------------------------------------------------------------
// Sales lead notification (Sales Voice Agent)
// ---------------------------------------------------------------------------

interface SalesLeadPayload {
  callerName?: string;
  companyName?: string;
  fromNumber?: string;
  interestLevel: string;
  callbackRequested: string;
  callbackTime?: string;
  callSummary: string;
  retellCallId: string;
}

/**
 * Send an interest-capture notification email to the founder.
 * Triggered by the Interest Capture Agent webhook after a call on 044 552 09 19.
 *
 * Owns its own console.log (runs in a separate invocation via the sales webhook).
 * Errors are captured to Sentry but never thrown.
 */
export async function sendSalesLeadNotification(
  payload: SalesLeadPayload
): Promise<boolean> {
  const fromAddr = process.env.MAIL_FROM ?? "noreply@send.flowsight.ch";
  const from = `FlowSight Sales <${fromAddr}>`;
  const to = process.env.MAIL_REPLY_TO;

  const base: Record<string, unknown> = {
    _tag: "resend",
    email_type: "sales_lead",
    area: "sales",
    retell_call_id: payload.retellCallId,
    recipient_env: "MAIL_REPLY_TO",
    recipient_present: !!to,
    from_env: process.env.MAIL_FROM ? "MAIL_FROM" : "default",
    from_domain: fromAddr.split("@")[1] ?? "unknown",
  };

  if (!process.env.RESEND_API_KEY) {
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "no_RESEND_API_KEY" }));
    return false;
  }

  if (!to) {
    Sentry.captureMessage("MAIL_REPLY_TO not configured — skipping sales lead email", {
      level: "warning",
      tags: { _tag: "resend", area: "sales", provider: "resend", email_type: "sales_lead", decision: "skipped", error_code: "NO_REPLY_TO" },
    });
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "no_MAIL_REPLY_TO" }));
    return false;
  }

  const companyLabel = payload.companyName || "Unbekannt";

  try {
    const { data, error } = await getResend().emails.send({
      from,
      to,
      subject: `Rückruf-Wunsch — ${companyLabel} (${payload.interestLevel})`,
      text: [
        `Neuer Anruf auf 044 552 09 19`,
        ``,
        `Name:             ${payload.callerName || "nicht angegeben"}`,
        `Firma:            ${payload.companyName || "nicht angegeben"}`,
        `Telefon:          ${payload.fromNumber || "nicht angegeben"}`,
        `Interesse:        ${payload.interestLevel}`,
        `Rückruf gewünscht: ${payload.callbackRequested}`,
        ...(payload.callbackTime ? [`Bevorzugte Zeit:  ${payload.callbackTime}`] : []),
        ``,
        `Zusammenfassung:`,
        payload.callSummary,
        ``,
        `---`,
        `Retell Call ID: ${payload.retellCallId}`,
      ].join("\n"),
    });

    if (error) {
      Sentry.captureException(error, {
        tags: {
          _tag: "resend",
          area: "sales",
          provider: "resend",
          email_type: "sales_lead",
          decision: "failed",
          stage: "email",
          error_code: "RESEND_API_ERROR",
        },
      });
      const apiErr = error as Record<string, unknown>;
      console.log(JSON.stringify({
        ...base,
        decision: "failed",
        reason: "resend_api_error",
        error_code: apiErr.name ?? null,
        error_message: typeof apiErr.message === "string" ? apiErr.message : null,
      }));
      return false;
    }

    console.log(JSON.stringify({
      ...base,
      decision: "sent",
      provider_message_id: data?.id ?? null,
    }));
    return true;
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        _tag: "resend",
        area: "sales",
        provider: "resend",
        email_type: "sales_lead",
        decision: "failed",
        stage: "email",
        error_code: "RESEND_EXCEPTION",
      },
    });
    console.log(JSON.stringify({
      ...base,
      decision: "failed",
      reason: "exception",
      error_code: err instanceof Error ? err.name : "unknown",
      error_message: err instanceof Error ? err.message : "unknown",
    }));
    return false;
  }
}

// ---------------------------------------------------------------------------
// Assignment notification email (staff gets notified when assigned to a case)
// ---------------------------------------------------------------------------

interface AssignmentNotificationPayload {
  caseId: string;
  caseLabel: string;
  tenantDisplayName: string;
  staffName: string;
  staffEmail: string;
  category: string;
  city: string;
  urgency: string;
  description: string;
  deepLink: string;
}

/**
 * Send an email to a staff member when they are assigned to a case.
 * Identity Contract E4: From = "{tenant} via FlowSight".
 * No console.log — caller merges into existing log line.
 */
export async function sendAssignmentNotification(
  payload: AssignmentNotificationPayload
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;

  const from = buildFromAddress(payload.tenantDisplayName);

  const urgencyLabel =
    payload.urgency === "notfall" ? "NOTFALL" :
    payload.urgency === "dringend" ? "Dringend" : "Normal";

  try {
    const { error } = await getResend().emails.send({
      from,
      to: payload.staffEmail,
      subject: `Neuer Fall zugewiesen — ${payload.caseLabel} ${payload.category}`,
      text: [
        `Hallo ${payload.staffName}`,
        ``,
        `Dir wurde ein neuer Fall zugewiesen:`,
        `──────────────────────`,
        `Fall-Nr:     ${payload.caseLabel}`,
        `Kategorie:   ${payload.category}`,
        `Ort:         ${payload.city}`,
        `Priorität:   ${urgencyLabel}`,
        `──────────────────────`,
        `Beschreibung:`,
        payload.description,
        ``,
        `Fall öffnen: ${payload.deepLink}`,
        `(Login erforderlich)`,
      ].join("\n"),
    });

    if (error) {
      Sentry.captureException(error, {
        tags: {
          _tag: "resend", area: "email", provider: "resend",
          email_type: "assignment_notification", case_id: payload.caseId,
          decision: "failed", error_code: "RESEND_API_ERROR",
        },
      });
      return false;
    }
    return true;
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        _tag: "resend", area: "email", provider: "resend",
        email_type: "assignment_notification", case_id: payload.caseId,
        decision: "failed", error_code: "RESEND_EXCEPTION",
      },
    });
    return false;
  }
}

// ---------------------------------------------------------------------------
// Termin confirmation to reporter (Melder)
// ---------------------------------------------------------------------------

interface TerminConfirmationPayload {
  caseLabel: string;
  tenantDisplayName: string;
  reporterName?: string;
  category: string;
  scheduledAt: string;
  scheduledEndAt?: string | null;
  tenantPhone?: string;
}

/**
 * Send a termin confirmation email to the Melder.
 * Identity Contract R4: NO "FlowSight" visible. From = tenant name only.
 * No console.log — caller owns the log.
 */
export async function sendTerminConfirmationToMelder(
  payload: TerminConfirmationPayload,
  recipientEmail: string,
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;

  // R4: No "FlowSight" visible to end users — use tenant name directly
  const addr = process.env.MAIL_FROM ?? "noreply@send.flowsight.ch";
  const safe = payload.tenantDisplayName.replace(/[<>"]/g, "");
  const from = `${safe} <${addr}>`;

  const start = new Date(payload.scheduledAt);
  const dateFmt: Intl.DateTimeFormatOptions = { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" };
  const timeFmt: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" };

  let terminStr = `${start.toLocaleDateString("de-CH", dateFmt)}, ${start.toLocaleTimeString("de-CH", timeFmt)}`;
  if (payload.scheduledEndAt) {
    const end = new Date(payload.scheduledEndAt);
    terminStr += `–${end.toLocaleTimeString("de-CH", timeFmt)}`;
  }

  const greeting = payload.reporterName ? `Guten Tag ${payload.reporterName}` : "Guten Tag";
  const phoneLine = payload.tenantPhone ? `Bei Fragen erreichen Sie uns unter ${payload.tenantPhone}.` : "";

  try {
    const { error } = await getResend().emails.send({
      from,
      to: recipientEmail,
      subject: `Ihr Termin — ${payload.tenantDisplayName}`,
      text: [
        greeting,
        ``,
        `Wir haben Ihren Termin eingeplant:`,
        ``,
        `Termin:    ${terminStr}`,
        `Kategorie: ${payload.category}`,
        ``,
        ...(phoneLine ? [phoneLine, ``] : []),
        `Freundliche Grüsse`,
        `Ihr Service-Team`,
      ].join("\n"),
    });

    if (error) {
      Sentry.captureException(error, {
        tags: {
          _tag: "resend", area: "email", provider: "resend",
          email_type: "termin_confirmation_melder",
          decision: "failed", error_code: "RESEND_API_ERROR",
        },
      });
      return false;
    }
    return true;
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        _tag: "resend", area: "email", provider: "resend",
        email_type: "termin_confirmation_melder",
        decision: "failed", error_code: "RESEND_EXCEPTION",
      },
    });
    return false;
  }
}

// ---------------------------------------------------------------------------
// ICS Appointment Email (L9: ICS v2 per E-Mail)
// ---------------------------------------------------------------------------

interface AppointmentEmailPayload {
  appointmentId: string;
  caseId: string;
  seqNumber?: number | null;
  caseIdPrefix?: string;
  tenantDisplayName?: string;
  staffName: string;
  staffEmail?: string;
  scheduledAt: string;
  durationMin: number;
  category?: string;
  city?: string;
  notes?: string;
  icsContent: string;
  method?: "REQUEST" | "CANCEL";
}

export async function sendAppointmentIcsEmail(payload: AppointmentEmailPayload): Promise<boolean> {
  const from = `${payload.tenantDisplayName ?? "Ihr Servicebetrieb"} <${process.env.RESEND_FROM ?? "noreply@flowsight.ch"}>`;
  const recipientEmail = payload.staffEmail || process.env.MAIL_REPLY_TO;
  if (!recipientEmail) return false;

  const prefix = payload.caseIdPrefix ?? "FS";
  const caseLabel = payload.seqNumber
    ? `${prefix}-${String(payload.seqNumber).padStart(4, "0")}`
    : payload.caseId.slice(0, 8);

  const isCancellation = payload.method === "CANCEL";
  const subject = isCancellation
    ? `Termin abgesagt — ${caseLabel} ${payload.category ?? ""}`
    : `Termin — ${caseLabel} ${payload.category ?? ""} (${payload.city ?? ""})`;

  const date = new Date(payload.scheduledAt);
  const dateStr = date.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Zurich" });
  const timeStr = date.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });

  const textBody = [
    isCancellation ? `Termin abgesagt` : `Neuer Termin`,
    ``,
    `Fall:        ${caseLabel}`,
    `Techniker:   ${payload.staffName}`,
    `Datum:       ${dateStr}`,
    `Uhrzeit:     ${timeStr}`,
    `Dauer:       ${payload.durationMin} Min.`,
    ...(payload.category ? [`Kategorie:   ${payload.category}`] : []),
    ...(payload.city ? [`Ort:         ${payload.city}`] : []),
    ...(payload.notes ? [`\nNotizen: ${payload.notes}`] : []),
  ].join("\n");

  try {
    const { error } = await getResend().emails.send({
      from,
      to: recipientEmail,
      subject,
      text: textBody,
      attachments: [
        {
          filename: "termin.ics",
          content: Buffer.from(payload.icsContent, "utf-8").toString("base64"),
          contentType: "text/calendar; method=" + (payload.method ?? "REQUEST"),
        },
      ],
    });

    if (error) {
      Sentry.captureException(error, {
        tags: { _tag: "resend", area: "ops", email_type: "appointment_ics", decision: "failed" },
      });
      return false;
    }
    return true;
  } catch (err) {
    Sentry.captureException(err, {
      tags: { _tag: "resend", area: "ops", email_type: "appointment_ics", decision: "failed" },
    });
    return false;
  }
}
