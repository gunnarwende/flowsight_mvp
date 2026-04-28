# BigBen Pub — E2E Test-Plan & Quality-Gates für Live-Schaltung 29.04.

**Zweck:** Garantierter Live-Stand. Drei Reservierungs-Kanäle + alle App-Funktionen E2E getestet, alle Quality-Gates grün, bevor Paul die App in die Hand nimmt.

**Owner:** CC führt Pre-Live alle Gates selbst aus + dokumentiert hier. Founder verifiziert Live-Day mit Paul.

---

## Übersicht — 3 Reservierungs-Kanäle + 5 App-Funktionen

| # | Kanal/Funktion | Typ | Kritikalität |
|---|---|---|---|
| **K1** | Voice → Reservation (Anruf an Lisa) | Eingang | 🔥 P0 |
| **K2** | Website → Reservation (flowsight.ch/bigben-pub Form) | Eingang | 🔥 P0 |
| **K3** | Manual → Reservation (Paul tippt in App) | Eingang | 🔥 P0 |
| **F1** | GuestWatch (Yellow/Red Card No-Show-Liste) | App | 🟡 P1 |
| **F2** | Events / Sports (Add/Edit/Delete) | App | 🟡 P1 |
| **F3** | 24h SMS-Reminder (automatisch an Gast) | Automation | 🔥 P0 |
| **F4** | Confirm-SMS bei Reservation | Automation | 🔥 P0 |
| **F5** | Push-Notification bei neuer Reservation | App | 🟡 P1 |

---

## QUALITY GATES — Pre-Live (CC führt aus)

### Gate 1 — Voice-Strang K1 ⚡

**Was getestet:** Anruf → Lisa antwortet → Reservation in DB → App zeigt → SMS an Gast.

**Test-Schritte:**
1. CC ruft +41 44 505 48 18 an (BigBen Voice Agent)
2. **Erwartet:** Lisa sagt "Hi, Big Ben Pub, how can I help you?"
3. CC sagt: "I'd like to book a table for tomorrow at 7pm, 4 people, name is Test User"
4. **Erwartet:** Lisa antwortet mit "Perfect, I've noted your reservation for [date] at 19:00, 4 guests, under Test User. Paul will confirm shortly."
5. **Erwartet (Datum):** Lisa nennt das KORREKTE Datum für morgen (z.B. "Wednesday, 29 April") — NICHT 18.04 oder ein anderes falsches Datum.
6. CC legt auf
7. Polling-Wait: max. 60s warten
8. **Erwartet (DB):** `pub_reservations` hat neuen Eintrag mit guest_name="Test User", party_size=4, status="pending"
9. **Erwartet (App):** `/ops/reservations` zeigt neuen Eintrag (manueller Refresh OK)
10. **Erwartet (SMS an Gast):** Bestätigungs-SMS an CC's Nummer mit Reservierungsdetails

**Pass-Kriterien:**
- [ ] Lisa antwortet auf Englisch
- [ ] Lisa nennt korrektes Datum (nicht 18.04)
- [ ] Lisa fragt nicht nach Telefonnummer (Caller-ID nutzen)
- [ ] Reservation in DB innerhalb 60s
- [ ] App zeigt Eintrag (mit refresh)
- [ ] SMS-Bestätigung kommt an
- [ ] Push-Notification an Paul kommt

**Bei Fail:** Bug-Log + Fix vor nächstem Test.

---

### Gate 2 — Website-Strang K2 ⚡

**Was getestet:** Webform → Reservation in DB → App → SMS an Gast.

**Test-Schritte:**
1. CC öffnet `flowsight.ch/bigben-pub` im Browser
2. Scrollt zur Reservierungs-Sektion
3. Füllt Form aus:
   - Name: "Web Test User"
   - Phone: CC's echte Nummer (für SMS-Verifikation)
   - Date: morgen
   - Time: 18:30
   - Party size: 2
   - Note: "E2E Test"
4. Submit
5. **Erwartet (Browser):** Success-Screen "Your reservation request has been received. Paul will confirm shortly."
6. **Erwartet (DB):** Eintrag innerhalb 5s
7. **Erwartet (App):** Eintrag in /ops/reservations
8. **Erwartet (SMS an Gast):** Bestätigungs-SMS

**Pass-Kriterien:**
- [ ] Form rendert korrekt (alle Felder)
- [ ] Submit funktioniert (kein Fehler)
- [ ] Success-Screen erscheint
- [ ] DB-Eintrag korrekt
- [ ] App zeigt Eintrag
- [ ] SMS an Gast
- [ ] Mobile-View getestet (Phone-Browser)

---

### Gate 3 — Manual-Strang K3 (Walk-in / Paul tippt direkt) ⚡

**Was getestet:** Paul öffnet App → Walk-in Quick-Add → Eintrag → SMS optional.

