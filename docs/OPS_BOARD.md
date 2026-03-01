# OPS Board — FlowSight Roadmap (SSOT)

**Updated:** 2026-03-01 (N2 E-Mail-First Workflow shipped)
**Rule:** CC updates with every deliverable. Founder reviews weekly.
**Einziger Task-Tracker.** Alle offenen Tasks leben hier.

---

## Snapshot

- **Produkt:** 12 Module LIVE (Website, Voice, Wizard, Ops, Reviews, Morning Report, Entitlements, Email, Peoplefone, Sales Agent, Demo Booking, Demo-Strang)
- **Kunden:** Dörfler AG (Go-Live PARTIAL, 3/4 Module PASS), Brunner HT (Demo-Tenant)
- **Blocker:** Keiner. F9 (Google Review Link Dörfler) ist NICHT Go-Live-kritisch.
- **Bugs:** 0 (N12, N13 fixed)
- **Phase:** Go-Live Dörfler → dann aktive Kundenakquise ab 02.03.

---

## OFFEN — Founder Blocks (Go-Live Dörfler)

| # | Task | Status | Details |
|---|------|--------|---------|
| A | **E2E Go-Live Checklist** | OFFEN | 8 Tests in `docs/evidence/founder_go_live_checklist.md`. ~4h. |
| D | Dörfler Input — Logo, fehlende Texte | PARTIAL | Brand Color + Google Reviews geliefert. Logo offen. |
| E | Mobile QA — iPhone | OFFEN | flowsight.ch + /doerfler-ag, ~30min |
| F | **Go/No-Go Entscheid** | OFFEN | Blocked by: A |
| G | **Kommunikation an Dörfler** | OFFEN | Blocked by: F |
| F9 | Google Review Link (Dörfler) | BLOCKED | Nachrüsten wenn Link da. Nicht Go-Live-kritisch. |
| F11 | Customer Go-Live Sign-off | PARTIAL | 3/4 PASS. Reviews blocked by F9. |

---

## OFFEN — Produkt-Backlog

Trigger-basiert. Kein Overlap mit Go-Live.

| # | Deliverable | Owner | Trigger | Status |
|---|-------------|-------|---------|--------|
| N2 | **E-Mail-First Workflow** — HTML Ops-Notification (Navy/Gold, Urgency-Header, CTA) + HTML Reporter-Bestätigung + Adresse/Melder-Felder | CC | Voice Agent live ✅ | **DONE** ✅ |
| N3 | **Kalender-Sync** — Google/Outlook CalDAV | CC | E-Mail-First shipped + Kundenfeedback | OFFEN |
| N4 | **Morning Report (Cron)** — tägliche Zusammenfassung per E-Mail | CC | Vercel Pro upgrade | OFFEN |
| N5 | **MS Bookings Integration** — Demo-Buchungsseite, direkter Terminlink nach Form-Submit | F + CC | Go-Live done | **DONE** ✅ |
| N6 | **Pitch-Deck** (HTML → PDF, 7 Slides) — `docs/sales/pitch_deck.html` | CC + F | Go-Live done | **DONE** ✅ |
| N7 | Ops-light UI (reviews-only mode) | CC | Reviews-only Kunde signed | OFFEN |
| N8 | CH PLZ validation (voice + wizard) | CC | Misrecognition data from prod | OFFEN |
| N10 | **Voice E-Mail → Deutsch** — Removed English call_summary fallback | CC | Kundenfeedback | **DONE** ✅ |
| N11 | **Adress-Autocomplete** — Swiss Post API / Google Places | CC | Post-MVP | OFFEN |
| N12 | **BUG: Aktionen ohne Speichern-Zwang** — Auto-save bei Aktion, Buttons immer sichtbar | CC | E2E-Test 2026-02-27 | **DONE** ✅ |
| N13 | **BUG: Kachelhöhe Kontakt ↔ Falldetails** — Grid alignment fix | CC | E2E-Test 2026-02-27 | **DONE** ✅ |
| N14 | **OPS Timeline: Nächster Schritt** — Dashed hint: new→kontaktieren, contacted→Termin, scheduled→Einsatz | CC | Demo-Strang Review | **DONE** ✅ |
| N15 | **Terminerinnerung 24h vorher** — E-Mail/SMS an Melder, Leerfahrten vermeiden. Braucht scheduled_at + Cron. | CC | Post-Go-Live | OFFEN |
| N16 | **Kunden-Historie** — Erkennung wiederkehrender Kontakte (z.B. Formular + Anruf 1h später = selber Fall?). Review-Anfrage-History (schon mal gesendet?). reporter_email/phone als Matching-Key. | CC | Post-Go-Live, Kundenfeedback | OFFEN |

