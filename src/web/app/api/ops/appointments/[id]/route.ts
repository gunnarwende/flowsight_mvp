import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * PATCH /api/ops/appointments/[id] — Update appointment (reschedule, confirm, complete, cancel)
 */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (scope.isProspect) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.scheduled_at !== undefined) updates.scheduled_at = body.scheduled_at;
  if (body.duration_min !== undefined) updates.duration_min = body.duration_min;
  if (body.staff_id !== undefined) updates.staff_id = body.staff_id;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.status !== undefined) {
    const validStatuses = ["scheduled", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Verify ownership
  const { data: existing } = await supabase.from("appointments").select("tenant_id, ics_sequence").eq("id", id).single();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!scope.isAdmin && existing.tenant_id !== scope.tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ICS v2: increment sequence on reschedule/cancel
  if (updates.scheduled_at || updates.status === "cancelled") {
    updates.ics_sequence = (existing.ics_sequence ?? 0) + 1;
  }

  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .select("*, staff:staff_id(id, display_name, role)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
