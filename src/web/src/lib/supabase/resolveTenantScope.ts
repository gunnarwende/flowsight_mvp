import "server-only";

import { getAuthClient } from "./server-auth";

// ---------------------------------------------------------------------------
// Tenant scope resolution for dashboard pages and API routes.
// Reads tenant_id and role from the user's JWT app_metadata.
// ---------------------------------------------------------------------------

export interface TenantScope {
  /** Tenant ID for scoping. null = admin (sees all tenants). */
  tenantId: string | null;
  /** True if user has role=admin in app_metadata. */
  isAdmin: boolean;
  /** True if user has role=prospect (read-only + limited write). */
  isProspect: boolean;
  /** Supabase user ID. */
  userId: string;
}

/**
 * Resolve the authenticated user's tenant scope.
 * Returns null if not authenticated.
 *
 * Rules:
 * - role=admin → tenantId=null (sees all), isAdmin=true
 * - tenant_id set → scoped to that tenant
 * - no tenant_id, no admin → null tenant (will see nothing with RLS)
 */
export async function resolveTenantScope(): Promise<TenantScope | null> {
  const supabase = await getAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const meta = user.app_metadata ?? {};
  const role = meta.role as string | undefined;
  const tenantId = meta.tenant_id as string | undefined;

  const isAdmin = role === "admin";
  const isProspect = role === "prospect";

  return {
    // Admin keeps their tenant_id for branding/settings, but isAdmin=true
    // allows viewing all tenants' cases via RLS bypass
    tenantId: tenantId ?? null,
    isAdmin,
    isProspect,
    userId: user.id,
  };
}
