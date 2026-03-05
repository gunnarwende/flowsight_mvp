import { NextRequest } from "next/server";

/**
 * GET/POST /api/demo/sip-twiml — Returns TwiML for SIP-originated demo calls.
 *
 * Used as Voice URL on the Twilio SIP Domain "flowsight-demo.sip.twilio.com".
 * MicroSIP → SIP Domain → this route → TwiML → Dial target Retell agent.
 *
 * Routes based on dialed number (SIP To header):
 * - +41445054818 or +41447203142 (Brunner numbers) → Brunner Retell agent
 * - +41445520919 or +41445053019 (FlowSight numbers) → FlowSight Sales Retell agent
 * - Default → Brunner (demo fallback)
 *
 * callerId = TWILIO_NUMBER (voice-safe, verified on our account).
 */

const CALLER_ID = "+41445053019";
const BRUNNER_RETELL = "+41445054818";

// FlowSight Sales agent is registered in Retell on +41445053019.
// SIP calls route via Retell SIP endpoint directly.
const FLOWSIGHT_SALES_RETELL = "+41445053019";

// Numbers that should route to FlowSight Sales (Lisa von FlowSight)
const SALES_NUMBERS = new Set(["+41445520919", "+41445053019", "41445520919", "41445053019"]);

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
  const target = dialed && SALES_NUMBERS.has(dialed) ? FLOWSIGHT_SALES_RETELL : BRUNNER_RETELL;

  console.log(JSON.stringify({ _tag: "sip_twiml", to, dialed, target }));

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
