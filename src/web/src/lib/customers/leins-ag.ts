import type { CustomerSite } from "./types";

export const leinsAg: CustomerSite = {
  slug: "leins-ag",
  companyName: "Leins AG",
  tagline: "Ihr zuverlässiger Partner für Spenglerei, Sanitär, Heizung und Blitzschutz",
  metaDescription:
    "Leins AG — Spenglerei, Sanitär, Heizung und Blitzschutz in Horgen. Persönlicher Service am linken Zürichseeufer.",
  brandColor: "#1e5f8c",
  seoKeywords: [
    "Leins AG",
    "Sanitär Horgen",
    "Spenglerei Horgen",
    "Heizung Horgen",
    "Blitzschutz Zürichsee",
  ],

  contact: {
    phone: "+41 44 505 74 21",
    phoneRaw: "+41445057421",
    email: "info@leins-ag.ch",
    address: {
      street: "Glärnischstrasse 18",
      zip: "8810",
      city: "Horgen",
      canton: "ZH",
    },
    website: "leinsag.ch",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Gl%C3%A4rnischstrasse+18,+8810+Horgen,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },

  emergency: {
    enabled: true,
    phone: "+41 44 505 74 21",
    phoneRaw: "+41445057421",
    label: "24h Notfall",
    description:
      "Rohrbruch, Heizungsausfall oder Wasserschaden? Wir sind rund um die Uhr für Sie erreichbar.",
  },

  services: [],

  gallery: [],

  reviews: {
    averageRating: 0,
    totalReviews: 0,
    googleUrl: "",
    highlights: [],
  },

  serviceArea: {
    region: "Linkes Zürichseeufer",
    gemeinden: [
      "Horgen",
      "Thalwil",
      "Kilchberg",
      "Rüschlikon",
      "Au ZH",
      "Richterswil",
      "Wädenswil",
      "Oberrieden",
    ],
  },

  team: [],

  voicePhone: "+41 44 505 74 21",
  voicePhoneRaw: "+41445057421",

  categories: [
    { value: "Verstopfung", label: "Verstopfung", hint: "Abfluss, WC, Kanalisation", iconKey: "drain" },
    { value: "Leck", label: "Leck", hint: "Wasserschaden, undichte Stelle", iconKey: "drop" },
    { value: "Heizung", label: "Heizung", hint: "Heizung, Wärmepumpe", iconKey: "flame" },
    { value: "Allgemein", label: "Allgemein", hint: "Sonstiges Anliegen", iconKey: "clipboard", fixed: true },
    { value: "Angebot", label: "Angebot", hint: "Offerte, Beratung", iconKey: "document", fixed: true },
    { value: "Kontakt", label: "Kontakt", hint: "Frage, Rückruf", iconKey: "chat", fixed: true },
  ],
};
