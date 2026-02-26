# Kundenakte: Dörfler AG

## Inputs
- (Links zur alten Website)
- Notrufnummer: vorhanden

## Status
- Setup: DONE (tenant 48cae49e, modules: all true)
- Website/Wizard: LIVE (wizard smoke PASS — case 5fb36e99)
- Voice: LIVE (E2E PASS — call_cb50d6fd → case 9d89cf6b → email)
- Ops Dashboard: LIVE (login + workflow verified)
- Reviews: BLOCKED (F9 — no Google Business Profile link)
- Email Deliverability: PASS (SPF/DKIM/DMARC all pass, inbox confirmed)
- Analytics: pending (Sentry alerts configured, morning report operational)

## Phone Numbers
- Brand: +41 44 552 09 19 (Peoplefone, active)
- Twilio Entry: +41 44 505 30 19 (SIP → Retell)
- Legacy: +41 44 505 74 20

## Links
- Prod: https://flowsight-mvp.vercel.app/doerfler-ag
- Wizard: https://flowsight-mvp.vercel.app/doerfler-ag/meldung
- Ops: https://flowsight-mvp.vercel.app/ops/login

## Updates

### 2026-02-18 | Web Agent | Discovery Run
- **Done:** Read all SSOT docs. Audited doerfler-ag inputs — nearly empty (inputs.md, links.md have headers only).
- **Created:** web_discovery.md (full discovery report with IA, design direction, QA plan).
- **Created:** INPUTS_REQUIRED.md (concrete input checklist with minimum-viable + upgrade tiers).
- **Design direction:** "Classic Premium" — dark/warm palette, generous spacing, real imagery, direct Sanitär/Heizung copy.
- **Blocker:** Zero customer content in-repo. Cannot begin visual/copy work until minimum inputs provided.
- **Next:** Customer provides minimum viable inputs → Web Agent begins delivery (IA skeleton + components).

### 2026-02-18 | Head Ops Agent | Onboarding Questionnaire
- **Done:** Created ONBOARDING_QUESTIONNAIRE.md — single-page fill-in template for founder.
- **Scope:** 7 sections, ~25 fields, 12 marked as Pflicht (minimum viable to start delivery).
- **Includes:** Example answers for every field (Sanitär/Heizung context).
- **Derived from:** INPUTS_REQUIRED.md minimum-viable tier (Web Agent discovery).
- **Next:** Founder fills out questionnaire + provides logo/photos if available → Web Agent starts delivery.

### 2026-02-18 | Head Ops Agent | AutoFill from Website + Pipeline SSOT
- **Done:** Fetched doerflerag.ch (homepage, angebot, team, firmengeschichte, kontakt, galleries, links). Created FACTS_VERIFIED.md with Verified/Assumption/TBD labels. Created ONBOARDING_QUESTIONNAIRE.autofill.md (6/12 Pflichtfelder filled, 3 Assumptions, 3 TBD). Updated INPUTS_REQUIRED.md with "TBD ONLY" summary. Created customer_modernization_pipeline.md (Phase A/B model).
- **Key findings:** Company founded 1926 (~100 years, 3 generations). 7 service areas verified. Address/phone/email confirmed. Suissetec member. Photo galleries exist. No reviews on site, no Notdienst explicitly advertised, no clear brand palette.
- **Top 5 TBD:** (1) Logo file SVG/PNG, (2) brand color hex, (3) 2 Kundenzitate, (4) service area confirmation, (5) case notification email confirmation.
- **Blocker:** Items 1–3 above block Demo build.
- **Next:** Founder confirms TBD items (especially logo, color, reviews) → Web Agent starts Delivery (Phase A Demo).

### 2026-02-18 | Web Agent | Phase A Demo Built
- **Done:** Built full landing page at `/doerfler-ag` with all 8 mandatory sections (Hero, Services, Notfall CTA, Process, Proof, Gallery, Über uns, Service Area, Kontakt).
- **Theme:** Classic Premium palette (Assumption: #1a2e44 navy + #c8965a copper). Wordmark logo "Dörfler AG" (Demo).
- **Content:** All copy from verified facts (company history, 6 services, Suissetec, partner brands). Notfall reachability stated per verified team page.
- **Images:** Stock via Unsplash URL. Footer note: "Bilder exemplarisch (Demo)".
- **Build:** `npm run build` PASS, `npm run lint` PASS. Route: `/doerfler-ag` (static).
- **Evidence:** web_demo_evidence.md — 25/32 QA gate items passed, 7 deferred (wizard, case creation).
- **Assumptions:** Palette, slogan, service area — all labeled in footer for founder review.
- **Next:** Deploy to Vercel preview → share with founder → confirm assumptions → Phase B.

### 2026-02-25 | Head Ops + Founder | Go-Live Gate Progress
- **Voice E2E:** PASS — Brand door (Peoplefone → Twilio → Retell) live. Proof: call_cb50d6fd → case 9d89cf6b → email.
- **Wizard E2E:** PASS — submit → case 5fb36e99 → notification emails (ops + reporter).
- **Ops Dashboard:** READY — login, cases, workflow verified.
- **Email Deliverability:** PASS — flowsight.ch SPF/DKIM/DMARC all pass. Inbox confirmed.
- **Billing Guards:** DONE — Twilio triggers + Peoplefone auto top-up.
- **Reviews:** BLOCKED — awaiting Google Business Profile access (F9).
- **Go-Live Sign-off (F11):** 3/4 modules PASS. Sole blocker: F9.
