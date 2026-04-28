import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * POST /api/bigben-pub/no-shows/forgive
 * Body: { phone: string }
 *
 * Flips all past no_show reservations for this phone to "cancelled" so the
 * guest's NoShow badge resets. Used by Paul when he decides a previous
 * no-show wasn't really one (guest had a good reason, miscommunication, etc).
 *
 * Auth: tenant admin only. Scoped to bigben-pub tenant.
 */
export async function POST(req: Request) {
  const scope = await resolveTenantScope();
  if (!scope || scope.isProspect) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = (body.phone ?? "").trim();
  if (!phone || phone === "—") {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", "bigben-pub")
    .single();
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("pub_reservations")
    .update({ status: "cancelled" })
    .eq("tenant_id", tenant.id)
    .eq("guest_phone", phone)
    .eq("status", "no_show")
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(
    JSON.stringify({
      _tag: "bigben_no_show_forgive",
      phone,
      forgiven_count: data?.length ?? 0,
    }),
  );

  return NextResponse.json({ forgiven: data?.length ?? 0 });
}
