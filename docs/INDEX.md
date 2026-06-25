# FlowSight — Dokumentations-Index (Wegweiser)

Der eine Einstieg in die Doku. Diese Datei hält keinen Inhalt, nur die Orientierung:
wo finde ich was, und wo liegt die verbindliche Wahrheit.

## Grundprinzip (warum das hier funktioniert)

- **Stabiles Wissen** (Strategie, Playbooks, Architektur, Entscheidungen) lebt in den Prosa-Docs unten. Ändert sich langsam.
- **Lebendiger Zustand** (was ist bei Betrieb X gerade wahr — Fälle, Voice-Config, Reservierungen) lebt im **System** (Supabase, Retell, Cockpit, Code). Die Docs zeigen darauf, sie spiegeln es nicht — sonst driftet es.
- **`docs/_archive/`** = Historie. Niemals von dort aus verlinken, als wäre es aktuell ([Regel](_archive/README.md)).
- Eine Wahrheit pro Fakt (SSOT). Bei Widerspruch gewinnt die kanonische Datei bzw. das System.

## Wenn du … hast, gehe so

| Deine Frage | Pfad |
|---|---|
| Wie funktioniert das **Business** / die Customer Journey? | [CUSTOMER_JOURNEY_BIBLE](gtm/CUSTOMER_JOURNEY_BIBLE.md) → die 3 Domänen-Bibles |
| Wie funktioniert das **System** technisch / welche Entscheidung gilt? | [zielarchitektur](architecture/zielarchitektur.md) (Decision-Map D1–D105) |
| Was ist **gerade los** / was ist offen? | [STATUS](STATUS.md) · [ticketlist](ticketlist.md) |
| Wie steht **Betrieb X**? | `customers/<slug>/status.md` → der echte Stand: Supabase / Retell / Cockpit |
| Beispiel: **Voice-Agent-Problem bei Betrieb X** | [zielarchitektur](architecture/zielarchitektur.md) (Voice-Domäne, **D105 = Dörfler-Schablone DE+INTL**) → [architecture/references/voice.md](architecture/references/voice.md) (Design-Referenz, Stand-Hinweis beachten) → **Live:** `retell/exports/doerfler_agent[_intl].json` + Retell-Dashboard |

## Einstieg (zuerst lesen)

- [flowsight_bible.md](flowsight_bible.md) — **das Dach über allem**: Module + Nordstern + Parallel-Arbeit (woran arbeite ich, wie hängt alles zusammen). INDEX bleibt die Datei-Ebene darunter.
- [business_briefing.md](business_briefing.md) — Executive-/Investor-One-Pager (Business in 5 Minuten)
- [STATUS.md](STATUS.md) — Firmen-Log + was ist live (chronologisch)

## Die zwei Orchestratoren

- [gtm/CUSTOMER_JOURNEY_BIBLE.md](gtm/CUSTOMER_JOURNEY_BIBLE.md) — **Business-SSOT**: FlowSight als eine Customer Journey / Schwungkreis (8 Sterne, Kontakt → Begleitung → Schleife).
- [architecture/zielarchitektur.md](architecture/zielarchitektur.md) — **Technische SSOT** + Decision-Map (D1–D105): welches System macht was, welche Entscheidung gilt.

## Die drei Domänen-Bibles (je ein Stück der Reise)

- [gtm/sales/SALES_BIBLE.md](gtm/sales/SALES_BIBLE.md) — Akquise. **ICP (§3) und Preis (§5) kanonisch.** Verkaufspsychologie, Einwand-One-Pager, Versand-Timing, Release-Gate.
- [gtm/onboarding/ONBOARDING_BIBLE.md](gtm/onboarding/ONBOARDING_BIBLE.md) — Cockpit-Aufbau / Go-live (inkl. Go-live-Ops, Gastro-Notiz).
- [gtm/pipeline/PIPELINE_BIBLE.md](gtm/pipeline/PIPELINE_BIBLE.md) — Video-Maschine. **§2a = Voice-Agent-Schablone (Dörfler, DE+INTL).**

