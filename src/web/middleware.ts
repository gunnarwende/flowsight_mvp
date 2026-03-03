import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase Auth Middleware — refreshes session on every request.
 *
 * Without this middleware, server components cannot reliably read auth state
 * because cookie writes fail in read-only Server Component context.
 * The middleware has full read/write access to cookies, ensuring the session
 * tokens stay fresh.
 *
 * Fix for N32: Mobile login failed because the session was never synced
 * from browser cookies to server-readable cookies after verifyOtp().
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Set cookies on the request (for downstream server components)
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        // Recreate response to carry updated request cookies forward
        supabaseResponse = NextResponse.next({ request });
        // Set cookies on the response (for the browser)
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session — this writes updated tokens to cookies
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all /ops routes and /auth routes (auth confirm needs cookie sync too)
    "/ops/:path*",
    "/auth/:path*",
  ],
};
