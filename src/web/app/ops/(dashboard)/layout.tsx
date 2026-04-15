import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { resolveStaffRole } from "@/src/lib/staff/resolveStaffRole";
import { getServiceClient } from "@/src/lib/supabase/server";
import { OpsShell } from "@/src/components/ops/OpsShell";

/**
 * Tab title: "Leitsystem" — Identity Contract R4.
 */
export async function generateMetadata(): Promise<Metadata> {
  return { title: { absolute: "Leitsystem" } };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authClient = await getAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) redirect("/ops/login");

  // Scope-based identity resolution (respects admin cookie override)
  const scope = await resolveTenantScope();
  const identity = scope?.tenantId
    ? await resolveTenantIdentityById(scope.tenantId)
    : null;

  // Resolve staff role for RBAC (respects viewAsRole override)
  let staffRole: "admin" | "techniker" | undefined;
  const effectiveTenantId = scope?.tenantId ?? identity?.tenantId;
  if (effectiveTenantId && user.email) {
    const ctx = await resolveStaffRole(user.email, effectiveTenantId);
    if (ctx) staffRole = ctx.role;
  }
  // Admin can override role for testing
  if (scope?.isAdmin && scope.viewAsRole === "techniker") {
    staffRole = "techniker";
  }

  // Show role toggle only for tenants with >2 staff members
  let showRoleToggle = true;
  if (effectiveTenantId) {
    const supabase = getServiceClient();
    const { count } = await supabase
      .from("staff")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", effectiveTenantId);
    showRoleToggle = (count ?? 0) > 2;
  }

  // Load tenant modules for nav items (events, reservations)
  let tenantModules: Record<string, unknown> = {};
  if (effectiveTenantId) {
    const sb2 = getServiceClient();
    const { data: tenantRow } = await sb2
      .from("tenants")
      .select("modules")
      .eq("id", effectiveTenantId)
      .single();
    tenantModules = (tenantRow?.modules ?? {}) as Record<string, unknown>;
  }

  // Count pending reservations for badge (pub tenants)
  let pendingResCount = 0;
  if (effectiveTenantId && tenantModules.reservations) {
    const sb3 = getServiceClient();
    const { count } = await sb3
      .from("pub_reservations")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", effectiveTenantId)
      .eq("status", "pending");
    pendingResCount = count ?? 0;
  }

  return (
    <OpsShell
      userEmail={user.email ?? ""}
      tenantName={identity?.displayName ?? undefined}
      brandColor={identity?.primaryColor ?? undefined}
      staffRole={staffRole}
      isAdmin={scope?.isAdmin}
      isImpersonating={scope?.isImpersonating}
      activeTenantId={scope?.tenantId}
      homeTenantId={scope?.homeTenantId}
      viewAsRole={scope?.viewAsRole}
      showRoleToggle={showRoleToggle}
      hasEvents={!!tenantModules.events}
      hasReservations={!!tenantModules.reservations}
      pendingReservations={pendingResCount}
    >
      {children}
    </OpsShell>
  );
}
