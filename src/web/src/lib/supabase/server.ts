import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using service_role key.
 * Bypasses RLS — use only in API routes / server actions.
 */
export function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check .env.local / Vercel Env."
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
