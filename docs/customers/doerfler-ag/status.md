# Kundenakte: Dörfler AG

## Inputs
- (Links zur alten Website)
- Notrufnummer: vorhanden

## Status
- Setup: DONE (tenant d0000000-0000-0000-0000-000000000002, modules: all true)
- Trial: PROVISIONED Phase A (01.04.→15.04.2026, 15 Demo-Cases, kein Kontakt mit Prospect)
- Website/Wizard: LIVE (wizard smoke PASS — case 5fb36e99)
- Voice: LIVE, DSGVO-Fix applied (everything_except_pii), Laura DE + Juniper INTL published
- Ops Dashboard: LIVE (login + workflow verified, 15 Demo-Cases sichtbar)
- Reviews: BLOCKED (F9 — no Google Business Profile link)
- Email Deliverability: PASS (SPF/DKIM/DMARC all pass, inbox confirmed)
- CEO-App: Automatisch sichtbar (trial_active)
- Demo-Video: Script bereit (docs/customers/doerfler-ag/demo_script.md), Aufnahme ausstehend
- Pain Types: erreichbarkeit, aussenwirkung, bewertung, notfall, buerochaos
- Ansprechpartner: Ramon + Luzian Dörfler (Geschäftsleitung seit 2004, 3. Generation)

## Phone Numbers
- Brand: +41 44 552 09 19 (Peoplefone, active)
- Twilio Entry: +41 44 505 30 19 (SIP → Retell)
- Legacy: +41 44 505 74 20

## Links
- Customer Website: https://flowsight.ch/kunden/doerfler-ag
- Wizard: https://flowsight.ch/kunden/doerfler-ag/meldung
- Links-Seite: https://flowsight.ch/kunden/doerfler-ag/links
- Ops/Leitstand: https://flowsight.ch/ops/login
- Demo (alt): https://flowsight.ch/doerfler-ag
- Testnummer: +41 44 505 74 20 (Twilio → Retell)
- Brand-Nummer: +41 43 443 52 00 (Peoplefone → Twilio → Retell)

## Updates

### 2026-04-01 | CC | Phase A Provisioning (Sales Day 1)
- **Trial provisioned:** 01.04.→15.04.2026, 15 Demo-Cases (sanitaer), follow_up 11.04.
- **Voice Agents:** DSGVO-Fix (everything_except_pii), DE+INTL re-published via retell_sync
- **Demo-Script:** pain_type-basiert (5/5 pain_types), Feedback-Positioning, 3-5 Min
- **Prospect Card Fix:** "Beat Dörfler" → Ramon + Luzian Dörfler (verifiziert aus FACTS_VERIFIED)
- **Pain Types:** erreichbarkeit, aussenwirkung, bewertung, notfall, buerochaos (alle 5)
- **Pipeline:** Status DEMO → TRIAL_PREP, leckerli A+B-Full+C+D
- **seed_demo_data Bug Fix:** STATUS_DISTRIBUTION "contacted" → "in_arbeit"/"warten" (DB constraint)
- **provision_trial Enhancement:** --no-welcome-mail Flag für Phase A/B Trennung
- **Phase A = kein Kontakt mit Prospect.** Founder testet E2E, nimmt Video auf. Phase B = Outreach.
- **Nächste Schritte:** (1) Founder E2E Smoke-Test, (2) Demo-Video aufnehmen, (3) Phase B: Outreach-Mail

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
- **Reviews:** BLOCKED — awaiting Google Business Profile access (F9). NOT Go-Live critical.
- **Go-Live Sign-off (F11):** 3/4 modules PASS. F9 deferred — reviews nachgerüstet wenn Link da.

### 2026-02-26 | CC | Customer Website High-End Rebuild
- **Shipped:** /kunden/doerfler-ag — SSG template with 12 sections
- **Template:** types.ts schema, registry.ts pattern, page.tsx (12 sections), ImageGallery.tsx (lightbox)
- **Brand:** #2b6cb0 (professional blue from old site), kirschrot #c41e3a for Notfall
- **Content:** All verified from doerflerag.ch (no fabricated data). 2 real Google Reviews (Martin B. 5★, Markus Widmer 5★).
- **Images:** 67 curated from 297 crawled (Puppeteer). Quality limited (old site thumbnails).
- **Wizard integrated:** Nav + Hero CTA + Contact banner → /doerfler-ag/meldung
- **Services:** Expandable with description + horizontal scrollable gallery + lightbox
- **Commits:** fa6586e → 702d572 → 61d4f00 → 92fb55c → 5aaae1d → 3a30ae9
- **Lessons Learned:** docs/customers/lessons-learned.md (intake checklist, golden rules, time estimates)

### 2026-02-26 | CC | FlowSight Sales Voice Agent shipped
- **Shipped:** Sales Voice Agent "Lisa" auf 044 552 09 19
- **Webhook:** /api/retell/sales (separate Pipeline, kein Supabase-Insert)
- **Flow:** call_analyzed → Lead-E-Mail an Founder via Resend
- **Dual-Agent:** DE (Lisa/Susi voice) + INTL (Juniper voice), bidirektionaler Transfer
- **KI-Disclosure:** "Guten Tag, hier ist Lisa — ich bin die digitale Assistentin von FlowSight."
- **Knowledge Base:** FlowSight Produkt, 3 Pakete, Pricing, FAQ — alles im Prompt
- **Testanruf:** PASS — Demo gebucht, Lead-E-Mail angekommen
- **Commits:** 84fdf1b (feat), 321f074 (greeting fix)
- **Docs:** docs/agents/sales_agent.md, docs/runbooks/retell_agent_config.md (Section 6)

### 2026-02-26 | CC | SSOT Konsolidierung
- **Merged:** open_tasks.md → ticketlist.md (einziger Task-Tracker)
- **Archiviert:** docs/archive/open_tasks_v1.md
- **Updated:** STATUS.md, ticketlist.md, doerfler-ag/status.md
- **Regel:** Alle offenen Tasks leben nur noch im ticketlist.md
