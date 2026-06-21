# Prospect Journey — IST-Zustand

**Typ:** Bestandsaufnahme (kein Zielbild)
**Stand:** 2026-03-12
**Methode:** Code-Audit aller relevanten Dateien (API-Routes, Scripts, Components, Migrations, Workflows)
**Zweck:** Belastbare Grundlage fuer das Prospect Journey Zielbild

---

## 1. Systemueberblick

Die Prospect Journey ist der 14-Tage-Erlebnisbogen eines Sanitaer-/Heizungsbetriebs, der FlowSight testet. Sie beginnt mit dem Provisioning (Tag 0) und endet mit einer Entscheidung (Tag 14): Vertrag, Verlaengerung oder Offboarding.

### Beteiligte Systeme

| System | Rolle | Dateien |
|--------|-------|---------|
| `provision_trial.mjs` | Tenant erstellen, Auth-User anlegen, Demo-Daten seeden, Welcome-Mail senden | `scripts/_ops/provision_trial.mjs` |
| Supabase Auth | Magic Link, Session, Role-Based Access | `middleware.ts`, `resolveTenantScope.ts` |
| Welcome Page | Erster Prospect-Touchpoint nach Login | `app/ops/(dashboard)/welcome/page.tsx` |
| Leitstand (Dashboard) | Fallubersicht, KPI-Kacheln, Case Detail | `app/ops/(dashboard)/cases/` |
| Voice Agent (Lisa) | Telefonischer Intake-Test | Retell Agents (8 Agents, 4 Tenants) |
| SMS Post-Call | Bestaetigung + Korrekturlink nach Anruf | `lib/sms/postCallSms.ts` |
| SMS Correction Page | Adresse pruefen, Fotos hochladen | `app/verify/[caseId]/` |
| Lifecycle Tick | Tages-Milestones (Day 7/10/13/14) | `app/api/lifecycle/tick/route.ts` |
| Morning Report | Taeglicher Status-Bericht an Founder | `scripts/_ops/morning_report.mjs` |
| Offboard Script | Trial beenden, Daten loeschen | `scripts/_ops/offboard_tenant.mjs` |
| E-Mail (Resend) | Welcome, Day 13, Offboarding, Case-Notification | `lib/email/resend.ts`, `_lib/send_email.mjs` |

### Automatisierungsgrad

| Aktion | Automatisch | Manuell |
|--------|-------------|---------|
| Tenant erstellen | Script | Founder fuehrt Script aus |
| Welcome-Mail senden | Script (im Provisioning) | — |
| Demo-Daten seeden | Script (im Provisioning) | — |
| Magic Link generieren | Script (im Provisioning) | — |
| Day 7 Check | Lifecycle Tick (GH Actions, 07:00 UTC) | — |
| Day 10 Alert | Morning Report (GH Actions, 07:30 UTC) | Founder muss anrufen |
| Day 13 E-Mail | Lifecycle Tick | — |
| Day 14 Status-Wechsel | Lifecycle Tick | — |
| Offboarding | — | Founder entscheidet + fuehrt Script aus |
| Konvertierung | — | Founder + Vertrag |

---

## 2. Tag-fuer-Tag-Ablauf (IST)

### Tag 0: Provisioning + Welcome

**Was passiert:**
1. Founder fuehrt `provision_trial.mjs` aus mit:
   - `--slug`, `--name`, `--prospect-email`, `--phone`, `--gewerk`, `--seed-count`
2. Script erstellt:
   - Tenant in Supabase (`trial_status='trial_active'`, `trial_start=now`, `trial_end=now+14d`, `follow_up_at=now+10d`)
   - Telefonnummer-Zuweisung (`tenant_numbers`)
   - 15 Demo-Cases mit Events (`is_demo=true`)
   - Auth-User (`role='prospect'`, `tenant_id` in app_metadata)
   - Magic Link (Supabase native, Redirect → `/ops/welcome`)
3. Welcome-Mail wird gesendet

