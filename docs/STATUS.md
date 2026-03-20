# FlowSight — STATUS (Company SSOT)

**Datum:** 2026-03-20 (CEO-App komplett + Sentry Digest + Web Push + PWA installierbar. Alle Founder Tasks F1-F8 done.)
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
| Email | Resend (Transaktional, Domain: send.flowsight.ch) | Free |
| SMS | eCall.ch Swiss Gateway (Business Account Typ A, CHF 40/Mo + Punkte) | Pay-as-you-go |
| Monitoring | Sentry (Error Tracking + Alerts) | Free |
| Ops Alerts | Telegram + E-Mail (primary), WhatsApp (optional) | GH Actions + Resend |

## Was ist live?

| Modul | Status | Evidence |
|-------|--------|----------|
| **Wizard** (Website Intake) | LIVE ✅ | /kunden/[slug]/meldung — "Was ist Ihr Anliegen?", Top-3 dynamic + fixed row (Allgemein/Angebot/Kontakt), photo upload in Step 3, branded per customer |
| **Voice** (Telefon Intake) | LIVE ✅ | Dual-Agent DE/INTL, PLZ→City auto-lookup (24 Orte), Language Gate, SMS+Photo mention, reporter_name, deterministic closing, Notfall-Empathie, FAQ-safe edge logic |
| **SMS Channel** | LIVE ✅ | Post-call SMS with short correction link `/v/[id]?t=<16hex>` (~85 chars) + photo upload. eCall.ch Swiss gateway (2-tier sender: alphanumeric → FlowSight-Servicenummer). HMAC-secured. |
| **Leitzentrale v3** | LIVE ✅ | /ops — FlowBar (CSS Grid, YTD-Toggle, Gold-Sterne, Quellen-Aufschlüsselung), Admin+Techniker-Ansicht, Pagination, Period-Filter, Termin-Kollisions-Warnung |
| **Email Notifications** | LIVE ✅ | HTML Ops-Notification + Melder-Bestätigung + Review-Anfrage + Demo + Sales Lead |
| **Peoplefone Front Door** | LIVE ✅ | Brand-Nr → Twilio → SIP → Retell |
| **Morning Report** | LIVE ✅ | 15 KPIs + Trial Status + Deep Health, GH Actions Cron (daily 07:30 UTC), Telegram + E-Mail (RED/YELLOW) |
| **Marketing Website** | LIVE ✅ | flowsight.ch (homepage, pricing, /testen — "Kostenlos testen" flow) |
| **Interest Capture Agent** | LIVE ✅ | "Lisa" auf 044 552 09 19 — Interest Capture (kein Pricing, kein Pitch, Founder-Rückruf) |
| **Customer Websites** | LIVE ✅ | /kunden/[slug] — SSG template (12 sections, ServiceDetailOverlay, lightbox, galleries) |
| **Customer Links Page** | LIVE ✅ | /kunden/[slug]/links — SSG, alle Kunden-URLs auf einen Blick, noindex |
| **Review Engine** | LIVE ✅ | Manual button, review_sent_at, tenant-scoped GOOGLE_REVIEW_URL, SMS fallback |
| **Review Surface** | LIVE ✅ | /review/[caseId] — Pre-Filter (★-Picker → ≥4★ Google, ≤3★ intern), HMAC-validated, tenant-branded |
| **Entitlements** | LIVE ✅ | hasModule() — per-tenant module gating |
| **CoreBot** | LIVE ✅ | Telegram → GitHub Issues (Voice→STT, Photo/Doc Attachments, /ticket, /status) |
| **Demo-Strang** | LIVE ✅ | /brunner-haustechnik — High-End Demo + Voice Agent Intake+Info |
| **BigBen Pub** | LIVE ✅ | /bigben-pub — Custom Demo (Reservierungen, Events, Galerie, Google Reviews) |
| **CEO-App (Thema C)** | LIVE ✅ | /ceo — 9 Seiten: Pulse, Betriebe, Pipeline, Finanzen, Monitoring, Benachrichtigungen, Wissen, Team, Admin. AI-Provider (Anthropic+OpenAI). Navy+Gold Design. PWA installierbar. |
| **AI-Provider Infrastruktur** | LIVE ✅ | Model-agnostisch (Claude+GPT), graceful degradation, Cost Tracker, Pulse-Comment + Tenant-Insight Features |
| **Support Foto-Upload** | LIVE ✅ | /ops/hilfe — Foto/PDF Upload, HTML-E-Mail mit inline Bildern, GitHub Issue mit Anhang-Links |

## Kunden (7 Websites live)

