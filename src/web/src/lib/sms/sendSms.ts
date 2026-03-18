import "server-only";

import * as Sentry from "@sentry/nextjs";
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
 * 160-char guard: eCall charges double for >160 chars (2 SMS segments).
 * Does NOT reject — sends anyway but logs a Sentry warning for dev visibility.
 *
 * Never throws — returns result with sent:false on any error.
 * No console.log — caller owns the log line.
 */

/** eCall single-SMS limit. >160 = 2 segments = double cost. */
const SMS_CHAR_LIMIT = 160;

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
  // 160-char guard: warn on overshoot (don't reject — SMS must still go out)
  if (body.length > SMS_CHAR_LIMIT) {
    Sentry.captureMessage(`SMS exceeds ${SMS_CHAR_LIMIT} chars (${body.length})`, {
      level: "warning",
      tags: { area: "sms", provider: "ecall" },
      extra: { char_count: body.length, from, body_preview: body.slice(0, 80) },
    });
  }

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
