import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "FlowSight – KI-Telefonassistent & Ops-Dashboard für Sanitär & Heizung",
    template: "%s — FlowSight",
  },
  description:
    "24/7 Anrufannahme mit KI, strukturierte Fälle im Dashboard, Website + Online-Auftragsformular. Für Sanitär- und Heizungsbetriebe im Raum Zürich.",
  metadataBase: new URL("https://flowsight.ch"),
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "de_CH",
    siteName: "FlowSight",
    title:
      "FlowSight – KI-Telefonassistent & Ops-Dashboard für Sanitär & Heizung",
    description:
      "24/7 Anrufannahme mit KI, strukturierte Fälle im Dashboard, Website + Online-Auftragsformular. Für Sanitär- und Heizungsbetriebe im Raum Zürich.",
    url: "https://flowsight.ch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "FlowSight – KI-Telefonassistent & Ops-Dashboard für Sanitär & Heizung",
    description:
      "24/7 Anrufannahme mit KI, strukturierte Fälle im Dashboard, Website + Online-Auftragsformular. Für Sanitär- und Heizungsbetriebe im Raum Zürich.",
  },
  other: {
    "theme-color": "#1a2744",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
