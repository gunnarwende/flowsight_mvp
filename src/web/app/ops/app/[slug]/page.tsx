import { getServiceClient } from "@/src/lib/supabase/server";
import type { Metadata } from "next";
import { TenantAppClient } from "./TenantAppClient";

/**
 * Per-tenant PWA entry: /ops/app/[slug]
 *
 * Server Component: resolves tenant + generates metadata (manifest link).
 * Client Component: calls switch-tenant API + navigates to /ops/cases.
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

  return {
    title: `${tenant?.name ?? "Leitsystem"} Leitsystem`,
    manifest: `/api/ops/pwa/manifest?tenant=${tenant?.id ?? ""}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: tenant?.name ?? "Leitsystem",
    },
  };
}

export default async function TenantAppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getServiceClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", slug)
    .single();

  return (
    <TenantAppClient
      name={tenant?.name ?? slug}
      tenantId={tenant?.id ?? ""}
    />
  );
}
