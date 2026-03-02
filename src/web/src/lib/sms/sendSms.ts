import "server-only";

/**
 * Send an SMS via Twilio REST API.
 * Zero dependencies — uses native fetch + Basic auth.
 * Follows the same pattern as whatsapp.ts.
 *
 * Env vars:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
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
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return { sent: false, reason: "missing_env" };
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
