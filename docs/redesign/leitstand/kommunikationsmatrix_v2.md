# Kommunikationsmatrix v2 — Vollständige Analyse & Stress-Test

**Version:** 2.0 | **Datum:** 2026-04-15
**Autor:** CC (Head Ops) + Founder-Auftrag
**Vorgänger:** `Matrix_kommunikation.md` (v1, 18.03.2026) — bleibt als Referenz
**Scope:** Jeder Kommunikations-Touchpoint im System, geprüft am Code. Stress-Test mit 3 ICP-Profilen. Zielbild mit konkreten Regeln.
**Methode:** Codebase-Audit (alle `sendSms`, `sendOpsPush`, `resend.emails.send`, `sendWhatsApp`, `sendEmail`, Telegram-Workflows). Kein Touchpoint basiert auf Annahmen.

---

## 1. Kommunikations-Inventar (Code-Audit Stand 15.04.2026)

### 1.1 E-Mail (Provider: Resend, Domain: send.flowsight.ch)

| # | Template | Trigger | Empfänger | Sender (From) | Timing | Opt-out? | Implementiert? |
|---|----------|---------|-----------|---------------|--------|----------|----------------|
| **E1** | Ops Case Notification | Fall erstellt (Voice, Wizard, Manuell) | Betrieb (notification_email, Fallback MAIL_REPLY_TO) | `{Firma} via FlowSight <noreply@...>` | Sofort | Nein (Kernfunktion) | Ja |
| **E2** | Reporter Confirmation | Fall erstellt via Wizard | Endkunde (contact_email) | `{Firma} via FlowSight <noreply@...>` | Sofort | Toggle `notify_reporter_email` (default: an) | Ja |
| **E3** | Assignment Notification | "Benachrichtigen" Klick im Leitstand | Zugewiesener Techniker (staff.email) | `{Firma} via FlowSight <noreply@...>` | Manuell ausgelöst | Nein (manueller Trigger) | Ja |
| **E4** | ICS Termin-Einladung | "Termin versenden" Klick im Leitstand | Zugewiesener Staff / Kalender-Email / MAIL_REPLY_TO | `{Firma} <noreply@...>` (kein "via FlowSight") | Manuell ausgelöst | Nein (manueller Trigger) | Ja |
| **E5** | Termin-Bestätigung Melder | "Kunde benachrichtigen" Klick im Leitstand | Endkunde (contact_email) | `{Firma} <noreply@...>` (R4: FlowSight unsichtbar) | Manuell ausgelöst | Toggle `notify_termin_email` (default: an) | Ja |
| **E6** | Review Request | "Bewertung anfragen" Klick im Leitstand | Endkunde (contact_email, primär) | `{Firma} <noreply@...>` (R4: FlowSight unsichtbar) | Manuell ausgelöst, max 2x/Fall, 7d Cooldown | Stammkunden-Schutz (6 Mo) | Ja |
| **E7** | OTP Login-Code | Login-Versuch im Leitsystem | Staff/Prospect (auth email) | `Leitsystem <noreply@...>` | Sofort, Rate-Limit 30s | Nein (Auth) | Ja |
| **E8** | Day 5 Nudge | Lifecycle Tick (automatisch, < 3 Cases) | Prospect (prospect_email) | `{Firma} via FlowSight <noreply@...>` | Automatisch Tag 5 | Unterdrückt wenn aktiv (>= 3 Cases) | Ja |
| **E9** | Day 13 Reminder | Lifecycle Tick (automatisch) | Prospect (prospect_email) | `{Firma} via FlowSight <noreply@...>` | Automatisch Tag 13 | Nein | Ja |
| **E10** | Welcome Email (Phase B-2) | `activate_prospect.mjs` | Prospect (prospect_email) | `{Firma} via FlowSight <noreply@...>` | Manuell (Script) | Nein | Ja |
| **E11** | Offboarding Email | `offboard_tenant.mjs` | Prospect (prospect_email) | `{Firma} via FlowSight <noreply@...>` | Manuell (Script) | Nein | Ja |
| **E12** | Sales Lead Notification | Sales Voice Agent Call abgeschlossen | Founder (MAIL_REPLY_TO) | `FlowSight Sales <noreply@...>` | Sofort | Nein | Ja |
| **E13** | Demo Request | /api/demo Formular auf flowsight.ch | Founder (MAIL_REPLY_TO) | `noreply@send.flowsight.ch` (plain) | Sofort | Nein | Ja |
| **E14** | Support Ticket Email | Hilfe-Formular im Leitsystem | Founder (MAIL_REPLY_TO) | `noreply@send.flowsight.ch` (plain) | Sofort (IMMER, auch wenn GH Issue erfolgreich) | Nein | Ja |
| **E15** | Morning Report Email | GH Actions Cron 07:30 UTC, nur RED/YELLOW | Founder (FOUNDER_EMAIL) | `noreply@send.flowsight.ch` | Täglich, bedingt | Nein | Ja |
| **E16** | Weekly Rapport | GH Actions Cron Mo 07:00 UTC | Betrieb (notification_email, nur Phase B aktiv) | `{Firma} <noreply@...>` | Wöchentlich Mo | Nur an Tenants mit notification_email | Ja |