## Task-Tracker

- [ticketlist.md](ticketlist.md) — der **einzige** Task-Tracker (keine zweiten Listen anlegen).

## Domänen-Docs (Tiefe)

- **`architecture/`** — `contracts/` (case_contract, **leads_contract**, role_model, **identity_contract**, prospect_*), `references/` (wizard · review · voice · flowsight_ceo_app = Design-Referenzen 03/2026 mit Stand-Hinweis), `tenant_architecture`, `env_vars`, `flowsight_ceo_app`.
- **`gtm/sales/`** — `SALES_BIBLE`, **`STERN_1_RUNBOOK`** (Lead-Motor: Go/Vollerfassung/Anreichern), `lessons_learned_sales` (S1–S19), `cold_call_script`, `gespraechskarte`, `FlowSight_Customer_Journey_SSOT`, `CTA`, `phase1_gespraech_playbook`, `stern5_…`, `templates/email_nicht_erreicht`.
- **`gtm/onboarding/`** — `lessons_learned`, `cockpit_*`, `phase2_*`, `playbook_6_phases`, `customer_runbook_template`, `OC6_HANDOFF`.
- **`gtm/pipeline/`** — `NEUER_BETRIEB_VIDEO_RUNBOOK`, `quality_gates`, `02_crawl_extract`, `03_derive_config`, `feedback/versand_timing_analyse`, `master_takes/_delivery/*`.
- **`gtm/icp/`** — `stresstest_*`, `market/`.
- **`modules/marke/`** — `brand_system`, `wording_glossar`, `gbp/`, `LinkedIn/`, `OPS/`, `assets/` (style_dna + feedback + speech_clone → `_archive/`).
- **`runbooks/`** — Ops-/Setup-Runbooks (Voice, Kalender, SMS, Provisioning, Incident …). **Arbeitsweise:** [`session_ritual.md`](runbooks/session_ritual.md) (Tagesabschluss + Handy-Tipps) · [`mobile_ops.md`](runbooks/mobile_ops.md) (Live-Ops vom Handy).
- **`modules/compliance/`** — `data_processing` (inkl. CH-SMS / eCall).
- **`sales/`** — `leads.csv` (+ `leads.md`) *(Legacy CSV-Ära — SSOT ist jetzt die `leads`-DB / `/ceo/journey`)*, `crawl_feedback`, `pipeline`, `discovery_questions`.

## Kunden (dünn — Live-Stand liegt im System)

`customers/<slug>/` hält pro Betrieb nur:
- `status.md` — der menschenlesbare Log (wo steht der Betrieb, welche Entscheidungen),
- `links.md` — Website-/Wizard-/Links-URLs (Pflicht),
- `founder_review.md` — Pipeline-Konfig-Snapshot.

Stamm-/Konfig-/Live-Daten (Fälle, Voice-Agent, Reservierungen) leben in **Supabase / `tenant_config` / Retell**, nicht in Docs.

## Archiv (nur Historie, nicht aktiv)

- [`docs/_archive/`](_archive/README.md) — abgelöste Cluster: `redesign/` (Gold-Redesign 03/2026), `gtm-website/` (Website-Modul D83-tot), `gtm-legacy/` (Pre-Bibles-Konzepte), `pipeline-history/`, `gtm-onboarding/` + `gtm-sales/` (aufgelöste Dubletten).
- `docs/archive/` — ältere Ablage (agents, briefings, north_star_v1, PIPELINE_BIBLE-Historie).

---

*Konsolidiert 2026-06-21 (377-Datei-Analyse → ~120 lebende Docs). Wissen vor jeder Archivierung in die kanonischen Docs gesichert; nichts hart gelöscht außer regenerierbarem Müll. Plan: `_consolidation_plan.md` (Arbeitsdoc, wird selbst archiviert).*
