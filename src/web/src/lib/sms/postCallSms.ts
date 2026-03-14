import "server-only";

import { sendSms, type SendSmsResult } from "./sendSms";
import { generateShortVerifyToken } from "./verifySmsToken";

export interface PostCallSmsPayload {
  caseId: string;
  createdAt: string;
  seqNumber: number;
  caseIdPrefix: string;
  callerPhone: string;
  smsSenderName: string;
  plz: string;
  city: string;
  category: string;
  street?: string;
  houseNumber?: string;
  reporterName?: string;
}

/**
 * Build and send the post-call confirmation SMS with correction link.
 * Shows captured data so the reporter can verify — reduces callbacks.
 * Never throws — returns SendSmsResult.
 */
export async function sendPostCallSms(
  p: PostCallSmsPayload,
): Promise<SendSmsResult> {
  const baseUrl =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://flowsight.ch";

  const shortToken = generateShortVerifyToken(p.caseId, p.createdAt);
  const caseRef = `${p.caseIdPrefix}-${p.seqNumber}`;
  const correctionUrl = `${baseUrl}/v/${caseRef}?t=${shortToken}`;

  const hasStreet = p.street && p.street.length > 0;

  const addressLine = hasStreet
    ? `${p.street}${p.houseNumber ? ` ${p.houseNumber}` : ""}, ${p.plz} ${p.city}`
    : `${p.plz} ${p.city}`;

  const lines: string[] = [
    `${p.smsSenderName}: Ihre Meldung (${p.category}) wurde aufgenommen.`,
    ``,
  ];

  if (p.reporterName) {
    lines.push(`Name: ${p.reporterName}`);
  }
  lines.push(`Adresse: ${addressLine}`);
  lines.push(``);

  if (!hasStreet || !p.reporterName) {
    lines.push(`Bitte prüfen und ggf. ergänzen:`);
  } else {
    lines.push(`Stimmt alles? Fotos helfen uns:`);
  }
  lines.push(correctionUrl);
  lines.push(``);
  lines.push(`Ihr Service-Team meldet sich schnellstmöglich.`);

  return sendSms(p.callerPhone, lines.join("\n"), p.smsSenderName);
}
