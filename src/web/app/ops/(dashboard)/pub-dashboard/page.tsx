import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { redirect } from "next/navigation";
import { PubDashboard } from "./PubDashboard";

export default async function PubDashboardPage() {
  const scope = await resolveTenantScope();
  if (!scope) redirect("/ops/login");

  const tenantId = scope.tenantId;
  if (!tenantId) redirect("/ops/cases");

  const supabase = getServiceClient();

  // Check if this tenant has pub modules
  const { data: tenant } = await supabase
    .from("tenants")
    .select("modules, name")
    .eq("id", tenantId)
    .single();

  const modules = (tenant?.modules ?? {}) as Record<string, unknown>;
  if (!modules.events && !modules.reservations) redirect("/ops/cases");

  // Sync is triggered client-side in PubDashboard useEffect (not here — double-sync caused duplicates)

  const today = new Date().toISOString().split("T")[0];
  const next7 = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const next21 = new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0];

  // Parallel queries
  const [
    { data: todayEvents },
    { data: upcomingEvents },
    { data: pendingRes },
    { data: todayRes },
    { data: upcomingRes },
    { data: noShowRows },
  ] = await Promise.all([
    // Today's events
    supabase
      .from("pub_events")
      .select("id, category, title, event_time")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .eq("event_date", today)
      .order("event_time"),
    // Next 7 days events
    supabase
      .from("pub_events")
      .select("id, category, title, event_date, event_time")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .gt("event_date", today)
      .lte("event_date", next7)
      .order("event_date")
      .order("event_time"),
    // Pending reservations (need action!)
    supabase
      .from("pub_reservations")
      .select("id, guest_name, guest_phone, reservation_date, reservation_time, party_size, note, source")
      .eq("tenant_id", tenantId)
      .eq("status", "pending")
      .gte("reservation_date", today)
      .order("reservation_date")
      .order("reservation_time"),
    // Today's confirmed reservations
    supabase
      .from("pub_reservations")
      .select("id, guest_name, reservation_time, party_size, note, status")
      .eq("tenant_id", tenantId)
      .eq("reservation_date", today)
      .in("status", ["confirmed", "pending"])
      .order("reservation_time"),
    // Next 7 days confirmed reservations
    supabase
      .from("pub_reservations")
      .select("id, guest_name, reservation_date, reservation_time, party_size, status")
      .eq("tenant_id", tenantId)
      .gt("reservation_date", today)
      .lte("reservation_date", next7)
      .in("status", ["confirmed", "pending"])
      .order("reservation_date")
      .order("reservation_time"),
    // No-show history (all time)
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
    if (phone && phone !== "\u2014") {
      noShowMap[phone] = (noShowMap[phone] ?? 0) + 1;
    }
  }

  return (
    <PubDashboard
      tenantName={tenant?.name ?? "Pub"}
      todayEvents={todayEvents ?? []}
      upcomingEvents={upcomingEvents ?? []}
      pendingReservations={pendingRes ?? []}
      todayReservations={todayRes ?? []}
      upcomingReservations={upcomingRes ?? []}
      noShowMap={noShowMap}
    />
  );
}
