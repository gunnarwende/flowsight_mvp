# Ticketlist — FlowSight (SSOT)

**Updated:** 2026-03-13 (S1 komplett DONE — Kategorie-Vereinheitlichung shipped)
**Rule:** CC updates after every deliverable. Founder reviews weekly.
**Einziger Ticket-Tracker.** Alle offenen Tickets leben hier.

---

## Snapshot

- **Produkt:** 17 Module LIVE (Website, Voice, Wizard, Ops, Reviews, Review Surface, Morning Report, Entitlements, Email, Peoplefone, Sales Agent, Demo Booking, Demo-Strang, SMS Channel, CoreBot, Customer Links Page, BigBen Pub)
- **Kunden:** 7 Websites live (Doerfler, Brunner HT, Walter Leuthold, Orlandini, Widmer, **Weinberger AG**, BigBen Pub)
- **BLOCKER:** 0
- **Phase:** Gold Contact Redesign — alle 6 Zielbilder DONE. **Build-Phase beginnt.**
- **Redesign-Docs:** `docs/redesign/` — plan.md + 6 Zielbilder + 4 IST-Audits + identity_contract.md
- **Gold Contact:** `docs/gtm/gold_contact.md` — Nordstern (unveraendert)
- **CI/CD:** GitHub Actions (lint + build + Telegram notify + lifecycle-tick + morning-report). Branch Protection: PR required.

### How to Operate (Founder via Handy)

```
1. CC erstellt Feature-Branch + PR
2. Telegram "FlowSight Ops": CI Status + Preview-Link + PR-Link
3. Founder: GitHub Mobile App → PR reviewen → Approve + Merge
4. Telegram: Shipped → Vercel deployt Prod (~90s)
5. Done. Kein Terminal noetig.
```

---

## OFFEN — Aktive Tickets

| # | Titel | Labels | Status |
|---|-------|--------|--------|
| #80 | BigBen Pub — Ruecksprache Paul erfolgt | telephony, voice | OFFEN — Paul interessiert, Tier 3 |
| #79 | BigBen Pub — Paul zeigt sich interessiert | decision, voice | OFFEN — Follow-up noetig |

---

---

## Backlog (trigger-basiert, Post-Build)

| # | Deliverable | Trigger | Status |
|---|-------------|---------|--------|
| N7 | Ops-light UI (reviews-only mode) | Reviews-only Kunde signed | OFFEN |
| N11 | **Adress-Autocomplete** — Swiss Post API / Google Places | Post-MVP | OFFEN |
| N15 | **Terminerinnerung 24h vorher** | Post-Go-Live | OFFEN |
| N16 | **Kunden-Historie** | Post-Go-Live, Kundenfeedback | OFFEN |
| N24 | **Mobile App / PWA** | Erste zahlende Kunden + Feedback | OFFEN |

### Bewusst entfernt (12.03. — Build-Phase Clean Slate)

