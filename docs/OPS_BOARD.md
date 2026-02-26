# OPS Board — Autopilot OS Roadmap (SSOT)

**Updated:** 2026-02-26 (EOD — Sales Voice Agent shipped, open_tasks.md merged)
**Rule:** CC updates this board with every deliverable. Founder reviews weekly.
**Einziger Task-Tracker.** Alle offenen Tasks leben hier. Kein zweites Dokument.

---

## NOW — Go-Live Sprint (Dörfler AG)

### CC Blocks (alle DONE)

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | DemoForm Backend — `/api/demo` → E-Mail | **DONE** ✅ | POST → Resend email, commit 9fa311f |
| 2 | Dörfler AG Website — High-End Rebuild (12 Sektionen) | **DONE** ✅ | /kunden/doerfler-ag live |
| 3 | SSOT Update — STATUS + OPS_BOARD + Customer File | **DONE** ✅ | This update |
| 4 | Ops Dashboard Screenshot | **DEFERRED** | Founder-Task wenn gewünscht |
| 5 | Mobile QA — Samsung S23 (Android) | **DONE** ✅ | Demo erstellt, E-Mail kam rein |
| 6 | Voice Smoke — Regressions-Check | **DONE** ✅ | {"pass":true} |
| 7 | End-to-End Evidence — alle 12 Flows | **DONE** ✅ | docs/evidence/e2e_evidence.md |
| 8 | FlowSight Sales Voice Agent | **DONE** ✅ | /api/retell/sales live, Lisa greeting, Lead-E-Mail an Founder, commit 84fdf1b + 321f074 |
| 9 | Business Briefing (ChatGPT) | **DONE** ✅ | docs/business_briefing.md |
| 10 | Pricing-Seite (3 Pakete) | **DONE** ✅ | /pricing live (shipped mit Marketing Website) |

### Founder Blocks — Go-Live (P0)

| # | Task | Aufwand | Status | Details |
|---|------|---------|--------|---------|
| A | **E2E Go-Live Checklist** durcharbeiten | ~4h | OFFEN | 6 Tests in `docs/evidence/founder_go_live_checklist.md`. Pro Test: Screenshot ablegen. Am Ende: Go/No-Go unterschreiben. |
| B | **LinkedIn Profil** (persönlich) erstellen | ~1.5h | OFFEN | Titel: "Gründer FlowSight GmbH — Digitale Auftragsabwicklung für Sanitär- & Heizungsbetriebe". Info-Text mit ChatGPT (nutze `docs/business_briefing.md`). |
| C | **Google Business Profil** erstellen | ~30min | OFFEN | "FlowSight GmbH", Kategorie "Softwareunternehmen", Servicegebiet Kanton ZH, Tel +41 44 505 74 20. **Verifizierung dauert 1-2 Wochen — JETZT starten.** |
| D | Dörfler Input — Logo, fehlende Texte | — | PARTIAL | Brand Color + Google Reviews geliefert. Logo noch offen. |
| E | Mobile QA — iPhone (flowsight.ch + /doerfler-ag) | ~30min | OFFEN | |
| F | **Go/No-Go Entscheid** | — | OFFEN | Blocked by: A (Checklist) |
| G | **Kommunikation an Dörfler** | — | OFFEN | Blocked by: F (Go/No-Go) |

### Founder Backlog — Dörfler-spezifisch

| # | Task | Status | Notes |
|---|------|--------|-------|
| F10 | Peoplefone/Twilio billing guard | **DONE** ✅ | Twilio triggers $10/$25. Peoplefone auto top-up. |
| F5 | Voice Regression Call Gate | **PASS** ✅ | E2E verified: call → case → email |
| F2 | Email Deliverability Gate | **PASS** ✅ | SPF/DKIM/DMARC all pass |
| F9 | Google Business Review Link (Dörfler) | **BLOCKED** ⏳ | Nicht Go-Live-kritisch. Nachrüsten wenn Link da. |
| F11 | Customer Go-Live Sign-off | **PARTIAL** ⏳ | 3/4 Module PASS. Reviews blocked by F9. |

---

## NEXT — Produkt-Weiterentwicklung (nach Go-Live)

Trigger-basiert. Kein Overlap mit NOW.

| # | Deliverable | Owner | Trigger | Status |
|---|-------------|-------|---------|--------|
| N1 | FlowSight Sales Voice Agent | CC + Founder | Marketing-Website finalisiert | **DONE** ✅ |
| N2 | **E-Mail-First Workflow** — reichhaltigere E-Mails mit Deep-Links, Aktions-Buttons | CC | Voice Agent live ✅ → **jetzt auslösbar** | OFFEN |
| N3 | **Kalender-Sync** — Google/Outlook CalDAV Integration | CC | E-Mail-First shipped + Kundenfeedback | OFFEN |
| N4 | **Morning Report (Cron)** — tägliche Zusammenfassung per E-Mail | CC | Vercel Pro upgrade (enables cron jobs) | OFFEN |
| N5 | **Cal.com Integration** — Demo-Button → Cal.com Buchungsseite | F + CC | Go-Live done. F ~30min (Account), CC ~1h (Integration). Free Tier reicht. 1 Event: "Demo 30min". | OFFEN |
| N6 | **Pitch-Deck** (PDF, 5-8 Slides) | CC + F | Go-Live done. Problem → Lösung → Screenshot → Module → Pricing → Kontakt. CC ~2h, F ~1h Review. | OFFEN |
| N7 | Ops-light UI (reviews-only mode) | CC | Reviews-only customer signs | OFFEN |
| N8 | CH PLZ validation (voice + wizard) | CC | Misrecognition data from production | OFFEN |
| N9 | WhatsApp Sandbox → Production | Founder | Ops Alerts need SLA | OFFEN |

