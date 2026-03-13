import "server-only";

import type { SendSmsResult } from "./sendSms";

/**
 * Send an SMS via eCall.ch REST API (Swiss SMS gateway).
 * Routes through Swiss carriers → no spam filter issues.
 *
 * Env vars:
 * - ECALL_API_URL (e.g. https://rest.ecall.ch/api/message)
 * - ECALL_API_USERNAME
 * - ECALL_API_PASSWORD
 *
 * Phone format: eCall expects international format with 00 prefix (e.g. 0041791234567).
 * We accept E.164 (+41...) and convert automatically.
 *
 * Never throws — returns result with sent:false on any error.
 */

/** Convert E.164 (+41791234567) to eCall format (0041791234567). */
function toEcallNumber(e164: string): string {
  if (e164.startsWith("+")) {
    return "00" + e164.slice(1);
  }
  return e164;
}

export async function sendSmsEcall(
  to: string,
  body: string,
  from: string,
): Promise<SendSmsResult> {
  const apiUrl = process.env.ECALL_API_URL;
  const username = process.env.ECALL_API_USERNAME;
  const password = process.env.ECALL_API_PASSWORD;

  if (!apiUrl || !username || !password) {
    return { sent: false, reason: "ecall_missing_env" };
  }

  try {
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: "sms",
        from,
        to: toEcallNumber(to),
        content: {
          type: "Text",
          text: body,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { sent: false, reason: `ecall_${res.status}`, messageSid: text.slice(0, 300) };
    }

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const messageId = (data.id ?? data.messageId ?? data.message_id ?? "") as string;
    return { sent: true, messageSid: messageId || "ecall_ok" };
  } catch {
    return { sent: false, reason: "ecall_fetch_exception" };
  }
}
