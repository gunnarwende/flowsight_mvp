import type { CustomerSite } from "./types";
import { FIXED_CATEGORIES } from "./categories";

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

  voicePhone: "044 505 74 20",
  voicePhoneRaw: "+41445057420",

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
        "Ob tropfender Wasserhahn, defekte Spülkasten-Mechanik oder die komplette Renovation eines Mehrfamilienhauses — unser Sanitärteam löst jedes Problem. Wir arbeiten mit führenden Marken wie KWC, Similor und Geberit und betreuen jedes Projekt persönlich von der Beratung bis zur Endabnahme.",
      bullets: [
        "Komplette Badsanierungen inkl. Trockenbau & Plattenleger-Koordination",
        "Neuinstallationen für Einfamilien- und Mehrfamilienhäuser",
        "Spülkasten-Reparaturen, Armaturen-Ersatz, Dichtungen",
        "Rohrbruch-Sofortreparatur — auch an Wochenenden",
        "Beratung zu hochwertigen Armaturen (KWC, Similor, Geberit)",
      ],
      images: [
        `${IMG}/sanitaer/01.avif`,
        `${IMG}/sanitaer/02.avif`,
        `${IMG}/sanitaer/03.avif`,
        `${IMG}/sanitaer/04.jpg`,
        `${IMG}/sanitaer/05.jpg`,
      ],
    },
    {
      name: "Heizung",
      slug: "heizung",
      icon: "flame",
      summary:
        "Wartung, Reparatur und Ersatz von Heizungsanlagen — ökologisch und effizient.",
      description:
        "Ihre Heizung ist in die Jahre gekommen? Wir beraten Sie zu modernen, ökologisch optimalen Lösungen — abgestimmt auf Ihr Gebäude und Ihre Bedürfnisse. Von der Wärmepumpe über Fussbodenheizung bis zum Gaskessel-Ersatz: Wir planen, installieren und warten Ihre Heizungsanlage.",
      bullets: [
        "Heizkörper- und Fussbodenheizung — Einbau & Wartung",
        "Wärmepumpen-Beratung und Installation",
        "Heizungsersatz: Gas, Öl, Wärmepumpe, Pellet",
        "Jährliche Wartung und Funktionskontrollen",
        "Notfall-Service bei Heizungsausfall",
      ],
      images: [
        `${IMG}/heizung/01.webp`,
        `${IMG}/heizung/02.jpg`,
        `${IMG}/heizung/03.jpg`,
        `${IMG}/heizung/04.webp`,
        `${IMG}/heizung/05.jpg`,
      ],
    },
    {
      name: "Spenglerei",
      slug: "spenglerei",
      icon: "roof",
      summary:
        "Dacheindeckungen, Blechverarbeitung und Dachrinnen — für ein wasserdichtes Dach.",
      description:
        "Wir verarbeiten verschiedenste Blecharten zu massgeschneiderten Dachlösungen. Stehfalz, Dachrinnen, Blechverkleidungen, Kaminabdeckungen — alles aus einer Hand. Ob Neubau, Sanierung oder Reparatur: Unser Spenglerteam arbeitet präzise und wetterfest.",
      bullets: [
        "Stehfalz- und Metalldach-Eindeckungen",
        "Dachrinnen, Fallrohre & Schneefangsysteme",
        "Kaminabdeckungen & Dachdurchführungen",
        "Fassadenverkleidungen aus Blech",
        "Reparaturen und Abdichtungen am Dach",
      ],
      images: [
        `${IMG}/spenglerei/11.jpg`,
        `${IMG}/spenglerei/12.jpg`,
        `${IMG}/spenglerei/13.webp`,
        `${IMG}/spenglerei/14.jpg`,
        `${IMG}/spenglerei/15.jpeg`,
      ],
    },
    {
      name: "Solartechnik",
      slug: "solar",
      icon: "solar",
      summary:
        "Solaranlagen für Warmwasser und Strom — nachhaltig und zukunftssicher.",
      description:
        "Nutzen Sie die Kraft der Sonne. Wir planen und installieren Solaranlagen, die zu Ihrem Gebäude passen — für Warmwasser, Heizungsunterstützung oder Stromerzeugung. Von der Erstberatung über die Montage bis zur Inbetriebnahme betreuen wir Ihr Projekt komplett.",
      bullets: [
        "Solarthermie für Warmwasser & Heizungsunterstützung",
        "Photovoltaik-Anlagen zur Stromerzeugung",
        "Planung, Montage und Inbetriebnahme",
        "Kombination mit bestehender Heizungsanlage",
        "Beratung zu Förderbeiträgen und Wirtschaftlichkeit",
      ],
      images: [
        `${IMG}/solar/01.png`,
        `${IMG}/solar/02.png`,
        `${IMG}/solar/03.png`,
        `${IMG}/solar/04.png`,
        `${IMG}/solar/05.png`,
      ],
    },
    {
      name: "Blitzschutz",
      slug: "blitzschutz",
      icon: "tool",
      summary:
        "Fachgerechte Installation von Blitzschutzanlagen für Ihr Gebäude.",
      description:
        "Blitzschutz schützt Ihr Gebäude, Ihre Elektroinstallationen und Ihre Familie. Wir installieren normgerechte Blitzschutzanlagen — vom Auffangsystem auf dem Dach über die Ableitungen bis zur Erdung. Regelmässige Prüfungen sichern die dauerhafte Funktion.",
      bullets: [
        "Äusserer Blitzschutz: Auffangstangen, Fangseile, Ableitung",
        "Erdungsanlagen nach SN-Norm",
        "Blitzschutzprüfung und Revisionen",
        "Nachrüstung bestehender Gebäude",
        "Beratung zu Überspannungsschutz",
      ],
      images: [
        `${IMG}/blitzschutz/01.png`,
        `${IMG}/blitzschutz/02.png`,
        `${IMG}/blitzschutz/03.png`,
        `${IMG}/blitzschutz/04.png`,
      ],
    },
    {
      name: "Reparaturservice",
      slug: "reparatur",
      icon: "wrench",
      summary:
        "Schnelle Hilfe bei Defekten — von der Armatur bis zum Boiler.",
      description:
        "Etwas kaputt? Wir reparieren schnell und unkompliziert. Egal ob tropfender Hahn, verstopfter Abfluss oder defekter Boiler — rufen Sie uns einfach an. Auch an Sonn- und Feiertagen sind wir über unsere Telefonnummer erreichbar.",
      bullets: [
        "Armaturenreparatur und -ersatz",
        "Verstopfungen lösen (Abfluss, WC, Leitung)",
        "Boiler-Reparatur und Entkalkung",
        "Ventile, Dichtungen, Filterpatronen",
        "Notfall-Reparaturen — auch am Wochenende",
      ],
      images: [
        `${IMG}/reparatur/01.png`,
        `${IMG}/reparatur/02.png`,
        `${IMG}/reparatur/03.png`,
        `${IMG}/reparatur/04.png`,
        `${IMG}/reparatur/05.png`,
      ],
    },
  ],

  gallery: [
    {
      name: "Sanitär",
      slug: "sanitaer",
      images: [
        { src: `${IMG}/sanitaer/01.avif`, alt: "Moderne Sanitärinstallation" },
        { src: `${IMG}/sanitaer/02.avif`, alt: "Badsanierung — Qualitätsarbeit" },
        { src: `${IMG}/sanitaer/03.avif`, alt: "Badezimmer Renovation" },
        { src: `${IMG}/sanitaer/04.jpg`, alt: "Sanitäranlagen Neubau" },
        { src: `${IMG}/sanitaer/05.jpg`, alt: "Armaturen und Installationen" },
      ],
    },
    {
      name: "Heizung",
      slug: "heizung",
      images: [
        { src: `${IMG}/heizung/01.webp`, alt: "Heizungsanlage — moderne Installation" },
        { src: `${IMG}/heizung/02.jpg`, alt: "Heizungsverteiler und Regelung" },
        { src: `${IMG}/heizung/03.jpg`, alt: "Heizungsinstallation Neubau" },
        { src: `${IMG}/heizung/04.webp`, alt: "Wärmepumpe" },
        { src: `${IMG}/heizung/05.jpg`, alt: "Heizungswartung" },
      ],
    },
    {
      name: "Spenglerei",
      slug: "spenglerei",
      images: [
        { src: `${IMG}/spenglerei/11.jpg`, alt: "Dacharbeiten — Spenglerei" },
        { src: `${IMG}/spenglerei/12.jpg`, alt: "Dachrinne und Fallrohr" },
        { src: `${IMG}/spenglerei/13.webp`, alt: "Metalldach-Detailarbeit" },
        { src: `${IMG}/spenglerei/14.jpg`, alt: "Kaminabdeckung" },
        { src: `${IMG}/spenglerei/15.jpeg`, alt: "Dachabschluss mit Blech" },
      ],
    },
    {
      name: "Solartechnik",
      slug: "solar",
      images: [
        { src: `${IMG}/solar/01.png`, alt: "Solaranlage auf Dach" },
        { src: `${IMG}/solar/02.png`, alt: "Solartechnik Installation" },
        { src: `${IMG}/solar/03.png`, alt: "Photovoltaik-Anlage" },
        { src: `${IMG}/solar/04.png`, alt: "Solarpanel Montage" },
        { src: `${IMG}/solar/05.png`, alt: "Solaranlage Komplettsystem" },
      ],
    },
    {
      name: "Blitzschutz",
      slug: "blitzschutz",
      images: [
        { src: `${IMG}/blitzschutz/01.png`, alt: "Blitzschutzanlage auf Dach" },
        { src: `${IMG}/blitzschutz/02.png`, alt: "Blitzableiter Installation" },
        { src: `${IMG}/blitzschutz/03.png`, alt: "Erdungsanlage" },
        { src: `${IMG}/blitzschutz/04.png`, alt: "Blitzschutz-Revision" },
      ],
    },
    {
      name: "Reparaturservice",
      slug: "reparatur",
      images: [
        { src: `${IMG}/reparatur/01.png`, alt: "Sanitär-Reparatur" },
        { src: `${IMG}/reparatur/02.png`, alt: "Armaturenwechsel" },
        { src: `${IMG}/reparatur/03.png`, alt: "Rohrreparatur" },
        { src: `${IMG}/reparatur/04.png`, alt: "Boiler-Wartung" },
        { src: `${IMG}/reparatur/05.png`, alt: "Notfall-Reparatur" },
      ],
    },
  ],

  // Real Google data: 4.7 stars, 3 reviews (Erik 4★ ohne Text)
  reviews: {
    averageRating: 4.7,
    totalReviews: 3,
    googleUrl:
      "https://www.google.com/maps/place/D%C3%B6rfler+AG/@47.2754,8.5834,17z",
    highlights: [
      {
        author: "Martin B.",
        rating: 5,
        text: "Kompetenter Sanitär-Handwerke bei extrem gutem Service. Hat das Problem schnell lokalisiert, behoben und den Arbeitsplatz wieder sauber verlassen. Danke!",
        date: "vor 2 Jahren",
      },
      {
        author: "Markus Widmer",
        rating: 5,
        text: "Top Zusammenarbeit, motiviertes und sehr erfahrenes Team. Lösungsorientiert und sehr gute Qualität.",
        date: "vor 2 Jahren",
      },
    ],
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
    { name: "KWC", url: "https://www.kwc.com" },
    { name: "Similor", url: "https://www.similor.ch" },
    { name: "Elco", url: "https://www.elco.ch" },
    { name: "Zehnder", url: "https://www.zehnder-systems.ch" },
    { name: "Soltop", url: "https://www.soltop.ch" },
    { name: "Richner", url: "https://www.richner.ch" },
    { name: "Heim AG", url: "https://www.heim-ag.ch" },
  ],

  // Categories: values match voice agent (doerfler_agent.json)
  // Voice: Verstopfung, Leck, Heizung, Boiler, Rohrbruch, Sanitär allgemein
  categories: [
    { value: "Verstopfung", label: "Verstopfung", hint: "Abfluss, WC, Leitung", iconKey: "drain" },
    { value: "Leck", label: "Leck", hint: "Tropft, feucht, Wasserschaden", iconKey: "drop" },
    { value: "Heizung", label: "Heizung", hint: "Kalt, keine Wärme, Störung", iconKey: "flame" },
    ...FIXED_CATEGORIES,
  ],

  history: [
    { year: 1926, title: "Gründung", description: "Emil Dörfler gründet eine kleine Spenglerei und Sanitärfirma an der Dörflistrasse 14 in Oberrieden." },
    { year: 1960, title: "Meisterdiplom", description: "Emil Dörfler junior erhält das Diplom der höheren Fachprüfung als Spengler." },
    { year: 1964, title: "Sanitärmeister", description: "Emil Dörfler junior schliesst die Sanitärmeisterprüfung ab und bereitet die Betriebsübernahme vor." },
    { year: 1970, title: "Übergabe", description: "Der Betrieb geht von Vater auf Sohn über — Emil junior führt die Firma weiter." },
    { year: 1988, title: "Neubau Werkstatt", description: "Umzug an die Hubstrasse 30 — die heutige Adresse — nach über 60 Jahren am alten Standort." },
    { year: 1996, title: "Lehrabschluss Ramon", description: "Ramon Dörfler schliesst seine Lehre als Sanitärinstallateur erfolgreich ab." },
    { year: 1999, title: "Ramon im Betrieb", description: "Ramon tritt in den Familienbetrieb ein und unterstützt seinen Vater." },
    { year: 2001, title: "Luzian im Betrieb", description: "Luzian Dörfler schliesst seine Ausbildung ab und tritt ebenfalls in die Firma ein." },
    { year: 2002, title: "Sanitärmeister Ramon", description: "Ramon Dörfler schliesst die Sanitärmeisterprüfung erfolgreich ab." },
    { year: 2004, title: "Dörfler AG", description: "Umwandlung in eine AG per 1. April. Ramon und Luzian Dörfler übernehmen den Betrieb in dritter Generation." },
    { year: 2007, title: "Wachstum", description: "Einstellung eines zusätzlichen Sanitärinstallateurs — die Auftragslage wächst stetig." },
  ],

  theme: {
    profile: "tradition",
    heroStyle: "split",
    colorMode: "warm",
    fontFamily: "source-serif",
    sectionOrder: ["history", "services", "reviews", "team", "serviceArea", "trust", "contact"],
  },
};
