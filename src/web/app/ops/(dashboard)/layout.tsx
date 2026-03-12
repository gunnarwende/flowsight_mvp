import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { getServiceClient } from "@/src/lib/supabase/server";
import { OpsShell } from "@/src/components/ops/OpsShell";

interface TenantIdentity {
  name: string | null;
  shortName: string | null;
}

async function resolveTenantIdentity(
  user: { app_metadata?: Record<string, unknown> }
): Promise<TenantIdentity> {
  try {
    const supabase = getServiceClient();
    // 1. Prefer explicit tenant_id from user metadata (set via Supabase admin)
    const metaTenantId = user.app_metadata?.tenant_id as string | undefined;
    if (metaTenantId) {
      const { data } = await supabase
        .from("tenants")
        .select("name, modules")
        .eq("id", metaTenantId)
        .single();
      if (data?.name) {
        const modules = data.modules as Record<string, unknown> | null;
        const shortName =
          typeof modules?.sms_sender_name === "string"
            ? modules.sms_sender_name
            : null;
        return { name: data.name, shortName };
      }
    }
    // 2. Fallback: if only one tenant exists (common in early MVP), use it
    const { data: tenants } = await supabase
      .from("tenants")
      .select("name, modules")
      .limit(2);
    if (tenants && tenants.length === 1) {
      const modules = tenants[0].modules as Record<string, unknown> | null;
      const shortName =
        typeof modules?.sms_sender_name === "string"
          ? modules.sms_sender_name
          : null;
      return { name: tenants[0].name, shortName };
    }
    return { name: null, shortName: null };
  } catch {
    return { name: null, shortName: null };
  }
}

/**
 * Dynamic tab title: "{short_name} OPS" per Identity Contract E1.
 * Falls back to "FlowSight OPS" for admin or when no tenant is scoped.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const authClient = await getAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) return { title: "OPS" };

    const { shortName } = await resolveTenantIdentity(user);
    const tabLabel = shortName ?? "FlowSight";
    return { title: `${tabLabel} OPS` };
  } catch {
    return { title: "OPS" };
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

  const { name: tenantName } = await resolveTenantIdentity(user);

  return (
    <OpsShell userEmail={user.email ?? ""} tenantName={tenantName ?? undefined}>
      {children}
    </OpsShell>
  );
}