**Welcome-Mail (IST):**
- Subject: `Willkommen — Ihr 14-Tage Trial bei FlowSight`
- From: `noreply@send.flowsight.ch`
- Greeting: "Guten Tag" (generisch, kein Name)
- Inhalt: Trial-Info, Magic-Link-Button, Testnummer, "Das ist enthalten"-Liste
- Footer: "Gunnar Wende — 044 552 09 19 — flowsight.ch"
- **Personalisierung:** Nur Firmenname. Kein `{NACHNAME}`, kein `{FIRMA}` im Greeting.
- **Sender-Name:** FlowSight (nicht Tenant-Name)

**Luecken Tag 0:**
- Welcome-Mail zeigt "FlowSight" statt Tenant-Identitaet (verstösst gegen Identity Contract R4)
- Kein Prospect-Nachname in der Begruesssung
- Magic Link Gueltigkeit = Supabase-Default (typ. 24h) — nicht dokumentiert
- Kein Hinweis auf Recording OFF (Vertrauensbildung fehlt)

### Tag 0: Welcome Page (nach Magic-Link-Klick)

**Was der Prospect sieht:**
1. Magic Link → Supabase Auth Session → Redirect `/ops/welcome`
2. Welcome Page zeigt:
   - Badge: "Trial aktiv"
   - Greeting: "Willkommen, {tenant.name}" (dynamisch aus DB)
   - Tagline: "Ihr FlowSight Trial ist bereit. Testen Sie jetzt Ihre persönliche KI-Assistentin."
   - **Primary CTA:** "Jetzt anrufen" → `tel:`-Link zur Voice-Nummer
   - Hilfstext: "Lisa nimmt ab, erkennt Ihr Anliegen und leitet alles strukturiert weiter."
   - **Secondary CTA:** "Dashboard öffnen" → `/ops/cases`
   - Trial-Zeitraum: Start → Ende (14 Tage)
   - Feature-Liste: Lisa, SMS, Dashboard, Reviews
   - Footer: "Gunnar Wende — 044 552 09 19 — flowsight.ch"

**Was funktioniert:**
- Tenant-Name wird korrekt angezeigt
- Testnummer wird formatiert (E.164 → 044 123 45 67)
- Admins werden zu `/ops/cases` weitergeleitet (kein Welcome fuer Admins)
- Product-led CTA (Anruf zuerst, Dashboard zweitens)

**Luecken Welcome Page:**
- Tagline sagt "FlowSight Trial" (Identity Contract R4: sollte Tenant-Name sein)
- Footer zeigt Founder-Kontakt (Identity Contract R4: Founder-Branding entfernen)
- Kein Trial-Countdown (Prospect weiss nicht, wie viele Tage verbleiben)
- Kein Hinweis, was bei Problemen zu tun ist

### Tag 0: Erster Anruf (Lisa-Test)

**Was passiert:**
1. Prospect ruft Testnummer an
2. Lisa meldet sich: "{Greeting}" (tenant-spezifisch, hardcoded in Agent-JSON)
3. Gespraech: max 7 Fragen, Kategorie/PLZ/Beschreibung erfassen
4. Nach Gespraech: Post-Call-Analyse (gpt-4.1-mini) → Case in Supabase
5. SMS an Prospect (da SIP-Nummer → `demo_sms_target` oder `DEMO_SIP_CALLER_ID`)

**Post-Call SMS (IST):**
```
{smsSenderName}: Ihre Meldung ({category}) wurde aufgenommen.

Erfasste Adresse:
{street} {houseNumber}, {plz} {city}

Stimmt alles? Haben Sie Fotos vom Schaden?
{correctionUrl}

Ihr Service-Team meldet sich schnellstmöglich.
```

- Absender: `short_name` aus `modules.sms_sender_name` (korrekt per Identity Contract E1)
- Korrekturlink: `/verify/{caseId}?token={hmac}`
- **Funktioniert:** SMS kommt an, Link funktioniert, Fotos hochladbar

**Luecken Erster Anruf:**
- SMS-Routing bei SIP-Nummern haengt von `demo_sms_target` oder `DEMO_SIP_CALLER_ID` ab — wenn beides fehlt, geht SMS ins Leere
- Case-Notification-Mail geht an Founder (`MAIL_REPLY_TO`), nicht an Prospect — Prospect sieht neue Faelle nur im Dashboard