| Ehemals | Grund |
|---------|-------|
| ~~N3 Kalender-Sync~~ | Nicht im Gold Contact Scope, trigger-basiert |
| ~~N22 Tenant Brand Color → OPS~~ | Geloest durch Leitstand-Redesign (leitstand.md) |
| ~~N23 Analytics Dashboard~~ | Nicht im Gold Contact Scope |
| ~~N25 MS Bookings UX~~ | Nicht im Gold Contact Scope |
| ~~N29 PLZ/Ort Smart Verification~~ | Geloest durch PLZ_CITY_MAP (wizard.md §8, voice.md) |
| ~~N33 Demo-Booking SMS~~ | Obsolet durch Demo→Test-Flow (PR #148) |
| ~~GitHub Issues #81-#93~~ | Bugs werden nach Build-Phase E2E neu getestet |
| ~~Doerfler Go-Live Blocks (D-G, F9)~~ | Superseded durch Founder Release Gate (plan.md) |

---

## LATER (parked, explicit triggers)

| # | Deliverable | Trigger |
|---|-------------|---------|
| L2 | Vertraege / AGB Vorlage | Vor Kunde #2. SaaS-Vertrag CH-Recht. |
| L3 | Failure drills (telephony) | First real incident |
| L5 | LinkedIn Unternehmensseite | 1 Post/Woche nach Go-Live |
| L6 | Bitwarden komplett einrichten | ~4h. Alle Zugaenge. |
| L10 | Retention decisions | Case + attachment retention periods |
| L11 | WhatsApp Sandbox → Prod | Ops Alerts need SLA |
| L12 | Data protection statements | Voice disclosure + Wizard checkbox + DPA |
| L13 | **Demo-Video aufnehmen** | Go-Live + Demo-Strang shipped |

---

## GTM Pipeline v2

**Living docs:** `docs/gtm/` (operating_model, gtm_tracker, gold_contact, outreach_templates, einsatzlogik)
**Redesign-Docs:** `docs/redesign/` (plan.md + 6 Zielbilder + 4 IST-Audits + identity_contract.md)
**Pipeline:** `docs/sales/pipeline.md`

Alle GTM Building Blocks (G1-G12, S1-S9) = DONE. Details → `docs/gtm/gtm_tracker.md`.

---

## Completed (Archiv — kondensiert)

### S1.6: Kategorie-Vereinheitlichung (13.03.)

| Deliverable | Evidence |
|-------------|----------|
| `categories[]` per CustomerSite — SSOT fuer Wizard + Voice | PR #173 |
| CASE_POOL + deriveWizardCategories() eliminiert | PR #173 |
| Shared FIXED_CATEGORIES (Allgemein, Angebot, Kontakt) | PR #173 |
| Values aligned: "Leck" (nicht "Leck / Wasserschaden"), "Heizung" (nicht "Heizungsausfall") | PR #173 |

### Block B: Wizard + Review Gold (13.03.)

| Deliverable | Evidence |
|-------------|----------|
| Wizard Notfall-Logik (N1-N7): Phone-CTA-Screen | PR #171 (S1.5) |
| Review Surface Gold (RS1-RS10): Komplett-Rewrite | PR #171 (S1.7) |
| Nachlauf-System (NS1-NS3): 6 Status, Resend, Skip | PR #171 (S1.8) |
| Leitstand Review-Badges + Aktionen | PR #171 (S1.9) |
| deriveReviewStatus() — shared lib | PR #171 |
| Skip-Review + Track API routes | PR #171 |

### Block A: Identity + Lifecycle (13.03.)

| Deliverable | Evidence |
|-------------|----------|
| Identity Contract auf alle 7 E-Mail-Templates | PR #168 (S1.1) |
| Day-5 Engagement-Nudge (Suppression bei >=3 Cases) | PR #169 (S1.2) |
| Day-7 Engagement-Snapshot (JSONB) | PR #169 (S1.4) |
| Demo-Case-Tabs ("Ihre Fälle" / "Demo") | PR #169 (S1.3) |
| Welcome-Page Trial-Countdown | PR #169 (S1.10 partial) |
| Tab-Titel `{short_name} OPS` | PR #168 (S2.6) |
| DB Migration: day5_nudge_sent_at, day7_snapshot, is_demo | PR #169 |

### Redesign-Phase (12.03.)

| Deliverable | Evidence |
|-------------|----------|
| Leitstand Zielbild | docs/redesign/leitstand.md |
| Voice IST + Zielbild | docs/redesign/voice_ist.md + voice.md (PRs #153-#155) |
| Identity Contract | docs/redesign/identity_contract.md (PR #156) |
| Prospect Journey IST + Zielbild + Schaerfung | docs/redesign/prospect_journey_ist.md + prospect_journey.md (PRs #157-#158, #164) |
| Wizard IST + Zielbild | docs/redesign/wizard_ist.md + wizard.md (PRs #160-#161) |
| Review IST + Zielbild | docs/redesign/review_ist.md + review.md (PRs #162-#163) |

### Trial Machine + Monitoring (11.03.)

| Deliverable | Evidence |
|-------------|----------|
| Operating Model (6 Phasen) + Trial Lifecycle DB | PR #131 |
| provision_trial.mjs + offboard_tenant.mjs | PR #131 |
| Trial Lifecycle Emails (Welcome, Offboarding) | PR #134 |
| Scout v3 (Voice Fit Scoring) | PR #135 |
| Lifecycle Runner (Tick-Route, Milestones, Day 13 Email) | PR #136 |
| Prospect Welcome Page (/ops/welcome) | PR #136 |
| Monitoring-Haertung (Morning Report Cron, Tick-Failure Alert, Health Check) | PR #138 |
| Reise-Haertung (Runbook, Trial-Timing-Regel, Deep Health) | PR #139 |

### GTM Foundation (09.-11.03.)

| Deliverable | Evidence |
|-------------|----------|
| Weinberger AG Website (GTM Goldstandard) | PR #116 |
| Weinberger Lisa DE + INTL (B-Full) | PR #118 |
| GTM Building Blocks (G1-G12) | PRs #131-#150 |
| Gold Contact Nordstern | PR #145 |
| 299 Flat Pricing | PR #147 |
| Demo→Test Flow | PR #148 |
| Lisa Interest Capture | PR #150 |

### Architecture + Quality Wave (10.03.)

| Deliverable | Evidence |
|-------------|----------|
| RLS Migration (tenant isolation) | PR #128 |
| Tenant Scoping (resolveTenantScope.ts) | PR #128 |
| Review Surface (Google-style, HMAC) | PR #127-#128 |
| Demo-Dataset (seed_demo_data.mjs) | PR #128 |
| Voice Fixes (Closing, Greeting, PLZ Lookup) | PR #126-#127 |
| Dashboard Branding (Tenant Name + Initials) | PR #127 |
| Prospect Magic-Link + Rollenmodell | PR #130 |

### Web-Engine + Voice (04.-09.03.)

| Deliverable | Evidence |
|-------------|----------|
| 7 Customer Websites auf einheitlichem Standard | PRs #62-#97 |
| Wizard Restructure (Anliegen, Top-3, Photos) | PR #113 |
| Voice Agent v4 (reporter_name, closing, empathy) | PRs #83-#86 |
| BigBen Pub Custom Demo | PRs #62-#72 |
| Scout v2 (ICP Scoring, Multi-Query) | PRs #73-#75 |

**Aeltere Completed (vor 04.03.):** Siehe `docs/archive/wave_log.md`
