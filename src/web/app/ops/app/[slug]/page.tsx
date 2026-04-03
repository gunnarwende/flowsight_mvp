import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServiceClient } from "@/src/lib/supabase/server";
import type { Metadata } from "next";

/**
 * Tenant-specific PWA entry point: /ops/app/[slug]
 *
 * Purpose: Each business gets their own installable PWA.
 * When installed from this URL, the PWA manifest uses the tenant's name + icon.
 *
 * Flow:
 * 1. Resolve tenant from slug
 * 2. Set fs_active_tenant cookie to this tenant
 * 3. Redirect to /ops/cases (which now shows the correct tenant)
 *
 * The manifest link in the head points to /api/ops/pwa/manifest?tenant=[id]
 * which returns a tenant-branded manifest with scope /ops.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getServiceClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", slug)
    .single();

  const name = tenant?.name ?? "Leitsystem";
  const tenantId = tenant?.id ?? "";

  return {
    title: `${name} Leitsystem`,
    manifest: `/api/ops/pwa/manifest?tenant=${tenantId}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: name,
    },
  };
}

export default async function TenantAppEntry({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getServiceClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .single();

  if (tenant) {
    // Set the active tenant cookie so /ops/cases shows the right tenant
    const cookieStore = await cookies();
    cookieStore.set("fs_active_tenant", tenant.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  redirect("/ops/cases");
}