### Tag 0: Erster Dashboard-Besuch

**Was der Prospect sieht:**
1. Click "Dashboard öffnen" → `/ops/cases`
2. KPI-Kacheln: Total Faelle, Neu heute, In Bearbeitung, Erledigt (7d)
3. Fallliste: 15 Demo-Cases + ggf. eigener Testfall
4. Jeder Fall klickbar → Detail mit Kategorie, PLZ, Beschreibung, Status-Dropdown
5. Prospect kann Status aendern (Neu → Kontaktiert → Geplant → Erledigt)

**Was funktioniert:**
- Tenant-Isolation via RLS (Prospect sieht nur eigene Tenant-Daten)
- KPI-Kacheln zaehlen korrekt
- Fallliste mit Filtern (Status, Dringlichkeit, Quelle)
- Suche funktioniert
- CSV-Export funktioniert
- Mobile: Cards statt Tabelle, Hamburger-Menu

**Luecken Dashboard:**
- **Demo-Cases nicht gefiltert:** `is_demo=true` Cases erscheinen in der Default-Ansicht. Prospect sieht 15 Fake-Faelle vermischt mit echten Testfaellen.
- Sidebar zeigt Firmen-Initialen + Tenant-Name (korrekt), aber Tab-Titel = "FlowSight OPS" (verstösst gegen Identity Contract E1)
- Kontaktdaten im Case Detail sind fuer Prospects versteckt (korrekt), aber ohne Erklaerung warum
- "Anrufe" und "Reviews" und "Einstellungen" als Nav-Punkte sichtbar aber disabled ("Bald") — wirkt unfertig

### Tag 1–4: Stille Phase

**Was passiert:** Nichts Automatisches.

Der Prospect ist auf sich allein gestellt. Keine E-Mail, kein Nudge, kein Check-in.

- Prospect kann jederzeit anrufen (Lisa ist 24/7 erreichbar)
- Prospect kann Dashboard oeffnen (Magic Link Session bleibt aktiv)
- Prospect kann Wizard auf "seiner" Website nutzen (wenn Website steht)
- Morning Report zeigt Trial als "active" — aber kein spezifischer Engagement-Indikator

**Luecken Tag 1–4:**
- **Day-5-Email fehlt komplett.** Kein Code, keine Templates, keine Referenz im Codebase.
- Kein Engagement-Tracking (hat der Prospect den Anruf gemacht? das Dashboard geoeffnet? → unbekannt)
- Kein "Tipp des Tages" oder "So testen Sie am besten"-Nudge
- Prospect kann nach Tag 0 komplett abtauchen ohne dass das System es bemerkt

### Tag 5: (SOLL: Engagement-Nudge)

**IST:** Nichts. Day-5-Email existiert nicht.

Plan.md Task 1.4 fordert: "Day-5-Email bauen: Tipp: Testen Sie mit einem echten Anruf". Nicht implementiert.

### Tag 7: Engagement-Check

**Was passiert:**
- Lifecycle Tick (GH Actions, 07:00 UTC) setzt `day7_checked_at = now()`
- **Keine E-Mail**, keine Aktion, nur Timestamp-Markierung
- Idempotent: wenn bereits markiert, wird uebersprungen

**Luecken Tag 7:**
- Check hat keinen Output — es wird nichts geprueft, nur ein Timestamp gesetzt
- Kein Engagement-Score (hat Prospect angerufen? Dashboard besucht? Cases bearbeitet?)
- Morning Report zeigt Trial weiterhin als "active" ohne Qualifizierung

### Tag 8–9: Stille Phase

Keine automatischen Aktionen. Founder sieht im Morning Report, dass Follow-up-Datum naeherrueckt.

### Tag 10: Founder-Follow-up

