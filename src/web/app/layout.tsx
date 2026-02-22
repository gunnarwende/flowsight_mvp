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
    default: "FlowSight — 24/7 Intake für Sanitär & Heizung",
    template: "%s — FlowSight",
  },
  description:
    "FlowSight nimmt Schadensmeldungen per Telefon und Web entgegen — rund um die Uhr. Jede Meldung wird zum strukturierten Fall in Ihrem Dashboard.",
  metadataBase: new URL("https://flowsight.ch"),
  openGraph: {
    type: "website",
    locale: "de_CH",
    siteName: "FlowSight",
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
