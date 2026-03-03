# FlowSight — STATUS (Company SSOT)

**Datum:** 2026-03-02 (Remote-CTO Loop Day-1: CI + Telegram + Branch Protection)
**Owner:** Founder + CC (Head Ops)

## Was ist FlowSight?

Multi-tenant Intake→Ticket→Dispatch SaaS für Schweizer Handwerksbetriebe.
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
| **Voice** (Telefon Intake) | LIVE ✅ | Dual-Agent DE/INTL, City-only PLZ confirmation, Language Gate, SMS+Photo mention in closing |
| **SMS Channel** | LIVE ✅ | Post-call SMS with correction link + photo upload. Twilio alphanumeric sender. HMAC-secured public pages. |
| **Ops Dashboard** | LIVE ✅ | /ops — Case Detail (all-editable, compact 2-col), Case List (search, pagination, clickable rows), KPI-Cards, CSV-Export, Timeline |
| **Email Notifications** | LIVE ✅ | HTML Ops-Notification (urgency colors, CTA) + HTML Melder-Bestätigung + Review-Anfrage + Demo + Sales Lead |
| **Peoplefone Front Door** | LIVE ✅ | Brand-Nr → Twilio → SIP → Retell |
| **Morning Report** | LIVE ✅ | 10 KPIs, severity ampel, WhatsApp --send |
| **Marketing Website** | LIVE ✅ | flowsight.ch (homepage, pricing, legal, demo booking) |
| **Sales Voice Agent** | LIVE ✅ | "Lisa" auf 044 552 09 19, Lead-E-Mail an Founder |
| **Customer Websites** | LIVE ✅ | /kunden/[slug] — SSG template (12 sections, lightbox) |
| **Review Engine** | LIVE ✅ | Manual button, review_sent_at, GOOGLE_REVIEW_URL |
| **Entitlements** | LIVE ✅ | hasModule() — per-tenant module gating |
| **Demo-Strang** | LIVE ✅ | /brunner-haustechnik — High-End Demo (6-Service Grid, 30 Bilder, KI-Teamfoto, Voice Agent Intake+Info) |

## Kunden

| Kunde | Slug | Module | Go-Live |
|-------|------|--------|---------|
| Dörfler AG (Oberrieden) | doerfler-ag | voice, wizard, ops, reviews | PARTIAL — 3/4 PASS, Reviews blocked (F9) |
| Brunner Haustechnik AG (Thalwil) | brunner-haustechnik | voice, wizard, ops, reviews, sms | DEMO — Showroom-Tenant, Voice +41 44 505 48 18, SMS "BrunnerHT" |

## Aktueller Stand

- **13 Module LIVE.** SMS Channel als 13. Modul shipped.
- **Remote-CTO Loop Day-1 LIVE:** GitHub Actions CI (lint + build) + Telegram Notifications + Branch Protection (PR required, 1 approval). Founder kann vom Handy aus approven/shippen via GitHub Mobile + Telegram Alerts.
- **E2E Test 02.03.:** Voice ✅, E-Mail ✅, SMS ✅ (Twilio delivered, BrunnerHT Sender).
- **Demo-Feedback 02.03.:** Erste Demo mit Peter. Website/Wizard/Dashboard/Reviews top. Voice-Audio-Routing + SMS-UX + Mobile-Login als Bugs erfasst (N30-N32).
- **Erledigt:** N17 ✅, N18 ✅, N19 ✅, N20 ✅, N21 ✅, N26 (SMS) ✅ — alle Blocker gelöst
- **BLOCKER:** Keine. Go-Live möglich.
- **Vercel Region:** Frankfurt (fra1) — näher an Supabase + CH-Usern.
- **Ops Tooling:** `retell_sync.mjs` (Retell API Sync), `onboard_tenant.mjs` (Tenant Setup)
- **Nächster Schritt:** Founder aktiviert "Require status checks" im Ruleset (Checks: `lint`, `build`). CC: Backlog N27-N32.

## Fixe Entscheidungen (No Drift)

- Voice: Intake-only, max 7 Fragen, branchenspezifisch, Recording OFF
- Output: E-Mail (Kunden). WhatsApp: Founder-only Ops Alerts (system RED, keine PII)
- SSOT: Supabase (tenants + cases). Vercel Env = Secret SSOT.
- Deploy: Vercel, Root Directory = src/web
- Secrets: Niemals ins Repo

## Dokument-Map

| Dokument | Inhalt |
|----------|--------|
| `docs/STATUS.md` | Was ist live, aktueller Stand (dieses Dokument) |
| `docs/OPS_BOARD.md` | Roadmap, offene Tasks, Sales, Backlog |
| `docs/business_briefing.md` | Vollständiger Business-Kontext (für ChatGPT/Partner) |
| `docs/sales/pipeline.md` | Sales Pipeline Tracker |
| `CLAUDE.md` | Repo-Guardrails, Conventions |
| `docs/customers/<slug>/status.md` | Pro-Kunde Status |
| `docs/architecture/contracts/` | Case-Datenmodell, Env Vars |
| `docs/compliance/` | Datenschutz, Subprocessors |
| `docs/runbooks/` | Onboarding, Release, Incidents, Voice Config, Demo Script |
| `docs/briefings/` | Ad-hoc Inputs, Transkripte, Kontext-Dokumente |
| `docs/decisions/` | Decision Records (DEC-xxx) |
| `docs/templates/` | TICKET, DECISION, RESEARCH Templates |
| `.github/workflows/` | CI (lint+build) + Telegram Notifications |
| `docs/archive/` | Wave Log, alte Dokumente |

## Hobby-Plan Constraints

- Vercel: 1 console.log pro Invocation, 1h Log Retention
- Supabase Free: keine Backups, 500 MB Storage
- Resend Free: 100 emails/day, 1 Domain
- Upgrade-Trigger: `docs/runbooks/cost_triggers.md`
