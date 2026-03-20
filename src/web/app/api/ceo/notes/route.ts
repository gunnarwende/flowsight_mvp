import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ceo_notes")
    .select("id, text, tenant_id, pinned, created_at")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Resolve tenant names
  const tenantIds = [...new Set((data ?? []).filter((n) => n.tenant_id).map((n) => n.tenant_id))];
  let tenantMap: Record<string, string> = {};
  if (tenantIds.length > 0) {
    const { data: tenants } = await supabase
      .from("tenants")
      .select("id, name, slug")
      .in("id", tenantIds);
    for (const t of tenants ?? []) {
      tenantMap[t.id] = t.name ?? t.slug;
    }
  }

  const notes = (data ?? []).map((n) => ({
    ...n,
    tenant_name: n.tenant_id ? tenantMap[n.tenant_id] ?? null : null,
  }));

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const text = (body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ceo_notes")
    .insert({
      text,
      tenant_id: body.tenant_id || null,
      pinned: body.pinned === true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ note: data }, { status: 201 });
}
