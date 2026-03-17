import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantIdentity } from "@/src/lib/tenants/resolveTenantIdentity";

/**
 * Dynamic PWA manifest — tenant-branded.
 *
 * When the user is logged in, the manifest uses the tenant's short name
 * (e.g. "Weinberger AG") so the homescreen icon shows THEIR brand,
 * not "FlowSight". Identity Contract R4 compliance.
 *
 * Fallback for unauthenticated: generic "Leitsystem".
 */
export async function GET() {
  let name = "Leitsystem";
  let shortName = "Leitsystem";

  try {
    const supabase = await getAuthClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const identity = await resolveTenantIdentity(user);
      if (identity) {
        shortName = identity.shortName;
        name = `${identity.shortName} Leitsystem`;
      }
    }
  } catch {
    // Fall through to defaults — manifest must always return valid JSON
  }

  const manifest = {
    name,
    short_name: shortName,
    description: "Fälle, Termine und Team auf einen Blick.",
    start_url: "/ops/cases",
    scope: "/ops/",
    display: "standalone" as const,
    background_color: "#1a2744",
    theme_color: "#1a2744",
    orientation: "portrait-primary" as const,
    icons: [
      {
        src: "/api/ops/pwa/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/api/ops/pwa/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/api/ops/pwa/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
