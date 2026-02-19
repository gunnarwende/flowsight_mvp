import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Retell } from "retell-sdk";

// Webhook security (Retell spec):
// - Header: x-retell-signature
// - Secret: RETELL_API_KEY (must be the key with "webhook" badge in Retell dashboard)
// NOTE: We use raw body text for verification to avoid JSON re-serialization mismatches.

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
    // Config error (server-side). Do not accept.
    Sentry.captureMessage("RETELL_API_KEY missing on server", "error");
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const rawBody = await req.text();

  let verified = false;
  try {
    verified = Retell.verify(rawBody, apiKey, signature);
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "signature_verification_error" }, { status: 401 });
  }

  if (!verified) {
    Sentry.captureMessage("Invalid Retell webhook signature", "warning");
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  // Parse payload after verification
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const eventType = payload?.event;
  const call = payload?.call;

  const retellCallId = call?.call_id;
  if (retellCallId) Sentry.setTag("retell_call_id", String(retellCallId));

  // For now: acknowledge fast (Retell retries if not 2xx within 10s).
  // Next steps (W2C-3/4): tenant resolve + event->case mapping + email attempt.
  return new NextResponse(null, { status: 204 });
}
