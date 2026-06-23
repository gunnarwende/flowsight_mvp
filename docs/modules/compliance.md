# Modul: Compliance

> Teil der [FlowSight Bible](../flowsight_bible.md). DSG · PII · Recording-OFF ·
> Daten-Verarbeitung. (Verträge/AGB = eigenes Modul [Recht](recht.md).)

## Zweck
Sicherstellen, dass FlowSight schweizer Datenschutz (DSG) einhält und keine PII unkontrolliert nach aussen geht.

## Status heute (geerntet)
- **Recording OFF** bei Lisa (fix). **Ausgabe an Kunden = E-Mail.**
- **WhatsApp = nur Founder-Ops-Alerts, intern, ohne PII** (keine kundengerichteten Nachrichten).
- **CH-SMS-Regeln (eCall):** alphanumerische Sender, transactional only, STOP/HELP, <10/Tag, max 11 Zeichen.

## Kanonische Quelle (SSOT)
- [compliance/data_processing](../compliance/data_processing.md) (inkl. CH-SMS / eCall).
- PII-Leitplanken auch in CLAUDE.md (No-Drift) verankert.

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** `docs/compliance/`.
- **Kollidiert mit:** Betrieb (setzt die Regeln um) — Regeln hier, Umsetzung dort.

## Offen / nächster Schritt — Phase 2
- AVV/Datenfluss-Übersicht (welche Daten wo: Supabase/Retell/Resend/eCall) sauber dokumentieren.
