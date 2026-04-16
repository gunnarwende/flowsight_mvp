import { Suspense } from "react";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { redirect } from "next/navigation";
import { EventManager } from "./EventManager";

export default async function EventsPage() {
  const scope = await resolveTenantScope();
  if (!scope) redirect("/ops/login");

  const supabase = getServiceClient();

  // Check if tenant has events module
  const tenantId = scope.tenantId;
  if (!tenantId) redirect("/ops/cases");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("modules")
    .eq("id", tenantId)
    .single();

  const modules = (tenant?.modules ?? {}) as Record<string, unknown>;
  if (!modules.events) redirect("/ops/cases");

  // Load upcoming events (next 60 days)
  const today = new Date().toISOString().split("T")[0];
  const future = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];

  const { data: events } = await supabase
    .from("pub_events")
    .select("id, category, title, description, event_date, event_time, end_time, is_active")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .gte("event_date", today)
    .lte("event_date", future)
    .order("event_date")
    .order("event_time");

  return (
    <Suspense fallback={<div className="py-8 text-center text-sm text-gray-400">Loading...</div>}>
      <EventManager events={events ?? []} />
    </Suspense>
  );
}
