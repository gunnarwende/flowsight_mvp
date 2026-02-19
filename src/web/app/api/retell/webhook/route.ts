import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Retell } from "retell-sdk";

// Webhook security (Retell spec):
// - Header: x-retell-signature
// - Secret: RETELL_API_KEY (webhook-badged key in Retell dashboard)
// We verify using the raw request body text (avoid JSON re-serialization mismatches).

type RetellWebhookPayload = {
  event?: string;
  call?: {
    call_id?: string;
  };
};

export async function POST(req: Request) {
  Sentry.setTag("area", "voice");
  Sentry.setTag("provider", "retell");
  Sentry.setTag("endpoint", "/api/retell/webhook");

  const signature = req.headers.get("x-retell-signature");
  if (!signature) {
    Sentry.captureMessage("Retell webhook missing x-retell-signature header", "warning");
    return NextResponse.json({ error: "missing_signature_header" }, { status: 401 });
  }

  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) {
    Sentry.captureMessage("RETELL_API_KEY missing on server", "error");
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const rawBody = await req.text();

  let verified: boolean;
  try {
    verified = await Retell.verify(rawBody, apiKey, signature);
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "signature_verification_error" }, { status: 401 });
  }

  if (!verified) {
    Sentry.captureMessage("Invalid Retell webhook signature", "warning");
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  // Parse payload only after verification
  let payload: RetellWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RetellWebhookPayload;
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const retellCallId = payload.call?.call_id;
  if (retellCallId) Sentry.setTag("retell_call_id", retellCallId);

  // Acknowledge fast. Next: tenant resolve + event->case mapping.
  return new NextResponse(null, { status: 204 });
}
