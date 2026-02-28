import type { CustomerSite } from "./types";

export const brunnerHaustechnik: CustomerSite = {
  slug: "brunner-haustechnik",
  companyName: "Brunner Haustechnik AG",
  tagline: "Ihr Sanitär- und Heizungsspezialist am Zürichsee",
  metaDescription:
    "Brunner Haustechnik AG — Sanitär, Heizung, Boiler, Leitungsbau und 24h-Notdienst in Thalwil und am linken Zürichseeufer. Persönlich, zuverlässig, regional.",
  brandColor: "#0d7377",
  seoKeywords: [
    "Sanitär Thalwil",
    "Heizung Thalwil",
    "Notdienst Sanitär Zürichsee",
    "Boiler Reparatur Thalwil",
    "Rohrreinigung Horgen",
    "Brunner Haustechnik AG",
  ],

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
      name: "Sanitär",
      slug: "sanitaer",
      icon: "bath",
      summary:
        "Von der Armaturenmontage bis zur kompletten Badsanierung — wir decken das gesamte Sanitärspektrum ab.",
      description:
        "Ob undichter Siphon, neue Dusche oder die Komplettsanierung eines Mehrfamilienhauses — unser Sanitärteam löst jedes Problem. Wir arbeiten mit bewährten Schweizer Marken wie Geberit, KWC und Similor.",
    },
    {
      name: "Heizung",
      slug: "heizung",
      icon: "flame",
      summary:
        "Wartung, Reparatur und Ersatz von Heizungsanlagen — modern, effizient, ökologisch.",
      description:
        "Ihre Heizung macht Probleme? Wir beraten Sie zu modernen Lösungen — von der Wärmepumpe über Gaskessel-Ersatz bis zur Fussbodenheizung. Alles aus einer Hand, abgestimmt auf Ihr Gebäude.",
    },
    {
      name: "Boiler & Warmwasser",
      slug: "boiler",
      icon: "water",
      summary:
        "Installation, Wartung und Notfall-Reparatur von Boilern und Warmwasserspeichern.",
      description:
        "Kein Warmwasser? Boiler tropft? Wir reparieren oder ersetzen Ihren Warmwasserspeicher — schnell und unkompliziert. Auch Entkalkung und regelmässige Wartung gehören zu unserem Service.",
    },
    {
      name: "Leitungsbau",
      slug: "leitungsbau",
      icon: "pipe",
      summary:
        "Verlegung und Sanierung von Wasserleitungen für private und öffentliche Netze.",
      description:
        "Professioneller Leitungsbau für Gemeinden und Privatkunden. Wir verlegen neue Hauptwasserleitungen, sanieren bestehende Leitungen und kümmern uns um Anschlüsse — termingerecht und sauber.",
    },
    {
      name: "Reparaturservice",
      slug: "reparatur",
      icon: "wrench",
      summary:
        "Schnelle Hilfe bei allen Defekten — tropfende Hähne, verstopfte Abflüsse, defekte Spülkästen.",
      description:
        "Etwas kaputt? Wir reparieren schnell und unkompliziert. Egal ob tropfender Wasserhahn, verstopfter Abfluss oder klemmende WC-Spülung — ein Anruf genügt.",
    },
  ],

  gallery: [],

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

  team: [
    {
      name: "Thomas Brunner",
      role: "Inhaber / Sanitärmeister",
      bio: "Gründer und Geschäftsführer. Sanitärmeister-Diplom 2005. Über 20 Jahre Erfahrung in der Haustechnik.",
    },
    {
      name: "Marco Steiner",
      role: "Projektleiter Heizung",
      bio: "Heizungsfachmann mit Schwerpunkt Wärmepumpen und energieeffiziente Systeme. Im Team seit 2012.",
    },
    {
      name: "Luca Berger",
      role: "Sanitärmonteur",
      bio: "Gelernter Sanitärinstallateur EFZ. Zuständig für Badsanierungen und Neuinstallationen.",
    },
    {
      name: "Nico Weber",
      role: "Lernender Sanitärinstallateur",
      bio: "Im 3. Lehrjahr. Motiviert, zuverlässig und immer bereit, Neues zu lernen.",
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
