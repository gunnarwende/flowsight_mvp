import type { CustomerSite } from "./types";

const IMG = "/kunden/brunner-haustechnik";

export const brunnerHaustechnik: CustomerSite = {
  slug: "brunner-haustechnik",
  companyName: "Brunner Haustechnik AG",
  tagline: "Ihr Sanitär- und Heizungsspezialist am Zürichsee",
  metaDescription:
    "Brunner Haustechnik AG — Sanitär, Heizung, Spenglerei, Boiler und 24h-Notdienst in Thalwil und am linken Zürichseeufer. Persönlich, zuverlässig, regional.",
  brandColor: "#0d7377",
  seoKeywords: [
    "Sanitär Thalwil",
    "Heizung Thalwil",
    "Notdienst Sanitär Zürichsee",
    "Boiler Reparatur Thalwil",
    "Spengler Thalwil",
    "Brunner Haustechnik AG",
  ],

  voicePhone: "044 505 48 18",
  voicePhoneRaw: "+41445054818",

  contact: {
    phone: "044 720 31 42",
    phoneRaw: "+41447203142",
    email: "info@brunner-haustechnik.ch",
    address: {
      street: "Seestrasse 42",
      zip: "8800",
      city: "Thalwil",
      canton: "ZH",
    },
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Seestrasse+42,+8800+Thalwil,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed",
    openingHours: [
      "Mo–Fr: 07:30–12:00, 13:00–17:00",
      "Sa/So: Notdienst erreichbar",
    ],
  },

  emergency: {
    enabled: true,
    phone: "044 720 31 42",
    phoneRaw: "+41447203142",
    label: "24h Notdienst",
    description:
      "Rohrbruch? Heizung ausgefallen? Wir sind innert 60 Minuten vor Ort — rund um die Uhr.",
  },

  services: [
    {
      name: "Sanitäre Anlagen",
      slug: "sanitaer",
      icon: "bath",
      summary:
        "Von der Armaturenmontage bis zur kompletten Badsanierung — wir decken das gesamte Sanitärspektrum ab.",
      description:
        "Ob undichter Siphon, neue Dusche oder die Komplettsanierung eines Mehrfamilienhauses — unser Sanitärteam löst jedes Problem. Wir arbeiten mit bewährten Schweizer Marken wie Geberit, KWC und Similor und betreuen jedes Projekt persönlich von der Planung bis zur Abnahme.",
      bullets: [
        "Komplette Badsanierungen inkl. Trockenbau & Plattenleger-Koordination",
        "Schwellenfreie Duschen & barrierefreie Badezimmer",
        "Neuinstallationen für Einfamilien- und Mehrfamilienhäuser",
        "Spülkasten-Reparaturen, Armaturen-Ersatz, Dichtungen",
        "Beratung zu hochwertigen Armaturen (Geberit, KWC, Similor)",
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
        "Wartung, Reparatur und Ersatz von Heizungsanlagen — modern, effizient, ökologisch.",
      description:
        "Ihre Heizung macht Probleme oder ist in die Jahre gekommen? Wir beraten Sie zu modernen, energieeffizienten Lösungen — von der Wärmepumpe über Fussbodenheizung bis zum Gaskessel-Ersatz. Alles aus einer Hand, abgestimmt auf Ihr Gebäude und Ihre Bedürfnisse.",
      bullets: [
        "Heizkörper- und Fussbodenheizung — Einbau & Wartung",
        "Wärmepumpen-Beratung und Installation",
        "Heizungsersatz: Gas, Öl, Wärmepumpe, Pellet",
        "Jährliche Wartung und Funktionskontrollen",
        "Notfall-Service bei Heizungsausfall — auch am Wochenende",
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
      name: "Boiler & Warmwasser",
      slug: "boiler",
      icon: "water",
      summary:
        "Installation, Wartung und Notfall-Reparatur von Boilern und Warmwasserspeichern.",
      description:
        "Kein Warmwasser? Boiler tropft? Wir reparieren oder ersetzen Ihren Warmwasserspeicher — schnell und unkompliziert. Ein 4-Personen-Haushalt verbraucht rund 90\u2019000 Liter Warmwasser pro Jahr. Regelmässige Entkalkung alle 3–5 Jahre schützt Ihre Anlage, spart bis zu 25% Energie und sichert hygienisches Trinkwasser.",
      bullets: [
        "Boiler-Entkalkung mit Befundprotokoll",
        "Einbau & Wartung von Warmwasserspeichern",
        "Heizstab-Ersatz und Anode-Kontrolle",
        "Legionellen-Prävention und Hygienespülung",
        "Beratung zu Durchlauferhitzer vs. Speicher",
      ],
      images: [
        `${IMG}/boiler/01.png`,
        `${IMG}/boiler/02.png`,
        `${IMG}/boiler/03.png`,
        `${IMG}/boiler/04.png`,
        `${IMG}/boiler/05.png`,
      ],
    },
    {
      name: "Spenglerei",
      slug: "spengler",
      icon: "roof",
      summary:
        "Dacheindeckungen, Blechverarbeitung und Dachrinnen — für ein wasserdichtes Dach.",
      description:
        "Wir verarbeiten verschiedenste Blecharten zu massgeschneiderten Dachlösungen. Ob Stehfalz, Dachrinnen, Kaminabdeckungen oder Fassadenverkleidungen — unser Spenglerteam arbeitet präzise und wetterfest. Jede Arbeit wird massgenau vor Ort angepasst.",
      bullets: [
        "Stehfalz- und Metalldach-Eindeckungen",
        "Dachrinnen, Fallrohre & Schneefangsysteme",
        "Kaminabdeckungen & Dachdurchführungen",
        "Fassadenverkleidungen aus Blech",
        "Reparaturen und Abdichtungen am Dach",
      ],
      images: [
        `${IMG}/spengler/11.jpg`,
        `${IMG}/spengler/12.jpg`,
        `${IMG}/spengler/13.webp`,
        `${IMG}/spengler/14.jpg`,
        `${IMG}/spengler/15.jpeg`,
      ],
    },
    {
      name: "Blitzschutz",
      slug: "blitzschutz",
      icon: "tool",
      summary:
        "Fachgerechte Installation und Prüfung von Blitzschutzanlagen für Ihr Gebäude.",
      description:
        "Blitzschutz schützt Ihr Gebäude, Ihre Elektroinstallationen und Ihre Familie. Wir installieren normgerechte Blitzschutzanlagen — vom Auffangsystem auf dem Dach über die Ableitungen bis zur Erdung. Regelmässige Prüfungen sichern die dauerhafte Funktion Ihrer Anlage.",
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
        "Schnelle Hilfe bei allen Defekten — tropfende Hähne, verstopfte Abflüsse, defekte Spülkästen.",
      description:
        "Etwas kaputt? Wir reparieren schnell und unkompliziert. Egal ob tropfender Wasserhahn, verstopfter Abfluss, defekter Boiler oder klemmende WC-Spülung — ein Anruf genügt. Auch an Sonn- und Feiertagen sind wir für Sie erreichbar.",
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
        { src: `${IMG}/sanitaer/01.avif`, alt: "Moderne Badezimmer-Installation" },
        { src: `${IMG}/sanitaer/02.avif`, alt: "Designbad mit Glasdusche" },
        { src: `${IMG}/sanitaer/03.avif`, alt: "Badsanierung — Qualitätsarbeit" },
        { src: `${IMG}/sanitaer/04.jpg`, alt: "Badezimmer Renovation" },
        { src: `${IMG}/sanitaer/05.jpg`, alt: "Armaturen und Installationen" },
      ],
    },
    {
      name: "Heizung",
      slug: "heizung",
      images: [
        { src: `${IMG}/heizung/01.webp`, alt: "Moderne Heizungsanlage" },
        { src: `${IMG}/heizung/02.jpg`, alt: "Heizungsverteiler und Regelung" },
        { src: `${IMG}/heizung/03.jpg`, alt: "Heizungsinstallation Neubau" },
        { src: `${IMG}/heizung/04.webp`, alt: "Wärmepumpe" },
        { src: `${IMG}/heizung/05.jpg`, alt: "Heizungswartung" },
      ],
    },
    {
      name: "Boiler & Warmwasser",
      slug: "boiler",
      images: [
        { src: `${IMG}/boiler/01.png`, alt: "Boiler-Installation" },
        { src: `${IMG}/boiler/02.png`, alt: "Warmwasserspeicher" },
        { src: `${IMG}/boiler/03.png`, alt: "Boiler-Entkalkung" },
        { src: `${IMG}/boiler/04.png`, alt: "Warmwasser-Technik" },
        { src: `${IMG}/boiler/05.png`, alt: "Boiler-Wartung" },
      ],
    },
    {
      name: "Spenglerei",
      slug: "spengler",
      images: [
        { src: `${IMG}/spengler/11.jpg`, alt: "Dacharbeiten — Spenglerei" },
        { src: `${IMG}/spengler/12.jpg`, alt: "Dachrinne und Fallrohr" },
        { src: `${IMG}/spengler/13.webp`, alt: "Metalldach-Detailarbeit" },
        { src: `${IMG}/spengler/14.jpg`, alt: "Kaminabdeckung" },
        { src: `${IMG}/spengler/15.jpeg`, alt: "Dachabschluss mit Blech" },
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

  reviews: {
    averageRating: 4.8,
    totalReviews: 52,
    googleUrl:
      "https://www.google.com/maps/place/Thalwil",
    highlights: [
      {
        author: "Claudia M.",
        rating: 5,
        text: "Rohrbruch in der Küche — innert einer Stunde war jemand da. Schnelle, professionelle Hilfe. Absolut empfehlenswert!",
        date: "vor 2 Wochen",
      },
      {
        author: "Peter Keller",
        rating: 5,
        text: "Brunner hat unsere gesamte Heizung ersetzt. Tolle Beratung, faire Preise und eine saubere Baustelle. Wir sind begeistert.",
        date: "vor 1 Monat",
      },
      {
        author: "Sandra W.",
        rating: 5,
        text: "Rohrbruch am Sonntagabend — innert 45 Minuten war jemand da. Das nenne ich Notdienst! Danke an das ganze Team.",
        date: "vor 2 Monaten",
      },
    ],
  },

  serviceArea: {
    region: "Linkes Zürichseeufer",
    radiusDescription:
      "Wir betreuen Privathaushalte und Gewerbeobjekte am gesamten linken Zürichseeufer — von Kilchberg bis Wädenswil. Schnelle Anfahrt, persönlicher Service.",
    gemeinden: [
      "Thalwil",
      "Horgen",
      "Oberrieden",
      "Kilchberg",
      "Adliswil",
      "Langnau am Albis",
      "Wädenswil",
    ],
  },

  teamPhoto: `${IMG}/team.jpg`,

  team: [
    {
      name: "Thomas Brunner",
      role: "Inhaber / Sanitärmeister",
      bio: "Gründer und Geschäftsführer. Leitet den Betrieb mit über 20 Jahren Erfahrung.",
    },
    {
      name: "Marco Steiner",
      role: "Projektleiter Heizung",
      bio: "Spezialist für Wärmepumpen und energieeffiziente Heizsysteme.",
    },
    {
      name: "Sandra Keller",
      role: "Büro / Administration",
      bio: "Organisiert Termine, Offerten und den gesamten Kundenkontakt.",
    },
    {
      name: "Luca Berger",
      role: "Sanitärmonteur",
      bio: "Zuständig für Badsanierungen, Neuinstallationen und Reparaturen.",
    },
    {
      name: "Dominik Huber",
      role: "Spengler / Dachmonteur",
      bio: "Verantwortlich für Dachrinnen, Blecharbeiten und Blitzschutz.",
    },
    {
      name: "Petra Meier",
      role: "Projektleiterin Sanitär",
      bio: "Plant und koordiniert Sanitärprojekte von der Offerte bis zur Abnahme.",
    },
    {
      name: "Nico Weber",
      role: "Lernender 3. Lehrjahr",
      bio: "Angehender Sanitärinstallateur EFZ — motiviert und zuverlässig.",
    },
    {
      name: "Jonas Frei",
      role: "Servicemonteur",
      bio: "Erster Ansprechpartner bei Notfällen und schnellen Reparaturen.",
    },
  ],

  certifications: [
    {
      name: "suissetec-Mitglied",
      issuer: "Schweizerisch-Liechtensteinischer Gebäudetechnikverband",
    },
    {
      name: "Minergie-Fachpartner",
      issuer: "Verein Minergie",
    },
  ],

  history: [
    {
      year: 2003,
      title: "Gründung",
      description:
        "Thomas Brunner gründet ein Ein-Mann-Sanitärunternehmen in Thalwil.",
    },
    {
      year: 2008,
      title: "Erste Angestellte",
      description:
        "Das Team wächst auf 3 Mitarbeiter. Erster Lehrling startet seine Ausbildung.",
    },
    {
      year: 2015,
      title: "Brunner Haustechnik AG",
      description:
        "Umwandlung in eine AG. Umzug in die grössere Werkstatt an der Seestrasse.",
    },
    {
      year: 2023,
      title: "Digitalisierung",
      description:
        "Einführung von FlowSight — KI-gestützter Telefonassistent und digitales Fallmanagement.",
    },
  ],

  careers: [
    {
      title: "Sanitärmonteur/in EFZ",
      type: "fulltime",
      description:
        "Zur Verstärkung unseres Teams suchen wir eine/n motivierte/n Sanitärmonteur/in. Du arbeitest selbständig auf Baustellen in der Region und betreust Projekte von der Reparatur bis zur Neubau-Installation.",
      requirements: [
        "Abgeschlossene Lehre als Sanitärinstallateur/in EFZ",
        "Mindestens 2 Jahre Berufserfahrung",
        "Führerschein Kat. B",
        "Teamfähig, zuverlässig und kundenorientiert",
        "Gute Deutschkenntnisse",
      ],
    },
  ],
};
