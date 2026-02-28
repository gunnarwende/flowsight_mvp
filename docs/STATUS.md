# FlowSight — STATUS (Company SSOT)

**Datum:** 2026-02-28 (Demo-Strang v3 — Kachel-Layout, neue Bilder, Team-Gruppenfoto)
**Owner:** Founder + CC (Head Ops)

## Was ist FlowSight?

Multi-tenant Intake→Ticket→Dispatch SaaS für Schweizer Sanitär-/Heizungsbetriebe.
Kernnutzen: Geschwindigkeit + Klarheit. Notfälle sofort als Ticket (Voice), geplante Fälle via Wizard (Website).

## Tech Stack

| Layer | Technologie | Plan |
|-------|------------|------|
| Frontend + API | Next.js App Router (Vercel) | Hobby (Free) |
| Datenbank | Supabase (PostgreSQL + Storage + Auth) | Free |
| Voice | Retell AI (Dual-Agent DE/INTL) → Twilio SIP → Peoplefone | Pay-as-you-go |
| Email | Resend (Transaktional) | Free |
| Monitoring | Sentry (Error Tracking + Alerts) | Free |
| Ops Alerts | WhatsApp via Twilio REST (Founder-only, system RED) | Sandbox |

## Was ist live?

| Modul | Status | Evidence |
|-------|--------|----------|
| **Wizard** (Website Intake) | LIVE ✅ | /wizard + /doerfler-ag/meldung → case → email |
| **Voice** (Telefon Intake) | LIVE ✅ | Dual-Agent DE/INTL, PLZ digit-by-digit, Language Gate |
| **Ops Dashboard** | LIVE ✅ | /ops — Light Theme, Sidebar, seq_number (FS-XXXX), Timeline (case_events), Manual Cases, KPI-Cards, CSV-Export, Dropdown-Filter, Google Maps Links |
| **Email Notifications** | LIVE ✅ | Ops notification + reporter confirmation + review request |
| **Peoplefone Front Door** | LIVE ✅ | Brand-Nr → Twilio → SIP → Retell (E2E verified) |
| **Morning Report** | LIVE ✅ | 10 KPIs, severity ampel, WhatsApp --send |
| **Marketing Website** | LIVE ✅ | FlowSight GmbH (homepage, pricing, legal, demo booking) |
| **Demo Booking** | LIVE ✅ | /api/demo → E-Mail an Founder (Resend) |
| **Sales Voice Agent** | LIVE ✅ | "Lisa" auf 044 552 09 19, DE/INTL dual-agent, Lead-E-Mail an Founder, KI-Disclosure |
| **Customer Websites** | LIVE ✅ | /kunden/[slug] — SSG template (12 sections, lightbox, wizard CTA) |
| **Review Engine** | LIVE ✅ | Manual button, review_sent_at, GOOGLE_REVIEW_URL |
| **Entitlements** | LIVE ✅ | hasModule() — per-tenant module gating |
| **Demo-Strang** | LIVE ✅ | Brunner Haustechnik AG (fiktiv), High-End Custom Page (10 Sections, Unsplash, Lightbox), 10 Seed Cases, Wizard tenant routing, Dashboard tenant filter, Runbook |

## Kunden

| Kunde | Slug | Module | Go-Live |
|-------|------|--------|---------|
| Dörfler AG (Oberrieden) | doerfler-ag | voice, wizard, ops, reviews | PARTIAL — 3/4 Module PASS, Reviews blocked (F9) |
| Brunner Haustechnik AG (Thalwil) | brunner-haustechnik | voice, wizard, ops, reviews | DEMO — fiktiver Showroom-Tenant mit 10 Seed Cases |

Details: `docs/customers/doerfler-ag/status.md`

## Aktueller Stand

- **Demo-Strang v3 Redesign** shipped ✅ — Komplett-Redesign nach Founder-Feedback: Hero=Luxus-Bad (statt Baustelle), Leistungen=Kachel-Grid (statt Akkordeon), Sanitär=High-End-Bäder (Freistehende Wanne, Walk-in, Designer-Vanity), Heizung=Technikräume+Wärmepumpen, Boiler=Industrieboiler+Techniker, Team=1 Gruppenfoto+8 Namensschilder (statt 3 Einzelporträts), Nav=Telefon-Button. Commit a35231f.
- **Demo-Strang v2 Polish** shipped ✅ — BrunnerWizardForm (light theme, Brunner-Branding, mobile-first). Commit 0a4fe76.
- **Demo-Strang v2 High-End Showcase** shipped ✅ — Custom Demo Page `/brunner-haustechnik` mit 10 ICP-optimierten Sections (Hero, Services+Lightbox, Notfall, Google Reviews 4.8★/52, Process, Team, Map, Karriere, Kontakt). Kontrast-Fix Template. Commit b5cdc76.
- **40h Go-Live Sprint** — CC Blocks alle DONE (10/10 + W1–W4). Founder Blocks A-G teilweise erledigt.
- **2 bekannte Bugs:** N12 (Aktionen ohne Speichern-Zwang), N13 (Kachelhöhe Kontakt↔Falldetails). Tracked in OPS_BOARD.md.
- **Go-Live Blocker:** Keiner. F9 (Google Review Link) ist NICHT Go-Live-kritisch.
- **Nächster Schritt CC:** 2 Bugs (N12, N13) fixen. Danach bereit für NEXT-Phase (trigger-basiert nach Go-Live).
- **Nächster Schritt Founder:** E2E Go-Live Checklist (6 Tests, ~4h) → Go/No-Go Entscheid.
- **SSOT konsolidiert:** `open_tasks.md` → Archiv. OPS_BOARD.md = einziger Task-Tracker.

