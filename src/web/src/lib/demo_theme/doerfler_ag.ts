/**
 * Dörfler AG — Demo Theme (Phase A)
 *
 * Evidence labels:
 *   Verified  = confirmed from doerflerag.ch HTML
 *   Assumption = inferred, needs founder confirmation
 *   Demo      = placeholder for Phase A only
 */
export const theme = {
  // --- Identity (Verified: website) ---
  brandName: "Dörfler AG",
  location: "Oberrieden",

  // --- Colors (Assumption: Classic Premium per style_dna.md) ---
  primaryHex: "#1a2e44",
  accentHex: "#c8965a",
  lightBgHex: "#f8f7f4",

  // --- Logo (Demo: wordmark — logo file not extractable from old site) ---
  logoMode: "wordmark" as const,
  logoText: "Dörfler AG",

  // --- Contact (Verified: website footer + team page) ---
  phone: "043 443 52 00",
  phoneHref: "tel:+41434435200",
  email: "info@doerflerag.ch",
  address: "Hubstrasse 30, 8942 Oberrieden",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Hubstrasse+30+8942+Oberrieden",

  // --- History (Verified: firmengeschichte page) ---
  founded: 1926,
  generations: 3,
  leadership: "Ramon & Luzian Dörfler",

  // --- Services (Verified: angebot page) ---
  services: [
    {
      name: "Sanitär",
      desc: "Von Kleinreparaturen bis Komplettsanierung. Rohrbruch-Notfallreparatur und Leitungs-Neuanschluss.",
    },
    {
      name: "Heizung",
      desc: "Heizkörper- und Bodenheizungswartung. Ökologisch optimale System-Erneuerungen.",
    },
    {
      name: "Spenglerei",
      desc: "Dachentwässerung, Rinnen und Falzdach. Blitzschutzanlagen nach Vorschrift.",
    },
    {
      name: "Solartechnik",
      desc: "Installation und Service von Solaranlagen für Ihr Zuhause.",
    },
    {
      name: "Leitungsbau",
      desc: "Fachgerechte Rohr- und Leitungsinstallation für Neu- und Umbau.",
    },
    {
      name: "Reparaturservice",
      desc: "Schnelle und zuverlässige Reparaturen über alle Fachbereiche.",
    },
  ],

  // --- Proof (Verified: website) ---
  proofItems: [
    "Seit 1926",
    "3 Generationen",
    "Suissetec-Mitglied",
    "Sonn- & Feiertags erreichbar",
  ],

  // --- Partners (Verified: links page) ---
  partners: ["ELCO", "Zehnder", "Soltop", "Richner", "KWC", "Similor Kugler"],

  // --- Service Area (Assumption: derived from history + address) ---
  serviceArea: "Oberrieden & Bezirk Horgen",
} as const;

export type DoerflerTheme = typeof theme;
