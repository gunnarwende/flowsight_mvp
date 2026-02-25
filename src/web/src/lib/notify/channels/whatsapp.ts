import "server-only";

/**
 * Send a WhatsApp message via Twilio REST API.
 * Zero dependencies — uses native fetch + Basic auth.
 *
 * Env vars (all set in Vercel):
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_WHATSAPP_FROM  (e.g. "whatsapp:+14155238886")
 * - FOUNDER_WHATSAPP_TO   (e.g. "whatsapp:+41791234567")
 * - FOUNDER_WHATSAPP_ENABLED ("true" to send, anything else = skip)
 *
 * Never throws — returns result with sent:false on any error.
 */
export async function sendWhatsApp(
  message: string,
): Promise<{ sent: boolean; messageSid?: string; reason?: string }> {
  const enabled = process.env.FOUNDER_WHATSAPP_ENABLED;
  if (enabled !== "true") {
    return { sent: false, reason: "disabled" };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.FOUNDER_WHATSAPP_TO;

  if (!accountSid || !authToken || !from || !to) {
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
      body: new URLSearchParams({ From: from, To: to, Body: message }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { sent: false, reason: `twilio_${res.status}`, messageSid: text.slice(0, 100) };
    }

    const data = (await res.json()) as { sid?: string };
    return { sent: true, messageSid: data.sid };
  } catch {
    return { sent: false, reason: "fetch_exception" };
  }
}
