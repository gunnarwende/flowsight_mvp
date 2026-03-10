import { redirect } from "next/navigation";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { getServiceClient } from "@/src/lib/supabase/server";
import { OpsShell } from "@/src/components/ops/OpsShell";

async function resolveTenantName(
  user: { app_metadata?: Record<string, unknown> }
): Promise<string | null> {
  try {
    const supabase = getServiceClient();
    // 1. Prefer explicit tenant_id from user metadata (set via Supabase admin)
    const metaTenantId = user.app_metadata?.tenant_id as string | undefined;
    if (metaTenantId) {
      const { data } = await supabase
        .from("tenants")
        .select("name")
        .eq("id", metaTenantId)
        .single();
      if (data?.name) return data.name;
    }
    // 2. Fallback: if only one tenant exists (common in early MVP), use it
    const { data: tenants } = await supabase
      .from("tenants")
      .select("name")
      .limit(2);
    if (tenants && tenants.length === 1) return tenants[0].name;
    return null;
  } catch {
    return null;
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

  const tenantName = await resolveTenantName(user);

  return (
    <OpsShell userEmail={user.email ?? ""} tenantName={tenantName ?? undefined}>
      {children}
    </OpsShell>
  );
}
