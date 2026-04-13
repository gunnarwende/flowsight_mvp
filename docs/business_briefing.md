# FlowSight — Business Briefing (Vollständiger Kontext)

> Dieses Dokument ist der komplette Kontext für ChatGPT, Claude und externe Partner.
> Copy-paste als System-Prompt oder ersten Message. Deckt Business, Produkt, Technik und Strategie ab.
> Letzte Aktualisierung: 2026-04-13 (Sales Day 13. PRs #438-#444. Speakflow Take 1+2 FINAL, generisches Template, Seed v3 Page-1-Shaping, Papierkorb-Ansicht, Staff-Safety, Case-Header-Redesign.)

---

## 1. Was ist FlowSight?

FlowSight ist das Leitsystem f&uuml;r Schweizer Handwerksbetriebe. Wir digitalisieren den gesamten Kundenkontakt — vom ersten Anruf über die Fallerfassung bis zur Bewertung.

**Elevator Pitch (30 Sekunden):**
"Die meisten Handwerksbetriebe in der Schweiz verpassen Anrufe, verlieren Meldungen und haben keine Zeit für Organisation. FlowSight gibt ihnen ein Leitsystem: eine professionelle Anrufannahme rund um die Uhr, ein Online-Meldungsformular, einen strukturierten Überblick für alle Fälle, und eine Bewertungs-Engine. Persönlich eingerichtet, inklusive, ohne IT-Kenntnisse."

**Firma:** FlowSight GmbH (Schweizer GmbH)
**Gründer:** Gunnar Wende, Solo-Founder, Zürich
**LinkedIn:** linkedin.com/company/flowsight-gmbh
**Website:** flowsight.ch
**Geschäftsnummer:** +41 44 552 09 19 (Digitale Assistentin Lisa)

---

## 2. Zielkunde (ICP)

**Primär:** Inhaber eines Sanitär-/Heizungsbetriebs
- 3-30 Mitarbeiter, inhabergeführt
- Standort: Deutschschweiz (Fokus: Kanton Zürich, linkes Zürichseeufer)
- Website: veraltet oder nicht vorhanden
- Digitalisierungsgrad: gering

**ICP-Analyse (32 Betriebe Kanton ZH, Februar 2026):**
- 97% zeigen KEINE Google-Bewertungen auf ihrer Website
- 50% haben kein Online-Kontaktformular
- 0% haben Online-Terminbuchung oder automatische Bestätigungen
- Top-Services: Sanitär (100%), Heizung (94%), Wartung (88%), Badsanierung (69%), Notdienst (59%)
- Typische Teamgrösse: 5-15 MA
- "Seit 19xx" ist der #1 Trust-Signal
- Schnelle Reaktionszeit und Sauberkeit sind die meistgenannten Review-Themen

**Spätere Branchen-Erweiterung:** Elektriker, Gastronomie (BigBen Pub = erste Demo), Friseur (ab Phase 3, 15+ Kunden)

**Typische Kunden-Aussagen:**
- "Ich bin den ganzen Tag auf der Baustelle, kann nicht ans Telefon."
- "Unsere Website sieht veraltet aus, aber wir haben keine Zeit dafür."
- "Ich schreibe mir die Aufträge auf Zettel und vergesse manchmal was."
- "Google-Bewertungen? Dazu kommen wir nie."

---

## 3. Module — Was FlowSight bietet

### 3.1 Moderne Website
- High-End Website im Firmenlook, mobil-optimiert, SEO
- Template-System: 12 Sektionen (Hero, Leistungen mit Detail-Overlays, Notdienst, Bewertungen, Team, Einzugsgebiet, Karriere, Kontakt, etc.)
- **ServiceDetailOverlay:** Klick auf Service → Overlay mit Beschreibung, Bullet Points, Bilder-Galerie
- **Bild-Galerie:** Horizontal-Scroll + Lightbox (z-[200]), per Service
- Pro Kunde konfigurierbar via Config-Datei (Farben, Texte, Bilder, Services)
- SSG (Static Site Generation) für maximale Performance
- **Customer Links Page:** /kunden/[slug]/links — alle URLs auf einen Blick (noindex)
- URL: flowsight.ch/kunden/[firmen-slug]
- **6 Kunden-Websites live** (inkl. Demo-Tenant und BigBen Pub)
- **Erstellungszeit: ~20 Minuten pro Kunde** (standardisierter 10-Regeln Intake-Prozess)

### 3.2 Schadenmelde-Wizard
- 3-Schritt Online-Formular auf der Kunden-Website
- **Branded pro Kunde** — Farben, Logo, Kategorien aus `services[]` abgeleitet
- Schritt 1: Kategorie wählen (dynamisch aus Kunden-Services)
- Schritt 2: Kontaktdaten (Name, Telefon, E-Mail, Adresse mit PLZ)
- Schritt 3: Beschreibung + optionale Fotos (Supabase Storage)
- **Photo Upload auf Success-Screen** (nach Fallanlage)
- **reporter_name** als Pflichtfeld (Wizard, Voice, Verify, E-Mail)
- Ergebnis: Fall wird in Supabase erstellt, Ops-E-Mail + Melder-Bestätigung gesendet
- Mobil-optimiert, branded im Kunden-Look

### 3.3 KI-Telefonassistent (Voice Agent)
- **Technologie:** Retell AI (Conversational Voice AI)
- **Flow:** Anruf → Peoplefone (Schweizer Nummer) → Twilio SIP → Retell Agent → Webhook → Supabase → E-Mail
- **Dual-Agent:** Deutsch (Stimme "Ela" / ElevenLabs) + International (Stimme "Juniper" / Retell, EN/FR/IT)
- **Language Gate:** Erkennt automatisch ob Deutsch oder andere Sprache
- **Zwei Modi (automatische Erkennung):**
  - **Intake-Modus:** Schadensmeldung aufnehmen (max 7 Fragen: Name, Kategorie, PLZ/Ort, Adresse, Dringlichkeit, Beschreibung) → Fall in Supabase + E-Mails
  - **Info-Modus:** Allgemeine Fragen beantworten (Öffnungszeiten, Preise, Einzugsgebiet, Team, Bewerbungen, Beratung) → kein Ticket
- **Dynamic SIP Routing** (Twilio → richtiger Agent per Nummer)
- **Deterministic Closing:** Farewell no-repeat, end_call tool, ß→ss in Analyse
- **Recording: OFF** (Datenschutz)
- **24/7 erreichbar**, keine verpassten Anrufe
- **Template-System:** Gold-Standard-Schablone mit 23 Platzhaltern (~20 Min pro Kunde)
- **Persona:** "Lisa" — digitale Assistentin mit Firmen-Wissen (Öffnungszeiten, Services, Einzugsgebiet, Team)
- **18 Verhaltens-Szenarien:** Intake, Info, Rückruf, Reklamation, Angebotsanfrage, Sicherheits-Eskalation, Erste-Hilfe, Sprachwechsel, Themenfremde Fragen, Preis-Deflekt
- **14 No-Go's:** Keine Preise erfinden, keine Garantie versprechen, keine Diagnose stellen, keine Termine zusagen, nie "FlowSight" sagen
- **Sprachwechsel:** DE→EN/FR/IT mit Brückensatz in eigener Sprache, Rückswitch ohne Akzent-Probleme
- **Agent Hangup Monitoring:** RED Alert an Founder bei Bug-bedingtem Auflegen (Webhook + Morning Report)

### 3.4 Leitzentrale (Ops Dashboard)
- Web-App unter /ops (Login via Custom OTP: 6-Digit Code per E-Mail, server-side Session. Sender: noreply@send.flowsight.ch)
- **Leitzentrale v3 (FlowBar):** CSS Grid KPIs (Neu/Bei uns/Erledigt/Bewertung), gleiche Breiten, Jahres-Dropdown (2024-2026) + 7d/30d Filter
- **Soft Delete + Papierkorb:** Fälle löschen (Mülleimer-Icon) + Papierkorb-Ansicht (Trash-Icon in Pagination) mit Restore. Gelöschte Fälle fallen aus KPIs raus, bleiben in DB.
- **Quellen-Aufschlüsselung:** "Neu" KPI zeigt 📞 Tel / 🌐 Web / ✏️ Stift mit Anzahl
- **Gold-Sterne:** Bewertungs-KPI immer goldene Sterne, Durchschnitt + "erhalten / angefragt"
- **Admin-Ansicht:** Begrüssung, alle Betrieb-Fälle, Smart Sort, Spaltenfilter
- **Techniker-Ansicht:** "Meine Arbeit" (nur zugewiesene Fälle), nächster Einsatz mit Maps-Link, Pagination
- **Adaptiver Rollen-Toggle:** Admin/Techniker-Switch nur bei Betrieben mit >2 Mitarbeitern sichtbar. Kleine Betriebe (2 Personen) sehen nur die Admin-Ansicht — kein unnötiger UI-Ballast.
- **Fall-Detailansicht:** 2-Zeilen-Header (Kategorie volle Breite), Scroll-to-Top, Status, Termin (mit Kollisions-Warnung), Staff-Zuweisung, Bewertungs-Workflow, Timeline
- **Status-Farben:** Neu=blau, Geplant=violett, In Arbeit=orange, Warten=grau, Erledigt=grün, Erledigt+4★=gold
- **Mobile:** 2x2 Grid KPIs, 8 Fälle/Seite, 48px Tap-Targets
- **PLZ Auto-Fill:** Bei Fallerfassung → Stadt automatisch aus Schweizer PLZ-Map
- **Light Theme**, Sidebar-Navigation, responsive, PWA-installierbar

### 3.5 Google Review Engine v2 (seit 05.04.2026)
- Nach erledigtem Fall: Button "Bewertung anfragen" im Ops Dashboard
- **HTML-E-Mail:** Gebrandete Karte mit Tenant-Farbe, Auftragsreferenz (Kategorie + Ort), grosser CTA-Button "★ Service bewerten — dauert 30 Sekunden". Plain-Text-Fallback.
- **Review Surface v2** (`/review/[caseId]`):
  - Grosse Sterne (48px Tap-Targets, Hover-Animation)
  - **Positiv (4-5★):** 4 klickbare Text-Chips ("Schnell & zuverlässig", "Saubere Arbeit", "Kompetente Beratung", "Jederzeit wieder") + Freitextfeld + "Jetzt auf Google bewerten" CTA
  - **Negativ (1-3★):** Empathie + Textarea "Was können wir besser machen?" + "Feedback senden" — kein Google-Redirect, Feedback wird intern gespeichert
  - **review_text** in DB gespeichert (positiv UND negativ) — Betrieb sieht Kundenfeedback
  - Push-Notification mit Textvorschau an Betrieb
- **KPI-Conversion:** FlowBar zeigt "X/Y erhalten (Z%)" statt nur "gesendet". SystemCard zeigt received/sent Ratio.
- **Google-Count:** Google-Bewertungsanzahl aus weekly Crawl im FlowBar sichtbar
- **Gold-Status:** Fälle mit rating ≥ 4 werden gold markiert in der Leitzentrale
- Google Review URL pro Tenant konfigurierbar (Settings-Seite)
- **E2E-Plan:** `docs/redesign/leitstand/plan_google_bewertungen.md`

### 3.6 Morning Report
- Täglicher Statusbericht: 15 KPIs + Trial Status + Health, Severity-Ampel (GREEN/YELLOW/RED)
- Versand via Telegram (primary) + E-Mail bei RED/YELLOW (Resend)
- GH Actions Cron (daily 07:30 UTC)
- Nur System-Alerts, keine Kundendaten (PII)

### 3.7 E-Mail-Notifications
- **Ops Notification:** Neuer Fall → E-Mail an Betrieb
- **Melder-Bestätigung:** "Wir haben Ihre Meldung erhalten" → E-Mail an Endkunden
- **Review-Anfrage:** "Wie war unser Service?" → E-Mail mit Google-Review-Link
- **Demo-Anfrage:** /demo Formular → E-Mail an Founder
- **Sales Lead:** Voice Agent Lead → E-Mail an Founder
- Provider: Resend (SPF/DKIM/DMARC verifiziert)

### 3.8 SMS Channel
- Post-call SMS mit Korrekturlink an Melder (eCall.ch Swiss Gateway, Business Account Typ A)
- **Sender: Alphanumerisch** (Tenant-Markenname, z.B. "Doerfler AG", max 11 Zeichen) — eCall-verifiziert
- Kurzlink `/v/[caseId]?t=<16hex>` auf flowsight.ch (~85 Zeichen), HMAC-gesichert
- Foto-Upload via Verify-Seite (Supabase Storage)
- **Quality Gates:** 25s Minimum-Duration (kein SMS bei Kurzanruf) + Content-Check (≥2 Felder vom Caller)
- Akzeptiert sowohl Full-Token (64-hex) als auch Short-Token (16-hex)

### 3.9 Push-Notifications (seit 04.04.2026)
- **Per-Tenant Push-Subscriptions:** Jeder Mitarbeiter kann Push-Benachrichtigungen aktivieren
- **Trigger:** Notfall-Fälle (sofort), Zuweisung an Techniker, Bewertung erhalten (★ mit Rating)
- **Stummschalten:** Preferences pro User (Nur Notfälle / Alles / Stumm)
- **Onboarding:** Nicht-aggressiver Banner nach 3s, "Aktivieren" / "Später" (30 Tage dismiss)
- **App-Badge:** Zähler auf dem Homescreen-Icon (Android Chrome/Edge). Zeigt ungelesene Events.
- **Service Worker:** Push-Handler + Notification-Click → Deep-Link in die App
- iOS: Push ab iOS 16.4 ✅, Badge ❌ (Push als Alternative)

### 3.10 Google Review Crawl (seit 04.04.2026)
- **Wöchentlicher Crawl:** GH Actions Cron (Montag 06:00 UTC)
- **Google Places API (New):** Rating + Review-Count + letzte 5 Review-Texte
- **DB-Update:** `modules.google_review_avg`, `google_review_count`, `google_latest_reviews`
- **Kosten:** ~$3.50/Monat bei 50 Betrieben
- **Immer synchron mit Google:** Kein manuelles Eintragen nötig

### 3.11 Wöchentlicher Rapport (seit 04.04.2026)
- **Jeden Montag 07:00 UTC** per Email an Betriebsinhaber
- **Inhalt:** Neue Fälle (Voice/Web/Manual), Erledigt, Bewertungen (erhalten + Ø), Google-Rating, geplante Termine, Notfall-Count
- **Branded:** Tenant-Farbe im Email-Header, Firmenname als Absender
- **Automatisch:** Nur an Tenants mit notification_email (Phase B aktiv)
- **Differenzierung:** Founder wird sichtbar, Betrieb sieht den Wert des Leitsystems

### 3.12 CoreBot (Ops-Assistent)
- Telegram Bot → GitHub Issues (automatische Klassifizierung)
- **Voice→STT→Issue:** Sprachnachricht → OpenAI Whisper → GitHub Issue
- **Photo/Doc Attachments:** Fotos + Dokumente an Tickets (Supabase Storage)
- **/ticket** und **/status** Befehle
- Session-Persistenz: L1 In-Memory + L2 Supabase Storage

### 3.10 Entitlements
- Per-Tenant Module Gating via hasModule()
- Module: voice, wizard, ops, reviews, morning_report, sms
- Konfiguration in Supabase tenants-Tabelle

### 3.11 FlowSight CEO-App (Thema C)
- **Eigene installierbare PWA** unter /ceo — das Nervenzentrum des gesamten Business
- **9 Seiten:** Pulse (Ampel+KPIs+Alerts), Betriebe (Grid+Health Score+Deep-Dive), Pipeline, Finanzen, Monitoring, Benachrichtigungen, Wissen, Team, Admin
- **Betriebe-Seite (02.04.):** Tabs Live/Entwicklung/Archiv, Quick-Actions pro Betrieb (Testnummer, Website, Wizard, Copy), Leitsystem-iframe embedded (Cookie-Switch, Mini-Toolbar, Reload), Tenant-Switcher mit Status-Sortierung + Demo-Badge
- **Update-System (02.04.):** Intelligentes 30s-Polling, Badge mit Änderungszähler, Changelog-Popover ("Neue Fälle: +5"), "Jetzt aktualisieren" Button
- **Smartphone-Preview:** Gesamte CEO-App als Phone-Frame darstellbar (Desktop-Toggle)
- **PWA-Installation:** Eigener ceo-sw.js, Install-Prompt in Sidebar, Gold-Rand auf Icon
- **AI-Copilot:** Model-agnostisch (Claude + GPT). Pulse-Kommentar, Tenant-Insights
- **Design:** Navy+Gold, Mobile-first, PWA installierbar (CEO + pro Tenant getrennt)
- **Skalierbar für 500+ Betriebe:** Pagination, Search, Filter, Server-side Aggregation
- **Gesamtplan:** `docs/redesign/flowsight_ceo_app.md` (27 Features, 10 Phasen, alle LIVE)

### 3.12 Sales Voice Agent "Lisa"
- Auf Geschäftsnummer +41 44 552 09 19
- DE + INTL (auto language swap)
- **4 Modi:** Video-Rückruf (Prio), Kaltanruf (Default), Testnummer-Verwechslung, Support
- Beantwortet Fragen zu FlowSight, sammelt Rückruf-Anfragen für Founder
- **Knowledge Update 23.03.:** Pricing Deflect ("ab 299, monatlich kündbar"), 4-Schritt-Prozess (= Website), DSGVO-konform (nicht "keine Daten ausserhalb Europas"), kein Zeitversprechen für Einrichtung, "monatlich kündbar" statt "14 Tage kostenlos"
- **12 Blind Spots abgedeckt:** Wettbewerbs-Handler ("Leitsystem ersetzt niemanden"), Telefon-Integration ("bestehende Nummer behalten"), Founder-Credibility, Notfall-Handling, Eager-Buyer-Pfad, Sprach-Grenzen, Callback-Timing ("noch am selben Tag"), Saisonalität, Video-Awareness
- **Preise:** Werden NICHT im Detail genannt — Deflect: "ab 299 Franken, monatlich kündbar. Details bespricht Herr Wende persönlich."

---

## 4. Pricing (FINAL, 21.03.2026)

| Tier | Preis/Mo | Zielgruppe | Inkl. Fälle |
|------|----------|-----------|-------------|
| **Standard** | **CHF 299** | 1-5 MA, normaler Betrieb | 100 Fälle/Mo |
| **Professional** | **CHF 499** | 6-15 MA oder serviceintensiv | 200 Fälle/Mo |
| **Enterprise** | **ab CHF 799** | 16+ MA oder 200+ Fälle | Individuell |

Alles inklusive: Website, professionelle Anrufannahme (24/7, Laura-Stimme DE + Juniper INTL), Leitzentrale, SMS, Bewertungs-Engine, 5 Sprachen (DE/CH-DE/EN/FR/IT).

- Monatlich kündbar, kein Lock-in. Keine versteckten Kosten.
- Persönlich eingerichtet, inklusive. Keine Setup-Kosten.
- **Overage:** Intern CHF 1.50/Fall (Standard) bzw. CHF 1.00/Fall (Professional) — wird NICHT auf der Website kommuniziert. Einfachheit > Transparenz bei Overage.
- **Sweetspot:** 5-15 MA Sanitär-/Heizungsbetriebe (85-95% Marge bei CHF 299).
- **Adressierbarer Markt:** ~970 Betriebe Kanton Zürich, ~5'700 Deutschschweiz.
- **Vollständige Pricing-Analyse:** `docs/redesign/leitstand/pricing_und_marge.md`

Live auf flowsight.ch/pricing.

---

## 5. Technische Architektur

### Tech Stack

| Layer | Technologie | Plan |
|-------|------------|------|
| Frontend + API | Next.js App Router (Vercel Frankfurt) | Pro ($20/mo) |
| Datenbank | Supabase (PostgreSQL + Storage + Auth) | Pro ($25/mo) |
| Voice | Retell AI → Twilio SIP → Peoplefone | Pay-as-you-go |
| Email | Resend | Free (100/Tag) |
| Monitoring | Sentry | Free |

### Datenfluss (End-to-End)

```
EINGANG (3 Wege):
  Telefon → Peoplefone → Twilio → Retell → /api/retell/webhook
  Website → Wizard-Formular → /api/cases
  Dashboard → Manueller Fall → /api/cases

VERARBEITUNG:
  → Case in Supabase erstellt (cases-Tabelle)
  → case_events Eintrag ("Fall erstellt")
  → seq_number vergeben (FS-XXXX, auto-increment)

OUTPUT:
  → Ops E-Mail an Betrieb (Resend)
  → Bestätigungs-E-Mail an Melder (Resend)
  → SMS mit Korrekturlink (eCall.ch, wenn Voice)
  → case_events Eintrag ("Benachrichtigung gesendet")

NACH ERLEDIGUNG:
  → Status → "Erledigt" (im Dashboard). Kette: Neu → Geplant → In Arbeit → Warten → Erledigt
  → Optional: Review-Anfrage per E-Mail
```

### Multi-Tenancy

- Jeder Kunde = 1 Tenant in Supabase (tenants-Tabelle)
- tenant_id auf jedem Case
- Entitlements (modules) pro Tenant
- Website-Config pro Tenant (TypeScript-Datei)
- Voice Agent pro Tenant (eigene Retell-Agent-ID + Telefonnummer)

### Fixe Architektur-Entscheidungen

- Voice: Intake-only, max 7 Fragen, branchenspezifisch, Recording OFF
- Output: E-Mail für Kunden. WhatsApp nur Founder-Ops-Alerts (kein PII)
- SSOT: Supabase = Daten, Vercel Env = Secrets
- Deploy: Vercel Frankfurt (fra1), Root Directory = src/web
- Keine Secrets im Repo

---

## 6. Kunden

| Kunde | Status | Module | URL |
|-------|--------|--------|-----|
| **Dörfler AG** (Oberrieden) | **TRIAL_PREP** (Phase A) — Take 2 Video assembliert, Video-Pipeline v1 LIVE | voice, wizard, ops, reviews, sms | flowsight.ch/kunden/doerfler-ag |
| **Brunner Haustechnik AG** (Thalwil) | DEMO (fiktiv) | voice, wizard, ops, reviews, sms | flowsight.ch/kunden/brunner-haustechnik |
| **Jul. Weinberger AG** (Thalwil) | **GTM Goldstandard** | voice, wizard, ops, reviews, sms | flowsight.ch/kunden/weinberger-ag |
| **Walter Leuthold** (Oberrieden) | **TRIAL_PREP** (Phase A) | voice, wizard, ops, reviews, sms | flowsight.ch/kunden/walter-leuthold |
| **Orlandini Sanitär** (Horgen) | Website LIVE | wizard | flowsight.ch/kunden/orlandini |
| **Widmer H. & Co. AG** (Horgen) | Website LIVE | wizard | flowsight.ch/kunden/widmer-sanitaer |
| **BigBen Pub** (Zürich) | Custom Demo | — | flowsight.ch/bigben-pub |

### Dörfler AG — Erster Prospect durch die GTM-Maschine (Gold-Standard)
- Sanitär/Heizung seit 1926, Oberrieden ZH, 3. Generation (Ramon + Luzian Dörfler)
- Voice Agent Gold-Standard: Lisa-Persona, Info+Intake Dual-Mode, 18 Szenarien, Sprachwechsel DE↔EN/FR/IT
- 70 realistische Demo-Cases (2024-2026, saisonal verteilt, Reviews Ø 4.8★)
- Vorstellungsseite LIVE, Video-Takes in Produktion (Segment-Recording + Demo-Audio-Pipeline)
- Noch KEIN Kontakt mit Betrieb. Outreach-Mail READY.
- Pain Types: erreichbarkeit, aussenwirkung, bewertung, notfall, buerochaos (5/5)

### Walter Leuthold — Zweiter Prospect durch die GTM-Maschine
- Sanitär/Spenglerei, Ein-Mann-Betrieb seit 2001, Oberrieden ZH
- Phase A provisioniert (01.04.2026): Website, Voice (Ela), Demo-Cases, Leitzentrale
- ICP 8 (HOT), 4.9 Sterne / 44 Google Reviews — herausragend
- Pain Types: erreichbarkeit (Ein-Mann-Betrieb!), buerochaos, bewertung
- Testnummer: +41 44 505 30 19

### Brunner Haustechnik AG — Demo-Tenant
- Fiktiver Betrieb für Sales-Demos (Thalwil ZH)
- Voice Agent (DE + INTL) auf **+41 44 505 48 18**
- 10 Seed Cases im Ops Dashboard
- Agent-Configs = Schablone für alle künftigen Kunden

### Walter Leuthold, Orlandini, Widmer — Prospect-Websites
- High-End Websites mit ServiceDetailOverlay, Galleries, realen Google Reviews
- Template v3: Standardisierter 10-Regeln Intake-Prozess
- Jeder Kunde hat `docs/customers/<slug>/links.md` mit allen URLs

### BigBen Pub — Gastronomie-Demo
- Custom Demo für Pub/Gastronomie (Reservierungen, Events, Galerie)
- Zeigt Template-Flexibilität über Sanitär hinaus
- Prospect Paul zeigt sich interessiert (#79/#80)

---

## 7. GTM — Product-Led Trial Machine (ab 11.03.2026)

**Kernprinzip:** Kein Pitch-Deck, kein Demo-Call, kein Freemium. Jeder qualifizierte Prospect bekommt sein eigenes System und fühlt das Produkt auf seiner eigenen Nummer.

**Kein B-Quick.** Jeder Prospect bekommt einen dedizierten B-Full Voice Agent (personalisiert mit Firmenname, Services, Region). Qualität vor Skalierung.

### Phasen-Modell (Phase A/B Architektur, ab 01.04.2026)

```
Phase A:   Vorbereitung    → provision_trial.mjs --no-welcome-mail (kein Kontakt)
Phase B-1: Outreach        → Founder schickt Mail 1 (Video + Feedback-Bitte)
Phase B-2: Aktivierung     → Prospect sagt Go + gibt Email → activate_prospect.mjs
Phase B-3: Trial           → 14 Tage eigenes System (Timer startet bei B-2)
Phase B-4: Decision        → Convert / Live-Dock / Offboard
Phase B-5: Delivery        → Nur bei Conversion (Vertrag, Portierung)
```

### Was der Prospect bekommt (nach Phase B-2)
- **Eigene Schweizer Nummer** (Twilio Festnetz)
- **Telefonassistentin (B-Full)** — personalisiert mit Firmenname, Services, PLZ
- **Leitzentrale** via OTP-Login (6-Digit Code per E-Mail, Prospect-View)
- **15 Demo-Cases** (realistische Schweizer Daten)
- **SMS-Flow** (Post-Call Korrekturlink)
- **Review-Surface** (Google-Style mit Firmenname)
- **PWA-App** (installierbar auf Handy)
- **Ops-Email-Benachrichtigungen** (bei neuen Fällen)

### Trial-Timeline
| Tag | Was |
|-----|-----|
| 0 | Prospect sagt Go → activate_prospect.mjs → Welcome-Mail + Leitzentrale-Zugang |
| 0-2 | Prospect testet selbst (Anruf, SMS, Leitzentrale) |
| 10 | **Follow-up** (Pflicht) — Founder ruft persönlich an |
| 14 | **Decision Day** — Convert / Live-Dock / Offboard |

### Funnel-Erwartung
20 Outreach/Tag → ~5 reagieren (25%) → ~3 wollen testen (60%) → ~1 converted (25-30%)

**Operating Model:** `docs/gtm/operating_model.md`
**Pipeline:** `docs/sales/pipeline.md` + `docs/sales/pipeline.csv`

---

## 8. Wettbewerb

**Direkte Konkurrenz:** Kaum vorhanden. Keine Schweizer SaaS-Lösung bietet Website + Voice + Ops + Reviews als Paket für Handwerksbetriebe.

**Indirekte Konkurrenz:**
- Web-Agenturen (CHF 5'000-15'000 einmalig, kein Service)
- Offertenportale (renovero, local.ch — generisch)
- CRM/Ticketing (Freshdesk, Zendesk — zu komplex, nicht branchenspezifisch)

**FlowSight-Vorteile:**
- Branchenspezifisch, nicht generisch
- All-in-one statt 5 verschiedene Tools
- Persönlich eingerichtet, kein IT-Projekt
- CHF 299/Monat statt CHF 10'000 einmalig
- Schweizer Nummer, 100% DSGVO-konform (EU-Server Frankfurt), Deutsch

---

## 9. Skalierungs-Vision

| Phase | Kunden | Zeitrahmen | Fokus |
|-------|--------|-----------|-------|
| 1 | 1-5 | 0-6 Monate | Dörfler live, erste Akquise, manuell |
| 2 | 5-15 | 6-18 Monate | Website-Content → Supabase, einfaches Admin-UI |
| 3 | 15-30 | 18-30 Monate | Branchen-Templates (Elektriker, Gastro), Teilzeit-Hilfe |
| 4 | 30-100 | 30-48 Monate | Auto-Provisioning, Self-Service, Mitarbeiter |

**Entscheidung:** Produkt-Agents (Voice, Reviews) = selbst bauen. Business-Admin (Rechnungen, Buchhaltung) = kaufen (Bexio).

---

## 10. Bekannte Limitationen & offene Punkte

- **Outlook-Kalender Phase 1 LIVE** — Free/Busy im Terminpicker (grün/rote Balken), Kollisionsprüfung intern + Outlook, Application Permissions (client_credentials). Exchange Online Postfach pro MA nötig. Runbook: `docs/runbooks/outlook_kalender_onboarding.md`
- **Review-Anfrage manuell** — kein Auto-Trigger nach Fall-Abschluss
- **Terminerinnerung fehlt** — 24h-Reminder an Melder geplant (N15)
- **Kunden-Historie fehlt** — kein Matching bei wiederholtem Kontakt (N16)
- **Vercel Hobby-Limits** — 1 Log pro Invocation, keine Cron-Jobs
- **Supabase Free** — keine automatischen Backups

---

## 11. Tonalität

- **Sprache:** Hochdeutsch mit Schweizer Einschlag. Du-Form intern, Sie-Form auf Website.
- **Ton:** Professionell aber nahbar. Kein Corporate-Sprech. Direkt, lösungsorientiert.
- **Keine Buzzwords:** "Ihr digitaler Telefonassistent", nicht "KI-Revolution"
- **Branchensprache:** Sanitär, Heizung, Spenglerei, Notdienst, Rohrbruch, Badsanierung
- **Schweizer Kontext:** CHF, Kantone, Gemeinden, suissetec

---

## 12. Links

- **Website:** flowsight.ch
- **Pricing:** flowsight.ch/pricing
- **Referenz:** flowsight.ch/kunden/doerfler-ag
- **Demo:** flowsight.ch/kunden/brunner-haustechnik
- **Demo-Wizard:** flowsight.ch/kunden/brunner-haustechnik/meldung
- **Geschäftsnummer:** +41 44 552 09 19 (Lisa)
- **LinkedIn:** linkedin.com/company/flowsight-gmbh
- **Roadmap:** docs/ticketlist.md
- **Sales Pipeline:** docs/sales/pipeline.md
