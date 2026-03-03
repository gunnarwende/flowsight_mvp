import "server-only";

import { sendSms, type SendSmsResult } from "./sendSms";
import { generateShortVerifyToken } from "./verifySmsToken";

export interface PostCallSmsPayload {
  caseId: string;
  createdAt: string;
  callerPhone: string;
  smsSenderName: string;
  plz: string;
  city: string;
  category: string;
  street?: string;
  houseNumber?: string;
}

/**
 * Build and send the post-call confirmation SMS with correction link.
 * Never throws — returns SendSmsResult.
 */
export async function sendPostCallSms(
  p: PostCallSmsPayload,
): Promise<SendSmsResult> {
  const baseUrl =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://flowsight-mvp.vercel.app";

  const shortToken = generateShortVerifyToken(p.caseId, p.createdAt);
  const correctionUrl = `${baseUrl}/v/${p.caseId}?t=${shortToken}`;

  const hasStreet = p.street && p.street.length > 0;

  const addressBlock = hasStreet
    ? `Erfasste Adresse:\n${p.street}${p.houseNumber ? ` ${p.houseNumber}` : ""}, ${p.plz} ${p.city}`
    : `Erfasster Ort: ${p.plz} ${p.city}`;

  const correctionCta = hasStreet
    ? `Stimmt alles? Haben Sie Fotos vom Schaden?`
    : `Bitte ergaenzen Sie Ihre Adresse. Fotos vom Schaden helfen uns:`;

  const body = [
    `${p.smsSenderName}: Ihre Meldung (${p.category}) wurde aufgenommen.`,
    ``,
    addressBlock,
    ``,
    correctionCta,
    correctionUrl,
    ``,
    `Ihr Service-Team meldet sich schnellstmoeglich.`,
  ].join("\n");

  return sendSms(p.callerPhone, body, p.smsSenderName);
}
