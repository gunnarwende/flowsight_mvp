# OPS Board — FlowSight Roadmap (SSOT)

**Updated:** 2026-03-11 (PR #150: Lisa Interest Capture)
**Rule:** CC updates with every deliverable. Founder reviews weekly.
**Einziger Task-Tracker.** Alle offenen Tasks leben hier.

---

## Snapshot

- **Produkt:** 17 Module LIVE (Website, Voice, Wizard, Ops, Reviews, Review Surface, Morning Report, Entitlements, Email, Peoplefone, Sales Agent, Demo Booking, Demo-Strang, SMS Channel, CoreBot, Customer Links Page, BigBen Pub)
- **Kunden:** 7 Websites live (Dörfler, Brunner HT, Walter Leuthold, Orlandini, Widmer, **Weinberger AG**, BigBen Pub)
- **BLOCKER:** 0 ✅
- **Shipped seit 04.03.:** 80+ Commits, PRs #53–#148
- **DB Security:** RLS applied (tenant isolation), Founder = admin, Demo-Cases seeded
- **Ops Tooling:** `retell_sync.mjs` + `onboard_tenant.mjs` + `provision_trial.mjs` + `offboard_tenant.mjs` + `scout.mjs` (ICP Scoring)
- **CI/CD:** GitHub Actions (lint + build + Telegram notify + lifecycle-tick cron + morning-report cron). Branch Protection: PR required.
- **Vercel Region:** Frankfurt (fra1)
- **Phase:** Trial Machine DONE + Monitoring-Härtung DONE. Nächst: Reise-Readiness (Founder-Actions).
- **Operating Model:** `docs/gtm/operating_model.md` — 6 Phases, Trial Lifecycle, Quality Gates
- **Reise-Checklist:** `docs/runbooks/reise_checklist.md` — Founder-Abwesenheit, alle offenen Tasks

### How to Operate (Founder via Handy)

```
1. CC erstellt Feature-Branch + PR
2. Telegram "FlowSight Ops": ✅/❌ CI Status + Preview-Link + PR-Link
3. Founder: GitHub Mobile App → PR reviewen → Approve + Merge
4. Telegram: 🚀 Shipped → Vercel deployt Prod (~90s)
5. Done. Kein Terminal nötig.
```

---

## OFFEN — GitHub Issues

| # | Titel | Labels | Status |
|---|-------|--------|--------|
| #93 | Ticket betrifft Widmer | ticket, voice, website | OFFEN — Klärung nötig |
| #92 | Ticket betrifft Website Wittmar | decision, voice, website | OFFEN — Klärung nötig |
| #90 | Voice Ticket 2026-03-08 12:32 | ticket, ops, voice | OFFEN |
| #89 | Orlandini Partner nicht aufgenommen | ticket, voice, website | OFFEN — Prüfen ob Partner auf alter Website |
| #81 | Voice von Handy funktioniert nicht | ticket, voice, website | UNTERSUCHT — Retell Logs zeigen Calls gehen durch, Founder hat nach 2-7s aufgelegt. Kein technischer Blocker. |
| #80 | BigBen Pub — Rücksprache Paul erfolgt | ticket, telephony, voice | OFFEN — Paul interessiert |
| #79 | BigBen Pub — Paul zeigt sich interessiert | decision, voice, website | OFFEN — Follow-up nötig |

---

## OFFEN — Founder Blocks (Go-Live Dörfler)

| # | Task | Status | Details |
|---|------|--------|---------|
| D | Dörfler Input — fehlende Texte | DONE | Brand Color + Google Reviews geliefert. Kein Logo vorhanden (entfällt). |
| E | Mobile QA — iPhone | OFFEN | Founder kann Mobile re-testen. |
| F | **Go/No-Go Entscheid** | OFFEN | Keine Blocker. Founder: Entscheid. |
| G | **Kommunikation an Dörfler** | OFFEN | Blocked by: F |
| F9 | Google Review Link (Dörfler) | BLOCKED | Nachrüsten wenn Link da. |
| N25 | **MS Bookings UX** (Bug 17) | OFFEN | Kumpel-Feedback. Founder prüft Config. |

---

## OFFEN — Quality Wave Nacharbeiten

| # | Task | Owner | Status | Details |
|---|------|-------|--------|---------|
| Q1 | **SMS E2E** — DEMO_SIP_CALLER_ID prüfen | Founder | BLOCKED | Env var auf Vercel prüfen (persönliche Handynr in E.164). Ohne: SMS geht an Twilio-Nr → silent fail. |
| Q2 | **google_review_url** optional — unsere Review-Surface ist primär | CC | **DONE** ✅ | PR #130. Google URL nur noch optionaler Fallback auf Review-Surface. |
| Q3 | **Demo-Dataset** — 15 kuratierte Cases pro Tenant | CC | **DONE** ✅ | PR #128. Seed-Script + 15 Weinberger Demo-Cases live. |
| Q4 | **3-Modi Operationalisierung** — Einsatzlogik + Runbook | CC | **DONE** ✅ | PR #128. Full/Extend/Pure System in einsatzlogik.md. |
| Q5 | **Tenant-scoped Case List** — RLS + Auth-Architektur | CC | **DONE** ✅ | PR #128. RLS applied + resolveTenantScope.ts + API/Dashboard enforcement. |
| Q6 | **Prospect Magic-Link + Rollenmodell** | CC | **DONE** ✅ | PR #130. Magic-Link CLI, Prospect UI (status+review only), Role Contract. |

---

## OFFEN — Produkt-Backlog

### Backlog (trigger-basiert)

| # | Deliverable | Owner | Trigger | Status |
|---|-------------|-------|---------|--------|
| N3 | **Kalender-Sync** — Google/Outlook CalDAV | CC | Kundenfeedback | OFFEN |
| N4 | ~~Morning Report (Cron)~~ | CC | — | **DONE** ✅ PR #138. GH Actions Cron (daily 07:30 UTC), Telegram + E-Mail bei RED/YELLOW. Kein Vercel Pro nötig. |
| N7 | Ops-light UI (reviews-only mode) | CC | Reviews-only Kunde signed | OFFEN |
| N11 | **Adress-Autocomplete** — Swiss Post API / Google Places | CC | Post-MVP | OFFEN |
| N15 | **Terminerinnerung 24h vorher** | CC | Post-Go-Live | OFFEN |
| N16 | **Kunden-Historie** | CC | Post-Go-Live, Kundenfeedback | OFFEN |
| N22 | **Tenant Brand Color → OPS** | CC | Demo-relevant | OFFEN |
| N23 | **Analytics Dashboard** | CC | Post-Go-Live | OFFEN |
| N29 | **PLZ/Ort Smart Verification** | CC | Post-Go-Live | OFFEN |
| N33 | **Demo-Booking SMS** | CC | SMS-Spam-Risiko klären | OFFEN |

---

## GTM Pipeline v2

**Operating Model:** `docs/gtm/operating_model.md` — 6 Phasen, Trial Lifecycle, Quality Gates
**Zielarchitektur:** `docs/architecture/zielarchitektur.md` — 16 Decisions
**Execution-Tracker:** `docs/gtm/gtm_tracker.md` ← **ALLE GTM-Tasks leben hier**
**Pipeline:** `docs/sales/pipeline.md` + `docs/sales/pipeline.csv`
**Goldstandard:** Jul. Weinberger AG, Thalwil (ICP 90+, Leckerli A+B-Full+C+D)
**Gold Contact:** `docs/gtm/gold_contact.md` — Nordstern (Kaufmodell, Profile, Journey)
**Phase:** Trial Machine Build-Out — alle Building Blocks done

| # | Task | Owner | Status |
|---|------|-------|--------|
| S1 | Sales Pipeline Tracker eingerichtet | CC | **DONE** ✅ |
| S2 | Scout v2 — ICP Scoring + Multi-Query | CC | **DONE** ✅ |
| S3 | E-Mail-Vorlage + Anruf-Skript ready | CC | **DONE** ✅ |
| S5 | BigBen Pub — Paul Follow-up | Founder | OFFEN — Paul interessiert (#79/#80) |
| S6 | ~~Sales Agent Pricing (199/299/399)~~ → **Ersetzt durch S9** | CC | N/A |
| S7 | **Demo→Test Flow** — "Kostenlos testen" statt "Demo buchen" | CC | **DONE** ✅ (PR #148) |
| S8 | **299 Flat Pricing** — Ein Produkt, alle Docs aligned | CC | **DONE** ✅ (PR #147) |
| S9 | **Lisa Interest Capture** — Sales Agent → Erreichbarkeits-Netz, Gold-Contact-aligned | CC | **DONE** ✅ (PR #150) |
| G10 | GTM SSOT Docs (Plan v2 + Tracker) | CC | **DONE** ✅ |
| G9a | Weinberger Website (Leckerli D) | CC | **DONE** ✅ (PR #116) |
| G9b | Weinberger Lisa (Leckerli B-Full) | CC | **DONE** ✅ (PR #118) |
| G1 | Prospect Card Format (JSON v1.0 + Contract) | CC | **DONE** ✅ |
| G3 | Provisioning Runbook (<25 Min) | CC | **DONE** ✅ |
| G4 | Video-Produktions-Template (5 Szenen) | CC | **DONE** ✅ |
| G5 | Premium Outreach-Templates (3 E-Mails + Call) | CC | **DONE** ✅ |
| G6 | Einsatzlogik-Engine (ICP→Leckerli→Assets) | CC | **DONE** ✅ |
| G8 | Quality Gates Checklist (5 Gates) | CC | **DONE** ✅ |
| G7 | Pipeline Tracker Upgrade (5 neue Spalten + Leckerli) | CC | **DONE** ✅ |
| G2 | ~~B-Quick Demo-Agent~~ → **ELIMINATED** (immer B-Full, kein B-Quick) | CC | N/A |
| G11 | **Operating Model** — GTM Betriebsmodell (6 Phasen) | CC | **DONE** ✅ |
| G12 | **Trial Lifecycle** — DB-Felder + provision_trial.mjs + offboard_tenant.mjs | CC | **DONE** ✅ |

---

## LATER (parked, explicit triggers)

| # | Deliverable | Owner | Trigger |
|---|-------------|-------|---------|
| L1 | ~~Offboarding runbook~~ | CC | **DONE** ✅ — `offboard_tenant.mjs` + Operating Model |
| L2 | Verträge / AGB Vorlage | Founder (+ Anwalt) | Vor Kunde #2. SaaS-Vertrag CH-Recht. |
| L3 | Failure drills (telephony) | CC | First real incident |
| L5 | LinkedIn Unternehmensseite | Founder | 1 Post/Woche nach Go-Live |
| L6 | Bitwarden komplett einrichten | Founder | ~4h. Alle Zugänge. |
| L7 | Founder Agent v1 (Retell) | CC + Founder | Strang D stable |
| L8 | Founder Ops Inbox | CC + Founder | Strang D stable |
| L10 | Retention decisions | Founder | Case + attachment retention periods |
| L11 | WhatsApp Sandbox → Prod | Founder | Ops Alerts need SLA |
| L12 | Data protection statements | Founder | Voice disclosure + Wizard checkbox + DPA |
| L13 | **Demo-Video aufnehmen** | Founder + CC | Go-Live + Demo-Strang shipped |
| N24 | **Mobile App / PWA** | CC | Erste zahlende Kunden + Feedback |

---

## Completed (Archiv — kondensiert, seit 04.03.)

| Datum | Deliverable | Evidence |
|-------|-------------|----------|
| 2026-03-04 | CoreBot Attachments, P0 Demo Fix, Voice STT Hardening | PRs #27, #29, #32 |
| 2026-03-05 | Voice Closing Loop Fix (dynamic SIP routing), SMS Alpha Sender Fix | PRs #46, #47, #54, #55, #56 |
| 2026-03-05 | Demo Booking SMS Confirmation + Wizard Photo Upload | PRs #53, #57 |
| 2026-03-05 | SIP TwiML POST body fix, Handout Premium Redesign | PRs #58, #59, #60 |
| 2026-03-06 | BigBen Pub Custom Demo (Reservierung, Events, Galerie, Reviews) | PRs #62–#66, #69–#72 |
| 2026-03-06 | Scout v2 (ICP Scoring, Multi-Query), 3 Prospect Demo-Websites | PRs #73–#75 |
| 2026-03-07 | Customer Template Redesign (ServiceDetailOverlay, Galleries) | PRs #76–#77 |
| 2026-03-07 | Walter Leuthold v3 (Founder Feedback), Customer Wizard (branded, service-based) | PRs #83–#85 |
| 2026-03-07 | reporter_name Feature (Wizard + Voice + Webhook + Verify) | PR #86 |
| 2026-03-08 | Orlandini + Widmer Website Rebuild (high-end, real data) | PR #88 |
| 2026-03-08 | Customer Links Page + LinkedIn Company URL Fix | PR #91 |
| 2026-03-08 | Sales Agent Pricing Update (199/299/399) | PR #94 |
| 2026-03-08 | Lightbox z-index Fix + Mobile Gallery Arrows | PR #95 |
| 2026-03-08 | Widmer Spenglerei + Intake Process Standardization | PR #96 |
| 2026-03-08 | Customer Links Docs (links.md pro Kunde, PFLICHT) | PR #97 |
| 2026-03-09 | Wizard Restructure: Anliegen statt Schaden, Top-3 + fixed row, Photo in Step 3 | PR #113 |
| 2026-03-09 | Weinberger AG Website — GTM Goldstandard (5 Services, 17 Bilder, 24h Notdienst) | PR #116 |
| 2026-03-09 | Weinberger Lisa (B-Full) — DE + INTL Voice Agent published | PR #118 |
| 2026-03-09 | GTM Foundation: G1 Prospect Card, G3 Runbook, G4 Video, G5 Outreach, G6 Einsatzlogik, G8 Quality Gates | — |
| 2026-03-10 | Voice Closing Fix — skip_response_edge Bug, farewell + end_call, alle 4 Agents | PR #126 |
| 2026-03-10 | Tenant-scoped Google Review URL (modules JSONB statt global env) | PR #126 |
| 2026-03-10 | Twilio-owned Number Detection erweitert (+41445520919) | PR #126 |
| 2026-03-10 | FAQ-Call Abbruch-Bug — Edge Condition tightened, back-to-main | PR #127 |
| 2026-03-10 | Voice Greeting "Grüezi" + Notfall-Empathie v2 + "Weinberger AG" statt "Jul." | PR #127 |
| 2026-03-10 | PLZ→City Auto-Lookup (24 Orte) + House-Number Normalization | PR #127 |
| 2026-03-10 | Review Surface (/review/[caseId] — Google-style, HMAC, mobile-first) | PR #127 |
| 2026-03-10 | Review via SMS Fallback (contact_phone als Channel) | PR #127 |
| 2026-03-10 | Dashboard Tenant-Branding (Name+Initials statt "FlowSight") | PR #127 |
| 2026-03-10 | RLS Migration applied — tenant isolation at DB level (cases, case_events, attachments, tenants, tenant_numbers) | PR #128 |
| 2026-03-10 | Tenant Scoping — resolveTenantScope.ts + Dashboard + API enforcement | PR #128 |
| 2026-03-10 | 3-Tier SMS Routing (demo_sms_target → DEMO_SIP_CALLER_ID → caller) | PR #128 |
| 2026-03-10 | Review Surface Rewrite — Google Review reference design, dynamic company name | PR #128 |
| 2026-03-10 | Demo-Dataset — seed_demo_data.mjs + 15 Weinberger Demo-Cases | PR #128 |
| 2026-03-10 | Architecture Document — 22 Sections, 15 Decisions, 3 Architectural Axes | PR #128 |
| 2026-03-10 | 3-Modi GTM Logic (Full/Extend/Pure System) in einsatzlogik.md | PR #128 |
| 2026-03-10 | Ops Scripts: setup_rls_and_admin.mjs, seed_demo_data.mjs | PR #128 |
| 2026-03-10 | Prospect Magic-Link CLI + Prospect UI (status+review only) + Role Contract | PR #130 |
| 2026-03-11 | GTM Operating Model — 6 Phases, Trial Timeline, Capacity Model, Quality Gates, Risks | PR #131 |
| 2026-03-11 | Trial Lifecycle DB Migration (trial_status, trial_start/end, follow_up_at, prospect_email/phone) | PR #131 |
| 2026-03-11 | provision_trial.mjs — Unified trial setup (tenant + phone + seed + prospect + magic link) | PR #131 |
| 2026-03-11 | offboard_tenant.mjs — Clean delete (cases + events + attachments + numbers + agents + auth) | PR #131 |
| 2026-03-11 | Repo Cleanup Round 2 — archive plan_v2, fix 10 stale references, Orlandini status.md, Runbooks README | PR #133 |
| 2026-03-11 | Trial Lifecycle Emails — Welcome-Mail (auto), Offboarding-Mail (auto), Morning Report TRIALS section | PR #134 |
| 2026-03-11 | Scout v3 — Module 2 Voice Fit Scoring (Emergency + Hours Gap + Breadth), aligned tier thresholds | PR #135 |
| 2026-03-11 | Trial Lifecycle Runner — Idempotent Tick-Route, per-Milestone Timestamps, Day 13 Email, GH Actions Cron | PR #136 |
| 2026-03-11 | Prospect Welcome Page — /ops/welcome, Primary CTA = Testnummer, Admin bypass, Trial info | PR #136 |
| 2026-03-11 | Morning Report — tick_stale detection for missed lifecycle events | PR #136 |
| 2026-03-11 | Monitoring-Härtung — Morning Report Cron (GH Actions, Telegram + E-Mail), Tick-Failure Telegram, Health Check DB+Resend | PR #138 |
| 2026-03-11 | Reise-Härtung — Runbook (Vor/Während/Nach), Trial-Timing-Regel, Morning Report Deep Health + Resend API Validation | PR #139 |
| 2026-03-11 | GTM SSOT Hygiene — B-Quick eliminiert, Tracker + Einsatzlogik + ICP aligned | PR #141 |
| 2026-03-11 | Weinberger E2E Ready — SMS-Modul + Google Review URL aktiviert, INTL Agent fix | PR #143 |
| 2026-03-11 | Gold Contact — Nordstern-Dokument (Kaufmodell, Profile, Journey, Architektur) | PR #145 |
| 2026-03-11 | 299 Flat Pricing — Ein Produkt, ein Preis. 3-Tier eliminiert. Pre-Contact Quality Gate | PR #147 |
| 2026-03-11 | Demo→Test Flow — /testen Page, /demo redirect, DemoForm PLZ+Website, Qualify-SMS | PR #148 |
| 2026-03-11 | Lisa Interest Capture — Sales Agent → Erreichbarkeits-Netz. Kein Pricing/Pitch/Demo-Buchen. Founder-Rückruf. Gold-Contact-aligned. | PR #150 |

**Ältere Completed (vor 04.03.):** Siehe `docs/archive/wave_log.md`

**Erledigte Founder Blocks:** B (LinkedIn ✅), C (GBP ✅), F2 (Email Deliverability ✅), F5 (Voice Regression ✅), F6 (2FA Audit ✅), F10 (Billing Guard ✅)
