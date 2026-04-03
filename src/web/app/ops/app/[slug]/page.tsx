import { getServiceClient } from "@/src/lib/supabase/server";
import type { Metadata } from "next";

/**
 * Per-tenant PWA entry: /ops/app/[slug]
 *
 * Sets tenant cookie CLIENT-SIDE (via API call), then navigates.
 * Server Components + cookies().set() causes "Application error" on Vercel
 * (Next.js 15 hydration issue). This approach is bulletproof.
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

  const name = tenant?.name ?? slug;
  const tenantId = tenant?.id ?? "";

  return (
    <TenantAppClient name={name} tenantId={tenantId} slug={slug} />
  );
}

function TenantAppClient({ name, tenantId, slug }: { name: string; tenantId: string; slug: string }) {
  // This component renders static HTML with an inline script.
  // The script calls the switch-tenant API, then navigates.
  // No React hydration needed — pure HTML + JS.
  const scriptContent = `
    (async function() {
      try {
        await fetch("/api/ops/switch-tenant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId: "${tenantId}", viewAsRole: null })
        });
        // Cookie is now set. Navigate to cases.
        window.location.replace("/ops/cases?_t=" + Date.now());
      } catch(e) {
        document.getElementById("status").textContent = "Fehler beim Laden. Bitte Seite neu laden.";
      }
    })();
  `;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: "24px",
      padding: "24px",
      backgroundColor: "#0b1120",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
      <div style={{ textAlign: "center" as const }}>
        <h1 style={{ color: "#e2e8f0", fontSize: "22px", fontWeight: 700, margin: "0 0 4px 0" }}>
          {name}
        </h1>
        <p id="status" style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Leitsystem wird geladen...
        </p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
    </div>
  );
}