---

## LATER (parked, explicit triggers)

| # | Deliverable | Owner | Trigger |
|---|-------------|-------|---------|
| L1 | Offboarding runbook | CC | Customer #2 onboards |
| L2 | Verträge / AGB Vorlage | Founder (+ Anwalt) | Spätestens vor Kunde #2. SaaS-Vertrag CH-Recht, 2-3 Seiten. |
| L3 | Failure drills (telephony) | CC | First real incident |
| L4 | Erste Betriebe kontaktieren (Sales/GTM) | Founder | Go-Live + Pitch-Deck + Cal.com ready. Lead-Liste in Google Sheet. Einstieg: "Ich habe mir Ihre Website angeschaut..." |
| L5 | LinkedIn Unternehmensseite (FlowSight GmbH) | Founder | Nach persönlichem LinkedIn-Profil. Logo + Beschreibung aus Business Briefing. 1 Post/Woche. |
| L6 | Bitwarden komplett einrichten | Founder | ~4h. Alle Zugänge (Vercel, Supabase, Retell, Twilio, Peoplefone, Resend, Sentry, GitHub). Master-PW + 2FA + Emergency Kit. |
| L7 | Founder Agent v1 (Retell) | CC + Founder | Strang D stable |
| L8 | Founder Ops Inbox | CC + Founder | Strang D stable |
| L9 | PLZ readback voice quality | CC + Founder | Digit-by-digit cadence unnatural. Retell prompt tuning. |
| L10 | Retention decisions | Founder | Decide case + attachment retention periods (docs/compliance/data_processing.md) |
| L11 | WhatsApp Sandbox → Prod evaluation | Founder | When Ops Alerts need SLA or sandbox expires |
| L12 | Data protection statements | Founder | Voice disclosure + Wizard privacy checkbox + DPA links from subprocessors |

---

## Completed (this sprint)

| # | Deliverable | Owner | Closed | Evidence |
|---|-------------|-------|--------|----------|
| — | Strang E: Security/Compliance | CC | 2026-02-25 | Welle 23 (c4ba94d → cc68a62) |
| — | Strang C: WhatsApp + Morning Report | CC | 2026-02-25 | Welle 23-24 |
| — | Strang A: Entitlements | CC + Founder | 2026-02-25 | Welle 24 + migration applied |
| — | Strang B: Peoplefone Front Door | CC + Founder | 2026-02-25 | Welle 25 (case 255136a3) |
| — | DemoForm Backend | CC | 2026-02-26 | /api/demo → Resend email |
| — | Customer Website Template + Dörfler AG | CC | 2026-02-26 | /kunden/doerfler-ag (12 sections, SSG, lightbox) |
| — | Lessons Learned Doc | CC | 2026-02-26 | docs/customers/lessons-learned.md |
| — | Business Briefing (ChatGPT) | CC | 2026-02-26 | docs/business_briefing.md |
| — | Pricing-Seite (3 Pakete) | CC | 2026-02-26 | /pricing live |
| — | FlowSight Sales Voice Agent | CC | 2026-02-26 | /api/retell/sales, retell/flowsight_sales_*.json, Lisa greeting, commit 84fdf1b |
| — | SSOT Konsolidierung | CC | 2026-02-26 | open_tasks.md → archive, OPS_BOARD = einziger Tracker |

---

## NOW (Infrastructure — closed)

| # | Deliverable | Owner | Status | Evidence |
|---|-------------|-------|--------|----------|
| 1 | Test data cleanup + Morning Report fix | CC + Founder | DONE ✓ | Before: RED(20/17). After: YELLOW(2/0). |
| 2 | Compliance Doc Pack | CC | DONE ✓ | docs/compliance/data_processing.md |
| 3 | Onboarding Template Refresh | CC | DONE ✓ | docs/runbooks/onboarding_customer_full.md |
| 4 | Voice Post-Deploy Smoke Script | CC | DONE ✓ | scripts/_ops/smoke_voice.mjs |
| 5 | Release Evidence Standard | CC | DONE ✓ | docs/runbooks/release_checklist.md |
| 6 | Ops Daily Driver Quick Fixes | CC + Founder | DEFERRED | Trigger: ≥5 active customers |

## Founder Backlog — P1 (Week 2, closed)

| # | Task | Status | Notes |
|---|------|--------|-------|
| F6 | Account security / 2FA audit | **DONE** ✅ | docs/runbooks/access_matrix.md |
| F1 | Cost thresholds + upgrade triggers | **DONE** ✅ | docs/runbooks/cost_triggers.md |
| F3 | Supabase backup awareness | **DOCUMENTED** ⚠️ | Free plan = no backups. Risk accepted. |
