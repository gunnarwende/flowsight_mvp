import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * Custom OTP verification — creates a Supabase session server-side.
 *
 * Flow:
 * 1. Check code against otp_codes table
 * 2. If valid: use admin.generateLink to get a magic link token
 * 3. Verify the token via a response-bound auth client (cookies on response)
 * 4. Return response with session cookies — client just redirects to dashboard
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
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[verify-code] generateLink error:", linkError?.message);
      return NextResponse.json({ error: "session_error" }, { status: 500 });
    }

    // ── Create response-bound auth client ─────────────────────────────
    // Must write cookies directly to the response object (not via
    // next/headers cookies() which doesn't reliably carry over).
    const response = NextResponse.json({ ok: true });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({ error: "session_error" }, { status: 500 });
    }

    const authClient = createServerClient(url, key, {
      cookies: {
        getAll() {
          // Return empty — we're creating a fresh session, stale cookies
          // from a previous login would cause verifyOtp to fail.
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // Verify the token — this creates the session and triggers setAll
    const { error: verifyError } = await authClient.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

    if (verifyError) {
      console.error("[verify-code] verifyOtp error:", verifyError.message);
      return NextResponse.json({ error: "session_error" }, { status: 500 });
    }

    // Response carries session cookies — client just redirects to dashboard.
    return response;
  } catch (err) {
    console.error("[verify-code] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
