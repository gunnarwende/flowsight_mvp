/**
 * Brunner Haustechnik AG — Demo Theme (v2 High-End)
 *
 * Fiktiver Demo-Tenant für Sales-Demos.
 * ICP: Sanitär-/Heizungsbetrieb, 5-15 MA, Kanton ZH, Familienbetrieb.
 */
export const theme = {
  // --- Identity ---
  brandName: "Brunner Haustechnik AG",
  location: "Thalwil",

  // --- Colors (high contrast) ---
  primaryHex: "#0f4c54",     // Dark teal — headings, nav (WCAG AA on white)
  accentHex: "#0d7377",      // Teal — CTAs on light bg only
  lightBgHex: "#f0fafa",     // Soft teal tint for alternating sections

  // --- Logo ---
  logoText: "Brunner Haustechnik",

  // --- Contact ---
  phone: "044 720 31 42",
  phoneHref: "tel:+41447203142",
  email: "info@brunner-haustechnik.ch",
  address: "Seestrasse 42, 8800 Thalwil",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Seestrasse+42+8800+Thalwil",

  // --- Trust signals ---
  founded: 2003,
  teamSize: "8 Mitarbeiter",
  proofItems: [
    "Seit 2003 in Thalwil",
    "8 Fachkräfte",
    "suissetec-Mitglied",
    "24h Notdienst",
    "4.8★ Google (52 Bewertungen)",
  ],

  // --- Services ---
  services: [
    {
      name: "Sanitär",
      desc: "Von der Armaturenmontage bis zur kompletten Badsanierung — wir decken das gesamte Sanitärspektrum ab.",
    },
    {
      name: "Heizung",
      desc: "Wartung, Reparatur und Ersatz von Heizungsanlagen — modern, effizient, ökologisch.",
    },
    {
      name: "Boiler & Warmwasser",
      desc: "Installation, Wartung und Notfall-Reparatur von Boilern und Warmwasserspeichern.",
    },
    {
      name: "Leitungsbau",
      desc: "Fachgerechte Rohr- und Leitungsinstallation für Neu- und Umbau.",
    },
    {
      name: "Reparaturservice",
      desc: "Schnelle Hilfe bei allen Defekten — tropfende Hähne, verstopfte Abflüsse, defekte Spülkästen.",
    },
  ],

  // --- Service Area ---
  serviceArea: "Linkes Zürichseeufer",
  gemeinden: [
    "Thalwil",
    "Horgen",
    "Oberrieden",
    "Kilchberg",
    "Adliswil",
    "Langnau am Albis",
    "Wädenswil",
  ],

  // --- Opening hours ---
  openingHours: ["Mo–Fr: 07:30–12:00, 13:00–17:00", "Sa/So: Notdienst erreichbar"],
} as const;

export type BrunnerTheme = typeof theme;
