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

  const displayName = tenant?.name ?? slug;
  return {
    title: displayName,
    manifest: `/api/ops/pwa/manifest?tenant=${tenant?.id ?? ""}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: displayName,
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
    .select("id, name, modules")
    .eq("slug", slug)
    .single();

  const modules = (tenant?.modules ?? {}) as Record<string, unknown>;
  const isPub = Boolean(modules.events) || Boolean(modules.reservations);

  return (
    <TenantAppClient
      name={tenant?.name ?? slug}
      tenantId={tenant?.id ?? ""}
      slug={slug}
      isPub={isPub}
    />
  );
}