### 1.2 SMS (Provider: eCall.ch, Swiss Gateway)

| # | Template | Trigger | Empfänger | Sender (Alphanumerisch) | Timing | Opt-out? | Implementiert? |
|---|----------|---------|-----------|------------------------|--------|----------|----------------|
| **S1** | Post-Call Bestätigung + Korrekturlink | Fall erstellt via Voice Agent | Endkunde (callerPhone) | Tenant-Markenname (max 11 Chars) | Sofort (Quality Gate: >25s Anruf, >=2 echte Felder) | SMS-Modul muss aktiv sein | Ja |
| **S2** | Wizard SMS Bestätigung | Fall erstellt via Wizard | Endkunde (contact_phone) | Tenant-Markenname | Sofort | Toggle `notify_reporter_sms` (default: aus) | Ja |
| **S3** | Termin-Bestätigung Melder | "Kunde benachrichtigen" Klick | Endkunde (contact_phone) | Tenant-Markenname | Manuell ausgelöst | Fallback wenn keine E-Mail, sonst Toggle `notify_termin_sms` | Ja |
| **S4** | 24h Termin-Erinnerung | Lifecycle Tick (automatisch) | Endkunde (contact_phone) | Tenant-Markenname | Automatisch, 3h-36h Fenster vor Termin, idempotent | Toggle `notify_termin_reminder_sms` + SMS-Modul | Ja |
| **S5** | Review Request SMS | "Bewertung anfragen" Klick | Endkunde (contact_phone, Fallback wenn keine E-Mail) | Tenant-Markenname | Manuell ausgelöst | Max 2x/Fall, 7d Cooldown, Stammkunden-Schutz | Ja |
| **S6** | Demo SMS (Testanfrage) | /api/demo Formular | Prospect (phone aus Formular) | "FlowSight" | Sofort | Nein | Ja |

### 1.3 Push-Notifications (Provider: Web Push / VAPID)

| # | Template | Trigger | Empfänger | Timing | Opt-out? | Implementiert? |
|---|----------|---------|-----------|--------|----------|----------------|
| **P1** | Notfall-Eingang | Fall mit urgency=notfall erstellt | Alle Staff mit notify_notfall=true | Sofort | Ja (per Preference, aber default an) | Ja |
| **P2** | Zuweisung | "Benachrichtigen" Klick im Leitstand | Zugewiesener Staff (targetUserId) | Manuell ausgelöst | Ja (notify_assignment) | Ja |
| **P3** | Positive Bewertung (>=4 Sterne) | Kunde bewertet auf Review Surface | Alle Staff mit notify_review=true | Sofort | Ja (notify_review) | Ja |
| **P4** | Negative Bewertung (<=3 Sterne) | Kunde bewertet negativ | Alle Staff (KEIN OPT-OUT, immer aktiv) | Sofort | NEIN (business-critical) | Ja |
| **P5** | Neuer Fall (alle Quellen) | Fall erstellt, urgency != notfall | Alle Staff mit notify_all_cases=true | Sofort (nur bei Notfall-Fällen implementiert) | Ja (notify_all_cases) | PARTIAL — nur Notfall-Fälle pushen aktuell |

### 1.4 WhatsApp (Provider: Twilio, Founder-only)

| # | Template | Trigger | Empfänger | Timing | Opt-out? | Implementiert? |
|---|----------|---------|-----------|--------|----------|----------------|
| **W1** | RED Incident Alert | Case-Creation oder E-Mail-Dispatch fehlgeschlagen | Founder (FOUNDER_WHATSAPP_TO) | Sofort, Throttle: gleicher Code 1x/15min | FOUNDER_WHATSAPP_ENABLED=true | Ja |
| **W2** | Agent Hangup Alert | Voice Agent hat aufgelegt (agent_hangup, <120s) | Founder | Sofort, via notify() | Wie W1 | Ja |

### 1.5 Telegram (Provider: Telegram Bot API, Founder-only)

| # | Template | Trigger | Empfänger | Timing | Opt-out? | Implementiert? |
|---|----------|---------|-----------|--------|----------|----------------|
| **T1** | Morning Report | GH Actions Cron 07:30 UTC | Founder (TELEGRAM_CHAT_ID) | Täglich, IMMER (unabhängig von Severity) | Nein | Ja |
| **T2** | Lifecycle Tick Result | GH Actions Cron 07:00 UTC | Founder | Täglich nach Tick (Erfolg + Fehler) | Nein | Ja |
| **T3** | CI/Shipped Notification | PR merged, CI pass/fail | Founder | Bei Event | Nein | Ja |
| **T4** | CoreBot (bidirektional) | Founder-Nachrichten via Telegram | GitHub Issues (automatisch) | Sofort | Nein | Ja |

