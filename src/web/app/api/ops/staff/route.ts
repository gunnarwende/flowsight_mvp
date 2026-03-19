import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * GET /api/ops/staff — List active staff for the tenant
 * POST /api/ops/staff — Create a new staff member
 */

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // SAFETY: ALWAYS require tenant scope — never return all staff
  if (!scope.tenantId) {
    return NextResponse.json({ error: "No tenant context" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("staff")
    .select("id, tenant_id, display_name, role, phone, email, is_active, created_at")
    .eq("is_active", true)
    .eq("tenant_id", scope.tenantId)
    .order("display_name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (scope.isProspect) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { display_name, role, phone, email, tenant_id } = body;

  if (!display_name?.trim()) {
    return NextResponse.json({ error: "display_name required" }, { status: 400 });
  }

  // Non-admin must use their own tenant
  const effectiveTenantId = scope.isAdmin ? (tenant_id ?? scope.tenantId) : scope.tenantId;
  if (!effectiveTenantId) {
    return NextResponse.json({ error: "tenant_id required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("staff")
    .insert({
      tenant_id: effectiveTenantId,
      display_name: display_name.trim(),
      role: role ?? "techniker",
      phone: phone ?? null,
      email: email ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
