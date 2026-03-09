# OPS Board — FlowSight Roadmap (SSOT)

**Updated:** 2026-03-09 (PR #116: Weinberger AG Website)
**Rule:** CC updates with every deliverable. Founder reviews weekly.
**Einziger Task-Tracker.** Alle offenen Tasks leben hier.

---

## Snapshot

- **Produkt:** 16 Module LIVE (Website, Voice, Wizard, Ops, Reviews, Morning Report, Entitlements, Email, Peoplefone, Sales Agent, Demo Booking, Demo-Strang, SMS Channel, CoreBot, Customer Links Page, BigBen Pub)
- **Kunden:** 7 Websites live (Dörfler, Brunner HT, Walter Leuthold, Orlandini, Widmer, **Weinberger AG**, BigBen Pub)
- **BLOCKER:** 0 ✅
- **Shipped seit 04.03.:** 44 Commits, PRs #53–#116
- **Ops Tooling:** `retell_sync.mjs` + `onboard_tenant.mjs` + `prospect_pipeline.mjs` + `scout.mjs` (ICP Scoring)
- **CI/CD:** GitHub Actions (lint + build + Telegram notify). Branch Protection: PR required.
- **Vercel Region:** Frankfurt (fra1)
- **Phase:** GTM Pipeline v2. Wizard universalisiert (Anliegen statt Schaden). Web-Engine abgeschlossen.

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

## OFFEN — Produkt-Backlog

### Backlog (trigger-basiert)

| # | Deliverable | Owner | Trigger | Status |
|---|-------------|-------|---------|--------|
| N3 | **Kalender-Sync** — Google/Outlook CalDAV | CC | Kundenfeedback | OFFEN |
| N4 | **Morning Report (Cron)** — tägliche Zusammenfassung per E-Mail | CC | Vercel Pro upgrade | OFFEN |
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

**Strategie:** `docs/gtm/gtm_pipeline_plan_v2.md`
**Execution-Tracker:** `docs/gtm/gtm_tracker.md` ← **ALLE GTM-Tasks leben hier**
**Pipeline:** `docs/sales/pipeline.md`
**Goldstandard:** Jul. Weinberger AG, Thalwil (ICP 90+, Leckerli A+B+C+D)
**Phase:** Woche 1 — Foundation + Weinberger Crawl

| # | Task | Owner | Status |
|---|------|-------|--------|
| S1 | Sales Pipeline Tracker eingerichtet | CC | **DONE** ✅ |
| S2 | Scout v2 — ICP Scoring + Multi-Query | CC | **DONE** ✅ |
| S3 | E-Mail-Vorlage + Anruf-Skript ready | CC | **DONE** ✅ |
| S5 | BigBen Pub — Paul Follow-up | Founder | OFFEN — Paul interessiert (#79/#80) |
| S6 | Sales Agent Pricing aktualisiert (199/299/399) | CC | **DONE** ✅ (PR #94) |
| G10 | GTM SSOT Docs (Plan v2 + Tracker) | CC | **DONE** ✅ |
| G9a | Weinberger Website (Leckerli D) | CC | **DONE** ✅ (PR #116) |
| G9b | Weinberger Lisa (Leckerli B-Full) | CC | **DONE** ✅ (PR #118) |
| G1 | Prospect Card Format (JSON v1.0 + Contract) | CC | **DONE** ✅ |
| G3 | Provisioning Runbook (<25 Min) | CC | **DONE** ✅ |
| G4 | Video-Produktions-Template (5 Szenen) | CC | **DONE** ✅ |
| G5 | Premium Outreach-Templates (3 E-Mails + Call) | CC | **DONE** ✅ |
| G6 | Einsatzlogik-Engine (ICP→Leckerli→Assets) | CC | **DONE** ✅ |
| G8 | Quality Gates Checklist (5 Gates) | CC | **DONE** ✅ |
| G2+G7 | → Siehe `docs/gtm/gtm_tracker.md` | CC | IN PROGRESS |

---

## LATER (parked, explicit triggers)

| # | Deliverable | Owner | Trigger |
|---|-------------|-------|---------|
| L1 | Offboarding runbook | CC | Customer #2 onboards |
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

**Ältere Completed (vor 04.03.):** Siehe `docs/archive/wave_log.md`

**Erledigte Founder Blocks:** B (LinkedIn ✅), C (GBP ✅), F2 (Email Deliverability ✅), F5 (Voice Regression ✅), F6 (2FA Audit ✅), F10 (Billing Guard ✅)
