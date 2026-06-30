import type { CockpitSession } from "./types";

/**
 * Demo-/Vorschau-Session fürs Cockpit (Stern 6) — KEINE DB-Zeile.
 *
 * Speist `/aufbau/vorschau`, damit der Founder (und später ein Betrieb in der
 * Verkaufs-Demo) das Cockpit am Handy durchklicken kann, OHNE dass eine echte
 * cockpit_sessions-Zeile angelegt werden muss. Reine Fiktion: „Muster Sanitär
 * AG" — kein echter Kunde, keine PII. Im Vorschau-Modus (`preview`) schreibt das
 * Cockpit nichts an den Server; der Stand lebt nur im Browser.
 *
 * Bewusst realistisch befüllt (Sanitär, Zürichsee), damit „80 % ist vorbereitet"
 * auch in der Vorschau sicht- und fühlbar ist (default-first).
 */
export const DEMO_COCKPIT_SESSION: CockpitSession = {
  token: "vorschau",
  tenant_id: "demo",
  slug: "muster-sanitaer",
  company_name: "Muster Sanitär AG",
  prefill: {
    branding: {
      companyName: "Muster Sanitär AG",
      brandColor: "#1f5fa8",
      caseIdPrefix: "MS",
      smsSenderName: "MusterSan",
    },
    voice: {
      companyName: "Muster Sanitär AG",
      domain: "muster-sanitaer.ch",
      greetingSuggestion:
        "Guten Tag, hier ist Lisa, die digitale Assistentin von Muster Sanitär. Was kann ich für Sie tun?",
      kiDisclosureMin:
        "Ich bin Lisa, die digitale Assistentin von Muster Sanitär.",
      languagesDefault: { de: true, intl: false },
      wissen: {
        openingHours: "Montag bis Freitag, 07:30 bis 17:00 Uhr",
        openingHoursSpoken:
          "Wir sind von Montag bis Freitag, halb acht bis fünf Uhr für Sie da.",
        serviceArea:
          "Zürichsee, linkes Ufer: Oberrieden, Horgen, Thalwil, Kilchberg und Umgebung",
        serviceAreaSpoken:
          "Wir sind am linken Zürichseeufer unterwegs, von Kilchberg bis Horgen.",
        address: "Seestrasse 12, 8942 Oberrieden",
        addressSpoken: "Seestrasse zwölf, in Oberrieden.",
        servicesList:
          "Sanitär-Reparaturen, Badumbau und Sanierungen, Heizung, Entkalkungs- und Wasseraufbereitungsanlagen sowie Notfalldienst bei Rohrbruch und Wasserschaden.",
        memberships: "Mitglied bei suissetec",
        emergencyPolicy:
          "Bei Rohrbruch oder Wasserschaden sind wir im Pikettdienst erreichbar und kommen so schnell wie möglich vorbei.",
        priceDeflect:
          "Einen genauen Preis kann ich Ihnen am Telefon leider nicht nennen — das hängt von der Situation vor Ort ab. Am besten schaut sich das ein Techniker an und macht Ihnen eine unverbindliche Offerte.",
        jobsSpoken: "",
        phone: "044 720 00 00",
        email: "info@muster-sanitaer.ch",
        website: "muster-sanitaer.ch",
        googleRating: "4.8",
        ownerNames: "Markus Muster",
        founded: "1998",
        teamSection: "Markus Muster mit einem kleinen Team von zwei Technikern.",
      },
    },
    wizard: {
      categories: [
        { value: "Rohrbruch / Wasserschaden", label: "Rohrbruch / Wasserschaden" },
        { value: "Verstopfung", label: "Verstopfung" },
        { value: "Badumbau / Sanierung", label: "Badumbau / Sanierung" },
        { value: "Heizung", label: "Heizung" },
        { value: "Allgemeine Reparatur", label: "Allgemeine Reparatur" },
        { value: "Sonstiges", label: "Sonstiges", fixed: true },
      ],
      brandColor: "#1f5fa8",
    },
    review: {
      smsSenderName: "MusterSan",
      chipsDefault: ["Pünktlich", "Sauber gearbeitet", "Faire Beratung"],
    },
    hints: {
      crawledEmail: "info@muster-sanitaer.ch",
      dummyStaffNames: [],
    },
  },
  draft: {},
  progress: {},
  status: "building",
  created_at: "2026-06-30T08:00:00.000Z",
  updated_at: "2026-06-30T08:00:00.000Z",
  submitted_at: null,
  approved_at: null,
  live_at: null,
};