### 1.6 Voice (Provider: Retell AI, inbound only)

| # | Funktion | Trigger | Empfänger | Timing | Implementiert? |
|---|----------|---------|-----------|--------|----------------|
| **V1** | Intake-Modus | Endkunde ruft Betriebsnummer an | Voice Agent (Lisa) | 24/7 | Ja |
| **V2** | Info-Modus | Endkunde fragt allgemeine Info | Voice Agent (Lisa) | 24/7 | Ja |
| **V3** | Sales Agent | Interessent ruft 044 552 09 19 | Voice Agent (Lisa Sales) | 24/7 | Ja |

### 1.7 Leitstand UI (kein externer Kanal, aber Benachrichtigungs-relevant)

| # | Funktion | Trigger | Empfänger | Implementiert? |
|---|----------|---------|-----------|----------------|
| **U1** | Auto-Refresh | 30s Polling | Alle eingeloggten User | Ja |
| **U2** | App-Badge (Homescreen) | Neue Cases seit letztem Öffnen | Android Chrome/Edge | Ja |
| **U3** | Timeline-Einträge | Jede Statusänderung, Zuweisung, Bewertung | Alle mit Zugang zum Fall | Ja |

---

## 2. Vollständige Kommunikationsflüsse pro Ereignis

### 2.1 Neuer Fall — Voice

| Schritt | Kanal | Empfänger | Bedingung |
|---------|-------|-----------|-----------|
| 1. E-Mail: Ops Notification (E1) | Email | Betrieb | Immer |
| 2. SMS: Post-Call Bestätigung (S1) | SMS | Endkunde | Quality Gate bestanden + SMS-Modul aktiv |
| 3. Push: Notfall (P1) | Push | Staff | Nur wenn urgency=notfall |
| 4. WhatsApp: RED Alert (W1) | WhatsApp | Founder | Nur bei Fehler (Case-Create oder Email fehlgeschlagen) |
| **TOTAL regulär:** | 2 Nachrichten | 1 an Betrieb, 1 an Endkunde | |
| **TOTAL Notfall:** | 3 Nachrichten | 1 an Betrieb, 1 an Endkunde, 1 Push an Staff | |

### 2.2 Neuer Fall — Wizard

| Schritt | Kanal | Empfänger | Bedingung |
|---------|-------|-----------|-----------|
| 1. E-Mail: Ops Notification (E1) | Email | Betrieb | Immer |
| 2. E-Mail: Reporter Confirmation (E2) | Email | Endkunde | contact_email vorhanden + Toggle an |
| 3. SMS: Wizard Bestätigung (S2) | SMS | Endkunde | contact_phone vorhanden + Toggle `notify_reporter_sms` an (default: AUS) |
| 4. Push: Notfall (P1) | Push | Staff | Nur wenn urgency=notfall |
| **TOTAL regulär:** | 2 Nachrichten | 1 an Betrieb, 1 an Endkunde | |
| **TOTAL mit SMS-Toggle:** | 3 Nachrichten | 1 an Betrieb, 2 an Endkunde (Email + SMS) | |

### 2.3 Zuweisung an Techniker

| Schritt | Kanal | Empfänger | Bedingung |
|---------|-------|-----------|-----------|
| 1. E-Mail: Assignment (E3) | Email | Techniker | Manueller Klick "Benachrichtigen" + Staff hat E-Mail |
| 2. Push: Assignment (P2) | Push | Zugewiesener Staff | Push registriert + notify_assignment=true |
| **TOTAL:** | 2 Nachrichten | Beide an Techniker | |

### 2.4 Termin gesetzt

| Schritt | Kanal | Empfänger | Bedingung |
|---------|-------|-----------|-----------|
| 1. E-Mail/ICS: Termin-Einladung (E4) | Email | Staff/Kalender | Manueller Klick "Termin versenden" |
| 2. E-Mail: Termin-Bestätigung (E5) | Email | Endkunde | Manueller Klick "Kunde benachrichtigen" + contact_email |
| 3. SMS: Termin-Bestätigung (S3) | SMS | Endkunde | Fallback wenn kein Email ODER Toggle `notify_termin_sms` |
| **TOTAL max:** | 3 Nachrichten | 1 an Staff, 2 an Endkunde (Email + SMS) | |
| **TOTAL Voice-Fall:** | 2 Nachrichten | 1 an Staff, 1 SMS an Endkunde (kein Email) | |

### 2.5 24h vor Termin

| Schritt | Kanal | Empfänger | Bedingung |
|---------|-------|-----------|-----------|
| 1. SMS: Termin-Erinnerung (S4) | SMS | Endkunde | Automatisch via Lifecycle Tick, Toggle + SMS-Modul, idempotent |
| **TOTAL:** | 1 Nachricht | Endkunde | |

### 2.6 Fall erledigt + Bewertung angefragt

