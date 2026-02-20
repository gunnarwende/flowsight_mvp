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

/** Structured log line for Vercel Function Logs (no PII). */
function logEmail(fields: Record<string, unknown>) {
  console.log(JSON.stringify({ _tag: "email", provider: "resend", ...fields }));
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
}

/**
 * Send a case-created notification email.
 * Non-blocking: errors are captured to Sentry but never thrown.
 */
export async function sendCaseNotification(
  payload: CaseEmailPayload
): Promise<boolean> {
  const from = process.env.MAIL_FROM ?? "noreply@flowsight.ch";
  const to = process.env.MAIL_REPLY_TO;
  const subjectPrefix = process.env.MAIL_SUBJECT_PREFIX ?? "[FlowSight]";

  if (!process.env.RESEND_API_KEY) {
    logEmail({ decision: "skipped", reason: "no_RESEND_API_KEY", case_id: payload.caseId, tenant_id: payload.tenantId, source: payload.source });
    return false;
  }

  if (!to) {
    Sentry.captureMessage("MAIL_REPLY_TO not configured — skipping email", {
      level: "warning",
      tags: { area: "email", provider: "resend", source: payload.source },
    });
    logEmail({ decision: "skipped", reason: "no_MAIL_REPLY_TO", case_id: payload.caseId, tenant_id: payload.tenantId, source: payload.source });
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

    const { error } = await getResend().emails.send({
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
          area: "email",
          provider: "resend",
          source: payload.source,
          tenant_id: payload.tenantId,
          case_id: payload.caseId,
        },
      });
      logEmail({ decision: "failed", reason: "resend_api_error", case_id: payload.caseId, tenant_id: payload.tenantId, source: payload.source });
      return false;
    }

    logEmail({ decision: "sent", case_id: payload.caseId, tenant_id: payload.tenantId, source: payload.source });
    return true;
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        area: "email",
        provider: "resend",
        source: payload.source,
        tenant_id: payload.tenantId,
        case_id: payload.caseId,
      },
    });
    logEmail({ decision: "failed", reason: "exception", case_id: payload.caseId, tenant_id: payload.tenantId, source: payload.source });
    return false;
  }
}
