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
}

/**
 * Send a case-created notification email.
 * Non-blocking: errors are captured to Sentry but never thrown.
 *
 * This function owns the SINGLE console.log per invocation (Vercel Hobby limit).
 * Callers (route.ts, webhook) must NOT console.log on their success path.
 */
export async function sendCaseNotification(
  payload: CaseEmailPayload
): Promise<boolean> {
  const from = process.env.MAIL_FROM ?? "noreply@flowsight.ch";
  const to = process.env.MAIL_REPLY_TO;
  const subjectPrefix = process.env.MAIL_SUBJECT_PREFIX ?? "[FlowSight]";

  // Base log fields — always present, no PII
  const base: Record<string, unknown> = {
    _tag: "resend",
    case_id: payload.caseId,
    source: payload.source,
    tenant_id: payload.tenantId,
    recipient_env: "MAIL_REPLY_TO",
    recipient_present: !!to,
  };

  if (!process.env.RESEND_API_KEY) {
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "no_RESEND_API_KEY" }));
    return false;
  }

  if (!to) {
    Sentry.captureMessage("MAIL_REPLY_TO not configured — skipping email", {
      level: "warning",
      tags: { area: "email", provider: "resend", source: payload.source },
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
          area: "email",
          provider: "resend",
          source: payload.source,
          tenant_id: payload.tenantId,
          case_id: payload.caseId,
        },
      });
      const apiErr = error as Record<string, unknown>;
      console.log(JSON.stringify({
        ...base,
        decision: "failed",
        reason: "resend_api_error",
        error_code: apiErr.name ?? null,
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
        area: "email",
        provider: "resend",
        source: payload.source,
        tenant_id: payload.tenantId,
        case_id: payload.caseId,
      },
    });
    console.log(JSON.stringify({
      ...base,
      decision: "failed",
      reason: "exception",
      error_code: err instanceof Error ? err.message : "unknown",
    }));
    return false;
  }
}