| Schritt | Kanal | Empfänger | Bedingung |
|---------|-------|-----------|-----------|
| 1. E-Mail: Review Request (E6) | Email | Endkunde | Manueller Klick, Email vorhanden (primär) |
| 2. SMS: Review Request (S5) | SMS | Endkunde | Fallback: kein Email + Telefon vorhanden |
| **TOTAL:** | 1 Nachricht | Endkunde (entweder Email ODER SMS, nicht beides) | |

### 2.7 Kunde bewertet

| Schritt | Kanal | Empfänger | Bedingung |
|---------|-------|-----------|-----------|
| 1. Push: Positive Bewertung (P3) | Push | Staff | notify_review=true, Rating >= 4 |
| 1. Push: Negative Bewertung (P4) | Push | Alle Staff | IMMER, kein Opt-out, Rating <= 3 |
| **TOTAL:** | 1 Push | Staff | |

### 2.8 Trial Lifecycle

| Tag | Kanal | Empfänger | Bedingung |
|-----|-------|-----------|-----------|
| 0 | E-Mail: Welcome (E10) | Prospect | activate_prospect.mjs |
| 5 | E-Mail: Nudge (E8) | Prospect | < 3 Cases |
| 10 | Morning Report (T1) zeigt "follow_up_due" | Founder | Automatisch |
| 13 | E-Mail: Reminder (E9) | Prospect | Automatisch |
| 14 | DB: decision_pending | Kein Versand | Automatisch |
| x | E-Mail: Offboarding (E11) | Prospect | Manuell |

---

## 3. Kanal-Fallback-Logik (IST-Zustand, aus Code)

### Endkunden-Kommunikation

```
E-Mail vorhanden?
├── JA → E-Mail senden (Reporter Confirmation, Termin, Review)
│   └── Telefon vorhanden + SMS aktiv?
│       ├── JA + Toggle an → zusätzlich SMS (bei Termin-Bestätigung)
│       └── NEIN oder Toggle aus → nur E-Mail
└── NEIN → Telefon vorhanden?
    ├── JA + SMS aktiv → SMS senden (Termin-Bestätigung, Review als Fallback)
    └── NEIN → Kein Versand → Timeline-Eintrag im Leitstand
```

### Besonderheit Voice-Fälle

Voice-Fälle haben typischerweise NUR Telefon (keine E-Mail). Das bedeutet:
- Termin-Bestätigung: SMS (nicht E-Mail)
- Review-Anfrage: SMS (Fallback aktiv)
- Post-Call Bestätigung: SMS (immer, ist der Haupt-Kanal)
- Reporter Confirmation E-Mail: NIE (kein contact_email)

### Techniker-Kommunikation

```
Staff hat E-Mail in staff-Tabelle?
├── JA → E-Mail senden (Assignment, ICS)
│   └── Push registriert?
│       └── JA → zusätzlich Push
└── NEIN → Kein Versand → Hinweis im Leitstand
```

---

## 4. Stress-Test: 3 ICP-Profile

### 4.1 Profil A: 2-Mann-Betrieb (Chef + 1 Techniker)

**Betrieb:** Meier Sanitär, Oberrieden. Chef = Disponent = Techniker. Hat Voice + Wizard + SMS.
**Szenario:** Hektischer Montag. 5 neue Anrufe (2 Notfälle), 1 negative Review.

#### Eingehende Nachrichten pro Rolle

| Zeitpunkt | Ereignis | Chef erhält | Techniker erhält | Endkunde erhält |
|-----------|----------|-------------|------------------|-----------------|
| 08:15 | Anruf 1 (Notfall: Rohrbruch) | E1 (Email) + P1 (Push) | P1 (Push) | S1 (SMS) |
| 08:32 | Anruf 2 (Heizung, normal) | E1 (Email) | — | S1 (SMS) |
| 09:10 | Anruf 3 (Notfall: Leck) | E1 (Email) + P1 (Push) | P1 (Push) | S1 (SMS) |
| 10:45 | Anruf 4 (Boiler, normal) | E1 (Email) | — | S1 (SMS) |
| 14:20 | Anruf 5 (Beratung, Info-Modus) | — (kein Fall) | — | — |
| 15:00 | Chef weist sich selbst 3 Fälle zu | E3 (3x Email) + P2 (3x Push) | — | — |
| 16:00 | Chef setzt 2 Termine, benachrichtigt Kunden | E4 (2x ICS) | — | S3 (2x SMS) |
| 17:30 | Negative Review von letzter Woche | P4 (Push, kein Opt-out) | P4 (Push) | — |

#### Bilanz Chef

| Kanal | Anzahl | Inhalt |
|-------|--------|--------|
| **E-Mail** | 9 | 4x Ops Notification + 3x Assignment (an sich selbst!) + 2x ICS |
| **Push** | 8 | 2x Notfall + 3x Assignment + 2x Push-Duplicate? + 1x Negative Review |
| **TOTAL** | **17 Nachrichten** | An einem Tag |

#### Probleme identifiziert

