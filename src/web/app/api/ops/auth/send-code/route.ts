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

    // Format code with spaces for readability: "210 798"
    const codeFormatted = `${code.slice(0, 3)} ${code.slice(3)}`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Leitsystem <noreply@flowsight.ch>",
        to: [normalizedEmail],
        subject: `${codeFormatted} — Ihr Anmeldecode`,
        text: [
          `Ihr Anmeldecode: ${codeFormatted}`,
          "",
          "Geben Sie diesen Code im Leitsystem ein, um sich anzumelden.",
          "Der Code ist 10 Minuten gültig.",
          "",
          "Falls Sie diese Anmeldung nicht angefordert haben, können Sie diese E-Mail ignorieren.",
        ].join("\n"),
        html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background-color:#1a2744;padding:28px 32px;text-align:center;">
          <div style="width:44px;height:44px;border-radius:12px;background:rgba(212,168,67,0.2);border:1px solid rgba(212,168,67,0.3);display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
            <span style="color:#d4a843;font-size:20px;font-weight:700;">&#9670;</span>
          </div>
          <p style="margin:0;color:#94a3b8;font-size:13px;letter-spacing:0.5px;">ANMELDECODE</p>
        </td></tr>
        <!-- Code -->
        <tr><td style="padding:36px 32px 20px;text-align:center;">
          <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1a2744;font-family:'SF Mono',SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;padding:16px 0;border-bottom:2px solid #e2e8f0;">
            ${codeFormatted}
          </div>
        </td></tr>
        <!-- Text -->
        <tr><td style="padding:16px 32px 32px;text-align:center;">
          <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.6;">
            Geben Sie diesen Code im Leitsystem ein.
          </p>
          <p style="margin:0;color:#94a3b8;font-size:12px;">
            Gültig für 10 Minuten.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.5;">
            Falls Sie diese Anmeldung nicht angefordert haben,<br>können Sie diese E-Mail ignorieren.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
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
