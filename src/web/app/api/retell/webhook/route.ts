import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Retell } from "retell-sdk";

type RetellCall = {
  call_id?: string;
};

type RetellWebhookPayload = {
  event?: string;
  call?: RetellCall;
};

function keysOf(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.keys(value as Record<string, unknown>);
}

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

  try {
    const verified = await Retell.verify(rawBody, apiKey, signature);
    if (!verified) {
      Sentry.captureMessage("Invalid Retell webhook signature", "warning");
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "signature_verification_error" }, { status: 401 });
  }

  let payload: RetellWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RetellWebhookPayload;
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Evidence-only (no PII): log shape (keys only)
  Sentry.addBreadcrumb({
    category: "retell.webhook",
    level: "info",
    message: "payload_keys",
    data: {
      topKeys: keysOf(payload),
      callKeys: keysOf(payload.call),
    },
  });

  const retellCallId = payload.call?.call_id;
  if (retellCallId) Sentry.setTag("retell_call_id", retellCallId);

  // Next steps (W2C): tenant resolve + event->case mapping + email attempt
  return new NextResponse(null, { status: 204 });
}