1. **Self-Assignment Spam:** Chef weist sich selbst zu und bekommt dafür 3 Assignment-Emails + 3 Pushes. Das ist absurd bei einem 2-Mann-Betrieb. Er sieht die Fälle bereits im Leitstand.
2. **ICS an sich selbst:** Chef schickt sich 2 ICS-Einladungen. Bei 2 Mann = unnötig, er hat den Termin gerade selbst gesetzt.
3. **Push-Flut:** 8 Push-Notifications an einem Tag mit 5 Fällen. Davon 3 Self-Assignment (Noise).
4. **Noise-Ratio:** 9/17 Nachrichten (53%) sind Self-Service-Noise.

#### Was NICHT passiert (Lücken)

- Der Chef bekommt keine Zusammenfassung am Ende des Tages.
- Kein "Tages-Briefing" morgens (nur Morning Report an Founder, nicht an Betrieb).
- Negative Review hat keinen E-Mail-Alert an Chef (nur Push). Wenn Push deaktiviert: unsichtbar bis er den Leitstand öffnet.

---

### 4.2 Profil B: 15-Mann-Betrieb (Chef + Büro + 8 Techniker)

**Betrieb:** Huber Haustechnik AG, Thalwil. Chef sichtet morgens, Büro koordiniert tagsüber.
**Szenario:** Normaler Montag. 15 Anrufe + 3 Wizard-Meldungen, 3 Notfälle, 5 Review-Anfragen gesendet.

#### Nachrichten-Volumen

| Kanal | Chef/Büro | Techniker (8 Personen) | Endkunden (18 Melder) |
|-------|-----------|------------------------|----------------------|
| **Email (Ops Notification)** | 18 | 0 | 0 |
| **Email (Reporter Confirmation)** | 0 | 0 | 3 (nur Wizard mit Email) |
| **Email (Assignment)** | 0 | ~12 (verteilt auf 8) | 0 |
| **Email (ICS Termin)** | 0 | ~10 | 0 |
| **Email (Termin Melder)** | 0 | 0 | ~3 (nur mit Email) |
| **Email (Review Request)** | 0 | 0 | 5 |
| **SMS (Post-Call)** | 0 | 0 | 15 (Voice-Fälle) |
| **SMS (Wizard Bestätigung)** | 0 | 0 | ~0 (Toggle default AUS) |
| **SMS (Termin Melder)** | 0 | 0 | ~12 (Voice-Fälle ohne Email) |
| **SMS (Review SMS)** | 0 | 0 | 0 (Email hat Vorrang) |
| **Push (Notfall)** | 3 | 3 (pro registrierten) | 0 |
| **Push (Assignment)** | 0 | ~12 (gezielt) | 0 |
| **Push (Review)** | ~5 | ~5 | 0 |
| **TOTAL** | **~26** | **~42** (verteilt auf 8, ~5 pro Person) | **~38** (verteilt auf 18, ~2 pro Person) |

#### Probleme identifiziert

1. **Ops-Email-Flut:** 18 Ops-Notification-Emails an EINE Adresse (notification_email). Chef/Büro muss 18 Emails sichten. Es gibt KEIN Batching, kein Digest.
2. **Push-Broadcast bei Reviews:** Alle 8 Techniker bekommen alle 5 Review-Push-Notifications. Sollte nur an den zuständigen Techniker gehen.
3. **Kein Tages-Briefing:** 8 Techniker starten den Tag ohne Übersicht "Was steht heute an?". Techniker-View im Leitstand zeigt das — aber nur bei aktivem Öffnen.
4. **SMS-Volumen pro Tag:** ~27 SMS = ~CHF 2.70-3.80. Bei 20 Arbeitstagen/Monat = CHF 54-76/Monat nur SMS (36% vom Standard-Preis CHF 299).
5. **Notfall-Push an ALLE:** 3 Notfall-Pushes an alle 8 Techniker, auch die, die gerade auf einer Baustelle sind und nichts damit zu tun haben.

#### Was funktioniert

- Fallback-Kaskade E-Mail→SMS bei Voice-Fällen (kein Endkunde wird vergessen).
- Assignment-Push ist gezielt (targetUserId).
- Stammkunden-Schutz verhindert Review-Spam bei Wiederholungskunden.

---

### 4.3 Profil C: 25-Mann-Betrieb (GF + 2 Büro + Teamleiter + 15 Techniker)

**Betrieb:** Keller Gebäudetechnik AG, Zürich. GF delegiert, Büro-Team koordiniert, Teamleiter planen.
**Szenario:** Voller Montag. 30 Anrufe + 5 Wizard, 5 Notfälle, 10 Review-Anfragen.

#### Nachrichten-Explosion

