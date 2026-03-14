import { NextRequest } from "next/server";

/**
 * GET/POST /api/demo/sip-twiml — Returns TwiML for SIP-originated demo calls.
 *
 * Used as Voice URL on the Twilio SIP Domain "flowsight-demo.sip.twilio.com".
 * MicroSIP → SIP Domain → this route → TwiML → Dial target number.
 *
 * Routes based on dialed number (SIP To header):
 * - Matches a known Retell number → dials that number (Retell picks up)
 * - Unknown → returns error TwiML
 *
 * callerId = CALLER_ID (our Twilio number, verified on our account).
 */

const CALLER_ID = "+41445053019";

/**
 * All known Retell phone numbers. MicroSIP dials any of these,
 * TwiML forwards to that exact number → Retell picks up with the right agent.
 */
const KNOWN_NUMBERS: Record<string, string> = {
  // Weinberger AG
  "41435051101": "+41435051101",
  // Brunner Haustechnik
  "41445054818": "+41445054818",
  // Dörfler AG
  "41445057420": "+41445057420",
  // FlowSight Sales
  "41445053019": "+41445053019",
  // Legacy aliases (displayed format without leading 0)
  "41445520919": "+41445053019",
};

function extractDialedNumber(to: string): string | null {
  // "To" value is either a SIP URI (sip:+41445520919@…) or an E.164 number
  const sipMatch = to.match(/sip:\+?(\d+)@/);
  if (sipMatch) return sipMatch[1];
  const numMatch = to.match(/\+?(\d+)/);
  return numMatch ? numMatch[1] : null;
}

function buildTwiml(target: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${CALLER_ID}">
    <Number>${target}</Number>
  </Dial>
</Response>`;
}

function buildErrorTwiml(dialed: string | null): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="de-DE">Diese Nummer ist nicht konfiguriert. Bitte prüfen Sie die gewählte Nummer.</Say>
  <Hangup/>
</Response>`;
}

async function routeCall(request: NextRequest): Promise<Response> {
  // Twilio sends params as URL query (GET) or form body (POST)
  let to = new URL(request.url).searchParams.get("To") || "";
  if (!to) {
    try {
      const form = await request.formData();
      to = (form.get("To") as string) || "";
    } catch {
      // no body — fall through to default
    }
  }

  const dialed = extractDialedNumber(to);
  const target = dialed ? KNOWN_NUMBERS[dialed] : null;

  console.log(JSON.stringify({ _tag: "sip_twiml", to, dialed, target: target ?? "UNKNOWN" }));

  if (!target) {
    return new Response(buildErrorTwiml(dialed), {
      headers: { "Content-Type": "application/xml" },
    });
  }

  return new Response(buildTwiml(target), {
    headers: { "Content-Type": "application/xml" },
  });
}

export async function GET(request: NextRequest) {
  return routeCall(request);
}

export async function POST(request: NextRequest) {
  return routeCall(request);
}
