import type { CustomerSite } from "./types";

export const widmerSanitaer: CustomerSite = {
  slug: "widmer-sanitaer",
  companyName: "Widmer H. & Co. AG",
  tagline: "Sanitär, Heizung, Spenglerei & Blitzschutz in Horgen — seit 1974",
  metaDescription:
    "Widmer H. & Co. AG — Ihr Fachbetrieb für Sanitär, Heizung, Spenglerei, Blitzschutz und Erdsonden in Horgen. Familienbetrieb seit 1974.",
  brandColor: "#2d5f2d",
  seoKeywords: [
    "Sanitär Horgen",
    "Heizung Horgen",
    "Spenglerei Horgen",
    "Blitzschutz Zürichsee",
    "Erdsonden Horgen",
    "Widmer Sanitär Horgen",
  ],

  contact: {
    phone: "044 725 47 00",
    phoneRaw: "+41447254700",
    email: "widmer@widmer-sanitaer.ch",
    address: {
      street: "Einsiedlerstrasse 29",
      zip: "8810",
      city: "Horgen",
      canton: "ZH",
    },
    website: "www.widmer-sanitaer.ch",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Einsiedlerstrasse+29,+8810+Horgen,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed",
    openingHours: [
      "Mo\u2013Fr: 07:00\u201312:00, 13:00\u201317:00",
    ],
  },

  emergency: {
    enabled: true,
    phone: "044 725 47 00",
    phoneRaw: "+41447254700",
    label: "Notfall",
    description:
      "Rohrbruch, Heizungsausfall oder Wasserschaden? Rufen Sie uns an \u2014 wir sind für Sie da.",
  },

  services: [
    {
      name: "Sanitäre Anlagen",
      slug: "sanitaer",
      icon: "bath",
      summary:
        "Neuinstallationen, Badsanierungen und Reparaturen \u2014 fachgerecht und zuverlässig.",
      description:
        "Vom tropfenden Wasserhahn bis zur kompletten Badsanierung: Wir kümmern uns um Ihre gesamte Sanitärinstallation. Planung, Ausführung und Service aus einer Hand.",
    },
    {
      name: "Heizungstechnik",
      slug: "heizung",
      icon: "flame",
      summary:
        "Moderne Heizsysteme für Ihr Zuhause \u2014 effizient und umweltbewusst.",
      description:
        "Ob Wärmepumpe, Gasheizung oder Heizungssanierung \u2014 wir beraten und installieren die optimale Lösung für Ihr Gebäude.",
    },
    {
      name: "Spenglerei",
      slug: "spenglerei",
      icon: "roof",
      summary:
        "Dacheindeckungen, Blechverarbeitung und Fassaden \u2014 für ein dicht geschütztes Gebäude.",
      description:
        "Wir fertigen und montieren Blechdächer, Dachrinnen, Fassadenverkleidungen und Spenglerarbeiten aller Art. Handwerklich sauber und langlebig.",
    },
    {
      name: "Blitzschutz",
      slug: "blitzschutz",
      icon: "tool",
      summary:
        "Fachgerechte Blitzschutzanlagen zum Schutz Ihrer Liegenschaft.",
      description:
        "Wir planen und installieren normgerechte Blitzschutzanlagen \u2014 für Wohn- und Gewerbegebäude. Inklusive Prüfung und Wartung.",
    },
    {
      name: "Erdsonden",
      slug: "erdsonden",
      icon: "leaf",
      summary:
        "Erdwärmesonden für nachhaltige Heizsysteme mit Wärmepumpen.",
      description:
        "Nutzen Sie die Wärme aus der Erde. Wir realisieren Erdsonden-Bohrungen als Basis für effiziente Wärmepumpenanlagen \u2014 nachhaltig und zukunftssicher.",
    },
  ],

  gallery: [],

  reviews: {
    averageRating: 5.0,
    totalReviews: 1,
    googleUrl:
      "https://www.google.com/maps/place/Widmer+H.+%26+Co.+AG",
    highlights: [],
  },

  serviceArea: {
    region: "Horgen & Umgebung",
    radiusDescription:
      "Wir betreuen Kunden in Horgen und der gesamten linken Zürichseeregion. Kurze Wege, schnelle Hilfe.",
    gemeinden: [
      "Horgen",
      "Oberrieden",
      "Thalwil",
      "Wädenswil",
      "Kilchberg",
      "Rüschlikon",
      "Adliswil",
      "Richterswil",
    ],
  },

  team: [
    {
      name: "Michael Widmer",
      role: "Geschäftsführer",
      bio: "Führt den Familienbetrieb in Horgen mit technischem Know-how und persönlichem Engagement.",
    },
    {
      name: "Brigitte Widmer",
      role: "Administration",
      bio: "Verantwortlich für Büro, Offerten und Kundenbetreuung.",
    },
  ],

  history: [
    {
      year: 1974,
      title: "Gründung",
      description:
        "Die Familie Widmer gründet einen Sanitär- und Heizungsbetrieb in Horgen.",
    },
  ],
};
