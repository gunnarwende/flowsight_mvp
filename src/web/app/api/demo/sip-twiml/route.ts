/**
 * GET/POST /api/demo/sip-twiml — Returns TwiML for SIP-originated demo calls.
 *
 * Used as Voice URL on the Twilio SIP Domain "flowsight-demo.sip.twilio.com".
 * When MicroSIP makes an outbound call, Twilio hits this URL and connects
 * the call to the Brunner Voice Agent (Lisa).
 *
 * The callerId MUST be a Twilio number we own — required for SIP/Client calls.
 */

const CALLER_ID = "+41445053019"; // Twilio number on our account
const BRUNNER_LISA = "+41445054818"; // Brunner Haustechnik Voice Agent

const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${CALLER_ID}">
    <Number>${BRUNNER_LISA}</Number>
  </Dial>
</Response>`;

export async function GET() {
  return new Response(twiml, {
    headers: { "Content-Type": "application/xml" },
  });
}

export async function POST() {
  return new Response(twiml, {
    headers: { "Content-Type": "application/xml" },
  });
}
