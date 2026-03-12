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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Trial expiry hard gate ──────────────────────────────────────────
  // Prospects whose trial has ended cannot access /ops (except /ops/expired).
  if (user && request.nextUrl.pathname.startsWith("/ops")) {
    const meta = user.app_metadata ?? {};
    const role = meta.role as string | undefined;
    const tenantId = meta.tenant_id as string | undefined;

    if (role === "prospect" && tenantId) {
      // Skip if already heading to /ops/expired
      if (!request.nextUrl.pathname.startsWith("/ops/expired")) {
        const svcUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (svcUrl && svcKey) {
          try {
            const res = await fetch(
              `${svcUrl}/rest/v1/tenants?select=trial_end,trial_status&id=eq.${tenantId}&limit=1`,
              {
                headers: {
                  apikey: svcKey,
                  Authorization: `Bearer ${svcKey}`,
                },
                signal: AbortSignal.timeout(3000),
              }
            );
            if (res.ok) {
              const rows = await res.json();
              const tenant = rows?.[0];
              if (
                tenant?.trial_end &&
                new Date(tenant.trial_end).getTime() < Date.now() &&
                tenant.trial_status !== "live"
              ) {
                const expiredUrl = new URL("/ops/expired", request.url);
                return NextResponse.redirect(expiredUrl);
              }
            }
          } catch {
            // On fetch error, allow access (fail-open) — Morning Report catches stale trials
          }
        }
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all /ops routes and /auth routes (auth confirm needs cookie sync too)
    "/ops/:path*",
    "/auth/:path*",
  ],
};
