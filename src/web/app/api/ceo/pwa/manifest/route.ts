/**
 * CEO-App PWA Manifest — FlowSight branded, installable on Android/Windows/iOS.
 * Edge requires `screenshots` array for install prompt.
 */
export async function GET() {
  const manifest = {
    id: "/ceo",
    name: "FlowSight CEO",
    short_name: "CEO",
    description: "FlowSight Business Management — Pulse, Betriebe, Pipeline, Finanzen, Monitoring",
    start_url: "/ceo/pulse",
    scope: "/ceo",
    display: "standalone" as const,
    display_override: ["standalone"],
    handle_links: "preferred",
    launch_handler: { client_mode: "focus-existing" },
    background_color: "#0f172a",
    theme_color: "#1a2744",
    orientation: "any" as const,
    categories: ["business", "productivity"],
    icons: [
      { src: "/api/ceo/pwa/icon?size=48", sizes: "48x48", type: "image/png", purpose: "any" },
      { src: "/api/ceo/pwa/icon?size=96", sizes: "96x96", type: "image/png", purpose: "any" },
      { src: "/api/ceo/pwa/icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/ceo/pwa/icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/ceo/pwa/icon?size=192&maskable=1", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/api/ceo/pwa/icon?size=512&maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Screenshots required by Edge for install prompt (narrow = mobile, wide = desktop)
    screenshots: [
      {
        src: "/api/ceo/pwa/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        form_factor: "narrow",
        label: "FlowSight CEO Pulse Dashboard",
      },
      {
        src: "/api/ceo/pwa/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        form_factor: "wide",
        label: "FlowSight CEO Desktop View",
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-cache, must-revalidate",
    },
  });
}
