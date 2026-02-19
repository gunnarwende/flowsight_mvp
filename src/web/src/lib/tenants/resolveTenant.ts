import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * Resolve tenant_id from an inbound called number (E.164).
 * Looks up tenant_numbers table; falls back to FALLBACK_TENANT_ID env var.
 * Returns null only if both lookup and fallback fail.
 */
export async function resolveTenant(
  calledNumber: string | undefined
): Promise<string | null> {
  if (calledNumber) {
    try {
      const supabase = getServiceClient();
      const { data, error } = await supabase
        .from("tenant_numbers")
        .select("tenant_id")
        .eq("phone_number", calledNumber)
        .eq("active", true)
        .limit(1)
        .single();

      if (!error && data?.tenant_id) {
        return data.tenant_id;
      }
    } catch {
      // DB lookup failed — fall through to fallback
    }
  }

  return process.env.FALLBACK_TENANT_ID ?? null;
}