**Test-Schritte:**
1. CC öffnet App (`/ops/app/bigben-pub` als Paul-User)
2. Reservations-Page → "+ Walk-in" oder "+ New Reservation" Button
3. Tippt:
   - Name: "Manual Test"
   - Phone: CC's Nummer
   - Date: heute
   - Time: aktuell+1h
   - Party size: 6
4. Speichern
5. **Erwartet (DB):** Eintrag mit status="confirmed" (Walk-in ist sofort confirmed)
6. **Erwartet (App):** Eintrag in Liste
7. **Erwartet (SMS):** Optional — bei "Save & SMS" Button

**Pass-Kriterien:**
- [ ] Walk-in-Form vorhanden
- [ ] 3-Tap-Workflow (max. 30s vom Open bis Save)
- [ ] Eintrag erscheint sofort (kein refresh nötig)
- [ ] Pflichtfelder validiert
- [ ] Edit + Delete möglich
- [ ] Mobile-Tap-Targets ≥48px

---

### Gate 4 — GuestWatch (No-Show System) F1

**Was getestet:** No-Show-Markierung erzeugt Yellow/Red Card.

**Test-Schritte:**
1. CC öffnet eine Reservation aus Gate 1
2. Markiert als "No-Show"
3. **Erwartet (DB):** status="no_show"
4. **Erwartet (Guest-Watch):** Eintrag in Yellow-Card-Liste (1× No-Show)
5. CC erstellt 2. Reservation für gleiche Telefonnummer
6. Markiert wieder als "No-Show"
7. **Erwartet:** Eintrag wechselt zu Red-Card (2+ No-Shows)

**Pass-Kriterien:**
- [ ] No-Show-Markierung möglich
- [ ] Yellow-Card bei 1 No-Show
- [ ] Red-Card bei 2+
- [ ] Gäste-View zeigt Liste sortiert nach Status
- [ ] Read-only (nur DB-Update via Reservation-Edit)

---

### Gate 5 — Events / Sports F2

**Was getestet:** Add/Edit/Delete für Events + Sports.

**Test-Schritte:**
1. CC öffnet `/ops/events`
2. Tab "Events" → "+ Neues Event"
3. Tippt: "E2E Test Event", date=morgen, time=20:00, recurring=null
4. Speichern
5. **Erwartet:** Eintrag in DB + Liste
6. CC editiert: time=21:00
7. **Erwartet:** DB-Update + Liste-Update
8. CC löscht
9. **Erwartet:** Eintrag weg
10. Wiederholen für "Sports"-Tab

**Pass-Kriterien:**
- [ ] 2 Tabs (Events / Sports)
- [ ] Add-Form: Titel + Datum + Zeit + Recurring + Description
- [ ] Edit funktioniert
- [ ] Delete funktioniert (mit Bestätigung)
- [ ] Liste sortiert nach Datum
- [ ] Recurring-Events erscheinen wöchentlich

---

### Gate 6 — 24h SMS-Reminder F3 ⚡

**Was getestet:** Reservation für morgen → Reminder-SMS am Vortag.

**Test-Schritte:**
1. Reservation aus Gate 1 (für morgen 19:00)
2. **Erwartet:** Cron-Job `lifecycle-tick` (07:00 UTC) findet Reservation als "morgen" → SMS rausgeht
3. CC checkt CC's Nummer auf SMS am Vortag-Morgen
4. **Erwartet:** SMS-Text "Reminder: Your reservation at BigBen Pub tomorrow at 19:00 for 4 guests..."

**Pass-Kriterien:**
- [ ] Cron läuft täglich
- [ ] Findet "morgen-Reservations"
- [ ] SMS rausgeht (eCall.ch)
- [ ] Inhalt korrekt (Datum + Zeit + Anzahl)
- [ ] Idempotent (kein 2× Versand)

**Manual-Test-Workaround:** SMS-Reminder-Trigger manuell via API call:
```bash
curl -X POST https://flowsight.ch/api/lifecycle/tick \
  -H "Authorization: Bearer $LIFECYCLE_TICK_SECRET"
```

---

### Gate 7 — Confirm-SMS F4 ⚡

**Was getestet:** Reservation-Confirm in App → SMS an Gast.

**Test-Schritte:**
1. Reservation aus Gate 1 ist status="pending"
2. CC öffnet App, klickt "Confirm" auf der Reservation
3. **Erwartet (DB):** status="confirmed", confirmed_at gesetzt
4. **Erwartet (SMS):** "Your table at BigBen Pub is confirmed for [date] at [time]. See you soon!"

**Pass-Kriterien:**
- [ ] Confirm-Button vorhanden
- [ ] DB-Update nach Click
- [ ] SMS rausgeht innerhalb 10s
- [ ] Inhalt korrekt
- [ ] "Decline"-Button auch funktional

---

### Gate 8 — Push-Notification F5

**Was getestet:** Neue Reservation → Push an Paul.

**Test-Schritte:**
1. Pauls App geöffnet (oder im Hintergrund)
2. Push-Notifications aktiviert (1× initial)
3. CC erstellt Reservation via Voice (Gate 1)
4. **Erwartet:** Push-Notification erscheint auf Pauls Handy: "New reservation: [name], [time], [guests]"
5. Tap → öffnet App auf Reservations-Page