Vollständiger Execution-Plan + alle offenen Tasks: `docs/OPS_BOARD.md`

## Fixe Entscheidungen (No Drift)

- Voice: Intake-only, max 7 Fragen, sanitär-spezifisch, Recording OFF
- Output: E-Mail (Kunden). WhatsApp: Founder-only Ops Alerts (system RED, keine PII)
- SSOT: Supabase (tenants + cases). Vercel Env = Secret SSOT.
- Deploy: Vercel, Root Directory = src/web. Kein Vercel CLI im Repo.
- Secrets: Niemals ins Repo. Keine .env Dateien committen.
- Evidence-first: Jede Welle endet mit messbarer Evidence.

## SSOT Dokument-Map

Wer FlowSight verstehen will, liest diese Dateien in dieser Reihenfolge:

### Tier 1 — Business-Überblick (Start hier)

| Dokument | Inhalt | Wer pflegt |
|----------|--------|-----------|
| `docs/STATUS.md` | Was ist FlowSight, was ist live, aktueller Stand | CC + Founder |
| `docs/OPS_BOARD.md` | Roadmap, Execution-Plan, Founder Backlog (P0/P1/P2) | CC |
| `CLAUDE.md` | Repo-Guardrails, fixe Entscheidungen, Conventions | CC |

### Tier 2 — Kunden & Produkt

| Dokument | Inhalt | Wer pflegt |
|----------|--------|-----------|
| `docs/customers/<slug>/status.md` | Pro-Kunde: Module, Status, Telefonnummern, Evidence | CC + Founder |
| `docs/architecture/contracts/case_contract.md` | Case-Datenmodell (Shape, Felder, Producer/Consumer) | CC |
| `docs/architecture/env_vars.md` | Alle Environment Variables (Registry) | CC |
| `docs/compliance/data_processing.md` | Subprocessors, Datenflüsse, Retention, Löschung | CC |

### Tier 3 — Operations & Security

| Dokument | Inhalt | Wer pflegt |
|----------|--------|-----------|
| `docs/runbooks/onboarding_customer_full.md` | Neukunde Setup (~55 min voice / ~25 min wizard) | CC |
| `docs/runbooks/release_checklist.md` | Pre-push gates, smoke, evidence, rollback | CC |
| `docs/runbooks/access_matrix.md` | Service-Zugang, 2FA, Founder vs CC | Founder |
| `docs/runbooks/cost_triggers.md` | Vendor-Kosten, Upgrade-Trigger, Plan-Limits | Founder |
| `docs/runbooks/backup_awareness.md` | Supabase Backup-Status + Risiko | Founder |
| `docs/runbooks/90-incident-triage.md` | 5-Step Incident Flow + Evidence Pack | CC |
| `docs/runbooks/99-secrets-policy.md` | Secrets-Handling, Rotation, Incident Playbook | CC |
| `docs/runbooks/retell_agent_config.md` | Voice Agent Setup, Dual-Agent, Publish-Prozess | CC |
| `docs/runbooks/peoplefone_front_door.md` | Telefon-Routing (Peoplefone → Twilio → Retell) | CC |
| `docs/runbooks/demo_script.md` | 15-Min Demo-Skript (Brunner Haustechnik AG) | CC + Founder |

### Tier 4 — Archiv (Audit Trail)

| Dokument | Inhalt |
|----------|--------|
| `docs/archive/wave_log.md` | Chronologische Wave-History (W1-W29) |
| `docs/archive/open_tasks_v1.md` | Ursprüngliche Task-Liste (merged in OPS_BOARD.md) |
| `docs/archive/north_star_v1.md` | Ursprünglicher Launch-Plan (Phase 1, abgeschlossen) |

## Hobby-Plan Constraints

- Vercel: 1 console.log pro Invocation, 1h Log Retention
- Supabase Free: keine Backups, 500 MB Storage
- Resend Free: 100 emails/day, 1 Domain
- Upgrade-Trigger: `docs/runbooks/cost_triggers.md`
