# OPS Board — Autopilot OS Roadmap (SSOT)

**Updated:** 2026-02-28 (Demo-Strang Brunner Haustechnik AG shipped)
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
| B | **LinkedIn Profil** (persönlich) erstellen | ~1.5h | **DONE** ✅ | linkedin.com/in/gunnar-wende — Gründer FlowSight GmbH |
| C | **Google Business Profil** erstellen + Bilder | ~2h | **DONE** ✅ | GBP live: Service-Area Business (Zürichsee links), CTA=Call (Lisa 044 552 09 19), Booking-Link (MS Bookings), 7 Bilder (Logo hell/dunkel, Banner, KI-Voice, Dashboard, Fall-Detail, Review Engine). Assets: `docs/brand/gbp/` + `docs/customers/_flowsight/images/GBP/` |
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

### CC Blocks — Website-Optimierung für GBP (P0) — ALL DONE ✅

Trigger: GBP live → Google zeigte falschen Snippet (Banking/IT statt Sanitär). Gefixt.

| # | Task | Owner | Status | Details |
|---|------|-------|--------|---------|
| W1 | **SEO / Snippet Fix** — Title, Meta Description, OG-Tags | CC | **DONE** ✅ | Root + Homepage metadata, OG + Twitter Cards, canonical. Commit 2bd7094. |
| W2 | **Impressum / Kontakt** — Company Identity & Trust | CC | **DONE** ✅ | Footer Kontakt-Spalte (Tel, Email, LinkedIn), Impressum: Gunnar Wende Geschäftsführer. Commit 2bd7094. |
| W3 | **Demo/Termin Booking Page** — /demo mit Call + Book CTAs | CC | **DONE** ✅ | /demo live: "Jetzt anrufen" (tel:) + "Online-Termin buchen" (MS Bookings). Nav + Footer aktualisiert. Commit 2bd7094. |
| W4 | **Keyword Reinforcement** — Above-the-fold Check | CC | **DONE** ✅ | Hero: "KI-Telefonassistent". Commit 2bd7094. |

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
| N10 | **Voice Agent E-Mail Zusammenfassung → Deutsch** — Retell Custom Analysis Prompt → deutsche Ausgabe | CC | Kundenfeedback | OFFEN |
| N11 | **Adress-Autocomplete** — Swiss Post API oder Google Places (braucht API-Key + Kosten) | CC | Post-MVP, Kundenfeedback | OFFEN |
| N12 | **OPS Fall-Detail UX: Aktionen ohne Speichern-Zwang** — "Termin senden" und "Review anfragen" erfordern aktuell Speichern→Schliessen→Erneut Öffnen. Aktionen sollen direkt ausführbar sein (z.B. als Standalone-Buttons ausserhalb des Bearbeitungsmodus, oder Form bleibt nach Speichern offen). | CC | E2E-Test Founder 2026-02-27 | BUG |
| N13 | **OPS Fall-Detail: Kachelhöhe Kontakt ↔ Falldetails angleichen** — Sidebar-Karte "Kontakt" ist nicht auf gleicher Höhe wie Main-Karte "Falldetails". Visuell unruhig. | CC | E2E-Test Founder 2026-02-27 | BUG |
| N14 | **OPS Timeline: Nächster ausstehender Schritt** — Nach den erledigten Events (Fall erstellt, Benachrichtigung gesendet, etc.) soll in der Timeline der nächste erwartete Schritt angezeigt werden (z.B. "Nächster Schritt: Kunden kontaktieren"). Status-basiert: new→kontaktieren, contacted→Termin vereinbaren, scheduled→Einsatz durchführen. | CC | Demo-Strang Review 2026-02-28 | OFFEN |

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
| L13 | **Demo-Video aufnehmen** — Demo-Strang als Video aufnehmen, für LinkedIn + flowsight.ch/demo | Founder + CC | Go-Live done + Demo-Strang shipped |

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
| — | Google Business Profil (Setup + Bilder) | Founder + CC | 2026-02-27 | GBP live, 7 Bilder (docs/brand/gbp/), Service-Area, Call CTA, Booking Link |
| — | LinkedIn Profil (persönlich) | Founder | 2026-02-27 | linkedin.com/in/gunnar-wende |
| — | Website-Optimierung GBP (W1–W4) | CC | 2026-02-27 | SEO metadata, Footer Kontakt, /demo Booking Page, KI- keyword. Commit 2bd7094 + 1467eef. |
| — | OPS Dashboard Redesign (Light Theme, Sidebar, Timeline, Manual Cases) | CC | 2026-02-27 | Route Groups (auth/dashboard), OpsShell, CaseTimeline, CreateCaseModal, CaseListClient, seq_number (FS-XXXX), case_events, reporter_name, 3 SQL migrations. Commits d97b90d + 2373a27. |
| — | OPS Dashboard Polish (Dropdowns, E-Mail IDs, Farben, Alignment) | CC | 2026-02-27 | Filter-Dropdowns statt Chips, FS-XXXX in E-Mails, bg-slate-100, KPI-Akzente, Notizen immer sichtbar, Edit-Button prominent. Commit 2373a27. |
| — | Website 4-Step Process Flow + MobileNav + No-Brainer-Offer | CC | 2026-02-27 | "So funktioniert FlowSight" (4 Schritte), MobileNav Hamburger, Risk-free Offer Section, Link→/demo. Commit 440ad97. |
| — | Demo-Strang: Brunner Haustechnik AG | CC | 2026-02-28 | Fiktiver Demo-Tenant + 10 Seed Cases + Wizard tenant_slug routing + Dashboard ?tenant= Filter + Demo-Runbook. |

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
