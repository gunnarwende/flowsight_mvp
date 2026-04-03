import { getServiceClient } from "@/src/lib/supabase/server";
import type { Metadata } from "next";

/**
 * Per-tenant PWA landing page: /ops/app/[slug]
 *
 * This page serves ONE purpose: provide the correct <link rel="manifest">
 * for the tenant-branded PWA so Chrome can install it with the right name + icon.
 *
 * The actual redirect (cookie set + navigate to /ops/cases) happens client-side
 * via the API route, avoiding Next.js Server Component redirect-after-cookie issues.
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

  const name = tenant?.name ?? slug;
  const modules = (tenant?.modules ?? {}) as Record<string, unknown>;
  const color = typeof modules.primary_color === "string" ? modules.primary_color : "#1a2744";

  return (
    <html lang="de">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0b1120", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          padding: "24px",
        }}>
          {/* Brand circle */}
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            backgroundColor: "#1a2744",
            border: "2px solid #c8965a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#c8965a",
            }} />
          </div>

          {/* Title */}
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#e2e8f0", fontSize: "22px", fontWeight: 700, margin: "0 0 4px 0" }}>
              {name}
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Leitsystem wird geladen...</p>
          </div>

          {/* Auto-redirect via API route (sets cookie + redirects) */}
          <meta httpEquiv="refresh" content={`1;url=/api/ops/tenant-app/${slug}`} />

          {/* Fallback link */}
          <a
            href={`/api/ops/tenant-app/${slug}`}
            style={{
              color: "#c8965a",
              fontSize: "13px",
              textDecoration: "none",
              marginTop: "16px",
            }}
          >
            Falls die Weiterleitung nicht funktioniert, hier klicken
          </a>
        </div>
      </body>
    </html>
  );
}
