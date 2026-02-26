// Marketing constants for FlowSight GmbH website
// Placeholders marked with TODO — Founder fills in before go-live

export const SITE = {
  name: "FlowSight",
  legalName: "FlowSight GmbH",
  tagline: "Jeder Anruf wird zum Auftrag",
  subtitle: "Das Leitsystem für Schweizer Sanitär- und Heizungsbetriebe.",
  phone: "+41 …", // TODO: Founder
  phoneRaw: "+41000000000", // TODO: Founder (for tel: links)
  email: "info@flowsight.ch",
  demoUrl: "#demo", // TODO: replace with real demo form/route
  url: "https://flowsight.ch",
  address: {
    street: "Musterstrasse 1", // TODO: Founder
    zip: "8000", // TODO: Founder
    city: "Zürich", // TODO: Founder
    country: "Schweiz",
  },
  uid: "CHE-XXX.XXX.XXX", // TODO: Founder
} as const;
