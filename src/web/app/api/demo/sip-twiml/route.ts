/**
 * GET/POST /api/demo/sip-twiml — Returns TwiML for SIP-originated demo calls.
 *
 * Used as Voice URL on the Twilio SIP Domain "flowsight-demo.sip.twilio.com".
 * When MicroSIP makes an outbound call, Twilio hits this URL and connects
 * the call to the Brunner Voice Agent (Lisa).
 *
 * callerId controls what Retell sees as from_number → where the post-call SMS goes.
 * - DEMO_SIP_CALLER_ID (env): Founder's personal number → SMS lands on demo phone.
 *   Must be verified as Twilio Outgoing Caller ID.
 * - Fallback: Twilio number on our account (no SMS on personal phone).
 *
 * Twilio Error 13214 = callerId missing or invalid. Guard: E.164 validation + fallback.
 */

const BRUNNER_LISA = "+41445054818"; // Brunner Haustechnik Voice Agent (Retell)
const TWILIO_FALLBACK = "+41445053019"; // Twilio number on our account (always valid)

const E164_RE = /^\+[1-9]\d{6,14}$/;

function resolveCallerId(): string {
  const raw = (process.env.DEMO_SIP_CALLER_ID ?? "").trim();
  if (raw.length > 0 && E164_RE.test(raw)) return raw;
  return TWILIO_FALLBACK;
}

export async function GET() {
  const callerId = resolveCallerId();
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${callerId}">
    <Number>${BRUNNER_LISA}</Number>
  </Dial>
</Response>`;
  return new Response(twiml, {
    headers: { "Content-Type": "application/xml" },
  });
}

export async function POST() {
  const callerId = resolveCallerId();
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${callerId}">
    <Number>${BRUNNER_LISA}</Number>
  </Dial>
</Response>`;
  return new Response(twiml, {
    headers: { "Content-Type": "application/xml" },
  });
}
