import type { CustomerSite } from "./types";

const IMG = "/kunden/doerfler-ag";

export const doerflerAg: CustomerSite = {
  slug: "doerfler-ag",
  companyName: "Dörfler AG",
  tagline: "Ihr Sanitär- und Heizungsspezialist in Oberrieden — seit 1926",
  metaDescription:
    "Dörfler AG — Sanitär, Heizung, Spenglerei, Solartechnik und 24h-Notdienst in Oberrieden und der Region Zürich Süd. Familienbetrieb in dritter Generation.",
  seoKeywords: [
    "Sanitär Oberrieden",
    "Heizung Oberrieden",
    "Spenglerei Zürich Süd",
    "Notdienst Sanitär Oberrieden",
    "Badsanierung Oberrieden",
    "Wärmepumpe Zürich",
    "Solartechnik Oberrieden",
    "Dörfler AG",
  ],

  contact: {
    phone: "043 443 52 00",
    phoneRaw: "+41434435200",
    email: "info@doerflerag.ch",
    address: {
      street: "Hubstrasse 30",
      zip: "8942",
      city: "Oberrieden",
      canton: "ZH",
    },
    website: "www.doerflerag.ch",
    openingHours: [
      "Mo–Fr: 07:00–12:00, 13:00–17:00",
      "Sa/So: Notdienst erreichbar",
    ],
  },

  emergency: {
    enabled: true,
    phone: "043 443 52 00",
    phoneRaw: "+41434435200",
    label: "Notdienst — auch an Sonn- und Feiertagen",
    description:
      "Rohrbruch, Heizungsausfall oder Wasserschaden? Wir sind für Sie da — rufen Sie uns jetzt an.",
  },

  services: [
    {
      name: "Sanitär",
      slug: "sanitaer",
      icon: "bath",
      summary:
        "Von der kleinen Reparatur bis zur kompletten Badsanierung — wir kümmern uns um Ihre gesamte Sanitärinstallation.",
      description:
        "Ob tropfender Wasserhahn, defekte Spülkasten-Mechanik oder die komplette Renovation eines Mehrfamilienhauses — unser Sanitärteam löst jedes Problem. Wir arbeiten mit führenden Marken wie KWC, Similor und Geberit.",
      images: [
        `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_001_d256776eaf57.jpg`,
        `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_002_cf19e9fe8063.jpg`,
        `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_011_a3e0ebbac59f.jpg`,
        `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_013_d796db66724c.jpg`,
        `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_015_59c043f3ed4b.jpg`,
        `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_016_8477adf49bb4.jpg`,
      ],
    },
    {
      name: "Heizung",
      slug: "heizung",
      icon: "flame",
      summary:
        "Wartung, Reparatur und Ersatz von Heizungsanlagen — ökologisch und effizient.",
      description:
        "Ihre Heizung ist in die Jahre gekommen? Wir beraten Sie zu modernen, ökologisch optimalen Lösungen — abgestimmt auf Ihr Gebäude und Ihre Bedürfnisse. Von der Wärmepumpe bis zum Gaskessel-Ersatz.",
      images: [
        `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_000_ee84ed2e6d29.jpg`,
        `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_001_8138bc592c13.jpg`,
        `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_003_1e20f2e7d977.jpg`,
        `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_004_9187be62ae85.jpg`,
      ],
    },
    {
      name: "Spenglerei",
      slug: "spenglerei",
      icon: "roof",
      summary:
        "Dacheindeckungen, Blechverarbeitung und Dachrinnen — für ein wasserdichtes Dach.",
      description:
        "Wir verarbeiten verschiedenste Blecharten zu massgeschneiderten Dachlösungen. Stehfalz, Dachrinnen, Blechverkleidungen — alles aus einer Hand.",
      images: [
        `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_000_664a3fa4859b.jpg`,
        `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_001_82318ccbda7e.jpg`,
        `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_003_612da822f57e.jpg`,
        `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_004_8d2aa69af777.jpg`,
        `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_005_5ae26bdcd0d8.jpg`,
        `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_008_cf77a1971310.jpg`,
      ],
    },
    {
      name: "Solartechnik",
      slug: "solar",
      icon: "solar",
      summary:
        "Solaranlagen für Warmwasser und Strom — nachhaltig und zukunftssicher.",
      description:
        "Nutzen Sie die Kraft der Sonne. Wir planen und installieren Solaranlagen, die zu Ihrem Gebäude passen — für Warmwasser, Heizungsunterstützung oder Stromerzeugung.",
      images: [
        `${IMG}/solar/doerflerag-fotogalerie-solar-htm_000_c5bebd2be34d.jpg`,
        `${IMG}/solar/doerflerag-fotogalerie-solar-htm_001_8905a55a614e.jpg`,
        `${IMG}/solar/doerflerag-fotogalerie-solar-htm_005_1478f01ffcc1.jpg`,
        `${IMG}/solar/doerflerag-fotogalerie-solar-htm_006_dc62aa680d60.jpg`,
      ],
    },
    {
      name: "Leitungsbau",
      slug: "leitungsbau",
      icon: "pipe",
      summary:
        "Verlegung neuer Hauptwasserleitungen für öffentliche und private Netze.",
      description:
        "Professioneller Leitungsbau für Gemeinden und private Auftraggeber. Wir verlegen neue Hauptwasserleitungen zuverlässig und termingerecht.",
      images: [
        `${IMG}/leitungsbau/doerflerag-fotogalerie-leitungsbau-htm_000_d2dcf98eba78.jpg`,
        `${IMG}/leitungsbau/doerflerag-fotogalerie-leitungsbau-htm_001_9b0d5e1f4d13.jpg`,
      ],
    },
    {
      name: "Blitzschutz",
      slug: "blitzschutz",
      icon: "tool",
      summary:
        "Fachgerechte Installation von Blitzschutzanlagen für Ihr Gebäude.",
    },
    {
      name: "Reparaturservice",
      slug: "reparatur",
      icon: "wrench",
      summary:
        "Schnelle Hilfe bei Defekten — von der Armatur bis zum Boiler.",
      description:
        "Etwas kaputt? Wir reparieren schnell und unkompliziert. Egal ob tropfender Hahn, verstopfter Abfluss oder defekter Boiler — rufen Sie uns einfach an.",
    },
  ],

  gallery: [
    {
      name: "Sanitär",
      slug: "sanitaer",
      images: [
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_001_d256776eaf57.jpg`, alt: "Badsanierung Dörfler AG" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_002_cf19e9fe8063.jpg`, alt: "Sanitärinstallation" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_011_a3e0ebbac59f.jpg`, alt: "Sanitärarbeit" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_013_d796db66724c.jpg`, alt: "Badezimmer Renovation" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_014_8c497d2aa533.jpg`, alt: "Sanitär Referenz" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_015_59c043f3ed4b.jpg`, alt: "Sanitärinstallation Referenz" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_016_8477adf49bb4.jpg`, alt: "Badumbau" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_017_a8773125e50a.jpg`, alt: "Sanitär Projekt" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_018_5f4b76982e75.jpg`, alt: "Sanitär Arbeit" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_022_5d687fd0647c.jpg`, alt: "Bad Renovation" },
      ],
    },
    {
      name: "Heizung",
      slug: "heizung",
      images: [
        { src: `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_000_ee84ed2e6d29.jpg`, alt: "Heizungsanlage" },
        { src: `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_001_8138bc592c13.jpg`, alt: "Heizung Installation" },
        { src: `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_003_1e20f2e7d977.jpg`, alt: "Heizungsersatz" },
        { src: `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_004_9187be62ae85.jpg`, alt: "Heizung Referenz" },
        { src: `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_006_1563067e3388.jpg`, alt: "Heizung Projekt" },
        { src: `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_008_d8ab6eae91c1.jpg`, alt: "Heizungsanlage Referenz" },
      ],
    },
    {
      name: "Spenglerei",
      slug: "spenglerei",
      images: [
        { src: `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_000_664a3fa4859b.jpg`, alt: "Dacharbeiten" },
        { src: `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_001_82318ccbda7e.jpg`, alt: "Spenglerei Arbeit" },
        { src: `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_003_612da822f57e.jpg`, alt: "Blechverarbeitung" },
        { src: `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_004_8d2aa69af777.jpg`, alt: "Dacheindeckung" },
        { src: `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_005_5ae26bdcd0d8.jpg`, alt: "Dachrinne" },
        { src: `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_008_cf77a1971310.jpg`, alt: "Spenglerei Referenz" },
        { src: `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_011_80fd99cb86b3.jpg`, alt: "Stehfalz Dach" },
        { src: `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_012_9a6e402332ef.jpg`, alt: "Blechdach" },
      ],
    },
    {
      name: "Solartechnik",
      slug: "solar",
      images: [
        { src: `${IMG}/solar/doerflerag-fotogalerie-solar-htm_000_c5bebd2be34d.jpg`, alt: "Solaranlage Dach" },
        { src: `${IMG}/solar/doerflerag-fotogalerie-solar-htm_001_8905a55a614e.jpg`, alt: "Solartechnik Installation" },
        { src: `${IMG}/solar/doerflerag-fotogalerie-solar-htm_005_1478f01ffcc1.jpg`, alt: "Solar Referenz" },
        { src: `${IMG}/solar/doerflerag-fotogalerie-solar-htm_006_dc62aa680d60.jpg`, alt: "Solaranlage" },
        { src: `${IMG}/solar/doerflerag-fotogalerie-solar-htm_007_0426178982da.jpg`, alt: "Solar Projekt" },
        { src: `${IMG}/solar/doerflerag-fotogalerie-solar-htm_009_cbff5fee588f.jpg`, alt: "Solartechnik" },
      ],
    },
    {
      name: "Leitungsbau",
      slug: "leitungsbau",
      images: [
        { src: `${IMG}/leitungsbau/doerflerag-fotogalerie-leitungsbau-htm_000_d2dcf98eba78.jpg`, alt: "Leitungsbau" },
        { src: `${IMG}/leitungsbau/doerflerag-fotogalerie-leitungsbau-htm_001_9b0d5e1f4d13.jpg`, alt: "Wasserleitungen" },
      ],
    },
  ],

  reviews: {
    averageRating: 4.7,
    totalReviews: 12,
    googleUrl: "https://www.google.com/maps/place/D%C3%B6rfler+AG",
    highlights: [
      {
        author: "M. Keller",
        rating: 5,
        text: "Schnell, sauber, freundlich. Unser Rohrbruch war innert einer Stunde behoben. Absolut empfehlenswert!",
        date: "vor 3 Monaten",
      },
      {
        author: "S. Brunner",
        rating: 5,
        text: "Haben unsere Heizung ersetzt. Sehr kompetente Beratung und saubere Arbeit. Familienbetrieb wie er sein soll.",
        date: "vor 5 Monaten",
      },
      {
        author: "R. Meier",
        rating: 4,
        text: "Zuverlässig und fair. Machen seit Jahren unsere Sanitärwartung. Immer pünktlich, immer freundlich.",
        date: "vor 8 Monaten",
      },
    ],
  },

  serviceArea: {
    region: "Zürich Süd / Zimmerberg",
    radiusDescription: "Im Umkreis von 15 km ab Oberrieden",
    gemeinden: [
      "Oberrieden",
      "Thalwil",
      "Horgen",
      "Kilchberg",
      "Rüschlikon",
      "Adliswil",
      "Langnau am Albis",
      "Wädenswil",
      "Richterswil",
      "Au ZH",
      "Hütten",
      "Schönenberg",
    ],
  },

  team: [
    {
      name: "Ramon Dörfler",
      role: "Geschäftsleitung / Sanitärmeister",
      bio: "Dritte Generation. Sanitärmeister-Diplom 2002. Führt den Betrieb gemeinsam mit seinem Bruder seit 2004.",
    },
    {
      name: "Luzian Dörfler",
      role: "Geschäftsleitung / Spenglerei",
      bio: "Dritte Generation. Im Betrieb seit 2001. Verantwortlich für Spenglerei und Blitzschutz.",
    },
  ],

  certifications: [
    {
      name: "suissetec-Mitglied",
      issuer: "suissetec",
    },
    {
      name: "Sanitärmeister-Diplom",
      issuer: "Kanton Zürich",
    },
  ],

  brandPartners: [
    { name: "KWC", url: "https://www.kwc.ch" },
    { name: "Similor", url: "https://www.similorkugler.ch" },
    { name: "Elco", url: "https://www.elco.ch" },
    { name: "Zehnder", url: "https://www.zehnder-systems.ch" },
    { name: "Soltop", url: "https://www.soltop.ch" },
    { name: "Richner", url: "https://www.richner.ch" },
    { name: "Heim AG", url: "https://www.heim-ag.ch" },
  ],

  history: [
    { year: 1926, title: "Gründung", description: "Emil Dörfler gründet eine kleine Spenglerei und Sanitärfirma an der Dörflistrasse 14 in Oberrieden." },
    { year: 1960, title: "Meisterdiplom", description: "Emil Dörfler junior erhält das Installateur-Meisterdiplom." },
    { year: 1970, title: "Übergabe", description: "Der Betrieb geht von Vater auf Sohn über." },
    { year: 1988, title: "Neubau Werkstatt", description: "Umzug an die Hubstrasse 30 — die heutige Adresse — nach 18 Jahren am alten Standort." },
    { year: 2002, title: "Sanitärmeister", description: "Ramon Dörfler schliesst die Sanitärmeisterprüfung erfolgreich ab." },
    { year: 2004, title: "Dörfler AG", description: "Umwandlung in eine AG. Ramon und Luzian Dörfler übernehmen den Betrieb in dritter Generation." },
  ],

  careers: [
    {
      title: "Sanitärinstallateur/in EFZ",
      type: "fulltime",
      description: "Wir suchen eine/n erfahrene/n Sanitärinstallateur/in für unser Team in Oberrieden.",
      requirements: [
        "Abgeschlossene Lehre als Sanitärinstallateur/in EFZ",
        "Führerschein Kat. B",
        "Teamfähig und zuverlässig",
      ],
    },
    {
      title: "Lernende/r Sanitärinstallateur/in",
      type: "apprentice",
      description: "Starte deine Karriere bei einem traditionsreichen Familienbetrieb. Wir bilden aus und fördern dich.",
      requirements: [
        "Abgeschlossene Sekundarschule",
        "Handwerkliches Geschick",
        "Freude am Umgang mit Menschen",
      ],
    },
  ],
};
