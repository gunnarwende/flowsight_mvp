import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import {
  listTenantCallbacks,
  type TenantCallbackStatus,
} from "@/src/lib/callbacks/tenantCallbacks";

/**
 * GET /api/ops/callbacks — generische "Nachrichten/Rückrufe"-Liste für den
 * aktiven Tenant (Onboarding-Cockpit Phase 2, OC4). Quelle: `tenant_callbacks`
 * (tenant-agnostisch, alle Module — NICHT die pub-spezifische bigben-Route).
 *
 * ?status=pending (default) | resolved | dismissed | all
 */
export async function GET(req: Request) {
  const scope = await resolveTenantScope();
  if (!scope?.tenantId) {
    return NextResponse.json({ error: "no_tenant" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("status") ?? "pending";
  const status = (["pending", "resolved", "dismissed", "all"].includes(raw)
    ? raw
    : "pending") as TenantCallbackStatus | "all";

  try {
    const callbacks = await listTenantCallbacks(scope.tenantId, status);
    return NextResponse.json({ callbacks });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
