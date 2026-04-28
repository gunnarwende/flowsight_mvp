# BigBen Pub — Live-Schaltung 29.04.2026

**Termin:** 29.04.2026
**Owner:** Founder + Paul
**Goal:** Live-Schaltung Voice-Agent via Swisscom-Forwarding + App-Übergabe an Paul.

---

## Pre-Termin-Checkliste (Founder, vorab)

### A. Bugs fixen (Live-Blocker)
- [ ] **Voice Datum-Bug** (Lisa sagt 18.04 statt 28.04). Test-Call: `call_53e7b50c8ca86706ee1ee498fdd`
  - Root: Voice-Agent-Prompt hat statisches Datum oder falsche Date-Logic
  - Fix-Pfad: Retell-Agent-JSON inspizieren, Date-Variable einbauen oder Prompt täglich updaten via Cron
- [ ] **Reservierung kommt nicht in App** (Polling läuft, aber kein Eintrag)
  - Root: Sync-Calls API erstellt nicht zuverlässig Reservation-Records
  - Fix-Pfad: `/api/retell/sync-calls` debuggen, Test-Call inspizieren, Reservation-Schema prüfen
- [ ] **App-Aktualisieren bringt nichts** (PWA-Refresh zeigt keine neuen Daten)
  - Root: Caching-Issue oder Service-Worker stale
  - Fix-Pfad: Cache-Header prüfen, manuelles router.refresh()
- [ ] **FB21 Tenant-Switcher** routet BigBen-Auswahl auf Sanitär-Leitsystem
  - Root: `/api/ops/switch-tenant` ignoriert tenant-module-type
  - Fix-Pfad: Switch-tenant API erweitern: redirect auf `/ops/pub-dashboard` wenn isPubTenant

### B. App-Daten leeren (vor Übergabe)
- [ ] Events: alle löschen (aktuell ~20 geseedet)
- [ ] Sports: alle löschen
- [ ] Bookings/Reservations: alle löschen (nur leere App übergeben)
- [ ] Guest-Watch: leer
- SQL: `DELETE FROM pub_events WHERE tenant_id = '<bigben-tenant-id>';` etc.

### C. Website finalisieren
- [ ] Hero GIF/belebendes Element einbauen (Datei beim Founder)
- [ ] Galerie luxuriöser gestalten
- [ ] Instagram @bigbenpubzh zentral bei Galerie
- [ ] Echte Pauls Fotos statt Platzhalter
- [ ] Sport/Event Cards Mobile Overflow

### D. Voice-Agent prüfen
- [ ] Datum dynamisch in Prompt (heute = real today)
- [ ] Events statisch updaten für nächste 7-14 Tage
- [ ] Öffnungszeiten validiert
- [ ] DE-Switch funktioniert (Test: "Sprechen Sie Deutsch?")

---

## Was Paul vorab bringt (vom Founder bestätigt)

| # | Was | Status | Wann |
|---|-----|--------|------|
| 1 | **Swisscom-Account-Login** (Selfcare swisscom.ch) | bestätigt | morgen vor Ort |
| 2 | **Google Business Profile** | bestätigt | (existiert) |
| 3 | **Pauls Email** (für OTP-Login) | offen | morgen |
| 4 | **Pauls iPhone/Android** (für PWA-Install) | bestätigt | morgen |
| 5 | **Logo/Fotos** | offen | nice-to-have |

## Was Founder bringt (vor-bereitet)

- ✅ Voice-Agent +41 44 505 48 18 (EN+DE, Lisa, coffee-shop ambient)
- ✅ Website flowsight.ch/bigben-pub (dark theme, kennedys.ch-Stil)
- ✅ App `/ops/app/bigben-pub` (PWA installierbar)
- ✅ Pub-Dashboard, Events-Pflege, Reservations-Manager, Guest-Watch
- ⏳ Voice-Datum-Bug-Fix
- ⏳ Reservierungs-Pipeline-Sync-Fix
- ⏳ App leer (keine Test-Daten)

---

## Live-Setup-Ablauf (vor Ort, ~60 Min)

### 0:00 – Begrüssung (5 Min)
"Heute machen wir's scharf, Paul. Ab heute Abend übernimmt Lisa deine Anrufe. Du bekommst alle Reservierungen direkt aufs Handy."

### 0:05 – Swisscom-Rufweiterleitung (15 Min) ⚡ Live-Blocker

**Pauls Pub-Telefon:** 044 722 20 62

1. Login auf `swisscom.ch/login` mit Pauls Credentials
2. Festnetz → **Rufweiterleitung**
3. Trage ein:
   - Nummer: `+41 44 505 48 18` (FlowSight Voice-Agent)
   - Typ: "Sofort weiterleiten" (oder "Wenn besetzt + nicht beantwortet" — Paul entscheidet)
4. Speichern → Bestätigung warten
5. **Sofort-Test:** Pauls Pub-Nummer 044 722 20 62 mit Founder-Handy anrufen → muss Lisa sagen
6. Wenn Lisa antwortet: Forwarding ✅

> **Rückfall-Plan:** Falls Forwarding nicht direkt klappt, Swisscom-Hotline 0800 800 800 mit Paul + Stellvertretung-Ansage anrufen.

### 0:20 – App-Install auf Pauls Handy (10 Min)

