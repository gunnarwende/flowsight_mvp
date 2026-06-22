# Demo-Architektur — Beweis-Seite als Cockpit-Vorschau

> **STATUS: DRAFT (2026-06-22)** — der **strukturelle Rahmen** der neuen Beweis-Seite (Customer-Journey
> Stern 3–4). **Erst der Rahmen, dann der Inhalt.** Wandert nach Founder-Bestätigung in die
> PIPELINE_BIBLE / CUSTOMER_JOURNEY_BIBLE.
> Verwandt: `docs/_strategy_notes/2026-06-21_ausrichtung.md` (Rückgrat „kein Auftrag geht verloren",
> Demo-Grundstruktur 1–3 Mann, Lisa-Selbst-Training/Cockpit).

## Warum neu (nicht nur Inhalt, sondern Struktur)
Die heutige Beweis-Seite = **4 gestapelte Videos** (Bunny), Skript ~6 Wochen alt, aufgenommen **bevor der
Customer Journey existierte**. Das war ein **Playlist-Relikt** aus dem alten Modell „erst Cold-Mail, dann
2–3 Tage später anrufen". Gelernt: **erst Cold Call, dann Seite.** Die Seite muss deshalb eine
**Klick-zum-Erkunden-Karte** sein, kein passiver Stapel — und **skalierbar über Gewerke**
(Sanitär → Elektriker · Garage · Gebäudetechnik · Schreiner · Dachdecker).

## Leitidee — eine visuelle Sprache für Demo + Onboarding
Die Demo-Karte **ist die Vorschau des Cockpits, das der Betrieb selbst baut.** Erkennungs-Moment:
„Das ist **MEIN** System — ich steuere jeden Teil selbst, kein IT-Projekt, ich hab's in der Hand."
Stern 3–4 (Demo) und Stern 6 (Aufbau-Cockpit) teilen **dieselbe Konstellations-Komponente** → ein
durchgehendes Erlebnis: *gesehen → gebaut → besessen.*

## Design-Prinzip (woraus der Rahmen abgeleitet ist — nicht beliebig)
Der Rahmen macht **zwei Bedürfnisse sichtbar:**
- **Knoten-Clips → Kunden-Zufriedenheit** (was der *Anrufer* will: ernst genommen, kompetent behandelt — die **Dispositionen**).
- **Karte → Betriebs-Sicht** (nichts geht verloren, voller Überblick).
- **„Sie steuern das"-Hinweis → Kontrolle/Eigentum** (+ G11-Sandbox: „können Lisa gar nicht falsch einstellen").

## Die 3 Schichten
1. **Haken (oben, 90–120 Sek):** EIN Lead-Video (Brot-und-Butter-Fall aus der Grundstruktur), Rückgrat-gerahmt, mit Name/Branding. **90 % stoppen hier — und das verdient den Anruf.**
2. **Interaktive Karte (beim Aufklappen):** 3 Kanäle **Lisa · Website · Vor-Ort → Leitsystem**, in Markenfarbe + Name, **jeder Knoten klickbar** + „Sie steuern das". Der Voice-Agent ist EIN Knoten, nicht das Ganze.
3. **Modul-Tiefe (auf Klick):** pro Knoten ein kurzer Clip (Lisa / Wizard / Leitsystem / Bewertung) — die T1–T4-Inhalte, **on-demand statt linear**.

## Architektonische Mehrwerte (Journey-weit gedacht)
- **M1 · Karte = Discovery-Instrument (Stern 4→5).** Klick-Tracking pro Knoten → der Morning-Report sagt **vor dem warmen Anruf**, *was* ihn interessiert („3× Bewertungs-Knoten → führe den Call mit Reviews"). Die Demo **bereitet Stern 5 vor**, statt nur zu zeigen.
- **M2 · Eine Komponente, vier Touchpoints (Effizienz + Kohärenz).** Die Konstellation wird **EINMAL** gebaut und wiederverwendet: (a) Demo-Seite, (b) Cockpit-Aufbau, (c) **E-Mail-Standbild** (Handy zeigt *ihr* Leitsystem, per Tenant generiert), (d) /ops. Build-once, journey-wide.
- **M3 · „Sie steuern das" entschärft Einwände vorab (Stern 5).** Der sichtbare Steuer-Hinweis + G11 beantworten „unsere Kunden wollen keine KI" (Stern-5 §7.8) und „was, wenn Lisa was Falsches sagt" (§7.10) **architektonisch — bevor der Einwand kommt.**
- **M4 · Leitsystem-Knoten = echte /ops-Vorschau (Stern 6–8).** Der Leitsystem-Knoten zeigt die **echte Leitzentrale**, die er täglich nutzen wird — plus Teaser **Wochen-Rapport** (Churn-Versicherung, Stern 8). Die Demo zeigt den **ganzen Lebenszyklus**, nicht nur Intake.
- **M5 · Config-getrieben statt neuer Code (Skalierung = die Matrix).** Gewerk/Größe/Variante = ein **Config** (angedockt an `tenant_config`, die Through-Line) → Szenario, Knoten-Labels, Branding tauschen. **Neue Branche = Config + Clips, kein Code.** Progressive Befüllung: ein Gewerk startet mit Lead-Video + Karte; Knoten-Clips wachsen nach.

## Tool-Unabhängigkeit
Die Karte ist **unsere** UI (React/SVG). Bunny serviert nur die Video-Bytes. Die **Struktur ist unsere** —
der Video-Host ist austauschbar, ohne die Architektur anzufassen. „Bunny ersetzen" ist NICHT der Punkt;
die **Seitenarchitektur** ist es.

## Baureihenfolge (die Woche)
1. **Rahmen/Hülle zuerst:** Karte + Knoten-Mechanik + „Sie steuern das" + 3-Schichten-Layout — **Gewerk-neutral**.
2. **Konstellations-Komponente so bauen, dass das Cockpit sie mitnutzt** (M2).
3. **Dann befüllen:** Sanitär × 1–3 Mann (Lead-Video + Knoten-Clips) → danach Gewerk für Gewerk kopieren.

## Journey-Mapping
| Stern | Was die Architektur liefert |
|---|---|
| **3 Simulation** | Karte + Lead-Video pro Betriebstyp (config-getrieben, M5) |
| **4 Gesehen** | Klick-/Watch-Signal pro Knoten (MR2) |
| **5 Verkaufsgespräch** | Discovery-Signal (M1) + vorab entschärfte Einwände (M3) |
| **6 Aufbau** | dieselbe Konstellation, jetzt live konfigurierbar (M2) |
| **8 Begleitung** | Leitsystem-/Rapport-Vorschau im Knoten (M4) |

## Offen / zu entscheiden
- Lead-Fall final (Neuer Auftrag/Offerte = Default).
- „Sie steuern das"-Darstellung: wie viel Cockpit-Andeutung, ohne die Karte zu überladen.
- Karte technisch: **bestehende Cockpit-Konstellation erweitern** (Default = M2) vs. eigenes SVG.
- E-Mail-Standbild: aus der Karte/Leitsystem-Knoten generiert (M2) — Lesbarkeit im Thumbnail sicherstellen.
