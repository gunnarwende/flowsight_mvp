import type { Metadata } from "next";

/**
 * Root ops layout — wraps BOTH (auth) and (dashboard) route groups.
 * PWA manifest + meta tags here so they're available on login AND dashboard.
 *
 * On the login page (no session): manifest returns generic "Leitsystem".
 * On dashboard pages (with session): manifest returns tenant name dynamically.
 */
export const metadata: Metadata = {
  manifest: "/api/ops/pwa/manifest",
  icons: {
    apple: "/api/ops/pwa/icon?size=180",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
