# FlowSight — STATUS (Company SSOT)

**Datum:** 2026-03-11 (PR #145: Gold Contact — Nordstern-Dokument finalisiert)
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
| Ops Alerts | Telegram + E-Mail (primary), WhatsApp (optional) | GH Actions + Resend |

## Was ist live?

| Modul | Status | Evidence |
|-------|--------|----------|
| **Wizard** (Website Intake) | LIVE ✅ | /kunden/[slug]/meldung — "Was ist Ihr Anliegen?", Top-3 dynamic + fixed row (Allgemein/Angebot/Kontakt), photo upload in Step 3, branded per customer |
| **Voice** (Telefon Intake) | LIVE ✅ | Dual-Agent DE/INTL, PLZ→City auto-lookup (24 Orte), Language Gate, SMS+Photo mention, reporter_name, deterministic closing, Notfall-Empathie, FAQ-safe edge logic |
| **SMS Channel** | LIVE ✅ | Post-call SMS with short correction link `/v/[id]?t=<16hex>` (~85 chars) + photo upload. Twilio alphanumeric sender. HMAC-secured. |
| **Ops Dashboard** | LIVE ✅ | /ops — Case Detail (UX v2), Case List (search, pagination, KPI click-to-filter), CSV-Export, Timeline |
| **Email Notifications** | LIVE ✅ | HTML Ops-Notification + Melder-Bestätigung + Review-Anfrage + Demo + Sales Lead |
| **Peoplefone Front Door** | LIVE ✅ | Brand-Nr → Twilio → SIP → Retell |
| **Morning Report** | LIVE ✅ | 15 KPIs + Trial Status + Deep Health, GH Actions Cron (daily 07:30 UTC), Telegram + E-Mail (RED/YELLOW) |
| **Marketing Website** | LIVE ✅ | flowsight.ch (homepage, pricing, legal, demo booking) |
| **Sales Voice Agent** | LIVE ✅ | "Lisa" auf 044 552 09 19, Pricing aktualisiert (Starter 199/Alltag 299/Wachstum 399) |
| **Customer Websites** | LIVE ✅ | /kunden/[slug] — SSG template (12 sections, ServiceDetailOverlay, lightbox, galleries) |
| **Customer Links Page** | LIVE ✅ | /kunden/[slug]/links — SSG, alle Kunden-URLs auf einen Blick, noindex |
| **Review Engine** | LIVE ✅ | Manual button, review_sent_at, tenant-scoped GOOGLE_REVIEW_URL, SMS fallback |
| **Review Surface** | LIVE ✅ | /review/[caseId] — Google Review-style UI, HMAC-validated, tenant-dynamic, mobile-first |
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
| **Jul. Weinberger AG (Thalwil)** | weinberger-ag | voice, wizard, ops, reviews, sms | **GTM Goldstandard** — D+B LIVE, C READY, 15 Demo-Cases seeded |
| BigBen Pub (Zürich) | bigben-pub | — | Custom Demo |

## Aktueller Stand

- **17 Module LIVE.** +1 Kunde: Jul. Weinberger AG (GTM Goldstandard). +1 Modul: Review Surface.
- **50+ Commits seit 04.03.** (PRs #53–#128).
- **Architecture Wave (10.03.):** PR #128. RLS Migration applied (tenant isolation at DB level). Tenant scoping in Dashboard + API (`resolveTenantScope.ts`). 3-Tier SMS Routing. Review Surface (Google-style). 15 Demo-Cases seeded (Weinberger). Architecture Document (22 Sections). 3-Modi GTM Logic. Ops Scripts (seed_demo_data, setup_rls_and_admin).
- **Quality Wave (10.03.):** PR #126 + #127. Voice fixes, PLZ Lookup, Dashboard Branding, Review Engine.
- **Web-Engine Abschluss (08.03.):** Alle 6 Customer-Websites auf einheitlichem Standard. Template: teamPhoto-Support, Careers-Gradient, Reviews-Centering.
- **Website-Template v3 (08.03.):** ServiceDetailOverlay + Bullets + per-Service Galleries + Lightbox z-[200] + Mobile Gallery Arrows.
- **Wizard Restructure (09.03.):** "Anliegen melden" statt "Schaden melden", Top-3 + fixe Reihe, Photo Upload in Step 3.
- **Voice Agent v4 (07.03.):** reporter_name, deterministic ß→ss, farewell no-repeat, end_call tool, dynamic SIP routing.
- **Weinberger AG (09.03.):** GTM Goldstandard. 5 Services, 17 Bilder, 24h Notdienst, 4.4★/20 Reviews. PR #116.
- **GTM Foundation (09.03.):** 9/10 Building Blocks done. Weinberger D+B-Full live.
- **Trial Machine (11.03.):** PR #131. Operating Model (6 Phasen), Trial Lifecycle DB-Felder, provision_trial.mjs, offboard_tenant.mjs. B-Quick eliminiert — immer B-Full.
- **Trial Lifecycle Emails (11.03.):** PR #134. Welcome-Mail (auto via provision_trial.mjs), Offboarding-Mail (auto via offboard_tenant.mjs), Morning Report mit Trial-Awareness (active/follow-up/expiring/zombie).
- **Scout v3 (11.03.):** PR #135. Module 2 (Voice Fit) Scoring: Emergency + Hours Gap + Service Breadth. Tier-Thresholds mit Einsatzlogik aligned (HOT >= 8, WARM >= 6).
- **Trial Lifecycle Runner (11.03.):** PR #136. Idempotent Tick-Route (`/api/lifecycle/tick`), per-Milestone Timestamps (day7/10/13/14), Day 13 Trial-Expiry E-Mail, GitHub Actions Cron (daily 07:00 UTC), Morning Report tick_stale detection. Prospect Welcome Page (`/ops/welcome`) mit Primary CTA = Testnummer anrufen.
- **Monitoring-Härtung (11.03.):** PR #138. Morning Report als GH Actions Cron (daily 07:30 UTC, Telegram + E-Mail bei RED/YELLOW). Lifecycle-Tick Failure → Telegram-Alert. Health Check mit DB-Ping + Resend-Key-Validation.
- **Reise-Härtung (11.03.):** PR #139. Reise-Runbook (Vor/Während/Nach Checkliste, Trial-Timing-Regel, Signal-Übersicht). Morning Report Deep Health (DB/Email/Resend-API-Status einzeln sichtbar). Resend API Key Validation im Morning Report.
- **GTM SSOT Hygiene (11.03.):** PR #141. B-Quick komplett eliminiert (Einsatzlogik, Tracker, Outreach). GTM Tracker auf aktuellen Stand (G11+G12 DONE, Weinberger B=DONE C=testbar). ICP-Scoring aligned (0-11 Skala, HOT ≥8 / WARM 6-7). Modus 3 zurückgestellt.
- **Weinberger E2E Ready (11.03.):** PR #143. SMS-Modul + Google Review URL aktiviert. INTL Agent Firmenname korrigiert. Weinberger C = TESTBAR.
- **Gold Contact (11.03.):** PR #145. Nordstern-Dokument für Sales/Trial/Product/Go-Live. 5-Stufen-Kaufmodell, Spiegel-Effekt, 7 WOW-Momente, Meister/Betrieb-Profile, Phase 0-3 Journey mit konkretem High-Touch-Handover.
- **BLOCKER:** Keine. Go-Live möglich.
- **Nächster Schritt:** Founder-Actions vor Reise — siehe `docs/runbooks/reise_checklist.md`.

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
| `docs/gtm/operating_model.md` | GTM Operating Model (6 Phasen, Trial Lifecycle, Quality Gates) |
| `docs/gtm/gtm_tracker.md` | GTM Execution-Tracker (G1-G12 Building Blocks) |
| `docs/architecture/zielarchitektur.md` | Zielarchitektur — 16 Decisions, Business + Produkt + GTM |
| `docs/sales/pipeline.md` | Sales Pipeline Prozess + Tool-Referenz |
| `CLAUDE.md` | Repo-Guardrails, Conventions |
| `docs/customers/<slug>/status.md` | Pro-Kunde Status |
| `docs/customers/<slug>/links.md` | Kunden-URLs (PFLICHT pro Kunde) |
| `docs/customers/<slug>/prospect_card.json` | Prospect Card (GTM, ab G1) |
| `docs/gtm/gold_contact.md` | Gold Contact — Nordstern (Kaufmodell, Profile, Journey, Architektur) |
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
| `docs/briefings/` | Ad-hoc Inputs (aktive), archivierte → `docs/archive/briefings/` |
| `docs/runbooks/reise_checklist.md` | Founder-Abwesenheit: Vor/Während/Nach, Trial-Timing, Signale |
| `.github/workflows/` | CI (lint+build), Telegram, lifecycle-tick (daily 07:00), morning-report (daily 07:30) |
| `docs/archive/` | Wave Log, alte Dokumente, Agent-Framework, Templates, Architecture Audits |

## Hobby-Plan Constraints

- Vercel: 1 console.log pro Invocation, 1h Log Retention
- Supabase Free: keine Backups, 500 MB Storage
- Resend Free: 100 emails/day, 1 Domain
- Upgrade-Trigger: `docs/runbooks/cost_triggers.md`
