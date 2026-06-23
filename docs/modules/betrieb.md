# Modul: Betrieb (das Produkt im laufenden Betrieb)

> Teil der [FlowSight Bible](../flowsight_bible.md). Das laufende Produkt: **Lisa**
> (Telefon-Intake) · **Leitzentrale** (Ops-Cockpit) · **Mail-Dispatch**. Berührt die
> Sterne 6–8, gehört aber keinem einzelnen — es ist das Herz, das immer läuft.
> *(„Leitzentrale" bleibt der Produkt-/UI-Name; das Modul heißt „Betrieb".)*

## Zweck
Eingehende Anfragen (Telefon/Web/Mail) laufen an einem Ort zusammen und werden sichtbar weitergeführt. Lisa nimmt auf (intake-only, max 7 Fragen, nie Preis, Recording OFF), die Leitzentrale zeigt Fälle, Mail geht an den Kunden.

## Status heute (geerntet)
- Live bei BigBen (zahlend seit 14.04.) + mehreren Pilot-Agenten (Dörfler u. a.).
- Dörfler-Schablone DE+INTL = Referenz (zielarchitektur **D105**), `is_published=true` verifiziert.
- **Adress-Vertrauens-Ampel (V9):** Schritt 1–5 gebaut & live; offen nur `callSwissPost()` verdrahten (wartet auf Swiss-Post-Credentials) → dann greifen rote Flags + SMS-Verschärfung automatisch.
- **Voice (V8): GEPARKT** — Stimme bleibt Hochdeutsch, keine Weiterentwicklung vor erstem Kunden-Feedback.

## Kanonische Quelle (SSOT)
- [zielarchitektur](../architecture/zielarchitektur.md) (Decision-Map, D105) + [contracts/case_contract](../architecture/contracts/case_contract.md).
- Code: `src/web/app/ops/` (Leitzentrale) · `src/web/app/api/` (Fall-Erstellung) · `src/web/src/lib/` · `retell/` (Voice-Agenten/Exports).
- Voice-Runbooks: `docs/runbooks/voice_*`, `retell_agent_config.md`.
- Strategie-Notizen (Roh): `docs/_strategy_notes/2026-06-22_voice-ch-und-adresse.md`, `…_stimme-produktfehler-klassifikation.md`.

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** `src/web/app/ops/`, `src/web/app/api/`, `src/web/src/lib/`, `retell/`, `docs/runbooks/voice_*`.
- **Kollidiert mit:** Stern 6 (Cockpit-Code `app/aufbau/` ist getrennt → wenig Überlapp); Compliance (PII-Regeln) als Leitplanke.

## Offen / nächster Schritt
- `callSwissPost()` verdrahten, sobald Swiss-Post-Zugang da ist → Ampel scharf.
