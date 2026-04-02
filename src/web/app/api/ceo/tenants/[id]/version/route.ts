import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * GET /api/ceo/tenants/[id]/version — Lightweight version check.
 * Returns a version string (case_count|last_case_at|staff_count) for polling.
 * Admin-only. Designed for 60s polling with minimal DB cost.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getServiceClient();

  const [casesRes, staffRes] = await Promise.all([
    supabase
      .from("cases")
      .select("created_at", { count: "exact", head: false })
      .eq("tenant_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("staff")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", id)
      .eq("is_active", true),
  ]);

  const caseCount = casesRes.count ?? 0;
  const lastCaseAt = casesRes.data?.[0]?.created_at ?? "";
  const staffCount = staffRes.count ?? 0;

  return NextResponse.json({
    version: `${caseCount}|${lastCaseAt}|${staffCount}`,
    tenant_id: id,
  });
}
