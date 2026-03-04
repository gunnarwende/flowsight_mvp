/**
 * GET/POST /api/demo/sip-twiml — Returns TwiML for SIP-originated demo calls.
 *
 * Used as Voice URL on the Twilio SIP Domain "flowsight-demo.sip.twilio.com".
 * MicroSIP → SIP Domain → this route → TwiML → Dial Twilio number →
 * Twilio number's own voice config routes to Retell.
 *
 * callerId = TWILIO_NUMBER (voice-safe, verified, always valid).
 * Number   = TWILIO_NUMBER (routes through Twilio number config → Retell).
 *
 * SMS target override is handled in the webhook via DEMO_SIP_CALLER_ID,
 * NOT here. This route never uses DEMO_SIP_CALLER_ID.
 */

const TWILIO_NUMBER = "+41445053019"; // Verified Twilio number (website number)

const TWIML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${TWILIO_NUMBER}">
    <Number>${TWILIO_NUMBER}</Number>
  </Dial>
</Response>`;

export async function GET() {
  return new Response(TWIML, {
    headers: { "Content-Type": "application/xml" },
  });
}

export async function POST() {
  return new Response(TWIML, {
    headers: { "Content-Type": "application/xml" },
  });
}
