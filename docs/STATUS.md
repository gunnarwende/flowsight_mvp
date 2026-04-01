# FlowSight — STATUS (Company SSOT)

**Datum:** 2026-04-01 (Sales Day 1: Dörfler AG als erster Prospect durch GTM-Maschine. Phase A/B Architektur live. Voice: Ela DE auf allen Agents. Ops-Email tenant-scoped. Impressum+Datenschutz live.)
**Owner:** Founder + CC (Head Ops)

## Was ist FlowSight?

Multi-tenant Intake→Ticket→Dispatch SaaS für Schweizer Handwerksbetriebe.
Kernnutzen: Geschwindigkeit + Klarheit. Notfälle sofort als Ticket (Voice), geplante Fälle via Wizard (Website).

## Tech Stack

| Layer | Technologie | Plan |
|-------|------------|------|
| Frontend + API | Next.js App Router (Vercel) | Pro ($20/mo) |
| Datenbank | Supabase (PostgreSQL + Storage + Auth) | Pro ($25/mo) |
| Voice | Retell AI (Dual-Agent DE/INTL) → Twilio SIP → Peoplefone | Pay-as-you-go |
| Email | Resend (Transaktional, Domain: send.flowsight.ch) | Free |
| SMS | eCall.ch Swiss Gateway (Business Account Typ A, CHF 40/Mo + Punkte) | Pay-as-you-go |
| Monitoring | Sentry (Error Tracking + Alerts) | Free |
| Ops Alerts | Telegram + E-Mail (primary), WhatsApp (optional) | GH Actions + Resend |

## Was ist live?

