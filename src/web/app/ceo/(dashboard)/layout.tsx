import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { CeoShell } from "@/src/components/ceo/CeoShell";

export async function generateMetadata(): Promise<Metadata> {
  return { title: { absolute: "FlowSight CEO" } };
}

export default async function CeoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authClient = await getAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect("/ceo/login");

  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) redirect("/ops/cases");

  return (
    <CeoShell userEmail={user.email ?? ""}>
      {children}
    </CeoShell>
  );
}
