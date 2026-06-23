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
  /** Swiss-Post-Adressstatus (V9). Nur "unconfirmed" verschärft die SMS (gezielter Prüf-Satz). */
  addressStatus?: string | null;
}

/**
 * Build and send the post-call confirmation SMS with correction link.
 * Shows captured data so the reporter can verify — reduces callbacks.
 * Never throws — returns SendSmsResult.
 */
export async function sendPostCallSms(
  p: PostCallSmsPayload,
): Promise<SendSmsResult> {
  const { APP_BASE_URL } = await import("@/src/lib/config/appUrl");
  const baseUrl = APP_BASE_URL;

  const shortToken = generateShortVerifyToken(p.caseId, p.createdAt);
  const caseRef = `${p.caseIdPrefix}-${p.seqNumber}`;
  const correctionUrl = `${baseUrl}/v/${caseRef}?t=${shortToken}`;

  // Ampel-gesteuerter Ton (V9, Founder): NUR wenn die Adresse nicht bestätigt werden
  // konnte ("unconfirmed") kommt der gezielte Prüf-Satz — service-gerahmt ("damit der
  // Techniker Sie sicher findet"), nicht als pauschaler Phishing-Alarm. Sonst neutral.
  // URL auf flowsight.ch (Branded-Domain), kurz, hilfreich.
  const addressFlagged = p.addressStatus === "unconfirmed";
  const body = addressFlagged
    ? `${p.smsSenderName}: Ihre Meldung wurde aufgenommen. Bitte prüfen Sie unbedingt Ihre Adresse, damit der Techniker Sie sicher findet:\n${correctionUrl}`
    : `${p.smsSenderName}: Ihre Meldung wurde aufgenommen. Hier können Sie Angaben ergänzen oder Fotos anfügen:\n${correctionUrl}`;

  return sendSms(p.callerPhone, body, p.smsSenderName);
}
