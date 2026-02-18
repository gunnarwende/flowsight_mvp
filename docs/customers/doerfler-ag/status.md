# Kundenakte: Dörfler AG

## Inputs
- (Links zur alten Website)
- Notrufnummer: vorhanden

## Status
- Setup: pending
- Website/Wizard: pending
- Voice: pending
- Case-System: pending
- Analytics: pending

## Links
- Vercel Preview: -
- Prod: -

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
