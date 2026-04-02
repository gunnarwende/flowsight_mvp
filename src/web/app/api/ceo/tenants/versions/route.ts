import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * GET /api/ceo/tenants/versions — Bulk version check for all tenants.
 * Returns version strings keyed by tenant_id. Used by TenantGrid for
 * 60s polling to detect data changes (new cases, staff updates).
 * Admin-only. Single DB round-trip via RPC or aggregate query.
 */
export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Get all non-default tenants
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id")
    .neq("slug", "default");

  if (!tenants?.length) {
    return NextResponse.json({ versions: {} });
  }

  const tenantIds = tenants.map((t) => t.id);

  // Parallel: case counts + last_case_at + staff counts per tenant
  const [casesRes, staffRes] = await Promise.all([
    supabase
      .from("cases")
      .select("tenant_id, created_at")
      .in("tenant_id", tenantIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("staff")
      .select("tenant_id")
      .in("tenant_id", tenantIds)
      .eq("is_active", true),
  ]);

  // Aggregate case stats per tenant
  const caseStats: Record<string, { count: number; lastAt: string }> = {};
  for (const c of casesRes.data ?? []) {
    const tid = c.tenant_id;
    if (!caseStats[tid]) {
      caseStats[tid] = { count: 0, lastAt: c.created_at };
    }
    caseStats[tid].count++;
  }

  // Aggregate staff counts per tenant
  const staffCounts: Record<string, number> = {};
  for (const s of staffRes.data ?? []) {
    staffCounts[s.tenant_id] = (staffCounts[s.tenant_id] ?? 0) + 1;
  }

  // Build version map
  const versions: Record<string, string> = {};
  for (const tid of tenantIds) {
    const cs = caseStats[tid] ?? { count: 0, lastAt: "" };
    const sc = staffCounts[tid] ?? 0;
    versions[tid] = `${cs.count}|${cs.lastAt}|${sc}`;
  }

  return NextResponse.json({ versions });
}