**Was passiert:**
- Lifecycle Tick setzt `day10_alerted_at = now()`
- **Keine E-Mail an Prospect**
- Morning Report flaggt `follow_up_due` als YELLOW wenn `follow_up_at <= today_end`
- Founder erhaelt Telegram + ggf. E-Mail (bei YELLOW/RED)

**Founder-Aktion (manuell, nicht automatisiert):**
- Prospect anrufen
- Kein Call-Script im System hinterlegt (nur in plan.md referenziert)
- Weiterempfehlungs-Frage stellen (nicht automatisiert)

**Luecken Tag 10:**
- Founder muss sich an Follow-up erinnern (Morning Report ist der einzige Trigger)
- Kein Call-Script-Template im System
- Kein Logging, ob Follow-up stattgefunden hat
- Wenn Founder auf Reise: Follow-up kann vergessen werden

### Tag 11–12: Stille Phase

Keine automatischen Aktionen. Letzte Chance fuer Founder-Kontakt vor Expiry-Mail.

### Tag 13: Trial-Expiry-Reminder

**Was passiert:**
- Lifecycle Tick sendet E-Mail an `prospect_email`
- Subject: "Ihr FlowSight Trial endet bald"
- Inhalt: "Ihr Trial fuer {companyName} endet am {trialEndDate}. Falls Sie weiterhin nutzen moechten, melden Sie sich. Falls nicht: kein Problem, Daten werden geloescht."
- Footer: "Gunnar Wende — 044 552 09 19 — flowsight.ch"
- `day13_reminder_sent_at` wird gesetzt (idempotent)

**Luecken Tag 13:**
- E-Mail sagt "FlowSight Trial" statt Tenant-Name (Identity Contract R4)
- Kein CTA-Button (kein "Jetzt verlaengern", kein "Termin vereinbaren")
- Kein Link zum Dashboard
- Tone: korrekt (warm, kein Druck), aber generisch

### Tag 14: Decision Pending

**Was passiert:**
- Lifecycle Tick setzt `trial_status = 'decision_pending'`
- `day14_marked_at` wird gesetzt
- **Kein Auto-Offboard** — Founder muss manuell entscheiden

**Danach (manuell):**
- **Konvertieren:** Vertrag abschliessen, Status → `converted`, Peoplefone-Nummer zuweisen, Demo-Cases loeschen
- **Verlaengern:** Status → `live_dock`, neues `trial_end` setzen
- **Offboarden:** `offboard_tenant.mjs` ausfuehren → Offboarding-Mail + Clean Delete

### Tag 14+: Offboarding (wenn Nein)

**Offboarding-Mail (IST):**
- Subject: "Ihr FlowSight Trial — Danke für Ihr Interesse"
- Inhalt: "Ihr Trial ist abgelaufen. Danke. Falls Sie spaeter interessiert sind, melden Sie sich."
- Footer: "Gunnar Wende — 044 552 09 19 — gunnar@flowsight.ch"

**Offboarding-Script loescht:**
1. Case Attachments
2. Case Events
3. Cases
4. Tenant Numbers (Telefonnummer frei)
5. Retell Agents (DE + INTL, optional behalten)
6. Auth User
7. Tenant-Status → `offboarded` (oder `--hard-delete` fuer komplette Loeschung)

---

## 3. E-Mail-Inventar (Prospect-relevant)

| # | E-Mail | Trigger | Empfaenger | Subject | Personalisierung | Status |
|---|--------|---------|-----------|---------|-----------------|--------|
| 1 | Welcome | Provisioning-Script | Prospect | "Willkommen — Ihr 14-Tage Trial bei FlowSight" | Firmenname, Testnummer, Trial-Daten | LIVE |
| 2 | Day 5 Nudge | — | Prospect | — | — | **FEHLT** |
| 3 | Day 13 Expiry | Lifecycle Tick | Prospect | "Ihr FlowSight Trial endet bald" | Firmenname, Enddatum | LIVE |
| 4 | Offboarding | Offboard-Script | Prospect | "Ihr FlowSight Trial — Danke für Ihr Interesse" | — (generisch) | LIVE |
| 5 | Case Notification | Case Creation (Webhook/API) | Founder (MAIL_REPLY_TO) | "[FlowSight] NOTFALL – FS-0029 – Leck (Thalwil)" | Case-Daten, Deep-Link | LIVE |
| 6 | Reporter Confirmation | Case Creation + E-Mail vorhanden | Anrufer/Melder | "[FlowSight] Ihre Meldung wurde erfasst" | Case-ID, Kategorie | LIVE |
| 7 | Review Request | Manuell (Operator-Action) | Kunde | "[FlowSight] Wie war unser Service?" | Review-Link | LIVE |

