# OPS Board — FlowSight Roadmap (SSOT)

**Updated:** 2026-03-04 (PR #29: P0 Demo Fix — SMS Token + PKCE Magic Link)
**Rule:** CC updates with every deliverable. Founder reviews weekly.
**Einziger Task-Tracker.** Alle offenen Tasks leben hier.

---

## Snapshot

- **Produkt:** 14 Module LIVE (Website, Voice, Wizard, Ops, Reviews, Morning Report, Entitlements, Email, Peoplefone, Sales Agent, Demo Booking, Demo-Strang, SMS Channel, **CoreBot** incl. Voice→STT)
- **Kunden:** Dörfler AG (Go-Live PARTIAL), Brunner HT (Demo-Tenant + SMS live)
- **BLOCKER:** 0. Alle gelöst. ✅
- **Shipped:** N17 ✅ N18 ✅ N19 ✅ N20 ✅ N21 ✅ N26 ✅ N27 ✅ N28 ✅ N30 ✅ N31 ✅ N32 ✅ PR#23 ✅ PR#27 ✅ PR#29 ✅
- **Bugs gesamt:** 20+ Findings → alle Demo-kritischen fixed, 6 Backlog (N22/N23/N24/N29/N33)
- **Ops Tooling:** `retell_sync.mjs` (API-Sync) + `onboard_tenant.mjs` (Tenant-Setup) + `prospect_pipeline.mjs` (Full-Stack Prospect Onboarding)
- **CI/CD:** GitHub Actions (lint + build + Telegram notify). Branch Protection: PR required, 1 approval.
- **Vercel Region:** Frankfurt (fra1)
- **Phase:** Repo-Cleanup abgeschlossen. Kundenakquise-Phase. CoreBot live. Prospect Pipeline ready.

### How to Operate (Founder via Handy)

```
1. CC erstellt Feature-Branch + PR
2. Telegram "FlowSight Ops": ✅/❌ CI Status + Preview-Link + PR-Link
3. Founder: GitHub Mobile App → PR reviewen → Approve + Merge
4. Telegram: 🚀 Shipped → Vercel deployt Prod (~90s)
5. Done. Kein Terminal nötig.
```

---

## OFFEN — Founder Blocks (Go-Live Dörfler)

| # | Task | Status | Details |
|---|------|--------|---------|
| A | **E2E Go-Live Checklist** | **DONE** ✅ | Durchgeführt 01.03. — 17 Findings. PDF: `docs/evidence/Getestet wurde jetzt sehr spezifisch.pdf` |
| D | Dörfler Input — Logo, fehlende Texte | PARTIAL | Brand Color + Google Reviews geliefert. Logo offen. |
| E | Mobile QA — iPhone | OFFEN | N19 fixed ✅ — Founder kann Mobile re-testen. |
| F | **Go/No-Go Entscheid** | OFFEN | Keine Blocker mehr. Founder: `retell_sync.mjs --prefix brunner` + E2E Re-Test → Entscheid. |
| G | **Kommunikation an Dörfler** | OFFEN | Blocked by: F |
| F9 | Google Review Link (Dörfler) | BLOCKED | Nachrüsten wenn Link da. Nicht Go-Live-kritisch. |
| F11 | Customer Go-Live Sign-off | PARTIAL | 3/4 PASS. Reviews blocked by F9. |
| N21 | **Retell 188 Telefonnummer-Bug** | **DONE** ✅ | Fehler gefunden, richtige Nummer hinterlegt (01.03.). |
| N25 | **MS Bookings UX** (Bug 17) | OFFEN | Kumpel-Feedback: Button sagt nur "Termin", Kalender-Add fehlt. Founder prüft MS Bookings Config. |

---

## OFFEN — Produkt-Backlog

### BLOCKER (vor Go-Live)

| # | Deliverable | Bugs | Owner | Status |
|---|-------------|------|-------|--------|
| N19 | **Mobile Auth Fix** — Magic Link "ungültig/abgelaufen" auf Mobile. Converted /auth/confirm to client-side page with button (prevents email client prefetch). | 5 | CC | **DONE** ✅ |
| N20 | **Voice PLZ Overhaul** — City-only confirmation (no digit readback). TTS garbled digits → new approach: confirm only city name. normalizePlz() in webhook as safety net. Founder must re-import agents. | 4 | CC | **DONE** ✅ |

### Go-Live kritisch

| # | Deliverable | Bugs | Owner | Status |
|---|-------------|------|-------|--------|
| N17 | **OPS Case Detail Redesign** — All fields always editable, compact 2-col layout, contact/timeline sidebar, simplified timeline, notes inline, API extended. | 1,2,3,13,14 | CC | **DONE** ✅ |
| N18 | **OPS Case List UX** — Clickable rows, text search, server-side pagination (15/page), filter-clearing bug fixed. Bug 7 (tenant name in header) skipped — FlowSight branding correct for platform. | 8,9,10,11 | CC | **DONE** ✅ |

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
| N26 | **SMS Channel** — Post-call SMS with correction link + photo upload. Twilio alphanumeric sender (BrunnerHT). HMAC-secured public pages `/verify/[caseId]`. Webhook SMS logging. | CC | Voice Agent live ✅ | **DONE** ✅ |
| N27 | **Case Detail UX v2** — Description full-width, Termin links (8/11/15 Uhr) + Notizen rechts, "Termin senden" prominent inline, Action bar: Speichern/Erledigt/Review. | CC | Founder Feedback 02.03. | **DONE** ✅ |
| N28 | **KPI Dashboard Cards** — 4 KPI-Cards mit Click-to-filter (Total→all, Neu→new, In Bearbeitung→default, Erledigt→done). | CC | Founder Feedback 02.03. | **DONE** ✅ |
| N29 | **PLZ/Ort Smart Verification** — Voice Agent + Webhook: PLZ gegen Tenant-Einzugsgebiet prüfen. Service-Area als Datenbank pro Tenant. Falsche PLZ → Rückfrage oder Warnung. | CC | Post-Go-Live, Kundenfeedback | OFFEN |
| N30 | **BUG: SMS Link zu lang** — Short route `/v/[caseId]?t=<16hex>` (HMAC first 8 bytes). ~85 chars statt ~150. API accepts both full+short tokens. | CC | Demo-Feedback 02.03. | **DONE** ✅ |
| N32 | **BUG: OPS Mobile Login** — Root cause: missing `middleware.ts` for Supabase session refresh. Created middleware matching `/ops/*` + `/auth/*`. | CC | Demo-Feedback 02.03. | **DONE** ✅ |
| N31 | **BUG: Voice Closing repeat** — Closing nodes had language-trigger edges catching background noise → loop. Fix: emptied edges on all closing/out-of-scope nodes in all 4 agent JSONs. | CC + Founder | Demo-Feedback 02.03. | **DONE** ✅ |
| N33 | **Demo-Booking SMS (Bestätigung + 24h Reminder)** — Prospect bucht Demo via Website → SMS 1: Sofort-Bestätigung (Datum, Uhrzeit, Kontakt). SMS 2: 24h-Reminder (freundlich, Verschieben möglich). Doppelter Nutzen: (1) Sales-Professionalisierung, (2) Showcase für Sanitär-Kunden ("Leerfahrten vermeiden — genau wie Sie es gerade erlebt haben"). **⚠️ SMS-Spam-Risiko:** Erste Tests zeigten SMS im Spam-Ordner. Vor Umsetzung Lösung finden (Twilio Branded Sender / 10DLC Registration / CH-spezifische Carrier-Regeln). | CC | Sales-Phase | OFFEN |

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
| 2026-03-01 | **N17 Case Detail Redesign:** No edit toggle, all fields editable, compact 2-col layout, contact/timeline sidebar, simplified timeline (gray dots, amber next-step), API extended (urgency/category/plz/city/description) | CaseDetailForm.tsx, page.tsx, CaseTimeline.tsx, route.ts |
| 2026-03-01 | **N18 Case List UX:** Clickable rows, text search (6 columns), server-side pagination (15/page), filterHref bug fix | CaseListClient.tsx, cases/page.tsx |
| 2026-03-01 | **N19 Mobile Auth Fix:** /auth/confirm converted from server GET to client page with "Login bestätigen" button (prevents email prefetch consuming OTP) | ConfirmAuth.tsx, auth/confirm/page.tsx |
| 2026-03-02 | **N20 Voice PLZ Overhaul:** City-only confirmation (no digit readback), normalizePlz() webhook safety net, DE+INTL agent configs updated | webhook/route.ts, brunner_agent*.json |
| 2026-03-02 | **Retell Sync Script:** Automated agent deployment (create/update flows+agents, cross-link swap tools, publish). Idempotent, --dry-run support. | scripts/_ops/retell_sync.mjs |
| 2026-03-02 | **N26 SMS Channel:** Post-call SMS (Twilio alphanumeric), HMAC-secured verify page, address correction API, photo upload (signed URLs → Supabase Storage), CorrectionForm (mobile-first). Webhook SMS logging (sms_sent/sms_skip). | sendSms.ts, postCallSms.ts, verifySmsToken.ts, /verify/[caseId], /api/verify/[caseId] |
| 2026-03-02 | **Voice Agent v3:** SMS+photo mention in closing text, no repeat after goodbye, Dörfler PLZ city-only fix, Dörfler voice_id fix (ElevenLabs→Retell). All 4 agents synced via retell_sync.mjs. | brunner_agent*.json, doerfler_agent*.json |
| 2026-03-02 | **Vercel Region → Frankfurt (fra1):** Bessere Latenz zu CH-Usern + Supabase (auch Frankfurt). | Vercel Dashboard |
| 2026-03-03 | **CoreBot (Telegram → GitHub Issues):** Single Vercel API route, auto-classification (type+domain labels), /status command, Telegram ACK, user whitelist, shared secret auth, dedupe. Runbook: `docs/runbooks/corebot_setup.md` | /api/telegram/webhook |
| 2026-03-03 | **Prospect Pipeline:** Full-stack onboarding script. Quick mode (--url + --slug: Puppeteer crawl → auto-config) + Config mode (--config). Generates: website TS config + images + registry update + Supabase tenant + Voice agent JSONs (DE+INTL). ~15min/prospect vs ~70min manual. | scripts/_ops/prospect_pipeline.mjs |
| 2026-03-03 | **N32 Mobile Login Fix:** Created missing Supabase auth middleware for session refresh. Root cause: server-auth.ts referenced middleware that didn't exist. | src/web/middleware.ts |
| 2026-03-03 | **N31 Voice Closing Fix:** Removed language-trigger edges from closing/out-of-scope nodes in all 4 agent JSONs (brunner+doerfler, DE+INTL). Also fixed doerfler duplicate edges key. | retell/exports/*.json |
| 2026-03-03 | **N30 SMS Short Link:** Short verify route `/v/[caseId]?t=<16hex>` using first 8 bytes of HMAC. URL ~85 chars (was ~150). API accepts both full and short tokens. | verifySmsToken.ts, postCallSms.ts, /v/[caseId] |
| 2026-03-03 | **N28 KPI Cards Click-to-Filter:** 4 existing KPI cards now link to filtered views (Total→all, Neu→new, In Bearbeitung→default, Erledigt→done). | CaseListClient.tsx |
| 2026-03-03 | **N27 Case Detail UX v2:** Description full-width, Termin left (8/11/15h) + Notes right, "Termin senden" inline prominent, simplified action bar. | CaseDetailForm.tsx |
| 2026-03-03 | **Dashboard Showcase:** Replaced single-case mockup in "Alles kommt zu Ihnen" section with full dashboard mockup (KPI cards + 10 realistic cases in table, sidebar hint, search bar). Full-width layout with features below. | DashboardMockup.tsx, (marketing)/page.tsx |
| 2026-03-03 | **Demo-Kit + SIP Fix:** Complete demo toolkit (MicroSIP setup, audio proof, reset SQL, cheat sheet, Twilio diagnose+fix scripts). Fixed SIP auth mismatch (Error 32202) + missing callerId (Error 13214). Created `/api/demo/sip-twiml` route. Verified: Call connected, Lisa answers, 0 errors. | demo-kit/*, src/web/app/api/demo/sip-twiml/route.ts |
| 2026-03-04 | **CoreBot Attachments (PR #27):** Photo/Document support in Telegram → GitHub Issue flow. Session persistence via Supabase Storage (L1 in-memory + L2 cross-instance). /ticket command, 5 attachments/ticket, 25MB limit, inline images in GitHub comments. | /api/telegram/webhook |
| 2026-03-04 | **P0 Demo Fix (PR #29, Closes #28):** (1) SMS verify attachments route accepted only full 64-hex tokens, but SMS sends short 16-hex → "Invalid token". Fix: accept both. (2) PKCE magic link fails cross-browser (in-app browser). Fix: flowType: implicit → token_hash (no stored verifier needed). | attachments/route.ts, browser.ts, ConfirmAuth.tsx |

**Erledigte Founder Blocks:** B (LinkedIn ✅), C (GBP ✅), F2 (Email Deliverability ✅), F5 (Voice Regression ✅), F6 (2FA Audit ✅), F10 (Billing Guard ✅)

**Vollständiges Wave-Log:** `docs/archive/wave_log.md`
