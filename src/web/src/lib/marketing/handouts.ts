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
    recommendationReason:
      "Viele Anrufe ausserhalb der Bürozeiten — die Telefonassistentin fängt diese ab und erstellt strukturierte Fälle.",
    demoWebsiteUrl: "https://flowsight.ch/doerfler-ag",
    wizardUrl: "https://flowsight.ch/doerfler-ag/meldung",
  },
};

export const PRODUCT = {
  name: "FlowSight",
  price: "CHF 299",
  subtitle: "Website, Telefonassistentin, Dashboard, SMS, Bewertungen — alles inklusive.",
  features: [
    "Moderne Website im Firmenlook (mobiloptimiert)",
    "Online-Schadenmeldung in 3 Schritten",
    "Digitale Telefonassistentin Lisa (24/7, mehrsprachig)",
    "Bestätigungs-SMS + Foto-Upload für Ihre Kunden",
    "Fallübersicht: alle Meldungen an einem Ort",
    "Google-Bewertungen gezielt anfragen",
    "Persönliches Onboarding & Setup inklusive",
  ],
} as const;