| Kunde | Slug | Module | Status |
|-------|------|--------|--------|
| Dörfler AG (Oberrieden) | doerfler-ag | voice, wizard, ops, reviews | PARTIAL — 3/4 PASS |
| Brunner Haustechnik AG (Thalwil) | brunner-haustechnik | voice, wizard, ops, reviews, sms | DEMO-Tenant |
| Walter Leuthold (Oberrieden) | walter-leuthold | wizard | Website LIVE |
| Orlandini Sanitär (Horgen) | orlandini | wizard | Website LIVE |
| Widmer H. & Co. AG (Horgen) | widmer-sanitaer | wizard | Website LIVE |
| **Jul. Weinberger AG (Thalwil)** | weinberger-ag | voice, wizard, ops, reviews, sms | **GTM Goldstandard** — D+B LIVE, C READY, 75+ Cases (60 done + Reviews), Google 4.4★ |
| BigBen Pub (Zürich) | bigben-pub | — | Custom Demo |

## Aktueller Stand

- **Sentry Digest + Web Push + PWA (20.03.):** PR #322. Monitoring zeigt jetzt echte Sentry-Errors (25 Issues live). Web Push komplett (SW, Subscribe API, Send API, VAPID Keys). PWA installierbar auf Android/Windows (manifest mit screenshots, id, scope). Alle Founder Tasks F1-F8 erledigt. Outlook Kalender OAuth live (PRs #317-#321).
- **CEO-App Thema C KOMPLETT (20.03.):** PRs #304-#315. 10 Phasen: Pulse, Betriebe, Pipeline, Finanzen, Monitoring, AI-Copilot, Notifications, Knowledge Base (37 Runbooks), Forecast, Team. 4 DB-Migrationen. Navy+Gold Design. AI-Provider live (Anthropic+OpenAI).
- **Leitstand Feedback-Runde (20.03.):** PRs #295-#302. FB9-FB15: Techniker Bewertungs-KPI Fix, Gold-Ring-Logik ≤3★, Source-Breakdown auf Erledigt, Support Foto-Upload, HTML-E-Mail mit Inline-Bildern.
- **Review KPI + Demo-Daten (20.03.):** PRs #292-#293. Bewertungs-KPI zeigt Google-Durchschnitt aus Tenant-Modules (Weinberger: 4.4★). 60 Done-Cases geseedet (20 mit Rating, 40 nur angefragt). Klickbare Sub-Filter "X erhalten" / "Y angefragt" filtern Tabelle. Timeline Auto-Refresh nach jedem Speichern. Header + Nav Polish. Google-Bewertungen E2E-Plan erstellt.
- **Leitzentrale v3 FlowBar (19.03.):** PRs #287-#290. CSS Grid KPIs, 7d/30d/YTD-Toggle, Quellen-Aufschlüsselung ÜBER Zahl, 👷+✅ Emojis, Gold-Sterne, Mobile 2x2, Period filtert Tabelle (aktive Fälle immer sichtbar). Techniker: Pagination, Period-Toggle, "Nächster Einsatz" immer sichtbar.
- **Review Pre-Filter (19.03.):** PR #288. ★-Picker → ≥4★ Google, ≤3★ intern. Gold-Status in Tabelle.
- **Shared Utilities (19.03.):** statusColors.ts, getGreeting.ts, plzCityMap.ts. PLZ Auto-Fill, Pflichtfeld-Markierung, Termin-Kollision, Sticky Case-ID, 48px Tap-Targets.
- **Scaling & Access (18.03.):** Tenant-Switcher, Support-System, Rollen-Switch.
- **Leitsystem Phase 1-4 (17.-18.03.):** Login OTP, PWA, Falldetail, Staff CRUD.
- **20 Module LIVE.** 7 Kunden-Websites. Weinberger = GTM Goldstandard. CEO-App = FlowSight-Nervenzentrum (9 Seiten, AI-ready).

### Kondensierte Historie (04.-14.03.)

Architecture Wave → Quality Wave → Web-Engine → Voice v4 → GTM Foundation → Trial Machine → Monitoring → Gold Contact → Renovation → S1-S4 Build-Blocks. Details: `docs/archive/wave_log.md` + git log.
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
| `docs/architecture/zielarchitektur.md` | Zielarchitektur — 30 Decisions, Business + Produkt + GTM + CEO-App |
| `docs/redesign/flowsight_ceo_app.md` | **CEO-App Gesamtplan** — 27 Features, 10 Phasen, alle LIVE. Founder-Tasks, DB-Schema, AI-Architektur |
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