| Kanal | GF/Büro (3 Personen) | Teamleiter | Techniker (15) | Endkunden (35) |
|-------|---------------------|------------|----------------|----------------|
| **Email (Ops)** | 35 (an 1 Adresse!) | 0 | 0 | 0 |
| **Email (Assignment)** | 0 | 0 | ~25 (verteilt) | 0 |
| **Email (ICS)** | 0 | 0 | ~20 | 0 |
| **SMS (Post-Call)** | 0 | 0 | 0 | 30 |
| **SMS (Termin)** | 0 | 0 | 0 | ~25 |
| **Push (Notfall)** | 5 (x3 Büro) | 5 | 5 (x15!) | 0 |
| **Push (Assignment)** | 0 | 0 | ~25 (gezielt) | 0 |
| **Push (Review)** | 10 (x3) | 10 | 10 (x15!) | 0 |
| **TOTAL pro Rolle** | **~80** (GF: ~45, Büro je ~45) | **~15** | **~55** (verteilt, ~4/Person) | **~55** (verteilt, ~1.5/Person) |

#### Kritische Probleme

1. **35 Ops-Emails an EINE Adresse:** Inbox-Overload. Bei 30 Anrufen = 1 Email alle 16 Minuten während Geschäftszeiten. Kein Digest, kein Filter nach Priorität.
2. **Push-Broadcast-Explosion:** 5 Notfall-Pushes x 19 Personen = 95 Push-Notifications gesamt, davon ~75 irrelevant. 10 Review-Pushes x 19 = 190 Push-Notifications, davon ~170 irrelevant.
3. **Kein Teamleiter-Kanal:** Es gibt keine Rolle "Teamleiter" im System. Teamleiter hat keine spezielle Sicht auf sein Team.
4. **SMS-Kosten:** ~55 SMS x CHF 0.12 = CHF 6.60/Tag = CHF 132/Monat (33% vom Professional-Preis CHF 499).
5. **Notfall-Routing fehlt:** Alle 5 Notfälle gehen an ALLE 19 Personen als Push. Es gibt kein "Notfall-Zuständiger des Tages".
6. **GF-Overload:** GF will nur Ausnahmen sehen (Notfälle, negative Reviews), bekommt aber 35 Fall-Emails.

---

## 5. Zusammenfassung der Probleme (priorisiert)

### Kritisch (verursacht Noise/Churn)

| # | Problem | Betrifft | Schwere |
|---|---------|----------|---------|
| **K1** | Ops-Email hat KEINEN Digest-Modus. Jeder Fall = 1 Email. Ab 10+ Fällen/Tag = Inbox-Spam. | 15+ MA Betriebe | HOCH |
| **K2** | Push-Broadcast: Notfall- und Review-Pushes gehen an ALLE registrierten Staff, nicht nur an Zuständige. | Alle ab 5+ MA | HOCH |
| **K3** | Self-Assignment-Spam: 2-Mann-Betrieb bekommt Assignment-Emails/Pushes für sich selbst. | 2-5 MA Betriebe | MITTEL |
| **K4** | Negative Review hat KEINEN E-Mail-Alert — nur Push. Wenn Push nicht aktiviert: unsichtbar. | Alle | HOCH |

### Lücken (fehlendes Feature)

| # | Lücke | Nutzen | Aufwand |
|---|-------|--------|---------|
| **L1** | Kein Morgen-Briefing für Betrieb (nur Founder bekommt Morning Report). | Techniker-Tagesstart, Büro-Übersicht | M |
| **L2** | Kein E-Mail-Digest (z.B. "5 neue Fälle in der letzten Stunde"). | Verhindert Inbox-Overload bei 15+ MA | M |
| **L3** | Kein Notfall-Routing (diensthabender Techniker). | Verhindert Broadcast-Noise bei Notfällen | L |
| **L4** | Kein Teamleiter-Rolle im System. | Delegation, Sub-Team-Sicht | L |
| **L5** | Weekly Rapport geht nur an Betriebe mit notification_email — Phase A Betriebe sehen nichts. | Wertvermittlung | S |

### Redundanzen

| # | Redundanz | Empfehlung |
|---|-----------|------------|
| **R1** | Voice-Fall: Endkunde bekommt SMS (S1). Wenn er auch Email hat (selten bei Voice): zusätzlich Reporter Confirmation (E2). Doppelt. | Bei Voice: SMS = einziger Kanal an Endkunde. Keine zusätzliche Email. |
| **R2** | Termin: Endkunde kann Email (E5) UND SMS (S3) bekommen wenn beides vorhanden. | Email = primär. SMS nur wenn KEIN Email vorhanden (reiner Fallback). |
| **R3** | Weekly Rapport (E16) + Morning Report (T1) überlappen teilweise (Cases, Reviews). | Klar trennen: Morning Report = Founder/System. Weekly = Betrieb/Wert. |

---

## 6. Ziel-Zustand: Kanal-Regeln (Empfehlung)

### Regel 1: Ein Kanal pro Empfänger pro Ereignis

**Prinzip:** Kein Empfänger bekommt die gleiche Information über zwei Kanäle gleichzeitig.

