import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { computeOpsBadgeBreakdown } from "@/src/lib/push/opsBadge";

/**
 * GET /api/ops/badge-count — SSOT für App-Icon-Badge + Nav-Zähler.
 * Liefert { cases, messages, total } für den aktiven Tenant (Cookie-Scope,
 * respektiert Impersonation). Vom Client beim Öffnen + im Nav verwendet.
 */
export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope || !scope.tenantId) {
    return NextResponse.json({ cases: 0, messages: 0, total: 0 }, { status: 200 });
  }
  try {
    const supabase = getServiceClient();
    const counts = await computeOpsBadgeBreakdown(supabase, scope.tenantId);
    return NextResponse.json(counts, { status: 200 });
  } catch {
    return NextResponse.json({ cases: 0, messages: 0, total: 0 }, { status: 200 });
  }
}
