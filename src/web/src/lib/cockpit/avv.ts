/**
 * AVV / Auftragsdatenverarbeitungs-Vereinbarung (Onboarding-Cockpit, OC6 #16).
 *
 * ⚠️ ENTWURF — RECHTLICH ZU PRÜFEN. Dieser Text ist die MECHANIK-Grundlage
 * (Anzeige + versionierte Zustimmung), NICHT der finale Rechtstext. Vor dem
 * produktiven Roll-out MUSS ein Schweizer Datenschutz-Anwalt den Inhalt prüfen
 * (revDSG/nDSG; US-Subprozessoren = offener Adäquanz-Punkt). Siehe
 * docs/gtm/onboarding/phase2_cockpit_redesign.md §D + docs/compliance/.
 *
 * Bei inhaltlicher Änderung: AVV_VERSION hochzählen → die Zustimmung wird mit
 * dieser Version + Zeitstempel protokolliert (Nachweisbarkeit).
 */

export const AVV_VERSION = "2026-06-07-entwurf";

export interface Subprocessor {
  name: string;
  zweck: string;
  ort: string;
}

/** Subprozessoren — Grundlage für die Anlage zur AVV (Founder/Anwalt finalisiert). */
export const AVV_SUBPROCESSORS: Subprocessor[] = [
  { name: "Supabase", zweck: "Datenbank, Datei-Speicher, Auth", ort: "EU (Frankfurt)" },
  { name: "Vercel", zweck: "Hosting / App-Auslieferung", ort: "EU (Frankfurt)" },
  { name: "Retell AI", zweck: "Telefon-Assistentin (Voice)", ort: "USA" },
  { name: "OpenAI", zweck: "Sprachverständnis / Transkription", ort: "USA" },
  { name: "Twilio / Peoplefone", zweck: "Telefonie / SIP", ort: "USA / CH" },
  { name: "Resend", zweck: "E-Mail-Versand", ort: "EU / USA" },
  { name: "eCall.ch", zweck: "SMS-Versand", ort: "Schweiz" },
  { name: "Sentry", zweck: "Fehler-Monitoring (keine Kundendaten)", ort: "EU" },
];

/** Kurzfassung zum Lesen im Cockpit (Entwurf). Vollvertrag = separates Dokument (Anwalt). */
export const AVV_TEXT = `Auftragsdatenverarbeitungs-Vereinbarung (AVV) — Kurzfassung (ENTWURF)

1. Gegenstand
FlowSight GmbH ("Auftragsverarbeiterin") verarbeitet im Auftrag Ihres Betriebs
("Verantwortlicher") personenbezogene Daten, ausschliesslich zur Erbringung des
Leitsystems (Anrufannahme, Fallerfassung, Benachrichtigung, Bewertungs-Workflow).

2. Rechtsrahmen
Es gilt das Schweizer Datenschutzrecht (revDSG/nDSG). FlowSight verarbeitet nur
auf dokumentierte Weisung des Verantwortlichen.

3. Datenarten
Kontaktdaten von Anrufern/Meldenden (Name, Telefon, ggf. Adresse), Anliegen-
Beschreibung, Falldaten. Datenminimierung: nur das fürs Anliegen Nötige.

4. Keine Gesprächsaufnahmen
Telefonate werden NICHT aufgezeichnet. Die Assistentin nimmt strukturiert auf,
ohne Audio-Mitschnitt zu speichern.

5. Subprozessoren
Es kommen die in der Anlage gelisteten Subprozessoren zum Einsatz (u. a. EU-
und US-Dienste). US-Übermittlungen sind ein offener Adäquanz-Punkt und werden
vor Produktivbetrieb rechtlich abgesichert.

6. Speicherort
Datenbank und Hosting in der EU (Frankfurt). SMS-Versand über einen Schweizer
Anbieter.

7. Technische & organisatorische Massnahmen
Zugriff tenant-isoliert (Row-Level-Security), verschlüsselte Übertragung,
rollenbasierter Zugriff (Leitung/Techniker).

8. Löschung
Auf Weisung des Verantwortlichen bzw. nach Vertragsende werden die Daten
gelöscht oder zurückgegeben.

— ENTWURF, anwaltlich zu prüfen (Stand ${AVV_VERSION}). Der finale, verbindliche
Vertragstext wird Ihnen vor dem Live-Gang separat zur Verfügung gestellt.`;
