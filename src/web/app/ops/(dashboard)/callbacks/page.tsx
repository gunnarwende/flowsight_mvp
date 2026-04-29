import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { redirect } from "next/navigation";
import { CallbackManager } from "./CallbackManager";

export default async function CallbacksPage() {
  const scope = await resolveTenantScope();
  if (!scope) redirect("/ops/login");

  const tenantId = scope.tenantId;
  if (!tenantId) redirect("/ops/cases");

  const supabase = getServiceClient();

  // Pub-only feature; non-pub tenants get bounced to their own surface
  const { data: tenant } = await supabase
    .from("tenants")
    .select("modules")
    .eq("id", tenantId)
    .single();
  const modules = (tenant?.modules ?? {}) as Record<string, unknown>;
  if (!modules.events && !modules.reservations) redirect("/ops/cases");

  // Show the last 30 days, all statuses (so Paul can scroll back through
  // resolved ones too — useful for context after a long break)
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: callbacks } = await supabase
    .from("pub_callback_requests")
    .select("id, caller_name, caller_phone, topic, transcript_excerpt, call_id, status, resolved_at, created_at")
    .eq("tenant_id", tenantId)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(100);

  return <CallbackManager initialCallbacks={callbacks ?? []} />;
}
