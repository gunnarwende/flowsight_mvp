import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * PATCH /api/ops/staff/[id] — Update staff member
 * DELETE /api/ops/staff/[id] — Soft-delete (deactivate) staff member
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
  if (body.display_name !== undefined) updates.display_name = body.display_name;
  if (body.role !== undefined) updates.role = body.role;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.email !== undefined) updates.email = body.email;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Verify ownership
  let query = supabase.from("staff").select("tenant_id").eq("id", id).single();
  const { data: existing } = await query;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!scope.isAdmin && existing.tenant_id !== scope.tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("staff")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (scope.isProspect) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = getServiceClient();

  // Verify ownership
  const { data: existing } = await supabase.from("staff").select("tenant_id").eq("id", id).single();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!scope.isAdmin && existing.tenant_id !== scope.tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Soft-delete: deactivate, don't hard-delete (preserves history)
  const { error } = await supabase
    .from("staff")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
