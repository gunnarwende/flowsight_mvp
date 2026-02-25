import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * Valid module names (entitlements).
 * Each tenant has a `modules` jsonb column: { "voice": true, "ops": true, ... }
 * Missing key = disabled.
 */
export type ModuleName = "website_wizard" | "ops" | "voice" | "reviews";

/**
 * Check if a tenant has a specific module enabled.
 *
 * Graceful fallback: if the modules column doesn't exist yet (migration pending)
 * or the tenant has no modules configured, returns true (allow by default).
 * This prevents breaking existing flows before the migration is applied.
 *
 * Returns false ONLY when modules is explicitly set AND the module is not in it.
 */
export async function hasModule(
  tenantId: string,
  module: ModuleName,
): Promise<boolean> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("modules")
      .eq("id", tenantId)
      .single();

    if (error || !data) return true; // tenant not found → allow (fallback)

    const modules = data.modules as Record<string, boolean> | null;
    if (!modules || Object.keys(modules).length === 0) return true; // no modules set → allow all

    return modules[module] === true;
  } catch {
    return true; // DB error → allow (never block on infra failure)
  }
}
