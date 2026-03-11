# GTM Pipeline — Execution Tracker

**Erstellt:** 2026-03-09 | **Aktualisiert:** 2026-03-11 | **Owner:** CC + Founder
**Referenz:** `docs/gtm/operating_model.md`
**Regel:** CC aktualisiert nach jedem Deliverable. Founder reviewed wöchentlich.

---

## Status Snapshot

- **Phase:** Trial Machine complete — System läuft founder-arm (Monitoring, Lifecycle, Alerting)
- **Goldstandard:** Jul. Weinberger AG, Thalwil (ICP 90+, A+B+C+D)
- **Bausteine:** 10/10 done (G2 eliminiert — immer B-Full). G11+G12 DONE.
- **Weinberger Website:** LIVE ✅ (PR #116)
- **Weinberger Lisa:** PUBLISHED ✅ (PR #118) — Quality Wave v2 (PRs #126+#127)
- **Weinberger C (E2E):** TESTBAR ✅ — Founder kann jederzeit E2E durchspielen
- **Nächster Schritt:** Founder-Actions (Video, Outreach, Dörfler Trial) — siehe `docs/runbooks/reise_checklist.md`

---

## Building Blocks (G1–G12)

### Kritischer Pfad (für ersten Prospect-Durchlauf)

| # | Baustein | Owner | Status | Aufwand |
|---|---------|-------|--------|---------|
| G10 | **GTM SSOT Docs** — Plan v2 + Tracker im Repo | CC | **DONE** ✅ | ~1h |
| G1 | **Prospect Card Format** — Strukturiertes JSON | CC | **DONE** ✅ | ~3h |
| G9a | **Weinberger Website** (Leckerli D) | CC | **DONE** ✅ (PR #116) | ~4h |
| G9b | **Weinberger Lisa** (Leckerli B-Full) | CC | **DONE** ✅ (PR #118 + #126+#127) | ~2h |
| G4 | **Video-Template** — 5-Szenen-Skript | CC + ChatGPT | **DONE** ✅ | ~2h |
| G5 | **Premium Outreach-Templates** — Email/Call-Script, 2 Tiers (HOT/WARM) | CC | **DONE** ✅ | ~1h |
| G3 | **Provisioning Runbook (<25 Min)** | CC | **DONE** ✅ | ~2h |
| G8 | **Quality Gates Checklist** | CC | **DONE** ✅ | ~1h |

### Skalierung + Ops

| # | Baustein | Owner | Status | Aufwand |
|---|---------|-------|--------|---------|
| ~~G2~~ | ~~B-Quick Demo-Agent~~ | — | **ELIMINIERT** — immer B-Full (PR #131) | — |
| G6 | **Einsatzlogik-Engine** — ICP → Leckerli-Paket | CC | **DONE** ✅ | ~1h |
| G7 | **Pipeline Tracker Upgrade** — pipeline.csv + Felder | CC | **DONE** ✅ | ~2h |
| G11 | **Trial Lifecycle Runner** — Idempotent Tick, Day 7-14 Milestones | CC | **DONE** ✅ (PR #136) | ~4h |
| G12 | **Monitoring-Härtung** — Morning Report Cron, Tick Alerts, Deep Health | CC | **DONE** ✅ (PRs #138+#139) | ~3h |

---

## Weinberger AG — Goldstandard Tracker

| Leckerli | Was | Status | Evidence |
|----------|-----|--------|----------|
| **D** | Website (Services, Team, Reviews, Notdienst, Galerie, Wizard) | **DONE** ✅ | PR #116 — 5 Services, 17 Bilder, 24h Notdienst, 4.4★/20 Reviews |
| **B-Full** | Eigener Voice Agent (Lisa, Greeting, Triage, Kategorien) | **DONE** ✅ | PR #118 + Quality Wave #126+#127 — PLZ→City, Notfall-Empathie v2 |
| **C** | E2E Proof (Tenant, SMS, Ops-Fall, Samstag-Nacht-Test) | **TESTBAR** ✅ | Review Surface ready. Founder kann jederzeit E2E durchspielen. |
| **A** | Video (5 Szenen, 45-60s, Founder-Aufnahme) | OFFEN | Founder |
| **Outreach** | Email + Testnummer + URL + Video | OFFEN | Founder |

---

## Downstream Impact Tracker

| System | Änderung | Status |
|--------|---------|--------|
| **Wizard** | "Anliegen" statt "Schaden", Top-3 + fixed row | **DONE** ✅ (PR #113) |
| **pipeline.csv** | + leckerli_paket, lisa_status, video_status, website_status, testnummer | **DONE** ✅ |
| **Trial Lifecycle** | provision_trial.mjs, offboard_tenant.mjs, tick route, Welcome Page | **DONE** ✅ (PR #136) |
| **Monitoring** | Morning Report Cron, Tick Alerts, Deep Health, Reise-Checklist | **DONE** ✅ (PRs #138+#139) |
| **retell_sync.mjs** | Keine Änderung nötig | ✅ |
| **Kunden-Template** | Keine Änderung nötig | ✅ |
| **prospect_pipeline.mjs** | + Prospect Card Output, + --demo-only | OFFEN |
| **scout.mjs** | + leckerli_recommendation, + best_demo_case | OFFEN |
| **FlowSight Website** | CTA-Anpassung → nach Weinberger | PAUSED |
| **Sales Agent Lisa** | Bleibt separat (kein Prospect-Entry-Point) | ✅ Entschieden |
| **Email-System** | Outreach bleibt manuell (Founder sendet) | ✅ Entschieden |
| **Supabase** | Keine prospects-Tabelle nötig (bis >30 Prospects) | ✅ Entschieden |

---

## Quick Wins (bestehende Kunden-Websites)

| Kunde | Existiert | Fehlt | Aufwand |
|-------|-----------|-------|---------|
| Walter Leuthold | Website (D) | Lisa (B-Full), Video (A) | ~25 Min |
| Orlandini | Website (D) | Lisa (B-Full), Video (A) | ~25 Min |
| Widmer Sanitär | Website (D) | Lisa (B-Full), Video (A) | ~25 Min |
| Dörfler AG | Website + Voice + Ops (B+C+D) | Video (A), Trial Go-Live | ~15 Min |

**Dörfler AG:** Erster Trial-Kunde. Persönlicher Start (Founder wohnt um die Ecke, Modus 1). Immer B-Full.

---

## Entscheidungslog

| Datum | Entscheidung | Wer |
|-------|-------------|-----|
| 2026-03-09 | GTM Pipeline v2 als Steuerungsdokument angenommen | Founder |
| 2026-03-09 | Wizard = universeller Intake (Anliegen statt Schaden) | Founder + CC |
| 2026-03-09 | Email-Outreach bleibt manuell (Founder aus eigenem Mail) | Plan v2 |
| 2026-03-09 | Sales-Lisa bleibt separat, kein Prospect-Entry-Point | Plan v2 |
| 2026-03-09 | Keine Supabase prospects-Tabelle bis >30 Prospects | Plan v2 |
| 2026-03-09 | G1–G8 Foundation komplett an einem Tag (9/10 Building Blocks) | CC |
| 2026-03-10 | Modus 1/2 Logik: Modus 1 = volle Website, Modus 2 = Extend. Modus 3 zurückgestellt. | Founder + CC |
| 2026-03-10 | Quality Wave: Voice Closing Fix + PLZ Lookup + Review Surface + Dashboard Branding | CC |
| 2026-03-11 | B-Quick eliminiert — immer B-Full (Operating Model PR #131) | Founder + CC |
| 2026-03-11 | Trial Machine: Lifecycle Runner + Monitoring-Härtung + Reise-Checklist (PRs #136–#139) | CC |
| 2026-03-11 | G11 + G12 als neue Bausteine definiert und abgeschlossen | CC |
| 2026-03-11 | Dörfler AG = erster Trial-Kunde, persönlicher Touch, Modus 1 | Founder |
