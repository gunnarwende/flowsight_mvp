# FlowSight — STATUS (Company SSOT)

**Datum:** 2026-03-04 (PR #23: Voice Tickets + Goodbye Fix + de-CH)
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
| **SMS Channel** | LIVE ✅ | Post-call SMS with short correction link `/v/[id]?t=<16hex>` (~85 chars) + photo upload. Twilio alphanumeric sender. HMAC-secured. |
| **Ops Dashboard** | LIVE ✅ | /ops — Case Detail (UX v2: full-width desc, inline Termin+Senden, 3 quick times), Case List (search, pagination, clickable rows, KPI click-to-filter), CSV-Export, Timeline |
| **Email Notifications** | LIVE ✅ | HTML Ops-Notification (urgency colors, CTA) + HTML Melder-Bestätigung + Review-Anfrage + Demo + Sales Lead |
| **Peoplefone Front Door** | LIVE ✅ | Brand-Nr → Twilio → SIP → Retell |
| **Morning Report** | LIVE ✅ | 10 KPIs, severity ampel, WhatsApp --send |
| **Marketing Website** | LIVE ✅ | flowsight.ch (homepage, pricing, legal, demo booking) |
| **Sales Voice Agent** | LIVE ✅ | "Lisa" auf 044 552 09 19, Lead-E-Mail an Founder |
| **Customer Websites** | LIVE ✅ | /kunden/[slug] — SSG template (12 sections, lightbox) |
| **Review Engine** | LIVE ✅ | Manual button, review_sent_at, GOOGLE_REVIEW_URL |
| **Entitlements** | LIVE ✅ | hasModule() — per-tenant module gating |
| **CoreBot** | LIVE ✅ | Telegram → GitHub Issues (auto-classify, /status, ACK, **Voice→STT→Issue**) |
| **Demo-Strang** | LIVE ✅ | /brunner-haustechnik — High-End Demo (6-Service Grid, 30 Bilder, KI-Teamfoto, Voice Agent Intake+Info) |

## Kunden

| Kunde | Slug | Module | Go-Live |
|-------|------|--------|---------|
| Dörfler AG (Oberrieden) | doerfler-ag | voice, wizard, ops, reviews | PARTIAL — 3/4 PASS, Reviews blocked (F9) |
| Brunner Haustechnik AG (Thalwil) | brunner-haustechnik | voice, wizard, ops, reviews, sms | DEMO — Showroom-Tenant, Voice +41 44 505 48 18, SMS "BrunnerHT" |

## Aktueller Stand

- **14 Module LIVE.** CoreBot now with Voice→STT→Issue (Whisper). Goodbye-loop fix live. de-CH orthography.
- **Remote-CTO Loop Day-2:** CoreBot ergänzt CI + Telegram + Branch Protection. Founder kann jetzt Tasks vom Handy als GitHub Issues erfassen.
- **E2E Test 02.03.:** Voice ✅, E-Mail ✅, SMS ✅ (Twilio delivered, BrunnerHT Sender).
- **Demo-Feedback 02.03.:** Erste Demo mit Peter. Website/Wizard/Dashboard/Reviews top. Voice-Audio-Routing + SMS-UX + Mobile-Login als Bugs erfasst (N30-N32).
- **Erledigt:** N17-N21 ✅, N26-N28 ✅, N30-N32 ✅ — 19/20 Bugs fixed
- **BLOCKER:** Keine. Go-Live möglich.
- **Vercel Region:** Frankfurt (fra1) — näher an Supabase + CH-Usern.
- **Ops Tooling:** `retell_sync.mjs` (Retell API Sync), `onboard_tenant.mjs` (Tenant Setup), `prospect_pipeline.mjs` (Full-Stack Prospect Onboarding, ~15min/prospect)
- **Demo-Kit:** `demo-kit/` — Komplett-Toolkit (SIP-Setup, Audio-Proof, Reset-SQL, Cheat Sheet, Twilio-Diagnose+Fix Scripts)
- **SIP Call Chain:** Twilio SIP → `/api/demo/sip-twiml` (callerId) → Retell Lisa. MicroSIP credentials: `flowsight-demo`. Verified: Call SID `CAfffc69b90813874e976ba5481258f4db` status `in-progress` (clean, 0 errors).
- **Nächster Schritt:** Kundenakquise starten. Pipeline: `node prospect_pipeline.mjs --url https://x.ch --slug x`

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
| `docs/runbooks/` | Onboarding, Release, Incidents, Voice Config, Demo Script, CoreBot Setup, Sales Agent Brief |
| `docs/briefings/` | Ad-hoc Inputs, Transkripte, Kontext-Dokumente |
| `.github/workflows/` | CI (lint+build) + Telegram Notifications |
| `docs/archive/` | Wave Log, alte Dokumente, Agent-Framework, Templates, Architecture Audits |

## Hobby-Plan Constraints

- Vercel: 1 console.log pro Invocation, 1h Log Retention
- Supabase Free: keine Backups, 500 MB Storage
- Resend Free: 100 emails/day, 1 Domain
- Upgrade-Trigger: `docs/runbooks/cost_triggers.md`
