import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "FlowSight CEO", template: "%s | FlowSight CEO" },
  description: "FlowSight Business Management",
  manifest: "/api/ceo/pwa/manifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlowSight CEO",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a2744",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function CeoRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
