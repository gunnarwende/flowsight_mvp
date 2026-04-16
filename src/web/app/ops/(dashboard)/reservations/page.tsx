import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { redirect } from "next/navigation";
import { ReservationManager } from "./ReservationManager";

export default async function ReservationsPage() {
  const scope = await resolveTenantScope();
  if (!scope) redirect("/ops/login");

  const tenantId = scope.tenantId;
  if (!tenantId) redirect("/ops/cases");

  const supabase = getServiceClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("modules")
    .eq("id", tenantId)
    .single();

  const modules = (tenant?.modules ?? {}) as Record<string, unknown>;
  if (!modules.reservations) redirect("/ops/cases");

  // Load reservations for next 14 days + today
  const today = new Date().toISOString().split("T")[0];
  const future = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

  // Parallel: reservations + no-show history
  const [{ data: reservations }, { data: noShowRows }] = await Promise.all([
    supabase
      .from("pub_reservations")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("reservation_date", today)
      .lte("reservation_date", future)
      .order("reservation_date")
      .order("reservation_time"),
    // Count past no-shows per guest phone
    supabase
      .from("pub_reservations")
      .select("guest_phone")
      .eq("tenant_id", tenantId)
      .eq("status", "no_show"),
  ]);

  // Build no-show map: phone -> count
  const noShowMap: Record<string, number> = {};
  for (const row of noShowRows ?? []) {
    const phone = row.guest_phone;
    if (phone && phone !== "—") {
      noShowMap[phone] = (noShowMap[phone] ?? 0) + 1;
    }
  }

  return <ReservationManager reservations={reservations ?? []} noShowMap={noShowMap} />;
}
