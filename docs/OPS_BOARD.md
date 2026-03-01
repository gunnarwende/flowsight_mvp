# OPS Board — FlowSight Roadmap (SSOT)

**Updated:** 2026-03-01 (E2E Test — 17 Findings, 3 Blocker)
**Rule:** CC updates with every deliverable. Founder reviews weekly.
**Einziger Task-Tracker.** Alle offenen Tasks leben hier.

---

## Snapshot

- **Produkt:** 12 Module LIVE (Website, Voice, Wizard, Ops, Reviews, Morning Report, Entitlements, Email, Peoplefone, Sales Agent, Demo Booking, Demo-Strang)
- **Kunden:** Dörfler AG (Go-Live PARTIAL), Brunner HT (Demo-Tenant)
- **BLOCKER:** 3 — N19 (Mobile Login), N20 (Voice PLZ), N21 (Retell 188 Telefonnummer)
- **Go-Live kritisch:** N17 (Case Detail Redesign), N18 (Case List UX)
- **Bugs gesamt:** 17 Findings aus Founder E2E Test (01.03.) → 7 Workstreams
- **Phase:** Sales morgen 04:00–12:00 (Prospect-Websites + E-Mails). Danach Blocker fixen.

---

## OFFEN — Founder Blocks (Go-Live Dörfler)

| # | Task | Status | Details |
|---|------|--------|---------|
| A | **E2E Go-Live Checklist** | **DONE** ✅ | Durchgeführt 01.03. — 17 Findings. PDF: `docs/evidence/Getestet wurde jetzt sehr spezifisch.pdf` |
| D | Dörfler Input — Logo, fehlende Texte | PARTIAL | Brand Color + Google Reviews geliefert. Logo offen. |
| E | Mobile QA — iPhone | BLOCKED | Blocked by N19 (Mobile Login funktioniert nicht). |
| F | **Go/No-Go Entscheid** | OFFEN | Blocked by: N17, N18, N19, N20, N21 |
| G | **Kommunikation an Dörfler** | OFFEN | Blocked by: F |
| F9 | Google Review Link (Dörfler) | BLOCKED | Nachrüsten wenn Link da. Nicht Go-Live-kritisch. |
| F11 | Customer Go-Live Sign-off | PARTIAL | 3/4 PASS. Reviews blocked by F9. |
| N21 | **Retell 188 Telefonnummer-Bug** | **BLOCKER** | Retell fügt "188" in Brunner-Nr ein. Founder muss Retell Support kontaktieren. Siehe Bug 15. |
| N25 | **MS Bookings UX** (Bug 17) | OFFEN | Kumpel-Feedback: Button sagt nur "Termin", Kalender-Add fehlt. Founder prüft MS Bookings Config. |

---

## OFFEN — Produkt-Backlog

### BLOCKER (vor Go-Live)

| # | Deliverable | Bugs | Owner | Status |
|---|-------------|------|-------|--------|
| N19 | **Mobile Auth Fix** — Magic Link "ungültig/abgelaufen" auf Mobile (Samsung). Login unmöglich. Supabase Auth Config prüfen. | 5 | CC | **BLOCKER** |
| N20 | **Voice PLZ Overhaul** — PLZ-Readback kaputt (kündigt langsames Vorlesen an, liefert Unsinn). Neuer Ansatz nötig, nicht nochmal am Prompt schrauben. Subsumiert N8 + L9. | 4 | CC | **BLOCKER** |

### Go-Live kritisch

| # | Deliverable | Bugs | Owner | Status |
|---|-------------|------|-------|--------|
| N17 | **OPS Case Detail Redesign** — Kompletter Rebuild. (1) Edit bleibt offen nach Save, Termin/Review ohne Umweg. (2) Timeline: weniger Farben, "Nächster Schritt" sichtbar. (3) Cards aligned, max 4, kein Scroll. (4) Notizen speichern + anzeigen. (5) Alle Felder editierbar (inkl. Kategorie, Urgency, PLZ, City, Beschreibung). (6) Info-Card synct mit Edits. Subsumiert N12/N13/N14. | 1,2,3,13,14 | CC | OFFEN |
| N18 | **OPS Case List UX** — (1) Header: Tenant-Name statt "FlowSight". (2) Ganze Zeile klickbar. (3) Filter-Reset: andere Filter beibehalten. (4) Pagination (default 10, Seiten-Navigation). (5) Textfilter (Name, Adresse). | 7,8,9,10,11 | CC | OFFEN |

### Backlog (trigger-basiert)

| # | Deliverable | Owner | Trigger | Status |
|---|-------------|-------|---------|--------|
| N2 | **E-Mail-First Workflow** — HTML Ops-Notification + Reporter-Bestätigung | CC | Voice Agent live ✅ | **DONE** ✅ |
| N3 | **Kalender-Sync** — Google/Outlook CalDAV | CC | E-Mail-First shipped + Kundenfeedback | OFFEN |
| N4 | **Morning Report (Cron)** — tägliche Zusammenfassung per E-Mail | CC | Vercel Pro upgrade | OFFEN |
| N5 | **MS Bookings Integration** | F + CC | Go-Live done | **DONE** ✅ |
| N6 | **Pitch-Deck** (HTML → PDF, 7 Slides) | CC + F | Go-Live done | **DONE** ✅ |
| N7 | Ops-light UI (reviews-only mode) | CC | Reviews-only Kunde signed | OFFEN |
| N10 | **Voice E-Mail → Deutsch** | CC | Kundenfeedback | **DONE** ✅ |
| N11 | **Adress-Autocomplete** — Swiss Post API / Google Places | CC | Post-MVP | OFFEN |
| N12 | **BUG: Aktionen ohne Speichern-Zwang** | CC | E2E 2026-02-27 | **DONE** ✅ (subsumiert in N17) |
| N13 | **BUG: Kachelhöhe** | CC | E2E 2026-02-27 | **DONE** ✅ (subsumiert in N17) |
| N14 | **OPS Timeline: Nächster Schritt** | CC | Demo-Strang Review | **DONE** ✅ (subsumiert in N17) |
| N15 | **Terminerinnerung 24h vorher** | CC | Post-Go-Live | OFFEN |
| N16 | **Kunden-Historie** | CC | Post-Go-Live, Kundenfeedback | OFFEN |
| N22 | **Tenant Brand Color → OPS** — Kunden-Hauptfarbe als Akzent im OPS Dashboard (Buttons, Cards). Roter Faden Website → OPS. | CC | Demo-relevant | OFFEN |
| N23 | **Analytics Dashboard** — Separate Seite mit KPIs + 2 Diagrammen (Fallvolumen, Bearbeitungszeiten). Neben bestehenden KPI-Cards. | CC | Post-Go-Live | OFFEN |

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
| L10 | Retention decisions | Founder | Case + attachment retention periods |
| L11 | WhatsApp Sandbox → Prod | Founder | Ops Alerts need SLA |
| L12 | Data protection statements | Founder | Voice disclosure + Wizard checkbox + DPA |
| L13 | **Demo-Video aufnehmen** | Founder + CC | Go-Live + Demo-Strang shipped |
| N24 | **Mobile App / PWA** — Fälle auf Handy verfolgen, Routen planen, Kunden anrufen, Kalender-Sync. Killer-Feature für Handwerker auf der Baustelle. (Bug 6) | CC | Erste zahlende Kunden + Feedback |

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
