# FlowSight — Business Briefing (Vollständiger Kontext)

> Dieses Dokument ist der komplette Kontext für ChatGPT, Claude und externe Partner.
> Copy-paste als System-Prompt oder ersten Message. Deckt Business, Produkt, Technik und Strategie ab.
> Letzte Aktualisierung: 2026-03-11

---

## 1. Was ist FlowSight?

FlowSight ist ein Multi-Tenant SaaS für Schweizer Handwerksbetriebe. Wir digitalisieren den gesamten Kundenkontakt — vom ersten Anruf über die Fallerfassung bis zur Google-Bewertung.

**Elevator Pitch (30 Sekunden):**
"Die meisten Sanitärbetriebe in der Schweiz haben eine veraltete Website, nehmen Aufträge per Telefon und Zettel an, und verlieren dabei Kunden. FlowSight gibt ihnen eine moderne Website, einen KI-Telefonassistenten der 24/7 Aufträge aufnimmt, und ein einfaches Dashboard wo sie alles im Griff haben. In einer Woche live, ohne IT-Kenntnisse."

**Firma:** FlowSight GmbH (Schweizer GmbH)
**Gründer:** Gunnar Wende, Solo-Founder, Zürich
**LinkedIn:** linkedin.com/company/flowsight-gmbh
**Website:** flowsight.ch
**Geschäftsnummer:** +41 44 552 09 19 (KI-Assistentin "Lisa")

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
- **Dual-Agent:** Deutsch (Stimme "Susi") + International/Englisch (Stimme custom)
- **Language Gate:** Erkennt automatisch ob Deutsch oder andere Sprache
- **Zwei Modi (automatische Erkennung):**
  - **Intake-Modus:** Schadensmeldung aufnehmen (max 7 Fragen: Name, Kategorie, PLZ/Ort, Adresse, Dringlichkeit, Beschreibung) → Fall in Supabase + E-Mails
  - **Info-Modus:** Allgemeine Fragen beantworten (Öffnungszeiten, Preise, Einzugsgebiet, Team, Bewerbungen, Beratung) → kein Ticket
- **Dynamic SIP Routing** (Twilio → richtiger Agent per Nummer)
- **Deterministic Closing:** Farewell no-repeat, end_call tool, ß→ss in Analyse
- **Recording: OFF** (Datenschutz)
- **24/7 erreichbar**, keine verpassten Anrufe
- **Template-System:** Agent-Configs als JSON-Schablone (~20 Min pro Kunde)

### 3.4 Ops Dashboard
- Web-App unter /ops (Login via Supabase Auth)
- **Fallliste:** Alle Fälle mit Status, Quelle (voice/wizard/manual), Datum, seq_number (FS-XXXX)
- **Filter:** Status, Quelle, Kategorie, Zeitraum, Tenant
- **Fall-Detailansicht:** Kontaktdaten, Fallbeschreibung, Fotos, Timeline (case_events), Notizen
- **Aktionen:** Status ändern, Termin senden (E-Mail an Melder), Review anfragen, manueller Fall erstellen
- **KPI-Cards:** Click-to-Filter (Total→all, Neu→new, In Bearbeitung→default, Erledigt→done)
- **CSV-Export** für Buchhaltung/Reporting
- **Light Theme**, Sidebar-Navigation, responsive

### 3.5 Google Review Engine
- Nach erledigtem Fall: Button "Review anfragen" im Ops Dashboard
- Sendet E-Mail an Melder mit direktem Link zur Google-Bewertungsseite
- Tracking: review_sent_at Timestamp pro Fall
- Google Review URL pro Tenant konfigurierbar

### 3.6 Morning Report
- Täglicher Statusbericht: 10 KPIs, Severity-Ampel (GREEN/YELLOW/RED)
- Versand via WhatsApp (Twilio REST API, Sandbox, Founder-only)
- Nur System-Alerts, keine Kundendaten (PII)

### 3.7 E-Mail-Notifications
- **Ops Notification:** Neuer Fall → E-Mail an Betrieb
- **Melder-Bestätigung:** "Wir haben Ihre Meldung erhalten" → E-Mail an Endkunden
- **Review-Anfrage:** "Wie war unser Service?" → E-Mail mit Google-Review-Link
- **Demo-Anfrage:** /demo Formular → E-Mail an Founder
- **Sales Lead:** Voice Agent Lead → E-Mail an Founder
- Provider: Resend (SPF/DKIM/DMARC verifiziert)

### 3.8 SMS Channel
- Post-call SMS mit Korrekturlink an Melder (Twilio alphanumeric sender)
- Kurzlink `/v/[caseId]?t=<16hex>` (~85 Zeichen), HMAC-gesichert
- Foto-Upload via Verify-Seite (Supabase Storage)
- Akzeptiert sowohl Full-Token (64-hex) als auch Short-Token (16-hex)

### 3.9 CoreBot (Ops-Assistent)
- Telegram Bot → GitHub Issues (automatische Klassifizierung)
- **Voice→STT→Issue:** Sprachnachricht → OpenAI Whisper → GitHub Issue
- **Photo/Doc Attachments:** Fotos + Dokumente an Tickets (Supabase Storage)
- **/ticket** und **/status** Befehle
- Session-Persistenz: L1 In-Memory + L2 Supabase Storage

