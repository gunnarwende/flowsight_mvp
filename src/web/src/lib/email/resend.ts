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
  tenantId: string;
  source: string;
  category: string;
  urgency: string;
  city: string;
  plz: string;
  description: string;
  contactPhone?: string;
  contactEmail?: string;
  /** Injected by caller — result of sendReporterConfirmation (no extra log). */
  reporterEmailSent?: boolean;
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
  const fromEnvValue = process.env.MAIL_FROM;
  const from = fromEnvValue ?? "noreply@send.flowsight.ch";
  const to = process.env.MAIL_REPLY_TO;
  const subjectPrefix = process.env.MAIL_SUBJECT_PREFIX ?? "[FlowSight]";

  // Base log fields — always present, no PII (no actual addresses)
  const base: Record<string, unknown> = {
    _tag: "resend",
    case_id: payload.caseId,
    source: payload.source,
    tenant_id: payload.tenantId,
    recipient_env: "MAIL_REPLY_TO",
    recipient_present: !!to,
    from_env: fromEnvValue ? "MAIL_FROM" : "default",
    from_domain: from.split("@")[1] ?? "unknown",
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
      "https://flowsight-mvp.vercel.app";
    const deepLink = `${baseUrl}/ops/cases/${payload.caseId}`;

    const contactLines: string[] = [];
    if (payload.contactPhone) contactLines.push(`Telefon:   ${payload.contactPhone}`);
    if (payload.contactEmail) contactLines.push(`E-Mail:    ${payload.contactEmail}`);

    const { data, error } = await getResend().emails.send({
      from,
      to,
      subject: `${subjectPrefix} ${urgencyLabel} – ${payload.category} (${payload.city})`,
      text: [
        `Neuer Case erstellt`,
        `──────────────────────`,
        `ID:        ${payload.caseId.slice(0, 8)}`,
        `Quelle:    ${payload.source}`,
        `Kategorie: ${payload.category}`,
        `Dringend:  ${payload.urgency}`,
        `PLZ/Ort:   ${payload.plz} ${payload.city}`,
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
  tenantId: string;
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

  const from = process.env.MAIL_FROM ?? "noreply@send.flowsight.ch";
  const subjectPrefix = process.env.MAIL_SUBJECT_PREFIX ?? "[FlowSight]";

  try {
    const { error } = await getResend().emails.send({
      from,
      to: payload.contactEmail,
      subject: `${subjectPrefix} Ihre Meldung wurde erfasst`,
      text: [
        `Guten Tag`,
        ``,
        `Vielen Dank für Ihre Meldung (${payload.category}).`,
        `Wir haben Ihre Anfrage erhalten und melden uns schnellstmöglich bei Ihnen.`,
        ``,
        `Referenz: ${payload.caseId.slice(0, 8)}`,
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
  contactEmail: string;
  googleReviewUrl: string;
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
  const fromEnvValue = process.env.MAIL_FROM;
  const from = fromEnvValue ?? "noreply@send.flowsight.ch";
  const subjectPrefix = process.env.MAIL_SUBJECT_PREFIX ?? "[FlowSight]";

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
    const { error } = await getResend().emails.send({
      from,
      to: payload.contactEmail,
      subject: `${subjectPrefix} Wie war unser Service?`,
      text: [
        `Guten Tag`,
        ``,
        `Wir hoffen, dass Sie mit unserem Service zufrieden waren.`,
        `Über eine kurze Bewertung würden wir uns sehr freuen:`,
        ``,
        payload.googleReviewUrl,
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
  demoRequested: string;
  callSummary: string;
  retellCallId: string;
}

/**
 * Send a sales lead notification email to the founder.
 * Triggered by the Sales Voice Agent webhook after a call on 044 552 09 19.
 *
 * Owns its own console.log (runs in a separate invocation via the sales webhook).
 * Errors are captured to Sentry but never thrown.
 */
export async function sendSalesLeadNotification(
  payload: SalesLeadPayload
): Promise<boolean> {
  const fromEnvValue = process.env.MAIL_FROM;
  const from = fromEnvValue ?? "noreply@send.flowsight.ch";
  const to = process.env.MAIL_REPLY_TO;
  const subjectPrefix = process.env.MAIL_SUBJECT_PREFIX ?? "[FlowSight]";

  const base: Record<string, unknown> = {
    _tag: "resend",
    email_type: "sales_lead",
    area: "sales",
    retell_call_id: payload.retellCallId,
    recipient_env: "MAIL_REPLY_TO",
    recipient_present: !!to,
    from_env: fromEnvValue ? "MAIL_FROM" : "default",
    from_domain: from.split("@")[1] ?? "unknown",
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
      subject: `${subjectPrefix} Neuer Lead — ${companyLabel} (${payload.interestLevel})`,
      text: [
        `Neuer Anruf auf 044 552 09 19`,
        ``,
        `Name:           ${payload.callerName || "nicht angegeben"}`,
        `Firma:          ${payload.companyName || "nicht angegeben"}`,
        `Telefon:        ${payload.fromNumber || "nicht angegeben"}`,
        `Interesse:      ${payload.interestLevel}`,
        `Demo gewünscht: ${payload.demoRequested}`,
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
