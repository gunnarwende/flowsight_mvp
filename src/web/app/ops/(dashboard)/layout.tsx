import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { resolveStaffRole } from "@/src/lib/staff/resolveStaffRole";
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

  // Resolve staff role for RBAC
  let staffRole: "admin" | "techniker" | undefined;
  const effectiveTenantId = scope?.tenantId ?? identity?.tenantId;
  if (effectiveTenantId && user.email) {
    const ctx = await resolveStaffRole(user.email, effectiveTenantId);
    if (ctx) staffRole = ctx.role;
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
    >
      {children}
    </OpsShell>
  );
}
