# FlowSight — STATUS (Company SSOT)

**Datum:** 2026-02-26
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
| **Ops Dashboard** | LIVE ✅ | /ops — cases, scheduling, ICS invite, attachments, reviews |
| **Email Notifications** | LIVE ✅ | Ops notification + reporter confirmation + review request |
| **Peoplefone Front Door** | LIVE ✅ | Brand-Nr → Twilio → SIP → Retell (E2E verified) |
| **Morning Report** | LIVE ✅ | 10 KPIs, severity ampel, WhatsApp --send |
| **Marketing Website** | LIVE ✅ | FlowSight GmbH (homepage, pricing, legal, demo booking) |
| **Demo Booking** | LIVE ✅ | /api/demo → E-Mail an Founder (Resend) |
| **Customer Websites** | LIVE ✅ | /kunden/[slug] — SSG template (12 sections, lightbox, wizard CTA) |
| **Review Engine** | LIVE ✅ | Manual button, review_sent_at, GOOGLE_REVIEW_URL |
| **Entitlements** | LIVE ✅ | hasModule() — per-tenant module gating |

## Kunden

| Kunde | Slug | Module | Go-Live |
|-------|------|--------|---------|
| Dörfler AG (Oberrieden) | doerfler-ag | voice, wizard, ops, reviews | PARTIAL — 3/4 Module PASS, Reviews blocked (F9) |

Details: `docs/customers/doerfler-ag/status.md`

## Aktueller Stand

- **40h Go-Live Sprint** läuft — CC Block 1+2+3 DONE, Block 4-7 offen
- **Go-Live Blocker:** Keiner mehr. F9 (Google Review Link) ist NICHT Go-Live-kritisch — wird nachgerüstet.
- **Founder P0:** F10 DONE, F5 PASS, F2 PASS. F11 PARTIAL (Founder Blocks B-F offen).
- **Founder P1:** F6 DONE, F1 DONE, F3 DOCUMENTED
- **Founder P2:** F12, F4, F7 — parked (trigger-based)
- **CC:** Block 4 (Ops Screenshot), Block 6 (Voice Smoke), Block 7 (E2E Evidence) next. Block 5 wartet auf Founder Mobile QA.
- **Customer Website Template:** Shipped. Neuer Kunde = 1 Config-Datei + 1 Registry-Zeile.

Vollständiger Execution-Plan + Sprint-Tracking: `docs/OPS_BOARD.md`

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

### Tier 4 — Archiv (Audit Trail)

| Dokument | Inhalt |
|----------|--------|
| `docs/archive/wave_log.md` | Chronologische Wave-History (W1-W26) |
| `docs/archive/north_star_v1.md` | Ursprünglicher Launch-Plan (Phase 1, abgeschlossen) |

## Hobby-Plan Constraints

- Vercel: 1 console.log pro Invocation, 1h Log Retention
- Supabase Free: keine Backups, 500 MB Storage
- Resend Free: 100 emails/day, 1 Domain
- Upgrade-Trigger: `docs/runbooks/cost_triggers.md`
