import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * Custom OTP verification — creates a Supabase session after verifying our own code.
 *
 * Flow:
 * 1. Check code against otp_codes table
 * 2. If valid: use admin.generateLink to get a session token
 * 3. Return the hashed_token so the client can create a session via verifyOtp
 */
export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getServiceClient();

    // Look up valid code
    const { data: otpRecords } = await supabase
      .from("otp_codes")
      .select("id, code, expires_at, used")
      .eq("email", normalizedEmail)
      .eq("code", code)
      .eq("used", false)
      .limit(1);

    if (!otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        { error: "invalid_code" },
        { status: 401 },
      );
    }

    const record = otpRecords[0];

    // Check expiry
    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "expired_code" },
        { status: 401 },
      );
    }

    // Mark code as used
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", record.id);

    // Generate a magic link via admin API (no rate limit)
    // This gives us a hashed_token that the client can use to create a session
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[verify-code] generateLink error:", linkError?.message);
      return NextResponse.json({ error: "session_error" }, { status: 500 });
    }

    // Return the token hash — client uses verifyOtp to create session
    return NextResponse.json({
      ok: true,
      token_hash: linkData.properties.hashed_token,
    });
  } catch (err) {
    console.error("[verify-code] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