| Empfänger | Primär-Kanal | Sekundär (Fallback) | Wann Fallback? |
|-----------|-------------|---------------------|----------------|
| **Endkunde (Voice)** | SMS | — | Immer SMS (Voice hat selten Email) |
| **Endkunde (Wizard)** | Email | SMS | Nur wenn KEIN Email vorhanden |
| **Betrieb (Inhaber/Büro)** | Email | Push | Push ergänzt (nicht dupliziert) |
| **Techniker** | Push | Email | Email bei Zuweisung/ICS, Push bei Notfall |
| **Founder** | Telegram | Email (bei RED/YELLOW) | Email als Backup, nicht Duplikat |

### Regel 2: Push ist ERGÄNZUNG, nicht Kopie

Push-Notifications sollen auf Ereignisse aufmerksam machen, die SOFORTIGE Aufmerksamkeit brauchen. Alles andere reicht als Email oder Leitstand-Eintrag.

| Push-Ereignis | Wer bekommt es | Opt-out? |
|---------------|---------------|----------|
| Notfall | Nur Betriebsinhaber/Büro (NICHT alle Techniker) | Nein |
| Negative Review | Nur Betriebsinhaber/Büro | Nein |
| Zuweisung | Nur zugewiesener Techniker | Ja |
| Positive Review | Nur zuständiger Techniker | Ja |
| Neuer Fall (nicht Notfall) | NIEMAND via Push. Leitstand zeigt es. | — |

### Regel 3: Self-Assignment unterdrücken

Bei Betrieben mit <= 3 Staff-Mitgliedern:
- KEINE Assignment-Email wenn `assignee_user_id === session_user_id`
- KEINE Assignment-Push wenn gleiche Bedingung
- ICS-Termin NUR wenn der Staff-Eintrag eine andere Email hat als der eingeloggte User

**Implementierung:** Prüfung in `notify-assignees/route.ts`: Wenn `scope.userId === staff.user_id` und Betrieb <= 3 Staff → Skip.

### Regel 4: Email-Digest ab Schwellwert

Wenn ein Betrieb > 10 Fälle/Tag erzeugt, switcht das System automatisch von Einzel-Emails auf einen stündlichen Digest.

**Phase 1 (einfach):** Neues Tenant-Setting `notification_mode: "instant" | "digest"`. Default: instant. Digest = 1 Email pro Stunde mit allen neuen Fällen in einer Tabelle.

**Phase 2 (automatisch):** Wenn in den letzten 7 Tagen Ø > 8 Fälle/Tag, automatische Empfehlung im Leitstand: "Wir empfehlen den Zusammenfassungs-Modus für Ihre E-Mail-Benachrichtigungen."

### Regel 5: Negativ-Review-Alert per Email

Negative Reviews (<=3 Sterne) generieren IMMER einen Email-Alert an notification_email, zusätzlich zum Push. Begründung: Push kann deaktiviert sein, Browser kann geschlossen sein. Eine negative Bewertung darf NICHT untergehen.

**Implementierung:** In `rate/route.ts`: Wenn `rating <= 3`, zusätzlich `sendCaseNotification()` mit speziellem Template (Subject: "Negatives Kundenfeedback" statt "Neuer Fall").

### Regel 6: SMS-Budget-Schutz

SMS ist der teuerste Kanal (CHF 0.10-0.14/SMS). Regeln:
- Post-Call SMS: Immer (Kernfunktion, kein Einsparpotenzial)
- Termin-SMS: Nur wenn KEIN Email (reiner Fallback)
- 24h-Erinnerung SMS: Nur wenn KEIN Email (reiner Fallback, Email-Alternative bauen)
- Review SMS: Nur wenn KEIN Email (reiner Fallback)
- Wizard SMS: Default AUS (bleibt so)

**Neue Einsparung:** 24h-Termin-Erinnerung per Email (mit SMS als Fallback). Spart bei Wizard-Fällen mit Email ~30% SMS-Volumen.

### Regel 7: Weekly Rapport als Wert-Instrument

Der wöchentliche Rapport ist das wichtigste Instrument, um dem Betrieb den Wert des Systems zu zeigen. Regeln:
- IMMER senden (nicht nur Phase B). Phase A Tenants ohne notification_email: An Founder als Proxy.
- Inhalt priorisieren: Bewertungen > Fälle erledigt > Neue Fälle > Google-Rating.
- "Höhepunkt der Woche" Section: Der beste Fall, die beste Bewertung, der schnellste Abschluss.
- KEIN FlowSight-Branding sichtbar (R4). Sieht aus wie der Betrieb es selbst schickt.

---

## 7. Konkrete Implementierungs-Empfehlungen

### Sofort (nächster Sprint)