**iPhone (Safari):**
1. URL eintippen: `flowsight.ch/ops/app/bigben-pub`
2. Teilen-Symbol unten → "Zum Home-Bildschirm hinzufügen"
3. Name bestätigen "BigBen Pub"
4. App-Icon auf Home-Screen → öffnen
5. Pauls Email eintippen → 6-stelliger OTP-Code aus Email → bestätigen
6. App öffnet sich → Dashboard sichtbar

**Android (Chrome):** identisch, Drei-Punkte-Menü → "App installieren"

### 0:30 – App-Walkthrough mit Paul (15 Min)

Zeige in Reihenfolge:
1. **Dashboard** — heutige Übersicht (Reservations, Events, Sports)
2. **Reservations** — eingehende Anfragen, Confirm/Decline-Buttons
3. **Walk-in Quick-Add** — für spontane Gäste
4. **Events / Sports** — Add/Edit, woechentliche Wiederkehrer einmal anlegen
5. **Guest Watch** — Yellow/Red Card No-Show-Liste (wer nicht erscheint)
6. **Bookings Analytics** — Walk-in/Online/Phone-Trend

### 0:45 – Test-Anruf E2E (10 Min)

1. **Founder ruft Pauls Pub-Telefon** 044 722 20 62
2. Anruf landet via Swisscom-Forward bei Voice-Agent → **Lisa sagt:** "Hi, this is Lisa from BigBen Pub..."
3. Reservierung durchspielen: Name "Test User", 4 Pers., morgen 19:00
4. **In Pauls App prüfen** (~30s warten, Reservations-Tab refresh):
   - Reservation erscheint mit Status "pending"
   - Push-Notification kommt (wenn Push aktiviert)
5. Paul drückt **Confirm** → SMS an Test-Nummer kommt: "Your table at BigBen Pub is confirmed for ..."
6. **Reminder-SMS** wird automatisch 24h vor Termin gesendet (cron `lifecycle-tick` 07:00 UTC)

> Falls Reservierung nicht in App: Polling-Status via `/api/retell/sync-calls` manuell triggern + DB-Eintrag prüfen.

### 0:55 – Übergabe & Q&A (5 Min)

- Handout `handout-paul.md` (PDF gedruckt + WhatsApp-Link)
- Founder-Telefonnummer für Notfälle (24/7 für die ersten 2 Wochen — Founder geht 30.04. auf Reise)
- Tag-7-Check-in-Anruf vereinbaren

---

## Post-Live-Validierung (Tag 1-7)

### Tag 1 (29.04. abends)
- [ ] Mindestens 1 echter Anruf von Pub-Gast gelandet
- [ ] Reservierung in App
- [ ] Push-Notification angekommen
- [ ] Paul hat App benutzt

### Tag 2-7
- Morning-Report täglich prüfen (07:30 UTC) — RED/YELLOW direkt ans Founder-Handy
- Voice-Agent-Hangup-Monitor: bei Auflegen vor 30s → RED-Alert (Sentry)

### Tag 7 (06.05.) Check-in
- Telefon-Anruf mit Paul: "Wie läuft's? Was funktioniert? Was nervt?"
- Lessons-Learned-Update

---

## Bekannte Painpoints (vorbereitet zu adressieren)

| Painpoint | Antwort |
|-----------|---------|
| "Was wenn Lisa was Falsches sagt?" | Founder ruft an, Voice-Agent same-day fix |
| "Was wenn die App nicht funktioniert?" | Browser-Cache leeren, neu installieren via Link |
| "Wie weiss ich dass Lisa funktioniert?" | Erstes Mal: Founder testet vor Ort. Danach: Morning-Report täglich, Push bei Notfall |
| "Was wenn ich auf den Philippinen-Trip von Founder bin?" | Founder-Email tagesaktuell. Hot-Fixes via WhatsApp möglich. |
| "Was wenn der Pub voll ist?" | Reservierungs-Capacity-Limit nicht hard-coded — Paul ablehnt manuell oder bietet Alternativ-Termin |

---

## Notfall-Plan (falls morgen was schief geht)

### Falls Voice-Agent nicht antwortet
1. Retell Dashboard prüfen — Agent published? `is_published: true`?
2. Retell-Sync neu: `node scripts/_ops/retell_sync.mjs --slug bigben-pub`
3. Twilio-Console: Nummer-Konfig prüfen
4. Worst-Case: Paul keeps phone forwarding deaktiviert für heute, Founder fixt nachmittags

### Falls App nicht installiert
1. Browser-Cache vollständig leeren
2. Inkognito-Modus testen
3. Anderes Device versuchen (Tablet)
4. Worst-Case: Web-Version via Bookmark — funktioniert ohne PWA

### Falls Reservierungen nicht ankommen
1. Manueller `/api/retell/sync-calls` POST-Trigger
2. DB-Check: existiert Reservation-Eintrag?
3. App-Refresh forcieren via Cmd+Shift+R
4. Worst-Case: SMS an Paul direkt vom Voice-Webhook (zusätzlich zur App)

---

## Kontakte für morgen

- **Paul:** WhatsApp / Pub direkt 044 722 20 62
- **Founder:** [Pauls bekannte Founder-Nummer]
- **Swisscom-Hotline:** 0800 800 800
- **Retell-Status:** dashboard.retellai.com
- **Vercel-Status:** vercel.com/status

---

**Update-History:**
- 2026-04-28 | CC | Initial-Version
