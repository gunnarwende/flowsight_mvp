# FlowSight — Business Briefing (Vollständiger Kontext)

> Dieses Dokument ist der komplette Kontext für ChatGPT, Claude und externe Partner.
> Copy-paste als System-Prompt oder ersten Message. Deckt Business, Produkt, Technik und Strategie ab.
> Letzte Aktualisierung: 2026-03-01

---

## 1. Was ist FlowSight?

FlowSight ist ein Multi-Tenant SaaS für Schweizer Handwerksbetriebe. Wir digitalisieren den gesamten Kundenkontakt — vom ersten Anruf über die Fallerfassung bis zur Google-Bewertung.

**Elevator Pitch (30 Sekunden):**
"Die meisten Sanitärbetriebe in der Schweiz haben eine veraltete Website, nehmen Aufträge per Telefon und Zettel an, und verlieren dabei Kunden. FlowSight gibt ihnen eine moderne Website, einen KI-Telefonassistenten der 24/7 Aufträge aufnimmt, und ein einfaches Dashboard wo sie alles im Griff haben. In einer Woche live, ohne IT-Kenntnisse."

**Firma:** FlowSight GmbH (Schweizer GmbH)
**Gründer:** Gunnar Wende, Solo-Founder, Zürich
**LinkedIn:** linkedin.com/in/gunnar-wende
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

**Spätere Branchen-Erweiterung:** Elektriker, Friseur, Pub (ab Phase 3, 15+ Kunden)

**Typische Kunden-Aussagen:**
- "Ich bin den ganzen Tag auf der Baustelle, kann nicht ans Telefon."
- "Unsere Website sieht veraltet aus, aber wir haben keine Zeit dafür."
- "Ich schreibe mir die Aufträge auf Zettel und vergesse manchmal was."
- "Google-Bewertungen? Dazu kommen wir nie."

---

## 3. Module — Was FlowSight bietet

### 3.1 Moderne Website
- High-End Website im Firmenlook, mobil-optimiert, SEO
- Template-System: 12 Sektionen (Hero, Leistungen, Notdienst, Bewertungen, Team, Einzugsgebiet, Karriere, Kontakt, etc.)
- Pro Kunde konfigurierbar via Config-Datei (Farben, Texte, Bilder, Services)
- SSG (Static Site Generation) für maximale Performance
- URL: flowsight.ch/kunden/[firmen-slug]
- **Erstellungszeit: ~20 Minuten pro Kunde**

### 3.2 Schadenmelde-Wizard
- 3-Schritt Online-Formular auf der Kunden-Website
- Schritt 1: Kategorie wählen (Verstopfung, Leck, Heizung, Boiler, Rohrbruch, Sanitär allgemein)
- Schritt 2: Kontaktdaten (Name, Telefon, E-Mail, Adresse mit PLZ)
- Schritt 3: Beschreibung + optionale Fotos (Supabase Storage)
- Ergebnis: Fall wird in Supabase erstellt, Ops-E-Mail + Melder-Bestätigung gesendet
- Mobil-optimiert, branded im Kunden-Look

### 3.3 KI-Telefonassistent (Voice Agent)
- **Technologie:** Retell AI (Conversational Voice AI)
- **Flow:** Anruf → Peoplefone (Schweizer Nummer) → Twilio SIP → Retell Agent → Webhook → Supabase → E-Mail
- **Dual-Agent:** Deutsch (Stimme "Susi") + International/Englisch (Stimme "Juniper")
- **Language Gate:** Erkennt automatisch ob Deutsch oder andere Sprache
- **Zwei Modi (automatische Erkennung):**
  - **Intake-Modus:** Schadensmeldung aufnehmen (max 7 Fragen: Kategorie, PLZ, Adresse, Dringlichkeit, Beschreibung) → Fall in Supabase + E-Mails
  - **Info-Modus:** Allgemeine Fragen beantworten (Öffnungszeiten, Preise, Einzugsgebiet, Team, Bewerbungen, Beratung) → kein Ticket, nur freundliche Auskunft
- **Recording: OFF** (Datenschutz)
- **24/7 erreichbar**, keine verpassten Anrufe
- **Template-System:** Agent-Configs als JSON-Schablone für schnelle Kunden-Onboardings (~20 Min)

