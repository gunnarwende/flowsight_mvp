import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * PATCH /api/bigben-pub/callbacks/[id] — update callback status.
 * Body: { status: "resolved" | "dismissed" }
 *
 * Tenant-scoped — a callback only updates if the caller's active tenant
 * matches the row's tenant_id (defence in depth alongside RLS).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const scope = await resolveTenantScope();
  if (!scope?.tenantId) {
    return NextResponse.json({ error: "no_tenant" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const status = body.status;
  if (status !== "resolved" && status !== "dismissed" && status !== "pending") {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("pub_callback_requests")
    .update({
      status,
      resolved_at: status === "pending" ? null : new Date().toISOString(),
      resolved_by: status === "pending" ? null : scope.userId,
    })
    .eq("id", id)
    .eq("tenant_id", scope.tenantId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ ok: true, callback: data });
}
