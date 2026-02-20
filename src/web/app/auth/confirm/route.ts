import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth callback: handles Magic Link token exchange.
 * Supabase sends users here after clicking the email link.
 * Supports both token_hash (OTP) and code (PKCE) flows.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/ops/cases";

  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.redirect(
      new URL("/ops/login?error=config", request.url)
    );
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  let success = false;

  if (token_hash && type) {
    // OTP / Magic Link flow
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "magiclink" | "email",
    });
    success = !error;
  } else if (code) {
    // PKCE flow
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    success = !error;
  }

  if (success) {
    return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(
    new URL("/ops/login?error=invalid_link", request.url)
  );
}
