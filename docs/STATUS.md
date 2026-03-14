# FlowSight — STATUS (Company SSOT)

**Datum:** 2026-03-14 (QA Sweep Machine + OPS Visual Block: Brand Header, Puls Overhaul, Color Consistency)
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
| **SMS Channel** | LIVE ✅ | Post-call SMS with short correction link `/v/[id]?t=<16hex>` (~85 chars) + photo upload. eCall.ch Swiss gateway (2-tier sender: alphanumeric → FlowSight-Servicenummer). HMAC-secured. |
| **Ops Dashboard** | LIVE ✅ | /ops — Case Detail (UX v2), Case List (search, pagination, KPI click-to-filter), CSV-Export, Timeline |
| **Email Notifications** | LIVE ✅ | HTML Ops-Notification + Melder-Bestätigung + Review-Anfrage + Demo + Sales Lead |
| **Peoplefone Front Door** | LIVE ✅ | Brand-Nr → Twilio → SIP → Retell |
| **Morning Report** | LIVE ✅ | 15 KPIs + Trial Status + Deep Health, GH Actions Cron (daily 07:30 UTC), Telegram + E-Mail (RED/YELLOW) |
| **Marketing Website** | LIVE ✅ | flowsight.ch (homepage, pricing, /testen — "Kostenlos testen" flow) |
| **Interest Capture Agent** | LIVE ✅ | "Lisa" auf 044 552 09 19 — Interest Capture (kein Pricing, kein Pitch, Founder-Rückruf) |
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
- **QA Sweep Machine (14.03.):** `scripts/_ops/qa_sweep.mjs` — Phase A (DOM checks) + Phase B (Claude Vision API). Automated delta analysis against Identity Contract + Leitstand Zielbild. Output: STOPP/SYSTEM/FOUNDER/POLISH severity report with screenshots.
- **OPS Visual Block (14.03.):** PRs #208-#210. Full Brand Header (sidebar + mobile in tenant color), Website Nav accent bar + phone visibility, Puls overhaul (group headers always visible, empty states, white cards with colored borders), amber purge (all amber→slate for brand-agnostic consistency), case list readability (truncation, assignee visibility). QA Sweep: 0 STOPP. Weinberger ready for Founder-Run.
- **Gold Contact (11.03.):** PR #145. Nordstern-Dokument für Sales/Trial/Product/Go-Live. 5-Stufen-Kaufmodell, Spiegel-Effekt, 7 WOW-Momente, Meister/Betrieb-Profile, Phase 0-3 Journey mit konkretem High-Touch-Handover.
- **299 Flat Pricing (11.03.):** PR #147. Ein Produkt, ein Preis: CHF 299/Monat. 3-Tier Packages eliminiert. Pre-Contact Quality Gate (`pre_contact_check.mjs`). Gold Contact + alle Docs aligned.
- **Demo→Test Flow (11.03.):** PR #148. "Demo buchen" → "Kostenlos testen". Neue /testen Page ("Wir bauen Lisa für Ihren Betrieb"), /demo redirect, DemoForm mit PLZ+Website, Qualify-orientierte Bestätigung. Stage 1 von 3.
- **Lisa Interest Capture (11.03.):** PR #150. Sales Agent → Interest Capture Agent. Kein Pricing, kein Feature-Pitch, kein Demo-Buchen. Stattdessen: warm empfangen, Interesse erfassen, Founder-Rückruf vorbereiten. Gold-Contact-aligned.
- **Block A: Identity + Lifecycle (13.03.):** PR #168 + #169. Identity Contract auf alle 7 E-Mail-Templates angewendet (Sender = `{name} via FlowSight`, kein `[FlowSight]` Prefix). Day-5 Engagement-Nudge (mit Suppression bei >=3 Cases). Day-7 Engagement-Snapshot (JSONB). Welcome-Page Trial-Countdown. Demo-Case-Tabs im Leitstand ("Ihre Fälle" / "Demo"). Tab-Titel = `{short_name} OPS`.
- **Block B: Wizard + Review Gold (13.03.):** PR #171. Wizard Notfall-Logik (N1-N7): Phone-CTA-Screen bei Notfall. Review Surface komplett neu (editierbares Textarea, Auftrags-Block, Clipboard+Google-CTA, Tenant-Branding, Event-Tracking). Nachlauf-System (6 Review-Status aus case_events, max 2 Anfragen, 7d-Cooldown, Skip-Action). Leitstand Review-Badges + Aktionen.
- **S1.6: Kategorie-Vereinheitlichung (13.03.):** PR #173. CASE_POOL + deriveWizardCategories() eliminiert. Per-customer `categories[]` in CustomerSite als SSOT. Values aligned mit Voice Agents: "Leck" statt "Leck / Wasserschaden", "Heizung" statt "Heizungsausfall". Shared FIXED_CATEGORIES. **S1 komplett DONE.**
- **BLOCKER:** Keine. Go-Live möglich.
- **S2 Surface Quality (13.03.):** PR #175. Snowflake+Pump Icons (Weinberger Lüftung fix). Reviews-Fallback (Google CTA bei leeren Highlights). Nav-Anchor #bewertungen. Weinberger voicePhone. Hero-Alt-Text dynamisch.
- **S2.2 Tier-1 Website QA (13.03.):** PR #177. Walter Leuthold History-Section enabled (2. Milestone). Widmer Spenglerei-Icon `roof`. Widmer Opening Hours Sa/So. Dörfler Blitzschutz-Bild Encoding-Fix.
- **S2.4 Voice Agent Gold-QA (13.03.):** PR #178. Placeholder Agent-IDs ersetzt (Brunner + Weinberger DE↔INTL Transfer). Alle 8 Agents synced + published.
- **BLOCKER:** Keine. Go-Live möglich.
- **SMS-Architektur (14.03.):** eCall.ch = einziger SMS-Provider (CH). Twilio = nur Voice/SIP. 2-Tier Sender: alphanumerisch (Tenant) → ECALL_SENDER_NUMBER (FlowSight-Servicenummer). Twilio-SMS-Pfad entfernt.
- **S2.5 SMS-Config (13.03.):** Verified. Brunner (BrunnerHT) + Weinberger (Weinberger) korrekt. Andere 4 Tenants wizard-only → kein SMS nötig.
- **S2 KOMPLETT** (CC-seitig). Alle 6 Blocks done (S2.1–S2.6).
- **S3 Journey Verification (13.03.):** PR #181. Trial E2E Tag 0–14 verifiziert (Voice/Wizard/Review/SMS/Dashboard). Trial Expiry Hard Gate (Middleware → /ops/expired). Morning Report follow_up_due Auto-Expire (3d). Milestone-Retry-Bug = FALSE POSITIVE (Code korrekt). **S3 VERDICT: PASS.**
- **S4 Enablement (13.03.):** Walter Leuthold Voice Agent JSONs (DE+INTL) erstellt. Prospect Card + Status erstellt. Video-Ordnerstruktur (`docs/gtm/videos/`) mit vorkonfektionierten Skripten für 3 Prospects (Weinberger, Dörfler, Leuthold). **CC-Scope S4 abgeschlossen. System bereit, Founder übernimmt.**
- **Schatztruhe Final (13.03.):** PR #186. E2E Touchpoint-Architektur (Mechanik × Psychologie × Proof). schatztruhe_final.md = SSOT für alle Touchpoints. production_brief.md v2.0 = vollständiges 130-140s Drehbuch (echte Lisa-Transkripte). Lisa-Greeting + URL-Drift korrigiert.
- **S5 Proof-Capture-Maschine (13.03.):** Prospect Manifest v2.0 (5 Blöcke: Scout/Outreach/Provisioning/Assets/QA). Machine Manifest (12-Schritt Pipeline, Modus-Routing, Kapazitätsmodell). Video Manifest (11-Szenen-Katalog, Capture-Methoden, Assembly-Template). QA Gate (9 Auto + 3 Manual Checks). Outreach-Templates Gold-Contact-aligned (Lifecycle raus, prospect_manifest Variablen). Dörfler AG prospect_card.json erstellt (Gap geschlossen).
- **Nächster Schritt (Founder):** (1) DEMO_SIP_CALLER_ID auf Vercel verifizieren (SMS Kill-Kriterium). (2) `retell_sync.mjs` für Leuthold → Twilio-Nummer → E2E-Test. (3) Videos aufnehmen (Weinberger → Dörfler → Leuthold). (4) Outreach starten.

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
| `docs/ticketlist.md` | Offene Tickets, Backlog, GTM Pipeline |
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
| `docs/architecture/contracts/prospect_card.md` | Prospect Card JSON Contract (v1.0 Scout-Output) |
| `docs/architecture/contracts/prospect_manifest.md` | Prospect Manifest v2.0 (Scout + Outreach + Provisioning + Assets + QA) |
| `docs/gtm/machine_manifest.md` | Proof-Capture-Maschine Pipeline (12 Schritte, Modus-Routing, Kapazität) |
| `docs/gtm/video_manifest.md` | Video-Spezifikation (11 Szenen, Variablen, Capture-Methoden, Assembly) |
| `docs/gtm/qa_gate.md` | QA Gate (9 Auto + 3 Manual Checks, Automatisierungs-Roadmap) |
| `docs/runbooks/provisioning_prospect.md` | Provisioning Runbook (<25 Min, G3) |
| `docs/gtm/video_template.md` | Video-Produktions-Template (G4) |
| `docs/gtm/outreach_templates.md` | Premium Outreach-Templates (G5) |
| `docs/gtm/einsatzlogik.md` | Einsatzlogik-Engine (G6) |
| `docs/gtm/schatztruhe_final.md` | E2E Touchpoint-Architektur (Mechanik × Psychologie × Proof) — SSOT |
| `docs/gtm/videos/[slug]/production_brief.md` | Video-Drehbuch pro Prospect (Szene-für-Szene) |
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