---

## SALES — Aktive Kundenakquise (ab 02.03.2026)

**Tracker:** `docs/sales/pipeline.md`
**Rhythmus:** Täglich 4-5h, 5 neue Prospects/Woche
**Methode:** Demo-Website für Prospect bauen → E-Mail → Anruf nach 2 Tagen

| # | Task | Owner | Status |
|---|------|-------|--------|
| S1 | Sales Pipeline Tracker eingerichtet | CC | **DONE** ✅ |
| S2 | Erste 5 Prospects identifizieren + Demo-Websites bauen | Founder + CC | OFFEN — Start 02.03. |
| S3 | E-Mail-Vorlage + Anruf-Skript ready | CC | **DONE** ✅ |
| S4 | Wöchentliche Pipeline-Review (jeden Freitag) | Founder | OFFEN |

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
| L9 | PLZ readback voice quality | CC + Founder | Retell prompt tuning |
| L10 | Retention decisions | Founder | Case + attachment retention periods |
| L11 | WhatsApp Sandbox → Prod | Founder | Ops Alerts need SLA |
| L12 | Data protection statements | Founder | Voice disclosure + Wizard checkbox + DPA |
| L13 | **Demo-Video aufnehmen** | Founder + CC | Go-Live + Demo-Strang shipped |

---

## Completed (Archiv — kondensiert)

| Datum | Deliverable | Evidence |
|-------|-------------|----------|
| 2026-02-25 | Strang A-E: Entitlements, Peoplefone, WhatsApp, Morning Report, Security | Welle 23-25, migrations applied |
| 2026-02-26 | DemoForm, Dörfler Website, Sales Voice Agent "Lisa", Pricing, Business Briefing | /kunden/doerfler-ag, /api/retell/sales, /pricing |
| 2026-02-27 | GBP + LinkedIn, Website-Optimierung (SEO/Kontakt/Demo/Keywords), OPS Dashboard Redesign, Website Process Flow | W1-W4, OpsShell, CaseTimeline, 3 migrations |
| 2026-02-28 | Demo-Strang Brunner HT (v1→v4): Tenant, Seed Data, Custom Demo Page, BrunnerWizardForm, 6-Service Card Grid, lokale Bilder, Team Split-Layout | /brunner-haustechnik, 10 seed cases, 31 images |
| 2026-02-28 | Sales Pipeline Tracker, N15 Terminerinnerung, SSOT-Konsolidierung | docs/sales/pipeline.md |
| 2026-03-01 | Brunner Voice Agent v2 (DE+INTL, Intake+Info Dual-Mode, Firmen-Wissen), Template-System, Setup-Runbook, Twilio +41 44 505 48 18 | retell/exports/brunner_agent*.json, retell/templates/README.md |
| 2026-03-01 | **7-Task Sprint:** N12 fix (auto-save actions), N13 fix (grid alignment), N10 fix (German voice email), N14 (Timeline next step), N5 (MS Bookings), N6 (Pitch Deck), Onboarding Script | CaseDetailForm, CaseTimeline, webhook, DemoForm, pitch_deck.html, onboard_tenant.mjs |
| 2026-03-01 | **N2 E-Mail-First Workflow:** HTML Ops-Notification (Navy/Gold, Urgency-Header rot/amber/slate, CTA-Button), HTML Reporter-Bestätigung, Adresse+Melder in Payload | resend.ts, cases/route.ts, retell/webhook/route.ts |

**Erledigte Founder Blocks:** B (LinkedIn ✅), C (GBP ✅), F2 (Email Deliverability ✅), F5 (Voice Regression ✅), F6 (2FA Audit ✅), F10 (Billing Guard ✅)

**Vollständiges Wave-Log:** `docs/archive/wave_log.md`
