import "server-only";

import { cookies } from "next/headers";
import { getAuthClient } from "./server-auth";

// ---------------------------------------------------------------------------
// Tenant scope resolution for dashboard pages and API routes.
// Reads tenant_id from: (1) admin cookie override, (2) JWT app_metadata.
// ---------------------------------------------------------------------------

const TENANT_COOKIE = "fs_active_tenant";

export interface TenantScope {
  /** Active tenant ID for scoping queries, branding, settings. */
  tenantId: string | null;
  /** True if user has role=admin in app_metadata. */
  isAdmin: boolean;
  /** True if user has role=prospect (read-only + limited write). */
  isProspect: boolean;
  /** Supabase user ID. */
  userId: string;
  /** True when admin is viewing a tenant different from their JWT tenant_id. */
  isImpersonating: boolean;
  /** Admin's own tenant_id from JWT (for "Mein Betrieb" reset). */
  homeTenantId: string | null;
}

/**
 * Resolve the authenticated user's tenant scope.
 * Returns null if not authenticated.
 *
 * For admin users: reads `fs_active_tenant` HttpOnly cookie first.
 * This enables the Tenant Switcher without logout/login.
 * Cookie is only respected when JWT confirms role=admin (not spoofable).
 */
export async function resolveTenantScope(): Promise<TenantScope | null> {
  const supabase = await getAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const meta = user.app_metadata ?? {};
  const role = meta.role as string | undefined;
  const jwtTenantId = meta.tenant_id as string | undefined;

  const isAdmin = role === "admin";
  const isProspect = role === "prospect";

  // Admin cookie override — only trusted when JWT proves admin role
  let activeTenantId = jwtTenantId ?? null;
  let isImpersonating = false;

  if (isAdmin) {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(TENANT_COOKIE)?.value;
    if (cookieVal && /^[0-9a-f-]{36}$/i.test(cookieVal)) {
      activeTenantId = cookieVal;
      isImpersonating = cookieVal !== (jwtTenantId ?? "");
    }
  }

  return {
    tenantId: activeTenantId,
    isAdmin,
    isProspect,
    userId: user.id,
    isImpersonating,
    homeTenantId: jwtTenantId ?? null,
  };
}
