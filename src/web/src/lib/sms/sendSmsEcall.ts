import "server-only";

import type { SendSmsResult } from "./sendSms";
import { normalizeSwissPhone } from "../phone/normalizeSwissPhone";

/**
 * Send an SMS via eCall.ch REST API (Swiss SMS gateway).
 * Routes through Swiss carriers → no spam filter issues.
 *
 * Env vars:
 * - ECALL_API_URL (e.g. https://rest.ecall.ch/api/message)
 * - ECALL_API_USERNAME
 * - ECALL_API_PASSWORD
 * - ECALL_SENDER_NUMBER (required) — FlowSight service number (E.164), always used as sender
 *
 * Sender: Two-tier strategy for best deliverability:
 * 1. Alphanumeric sender (tenant brand name, e.g. "Weinberger") — preferred,
 *    higher trust, less spam filtering. Max 11 chars.
 * 2. Numeric fallback (ECALL_SENDER_NUMBER) — if alphanumeric is empty or too long.
 *
 * Phone format: eCall expects international format with 00 prefix (e.g. 0041791234567).
 * We accept E.164 (+41...), local (076...), and 0041... and convert automatically.
 *
 * Never throws — returns result with sent:false on any error.
 */

/** Convert any Swiss phone number to eCall format (0041791234567). */
function toEcallNumber(input: string): string {
  // Normalize to E.164 first (handles 076... → +41...), then convert +→00
  const normalized = normalizeSwissPhone(input);
  if (normalized) {
    return "00" + normalized.slice(1); // +41... → 0041...
  }
  // Fallback: original conversion for already-formatted numbers
  if (input.startsWith("+")) {
    return "00" + input.slice(1);
  }
  return input;
}

export async function sendSmsEcall(
  to: string,
  body: string,
  from: string,
): Promise<SendSmsResult> {
  const apiUrl = process.env.ECALL_API_URL;
  const username = process.env.ECALL_API_USERNAME;
  const password = process.env.ECALL_API_PASSWORD;
  const senderNumber = process.env.ECALL_SENDER_NUMBER;

  if (!apiUrl || !username || !password) {
    return { sent: false, reason: "ecall_missing_env" };
  }

  if (!senderNumber) {
    return { sent: false, reason: "ecall_missing_sender_number" };
  }

  // Alphanumeric sender (tenant brand name, max 11 chars) preferred — shows
  // business name as sender (e.g. "Doerfler AG"). Verified with eCall support
  // (02.04.2026) that deliverability is equal when sender is whitelisted.
  // Numeric fallback (ECALL_SENDER_NUMBER) only if alphanumeric is invalid.
  const isAlphanumericValid = from && from.length > 0 && from.length <= 11 && !/^\+?\d+$/.test(from);
  const sender = isAlphanumericValid ? from : toEcallNumber(senderNumber);

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
        from: sender,
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