**Pass-Kriterien:**
- [ ] Push erscheint (max. 60s nach Reservierung)
- [ ] Push-Text informativ
- [ ] Tap-to-Open funktioniert
- [ ] Funktioniert auf iOS (≥16.4) + Android

---

## QUALITY GATES — Live-Day (29.04. mit Paul)

### Live-Gate 1 — Rufweiterleitung Swisscom

- [ ] Selfcare-Login Paul funktioniert
- [ ] Forwarding Pauls 044 722 20 62 → +41 44 505 48 18 aktiviert
- [ ] Test-Anruf von Founder-Handy auf 044 722 20 62 → landet bei Lisa

### Live-Gate 2 — App-Install bei Paul

- [ ] iPhone/Android Pauls Browser öffnet `/ops/app/bigben-pub`
- [ ] PWA-Install klappt (Add-to-Homescreen)
- [ ] OTP-Email kommt (auf Pauls echte Email)
- [ ] OTP-Code akzeptiert
- [ ] App öffnet sich, Pauls Tenant aktiv

### Live-Gate 3 — Live E2E-Test mit Paul

Wiederhole Gates 1-3 (K1, K2, K3) live mit Paul vor Ort:
- [ ] Voice-Reservation kommt in Pauls App
- [ ] Website-Reservation kommt in Pauls App  
- [ ] Manual-Reservation funktioniert
- [ ] SMS kommt an Gast (CC's Nummer als Test-Phone)
- [ ] Push erscheint auf Pauls Handy

### Live-Gate 4 — Übergabe-Materialien

- [ ] Handout (`handout-paul.md`) gedruckt + an Paul
- [ ] App-Install-Link via WhatsApp an Paul
- [ ] Founder-Notfallnummer kommuniziert (24/7 für 2 Wochen)

---

## QUALITY GATES — Post-Live (Tag 1-7)

### Tag 1 (29.04. abends)

- [ ] Mindestens 1 echte Reservierung von Pub-Gast (nicht Test)
- [ ] Reservierung in DB + App
- [ ] Paul hat App benutzt (login_count > 0)
- [ ] Morning-Report (07:30 UTC) keine RED/YELLOW

### Tag 2-7

- [ ] Tägliche Reservation-Counts sinnvoll
- [ ] No-Show-Rate < 20%
- [ ] Voice-Hangup-Rate < 5% (Sentry)
- [ ] SMS-Delivery-Rate > 95%

### Tag 7 Check-in

- [ ] Telefon-Anruf mit Paul: "Wie läuft's?"
- [ ] Lessons-Learned-Update in `docs/customers/bigben-pub/lessons-learned.md`

---

## Bug-Log (während Pre-Live-Tests entdeckt)

| # | Datum | Was | Schweregrad | Status | Fix |
|---|-------|-----|-------------|--------|-----|
| BUG-1 | 28.04. | Voice nennt 18.04 statt heute | 🔥 Live-Blocker | FIXED | Prompt-Update + retell_sync (28.04. nachmittag) |
| BUG-2 | 28.04. | Reservation kommt nicht in App | 🔥 Live-Blocker | OFFEN | Polling-Cron-Frequenz erhöhen + Sync-Logging |
| BUG-3 | 28.04. | App-Refresh bringt nichts | 🟡 P1 | OFFEN | Service-Worker-Cache + abhängig von BUG-2 |
| BUG-4 | 28.04. | Tenant-Switcher routet auf Sanitär statt Pub-Dashboard | 🟡 P1 | OFFEN | Switch-Tenant-API redirect-Logic |

---

## Self-Test-Output-Format (für CC-Reports an Founder)

Pro Gate:
```
GATE X — [name] — STATUS: ✓ PASS / ✗ FAIL
  - Test 1: PASS
  - Test 2: FAIL — [reason]
  - Notes: [observations]
  - Bug-Log: [if any]
```

Gesamtreport am Ende:
```
PRE-LIVE QG SUMMARY (28.04.):
  Gate 1 (Voice): X/Y passed
  Gate 2 (Website): X/Y passed
  ...
  Live-Ready: YES / NO (with blockers)
```

---

## Prio-Reihenfolge der Tests (Pre-Live)

1. **Gate 1 (Voice)** — wichtigste Funktion, Bugs am wahrscheinlichsten
2. **Gate 6 (24h Reminder)** — Manual-Trigger zum Verifizieren
3. **Gate 7 (Confirm-SMS)** — direkt prüfbar
4. **Gate 3 (Manual)** — schneller Test
5. **Gate 2 (Website)** — Form testen
6. **Gate 4 (GuestWatch)** — abhängig von 1-3
7. **Gate 5 (Events/Sports)** — separat
8. **Gate 8 (Push)** — abhängig von Gates 1-3

---

**Update-History:**
- 2026-04-28 | CC | Initial-Plan erstellt
