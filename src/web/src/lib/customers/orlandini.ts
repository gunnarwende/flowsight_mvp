import type { CustomerSite } from "./types";

export const orlandini: CustomerSite = {
  slug: "orlandini",
  companyName: "Orlandini Sanitär Heizung GmbH",
  tagline: "Ihr Sanitär- und Heizungsspezialist in Horgen — seit 1972",
  metaDescription:
    "Orlandini Sanitär Heizung GmbH — Familienbetrieb seit 1972 in Horgen. Sanitär, Heizung, Beratung, Reparatur und Wartung. Zuverlässig, persönlich, regional.",
  brandColor: "#1a5276",
  seoKeywords: [
    "Sanitär Horgen",
    "Heizung Horgen",
    "Wärmepumpe Horgen",
    "Badsanierung Horgen",
    "Sanitär Notdienst Horgen",
    "Orlandini Sanitär",
    "Heizung Zürichsee",
  ],

  contact: {
    phone: "044 725 41 44",
    phoneRaw: "+41447254144",
    email: "info@orlandini.ch",
    address: {
      street: "Zugerstrasse 22",
      zip: "8810",
      city: "Horgen",
      canton: "ZH",
    },
    website: "www.orlandini.ch",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Zugerstrasse+22,+8810+Horgen,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed",
    openingHours: [
      "Mo\u2013Fr: 07:30\u201312:00, 13:00\u201317:00",
    ],
  },

  emergency: {
    enabled: true,
    phone: "044 725 41 44",
    phoneRaw: "+41447254144",
    label: "Notfall",
    description:
      "Rohrbruch, Heizungsausfall oder Wasserschaden? Rufen Sie uns an \u2014 wir helfen schnell und unkompliziert.",
  },

  services: [
    {
      name: "Sanitäre Installationen",
      slug: "sanitaer",
      icon: "bath",
      summary:
        "Trinkwasser, Abwasser, Gas und Druckluftinstallationen \u2014 komplett aus einer Hand.",
      description:
        "Von der Neuinstallation bis zur Sanierung: Wir planen und realisieren sämtliche Sanitäranlagen \u2014 Trinkwasserleitungen, Abwassersysteme, Gasinstallationen und Druckluftleitungen. Fachgerecht und nach aktuellen Normen.",
    },
    {
      name: "Heizungstechnik",
      slug: "heizung",
      icon: "flame",
      summary:
        "Gas, Öl, Wärmepumpen, Fussbodenheizung und Solaranlagen \u2014 für wohlige Wärme.",
      description:
        "Ob Gasheizung, Ölkessel, Wärmepumpe oder Fussbodenheizung \u2014 wir beraten, planen und installieren die passende Heizlösung für Ihr Gebäude. Auch Solaranlagen zur Heizungsunterstützung gehören zu unserem Angebot.",
    },
    {
      name: "Beratung & Planung",
      slug: "beratung",
      icon: "tool",
      summary:
        "Persönliche Fachberatung für Ihre Sanitär- und Heizungsprojekte.",
      description:
        "Ob Neubau, Umbau oder Sanierung \u2014 wir beraten Sie umfassend und erstellen massgeschneiderte Konzepte. Profitieren Sie von über 50 Jahren Erfahrung im Familienbetrieb.",
    },
    {
      name: "Reparatur & Wartung",
      slug: "reparatur",
      icon: "wrench",
      summary:
        "Schnelle Hilfe bei Defekten und regelmässige Wartung Ihrer Anlagen.",
      description:
        "Tropfender Hahn, verstopfter Abfluss oder Heizungsstörung? Wir kommen schnell und erledigen die Reparatur fachgerecht. Auch regelmässige Wartung für Heizung und Sanitäranlagen.",
    },
  ],

  gallery: [],

  reviews: {
    averageRating: 3.8,
    totalReviews: 28,
    googleUrl:
      "https://www.google.com/maps/place/Orlandini+Sanit%C3%A4r+Heizung+GmbH",
    highlights: [
      {
        author: "Kundenstimme",
        rating: 5,
        text: "Sehr kompetent und freundlich. Schnelle Terminvergabe und saubere Arbeit.",
      },
      {
        author: "Kundenstimme",
        rating: 5,
        text: "Familiäre Atmosphäre und professionelle Ausführung \u2014 so stellt man sich einen lokalen Handwerker vor.",
      },
    ],
  },

  serviceArea: {
    region: "Horgen & Umgebung",
    radiusDescription:
      "Wir betreuen Kunden in Horgen und der gesamten Region am linken Zürichseeufer \u2014 persönlich und zuverlässig seit über 50 Jahren.",
    gemeinden: [
      "Horgen",
      "Oberrieden",
      "Thalwil",
      "Wädenswil",
      "Kilchberg",
      "Rüschlikon",
      "Adliswil",
      "Au ZH",
      "Richterswil",
    ],
  },

  team: [
    {
      name: "Anastasia Orlandini",
      role: "Geschäftsführerin",
      bio: "Zweite Generation. Führt den Familienbetrieb mit Leidenschaft und persönlichem Engagement weiter.",
    },
    {
      name: "Marco Orlandini",
      role: "Betriebsleitung",
      bio: "Verantwortlich für den operativen Betrieb und die Projektabwicklung.",
    },
  ],

  history: [
    {
      year: 1972,
      title: "Gründung",
      description:
        "Die Familie Orlandini gründet einen Sanitär- und Heizungsbetrieb in Horgen.",
    },
    {
      year: 2000,
      title: "Zweite Generation",
      description:
        "Anastasia Orlandini übernimmt die Geschäftsführung und führt den Betrieb als Familien-GmbH weiter.",
    },
  ],
};