### 3.4 Ops Dashboard
- Web-App unter /ops (Login via Supabase Auth)
- **Fallliste:** Alle Fälle mit Status, Quelle (voice/wizard/manual), Datum, seq_number (FS-XXXX)
- **Filter:** Status, Quelle, Kategorie, Zeitraum, Tenant
- **Fall-Detailansicht:** Kontaktdaten, Fallbeschreibung, Fotos, Timeline (case_events), Notizen
- **Aktionen:** Status ändern, Termin senden (E-Mail an Melder), Review anfragen, manueller Fall erstellen
- **KPI-Cards:** Offene Fälle, Neue heute, Ø Reaktionszeit
- **CSV-Export** für Buchhaltung/Reporting
- **Light Theme**, Sidebar-Navigation, responsive

### 3.5 Google Review Engine
- Nach erledigtem Fall: Button "Review anfragen" im Ops Dashboard
- Sendet E-Mail an Melder mit direktem Link zur Google-Bewertungsseite
- Tracking: review_sent_at Timestamp pro Fall
- Google Review URL pro Tenant konfigurierbar (GOOGLE_REVIEW_URL in Entitlements)

### 3.6 Morning Report
- Täglicher Statusbericht: 10 KPIs, Severity-Ampel (GREEN/YELLOW/RED)
- Versand via WhatsApp (Twilio REST API, Sandbox, Founder-only)
- Nur System-Alerts, keine Kundendaten (PII)

### 3.7 E-Mail-Notifications
- **Ops Notification:** Neuer Fall → E-Mail an Betrieb (Zusammenfassung, Link zum Dashboard)
- **Melder-Bestätigung:** "Wir haben Ihre Meldung erhalten" → E-Mail an den Kunden des Betriebs
- **Review-Anfrage:** "Wie war unser Service?" → E-Mail mit Google-Review-Link
- **Demo-Anfrage:** /demo Formular → E-Mail an Founder
- **Sales Lead:** Voice Agent Lead → E-Mail an Founder
- Provider: Resend (Transaktional, SPF/DKIM/DMARC verifiziert)

### 3.8 Entitlements
- Per-Tenant Module Gating via hasModule() Funktion
- Module: voice, wizard, ops, reviews, morning_report
- Konfiguration in Supabase tenants-Tabelle (modules JSONB Array)

---

## 4. Pakete & Pricing

| Paket | Inhalt | Preis (indikativ) |
|-------|--------|-------------------|
| **Starter** | Website + Wizard | ab CHF 99/Monat + Setup |
| **Professional** | + Voice Agent + Ops Dashboard | ab CHF 249/Monat + Setup |
| **Premium** | + Reviews + Morning Report | ab CHF 349/Monat + Setup |

Live auf flowsight.ch/pricing. Preise werden vor Launch finalisiert.

---

## 5. Technische Architektur

### Tech Stack

| Layer | Technologie | Plan |
|-------|------------|------|
| Frontend + API | Next.js App Router (Vercel) | Hobby (Free) |
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
  → case_events Eintrag ("Benachrichtigung gesendet")

NACH ERLEDIGUNG:
  → Status → "resolved" (im Dashboard)
  → Optional: Review-Anfrage per E-Mail
  → Optional: Terminerinnerung (geplant)
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
- Deploy: Vercel, Root Directory = src/web
- Keine Secrets im Repo

---

## 6. Kunden

| Kunde | Status | Module | URL |
|-------|--------|--------|-----|
| **Dörfler AG** (Oberrieden) | Go-Live PARTIAL (3/4 PASS) | voice, wizard, ops, reviews | flowsight.ch/kunden/doerfler-ag |
| **Brunner Haustechnik AG** (Thalwil) | DEMO (fiktiv) | voice, wizard, ops, reviews | flowsight.ch/brunner-haustechnik |

### Dörfler AG — Erster Referenzkunde
- Sanitär/Heizung seit 1926, Oberrieden ZH
- 3/4 Module getestet und bestanden
- Reviews noch blockiert (Google Review Link fehlt, nicht Go-Live-kritisch)
- Founder muss noch E2E Checklist durcharbeiten → Go/No-Go Entscheid

