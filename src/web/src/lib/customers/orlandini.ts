import type { CustomerSite } from "./types";

const IMG = "/kunden/orlandini";

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
    "Sanitär Reparatur Horgen",
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

  /* Kein Notdienst auf alter Website → kein Notfall-Button, stattdessen "Anrufen" in Nav */

  services: [
    {
      name: "Sanitäre Installationen",
      slug: "sanitaer",
      icon: "bath",
      summary:
        "Trinkwasser, Abwasser, Gas und Druckluftinstallationen \u2014 komplett aus einer Hand.",
      description:
        "Von der Neuinstallation bis zur kompletten Sanierung: Wir planen und realisieren sämtliche Sanitäranlagen \u2014 Trinkwasserleitungen, Abwassersysteme, Gasinstallationen und Druckluftleitungen. Fachgerecht, termingerecht und nach aktuellen Normen. Als Familienbetrieb setzen wir auf persönliche Betreuung in jedem Projekt.",
      bullets: [
        "Trinkwasser- und Abwasserinstallationen für Neu- und Umbauten",
        "Gas- und Druckluftleitungen nach aktuellen Normen",
        "Komplette Badsanierungen inkl. Planung und Koordination",
        "Küchen- und Nasszelleninstallationen",
        "Persönliche Beratung vor Ort durch den Familienbetrieb",
      ],
    },
    {
      name: "Heizungstechnik",
      slug: "heizung",
      icon: "flame",
      summary:
        "Gas, Öl, Wärmepumpen, Fussbodenheizung und Solaranlagen \u2014 für wohlige Wärme.",
      description:
        "Ob Gasheizung, Ölkessel, Wärmepumpe oder Fussbodenheizung \u2014 wir beraten, planen und installieren die passende Heizlösung für Ihr Gebäude. Von der Einzelraum-Lösung bis zur Gesamtanlage mit Solarunterstützung: Über 50 Jahre Erfahrung garantieren Ihnen effiziente und zukunftssichere Wärme.",
      bullets: [
        "Gasheizungen, Ölkessel und Wärmepumpen",
        "Fussbodenheizung für Neubau und Sanierung",
        "Solaranlagen zur Heizungsunterstützung",
        "Heizungssanierung und Kesseltausch",
        "Energieberatung für optimale Effizienz",
      ],
    },
    {
      name: "Beratung & Planung",
      slug: "beratung_planung",
      icon: "tool",
      summary:
        "Persönliche Fachberatung für Ihre Sanitär- und Heizungsprojekte.",
      description:
        "Ob Neubau, Umbau oder Sanierung \u2014 wir beraten Sie umfassend und erstellen massgeschneiderte Konzepte. Profitieren Sie von über 50 Jahren Erfahrung im Familienbetrieb. Wir begleiten Sie von der ersten Idee bis zur schlüsselfertigen Übergabe.",
      bullets: [
        "Persönliche Beratung vor Ort \u2014 direkt vom Inhaber",
        "Massgeschneiderte Konzepte für Neubau und Sanierung",
        "Koordination aller Gewerke aus einer Hand",
        "Kostentransparenz und verbindliche Offerten",
        "Über 50 Jahre Erfahrung im Familienbetrieb",
      ],
    },
    {
      name: "Reparaturen",
      slug: "reparaturen",
      icon: "wrench",
      summary:
        "Schnelle Hilfe bei Defekten \u2014 tropfender Hahn, verstopfter Abfluss oder Heizungsstörung.",
      description:
        "Tropfender Hahn, verstopfter Abfluss oder Heizungsstörung? Wir kommen schnell und erledigen die Reparatur fachgerecht. Unser eingespieltes Team löst die meisten Probleme noch am selben Tag \u2014 zuverlässig und zu fairen Preisen.",
      bullets: [
        "Schnelle Einsätze bei Rohrbrüchen und Wasserschäden",
        "Reparatur von Armaturen, Ventilen und Dichtungen",
        "Behebung von Abflussverstopfungen",
        "Heizungsstörungen und Kesselreparaturen",
        "Schnelle Terminvergabe für dringende Fälle",
      ],
    },
    {
      name: "Wartungsservice",
      slug: "wartungsservice",
      icon: "water",
      summary:
        "Regelmässige Wartung Ihrer Sanitär- und Heizungsanlagen \u2014 damit alles reibungslos läuft.",
      description:
        "Regelmässige Wartung verhindert teure Folgeschäden und verlängert die Lebensdauer Ihrer Anlagen. Wir bieten systematische Funktionskontrollen für Heizung, Boiler und Sanitäranlagen \u2014 damit Sie sich auf wohlige Wärme und fliessendes Wasser verlassen können.",
      bullets: [
        "Periodische Heizungswartung und Brennerservice",
        "Boilerentkalkung und Warmwasser-Checks",
        "Kontrolle von Sicherheitsventilen und Filtern",
        "Wartungsverträge mit festen Intervallen",
        "Protokollierte Wartungsberichte",
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
        { src: `${IMG}/sanitaer/03.avif`, alt: "Sanitäre Anlage im Detail" },
        { src: `${IMG}/sanitaer/04.jpg`, alt: "Badsanierung" },
        { src: `${IMG}/sanitaer/05.jpg`, alt: "Installationsarbeit" },
      ],
    },
    {
      name: "Heizung",
      slug: "heizung",
      images: [
        { src: `${IMG}/heizung/08.jpg`, alt: "Heizungsanlage im Technikraum" },
        { src: `${IMG}/heizung/16.jpg`, alt: "Boiler und Speicher" },
        { src: `${IMG}/heizung/17.jpg`, alt: "Warmwasser-System" },
        { src: `${IMG}/heizung/18.jpg`, alt: "Heizungstechnik" },
        { src: `${IMG}/heizung/19.webp`, alt: "Heizkörper-Installation" },
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
      name: "Reparaturen",
      slug: "reparaturen",
      images: [
        { src: `${IMG}/reparaturen/25.jpg`, alt: "Sanitär-Fachmann bei der Reparatur" },
        { src: `${IMG}/reparaturen/26.webp`, alt: "Reparatur an der Hausinstallation" },
        { src: `${IMG}/reparaturen/27.jpg`, alt: "Armaturenwechsel" },
        { src: `${IMG}/reparaturen/28.jpg`, alt: "Leitungsreparatur" },
        { src: `${IMG}/reparaturen/30.webp`, alt: "Notfall-Reparatur" },
      ],
    },
    {
      name: "Wartungsservice",
      slug: "wartungsservice",
      images: [
        { src: `${IMG}/wartungsservice/01.png`, alt: "Wartungsarbeiten" },
        { src: `${IMG}/wartungsservice/02.png`, alt: "Heizungswartung" },
        { src: `${IMG}/wartungsservice/03.png`, alt: "Boiler-Kontrolle" },
        { src: `${IMG}/wartungsservice/04.png`, alt: "Systemprüfung" },
        { src: `${IMG}/wartungsservice/05.png`, alt: "Wartungsprotokoll" },
      ],
    },
  ],

  reviews: {
    averageRating: 3.8,
    totalReviews: 28,
    googleUrl:
      "https://www.google.com/maps/place/Orlandini+Sanit%C3%A4r+Heizung+GmbH",
    highlights: [
      {
        author: "Christoph Wehrli",
        rating: 5,
        text: "Wir erlitten in unserem älteren Haus einen nicht leicht zu lokalisierenden Wasserschaden. Die Firma Orlandini leistete einen wesentlichen Beitrag, um den Schaden zu unserer vollen Zufriedenheit zu beheben. Sehr rascher Einsatz mit kompetentem und flexiblem Personal. Eine sehr empfehlenswerte Firma!",
      },
      {
        author: "Luca Kunz",
        rating: 5,
        text: "Top Service, sehr empfehlenswert! Ich bin sehr zufrieden mit dem Sanitärservice von Orlandini. Herr Majic war pünktlich, kompetent und freundlich. Das Problem wurde schnell und professionell gelöst, und alles wurde sauber hinterlassen. Absolut empfehlenswert!",
      },
      {
        author: "Bernd H",
        rating: 5,
        text: "Wir sind seit vielen Jahren Kunde und machten immer sehr gute Erfahrungen. Fängt schon mit der netten Telefonistin an und endet jeweils mit dem tollen und schnellen Service der professionellen Handwerker. Dafür geben wir gerne 5 strahlende Sterne!",
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

  /* Team: Namen/Rollen nicht verifiziert → entfernt. Section auto-hidden (< 2) */
  team: [],

  certifications: [
    { name: "Suissetec", issuer: "Schweizerisch-Liechtensteinischer Gebäudetechnikverband" },
    { name: "VSSH", issuer: "Verband Schweizerischer Sanitär- und Heizungsfachleute" },
    { name: "FWS", issuer: "Fachvereinigung Wärmepumpen Schweiz" },
  ],

  brandPartners: [
    { name: "Geberit", url: "https://www.geberit.ch" },
    { name: "Hansgrohe", url: "https://www.hansgrohe.ch" },
    { name: "Duravit", url: "https://www.duravit.ch" },
    { name: "Villeroy & Boch", url: "https://www.villeroy-boch.ch" },
    { name: "Sanitas Troesch", url: "https://www.sanitastroesch.ch" },
    { name: "Duscholux", url: "https://www.duscholux.ch" },
    { name: "KWC", url: "https://www.kwc.com" },
    { name: "Koralle", url: "https://www.koralle.de" },
    /* Similor Kugler: Domain tot, Firma aufgegangen → entfernt */
    { name: "Richner Miauton", url: "https://www.richner.ch" },
    { name: "BWT Aqua", url: "https://www.bwt.com" },
    { name: "Hoval", url: "https://www.hoval.ch" },
    { name: "Vaillant", url: "https://www.vaillant.ch" },
    { name: "Elco", url: "https://www.elco.ch" },
    { name: "Domotec", url: "https://www.domotec.ch" },
    { name: "Zehnder", url: "https://www.zehnder.ch" },
    { name: "Meier Tobler", url: "https://www.meiertobler.ch" },
  ],

  careers: [
    {
      title: "Sanitär-Service-Fachleute (m/w), 80-100%",
      type: "fulltime" as const,
      description: "Wir sind eine 50-jährige Haustechnikfirma mit Schwerpunkt im Bereich Service, Reparaturen, Wartungen und kleineren Umbauten. Unsere Kundenliste wird immer länger — wir brauchen dringend Verstärkung.",
      requirements: [
        "Gelernte Fachfrauen und Männer mit Serviceerfahrung",
        "Freude am selbständigen Arbeiten",
        "Zuverlässigkeit, gepflegtes Auftreten und Teamfähigkeit",
        "Deutsch in Wort und Schrift",
        "Führerschein Kat. B",
      ],
    },
    {
      title: "Heizungs-Service-Fachleute (m/w), 80-100%",
      type: "fulltime" as const,
      description: "Service-Spezialisten für Heizungstechnik gesucht. Persönliches Servicefahrzeug, modernes Werkzeug und Terminplanungstools mit Tablets. Langfristig sichere Anstellung in einem familiären Umfeld.",
      requirements: [
        "Erfahrung im Heizungsservice oder Bereitschaft zur Einarbeitung",
        "Freude an Kundenkontakt und selbständigem Arbeiten",
        "Zuverlässigkeit und Teamfähigkeit",
        "Deutsch in Wort und Schrift",
        "Führerschein Kat. B",
      ],
    },
  ],

  /* History: Details nicht verifiziert → entfernt */
};
