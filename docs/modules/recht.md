# Modul: Recht

> Teil der [FlowSight Bible](../flowsight_bible.md). Verträge · AGB · Haftung.
> **Dünnstes Modul** — fast nichts gebaut. Wird vor dem ersten Abschluss kritisch.

## Zweck
Die vertragliche/rechtliche Grundlage: Kundenvertrag, AGB, AVV, Haftung, Firmenangaben.

## Status heute (geerntet — was wir HABEN)
- **Kommerzielle Bedingungen (in SALES_BIBLE/Onboarding):** monatlich kündbar (Risiko-Umkehr), **kein Trial**, zahlend am Go-live, Aktivierung ≈ CHF 2'500.
- **Haftungs-Schutz im Produkt:** Lisa macht keine Preis-/Garantie-/Diagnose-/Termin-Zusagen (die „No-Gos") → gesperrte Cockpit-Leitplanken (ONBOARDING_BIBLE). Das ist faktisch gelebte Haftungsbegrenzung.
- **Noch KEIN eigenes Rechts-Dokument** im Repo (kein Vertrag, keine AGB, kein Impressum-Doc). Bewusst offen — aber die größte Lücke des Moduls.

## Kanonische Quelle (SSOT)
- Kommerzielle Bedingungen: [SALES_BIBLE](../gtm/sales/SALES_BIBLE.md) §5 / Handelsregeln.
- Datenschutz-Nachbar: [Modul Compliance](compliance/_index.md) (AVV/Datenschutzerklärung-Bezug, `revdsg_entwuerfe.md`).

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** diese Karte (+ künftig `docs/modules/recht/` mit Vertrags-Entwürfen).
- **Kollidiert mit:** Compliance (Grenze: Recht = Verträge/Haftung, Compliance = DSG/PII), Finanzen (Preis/Aktivierung im Vertrag).

## Lücke zum Nordstern — Rechts-Roadmap (was FEHLT, alles vor Roll-out mit CH-Anwalt)
Damit der **erste Abschluss** sauber unterschrieben werden kann, fehlt:

1. **Kundenvertrag (CH)** — Leistung, Preis (950/2'000 + Aktivierung 2'500), monatlich kündbar, kein Trial, Zahlung am Go-live. **Höchste Priorität** (blockiert den ersten echten Abschluss).
2. **AGB** — allgemeine Bedingungen, SLA-Erwartung („intake-only, keine Zustellung/Diagnose").
3. **AVV (Auftragsbearbeitungsvertrag)** FlowSight ↔ Betrieb — der Betrieb ist Verantwortlicher, FlowSight Auftragsbearbeiter (siehe Compliance `revdsg_entwuerfe.md` §1). Pflicht unter revDSG.
4. **Haftungsbegrenzung** explizit — Lisa = Fallback/Hilfe, keine Garantie der Erreichbarkeit/Zustellung; Schaden begrenzt.
5. **Impressum / Firmenangaben** (FlowSight GmbH) — für Website + Verträge.
6. **Kunden-Datenschutzerklärung** — gemeinsam mit Compliance (Grenze: Hinweis = Compliance, Vertragsklausel = hier).

**Priorität:** 1 + 2 + 3 zum ersten Go-live (Vertrag/AGB/AVV als Paket). 4–6 parallel. Alles **kein Rechtsrat** — Schweizer Anwalt vor Produktiv-Roll-out.
