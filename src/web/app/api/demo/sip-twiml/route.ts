/**
 * GET/POST /api/demo/sip-twiml — Returns TwiML for SIP-originated demo calls.
 *
 * Used as Voice URL on the Twilio SIP Domain "flowsight-demo.sip.twilio.com".
 * MicroSIP → SIP Domain → this route → TwiML → Dial Brunner Retell agent.
 *
 * callerId = TWILIO_NUMBER (voice-safe, verified on our account).
 * Number   = BRUNNER_RETELL (Retell phone number assigned to Brunner Lisa).
 *
 * These are two DIFFERENT numbers:
 * - +41445053019 = Twilio number (callerId, also Dörfler entry point — NOT Brunner)
 * - +41445054818 = Retell number (Brunner Haustechnik Lisa DE agent)
 *
 * SMS target override is handled in the webhook via DEMO_SIP_CALLER_ID.
 */

const CALLER_ID = "+41445053019"; // Twilio number on our account (voice-safe)
const BRUNNER_RETELL = "+41445054818"; // Brunner Haustechnik Voice Agent (Retell)

const TWIML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${CALLER_ID}">
    <Number>${BRUNNER_RETELL}</Number>
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
