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
    default: "FlowSight — Jeder Anruf wird zum Auftrag",
    template: "%s — FlowSight",
  },
  description:
    "Das Leitsystem für Schweizer Sanitär- und Heizungsbetriebe. Voice-Intake, Einsatzplanung und Ops Dashboard — kein Anruf geht verloren.",
  metadataBase: new URL("https://flowsight.ch"),
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "de_CH",
    siteName: "FlowSight",
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
