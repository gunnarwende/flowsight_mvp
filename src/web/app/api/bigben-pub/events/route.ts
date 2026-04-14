import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

// ---------------------------------------------------------------------------
// GET /api/bigben-pub/events — Public: returns upcoming events (next 21 days)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const supabase = getServiceClient();
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") ?? "21", 10);
  const category = url.searchParams.get("category"); // "sport" | "event" | null (all)

  const today = new Date().toISOString().split("T")[0];
  const future = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

  // Find BigBen Pub tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", "bigben-pub")
    .single();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  let query = supabase
    .from("pub_events")
    .select("id, category, title, description, event_date, event_time, end_time, image_url")
    .eq("tenant_id", tenant.id)
    .eq("is_active", true)
    .gte("event_date", today)
    .lte("event_date", future)
    .order("event_date")
    .order("event_time");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}

// ---------------------------------------------------------------------------
// POST /api/bigben-pub/events — Auth required: create a new event
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope || scope.isProspect) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { category, title, event_date, event_time, end_time, description, image_url } = body as {
    category?: string;
    title?: string;
    event_date?: string;
    event_time?: string;
    end_time?: string;
    description?: string;
    image_url?: string;
  };

  if (!category || !title || !event_date) {
    return NextResponse.json({ error: "category, title, event_date required" }, { status: 400 });
  }

  if (!["sport", "event"].includes(category)) {
    return NextResponse.json({ error: "category must be 'sport' or 'event'" }, { status: 400 });
  }

  // Resolve tenant — use BigBen Pub tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", "bigben-pub")
    .single();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("pub_events")
    .insert({
      tenant_id: tenant.id,
      category,
      title,
      event_date,
      event_time: event_time || null,
      end_time: end_time || null,
      description: description || null,
      image_url: image_url || null,
      is_active: true,
    })
    .select("id, category, title, event_date, event_time")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