### E-Mail-Branding-Analyse

| E-Mail | Sender-Name | Subject-Prefix | Body-Branding | Identity Contract konform? |
|--------|-------------|----------------|---------------|---------------------------|
| Welcome | FlowSight | — | FlowSight Logo + Gold Bar | NEIN (R4: sollte Tenant) |
| Day 13 | FlowSight | — | FlowSight Logo + Gold Bar | NEIN (R4: sollte Tenant) |
| Offboarding | FlowSight | — | FlowSight | NEIN (R4: sollte Tenant) |
| Case Notification | FlowSight | [FlowSight] | FlowSight Logo + Gold Bar | NEIN (E4: sollte "{Firma} via FlowSight") |
| Reporter Confirmation | FlowSight | [FlowSight] | "Ihr Service-Team" | TEILWEISE (neutral, aber FlowSight im Subject) |
| Review Request | FlowSight | [FlowSight] | "Ihr Service-Team" | TEILWEISE |

**Ergebnis:** Keine einzige E-Mail erfuellt heute den Identity Contract (E4: `{display_name} via FlowSight` als Sender).

---

## 4. Oberflaechenanalyse (Prospect-Touchpoints)

### 4.1 Touchpoint-Sequenz

```
Tag 0:
  [1] Welcome-Mail empfangen         → E-Mail-Client
  [2] Magic Link klicken             → Browser → /ops/welcome
  [3] Welcome Page sehen             → Testnummer, CTA "Jetzt anrufen"
  [4] Lisa anrufen (erster Test)     → Telefon
  [5] SMS empfangen                  → Handy
  [6] SMS-Korrekturseite oeffnen     → Browser → /verify/{caseId}
  [7] Dashboard oeffnen              → Browser → /ops/cases
  [8] Eigenen Fall sehen             → Browser → /ops/cases/{id}

Tag 1–4:
  [9] (optional) Weitere Anrufe      → Telefon
  [10] (optional) Dashboard-Besuch   → Browser

Tag 5:
  [11] (FEHLT) Day-5-Nudge           → sollte E-Mail sein

Tag 7–9:
  [12] (nichts)

Tag 10:
  [13] Founder-Anruf erhalten        → Telefon (manuell)

Tag 13:
  [14] Expiry-Reminder empfangen     → E-Mail

Tag 14:
  [15] Entscheidung                  → Telefon/E-Mail (manuell)
```

### 4.2 Emotionaler Bogen (IST)

```
Begeisterung ▲
             │
             │    [3-5] WOW: Lisa + SMS
             │   ╱ ╲
             │  ╱   ╲   [7-8] Dashboard
             │ ╱     ╲ ╱ ╲
             │╱       ╳   ╲
─────────────┼───────╱─╲───╲────────────────────▶ Tage
             │      ╱   ╲   ╲
             │            ╲   [14] Entscheidung
             │             ╲ ╱
             │    [1-2]     [9-13] STILLE
             │    Welcome
             │    (nüchtern)
             │
Desinteresse ▼
```

**Befund:** Der emotionale Hoehepunkt liegt an Tag 0 (Lisa + SMS). Danach faellt das Erlebnis in ein 9-Tage-Loch (Tag 1–9), in dem nichts Automatisches passiert. Der Day-10-Call haengt am Founder. Die Day-13-Mail ist generisch. Es gibt keinen zweiten emotionalen Hoehepunkt.

### 4.3 Profil-Differenzierung (IST)

