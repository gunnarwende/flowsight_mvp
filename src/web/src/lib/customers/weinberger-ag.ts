import type { CustomerSite } from "./types";

const IMG = "/kunden/weinberger-ag";

export const weinbergerAg: CustomerSite = {
  slug: "weinberger-ag",
  companyName: "Jul. Weinberger AG",
  tagline: "Haustechnik mit Qualität — seit 1912 in Thalwil",
  metaDescription:
    "Jul. Weinberger AG — Sanitär, Heizung, Lüftung und Badsanierung in Thalwil. Traditionsunternehmen seit 1912 mit 24h-Notdienst und persönlichem Service.",
  brandColor: "#004994",
  seoKeywords: [
    "Sanitär Thalwil",
    "Heizung Thalwil",
    "Lüftung Thalwil",
    "Badsanierung Thalwil",
    "Notdienst Sanitär Thalwil",
    "Wärmepumpe Thalwil",
    "Haustechnik Zürichsee",
    "Jul. Weinberger AG",
  ],

  contact: {
    phone: "044 721 22 23",
    phoneRaw: "+41447212223",
    email: "info@julweinberger.ch",
    address: {
      street: "Zürcherstrasse 73",
      zip: "8800",
      city: "Thalwil",
      canton: "ZH",
    },
    website: "www.julweinberger.ch",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Z%C3%BCrcherstrasse+73,+8800+Thalwil,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed",
    openingHours: [
      "Mo–Fr: 07:00–17:00",
      "Sa/So: 24h-Notdienst erreichbar",
    ],
  },

  emergency: {
    enabled: true,
    phone: "044 721 22 23",
    phoneRaw: "+41447212223",
    label: "24h Notdienst",
    description:
      "Rohrbruch, Heizungsausfall oder Wasserschaden? Unser Pikett-Service ist rund um die Uhr für Sie da.",
  },

  services: [
    {
      name: "Sanitär",
      slug: "sanitaer",
      icon: "bath",
      summary:
        "Planung und Installation sämtlicher Sanitäranlagen — von der Küche bis zum Wellnessbad.",
      description:
        "Als Fachbetrieb für Sanitärinstallationen realisieren wir alle Anlagen von Badezimmern über Küchen bis zu Wellness-Einrichtungen. Ob Neubau oder Sanierung — wir planen, installieren und warten Ihre Sanitäranlagen mit höchster Präzision.",
      bullets: [
        "Neuinstallationen für Einfamilien- und Mehrfamilienhäuser",
        "Sanitäre Apparate und Armaturen",
        "Trinkwasserleitungen und Entwässerung",
        "Reparaturen und Unterhaltsarbeiten",
        "Beratung und Planung durch Fachpersonal",
      ],
      images: [
        `${IMG}/sanitaer/01.webp`,
        `${IMG}/sanitaer/02.webp`,
        `${IMG}/sanitaer/03.png`,
        `${IMG}/sanitaer/04.png`,
      ],
    },
    {
      name: "Heizung",
      slug: "heizung",
      icon: "flame",
      summary:
        "Heizsysteme für jeden Bedarf — von Wärmepumpen bis Fussbodenheizung.",
      description:
        "Wir planen, installieren und warten Heizungsanlagen aller Systeme und Grössen. Ob Wärmepumpe, Gas-, Öl- oder Holzheizung, Fussbodenheizung oder Wandheizung — wir finden die optimale Lösung für Ihr Gebäude und beraten Sie zu Alternativenergien.",
      bullets: [
        "Wärmepumpen und Erdsonden",
        "Gas-, Öl- und Holzheizungen",
        "Fussbodenheizung und Wandheizung",
        "Heizungsersatz und Modernisierung",
        "Wartung, Service und Reparaturen",
      ],
      images: [
        `${IMG}/heizung/01.jpeg`,
        `${IMG}/heizung/02.jpeg`,
        `${IMG}/heizung/03.jpeg`,
        `${IMG}/heizung/04.jpeg`,
      ],
    },
    {
      name: "Lüftung",
      slug: "lueftung",
      icon: "snowflake",
      summary:
        "Kontrollierte Wohnraumlüftung für gesundes Raumklima und Energieeffizienz.",
      description:
        "Moderne Gebäude brauchen kontrollierte Lüftung. Wir planen und installieren Wohnraumlüftungen, die für frische Luft sorgen, Feuchtigkeit regulieren und Energie sparen. Von der Beratung bis zur Inbetriebnahme — alles aus einer Hand.",
      bullets: [
        "Kontrollierte Wohnraumlüftung",
        "Komfortlüftung mit Wärmerückgewinnung",
        "Planung, Montage und Inbetriebnahme",
        "Filterservice und Wartung",
        "Beratung zu Minergie-Standards",
      ],
      images: [
        `${IMG}/lueftung/01.jpeg`,
        `${IMG}/lueftung/02.jpeg`,
        `${IMG}/lueftung/03.jpeg`,
      ],
    },
    {
      name: "Badsanierung",
      slug: "badsanierung",
      icon: "water",
      summary:
        "Komplette Badumbauten — von der Planung bis zur schlüsselfertigen Übergabe.",
      description:
        "Eine Badsanierung ist Vertrauenssache. Wir begleiten Sie von der ersten Idee über die Materialauswahl bis zur fertigen Umsetzung. Unsere Sanitärfachleute koordinieren alle Gewerke und sorgen für ein Ergebnis, das Sie begeistert.",
      bullets: [
        "Komplettumbauten und Teilrenovationen",
        "Beratung und 3D-Planung",
        "Koordination aller Handwerker",
        "Barrierefreie Badlösungen",
        "Hochwertige Materialien und Armaturen",
      ],
      images: [
        `${IMG}/badsanierung/01.jpeg`,
        `${IMG}/badsanierung/02.jpeg`,
        `${IMG}/badsanierung/03.jpeg`,
      ],
    },
    {
      name: "Kundendienst",
      slug: "kundendienst",
      icon: "wrench",
      summary:
        "Schnelle Hilfe bei Störungen und Defekten — 24 Stunden, 365 Tage.",
      description:
        "Unser Kundendienst ist rund um die Uhr erreichbar. Ob tropfender Wasserhahn, defekter Boiler oder Rohrbruch mitten in der Nacht — unser Pikett-Team ist schnell vor Ort und löst das Problem. Regelmässige Wartungen beugen Störungen vor.",
      bullets: [
        "24h-Pikett-Service für Notfälle",
        "Boiler-Wartung und Entkalkung",
        "Reparaturen an Sanitär- und Heizungsanlagen",
        "Leckortung und Sofortreparatur",
        "Regelmässige Wartungsverträge",
      ],
      images: [
        `${IMG}/kundendienst/01.webp`,
        `${IMG}/kundendienst/02.jpg`,
        `${IMG}/kundendienst/03.jpg`,
      ],
    },
  ],

  gallery: [
    {
      name: "Sanitär",
      slug: "sanitaer",
      images: [
        { src: `${IMG}/sanitaer/01.webp`, alt: "Rohrinstallation in der Werkstatt" },
        { src: `${IMG}/sanitaer/02.webp`, alt: "Sanitärtechniker bei Boiler-Installation" },
        { src: `${IMG}/sanitaer/03.png`, alt: "Modernes Badezimmer — Sanitärinstallation" },
        { src: `${IMG}/sanitaer/04.png`, alt: "Sanitäre Anlagen Neubau" },
      ],
    },
    {
      name: "Heizung",
      slug: "heizung",
      images: [
        { src: `${IMG}/heizung/01.jpeg`, alt: "Viessmann Wärmepumpen-Installation" },
        { src: `${IMG}/heizung/02.jpeg`, alt: "Heizungsanlage mit Weinberger-Signatur" },
        { src: `${IMG}/heizung/03.jpeg`, alt: "Stiebel Eltron Wärmepumpe" },
        { src: `${IMG}/heizung/04.jpeg`, alt: "Heizungsraum — Wärmepumpe und Speicher" },
      ],
    },
    {
      name: "Lüftung",
      slug: "lueftung",
      images: [
        { src: `${IMG}/lueftung/01.jpeg`, alt: "Technischer Raum — Lüftung und Heizung" },
        { src: `${IMG}/lueftung/02.jpeg`, alt: "Haustechnik-Zentrale mit Lüftungsrohren" },
        { src: `${IMG}/lueftung/03.jpeg`, alt: "Lüftungsinstallation Mehrfamilienhaus" },
      ],
    },
    {
      name: "Badsanierung",
      slug: "badsanierung",
      images: [
        { src: `${IMG}/badsanierung/01.jpeg`, alt: "Designer-Bad mit Naturstein-Waschtisch" },
        { src: `${IMG}/badsanierung/02.jpeg`, alt: "Modernes Bad — bodenebene Dusche" },
        { src: `${IMG}/badsanierung/03.jpeg`, alt: "Badsanierung Thalwil" },
      ],
    },
    {
      name: "Kundendienst",
      slug: "kundendienst",
      images: [
        { src: `${IMG}/kundendienst/01.webp`, alt: "Jul. Weinberger AG — Servicefahrzeug" },
        { src: `${IMG}/kundendienst/02.jpg`, alt: "Lehrling vor Firmenbanner" },
        { src: `${IMG}/kundendienst/03.jpg`, alt: "Referenzprojekt Mehrfamilienhaus" },
      ],
    },
  ],

  reviews: {
    averageRating: 4.4,
    totalReviews: 20,
    googleUrl:
      "https://www.google.com/maps/place/Jul.+Weinberger+AG",
    highlights: [],
  },

  serviceArea: {
    region: "Zürichsee / Zimmerberg",
    radiusDescription:
      "Seit über 110 Jahren betreuen wir Privathaushalte, Liegenschaften und Gewerbeobjekte in der Region Zimmerberg — mit schneller Anfahrt und lokaler Verbundenheit.",
    gemeinden: [
      "Thalwil",
      "Oberrieden",
      "Horgen",
      "Kilchberg",
      "Rüschlikon",
      "Adliswil",
      "Langnau am Albis",
      "Wädenswil",
      "Richterswil",
      "Au ZH",
    ],
  },

  team: [
    {
      name: "Christian Weinberger",
      role: "Geschäftsleitung",
    },
    {
      name: "Michael Fleischlin",
      role: "Projektleiter Sanitär",
    },
  ],

  certifications: [
    {
      name: "Qualifizierter Fachbetrieb",
      issuer: "Branchenverband",
    },
    {
      name: "Lehrbetrieb",
      issuer: "Kanton Zürich",
    },
  ],

  history: [
    {
      year: 1912,
      title: "Gründung",
      description:
        "Julius Weinberger gründet einen Haustechnikbetrieb in Thalwil.",
    },
    {
      year: 2007,
      title: "Kernkompetenz Sanitär",
      description:
        "Seit 2007 gehören Sanitärinstallationen zu den Kernkompetenzen — von Badezimmern über Küchen bis zu Wellness-Einrichtungen.",
    },
  ],

  careers: [
    {
      title: "Haustechnikpraktiker/in EBA",
      type: "apprentice",
      description:
        "Wir bilden junge Berufsleute aus und bieten Lehrstellen im Bereich Haustechnik.",
    },
    {
      title: "Sanitärinstallateur/in EFZ",
      type: "apprentice",
      description:
        "Lerne den Beruf des Sanitärinstallateurs in einem Traditionsunternehmen mit über 110 Jahren Erfahrung.",
    },
    {
      title: "Heizungsinstallateur/in EFZ",
      type: "apprentice",
      description:
        "Ausbildung zum Heizungsinstallateur bei einem der erfahrensten Betriebe am Zürichsee.",
    },
  ],
};
