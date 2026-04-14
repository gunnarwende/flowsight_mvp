import type { CustomerSite } from "./types";
import { FIXED_CATEGORIES } from "./categories";

const IMG = "/kunden/walter-leuthold";

export const walterLeuthold: CustomerSite = {
  slug: "walter-leuthold",
  companyName: "Walter Leuthold",
  tagline: "Ihr Sanit\u00e4r & Spengler am linken Z\u00fcrichseeufer",
  metaDescription:
    "Walter Leuthold \u2014 Sanit\u00e4re Anlagen und Spenglerei in Oberrieden. Badsanierung, Wasserenth\u00e4rtung, Kupferd\u00e4cher, 24/7 Notdienst. Seit 2001 am Z\u00fcrichsee.",
  brandColor: "#203784",
  seoKeywords: [
    "Sanit\u00e4r Oberrieden",
    "Spengler Oberrieden",
    "Badsanierung Z\u00fcrichsee",
    "Wasserenth\u00e4rtung Oberrieden",
    "Kupferdach Z\u00fcrich S\u00fcd",
    "Notfall Sanit\u00e4r Oberrieden",
    "Walter Leuthold",
    "Spenglerei linkes Z\u00fcrichseeufer",
  ],

  contact: {
    phone: "044 720 16 90",
    phoneRaw: "+41447201690",
    email: "info@walter-leuthold.ch",
    address: {
      street: "Seestrasse 98a",
      zip: "8942",
      city: "Oberrieden",
      canton: "ZH",
    },
    website: "walter-leuthold.ch",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Seestrasse+98a,+8942+Oberrieden,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },

  emergency: {
    enabled: true,
    phone: "079 417 74 41",
    phoneRaw: "+41794177441",
    label: "24h Notfall",
    description:
      "\u00dcberflutete Waschmaschine, kein Warmwasser, eingefrorene Leitungen oder verstopfter Abfluss? Wir sind rund um die Uhr erreichbar \u2014 auch an Wochenenden und Feiertagen.",
  },

  services: [
    {
      name: "Sanit\u00e4re Anlagen",
      slug: "sanitaer",
      icon: "bath",
      summary:
        "Vom schwellenlosen Designbad bis zur Gartendusche \u2014 wir planen, installieren und sanieren Ihre gesamte Sanitäranlage.",
      description:
        "Frisches Wasser bringen, verbrauchtes Wasser abf\u00fchren \u2014 das ist unsere Kernkompetenz seit \u00fcber 20 Jahren. Ob komplette Badsanierung mit Trockenbau, neue Duschen und Badewannen, Unterputzsp\u00fclk\u00e4sten oder K\u00fccheninstallationen: Wir arbeiten sauber, termingerecht und mit hochwertigen Materialien. Jedes Projekt wird pers\u00f6nlich vom Inhaber betreut \u2014 von der Beratung bis zur Endabnahme.",
      bullets: [
        "Komplette Badsanierungen inkl. Trockenbau & Plattenleger-Koordination",
        "Schwellenfreie Duschen & barrierefreie Badezimmer",
        "Unterputzsp\u00fclk\u00e4sten, Regenduschen, Designarmaturen",
        "K\u00fcchen- und Gartenwasser-Installationen",
        "Pers\u00f6nliche Beratung & Planung vor Ort",
      ],
    },
    {
      name: "Reparaturen & Wartung",
      slug: "reparaturen",
      icon: "wrench",
      summary:
        "Tropfender Hahn, verkalkter Boiler oder niedriger Wasserdruck? Wir beheben das Problem \u2014 schnell und zuverl\u00e4ssig.",
      description:
        "Defekte Armaturen, tropfende Duschen, verkalkte Brauseplatten oder zu wenig Warmwasser \u2014 solche Probleme l\u00f6sen wir oft noch am selben Tag. Dar\u00fcber hinaus bieten wir Wartungsvertr\u00e4ge mit periodischen Funktionskontrollen Ihrer gesamten sanit\u00e4ren Haustechnik. So erkennen wir Verschleiss fr\u00fchzeitig und verhindern teure Folgesch\u00e4den.",
      bullets: [
        "Boilerentkalkungen & Heizstab-Ersatz",
        "Dichtungen, Ventile, Filterpatronen",
        "Wasserdruck-Analyse & Optimierung",
        "Wartungsvertr\u00e4ge mit regelm\u00e4ssigen Funktionskontrollen",
        "Notfall-Reparaturen \u2014 auch abends und am Wochenende",
      ],
    },
    {
      name: "Wasserenth\u00e4rtung",
      slug: "wasserenthaertung",
      icon: "water",
      summary:
        "Professionelle Entkalkung f\u00fcr weiches Wasser, l\u00e4ngere Ger\u00e4telebensdauer und sp\u00fcrbar weniger Energieverbrauch.",
      description:
        "Ohne Boiler kein warmes Wasser. Ein 4-Personen-Haushalt verbraucht rund 90\u2019000 Liter Warmwasser pro Jahr. Auch sauberes Leitungswasser enth\u00e4lt Kalk, Sand und Sedimente, die sich in Rohren und Ger\u00e4ten ablagern. Regelm\u00e4ssige Entkalkung alle 3\u20135 Jahre sch\u00fctzt Ihre Anlage, spart bis zu 25% Energie und sichert hygienisches Trinkwasser.",
      bullets: [
        "Boilerentkalkung mit Befundprotokoll",
        "Einbau & Wartung von Enth\u00e4rtungsanlagen",
        "Sediment- und Kalkfilter f\u00fcr die gesamte Hausinstallation",
        "Messungen der Wasserh\u00e4rte vor Ort",
        "Beratung zu Kosten-Nutzen f\u00fcr Ihr Geb\u00e4ude",
      ],
    },
    {
      name: "Spenglerei \u2014 Auf dem Dach",
      slug: "spenglerei-dach",
      icon: "roof",
      summary:
        "Kupferd\u00e4cher, Flachdach-Abdichtungen, Kaminabdeckungen und Blitzschutz \u2014 Handwerk, das Generationen h\u00e4lt.",
      description:
        "Wo das Dach endet, muss es mit Blech abgeschlossen und dicht gemacht werden. Ob Kamine, Lukarnen, Oberlichter oder Dachdurchf\u00fchrungen \u2014 wir arbeiten mit Kupfer, Chromstahl, Aluminium, Zink und Blei. Metalld\u00e4cher sind seit dem Mittelalter bew\u00e4hrt und erlauben komplexe architektonische Formen. Jede Arbeit wird massgenau vor Ort angepasst.",
      bullets: [
        "Kupferdach-Eindeckungen & Metalldachsanierungen",
        "Dachrinnen, Fallrohre & Schneefangsysteme",
        "Kaminabdeckungen & Dachdurchf\u00fchrungen",
        "Flachdach-Abdichtung & j\u00e4hrliche Inspektionen",
        "Blitzschutzanlagen nach SN-Norm",
      ],
    },
    {
      name: "Spenglerei \u2014 Am Haus",
      slug: "spenglerei-haus",
      icon: "facade",
      summary:
        "Metallfassaden, Fensterb\u00e4nke, Vord\u00e4cher und Sichtschutz \u2014 langlebig, pflegeleicht und \u00e4sthetisch.",
      description:
        "Es gibt keine langlebigere und pflegeleichtere Fassade als eine Metallfassade. Dazu Hauseing\u00e4nge mit Vordach gegen Schlagregen, Fensterb\u00e4nke aus Aluminium, Chromstahl oder Kupfer, Garagend\u00e4chli und Sichtschutz aus Streckmetall. Alle Materialfarben lassen sich mit Einbrennlack exakt an Ihre Fenster und Fassade anpassen.",
      bullets: [
        "Metallfassaden & Fassadenverkleidungen",
        "Fensterb\u00e4nke aus Aluminium, Chromstahl oder Kupfer",
        "Vord\u00e4cher & Hauseingangs-\u00dcberdachungen",
        "Sichtschutz & Gel\u00e4nder aus Streckmetall",
        "Farbabstimmung mit Einbrennlack nach Wunsch",
      ],
    },
  ],

  gallery: [
    {
      name: "Sanit\u00e4r",
      slug: "sanitaer",
      images: [
        { src: `${IMG}/sanitaer/01.avif`, alt: "Moderne Badezimmer-Installation" },
        { src: `${IMG}/sanitaer/02.avif`, alt: "Designbad mit Glasdusche" },
        { src: `${IMG}/sanitaer/03.avif`, alt: "Badsanierung \u2014 Vorher/Nachher" },
        { src: `${IMG}/sanitaer/04.jpg`, alt: "Chalet-Bad mit freistehender Badewanne" },
        { src: `${IMG}/sanitaer/05.jpg`, alt: "Regendusche mit Bergpanorama" },
      ],
    },
    {
      name: "Reparaturen",
      slug: "reparaturen",
      images: [
        { src: `${IMG}/reparaturen/25.jpg`, alt: "Sanit\u00e4r-Fachmann bei der Leitungskontrolle" },
        { src: `${IMG}/reparaturen/26.webp`, alt: "Reparatur an der Hausinstallation" },
        { src: `${IMG}/reparaturen/27.jpg`, alt: "Armaturenwechsel im Badezimmer" },
        { src: `${IMG}/reparaturen/28.jpg`, alt: "Wartungsarbeiten an Wasserleitungen" },
        { src: `${IMG}/reparaturen/30.webp`, alt: "Boiler-Entkalkung und Heizstab-Kontrolle" },
      ],
    },
    {
      name: "Wasserenth\u00e4rtung",
      slug: "wasserenthaertung",
      images: [
        { src: `${IMG}/wasserenthaertung/08.jpg`, alt: "Professionelle Haustechnik-Installation" },
        { src: `${IMG}/wasserenthaertung/16.jpg`, alt: "Boiler mit Enth\u00e4rtungsanlage" },
        { src: `${IMG}/wasserenthaertung/17.jpg`, alt: "Warmwasser-Speicher und Leitungssystem" },
        { src: `${IMG}/wasserenthaertung/18.jpg`, alt: "Wasserenth\u00e4rtungsanlage im Technikraum" },
        { src: `${IMG}/wasserenthaertung/19.webp`, alt: "Kalkablagerung an Heizst\u00e4ben" },
      ],
    },
    {
      name: "Spenglerei \u2014 Dach",
      slug: "spenglerei-dach",
      images: [
        { src: `${IMG}/spenglerei-dach/11.jpg`, alt: "Kupferdach-Eindeckung" },
        { src: `${IMG}/spenglerei-dach/12.jpg`, alt: "Dachrinne aus Kupfer" },
        { src: `${IMG}/spenglerei-dach/13.webp`, alt: "Metalldach-Detailarbeit" },
        { src: `${IMG}/spenglerei-dach/14.jpg`, alt: "Kaminabdeckung" },
        { src: `${IMG}/spenglerei-dach/15.jpeg`, alt: "Dachabschluss mit Kupferblech" },
      ],
    },
    {
      name: "Spenglerei \u2014 Haus",
      slug: "spenglerei-haus",
      images: [
        { src: `${IMG}/spenglerei-haus/11.jpg`, alt: "Metallfassade am Wohnhaus" },
        { src: `${IMG}/spenglerei-haus/12.jpg`, alt: "Fensterbank-Montage" },
        { src: `${IMG}/spenglerei-haus/13.webp`, alt: "Vordach \u00fcber Hauseingang" },
        { src: `${IMG}/spenglerei-haus/14.jpg`, alt: "Sichtschutz aus Streckmetall" },
        { src: `${IMG}/spenglerei-haus/15.jpeg`, alt: "Spenglerarbeiten am Geb\u00e4ude" },
      ],
    },
  ],

  reviews: {
    averageRating: 4.9,
    totalReviews: 44,
    googleUrl:
      "https://www.google.com/maps/place/Walter+Leuthold+Sanit%C3%A4re+Anlagen",
    highlights: [
      {
        author: "Enrico P\u00f6schmann",
        rating: 5,
        text: "Hohe Fachkompetenz, pers\u00f6nliche Beratung und Expertise in allen Bereichen des Bauhandwerkes. Zudem ist er gut vernetzt und kennt die besten Handwerker in der Region und hilft immer kompetent weiter. Tolle Projekte, tolle Umsetzung. Nur zu empfehlen!",
      },
      {
        author: "Jan Burger",
        rating: 5,
        text: "Schnell, professionell und erst noch \u00e4usserst freundlich! Walter Leuthold war innert einer Stunde bei uns in einem Notfall und hat das Problem sofort behoben. Wir werden nun auch noch einen kleinen Umbau mit ihm machen, so \u00fcberzeugt hat er uns. Jederzeit zu empfehlen!",
      },
      {
        author: "Claude Ribaux",
        rating: 5,
        text: "Hervorragender Service bei hoher Qualit\u00e4t. Am Freitagabend 20h Problem mit dem Geschirrsp\u00fcler gemeldet, am Samstagmorgen um 9.15 Schaden schon behoben. Wir hatten schon fr\u00fcher \u00e4hnlich positive Erfahrungen gemacht mit Walter Leuthold.",
      },
      {
        author: "Mike Walthert",
        rating: 5,
        text: "Herr Leuthold ist nach meinem Anruf sofort gekommen. Die Dichtung wie auch der Wasserhahn im Lavabo waren defekt. In kurzer Zeit wurde die Reparatur professionell erledigt. Dank seiner hochwertigen und sauberen Arbeit freue ich mich das wieder alles einwandfrei funktioniert. Vielen Dank",
      },
      {
        author: "Rolf Knecht",
        rating: 5,
        text: "Freitag Abend um 18:00 angerufen wegen leckendem Wasserhahn. Eine halbe Stunde sp\u00e4ter wurde das behoben und am Montag bereits ein neuer Hahn montiert. Schnell, freundlich, super. Kann man nur empfehlen",
      },
      {
        author: "This Br\u00e4uer",
        rating: 5,
        text: "Das ist ein Sanit\u00e4r, welcher sein Beuf noch liebt und ihn auch mit K\u00f6pfchen ausf\u00fchrt! Herzlichen Dank Walti f\u00fcr Bauleitung, Koordination, Mitdenken und Ausf\u00fchrung!",
      },
    ],
  },

  serviceArea: {
    region: "Linkes Z\u00fcrichseeufer",
    radiusDescription:
      "Wir betreuen Privathaushalte und Liegenschaften am gesamten linken Z\u00fcrichseeufer. Schnelle Anfahrt, lokale Verbundenheit.",
    gemeinden: [
      "Oberrieden",
      "Thalwil",
      "Horgen",
      "Kilchberg",
      "R\u00fcschlikon",
      "Adliswil",
      "W\u00e4denswil",
      "Au ZH",
      "Richterswil",
    ],
  },

  team: [
    {
      name: "Walter Leuthold",
      role: "Inhaber / Sanit\u00e4r & Spengler",
      bio: "Gr\u00fcnder und Inhaber seit 2001. Pers\u00f6nlicher Service am linken Z\u00fcrichseeufer \u2014 auch sonntags erreichbar.",
    },
  ],

  certifications: [
    {
      name: "suissetec-Mitglied",
      issuer: "Schweizerisch-Liechtensteinischer Geb\u00e4udetechnikverband",
    },
  ],

  voicePhone: "044 505 30 19",
  voicePhoneRaw: "+41445053019",

  // Categories: Sanitär + Spenglerei focus
  categories: [
    { value: "Verstopfung", label: "Verstopfung", hint: "Abfluss, WC, Leitung", iconKey: "drain" },
    { value: "Leck", label: "Leck", hint: "Tropft, feucht, Wasserschaden", iconKey: "drop" },
    { value: "Dachschaden", label: "Dachschaden", hint: "Undicht, Sturmschaden", iconKey: "roof" },
    ...FIXED_CATEGORIES,
  ],

  history: [
    {
      year: 2001,
      title: "Gr\u00fcndung",
      description: "Walter Leuthold gr\u00fcndet seinen Sanit\u00e4r- und Spenglereibetrieb in Oberrieden.",
    },
    {
      year: 2024,
      title: "\u00dcber 20 Jahre am Z\u00fcrichsee",
      description:
        "Seit \u00fcber zwei Jahrzehnten betreut Walter Leuthold Privathaushalte und Liegenschaften am linken Z\u00fcrichseeufer \u2014 pers\u00f6nlich, zuverl\u00e4ssig und rund um die Uhr erreichbar.",
    },
  ],

  theme: {
    profile: "naehe",
    heroStyle: "center",
    colorMode: "warm",
    fontFamily: "dm-sans",
    sectionOrder: ["reviews", "serviceArea", "services", "contact"],
    serviceLayout: "stacked",
    reviewStyle: "carousel",
    animation: "slide",
    buttonStyle: "pill",
    sectionDivider: "space",
  },
};
