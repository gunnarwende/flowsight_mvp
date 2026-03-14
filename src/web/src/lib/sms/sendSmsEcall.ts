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
 * - ECALL_SENDER_NUMBER (optional) — fallback E.164 number if alphanumeric sender is rejected
 *
 * Sender logic:
 * - First tries the alphanumeric sender (e.g. "Weinberger")
 * - If rejected (400 invalid sender): retries with ECALL_SENDER_NUMBER
 * - Alphanumeric senders must be pre-approved in eCall portal
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

async function callEcallApi(
  apiUrl: string,
  auth: string,
  to: string,
  body: string,
  from: string,
): Promise<{ ok: boolean; status: number; text: string; messageId?: string }> {
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
    return { ok: false, status: res.status, text };
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const messageId = (data.id ?? data.messageId ?? data.message_id ?? "") as string;
  return { ok: true, status: res.status, text: "", messageId };
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

    // Try with requested sender (alphanumeric or number)
    const result = await callEcallApi(apiUrl, auth, to, body, from);

    if (result.ok) {
      return { sent: true, messageSid: result.messageId || "ecall_ok" };
    }

    // If alphanumeric sender was rejected (400), retry with fallback number
    const fallbackNumber = process.env.ECALL_SENDER_NUMBER;
    if (result.status === 400 && fallbackNumber && from !== fallbackNumber) {
      const fallbackResult = await callEcallApi(
        apiUrl, auth, to, body, toEcallNumber(fallbackNumber),
      );

      if (fallbackResult.ok) {
        return { sent: true, messageSid: fallbackResult.messageId || "ecall_ok_fallback" };
      }

      return { sent: false, reason: `ecall_fallback_${fallbackResult.status}`, messageSid: fallbackResult.text.slice(0, 300) };
    }

    return { sent: false, reason: `ecall_${result.status}`, messageSid: result.text.slice(0, 300) };
  } catch {
    return { sent: false, reason: "ecall_fetch_exception" };
  }
}
