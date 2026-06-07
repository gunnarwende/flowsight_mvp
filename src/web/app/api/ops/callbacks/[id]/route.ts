import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { updateTenantCallbackStatus } from "@/src/lib/callbacks/tenantCallbacks";

/**
 * PATCH /api/ops/callbacks/[id] — Status setzen (resolved | dismissed | pending).
 * Tenant-scoped (Defence in Depth neben RLS). Onboarding-Cockpit Phase 2, OC4.
 * Body: { status: "resolved" | "dismissed" | "pending" }
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

  try {
    const callback = await updateTenantCallbackStatus({
      id,
      tenantId: scope.tenantId,
      status,
      userId: scope.userId,
    });
    if (!callback) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, callback });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
