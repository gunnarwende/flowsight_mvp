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

  if (!to) {
    Sentry.captureMessage("MAIL_REPLY_TO not configured — skipping email", {
      level: "warning",
      tags: { area: "email", provider: "resend" },
    });
    return false;
  }

  const urgencyLabel =
    payload.urgency === "notfall"
      ? "🔴 NOTFALL"
      : payload.urgency === "dringend"
        ? "🟡 Dringend"
        : "Neuer Fall";

  try {
    const { error } = await getResend().emails.send({
      from,
      to,
      subject: `${subjectPrefix} ${urgencyLabel} – ${payload.category} (${payload.city})`,
      text: [
        `Neuer Case erstellt`,
        `──────────────────────`,
        `ID:        ${payload.caseId}`,
        `Quelle:    ${payload.source}`,
        `Kategorie: ${payload.category}`,
        `Dringend:  ${payload.urgency}`,
        `PLZ/Ort:   ${payload.plz} ${payload.city}`,
        `──────────────────────`,
        `Beschreibung:`,
        payload.description,
      ].join("\n"),
    });

    if (error) {
      Sentry.captureException(error, {
        tags: {
          area: "email",
          provider: "resend",
          tenant_id: payload.tenantId,
          case_id: payload.caseId,
        },
      });
      return false;
    }

    return true;
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        area: "email",
        provider: "resend",
        tenant_id: payload.tenantId,
        case_id: payload.caseId,
      },
    });
    return false;
  }
}
