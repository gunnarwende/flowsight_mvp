import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

// POST /api/ops/cases/[id]/skip-review — Mark case as "Kein Review"
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const scope = await resolveTenantScope();
  if (!scope) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Verify case exists and belongs to tenant
  const { data: row, error } = await supabase
    .from("cases")
    .select("id, tenant_id")
    .eq("id", id)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "case_not_found" }, { status: 404 });
  }

  if (!scope.isAdmin && scope.tenantId && row.tenant_id !== scope.tenantId) {
    return NextResponse.json({ error: "case_not_found" }, { status: 404 });
  }

  // Insert skip event
  await supabase.from("case_events").insert({
    case_id: id,
    event_type: "review_skipped",
    title: "Review \u00fcbersprungen",
  });

  return NextResponse.json({ ok: true });
}
