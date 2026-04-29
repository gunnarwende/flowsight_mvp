import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * GET /api/bigben-pub/callbacks — list callback requests for the active
 * tenant. Defaults to pending only; ?status=all returns the full list.
 */
export async function GET(req: Request) {
  const scope = await resolveTenantScope();
  if (!scope?.tenantId) {
    return NextResponse.json({ error: "no_tenant" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";

  const supabase = getServiceClient();
  let query = supabase
    .from("pub_callback_requests")
    .select("id, caller_name, caller_phone, topic, transcript_excerpt, call_id, status, resolved_at, created_at")
    .eq("tenant_id", scope.tenantId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ callbacks: data ?? [] });
}
