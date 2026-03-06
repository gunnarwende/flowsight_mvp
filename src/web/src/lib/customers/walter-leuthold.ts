import type { CustomerSite } from "./types";

export const walterLeuthold: CustomerSite = {
  slug: "walter-leuthold",
  companyName: "Walter Leuthold Sanitäre Anlagen",
  tagline: "Ihr Sanitär & Spengler am linken Zürichseeufer — seit 2001",
  metaDescription:
    "Walter Leuthold — Sanitäre Anlagen und Spenglerei in Oberrieden. Badsanierung, Wasserenthärtung, Kupferdächer, Notdienst. Seit 2001 lokal verwurzelt am Zürichsee.",
  brandColor: "#203784",
  seoKeywords: [
    "Sanitär Oberrieden",
    "Spengler Oberrieden",
    "Badsanierung Zürichsee",
    "Wasserenthärtung Oberrieden",
    "Kupferdach Zürich Süd",
    "Notfall Sanitär Oberrieden",
    "Walter Leuthold",
  ],

  contact: {
    phone: "044 720 16 90",
    phoneRaw: "+41447201690",
    email: "info@Walter-Leuthold.ch",
    address: {
      street: "Alte Landstrasse 97",
      zip: "8942",
      city: "Oberrieden",
      canton: "ZH",
    },
    website: "walter-leuthold.ch",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Alte+Landstrasse+97,+8942+Oberrieden,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed",
    openingHours: [
      "Mo\u2013Fr: 07:00\u201312:00, 13:00\u201317:00",
      "Sa/So: Notdienst erreichbar",
    ],
  },

  emergency: {
    enabled: true,
    phone: "044 720 16 90",
    phoneRaw: "+41447201690",
    label: "24h Notdienst",
    description:
      "Rohrbruch, Verstopfung oder Wasserschaden? Wir sind rund um die Uhr erreichbar \u2014 auch an Wochenenden und Feiertagen.",
  },

  services: [
    {
      name: "Sanitäre Anlagen",
      slug: "sanitaer",
      icon: "bath",
      summary:
        "Komplette Badsanierungen, Neuinstallationen und Reparaturen \u2014 alles aus einer Hand.",
      description:
        "Von der Planung bis zur Ausführung: Wir erneuern Ihr Bad komplett, installieren Küchen und reparieren defekte Leitungen. Unsere Spezialität: Massgeschneiderte Lösungen für Ihre Wohnsituation.",
    },
    {
      name: "Wasserenthärtung",
      slug: "wasserenthaertung",
      icon: "water",
      summary:
        "Professionelle Wasserenthärtungsanlagen für weiches Wasser im ganzen Haus.",
      description:
        "Kalkflecken und verkalkte Geräte? Wir beraten und installieren moderne Enthärtungsanlagen von BWT und anderen Schweizer Marken \u2014 für sauberes, weiches Wasser.",
    },
    {
      name: "Spenglerei",
      slug: "spenglerei",
      icon: "roof",
      summary:
        "Kupferdächer, Metallfassaden, Dachrinnen und Blechverarbeitung nach Mass.",
      description:
        "Kupfer ist unser Werkstoff. Wir fertigen und montieren Kupferdächer, Fassadenverkleidungen, Dachrinnen und Abläufe \u2014 handwerklich präzise und langlebig. Auch Reparaturen an bestehenden Blechdächern.",
    },
    {
      name: "Reparaturservice",
      slug: "reparatur",
      icon: "wrench",
      summary:
        "Schnelle Hilfe bei tropfenden Hähnen, verstopften Abflüssen und Leitungsdefekten.",
      description:
        "Etwas kaputt? Wir kommen schnell und unkompliziert. Egal ob tropfender Wasserhahn, verstopfter Abfluss oder defekter Boiler \u2014 ein Anruf genügt.",
    },
  ],

  gallery: [],

  reviews: {
    averageRating: 4.9,
    totalReviews: 44,
    googleUrl:
      "https://www.google.com/maps/place/Walter+Leuthold+Sanit%C3%A4re+Anlagen",
    highlights: [
      {
        author: "Kundenstimme",
        rating: 5,
        text: "Zuverlässig, schnell und saubere Arbeit. Kann ich nur weiterempfehlen!",
      },
      {
        author: "Kundenstimme",
        rating: 5,
        text: "Kompetente Beratung und top Ausführung \u2014 vom Anruf bis zur Fertigstellung alles einwandfrei.",
      },
    ],
  },

  serviceArea: {
    region: "Linkes Zürichseeufer",
    radiusDescription:
      "Wir betreuen Privathaushalte und Liegenschaften am gesamten linken Zürichseeufer \u2014 von Kilchberg bis Wädenswil. Schnelle Anfahrt, lokale Verbundenheit.",
    gemeinden: [
      "Oberrieden",
      "Thalwil",
      "Horgen",
      "Kilchberg",
      "Rüschlikon",
      "Adliswil",
      "Langnau am Albis",
      "Wädenswil",
      "Au ZH",
    ],
  },

  team: [
    {
      name: "Walter Rolf Leuthold",
      role: "Inhaber / Sanitärinstallateur",
      bio: "Gründer und Inhaber seit 2001. Sanitärfachmann mit Leidenschaft für Qualitätsarbeit am Zürichsee.",
    },
  ],

  certifications: [
    {
      name: "suissetec-Mitglied",
      issuer: "Schweizerisch-Liechtensteinischer Gebäudetechnikverband",
    },
  ],

  history: [
    {
      year: 2001,
      title: "Gründung",
      description:
        "Walter Rolf Leuthold gründet seinen eigenen Sanitär- und Spenglereibetrieb in Oberrieden.",
    },
  ],
};
