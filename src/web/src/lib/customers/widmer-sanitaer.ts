import type { CustomerSite } from "./types";

const IMG = "/kunden/widmer-sanitaer";

export const widmerSanitaer: CustomerSite = {
  slug: "widmer-sanitaer",
  companyName: "Widmer & Co. AG",
  tagline: "Sanitär, Heizung, Spenglerei & Blitzschutz in Horgen — seit 1898",
  metaDescription:
    "Widmer & Co. AG — Ihr Fachbetrieb für Sanitär, Heizung, Spenglerei und Blitzschutz in Horgen. Familienbetrieb seit 1898. Über 125 Jahre Erfahrung am Zürichsee.",
  brandColor: "#1a4b8c",
  seoKeywords: [
    "Sanitär Horgen",
    "Heizung Horgen",
    "Spenglerei Horgen",
    "Blitzschutz Zürichsee",
    "Widmer & Co. Sanitär Horgen",
    "Sanitär seit 1898",
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

  /* Kein Notdienst auf alter Website → kein Notfall-Button, stattdessen "Anrufen" in Nav */

  services: [
    {
      name: "Sanitäre Anlagen",
      slug: "sanitaer",
      icon: "bath",
      summary:
        "Neuinstallationen, Badsanierungen und Reparaturen \u2014 seit über 125 Jahren fachgerecht und zuverlässig.",
      description:
        "Vom tropfenden Wasserhahn bis zur kompletten Badsanierung: Wir kümmern uns um Ihre gesamte Sanitärinstallation. Planung, Ausführung und Service aus einer Hand \u2014 mit der Erfahrung von über 125 Jahren Handwerkstradition am Zürichsee. Jedes Projekt wird persönlich betreut, von der Beratung bis zur Endabnahme.",
      bullets: [
        "Komplette Badsanierungen inkl. Planung und Koordination",
        "Neuinstallationen für Trinkwasser und Abwasser",
        "Kücheninstallationen und Nasszellen",
        "Reparaturen an Armaturen, Ventilen und Leitungen",
        "Persönliche Betreuung \u2014 Tradition seit 1898",
      ],
    },
    {
      name: "Blitzschutz",
      slug: "blitzschutz",
      icon: "tool",
      summary:
        "Fachgerechte Blitzschutzanlagen zum Schutz Ihrer Liegenschaft \u2014 normgerecht und zuverlässig.",
      description:
        "Ein professioneller Blitzschutz schützt Ihr Gebäude, Ihre Technik und Ihre Familie. Wir planen, installieren und warten normgerechte Blitzschutzanlagen für Wohn- und Gewerbegebäude \u2014 von der Fangeinrichtung auf dem Dach bis zur Erdung. Als einer der wenigen Betriebe in der Region bieten wir dieses Spezialgebiet aus einer Hand.",
      bullets: [
        "Planung und Installation nach aktuellen SN-Normen",
        "Äusserer Blitzschutz: Fangeinrichtungen und Ableitungen",
        "Erdungsanlagen und Potentialausgleich",
        "Periodische Prüfung und Wartung bestehender Anlagen",
        "Blitzschutz für Wohn-, Gewerbe- und Industriegebäude",
      ],
    },
    {
      name: "Spenglerei",
      slug: "spenglerei",
      icon: "tool",
      summary:
        "Fachgerechte Spenglerarbeiten für Dach und Fassade \u2014 Flachdach, Blechverkleidungen und Kamineinfassungen.",
      description:
        "Ob Flachdachabdichtung, Blechverkleidung oder Kamineinfassung: Unsere Spengler arbeiten präzise und wetterfest. Wir verbinden traditionelles Handwerk mit modernen Materialien \u2014 für langlebige Lösungen, die Ihr Gebäude dauerhaft schützen. Von der Rinne bis zur Fassadenverkleidung aus einer Hand.",
      bullets: [
        "Flachdachabdichtungen und Blecheindeckungen",
        "Dachrinnen, Fallrohre und Entwässerungssysteme",
        "Kamineinfassungen und Dachdurchführungen",
        "Fassadenverkleidungen aus Metall",
        "Reparaturen und Sanierungen an bestehenden Blecharbeiten",
      ],
    },
    {
      name: "Beratung & Planung",
      slug: "beratung_planung",
      icon: "pipe",
      summary:
        "Persönliche Fachberatung mit über 125 Jahren Erfahrung \u2014 für jedes Projekt die richtige Lösung.",
      description:
        "Ob Neubau, Umbau oder Sanierung \u2014 wir beraten Sie umfassend und erstellen massgeschneiderte Konzepte. Was 1898 mit solider Handwerkskunst begann, verbinden wir heute mit modernen Planungsmethoden. Profitieren Sie von einem Betrieb, der Generationen an Wissen vereint.",
      bullets: [
        "Persönliche Beratung vor Ort durch erfahrene Fachleute",
        "Massgeschneiderte Konzepte für Neubau und Sanierung",
        "Koordination aller beteiligten Gewerke",
        "Kostentransparenz mit verbindlichen Offerten",
        "Ganzheitliche Planung: Sanitär, Heizung, Spenglerei und Blitzschutz",
      ],
    },
    {
      name: "Reparaturen & Wartung",
      slug: "reparaturen-wartung",
      icon: "wrench",
      summary:
        "Schnelle Hilfe bei Defekten und regelmässige Wartung \u2014 damit Ihre Anlagen zuverlässig laufen.",
      description:
        "Tropfender Hahn, verstopfter Abfluss oder Heizungsstörung? Wir kommen schnell und erledigen die Reparatur fachgerecht. Dazu bieten wir Wartungsverträge mit regelmässigen Funktionskontrollen \u2014 so erkennen wir Verschleiss frühzeitig und verhindern teure Folgeschäden.",
      bullets: [
        "Schnelle Einsätze bei Rohrbrüchen und Wasserschäden",
        "Reparatur von Armaturen, Ventilen und Dichtungen",
        "Heizungswartung und Brennerservice",
        "Boilerentkalkung und Warmwasser-Checks",
        "Wartungsverträge mit protokollierten Intervallen",
      ],
    },
  ],

  gallery: [
    {
      name: "Sanitär",
      slug: "sanitaer",
      images: [
        { src: `${IMG}/sanitaer/01.avif`, alt: "Moderne Sanitärinstallation" },
        { src: `${IMG}/sanitaer/02.avif`, alt: "Badezimmer-Neuinstallation" },
        { src: `${IMG}/sanitaer/03.avif`, alt: "Sanitäre Anlage" },
        { src: `${IMG}/sanitaer/04.jpg`, alt: "Badsanierung" },
        { src: `${IMG}/sanitaer/05.jpg`, alt: "Installationsarbeit" },
      ],
    },
    {
      name: "Blitzschutz",
      slug: "blitzschutz",
      images: [
        { src: `${IMG}/blitzschutz/01.png`, alt: "Blitzschutzanlage auf dem Dach" },
        { src: `${IMG}/blitzschutz/02.png`, alt: "Fangeinrichtung" },
        { src: `${IMG}/blitzschutz/03.png`, alt: "Ableitung und Erdung" },
        { src: `${IMG}/blitzschutz/04.png`, alt: "Blitzschutz-Installation" },
        { src: `${IMG}/blitzschutz/05.png`, alt: "Blitzschutzprüfung" },
      ],
    },
    {
      name: "Spenglerei",
      slug: "spenglerei",
      images: [
        { src: `${IMG}/spenglerei/11.jpg`, alt: "Spenglerarbeiten am Dach" },
        { src: `${IMG}/spenglerei/12.jpg`, alt: "Blechverkleidung" },
        { src: `${IMG}/spenglerei/13.webp`, alt: "Kamineinfassung" },
        { src: `${IMG}/spenglerei/14.jpg`, alt: "Dachrinne und Fallrohr" },
        { src: `${IMG}/spenglerei/15.jpeg`, alt: "Flachdachabdichtung" },
      ],
    },
    {
      name: "Beratung & Planung",
      slug: "beratung_planung",
      images: [
        { src: `${IMG}/beratung_planung/01.jpg`, alt: "Beratungsgespräch vor Ort" },
        { src: `${IMG}/beratung_planung/02.png`, alt: "Projektplanung" },
        { src: `${IMG}/beratung_planung/03.png`, alt: "Konzepterstellung" },
        { src: `${IMG}/beratung_planung/04.png`, alt: "Fachberatung" },
      ],
    },
    {
      name: "Reparaturen & Wartung",
      slug: "reparaturen-wartung",
      images: [
        { src: `${IMG}/reparaturen-wartung/25.jpg`, alt: "Sanitär-Fachmann bei der Reparatur" },
        { src: `${IMG}/reparaturen-wartung/26.webp`, alt: "Reparatur an der Hausinstallation" },
        { src: `${IMG}/reparaturen-wartung/27.jpg`, alt: "Armaturenwechsel" },
        { src: `${IMG}/reparaturen-wartung/28.jpg`, alt: "Leitungsreparatur" },
        { src: `${IMG}/reparaturen-wartung/30.webp`, alt: "Wartungsarbeiten" },
      ],
    },
  ],

  reviews: {
    averageRating: 5.0,
    totalReviews: 1,
    googleUrl:
      "https://www.google.com/maps/place/Widmer+%26+Co.+AG",
    highlights: [],
  },

  serviceArea: {
    region: "Horgen & Umgebung",
    radiusDescription:
      "Wir betreuen Kunden in Horgen und der gesamten linken Zürichseeregion. Kurze Wege, schnelle Hilfe \u2014 seit über 125 Jahren.",
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

  /* Team: only 1 verified person → section auto-hidden (requires >=2) */
  team: [
    {
      name: "Michael Widmer",
      role: "Geschäftsführer",
      bio: "Führt den Familienbetrieb in Horgen mit technischem Know-how und persönlichem Engagement.",
    },
  ],

  history: [
    {
      year: 1898,
      title: "Gründung",
      description:
        "Die Familie Widmer gründet einen Sanitär- und Installationsbetrieb in Horgen am Zürichsee.",
    },
    {
      year: 2024,
      title: "Über 125 Jahre Erfahrung",
      description:
        "Heute führt die Familie Widmer den Betrieb in bewährter Tradition \u2014 mit modernem Know-how in Sanitär, Heizung, Spenglerei und Blitzschutz.",
    },
  ],
};