### Brunner Haustechnik AG — Demo-Tenant
- Fiktiver Betrieb für Sales-Demos (Thalwil ZH)
- High-End Custom Demo Page (10 Sections, 30 kuratierte Bilder, KI-Teamfoto)
- 10 Seed Cases im Ops Dashboard (FS-0001 bis FS-0010)
- Eigener Wizard mit Brunner-Branding
- Eigener Voice Agent (DE + INTL) auf **+41 44 505 48 18** mit zwei Modi:
  - **Intake-Modus:** Schadensmeldungen aufnehmen → Ticket im Dashboard
  - **Info-Modus:** Alltagsfragen beantworten (Öffnungszeiten, Preise, Einzugsgebiet, "Chef sprechen", Bewerbungen, etc.) → kein Ticket
- Agent-Configs = Schablone für alle künftigen Kunden (`retell/templates/README.md`)

---

## 7. Sales-Strategie (ab 02.03.2026)

**Methode:** Demo-Website für Prospect bauen → E-Mail → Anruf nach 2 Tagen

**Ablauf pro Prospect (~30 Min):**
1. Google Maps → Sanitärbetrieb finden (3-30 MA, Raum Zürichsee, schlechte/keine Website)
2. Website + Google Reviews analysieren
3. Demo-Website für den Betrieb erstellen (Template-Config, 20 Min)
4. E-Mail: "Ich habe einen Entwurf für Ihre Website erstellt: [Link]"
5. Anruf nach 2 Tagen: "Haben Sie die Website gesehen?"
6. Demo zeigen → Module besprechen → Abschluss

**Ziel:** 5 Prospects/Woche, 1 Neukunde alle 3-6 Wochen
**Tracker:** docs/sales/pipeline.md

**Warum das funktioniert:**
- Kein kalter Pitch, sondern ein Geschenk (fertige Website)
- Prospect sieht seinen eigenen Namen auf einer professionellen Seite
- Einstieg in Gespräch über Voice Agent, Dashboard, Reviews
- Daten sind öffentlich (Google Maps, eigene Website)

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
- Ab CHF 99/Monat statt CHF 10'000 einmalig
- Schweizer Nummer, Schweizer Hosting, Deutsch

---

## 9. Skalierungs-Vision

| Phase | Kunden | Zeitrahmen | Fokus |
|-------|--------|-----------|-------|
| 1 | 1-5 | 0-6 Monate | Dörfler live, erste Akquise, manuell |
| 2 | 5-15 | 6-18 Monate | Website-Content → Supabase, einfaches Admin-UI |
| 3 | 15-30 | 18-30 Monate | Branchen-Templates (Elektriker), Teilzeit-Hilfe |
| 4 | 30-100 | 30-48 Monate | Auto-Provisioning, Self-Service, Mitarbeiter |

**Entscheidung:** Produkt-Agents (Voice, Reviews) = selbst bauen. Business-Admin (Rechnungen, Buchhaltung) = kaufen (Bexio).

---

## 10. Bekannte Limitationen & offene Punkte

- **Kein Kalender-Sync** — Termine werden manuell im Dashboard eingetragen
- **Review-Anfrage manuell** — kein Auto-Trigger nach Fall-Abschluss
- **Terminerinnerung fehlt** — 24h-Reminder an Melder geplant (N15)
- **Kunden-Historie fehlt** — kein Matching bei wiederholtem Kontakt (N16)
- **Voice E-Mail auf Englisch** — Retell Analysis Output noch nicht auf Deutsch (N10)
- **Aktionen im Dashboard umständlich** — Save→Close→Reopen nötig für Termin/Review (Bug N12)
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
- **Demo:** flowsight.ch/brunner-haustechnik
- **Demo-Wizard:** flowsight.ch/brunner-haustechnik/meldung
- **Geschäftsnummer:** +41 44 552 09 19 (Lisa)
- **LinkedIn:** linkedin.com/in/gunnar-wende
- **Roadmap:** docs/OPS_BOARD.md
- **Sales Pipeline:** docs/sales/pipeline.md
