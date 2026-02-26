import type { CustomerSite } from "./types";

const IMG = "/kunden/doerfler-ag";

export const doerflerAg: CustomerSite = {
  slug: "doerfler-ag",
  companyName: "Dörfler AG",
  tagline: "Ihr Sanitär- und Heizungsspezialist in Oberrieden — seit 1926",
  metaDescription:
    "Dörfler AG — Sanitär, Heizung, Spenglerei, Solartechnik und 24h-Notdienst in Oberrieden und der Region Zürich Süd. Familienbetrieb in dritter Generation.",
  brandColor: "#2b6cb0",
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
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Hubstrasse+30,+8942+Oberrieden,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed",
    openingHours: [
      "Mo–Fr: 07:00–12:00, 13:00–17:00",
      "Sa/So: Notdienst erreichbar",
    ],
  },

  emergency: {
    enabled: true,
    phone: "043 443 52 00",
    phoneRaw: "+41434435200",
    label: "Notfall",
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
        `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_000_b91dca3afef8.png`,
        `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_001_d256776eaf57.jpg`,
        `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_002_cf19e9fe8063.jpg`,
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

  // Only the sharpest, highest-quality images per category
  gallery: [
    {
      name: "Sanitär",
      slug: "sanitaer",
      images: [
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_000_b91dca3afef8.png`, alt: "Sanitärinstallation — Waschbecken und Armaturen" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_001_d256776eaf57.jpg`, alt: "Badezimmer Renovation" },
        { src: `${IMG}/sanitaer/doerflerag-fotogalerie-sanitaer-htm_002_cf19e9fe8063.jpg`, alt: "Sanitäranlagen Neubau" },
      ],
    },
    {
      name: "Heizung",
      slug: "heizung",
      images: [
        { src: `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_000_ee84ed2e6d29.jpg`, alt: "Heizungsanlage — Verteiler und Regelung" },
        { src: `${IMG}/heizung/doerflerag-fotogalerie-heizung-htm_001_8138bc592c13.jpg`, alt: "Heizungsinstallation" },
      ],
    },
    {
      name: "Spenglerei",
      slug: "spenglerei",
      images: [
        { src: `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_000_664a3fa4859b.jpg`, alt: "Dacharbeiten — Spenglerei" },
        { src: `${IMG}/spenglerei/doerflerag-fotogalerie-spenglerei-htm_001_82318ccbda7e.jpg`, alt: "Fassadenverkleidung" },
      ],
    },
    {
      name: "Solartechnik",
      slug: "solar",
      images: [
        { src: `${IMG}/solar/doerflerag-fotogalerie-solar-htm_000_c5bebd2be34d.jpg`, alt: "Solaranlage auf Dach" },
        { src: `${IMG}/solar/doerflerag-fotogalerie-solar-htm_001_8905a55a614e.jpg`, alt: "Solartechnik Installation" },
      ],
    },
    {
      name: "Leitungsbau",
      slug: "leitungsbau",
      images: [
        { src: `${IMG}/leitungsbau/doerflerag-fotogalerie-leitungsbau-htm_000_d2dcf98eba78.jpg`, alt: "Leitungsbau — Hauptwasserleitung" },
        { src: `${IMG}/leitungsbau/doerflerag-fotogalerie-leitungsbau-htm_001_9b0d5e1f4d13.jpg`, alt: "Wasserleitung Verlegung" },
      ],
    },
  ],

  // Real Google data: 4.7 stars, 3 Berichte — no fabricated quotes
  reviews: {
    averageRating: 4.7,
    totalReviews: 3,
    googleUrl:
      "https://www.google.com/maps/place/D%C3%B6rfler+AG/@47.2754,8.5834,17z",
    highlights: [],
  },

  serviceArea: {
    region: "Zürich Süd / Zimmerberg",
    radiusDescription:
      "Wir betreuen Privathaushalte, Liegenschaften und Gewerbeobjekte in der ganzen Region Zimmerberg — von Kilchberg bis Richterswil. Schnelle Anfahrt, lokale Verbundenheit.",
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
    {
      name: "Unser Fachteam",
      role: "Sanitärinstallateure & Lernende",
      bio: "Erfahrene Fachkräfte und motivierte Lernende — seit 2007 kontinuierlich gewachsen. Gemeinsam meistern wir jedes Projekt.",
    },
  ],

  certifications: [
    {
      name: "suissetec-Mitglied",
      issuer: "Schweizerisch-Liechtensteinischer Gebäudetechnikverband",
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
    { year: 2024, title: "Digitalisierung", description: "Einführung digitaler Auftragsabwicklung und moderner Kundenkommunikation — bereit für die nächsten 100 Jahre." },
  ],

  careers: [
    {
      title: "Sanitärinstallateur/in EFZ",
      type: "fulltime",
      description:
        "Zur Verstärkung unseres Teams suchen wir eine/n erfahrene/n Sanitärinstallateur/in. Du arbeitest eigenverantwortlich auf Baustellen in der Region Zürich Süd und betreust Projekte von der Badsanierung bis zur Neuinstallation.",
      requirements: [
        "Abgeschlossene Lehre als Sanitärinstallateur/in EFZ",
        "Mindestens 2 Jahre Berufserfahrung",
        "Führerschein Kat. B",
        "Teamfähig, zuverlässig und kundenorientiert",
        "Gute Deutschkenntnisse",
      ],
    },
    {
      title: "Lernende/r Sanitärinstallateur/in",
      type: "apprentice",
      description:
        "Starte deine Karriere bei einem traditionsreichen Familienbetrieb. Bei uns lernst du das Sanitärhandwerk von Grund auf — begleitet von erfahrenen Berufsleuten, die dich fördern und fordern.",
      requirements: [
        "Abgeschlossene Sekundarschule (Sek A oder B)",
        "Handwerkliches Geschick und räumliches Vorstellungsvermögen",
        "Freude am Umgang mit Menschen",
        "Bereitschaft, bei Wind und Wetter zu arbeiten",
        "Schnupperlehre absolviert (gerne bei uns)",
      ],
    },
  ],
};
