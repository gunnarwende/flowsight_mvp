/**
 * Handout registry — prospect data for the "Ihr FlowSight-Fahrplan" page.
 *
 * Each entry is keyed by an 8-char shortId (URL-safe, not guessable).
 * Add new prospects here; the page at /handout/[id] renders from this data.
 */

export interface HandoutData {
  companyName: string;
  logoUrl?: string; // absolute or relative path; fallback = initials
  location: string;
  contactName: string;
  demoDate: string; // ISO date string, e.g. "2026-03-05"
  recommendedPackage: "starter" | "alltag" | "wachstum";
  recommendationReason: string;
  demoWebsiteUrl?: string;
  wizardUrl?: string;
}

export const HANDOUTS: Record<string, HandoutData> = {
  // Dörfler AG — first real prospect demo
  xK7m2pQw: {
    companyName: "Dörfler AG",
    logoUrl: undefined, // wordmark fallback
    location: "Oberrieden",
    contactName: "Herr Dörfler",
    demoDate: "2026-03-05",
    recommendedPackage: "alltag",
    recommendationReason:
      "Viele Anrufe ausserhalb der Bürozeiten — die Telefonassistentin fängt diese ab und erstellt strukturierte Fälle.",
    demoWebsiteUrl: "https://flowsight.ch/doerfler-ag",
    wizardUrl: "https://flowsight.ch/doerfler-ag/meldung",
  },
};

export const PACKAGES = [
  {
    id: "starter" as const,
    name: "Starter",
    price: "CHF 199",
    subtitle: "Website + Online-Schadenmeldung",
    features: [
      "Moderne Website im Firmenlook (mobiloptimiert)",
      "Online-Schadenmeldung in 3 Schritten",
      "Betriebsinfo per E-Mail bei neuer Meldung",
      "Kunden-SMS: Bestätigung + Foto-Upload-Link",
      "Persönliches Onboarding & Setup inklusive",
    ],
  },
  {
    id: "alltag" as const,
    name: "Alltag",
    price: "CHF 299",
    subtitle: "Telefonassistentin + Fallübersicht",
    highlighted: true,
    features: [
      "Alles aus Starter, plus:",
      "Digitale Telefonassistentin (24/7, konfigurierbar)",
      "Fallübersicht: alle Meldungen an einem Ort",
      "Bestätigungs-SMS + Foto-Upload (weniger Rückfragen)",
      "Mehrsprachig (DE / EN / FR / IT)",
    ],
  },
  {
    id: "wachstum" as const,
    name: "Wachstum",
    price: "CHF 399",
    subtitle: "Bewertungen & Priorität",
    features: [
      "Alles aus Alltag, plus:",
      "Google-Bewertungen gezielt anfragen",
      "Bewertungen zum richtigen Zeitpunkt auslösen",
      "Stärkeres Google-Profil — mehr Anfragen aus der Region",
      "Prioritäts-Support (schnellere Reaktion)",
    ],
  },
] as const;
