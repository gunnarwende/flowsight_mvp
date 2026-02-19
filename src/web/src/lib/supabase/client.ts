import { createClient } from "@supabase/supabase-js";

/**
 * Anon Supabase client (safe for browser if needed).
 * Respects RLS policies. Not used in MVP but wired for future use.
 */
export function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY. Check .env.local / Vercel Env."
    );
  }

  return createClient(url, key);
}
