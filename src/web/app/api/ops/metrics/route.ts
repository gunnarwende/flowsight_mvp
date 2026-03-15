import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * GET /api/ops/metrics — Aggregated KPIs for the tenant
 * 8 metrics per leitstand.md §5.4
 */

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();

  // Fetch all cases for this tenant (limit 5000 for performance)
  let query = supabase
    .from("cases")
    .select("id, status, urgency, source, created_at, updated_at")
    .eq("is_demo", false)
    .neq("status", "archived")
    .limit(5000);

  if (scope.tenantId) query = query.eq("tenant_id", scope.tenantId);

  const { data: cases } = await query;
  if (!cases) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const doneCases = cases.filter((c) => c.status === "done");
  const openCases = cases.filter((c) => c.status !== "done");

  // Average resolution time (created_at → updated_at for done cases)
  const recentDone = doneCases.filter((c) => new Date(c.updated_at).getTime() > monthAgo);
  let avgResolutionHours: number | null = null;
  if (recentDone.length > 0) {
    const totalHours = recentDone.reduce((sum, c) => {
      const diff = new Date(c.updated_at).getTime() - new Date(c.created_at).getTime();
      return sum + diff / (1000 * 60 * 60);
    }, 0);
    avgResolutionHours = Math.round(totalHours / recentDone.length);
  }

  return NextResponse.json({
    totalCases: cases.length,
    openCases: openCases.length,
    newThisWeek: cases.filter((c) => new Date(c.created_at).getTime() > weekAgo).length,
    newThisMonth: cases.filter((c) => new Date(c.created_at).getTime() > monthAgo).length,
    resolvedThisWeek: doneCases.filter((c) => new Date(c.updated_at).getTime() > weekAgo).length,
    resolvedThisMonth: doneCases.filter((c) => new Date(c.updated_at).getTime() > monthAgo).length,
    avgResolutionHours,
    notfallCount: cases.filter((c) => c.urgency === "notfall").length,
    voiceCases: cases.filter((c) => c.source === "voice").length,
    wizardCases: cases.filter((c) => c.source === "wizard").length,
    manualCases: cases.filter((c) => c.source === "manual").length,
  });
}
