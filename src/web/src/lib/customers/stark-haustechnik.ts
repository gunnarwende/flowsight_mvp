import type { CustomerSite } from "./types";

export const starkHaustechnik: CustomerSite = {
  slug: "stark-haustechnik",
  companyName: "Stark Haustechnik GmbH",
  tagline: "Ihr zuverlässiger Partner für Sanitär, Heizung, Lüftung und Solar",
  metaDescription:
    "Stark Haustechnik GmbH — Beratung und Planung für Sanitär, Heizung, Lüftung und Energieberatung in Adliswil.",
  brandColor: "#003478",
  seoKeywords: [
    "Stark Haustechnik",
    "Sanitär Adliswil",
    "Heizung Adliswil",
    "Lüftung Zürich",
    "Energieberatung Zürichsee",
  ],

  contact: {
    phone: "+41 44 505 74 21",
    phoneRaw: "+41445057421",
    email: "info@stark-haustechnik.ch",
    address: {
      street: "Zürichstrasse 103",
      zip: "8134",
      city: "Adliswil",
      canton: "ZH",
    },
    website: "stark-haustechnik.ch",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Z%C3%BCrichstrasse+103,+8134+Adliswil,+Schweiz&t=&z=15&ie=UTF8&iwloc=&output=embed",
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
    region: "Zürich & Zimmerberg",
    gemeinden: [
      "Adliswil",
      "Zürich",
      "Langnau am Albis",
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
