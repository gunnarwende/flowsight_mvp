import { getServiceClient } from "@/src/lib/supabase/server";
import { cookies } from "next/headers";
import type { Metadata } from "next";

/**
 * Per-tenant PWA landing page: /ops/app/[slug]
 *
 * Sets the fs_active_tenant cookie SERVER-SIDE (in the response headers),
 * then renders a page that client-side navigates to /ops/cases.
 *
 * Why not redirect? Because cookies set via redirect (302/307) have timing
 * issues — the browser may send the follow-up request before storing the
 * new cookie. By rendering a page first, the cookie is guaranteed to be
 * stored before the next navigation.
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

  // SET COOKIE SERVER-SIDE — this is in the response headers of THIS page render.
  // When the browser receives this page, the cookie is stored BEFORE any navigation.
  if (tenant) {
    const cookieStore = await cookies();
    cookieStore.set("fs_active_tenant", tenant.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // Client-side navigation happens AFTER the page (with cookie) is fully loaded.
  // Using a script instead of meta-refresh to ensure cookie is stored first.
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
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#e2e8f0", fontSize: "22px", fontWeight: 700, margin: "0 0 4px 0" }}>
              {name}
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Leitsystem wird geladen...</p>
          </div>
        </div>
        {/* Navigate AFTER page load — cookie is guaranteed to be stored */}
        <script dangerouslySetInnerHTML={{ __html: `
          setTimeout(function() {
            window.location.replace("/ops/cases?_t=" + Date.now());
          }, 500);
        `}} />
      </body>
    </html>
  );
}
