import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * GET /api/ops/tenant-app/[slug] — Tenant-specific PWA entry point.
 *
 * Sets fs_active_tenant cookie and redirects to the tenant's home view:
 *   - Pub tenants (events / reservations modules) → /ops/pub-dashboard
 *   - All other tenants → /ops/cases (Sanitär Leitsystem)
 *
 * Used for per-tenant PWA installation:
 *   flowsight.ch/api/ops/tenant-app/bigben-pub → cookie + redirect to pub-dashboard
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = getServiceClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, modules")
    .eq("slug", slug)
    .single();

  if (!tenant) {
    return NextResponse.redirect(new URL("/ops/login", _req.url));
  }

  const modules = (tenant.modules ?? {}) as Record<string, unknown>;
  const isPub = Boolean(modules.events) || Boolean(modules.reservations);
  const home = isPub ? "/ops/pub-dashboard" : "/ops/cases";

  // Cache-bust: add timestamp to prevent browser from showing stale cached page
  const response = NextResponse.redirect(new URL(`${home}?_tenant=${slug}&_t=${Date.now()}`, _req.url));
  response.cookies.set("fs_active_tenant", tenant.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