| Modul | Status | Evidence |
|-------|--------|----------|
| **Wizard** (Website Intake) | LIVE ✅ | /kunden/[slug]/meldung — "Was ist Ihr Anliegen?", Top-3 dynamic + fixed row (Allgemein/Angebot/Kontakt), photo upload in Step 3, branded per customer |
| **Voice** (Telefon Intake) | LIVE ✅ | Dual-Agent DE/INTL, PLZ→City auto-lookup (24 Orte), Language Gate, SMS+Photo mention, reporter_name, deterministic closing, Notfall-Empathie, FAQ-safe edge logic |
| **SMS Channel** | LIVE ✅ | Post-call SMS with short correction link `/v/[id]?t=<16hex>` (~85 chars) + photo upload. eCall.ch Swiss gateway (2-tier sender: alphanumeric → FlowSight-Servicenummer). HMAC-secured. |
| **Leitzentrale v3** | LIVE ✅ | /ops — FlowBar (CSS Grid, YTD-Toggle, Gold-Sterne, Quellen-Aufschlüsselung), Admin+Techniker-Ansicht, Pagination, Period-Filter, Termin-Kollisions-Warnung |
| **Email Notifications** | LIVE ✅ | HTML Ops-Notification + Melder-Bestätigung + Review-Anfrage + Demo + Sales Lead |
| **Peoplefone Front Door** | LIVE ✅ | Brand-Nr → Twilio → SIP → Retell |
| **Morning Report** | LIVE ✅ | 15 KPIs + Trial Status + Deep Health, GH Actions Cron (daily 07:30 UTC), Telegram + E-Mail (RED/YELLOW) |
| **Marketing Website** | LIVE ✅ | flowsight.ch (homepage, pricing, /live-erleben). Nav: Funktionen, Preise, Video sehen, Kontakt, Live erleben. Hero: "Vom ersten Kontakt bis zur 5★ Bewertung." Schweizer Flagge bei Trust-Badge. |
| **Interest Capture Agent** | LIVE ✅ | "Lisa" auf 044 552 09 19 — Interest Capture, Pricing Deflect ("ab 299"), 4-Schritt-Prozess, 12 Blind Spots abgedeckt (Wettbewerb, Telefon-Integration, Notfall, Founder-Credibility etc.). Knowledge Update 23.03. (PR #362). |
| **Customer Websites** | LIVE ✅ | /kunden/[slug] — SSG template (12 sections, ServiceDetailOverlay, lightbox, galleries) |
| **Customer Links Page** | LIVE ✅ | /kunden/[slug]/links — SSG, alle Kunden-URLs auf einen Blick, noindex |
| **Review Engine** | LIVE ✅ | Manual button, review_sent_at, tenant-scoped GOOGLE_REVIEW_URL, SMS fallback |
| **Review Surface** | LIVE ✅ | /review/[caseId] — Pre-Filter (★-Picker → ≥4★ Google, ≤3★ intern), HMAC-validated, tenant-branded |
| **Entitlements** | LIVE ✅ | hasModule() — per-tenant module gating |
| **CoreBot** | LIVE ✅ | Telegram → GitHub Issues (Voice→STT, Photo/Doc Attachments, /ticket, /status) |
| **Demo-Strang** | LIVE ✅ | /brunner-haustechnik — High-End Demo + Voice Agent Intake+Info |
| **BigBen Pub** | LIVE ✅ | /bigben-pub — Custom Demo (Reservierungen, Events, Galerie, Google Reviews) |
| **CEO-App (Thema C)** | LIVE ✅ | /ceo — 9 Seiten: Pulse, Betriebe, Pipeline, Finanzen, Monitoring, Benachrichtigungen, Wissen, Team, Admin. AI-Provider (Anthropic+OpenAI). Navy+Gold Design. PWA installierbar. |
| **AI-Provider Infrastruktur** | LIVE ✅ | Model-agnostisch (Claude+GPT), graceful degradation, Cost Tracker, Pulse-Comment + Tenant-Insight Features |
| **Outlook-Kalender** | LIVE ✅ | Free/Busy im Terminpicker (grün/rot Balken), Kollisionsprüfung intern+Outlook, Application Permissions (client_credentials), pro Mitarbeiter via staff.email |
| **Support Foto-Upload** | LIVE ✅ | /ops/hilfe — Foto/PDF Upload, HTML-E-Mail mit inline Bildern, GitHub Issue mit Anhang-Links |

## Kunden (7 Websites live)

| Kunde | Slug | Module | Status |
|-------|------|--------|--------|
| **Dörfler AG (Oberrieden)** | doerfler-ag | voice, wizard, ops, reviews, sms | **TRIAL_PREP** — Phase A provisioniert, Demo-Script bereit, Erster Prospect durch GTM-Maschine |
| Brunner Haustechnik AG (Thalwil) | brunner-haustechnik | voice, wizard, ops, reviews, sms | DEMO-Tenant |
| Walter Leuthold (Oberrieden) | walter-leuthold | wizard | Website LIVE |
| Orlandini Sanitär (Horgen) | orlandini | wizard | Website LIVE |
| Widmer H. & Co. AG (Horgen) | widmer-sanitaer | wizard | Website LIVE |
| **Jul. Weinberger AG (Thalwil)** | weinberger-ag | voice, wizard, ops, reviews, sms | **GTM Goldstandard** — D+B LIVE, C READY, 75+ Cases (60 done + Reviews), Google 4.4★ |
| BigBen Pub (Zürich) | bigben-pub | — | Custom Demo |

## Aktueller Stand

- **Sales Day 1: Dörfler AG durch GTM-Maschine (01.04.):** PRs #374-#377. **Entwicklungsphase (bis 31.03.) abgeschlossen — ab 01.04. Sales-Phase.** Kein zahlender Kunde bisher. Dörfler AG = erster Prospect E2E durch die Maschine. **Phase A/B Architektur:** Phase A = System bereit, kein Kontakt mit Prospect (provision_trial --no-welcome-mail, trial_status=interested). Phase B = erst nach Prospect-Go (activate_prospect.mjs setzt notification_email, OTP-User, trial_active). **Ops-Email tenant-scoped:** modules.notification_email pro Tenant, Fallback MAIL_REPLY_TO. **Voice: Ela** (ElevenLabs) als neue DE-Stimme auf allen 5 Agents (Dörfler, Brunner, Weinberger, Leuthold, FlowSight Sales). Juniper bleibt INTL. **Impressum + Datenschutz:** Dynamische SSG-Seiten pro Kunden-Website (Schweizer DSG-konform). **Terminologie:** "Dashboard"→"Leitzentrale", "KI-Assistentin"→"Telefonassistentin" auf Welcome-Page. **Demo-Script v3:** 2-Mail-Strategie (Mail 1 = nur Video, Mail 2 = Zugänge nach Prospect-Go), pain_type-basiert, 7 Abschnitte. **Fixes:** seed_demo_data STATUS_DISTRIBUTION (contacted→in_arbeit/warten), prospect_card Team-Fix (Beat→Ramon+Luzian), DSGVO data_storage=everything_except_pii. **GOOGLE_REVIEW_URL:** FlowSight Review-Link als Default auf Vercel.
- **Website Go-Live: Voice-Player + Proof-Block (27.-31.03.):** PRs #366-#373. **Strategiewechsel:** Eigenständiges Hero-Video verworfen (zu aufwändig für Go-Live, Perfektion vs. Pragmatismus). Stattdessen: Voice-first + Screen-Visual. **Homepage (flowsight.ch):** Hero Proof-Block mit S5 Leitzentrale-Screenshot (Gebäudetechnik GmbH, Eva Brunner Leitfall, obere 55% gecroppt, Lightbox zum Vergrössern) + kurze Voice (30s, Helmut Turbo, "Kurz erklärt") + Play-Button + "Video in Vorbereitung". Funktionen-Section wiederhergestellt (4 Schritte, heller Hintergrund, Navy-Akzente). **/live-erleben:** Gleiches Layout, voller Screen (nicht gecroppt) + lange Voice (2 Min, Helmut Turbo, "Live erleben"). **Voices:** ElevenLabs Helmut (turbo v2.5), stability 0.70, similarity 0.78. Kurz = 29.3s, Lang = 134.5s. Leitfall Eva Brunner · Wollishofen · Problem vor Ort. **AudioPlayer + ScreenPreview:** Neue React-Komponenten (Play/Pause mit Progress-Ring, Lightbox-Modal). **Design-Regel:** Navy-Hintergrund NUR auf Hero + Footer. Alles andere: helle einheitliche Flächen. **Master-Film:** Bleibt als Langzeitprojekt. Produktionsarchitektur dokumentiert in `video_final.md` + `video_production_bible.md`. Veo I2V + Nano Banana + Remotion = bewiesener Stack (3-Personen-Opening-Keyframe generiert, 9 Brunner-Screens kalibriert). Film ist kein Go-Live-Blocker.
- **Video-Produktion Architektur (26.-30.03.):** Intensive Exploration über 5 Tage. Bewiesene Architektur: Nano Banana Pro (Keyframes) → Veo 3.1 SDK Image-to-Video (Animation) → Remotion (Compositing). Charakter-Konsistenz über Shots bewiesen via Starting-Frame-Methode. 3-Personen-Opening-Shot generiert (Marco + Kunde + Patrick, Schweizer Technikraum). 9 Screens (S1-S9) auf Leitfall Eva Brunner kalibriert. Scratch-Voice + Animatic v2 gebaut. Panorama-Bild (Szene 1) generiert. Erkenntnis: Film-Produktion erfordert zu viel Iteration für Go-Live → Voice-first Pfad gewählt.
- **Website Final Polish + Lisa Update (23.03.):** PRs #358-#362. Founder-Feedback Round 3: Hero "5★ Bewertung" (Leerzeichen statt Bindestrich), Subline Zeilenumbruch-Kontrolle, Pricing-Teaser ohne Punkt, "Keine Daten ausserhalb Europas"→"100% DSGVO-konform", "In einer Woche" entfernt, Schweizer Flagge SVG bei Trust-Badge. Nav: "Video sehen" (statt doppelt "Live erleben") + neuer "Kontakt" Reiter (→ /live-erleben#formular). Hero Laptop: 3 statt 4 Zeilen. Mobile: strukturierter Umbruch (weiss oben, gold unten). **Lisa DE+INTL komplett aktualisiert:** Altes Pricing (Starter/Alltag/Wachstum 199/299/399) ersetzt durch Deflect + "ab 299". 4-Schritt-Prozess statt 6-Modul-Liste. 12 Blind Spots abgedeckt (Wettbewerb, Telefon-Integration, Founder-Credibility, Notfall, Eager-Buyer, Sprach-Grenzen, Callback-Timing, Saisonalität, Video-Awareness). Retell published.
- **Grossumbau (22.03.):** PRs #348-#352. Website-Redesign: Neue Hero ("Das Leitsystem für Ihren Betrieb — vom ersten Kontakt bis zur Bewertung."), 8-Section-Struktur, Social Proof, "Handwerksbetriebe" statt nur Sanitär. Nav "Live erleben" (statt "Testen"), /live-erleben Seite, /testen→301 Redirect. HeroVisual: 3-Element-Kette (Anruf → SMS mit Firmenname → Leitstand). Kein "Lisa"/"5-Sterne"/"Dashboard" in kundengerichtetem Copy. Pipeline: pain_type + outreach_outcome Spalten live. Konsistenz: "Dashboard"→"Leitstand", "KI-Assistentin"→"Telefonassistentin" in Trial-Emails. Voice Agent: 4-Modi-Redesign (Video-Rückruf, Kaltanruf, Testnummer, Support NEU), retell_sync published. Knowledge Base aligned mit Website. Video-Drehbuch: 2-Min generisches Produktvideo (7 Szenen). Zielarchitektur v2.2 (D37-D40).
- **Voice Session (21.03.):** PRs #336-#345. Laura (ElevenLabs) als neue DE-Stimme auf allen 4 Intake-Agents (Juniper bleibt INTL). Partial Cases Fix: Voice-Fälle gehen nicht mehr verloren bei fehlenden Feldern (68 historische Verluste verhindert). Urgency-Normalisierung (Aliases: "Notfall"→"notfall", "emergency"→"notfall"). SMS-Sender jetzt alphanumerisch (Tenant-Markenname statt Nummer → weniger Spam). E-Mail-Button "Fall in der Leitzentrale öffnen". Kalender Belegt/Frei Balken entfernt (cleaner). PWA Deep-Links über Trampoline-Page.
- **Pricing-Strategie FINAL (21.03.):** PRs #340-#345. End-to-End Kostenanalyse pro Fall (CHF 0.58 minimal, CHF 0.82 typisch). SMS = dominanter Kostentreiber (57-84%, nicht Voice). OpenAI Realtime 2.9× teurer als Retell (Audio-Tokens). Finales Pricing: Standard CHF 299 (100 Fälle inkl.) / Professional CHF 499 (200 Fälle) / Enterprise ab CHF 799. Overage intern, nicht auf Website kommuniziert. Sweetspot: 3-8 MA (85-95% Marge). Markt: ~970 Zürich, ~5'700 Deutschschweiz. Dokument: `docs/redesign/leitstand/pricing_und_marge.md`.
- **Outlook-Kalender Phase 1 LIVE (20.03.):** PRs #317-#330. Outlook Free/Busy im Terminpicker. Grün/rote Verfügbarkeitsbalken, Kollisionsprüfung intern + Outlook, animierter Status-Indikator. Architektur: Application Permissions (client_credentials), kein User-OAuth. Learnings: Delegated OAuth funktioniert nicht für Multi-Tenant (Admin-Token-Hijacking), Exchange Online Postfach ist Pflicht. Runbook: `docs/runbooks/outlook_kalender_onboarding.md`.
- **Sentry Digest + Web Push + PWA (20.03.):** PR #322. Monitoring zeigt jetzt echte Sentry-Errors (25 Issues live). Web Push komplett (SW, Subscribe API, Send API, VAPID Keys). PWA installierbar auf Android/Windows (manifest mit screenshots, id, scope). Alle Founder Tasks F1-F8 erledigt.
- **CEO-App Thema C KOMPLETT (20.03.):** PRs #304-#315. 10 Phasen: Pulse, Betriebe, Pipeline, Finanzen, Monitoring, AI-Copilot, Notifications, Knowledge Base (37 Runbooks), Forecast, Team. 4 DB-Migrationen. Navy+Gold Design. AI-Provider live (Anthropic+OpenAI).
- **Leitstand Feedback-Runde (20.03.):** PRs #295-#302. FB9-FB15: Techniker Bewertungs-KPI Fix, Gold-Ring-Logik ≤3★, Source-Breakdown auf Erledigt, Support Foto-Upload, HTML-E-Mail mit Inline-Bildern.
- **Review KPI + Demo-Daten (20.03.):** PRs #292-#293. Bewertungs-KPI zeigt Google-Durchschnitt aus Tenant-Modules (Weinberger: 4.4★). 60 Done-Cases geseedet (20 mit Rating, 40 nur angefragt). Klickbare Sub-Filter "X erhalten" / "Y angefragt" filtern Tabelle. Timeline Auto-Refresh nach jedem Speichern. Header + Nav Polish. Google-Bewertungen E2E-Plan erstellt.
- **Leitzentrale v3 FlowBar (19.03.):** PRs #287-#290. CSS Grid KPIs, 7d/30d/YTD-Toggle, Quellen-Aufschlüsselung ÜBER Zahl, 👷+✅ Emojis, Gold-Sterne, Mobile 2x2, Period filtert Tabelle (aktive Fälle immer sichtbar). Techniker: Pagination, Period-Toggle, "Nächster Einsatz" immer sichtbar.
- **Review Pre-Filter (19.03.):** PR #288. ★-Picker → ≥4★ Google, ≤3★ intern. Gold-Status in Tabelle.
- **Shared Utilities (19.03.):** statusColors.ts, getGreeting.ts, plzCityMap.ts. PLZ Auto-Fill, Pflichtfeld-Markierung, Termin-Kollision, Sticky Case-ID, 48px Tap-Targets.
- **Scaling & Access (18.03.):** Tenant-Switcher, Support-System, Rollen-Switch.
- **Leitsystem Phase 1-4 (17.-18.03.):** Login OTP, PWA, Falldetail, Staff CRUD.
- **25+ Module LIVE.** 7 Kunden-Websites. 0 zahlende Kunden (Sales-Phase ab 01.04.). CEO-App = Nervenzentrum. Voice: Ela (DE) + Juniper (INTL). Pricing FINAL: Standard CHF 299 / Professional CHF 499 / Enterprise ab CHF 799.

### Kondensierte Historie (04.-14.03.)

Architecture Wave → Quality Wave → Web-Engine → Voice v4 → GTM Foundation → Trial Machine → Monitoring → Gold Contact → Renovation → S1-S4 Build-Blocks. Details: `docs/archive/wave_log.md` + git log.
- **Lisa Interest Capture (11.03.):** PR #150. Sales Agent → Interest Capture Agent. Kein Pricing, kein Feature-Pitch, kein Demo-Buchen. Stattdessen: warm empfangen, Interesse erfassen, Founder-Rückruf vorbereiten. Gold-Contact-aligned.
- **Block A: Identity + Lifecycle (13.03.):** PR #168 + #169. Identity Contract auf alle 7 E-Mail-Templates angewendet (Sender = `{name} via FlowSight`, kein `[FlowSight]` Prefix). Day-5 Engagement-Nudge (mit Suppression bei >=3 Cases). Day-7 Engagement-Snapshot (JSONB). Welcome-Page Trial-Countdown. Demo-Case-Tabs im Leitstand ("Ihre Fälle" / "Demo"). Tab-Titel = `{short_name} OPS`.
- **Block B: Wizard + Review Gold (13.03.):** PR #171. Wizard Notfall-Logik (N1-N7): Phone-CTA-Screen bei Notfall. Review Surface komplett neu (editierbares Textarea, Auftrags-Block, Clipboard+Google-CTA, Tenant-Branding, Event-Tracking). Nachlauf-System (6 Review-Status aus case_events, max 2 Anfragen, 7d-Cooldown, Skip-Action). Leitstand Review-Badges + Aktionen.
- **S1.6: Kategorie-Vereinheitlichung (13.03.):** PR #173. CASE_POOL + deriveWizardCategories() eliminiert. Per-customer `categories[]` in CustomerSite als SSOT. Values aligned mit Voice Agents: "Leck" statt "Leck / Wasserschaden", "Heizung" statt "Heizungsausfall". Shared FIXED_CATEGORIES. **S1 komplett DONE.**
- **BLOCKER:** Keine. Go-Live möglich.
- **S2 Surface Quality (13.03.):** PR #175. Snowflake+Pump Icons (Weinberger Lüftung fix). Reviews-Fallback (Google CTA bei leeren Highlights). Nav-Anchor #bewertungen. Weinberger voicePhone. Hero-Alt-Text dynamisch.
- **S2.2 Tier-1 Website QA (13.03.):** PR #177. Walter Leuthold History-Section enabled (2. Milestone). Widmer Spenglerei-Icon `roof`. Widmer Opening Hours Sa/So. Dörfler Blitzschutz-Bild Encoding-Fix.
- **S2.4 Voice Agent Gold-QA (13.03.):** PR #178. Placeholder Agent-IDs ersetzt (Brunner + Weinberger DE↔INTL Transfer). Alle 8 Agents synced + published.
- **BLOCKER:** Keine. Go-Live möglich.
- **SMS-Architektur (14.03.):** eCall.ch = einziger SMS-Provider (CH). Twilio = nur Voice/SIP. 2-Tier Sender: alphanumerisch (Tenant) → ECALL_SENDER_NUMBER (FlowSight-Servicenummer). Twilio-SMS-Pfad entfernt.
- **S2.5 SMS-Config (13.03.):** Verified. Brunner (BrunnerHT) + Weinberger (Weinberger) korrekt. Andere 4 Tenants wizard-only → kein SMS nötig.
- **S2 KOMPLETT** (CC-seitig). Alle 6 Blocks done (S2.1–S2.6).
- **S3 Journey Verification (13.03.):** PR #181. Trial E2E Tag 0–14 verifiziert (Voice/Wizard/Review/SMS/Dashboard). Trial Expiry Hard Gate (Middleware → /ops/expired). Morning Report follow_up_due Auto-Expire (3d). Milestone-Retry-Bug = FALSE POSITIVE (Code korrekt). **S3 VERDICT: PASS.**
- **S4 Enablement (13.03.):** Walter Leuthold Voice Agent JSONs (DE+INTL) erstellt. Prospect Card + Status erstellt. Video-Ordnerstruktur (`docs/gtm/videos/`) mit vorkonfektionierten Skripten für 3 Prospects (Weinberger, Dörfler, Leuthold). **CC-Scope S4 abgeschlossen. System bereit, Founder übernimmt.**
- **Schatztruhe Final (13.03.):** PR #186. E2E Touchpoint-Architektur (Mechanik × Psychologie × Proof). schatztruhe_final.md = SSOT für alle Touchpoints. production_brief.md v2.0 = vollständiges 130-140s Drehbuch (echte Lisa-Transkripte). Lisa-Greeting + URL-Drift korrigiert.
- **S5 Proof-Capture-Maschine (13.03.):** Prospect Manifest v2.0 (5 Blöcke: Scout/Outreach/Provisioning/Assets/QA). Machine Manifest (12-Schritt Pipeline, Modus-Routing, Kapazitätsmodell). Video Manifest (11-Szenen-Katalog, Capture-Methoden, Assembly-Template). QA Gate (9 Auto + 3 Manual Checks). Outreach-Templates Gold-Contact-aligned (Lifecycle raus, prospect_manifest Variablen). Dörfler AG prospect_card.json erstellt (Gap geschlossen).
- **Nächster Schritt (Founder):** (1) Demo-Video für Dörfler AG aufnehmen (Script v3 bereit). (2) Mail 1 an Dörfler senden. (3) Walter Leuthold als nächsten Prospect durch die Maschine. (4) Orlandini + Weinberger danach.

## Fixe Entscheidungen (No Drift)

- Voice: Intake-only, max 7 Fragen, branchenspezifisch, Recording OFF
- Output: E-Mail (Kunden). WhatsApp: Founder-only Ops Alerts (system RED, keine PII)
- SSOT: Supabase (tenants + cases). Vercel Env = Secret SSOT.
- Deploy: Vercel, Root Directory = src/web
- Secrets: Niemals ins Repo

## Dokument-Map

| Dokument | Inhalt |
|----------|--------|
| `docs/STATUS.md` | Was ist live, aktueller Stand (dieses Dokument) |
| `docs/ticketlist.md` | Offene Tickets, Backlog, GTM Pipeline |
| `docs/business_briefing.md` | Vollständiger Business-Kontext (für ChatGPT/Partner) |
| `docs/gtm/operating_model.md` | GTM Operating Model (6 Phasen, Trial Lifecycle, Quality Gates) |
| `docs/gtm/gtm_tracker.md` | GTM Execution-Tracker (G1-G12 Building Blocks) |
| `docs/architecture/zielarchitektur.md` | Zielarchitektur — 30 Decisions, Business + Produkt + GTM + CEO-App |
| `docs/redesign/flowsight_ceo_app.md` | **CEO-App Gesamtplan** — 27 Features, 10 Phasen, alle LIVE. Founder-Tasks, DB-Schema, AI-Architektur |
| `docs/sales/pipeline.md` | Sales Pipeline Prozess + Tool-Referenz |
| `CLAUDE.md` | Repo-Guardrails, Conventions |
| `docs/customers/<slug>/status.md` | Pro-Kunde Status |
| `docs/customers/<slug>/links.md` | Kunden-URLs (PFLICHT pro Kunde) |
| `docs/customers/<slug>/prospect_card.json` | Prospect Card (GTM, ab G1) |
| `docs/gtm/gold_contact.md` | Gold Contact — Nordstern (Kaufmodell, Profile, Journey, Architektur) |
| `docs/gtm/quality_gates.md` | Quality Gates Checklist (G8) |
| `docs/architecture/contracts/prospect_card.md` | Prospect Card JSON Contract (v1.0 Scout-Output) |
| `docs/architecture/contracts/prospect_manifest.md` | Prospect Manifest v2.0 (Scout + Outreach + Provisioning + Assets + QA) |
| `docs/gtm/machine_manifest.md` | Proof-Capture-Maschine Pipeline (12 Schritte, Modus-Routing, Kapazität) |
| `docs/gtm/video_manifest.md` | Video-Spezifikation (11 Szenen, Variablen, Capture-Methoden, Assembly) |
| `docs/gtm/qa_gate.md` | QA Gate (9 Auto + 3 Manual Checks, Automatisierungs-Roadmap) |
| `docs/runbooks/provisioning_prospect.md` | Provisioning Runbook (<25 Min, G3) |
| `docs/gtm/video_template.md` | Video-Produktions-Template (G4) |
| `docs/gtm/outreach_templates.md` | Premium Outreach-Templates (G5) |
| `docs/gtm/einsatzlogik.md` | Einsatzlogik-Engine (G6) |
| `docs/gtm/schatztruhe_final.md` | E2E Touchpoint-Architektur (Mechanik × Psychologie × Proof) — SSOT |
| `docs/gtm/videos/[slug]/production_brief.md` | Video-Drehbuch pro Prospect (Szene-für-Szene) |
| `docs/customers/lessons-learned.md` | Intake-Prozess, Template-Learnings, Kunden-Learnings |
| `docs/architecture/contracts/` | Case-Datenmodell, Env Vars |
| `docs/compliance/` | Datenschutz, Subprocessors |
| `docs/runbooks/outlook_kalender_onboarding.md` | **Outlook-Kalender Onboarding** — Setup, Go-Live-Checkliste, Learnings, Troubleshooting |
| `docs/runbooks/` | Onboarding, Release, Incidents, Voice Config, Demo Script, CoreBot Setup, Sales Agent Brief |
| `docs/briefings/` | Ad-hoc Inputs (aktive), archivierte → `docs/archive/briefings/` |
| `docs/runbooks/reise_checklist.md` | Founder-Abwesenheit: Vor/Während/Nach, Trial-Timing, Signale |
| `.github/workflows/` | CI (lint+build), Telegram, lifecycle-tick (daily 07:00), morning-report (daily 07:30) |
| `docs/archive/` | Wave Log, alte Dokumente, Agent-Framework, Templates, Architecture Audits |

## Plan-Übersicht & Constraints

- Vercel Pro ($20/mo): 30s Function Timeout, 1 TB bandwidth, bessere Analytics
- Supabase Pro ($25/mo): Daily Backups, 8 GB Storage, unlimited API requests
- Resend Free: 100 emails/day, 1 Domain
- Upgrade-Trigger: `docs/runbooks/cost_triggers.md`
