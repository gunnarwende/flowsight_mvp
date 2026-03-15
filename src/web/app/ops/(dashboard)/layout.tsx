import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantIdentity } from "@/src/lib/tenants/resolveTenantIdentity";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { OpsShell } from "@/src/components/ops/OpsShell";

/**
 * Dynamic tab title: "{short_name} Leitstand" per Identity Contract E2.
 * Falls back to "Leitstand" for admin or when no tenant is scoped.
 * Never shows "FlowSight" (R4).
 */
/**
 * Tab title: "{short_name} Leitstand" — Identity Contract E2.
 * Uses title.absolute to bypass root layout's " — FlowSight" template (R4).
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const authClient = await getAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) return { title: { absolute: "Leitstand" } };

    const identity = await resolveTenantIdentity(user);
    const tabLabel = identity?.shortName ?? "Leitstand";
    return { title: { absolute: `${tabLabel} Leitstand` } };
  } catch {
    return { title: { absolute: "Leitstand" } };
  }
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

  const identity = await resolveTenantIdentity(user);

  // Lightweight staff count for progressive nav (leitstand.md §2)
  let staffCount = 0;
  try {
    const scope = await resolveTenantScope();
    if (scope?.tenantId) {
      const supabase = getServiceClient();
      const { count } = await supabase
        .from("staff")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", scope.tenantId)
        .eq("is_active", true);
      staffCount = count ?? 0;
    }
  } catch { /* fallback to 0 */ }

  return (
    <OpsShell
      userEmail={user.email ?? ""}
      tenantName={identity?.displayName ?? undefined}
      brandColor={identity?.primaryColor ?? undefined}
      staffCount={staffCount}
    >
      {children}
    </OpsShell>
  );
}