### 3.10 Entitlements
- Per-Tenant Module Gating via hasModule()
- Module: voice, wizard, ops, reviews, morning_report, sms
- Konfiguration in Supabase tenants-Tabelle

### 3.11 Sales Voice Agent "Lisa"
- Auf Geschäftsnummer +41 44 552 09 19
- DE + INTL (auto language swap)
- Beantwortet Fragen zu FlowSight, sammelt Demo-Anfragen
- **Pricing aktuell:** Starter CHF 199, Alltag CHF 299, Wachstum CHF 399

---

## 4. Pakete & Pricing

| Paket | Inhalt | Preis |
|-------|--------|-------|
| **Starter** | Moderne Website + Online-Schadensmeldung + E-Mail-Benachrichtigung + Kunden-SMS + Persönliches Onboarding | CHF 199/Monat |
| **Alltag** | + Digitaler Telefonassistent (24/7) + Fallübersicht + Bestätigungs-SMS + Foto-Upload + Mehrsprachig | CHF 299/Monat |
| **Wachstum** | + Google Review-Anfragen + Priority Support + Stärkeres Google-Profil | CHF 399/Monat |

- Telefonminuten: pay-per-use, keine Grundgebühr. Typischer Anruf: 2-4 Minuten.
- Monatlich kündbar, kein Lock-in.
- Setup in einer Woche, persönliches Onboarding. Keine Setup-Kosten während Pilotphase.

Live auf flowsight.ch/pricing.

---

## 5. Technische Architektur

### Tech Stack

| Layer | Technologie | Plan |
|-------|------------|------|
| Frontend + API | Next.js App Router (Vercel Frankfurt) | Hobby (Free) |
| Datenbank | Supabase (PostgreSQL + Storage + Auth) | Free |
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
  → SMS mit Korrekturlink (Twilio, wenn Voice)
  → case_events Eintrag ("Benachrichtigung gesendet")

NACH ERLEDIGUNG:
  → Status → "resolved" (im Dashboard)
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
| **Dörfler AG** (Oberrieden) | Go-Live PARTIAL (3/4 PASS) | voice, wizard, ops, reviews | flowsight.ch/kunden/doerfler-ag |
| **Brunner Haustechnik AG** (Thalwil) | DEMO (fiktiv) | voice, wizard, ops, reviews, sms | flowsight.ch/kunden/brunner-haustechnik |
| **Walter Leuthold** (Oberrieden) | Website LIVE | wizard | flowsight.ch/kunden/walter-leuthold |
| **Orlandini Sanitär** (Horgen) | Website LIVE | wizard | flowsight.ch/kunden/orlandini |
| **Widmer H. & Co. AG** (Horgen) | Website LIVE | wizard | flowsight.ch/kunden/widmer-sanitaer |
| **BigBen Pub** (Zürich) | Custom Demo | — | flowsight.ch/bigben-pub |

### Dörfler AG — Erster Referenzkunde
- Sanitär/Heizung seit 1926, Oberrieden ZH
- 3/4 Module getestet und bestanden
- Reviews noch blockiert (Google Review Link fehlt, nicht Go-Live-kritisch)
- Founder muss Go/No-Go Entscheid treffen

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

### Phasen-Modell

```
Phase 0: Scout         → 20 Prospects/Tag identifizieren (scout.mjs)
Phase 1: Outreach      → Personalisierter Erstkontakt (Founder, persönlich)
Phase 2: Provisioning  → Trial in <20 Min (provision_trial.mjs)
Phase 3: Trial         → 14 Tage eigenes System (eigene Nummer, Dashboard, Demo-Cases)
Phase 4: Decision      → Convert / Live-Dock / Offboard
Phase 5: Delivery      → Nur bei Conversion (Vertrag, Portierung)
```

### Was der Prospect bekommt (Trial, 14 Tage)
- **Eigene Schweizer Nummer** (Twilio Festnetz)
- **Lisa (B-Full)** — personalisiert mit seinen Services, PLZ, Firmenname
- **Dashboard** via Magic-Link (Prospect-View: Status + Review)
- **15 Demo-Cases** (realistische Schweizer Daten)
- **SMS-Flow** (Post-Call Korrekturlink)
- **Review-Surface** (Google-Style mit Firmenname)

### Trial-Timeline
| Tag | Was |
|-----|-----|
| 0 | Trial Start + Welcome-Mail mit Magic-Link |
| 0-2 | **First-Call-Moment** (Pflicht) — Founder ruft Prospect-Nummer an |
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
- In einer Woche live, kein IT-Projekt
- Ab CHF 199/Monat statt CHF 10'000 einmalig
- Schweizer Nummer, Schweizer Hosting, Deutsch

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

- **Kein Kalender-Sync** — Termine werden manuell im Dashboard eingetragen (N3)
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
- **Roadmap:** docs/OPS_BOARD.md
- **Sales Pipeline:** docs/sales/pipeline.md
