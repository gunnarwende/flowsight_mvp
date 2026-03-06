import type { CustomerSite } from "./types";

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
        "Gesundheit, Entspannung und Hygiene \u2014 f\u00fcr Bad, K\u00fcche, Garten und Gewerbe.",
      description:
        "Frisches Wasser bringen, verbrauchtes Wasser abf\u00fchren \u2014 das ist unsere Kernkompetenz. Moderne Duschen, Unterputzsp\u00fclkasten, schwellenfreie Badewannen, K\u00fccheninstallationen und Gartenwasser. Von der kleinen Reparatur bis zur kompletten Badsanierung mit Trockenbau.",
    },
    {
      name: "Reparaturen & Wartung",
      slug: "reparaturen",
      icon: "wrench",
      summary:
        "Boilerentkalkungen, Dichtungen, Filterpatronen \u2014 schnell und zuverl\u00e4ssig.",
      description:
        "Defekte Armaturen, tropfende Duschen, verkalkte Brauseplatten, zu wenig Warmwasser oder niedriger Wasserdruck? Wir beheben das Problem und bieten Wartungsvertr\u00e4ge mit periodischen Funktionskontrollen Ihrer gesamten sanit\u00e4ren Haustechnik.",
    },
    {
      name: "Wasserenth\u00e4rtung",
      slug: "wasserenthaertung",
      icon: "water",
      summary:
        "Professionelle Entkalkung \u2014 f\u00fcr weiches Wasser und l\u00e4ngere Ger\u00e4telebensdauer.",
      description:
        "Ohne Boiler kein warmes Wasser. Ein 4-Personen-Haushalt verbraucht rund 90\u2019000 Liter Warmwasser pro Jahr. Auch sauberes Leitungswasser enth\u00e4lt Kalk, Sand und Sedimente. Regelm\u00e4ssige Entkalkung alle 3\u20135 Jahre sch\u00fctzt Ihre Anlage, spart Energie und sichert hygienisches Trinkwasser.",
    },
    {
      name: "Spenglerei \u2014 Auf dem Dach",
      slug: "spenglerei-dach",
      icon: "roof",
      summary:
        "Metalld\u00e4cher, Flachd\u00e4cher, Kamine, Lukarnen und Blitzschutz.",
      description:
        "Wo das Dach endet, muss es mit Blech abgeschlossen und dicht gemacht werden \u2014 Abdeckungen, Oberlichter, Kamine, Dachchnurchf\u00fchrungen. Wir arbeiten mit Kupfer, Chromstahl, Aluminium, Zink und Blei. Metalld\u00e4cher sind seit dem Mittelalter bew\u00e4hrt und erlauben komplexe architektonische Formen. Auch Flachdach-Abdichtung und j\u00e4hrliche Inspektionen.",
    },
    {
      name: "Spenglerei \u2014 Am Haus",
      slug: "spenglerei-haus",
      icon: "tool",
      summary:
        "Metallfassaden, Fensterb\u00e4nke, Vord\u00e4cher, Sichtschutz und Garagen.",
      description:
        "Es gibt keine langlebigere und pflegeleichtere Fassade als eine Metallfassade. Dazu Hauseing\u00e4nge mit Vordach gegen Schlagregen, Fensterb\u00e4nke aus Aluminium, Chromstahl oder Kupfer, Garagend\u00e4chli und Sichtschutz aus Streckmetall. Materialfarben lassen sich mit Einbrennlack an Ihre Fenster anpassen.",
    },
  ],

  gallery: [
    {
      name: "Sanit\u00e4r",
      slug: "sanitaer",
      images: [
        { src: `${IMG}/sanitaer/bad-luxus-01.jpg`, alt: "Luxusbad mit Regendusche und goldenen Armaturen" },
        { src: `${IMG}/sanitaer/bad-luxus-02.jpg`, alt: "Doppelwaschtisch mit Oberlicht und Glasdusche" },
        { src: `${IMG}/sanitaer/bad-mosaik.jpg`, alt: "Badewanne mit gr\u00fcnem Mosaik" },
      ],
    },
    {
      name: "Spenglerei",
      slug: "spenglerei-dach",
      images: [
        { src: `${IMG}/spenglerei/kupferdach-panorama.jpg`, alt: "Kupferdach-Eindeckung mit Panoramablick" },
        { src: `${IMG}/spenglerei/kupfer-rinne.jpg`, alt: "Kupferrinne \u2014 Detailarbeit" },
        { src: `${IMG}/spenglerei/kupfer-detail.jpg`, alt: "Kupferblech-Verarbeitung in der Werkstatt" },
        { src: `${IMG}/spenglerei/kupfer-kamin.jpg`, alt: "Kaminabdeckung aus Kupfer" },
        { src: `${IMG}/spenglerei/am-haus-eingang.jpg`, alt: "Hauseingang mit Spenglerarbeiten" },
      ],
    },
    {
      name: "Reparaturen",
      slug: "reparaturen",
      images: [
        { src: `${IMG}/reparaturen/boiler-entkalkung.jpg`, alt: "Boilerentkalkung \u2014 verkalkte Heizst\u00e4be" },
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
        author: "Kunde auf local.ch",
        rating: 5,
        text: "Geht nicht gibt\u2019s nicht, kennt man hier nicht. Umbau der Dusche, die keiner Norm entspricht, wurde nach unserem Wunsch gel\u00f6st. Vielen Dank!",
        date: "2021",
      },
      {
        author: "Kunde auf local.ch",
        rating: 5,
        text: "Auch an einem Sonntagnachmittag ist Walter Leuthold erreichbar und springt, wenn\u2019s zeitlich drinliegt, ein. Vielen Dank f\u00fcr den tollen Service!",
        date: "2018",
      },
      {
        author: "Kunde auf local.ch",
        rating: 5,
        text: "Besten Dank f\u00fcr den ausgezeichneten, zutreffenden Tipp zur Schadensbeseitigung!",
        date: "2019",
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

  // No history — not substantial enough for display
};