| # | Was | Aufwand | Datei(en) |
|---|-----|---------|-----------|
| **I1** | Self-Assignment-Unterdrückung: Skip Email+Push wenn Zuweiser = Zugewiesener bei <= 3 Staff | S | `notify-assignees/route.ts` |
| **I2** | Notfall-Push nur an Inhaber/Büro: Neues Flag `is_office_role` auf staff-Tabelle. Notfall-Push filtert darauf. | S | `sendOpsPush.ts`, staff-Tabelle |
| **I3** | Review-Push nur an zuständigen Techniker (statt Broadcast): `targetUserId` nutzen wenn assignee_text vorhanden | S | `rate/route.ts` |
| **I4** | Negativ-Review Email-Alert: `sendNegativeReviewAlert()` an notification_email | S | `rate/route.ts`, `resend.ts` |
| **I5** | 24h-Erinnerung auch per Email (nicht nur SMS): Fallback-Kaskade Email → SMS | S | `lifecycle/tick/route.ts` |

### Mittelfristig (Phase 2)

| # | Was | Aufwand | Nutzen |
|---|-----|---------|--------|
| **I6** | Email-Digest-Modus (stündlich statt pro Fall) | M | Verhindert Inbox-Overload bei 15+ MA |
| **I7** | Weekly Rapport auch an Phase-A-Tenants (via Founder) | S | Wert zeigen vor Aktivierung |
| **I8** | Morgen-Briefing für Betrieb (Email um 07:00): "Heute stehen X Termine an, Y offene Fälle" | M | Techniker-Tagesstart |
| **I9** | Notification Preferences im Leitstand: Pro Staff "Alle Benachrichtigungen / Nur Notfälle / Stumm" | M | Noise-Reduktion |

### Langfristig (Phase 3)

| # | Was | Aufwand | Nutzen |
|---|-----|---------|--------|
| **I10** | Teamleiter-Rolle mit Sub-Team-Sicht | L | Delegation bei 20+ MA |
| **I11** | Notfall-Dienstplan: "Wer ist heute für Notfälle zuständig?" | L | Gezieltes Routing statt Broadcast |
| **I12** | SMS-Zustellberichte (eCall Delivery Status) auswerten | M | Fehlgeschlagene SMS erkennen |

---

## 8. Kosten-Projektion pro ICP-Profil

### SMS-Kosten pro Monat (20 Arbeitstage, CHF 0.12/SMS Durchschnitt)

| Szenario | 2-MA (5 Fälle/Tag) | 15-MA (18 Fälle/Tag) | 25-MA (35 Fälle/Tag) |
|----------|---------------------|----------------------|----------------------|
| Post-Call SMS (Voice) | 3/Tag = CHF 7.20/Mo | 12/Tag = CHF 28.80/Mo | 25/Tag = CHF 60/Mo |
| Termin SMS | 2/Tag = CHF 4.80/Mo | 12/Tag = CHF 28.80/Mo | 25/Tag = CHF 60/Mo |
| 24h Reminder SMS | 2/Tag = CHF 4.80/Mo | 10/Tag = CHF 24/Mo | 20/Tag = CHF 48/Mo |
| Review SMS | 1/Tag = CHF 2.40/Mo | 3/Tag = CHF 7.20/Mo | 5/Tag = CHF 12/Mo |
| **TOTAL SMS** | **CHF 19.20/Mo** | **CHF 88.80/Mo** | **CHF 180/Mo** |
| **% vom Preis** | **6.4% (von 299)** | **17.8% (von 499)** | **22.5% (von 799)** |

### SMS-Einsparung mit Email-Fallback-Optimierung

Wenn Termin-SMS und Reminder-SMS nur bei Voice-Fällen (ohne Email) gesendet werden:

| Szenario | IST | SOLL (mit Optimierung) | Ersparnis |
|----------|-----|------------------------|-----------|
| 2-MA | CHF 19.20 | CHF 12/Mo | -37% |
| 15-MA | CHF 88.80 | CHF 55/Mo | -38% |
| 25-MA | CHF 180 | CHF 108/Mo | -40% |

---

## 9. Referenzen

| Dokument | Rolle |
|----------|-------|
| `docs/redesign/leitstand/Matrix_kommunikation.md` | Vorgänger v1 (18.03.2026) |
| `docs/architecture/zielarchitektur.md` | Zielarchitektur (§12 SMS, §11 OTP) |
| `docs/architecture/contracts/case_contract.md` | Fall-Datenmodell |
| `docs/architecture/env_vars.md` | Provider-Credentials |
| `docs/redesign/identity_contract.md` | Branding-Regeln R1-R7 |
| `docs/redesign/leitstand/plan_bewertungen_abschluss.md` | Review-System Abschlussplan |
| `src/web/src/lib/email/resend.ts` | Alle E-Mail-Templates (Code) |
| `src/web/src/lib/sms/postCallSms.ts` | Post-Call SMS (Code) |
| `src/web/src/lib/push/sendOpsPush.ts` | Push-Notifications (Code) |
| `src/web/src/lib/notify/router.ts` | WhatsApp Alert Router (Code) |
| `src/web/app/api/lifecycle/tick/route.ts` | Lifecycle Tick + 24h Reminder (Code) |
| `scripts/_ops/morning_report.mjs` | Morning Report (Code) |
| `scripts/_ops/weekly_report.mjs` | Weekly Rapport (Code) |
