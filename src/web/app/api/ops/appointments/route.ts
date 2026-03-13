import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * GET /api/ops/appointments — List appointments (optionally filtered by case_id or staff_id)
 * POST /api/ops/appointments — Create a new appointment
 */

export async function GET(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get("case_id");
  const staffId = searchParams.get("staff_id");
  const dateFrom = searchParams.get("from");
  const dateTo = searchParams.get("to");

  const supabase = getServiceClient();
  let query = supabase
    .from("appointments")
    .select("*, staff:staff_id(id, display_name, role)")
    .order("scheduled_at", { ascending: true });

  if (scope.tenantId) query = query.eq("tenant_id", scope.tenantId);
  if (caseId) query = query.eq("case_id", caseId);
  if (staffId) query = query.eq("staff_id", staffId);
  if (dateFrom) query = query.gte("scheduled_at", dateFrom);
  if (dateTo) query = query.lte("scheduled_at", dateTo);

  // Exclude cancelled by default
  if (!searchParams.has("include_cancelled")) {
    query = query.neq("status", "cancelled");
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (scope.isProspect) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { case_id, staff_id, scheduled_at, duration_min, notes, tenant_id } = body;

  if (!case_id || !staff_id || !scheduled_at) {
    return NextResponse.json(
      { error: "case_id, staff_id, scheduled_at required" },
      { status: 400 }
    );
  }

  const effectiveTenantId = scope.isAdmin ? (tenant_id ?? scope.tenantId) : scope.tenantId;
  if (!effectiveTenantId) {
    return NextResponse.json({ error: "tenant_id required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Generate ICS UID for this appointment
  const icsUid = `${crypto.randomUUID()}@flowsight.ch`;

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      tenant_id: effectiveTenantId,
      case_id,
      staff_id,
      scheduled_at,
      duration_min: duration_min ?? 60,
      notes: notes ?? null,
      ics_uid: icsUid,
      ics_sequence: 0,
    })
    .select("*, staff:staff_id(id, display_name, role)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
