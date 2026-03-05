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

function extractDialedNumber(request: NextRequest): string | null {
  const url = new URL(request.url);
  // Twilio sends the dialed SIP URI as "To" parameter
  const to = url.searchParams.get("To") || "";
  // Extract number from sip:+41445520919@flowsight-demo.sip.twilio.com
  const match = to.match(/sip:\+?(\d+)@/);
  return match ? match[1] : null;
}

function buildTwiml(target: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${CALLER_ID}">
    <Number>${target}</Number>
  </Dial>
</Response>`;
}

function routeCall(request: NextRequest): Response {
  const dialed = extractDialedNumber(request);
  const target = dialed && SALES_NUMBERS.has(dialed) ? FLOWSIGHT_SALES_RETELL : BRUNNER_RETELL;

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