| Aspekt | Meister-Profil | Betrieb-Profil | Differenziert? |
|--------|---------------|----------------|----------------|
| Welcome-Mail | Identisch | Identisch | NEIN |
| Welcome Page | Identisch | Identisch | NEIN |
| Demo-Cases | 15 (Default) | 15 (Default) | NEIN |
| Dashboard-Ansicht | Identisch | Identisch | NEIN |
| Day-10-Call Script | Nicht vorhanden | Nicht vorhanden | NEIN |
| Day-13-Mail | Identisch | Identisch | NEIN |

**Befund:** Heute gibt es keine Differenzierung zwischen Meister (Solo, 3 Demo-Cases, Handy-first) und Betrieb (Team, 15 Demo-Cases, Buero-first). Beide Profile durchlaufen exakt dieselbe Journey.

---

## 5. Demo-Daten-System

### Seeding (IST)

`seed_demo_data.mjs` erzeugt pro Tenant:
- **Anzahl:** 15 (Default), konfigurierbar via `--count`
- **Gewerke:** sanitaer (Default), heizung, allgemein
- **Quellen-Mix:** 8× voice, 5× wizard, 2× manual
- **Status-Mix:** 5× done, 3× new, 2× contacted, 2× scheduled, 3× mixed
- **Daten pro Case:** Name (CH-random), Telefon, E-Mail, Adresse (CH-Stadt), PLZ, Kategorie, Beschreibung, Dringlichkeit
- **Events:** case_created, status_changed, sms_verification_sent, review_requested (fuer ~33% der done-Cases)
- **Flag:** `is_demo=true` auf jedem Case
- **Zeitraum:** Erstellt 1–14 Tage in der Vergangenheit

### Filtering (IST)

**Problem:** `is_demo=true` Cases werden im Dashboard NICHT gefiltert. Der Prospect sieht 15 Fake-Faelle neben echten Testfaellen. Es gibt keinen UI-Filter und keinen RLS-Filter fuer `is_demo`.

---

## 6. Auth + Sicherheit

### Magic Link Flow

1. `provision_trial.mjs` → `supabase.auth.admin.createUser()` mit `role='prospect'`
2. `supabase.auth.admin.generateLink()` → Magic Link URL
3. Magic Link in Welcome-Mail eingebettet
4. Prospect klickt → Supabase `/auth/v1/verify` → Session-Cookie → Redirect `/ops/welcome`
5. Middleware refresht Session bei jedem Request
6. Session-Dauer: Supabase-Default (konfigurierbar, typ. 7 Tage)

### Rollenmodell

| Rolle | Scope | Kann |
|-------|-------|------|
| `admin` | Alle Tenants | Alles sehen/bearbeiten, Cases erstellen |
| `prospect` | Eigener Tenant | Cases sehen (ohne Kontaktdaten), Status aendern, Review anfragen |

### SMS-Token-Sicherheit

- Korrekturlink: `/verify/{caseId}?token={hmac}`
- HMAC = SHA-256(caseId + created_at, secret)
- Review-Link: `/review/{caseId}?token={hmac}` (gleiches Schema)

---

## 7. Bekannte Luecken und Inkonsistenzen

### Kritisch (blockiert Gold-Contact)

| # | Luecke | Auswirkung | Referenz |
|---|--------|-----------|----------|
| L1 | **Day-5-Email fehlt** | 9-Tage-Stille zwischen Welcome und Day-10-Call. Kein Engagement-Nudge. | plan.md Task 1.4 |
| L2 | **Demo-Case-Filtering fehlt** | Prospect sieht 15 Fake-Faelle. Verwirrt, untergräbt Glaubwuerdigkeit. | plan.md Task 1.3 |
| L3 | **E-Mails zeigen FlowSight statt Tenant** | Alle 6 E-Mails verstos sen gegen Identity Contract R4/E4. Spiegel-Effekt gebrochen. | identity_contract.md E4 |
| L4 | **Welcome-Mail nicht personalisiert** | "Guten Tag" statt "{Vorname}" oder "{Firma}". Kein Spiegel-Gefuehl. | plan.md Task 1.5 |
| L5 | **Kein Profil-Routing** | Meister und Betrieb durchlaufen identische Journey. Fehlende Relevanz. | gold_contact.md Profile |

