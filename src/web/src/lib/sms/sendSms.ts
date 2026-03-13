import "server-only";

import { sendSmsEcall } from "./sendSmsEcall";

/**
 * Send an SMS — routes to the best available provider:
 *   1. eCall.ch (Swiss gateway, no spam) — if ECALL_API_* env vars are set
 *   2. Twilio (international) — fallback
 *
 * Env vars (eCall — preferred):
 * - ECALL_API_URL, ECALL_API_USERNAME, ECALL_API_PASSWORD
 *
 * Env vars (Twilio — fallback):
 * - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
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

/** Twilio alphanumeric sender: 3-11 chars, [A-Za-z0-9 ], min 1 letter. */
function isValidAlphaSender(from: string): boolean {
  return /^[A-Za-z0-9 ]{3,11}$/.test(from) && /[A-Za-z]/.test(from);
}

/** E.164 phone number: +{country}{number}, 8-15 digits total. */
function isE164(from: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(from);
}

/** Check if eCall env vars are configured. */
function isEcallConfigured(): boolean {
  return !!(
    process.env.ECALL_API_URL &&
    process.env.ECALL_API_USERNAME &&
    process.env.ECALL_API_PASSWORD
  );
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

  // Route 1: eCall (Swiss gateway — preferred)
  if (isEcallConfigured()) {
    return sendSmsEcall(to, body, from);
  }

  // Route 2: Twilio (fallback)
  return sendSmsTwilio(to, body, from);
}

/** Send SMS via Twilio REST API. */
async function sendSmsTwilio(
  to: string,
  body: string,
  from: string,
): Promise<SendSmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return { sent: false, reason: "missing_env" };
  }

  if (!isE164(from) && !isValidAlphaSender(from)) {
    return { sent: false, reason: `invalid_sender: "${from}"` };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: body }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { sent: false, reason: `twilio_${res.status}`, messageSid: text.slice(0, 200) };
    }

    const data = (await res.json()) as { sid?: string };
    return { sent: true, messageSid: data.sid };
  } catch {
    return { sent: false, reason: "fetch_exception" };
  }
}
