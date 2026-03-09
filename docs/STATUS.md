# FlowSight — STATUS (Company SSOT)

**Datum:** 2026-03-09 (PR #116: Weinberger AG Website — GTM Goldstandard)
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
| **Wizard** (Website Intake) | LIVE ✅ | /kunden/[slug]/meldung — "Was ist Ihr Anliegen?", Top-3 dynamic + fixed row (Allgemein/Angebot/Kontakt), photo upload in Step 3, branded per customer |
| **Voice** (Telefon Intake) | LIVE ✅ | Dual-Agent DE/INTL, City-only PLZ, Language Gate, SMS+Photo mention, reporter_name, deterministic closing |
| **SMS Channel** | LIVE ✅ | Post-call SMS with short correction link `/v/[id]?t=<16hex>` (~85 chars) + photo upload. Twilio alphanumeric sender. HMAC-secured. |
| **Ops Dashboard** | LIVE ✅ | /ops — Case Detail (UX v2), Case List (search, pagination, KPI click-to-filter), CSV-Export, Timeline |
| **Email Notifications** | LIVE ✅ | HTML Ops-Notification + Melder-Bestätigung + Review-Anfrage + Demo + Sales Lead |
| **Peoplefone Front Door** | LIVE ✅ | Brand-Nr → Twilio → SIP → Retell |
| **Morning Report** | LIVE ✅ | 10 KPIs, severity ampel, WhatsApp --send |
| **Marketing Website** | LIVE ✅ | flowsight.ch (homepage, pricing, legal, demo booking) |
| **Sales Voice Agent** | LIVE ✅ | "Lisa" auf 044 552 09 19, Pricing aktualisiert (Starter 199/Alltag 299/Wachstum 399) |
| **Customer Websites** | LIVE ✅ | /kunden/[slug] — SSG template (12 sections, ServiceDetailOverlay, lightbox, galleries) |
| **Customer Links Page** | LIVE ✅ | /kunden/[slug]/links — SSG, alle Kunden-URLs auf einen Blick, noindex |
| **Review Engine** | LIVE ✅ | Manual button, review_sent_at, GOOGLE_REVIEW_URL |
| **Entitlements** | LIVE ✅ | hasModule() — per-tenant module gating |
| **CoreBot** | LIVE ✅ | Telegram → GitHub Issues (Voice→STT, Photo/Doc Attachments, /ticket, /status) |
| **Demo-Strang** | LIVE ✅ | /brunner-haustechnik — High-End Demo + Voice Agent Intake+Info |
| **BigBen Pub** | LIVE ✅ | /bigben-pub — Custom Demo (Reservierungen, Events, Galerie, Google Reviews) |

## Kunden (7 Websites live)

| Kunde | Slug | Module | Status |
|-------|------|--------|--------|
| Dörfler AG (Oberrieden) | doerfler-ag | voice, wizard, ops, reviews | PARTIAL — 3/4 PASS |
| Brunner Haustechnik AG (Thalwil) | brunner-haustechnik | voice, wizard, ops, reviews, sms | DEMO-Tenant |
| Walter Leuthold (Oberrieden) | walter-leuthold | wizard | Website LIVE |
| Orlandini Sanitär (Horgen) | orlandini | wizard | Website LIVE |
| Widmer H. & Co. AG (Horgen) | widmer-sanitaer | wizard | Website LIVE |
| **Jul. Weinberger AG (Thalwil)** | weinberger-ag | wizard | **GTM Goldstandard** — Website LIVE |
| BigBen Pub (Zürich) | bigben-pub | — | Custom Demo |

## Aktueller Stand

- **16 Module LIVE.** +1 Kunde: Jul. Weinberger AG (GTM Goldstandard).
- **44 Commits seit 04.03.** (PRs #53–#116).
- **Web-Engine Abschluss (08.03.):** Alle 6 Customer-Websites auf einheitlichem Standard. Dörfler: Hero, 6 Services mit Bullets+Bildern, 11-Punkt-Historie, Team verifiziert, Reviews zentriert, Karriere-Template fliessend. Brunner: 6 Services, Hero, 8er-Team mit Teamfoto (Two-Column Layout). Template: teamPhoto-Support, Careers-Gradient, Reviews-Centering.
- **Website-Template v3 (08.03.):** ServiceDetailOverlay + Bullets + per-Service Galleries + Lightbox z-[200] + Mobile Gallery Arrows. Standardisierter 10-Regeln Intake-Prozess.
- **Wizard Restructure (09.03.):** "Anliegen melden" statt "Schaden melden", Top-3 dynamische Kategorien + fixe Reihe (Allgemein/Angebot/Kontakt), Photo Upload in Step 3 (statt Success-Screen), Summary entfernt. Gilt für alle Kunden-Wizards + Brunner Demo.
- **Voice Agent v4 (07.03.):** reporter_name, deterministic ß→ss, farewell no-repeat, end_call tool, dynamic SIP routing.
- **Sales Agent Pricing (08.03.):** Starter CHF 199, Alltag CHF 299, Wachstum CHF 399 (war 99/249/349).
- **Scout Tooling (06.03.):** ICP Scoring, Multi-Query, Municipality Scouting, Prospect Pipeline ready.
- **BigBen Pub (06.03.):** Custom Demo für Gastronomie-Prospect. Reservierung, Events, Galerie, Google Reviews. Zeigt Template-Flexibilität.
- **Docs-Standard (08.03.):** `docs/customers/<slug>/links.md` = PFLICHT pro Kunde.
- **Weinberger AG Website (09.03.):** GTM Goldstandard. 5 Services (Sanitär, Heizung, Lüftung, Badsanierung, Kundendienst), 24h Notdienst, 17 echte Bilder, 4.4★/20 Reviews, Brand #004994, Geschichte seit 1912, 3 Lehrstellen. Alle Daten verifiziert (Goldene Regel #1). PR #116.
- **GTM Foundation (09.03.):** 9/10 Building Blocks done. G1-G10 (ausser G2 B-Quick). Pipeline.csv mit Leckerli-Spalten + Weinberger Goldstandard. Weinberger D+B-Full live.
- **BLOCKER:** Keine. Go-Live möglich.
- **Nächster Schritt:** G2 B-Quick Demo-Agent (einziger offener Block). Dann Weinberger C (E2E) + Quick Wins (Leuthold, Orlandini, Widmer mit B-Quick). Offene Issues #79/#80 (BigBen Pub), #81 (Voice Handy).

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
| `docs/gtm/gtm_pipeline_plan_v2.md` | GTM-Strategie (Leckerli A-D, Weinberger Goldstandard) |
| `docs/gtm/gtm_tracker.md` | GTM Execution-Tracker (G1-G10 Building Blocks) |
| `docs/sales/pipeline.md` | Sales Pipeline Tracker |
| `CLAUDE.md` | Repo-Guardrails, Conventions |
| `docs/customers/<slug>/status.md` | Pro-Kunde Status |
| `docs/customers/<slug>/links.md` | Kunden-URLs (PFLICHT pro Kunde) |
| `docs/customers/<slug>/prospect_card.json` | Prospect Card (GTM, ab G1) |
| `docs/gtm/quality_gates.md` | Quality Gates Checklist (G8) |
| `docs/architecture/contracts/prospect_card.md` | Prospect Card JSON Contract |
| `docs/runbooks/provisioning_prospect.md` | Provisioning Runbook (<25 Min, G3) |
| `docs/gtm/video_template.md` | Video-Produktions-Template (G4) |
| `docs/gtm/outreach_templates.md` | Premium Outreach-Templates (G5) |
| `docs/gtm/einsatzlogik.md` | Einsatzlogik-Engine (G6) |
| `docs/customers/lessons-learned.md` | Intake-Prozess, Template-Learnings, Kunden-Learnings |
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
