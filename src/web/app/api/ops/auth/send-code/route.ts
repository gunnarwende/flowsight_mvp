import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * Custom OTP send — bypasses Supabase's email rate limit entirely.
 *
 * Flow:
 * 1. Generate 6-digit code
 * 2. Store in otp_codes table
 * 3. Send via Resend (our email provider, no Supabase limit)
 *
 * Rate limit: 1 code per 30 seconds per email (our own, generous limit).
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "missing_email" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getServiceClient();

    // Check if user exists in Supabase auth (admin API, no rate limit)
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      const msg = linkError?.message?.toLowerCase() ?? "";
      if (msg.includes("user not found") || msg.includes("not found")) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      console.error("[send-code] generateLink error:", linkError?.message);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    // Rate limit: check last code sent for this email
    const { data: recent } = await supabase
      .from("otp_codes")
      .select("created_at")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    if (recent && recent.length > 0) {
      const lastSent = new Date(recent[0].created_at).getTime();
      const elapsed = Date.now() - lastSent;
      const waitMs = 30_000; // 30 seconds between codes
      if (elapsed < waitMs) {
        const waitSec = Math.ceil((waitMs - elapsed) / 1000);
        return NextResponse.json(
          { error: "rate_limit", wait: waitSec },
          { status: 429 },
        );
      }
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Clean up old codes for this email
    await supabase
      .from("otp_codes")
      .delete()
      .eq("email", normalizedEmail);

    // Store new code
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email: normalizedEmail,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      console.error("[send-code] insert error:", insertError.message);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    // Send code via Resend (our email service, no Supabase limit)
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("[send-code] Missing RESEND_API_KEY");
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Leitsystem <noreply@flowsight.ch>",
        to: [normalizedEmail],
        subject: `Ihr Anmeldecode: ${code}`,
        text: [
          `Ihr Anmeldecode für das Leitsystem: ${code}`,
          "",
          "Der Code ist 10 Minuten gültig.",
          "",
          "Falls Sie diese Anmeldung nicht angefordert haben, ignorieren Sie diese E-Mail.",
        ].join("\n"),
      }),
    });

    if (!emailRes.ok) {
      const body = await emailRes.text().catch(() => "");
      console.error("[send-code] Resend error:", emailRes.status, body);
      return NextResponse.json({ error: "email_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-code] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
