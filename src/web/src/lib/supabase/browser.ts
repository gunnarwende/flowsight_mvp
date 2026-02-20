import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client with cookie-based auth.
 * Use in Client Components for auth flows (login, session check).
 * NOT the same as getServiceClient() (server-only, bypasses RLS).
 */
export function getBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient(url, key);
}
