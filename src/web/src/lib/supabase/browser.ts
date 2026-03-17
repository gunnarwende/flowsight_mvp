import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client with cookie-based auth.
 * Use in Client Components for auth flows (login, session check).
 * NOT the same as getServiceClient() (server-only, bypasses RLS).
 *
 * flowType "implicit" sends token_hash in magic link emails instead of PKCE
 * code. This avoids "PKCE code verifier not found" when the magic link is
 * opened in a different browser / in-app browser (common on mobile).
 */
export function getBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient(url, key, {
    auth: { flowType: "implicit" },
    cookieOptions: {
      // Persist session across browser restarts (7 days = refresh token lifetime)
      maxAge: 7 * 24 * 60 * 60,
    },
  });
}
