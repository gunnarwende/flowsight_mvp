import "server-only";

import { sendSmsEcall } from "./sendSmsEcall";

/**
 * Send an SMS via eCall.ch — sole SMS provider for CH.
 * Twilio is used for Voice/SIP only, not SMS.
 *
 * Env vars (eCall):
 * - ECALL_API_URL, ECALL_API_USERNAME, ECALL_API_PASSWORD
 * - ECALL_SENDER_NUMBER (optional) — fallback if alphanumeric sender is rejected
 *
 * Shared:
 * - SMS_ALLOWED_NUMBERS (optional) — comma-separated E.164 whitelist.
 *   When set, only these numbers receive SMS. Empty/unset = send to all.
 *
 * Never throws — returns result with sent:false on any error.
 * No console.log — caller owns the log line.
 */

export interface SendSmsResult {
  sent: boolean;
  messageSid?: string;
  reason?: string;
}

export async function sendSms(
  to: string,
  body: string,
  from: string,
): Promise<SendSmsResult> {
  // Whitelist guard: when SMS_ALLOWED_NUMBERS is set, only send to listed numbers.
  const allowList = process.env.SMS_ALLOWED_NUMBERS;
  if (allowList) {
    const allowed = allowList.split(",").map((n) => n.trim());
    if (!allowed.includes(to)) {
      return { sent: false, reason: `not_in_allowlist: ${to}` };
    }
  }

  return sendSmsEcall(to, body, from);
}
