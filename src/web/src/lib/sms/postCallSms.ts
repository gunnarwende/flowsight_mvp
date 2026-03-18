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

  // ≤ 160 chars: compact but professional. Correction link is the key element.
  const body = `${p.smsSenderName}: Meldung ${p.category} erfasst. Daten prüfen & Fotos ergänzen:\n${correctionUrl}`;

  return sendSms(p.callerPhone, body, p.smsSenderName);
}
