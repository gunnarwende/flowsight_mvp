# GTM Pipeline — Execution Tracker

**Erstellt:** 2026-03-09 | **Owner:** CC + Founder
**Referenz:** `docs/gtm/gtm_pipeline_plan_v2.md` (Strategie + Architektur)
**Regel:** CC aktualisiert nach jedem Deliverable. Founder reviewed wöchentlich.

---

## Status Snapshot

- **Phase:** Woche 1 — Foundation + Weinberger Website
- **Goldstandard:** Jul. Weinberger AG, Thalwil (ICP 90+, A+B+C+D)
- **Bausteine:** 8/10 done (G1, G3, G4, G5, G6, G8, G9a, G9b, G10)
- **Prospects provisioniert:** 0/5 Ziel
- **Weinberger Website:** LIVE ✅ (PR #116)
- **Weinberger Lisa:** PUBLISHED ✅ (PR #118) — braucht noch Twilio-Nummer

---

## Building Blocks (G1–G10)

### Kritischer Pfad (für ersten Prospect-Durchlauf)

| # | Baustein | Owner | Status | Abhängigkeit | Aufwand |
|---|---------|-------|--------|-------------|---------|
| G10 | **GTM SSOT Docs** — Plan v2 + Tracker im Repo | CC | **DONE** ✅ | — | ~1h |
| G1 | **Prospect Card Format** — Strukturiertes JSON (Firma, Gewerk, Region, Services, ICP, Leckerli-Empfehlung, bester Demo-Fall) | CC | **DONE** ✅ | scout.mjs + crawl | ~3h |
| G9a | **Weinberger Website** (Leckerli D) — Crawl → Config → Deploy | CC | **DONE** ✅ (PR #116) | G1 | ~4h |
| G9b | **Weinberger Lisa** (Leckerli B-Full) — Agent → retell_sync → publish | CC | **DONE** ✅ (PR #118) | G9a | ~2h |
| G4 | **Video-Template** — 5-Szenen-Skript, OBS/Loom Setup, Variablen | CC + ChatGPT | **DONE** ✅ | B+D müssen stehen | ~2h |
| G5 | **Premium Outreach-Templates** — Email/Call-Script, Leckerli A-D Varianten | ChatGPT → CC | **DONE** ✅ | ChatGPT-Messaging | ~1h |
| G3 | **Provisioning Runbook (<25 Min)** — Step-by-Step mit Quality Gates | CC | **DONE** ✅ | G1, G2 | ~2h |
| G8 | **Quality Gates Checklist** — Pro Prospect: 5 Gates (Card, Website, Lisa, Video, Outreach) | CC | **DONE** ✅ | G3 | ~1h |

### Skalierung (nach Weinberger)

| # | Baustein | Owner | Status | Abhängigkeit | Aufwand |
|---|---------|-------|--------|-------------|---------|
| G2 | **B-Quick Demo-Agent** — 1 parametrisierter Agent mit Variablen-Slots, shared Testnummer | CC | OFFEN | Retell Dynamic Variables | ~4h |
| G6 | **Einsatzlogik-Engine** — ICP Score → Leckerli-Paket → Asset-Liste → Steps | CC | **DONE** ✅ | G1 | ~1h |
| G7 | **Pipeline Tracker Upgrade** — pipeline.csv + leckerli_paket, lisa_status, video_status, testnummer | CC | OFFEN | promote.mjs | ~2h |

**Gesamt: ~20h CC-Arbeit über 4 Wochen**

---

## Weinberger AG — Goldstandard Tracker

| Leckerli | Was | Status | Evidence |
|----------|-----|--------|----------|
| **D** | Website (Services, Team, Reviews, Notdienst, Galerie, Wizard) | **DONE** ✅ | PR #116 — 5 Services, 17 Bilder, 24h Notdienst, 4.4★/20 Reviews, Brand #004994 |
| **B-Full** | Eigener Voice Agent (Lisa, Greeting, Triage, Kategorien) | **DONE** ✅ | PR #118 — DE + INTL, published, 8 Kategorien, 24h Pikett |
| **C** | E2E Proof (Tenant, SMS, Ops-Fall, Samstag-Nacht-Test) | OFFEN | — |
| **A** | Video (5 Szenen, 45-60s, Founder-Aufnahme) | OFFEN | Founder |
| **Outreach** | Email + Testnummer + URL + Video | OFFEN | Founder |

---

## Woche 1 Plan (09.03.–14.03.)

| Tag | CC | Founder | ChatGPT |
|-----|-----|---------|---------|
| So 09.03. | G10 ✅ + Wizard ✅ + Weinberger D ✅ + B-Full ✅ + G1 ✅ + G3 ✅ + G8 ✅ + G4 ✅ + G5 ✅ + G6 ✅ | Review GTM Plan v2 | — |
| Mo 10.03. | G7: Pipeline Tracker Upgrade + G2: B-Quick Demo-Agent | Freigabe GTM Plan + Review Website + Lisa | — |
| Di 11.03. | Weinberger C (E2E Proof) | — | — |
| Mi 12.03. | Quick Wins: Leuthold + Orlandini + Widmer (B-Quick) | Review: Lisa glaubwürdig? | — |
| Do 13.03. | Weinberger A (Video) — Skript + Founder-Aufnahme | Review (Handy + Desktop) | — |
| Fr 14.03. | Buffer / Iteration / Erster Outreach | Feedback | — |

**Woche 1 Ziel:** Weinberger D ✅ + B-Full ✅ + Foundation 8/10 ✅ — MASSIV VORAUS

---

## Downstream Impact Tracker

Welche bestehenden Systeme werden durch GTM verändert:

| System | Änderung | Wann | Status |
|--------|---------|------|--------|
| **Wizard** | "Anliegen" statt "Schaden", Top-3 + fixed row | Sofort | **DONE** ✅ (PR #113) |
| **prospect_pipeline.mjs** | + Prospect Card Output, + --demo-only, + --lisa-quick | G1 | OFFEN |
| **scout.mjs** | + leckerli_recommendation, + best_demo_case | G6/G7 | OFFEN |
| **retell_sync.mjs** | Keine Änderung nötig | — | ✅ |
| **Kunden-Template** | Keine Änderung nötig | — | ✅ |
| **FlowSight Website** | CTA-Anpassung → NIEDRIG, nach Weinberger | Woche 4+ | PAUSED |
| **Sales Agent Lisa** | Bleibt separat (kein Prospect-Entry-Point) | — | ✅ Entschieden |
| **pipeline.csv** | + leckerli_paket, lisa_status, video_status, testnummer | G7 | OFFEN |
| **Email-System** | Outreach bleibt manuell (Founder sendet) | — | ✅ Entschieden |
| **Supabase** | Keine prospects-Tabelle nötig (bis >30 Prospects) | — | ✅ Entschieden |

---

## Quick Wins (nach B-Quick in Woche 2)

| Kunde | Existiert | Fehlt | Aufwand |
|-------|-----------|-------|---------|
| Walter Leuthold | Website (D) | Lisa (B-Quick), Video (A) | ~20 Min |
| Orlandini | Website (D) | Lisa (B-Quick), Video (A) | ~20 Min |
| Widmer Sanitär | Website (D) | Lisa (B-Quick), Video (A) | ~20 Min |
| Dörfler AG | Website + Voice + Ops (B+C+D) | Video (A), Go-Live | ~15 Min |

---

## Entscheidungslog

| Datum | Entscheidung | Wer |
|-------|-------------|-----|
| 2026-03-09 | GTM Pipeline v2 als Steuerungsdokument angenommen | Founder |
| 2026-03-09 | Wizard = universeller Intake (Anliegen statt Schaden) | Founder + CC |
| 2026-03-09 | Eigener Tracker `gtm_tracker.md`, OPS_BOARD verweist darauf | CC |
| 2026-03-09 | Email-Outreach bleibt manuell (Founder aus eigenem Mail) | Plan v2 |
| 2026-03-09 | Sales-Lisa bleibt separat, kein Prospect-Entry-Point | Plan v2 |
| 2026-03-09 | Keine Supabase prospects-Tabelle bis >30 Prospects | Plan v2 |
| 2026-03-09 | G1 Prospect Card: JSON-Schema v1.0 definiert, Weinberger als erste Instanz | CC |
| 2026-03-09 | G3 Provisioning Runbook: <25 Min Flow basierend auf Weinberger-Erfahrung | CC |
| 2026-03-09 | G8 Quality Gates: 5 Gates mit je 7-10 Checks, Gate-Matrix pro Paket | CC |
| 2026-03-09 | G4 Video-Template: 5-Szenen-Dramaturgie, Variablen, Loom/OBS Setup, Gewerk-Varianten | CC |
| 2026-03-09 | G5 Outreach-Templates: 3 E-Mail-Templates (nach ICP), Anruf-Script, Touch-Kadenz | CC |
| 2026-03-09 | G6 Einsatzlogik: Entscheidungstabelle + Pseudocode + Quick Wins Übersicht | CC |
