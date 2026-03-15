import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantIdentity } from "@/src/lib/tenants/resolveTenantIdentity";
import { OpsShell } from "@/src/components/ops/OpsShell";

/**
 * Tab title: "{short_name} Leitsystem" — Identity Contract E2.
 * Uses title.absolute to bypass root layout's " — FlowSight" template (R4).
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const authClient = await getAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) return { title: { absolute: "Leitsystem" } };

    const identity = await resolveTenantIdentity(user);
    const tabLabel = identity?.shortName ?? "Leitsystem";
    return { title: { absolute: `${tabLabel} Leitsystem` } };
  } catch {
    return { title: { absolute: "Leitsystem" } };
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
    <OpsShell
      userEmail={user.email ?? ""}
      tenantName={identity?.displayName ?? undefined}
      brandColor={identity?.primaryColor ?? undefined}
    >
      {children}
    </OpsShell>
  );
}
