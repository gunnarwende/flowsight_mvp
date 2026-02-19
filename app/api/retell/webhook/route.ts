import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// NOTE: Signature verification is intentionally NOT implemented yet.
// We will implement exact verification after confirming whether Retell uses RETELL_API_KEY (webhook-badged) per official docs,
// or whether we must use RETELL_WEBHOOK_SECRET (requires Retell-side transport spec).
export async function POST(req: Request) {
  const signature = req.headers.get("x-retell-signature"); // header name only (no values logged)

  Sentry.setTag("area", "voice");
  Sentry.setTag("provider", "retell");
  Sentry.setTag("endpoint", "/api/retell/webhook");

  if (!signature) {
    // Missing expected header. Do not accept.
    Sentry.captureMessage("Retell webhook missing x-retell-signature header", "warning");
    return NextResponse.json({ error: "missing_signature_header" }, { status: 401 });
  }

  // STOP-GATE: Do not process payload until verification spec is confirmed and implemented.
  // This avoids accepting spoofed requests.
  return NextResponse.json(
    { error: "verification_not_implemented", next: "confirm RETELL_API_KEY vs RETELL_WEBHOOK_SECRET" },
    { status: 501 }
  );
}
