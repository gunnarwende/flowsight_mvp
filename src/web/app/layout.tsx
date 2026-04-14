import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, DM_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default:
      "FlowSight – Ihr eigenes Leitsystem.",
    template: "%s — FlowSight",
  },
  description:
    "24/7 Anrufannahme, strukturierte Falllisten und Einsatzplanung. Für Sanitär- und Heizungsbetriebe im Raum Zürich.",
  metadataBase: new URL("https://flowsight.ch"),
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "de_CH",
    siteName: "FlowSight",
    title:
      "FlowSight – Ihr eigenes Leitsystem.",
    description:
      "24/7 Anrufannahme, strukturierte Falllisten und Einsatzplanung. Für Sanitär- und Heizungsbetriebe im Raum Zürich.",
    url: "https://flowsight.ch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "FlowSight – Ihr eigenes Leitsystem.",
    description:
      "24/7 Anrufannahme, strukturierte Falllisten und Einsatzplanung. Für Sanitär- und Heizungsbetriebe im Raum Zürich.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${dmSans.variable} ${sourceSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
