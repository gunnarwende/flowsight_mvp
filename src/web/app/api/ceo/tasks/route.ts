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
    .from("ceo_tasks")
    .select("id, title, due_at, tenant_id, done_at, priority, created_at")
    .order("done_at", { ascending: true, nullsFirst: true })
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Resolve tenant names
  const tenantIds = [...new Set((data ?? []).filter((t) => t.tenant_id).map((t) => t.tenant_id))];
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

  const tasks = (data ?? []).map((t) => ({
    ...t,
    tenant_name: t.tenant_id ? tenantMap[t.tenant_id] ?? null : null,
  }));

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = (body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const priority = ["low", "normal", "high"].includes(body.priority) ? body.priority : "normal";

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ceo_tasks")
    .insert({
      title,
      due_at: body.due_at || null,
      tenant_id: body.tenant_id || null,
      priority,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const id = body.id;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.done_at !== undefined) updates.done_at = body.done_at;
  if (body.priority !== undefined && ["low", "normal", "high"].includes(body.priority)) {
    updates.priority = body.priority;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no updates" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ceo_tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}
