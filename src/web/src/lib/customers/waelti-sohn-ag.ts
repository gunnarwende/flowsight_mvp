import type { CustomerSite } from "./types";

export const waeltiSohnAg: CustomerSite = {
  slug: "waelti-sohn-ag",
  companyName: "Wälti & Sohn AG",
  tagline: "Ihr zuverlässiger Sanitär-, Heizungs- und Solar-Partner seit 1952",
  metaDescription:
    "Wälti & Sohn AG — Sanitär, Heizung und Solar in Langnau am Albis. Persönlicher Service seit 1952.",
  brandColor: "#213a5c",
  seoKeywords: [
    "Wälti & Sohn AG",
    "Sanitär Langnau am Albis",
    "Heizung Langnau",
    "Solar Zürich",
    "Sanitär Zürichsee",
  ],

  contact: {
    phone: "+41 44 505 74 21",
    phoneRaw: "+41445057421",
    email: "info@waelti-sohn-ag.ch",
    address: {
      street: "Gartenweg 2",
      zip: "8135",
      city: "Langnau am Albis",
      canton: "ZH",
    },
    website: "waeltisohn.ch",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Gartenweg+2,+8135+Langnau+am+Albis,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed",
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
    region: "Zürich & linkes Seeufer",
    gemeinden: [
      "Zürich",
      "Langnau am Albis",
      "Adliswil",
      "Kilchberg",
      "Rüschlikon",
      "Thalwil",
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
