import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { redirect } from "next/navigation";
import { ReservationManager } from "./ReservationManager";

export default async function ReservationsPage() {
  const scope = await resolveTenantScope();
  if (!scope) redirect("/ops/login");

  const tenantId = scope.tenantId;
  if (!tenantId) redirect("/ops/cases");

  const { data: tenant } = await getServiceClient()
    .from("tenants")
    .select("modules")
    .eq("id", tenantId)
    .single();

  const modules = (tenant?.modules ?? {}) as Record<string, unknown>;
  if (!modules.reservations) redirect("/ops/cases");

  // Load reservations for next 14 days + today
  const today = new Date().toISOString().split("T")[0];
  const future = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

  const { data: reservations } = await getServiceClient()
    .from("pub_reservations")
    .select("*")
    .eq("tenant_id", tenantId)
    .gte("reservation_date", today)
    .lte("reservation_date", future)
    .order("reservation_date")
    .order("reservation_time");

  return <ReservationManager reservations={reservations ?? []} />;
}
