import { redirect } from "next/navigation";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { OpsShell } from "@/src/components/ops/OpsShell";

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

  return (
    <OpsShell userEmail={user.email ?? ""}>
      {children}
    </OpsShell>
  );
}
