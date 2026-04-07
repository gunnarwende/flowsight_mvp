/**
 * Shared email helper for CLI scripts.
 * Calls Resend HTTP API directly (no Next.js dependency).
 *
 * Usage:
 *   import { sendEmail } from "./_lib/send_email.mjs";
 *   const result = await sendEmail({ to, subject, html, text });
 */

const RESEND_API = "https://api.resend.com/emails";

/**
 * @param {{ to: string, subject: string, html: string, text?: string, fromName?: string, replyTo?: string }} opts
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export async function sendEmail({ to, subject, html, text, fromName, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not set" };
  }

  const addr = process.env.MAIL_FROM || "noreply@send.flowsight.ch";
  const from = fromName ? `${fromName} <${addr}>` : addr;

  try {
    const body = { from, to, subject, html };
    if (text) body.text = text;
    if (replyTo) body.reply_to = replyTo;

    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${err}` };
    }

    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
