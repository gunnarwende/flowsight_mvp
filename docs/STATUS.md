# FlowSight — STATUS (Company SSOT)

**Datum:** 2026-03-01 (N2 shipped)
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
| **Voice** (Telefon Intake) | LIVE ✅ | Dual-Agent DE/INTL, PLZ digit-by-digit, Language Gate |
| **Ops Dashboard** | LIVE ✅ | /ops — Light Theme, Sidebar, FS-XXXX, Timeline, Manual Cases, KPI-Cards, CSV-Export |
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
| Brunner Haustechnik AG (Thalwil) | brunner-haustechnik | voice, wizard, ops, reviews | DEMO — fiktiver Showroom-Tenant, Voice +41 44 505 48 18 |

## Aktueller Stand

- **12 Module LIVE.** Alles deployed und funktional.
- **E2E Test:** Founder hat am 01.03. E2E durchgeführt → **17 Findings, 3 Blocker.**
- **BLOCKER:** N19 (Mobile Login), N20 (Voice PLZ Readback), N21 (Retell 188 Telefonnummer)
- **Go-Live kritisch:** N17 (Case Detail Redesign — 5 UX-Bugs), N18 (Case List UX — 5 UX-Bugs)
- **Nächster Schritt Founder:** 02.03. 04:00–12:00 Sales (Prospect-Websites + E-Mails). N21 bei Retell Support melden.
- **Nächster Schritt CC:** Blocker N19 + N20 fixen, dann N17 + N18.

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
| `docs/archive/` | Wave Log, alte Dokumente |

## Hobby-Plan Constraints

- Vercel: 1 console.log pro Invocation, 1h Log Retention
- Supabase Free: keine Backups, 500 MB Storage
- Resend Free: 100 emails/day, 1 Domain
- Upgrade-Trigger: `docs/runbooks/cost_triggers.md`