### Wichtig (schwaeacht Gold-Contact)

| # | Luecke | Auswirkung |
|---|--------|-----------|
| L6 | Tab-Titel "FlowSight OPS" statt "{Firma} OPS" | Identity Contract E1 verletzt |
| L7 | Welcome-Page Footer zeigt Founder-Kontakt | Identity Contract R4 verletzt |
| L8 | Day-13-Mail ohne CTA-Button | Kein einfacher Weg zurueck ins System |
| L9 | Kein Engagement-Tracking | Founder weiss nicht, ob Prospect aktiv war |
| L10 | Day-10-Call-Script fehlt im System | Founder improvisiert |
| L11 | Disabled Nav-Items sichtbar ("Bald") | Wirkt unfertig |
| L12 | Review-Surface: Hardcoded "Max Mustermann" | Nicht personalisiert |
| L13 | Case-Notification geht an Founder, nicht an Prospect | Prospect bemerkt neue Faelle nur bei Dashboard-Besuch |

### Offen (nicht blockierend, aber relevant)

| # | Luecke | Auswirkung |
|---|--------|-----------|
| L14 | Magic Link Gueltigkeit undokumentiert | Prospect weiss nicht, ob Link noch funktioniert |
| L15 | Kein Trial-Countdown auf Welcome Page | Prospect weiss nicht, wie viele Tage verbleiben |
| L16 | Kein Onboarding-Walkthrough | Prospect muss selbst herausfinden, was er tun soll |
| L17 | Offboarding-Mail generisch | Kein Rueckblick auf konkrete Nutzung |

---

## 8. Abhaengigkeiten zu anderen Straengen

| Strang | Abhaengigkeit | Status |
|--------|--------------|--------|
| **Voice (voice.md)** | Lisa-Erlebnis bei Testanruf = WOW 2 | Zielbild DONE |
| **Leitstand (leitstand.md)** | Dashboard-Erlebnis = WOW 4 | Zielbild DONE |
| **Identity Contract** | Naming/Branding ueber alle Touchpoints | DONE |
| **Wizard** | Web-Intake auf Kunden-Website = alternativer Testkanal | Zielbild OFFEN |
| **Review** | Review-Flow nach Case-Erledigung | Zielbild OFFEN |
| **SMS** | Post-Call-Bestaetigung = WOW 3 | Implementiert, E2E funktioniert |
| **Website** | Kunden-Website = erster visueller Eindruck (vor Trial) | Implementiert, QA offen |

---

## 9. Zusammenfassung

### Was funktioniert

- **Technische Pipeline steht:** Provisioning → Auth → Dashboard → Voice → SMS → Lifecycle → Offboard — alles E2E funktionsfaehig
- **Product-led Onboarding:** Welcome Page mit "Jetzt anrufen" als primaerer CTA ist der richtige Ansatz
- **Idempotente Milestones:** Lifecycle Tick kann mehrfach laufen ohne Doppel-Mails
- **Tenant-Isolation:** RLS + Scope-Resolution schuetzen Prospect-Daten
- **Demo-Daten realistisch:** 15 Cases mit echten CH-Adressen, verschiedenen Statuswerten und Quellen

### Was fehlt

- **Emotionaler Bogen:** Nach dem WOW an Tag 0 gibt es ein 9-Tage-Loch. Kein automatischer Touchpoint zwischen Welcome und Day-13-Mail.
- **Spiegel-Effekt:** Alle E-Mails und mehrere UI-Elemente zeigen "FlowSight" statt den Betrieb. Der Prospect sieht eine Software, nicht sein System.
- **Profil-Differenzierung:** Null. Meister und Betrieb sind identisch.
- **Engagement-Sichtbarkeit:** Founder hat keine Daten darueber, ob ein Prospect aktiv testet oder abgetaucht ist.
- **Day-5-Nudge:** Komplett fehlend — der wichtigste automatische Touchpoint zwischen Tag 0 und Tag 10.
