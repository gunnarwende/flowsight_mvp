# Stern 3 — Simulation

> Arbeitsraum. Stabile Fakten sind SSOT in der
> [Customer Journey Bible §3](../../gtm/CUSTOMER_JOURNEY_BIBLE.md). **Abschnitt: Pipeline.**

- **Zweck (Orientierung):** Nach dem Ja baut die Pipeline die personalisierte Beweis-Seite, Mail rund 35 Minuten nach dem Anruf. Automatische Fabrik — der Kunde sieht sie nie.
- **Konversions-Ereignis:** Beweis-Seite live + Mail versandt.

## ⚠️ Live — bleibt wie es ist
Die laufende Pipeline (heute 4 Videos T1–T4) bleibt **unangetastet**, bis der Neubau bewusst startet. Dokumentieren ≠ ändern.

## Kanonische Quelle (SSOT)
- [PIPELINE_BIBLE](../../gtm/pipeline/PIPELINE_BIBLE.md) — die Video-Fabrik (`build_proof_page.mjs`, `send_outreach.mjs`, Seite `/p/[token]`, Bunny-Stream).
- Neue „click-to-explore"-Demo: `src/web/app/demo-vorschau/` (Beweis-Seite neu gedacht).
- **Neubau-Spec (WAS, in Definition):** [`gtm/pipeline/HERO_DEMO_SPEC.md`](../../gtm/pipeline/HERO_DEMO_SPEC.md) — Hero-Script + Screenflow (Cold-Strang **0–49 gelockt**, 2026-06-26).
- **Neubau-Rahmen (WARUM):** [`_strategy_notes/2026-06-22_demo-architektur.md`](../../_strategy_notes/2026-06-22_demo-architektur.md) (3 Schichten, M1–M5) + `…_demo-drehbuch-6-beats.md`, `…_demo-handwerker-review.md`.

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** diese Karte + `docs/gtm/pipeline/` + `src/web/app/demo-vorschau/` + `app/p/[token]`.
- **Kollidiert mit:** Stern 4 (teilt Demo/Tracking).

## Offen / nächster Schritt — der „Brocken" (eigener Phase-2-Strom)
Pipeline + Demo komplett neu: **Audio · Script · Text · Loom-Video · Screenflow**. Bewusst terminieren, nicht nebenbei. Erst dann die alte 13-Minuten-Variante ablösen.

**Definition läuft (2026-06-26):** Hero-Cold-Strang **0–49 gelockt** (s. [HERO_DEMO_SPEC](../../gtm/pipeline/HERO_DEMO_SPEC.md)). Offen: Hero-Schluss 49–90, WARM-Opener, Knoten-Set, Seed-Fall umstellen, Text-im-Fall (Pipeline-Bible-Neubau).
