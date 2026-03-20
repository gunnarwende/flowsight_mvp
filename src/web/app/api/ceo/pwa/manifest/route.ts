export async function GET() {
  const manifest = {
    name: "FlowSight CEO",
    short_name: "CEO",
    description: "FlowSight Business Management",
    start_url: "/ceo/pulse",
    scope: "/ceo",
    display: "standalone" as const,
    display_override: ["standalone"],
    handle_links: "preferred",
    launch_handler: { client_mode: "focus-existing" },
    background_color: "#0f172a",
    theme_color: "#1a2744",
    orientation: "portrait-primary" as const,
    icons: [
      { src: "/api/ceo/pwa/icon?size=48", sizes: "48x48", type: "image/png", purpose: "any" },
      { src: "/api/ceo/pwa/icon?size=96", sizes: "96x96", type: "image/png", purpose: "any" },
      { src: "/api/ceo/pwa/icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/ceo/pwa/icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/ceo/pwa/icon?size=192&maskable=1", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/api/ceo/pwa/icon?size=512&maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-cache, must-revalidate",
    },
  });
}
