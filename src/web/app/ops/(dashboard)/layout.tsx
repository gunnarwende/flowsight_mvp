import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantIdentity } from "@/src/lib/tenants/resolveTenantIdentity";
import { OpsShell } from "@/src/components/ops/OpsShell";

/**
 * Dynamic tab title: "{short_name} Leitstand" per Identity Contract E2.
 * Falls back to "Leitstand" for admin or when no tenant is scoped.
 * Never shows "FlowSight" (R4).
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const authClient = await getAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) return { title: "Leitstand" };

    const identity = await resolveTenantIdentity(user);
    const tabLabel = identity?.shortName ?? "Leitstand";
    return { title: `${tabLabel} Leitstand` };
  } catch {
    return { title: "Leitstand" };
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

  return (
    <OpsShell userEmail={user.email ?? ""} tenantName={identity?.displayName ?? undefined}>
      {children}
    </OpsShell>
  );
}
