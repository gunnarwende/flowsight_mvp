# BigBen Pub — Onboarding Run Sheet
**Paul Hadley · Big Ben Pub · Alte Landstrasse 20, 8942 Oberrieden**
**Termin: 29.04.2026 · ~60 Min · Founder + Paul vor Ort**

> **Eine Aufgabe heute:** Paul verlässt das Treffen mit einem funktionierenden Pub‑auf‑dem‑Handy.
> Lisa nimmt seine Anrufe ab, die App ist installiert, die erste echte Reservierung läuft durch — alles getestet vor seinen Augen.

---

## 1 · 5 Min vor dem Klingeln (Founder, allein)

Schnell-Check, dass nichts über Nacht gekippt ist. Alle vier müssen ✓ sein.

| Check | Wie | Erwartung |
|---|---|---|
| Voice live mit korrektem Datum | `+41 44 505 48 18` anrufen, "What's today's date?" | Lisa: "Wednesday, 29 April 2026" |
| Website live | https://flowsight.ch/bigben-pub öffnen | Hero lädt, Reservation‑Pills in Englisch |
| App live | https://flowsight.ch/ops/app/bigben-pub auf eigenem Handy | OTP-Login geht, Dashboard sichtbar |
| Telegram-Cron-Bestätigung von 07:13 CEST | Telegram öffnen | "✓ BigBen voice refreshed · today: Wednesday, 29 Apr 2026" |

Wenn einer rot: **vorher fixen**. Lieber 15 Min später bei Paul als mit halbem System.

---

## 2 · Was Paul mitbringt (am Anfang abfragen)

| Was | Status | Falls offen |
|---|---|---|
| Pauls Handy entsperrt | erforderlich | warten bis verfügbar |
| Swisscom Login (für Forwarding) | erforderlich | Hotline 0800 800 800 als Backup |
| Pauls geschäftliche E-Mail | erforderlich | Pub-Adresse oder Privat — egal, nur Code-Empfang |
| Google-Business-Profile-Zugriff | nice-to-have | später per Mail nachreichen |
| 2-3 echte Pub-Fotos | nice-to-have | per WhatsApp nachreichen |

---

## 3 · Was schon steht (für Pauls Vertrauen)

Sag direkt am Anfang, in einem Satz:

> "Bevor wir reingehen — alles ist schon scharf geschaltet, das letzte Stück ist nur noch deine Telefon‑Weiterleitung und dein Handy."

Konkret bereits live:

- Voice-Agent **Lisa** auf `+41 44 505 48 18` (English + Deutsch via swap)
- Lisa kennt heute, morgen, kommende Events (Quiz Mi, Karaoke Fr, Live Music Sa)
- Tagesaktualisierung läuft automatisch 3× täglich (05:13 / 11:13 / 17:13 UTC) mit Verifikation + Telegram-Alert bei Fehler
- Website `flowsight.ch/bigben-pub` (Hero, Events, Menu, Reviews, Galerie, Reservation, Hours, Map)
- Reservation läuft via SMS-Bestätigung erst nach Pauls Confirm — keine Auto-Confirms mehr
- App `/ops/app/bigben-pub` mit Pub-Dashboard, Reservations, Events, Guest-Watch, Bookings-Analytics
- Manuelle Walk-In‑Eingabe in der App (Englisch, Pill-Datepicker)

---

## 4 · Run Sheet (60 Min)

### 0:00 – 0:05 · Begrüssung & Anker setzen
"Heute machen wir es scharf. Ab heute Abend übernimmt Lisa deine Anrufe. Du verpasst keine Reservierung mehr."
**Fragen abklären:** Hat Paul schon Reservierungen für die nächsten Tage händisch im Kalender? → Wir tragen sie gleich gemeinsam in der App ein.

### 0:05 – 0:20 · Swisscom-Rufweiterleitung [Live-Blocker]
Pauls Pub-Nummer: **044 722 20 62**
Ziel: alle Anrufe → `+41 44 505 48 18` (Lisa)

1. Login `swisscom.ch/login` mit Pauls Credentials
2. Festnetz → Rufweiterleitung → "Sofort weiterleiten"
3. Zielnummer eintragen: `+41 44 505 48 18`
4. Speichern → Bestätigung warten
5. **Sofort-Test:** Founder-Handy ruft `044 722 20 62` an → Lisa muss antworten → ✅
6. Falls nicht: Hotline `0800 800 800` mit Paul gemeinsam, "Sofort‑Stellvertretung auf +41 44 505 48 18"

> Wenn Paul "wenn besetzt + nicht beantwortet" bevorzugt statt "sofort": auch ok. **Klären:** Was will er für Anfang? → Empfehlung: erstmal "sofort" für sauberen Test, kann später flexibel werden.

### 0:20 – 0:30 · App auf Pauls Handy installieren
**iPhone (Safari):**
1. URL eintippen: `flowsight.ch/ops/app/bigben-pub`
2. Teilen-Symbol → "Zum Home‑Bildschirm hinzufügen"
3. Name "Big Ben Pub" bestätigen → App-Icon erscheint
4. Tap → öffnet Login → Pauls E-Mail eintippen → 6-stelligen Code aus Mail eingeben → Dashboard sichtbar ✅

**Android (Chrome):** identisch, Drei-Punkte-Menü → "App installieren"

> Push-Permission *jetzt* erlauben, sonst kommen keine Reservation-Alerts. Nochmal explizit zeigen wo das im Browser steht.

### 0:30 – 0:45 · App-Walkthrough (mit Paul am Handy, du daneben)
Reihenfolge — **immer**: zeigen → Paul drückt selber → Effekt zeigen.

1. **Dashboard** — Heutige Reservations, Events, Sports, Walk-In-Stats
2. **Reservations** — Tap auf "↻ Refresh calls" oben rechts → Liste lädt. Auf Pending tap, Confirm/Decline-Buttons.
3. **+ Add reservation** (Walk-In) — Pill-Datepicker, Time, Guests, Name. "Save reservation · Wed 29 Apr 19:30" Button-Preview.
4. **Events** — Karaoke Fr / Quiz Mi / Live Music Sa schon vorgeschlagen. Paul fügt eine eigene Show ein, speichert.
5. **Guest Watch** — No-Show-Tracking. Yellow Card bei 1×, Red Card ab 2× innerhalb 90 Tagen.
6. **Bookings Analytics** — 7-Tage-Trend Walk-In/Phone/Online.

### 0:45 – 0:55 · End-to-End-Test mit echtem Anruf
1. **Founder ruft Pauls Pub-Nummer 044 722 20 62 an**
2. Anruf landet via Forward bei Lisa → Begrüssung "Hi, Lisa here from Big Ben Pub..."
3. Skript durchspielen: "I'd like to book a table tomorrow at 19:00, name Test, 4 people."
4. Lisa bestätigt mit Datum + Zeit + Personenzahl, "Paul will confirm shortly."
5. Auflegen, in Pauls App **Reservations**-Tab refresh (oder 30s warten – Auto-Sync läuft)
6. Reservation erscheint mit Status "Pending" + Push-Notification auf Pauls Handy
7. **Paul drückt Confirm ✓** → Test-Handy bekommt SMS: "Confirmed! Your table at Big Ben Pub, Tuesday, 29 April at 19:00 for 4 guests..."
8. ✅ Vollkreis geschlossen

> Wenn Reservation nicht in App nach 30s: "↻ Refresh calls" tappen. Wenn auch das nicht hilft: in Vercel-Logs nach `bigben_reservation` greppen.

### 0:55 – 1:00 · Übergabe & Q&A
- **Handout** drucken / per WhatsApp schicken: `docs/customers/bigben-pub/handout-paul.md`
- Founder-Notfallnummer auf Whiteboard / Post-It bei Paul
- Tag‑7-Check-in vereinbaren (06.05.)

---

## 5 · 5 Fragen, die Paul beantworten muss bevor du gehst

Eine pro Hand zählen — nicht weglassen, sonst kommt es als Bug zurück:

1. **Forwarding-Modus** "Sofort" oder "wenn nicht beantwortet"? → was wir live geschaltet haben passt für ihn?
2. **Wieviele Wochentage Karaoke / Quiz / Live Music?** Stimmt Mi / Fr / Sa? Andere? → falls anders, gleich in App eintragen.
3. **Welche Events sind die nächsten 14 Tage geplant?** → gemeinsam in App eintragen, Lisa weiss sie ab nächstem Cron-Lauf.
4. **Sollen wir täglich um 15:00 eine Tageszusammenfassung per SMS schicken?** (Reservations heute Abend) — opt‑in.
5. **Custom Domain `bigbenpub.ch`?** → wenn ja, wir setzen auf, ~15 CHF/Jahr.

---

## 6 · Hand-Over-Pack für Paul (was er nach dem Termin hat)

- ✅ App auf Home-Screen, eingeloggt
- ✅ Push-Notifications aktiv
- ✅ E-Mail vom OTP-Login (für Wiederlogin)
- ✅ Pub-Telefon weitergeleitet
- ✅ Handout (PDF oder WhatsApp-Link) — was er sieht / was tun bei Fragen
- ✅ Founder-Direktnummer (Notfälle, 24/7 erste 2 Wochen)
- ✅ Erste echte Reservation (Test) bestätigt im System

---

## 7 · Wenn live etwas bricht (60-Sekunden-Cheat)

| Symptom | Erste Aktion | Falls das nicht hilft |
|---|---|---|
| Lisa antwortet nicht | Retell-Dashboard: Agent published? | `gh workflow run "BigBen Voice Daily Refresh"` (manueller Re-publish) |
| Lisa sagt falsches Datum | `gh workflow run "BigBen Voice Daily Refresh"` | Retell-JSON in `retell/exports/bigben-pub_agent.json` direkt patchen + `bigben_publish.mjs` |
| Reservation kommt nicht in App | "↻ Refresh calls" Button tappen | Retell-Dashboard: war der Call analysed? Custom-Analysis-Felder gefüllt? |
| Push kommt nicht | iOS: Settings → Big Ben Pub → Notifications | Service-Worker reset: App komplett deinstallieren + neu installieren |
| App lädt nicht / weiße Seite | Hard-Reload (3-Finger-Tap auf iOS / langes Tappen auf Symbol → Schliessen → Neu öffnen) | Inkognito-Browser zur Verifikation, dann installierte App löschen + neu |
| SMS kommt nicht beim Confirm | Vercel-Logs `bigben_reservation_update` greppen | Twilio-Console: `+41 76 4458942` Outbound-Status |

---

## 8 · Day 1–7 (Founder-Aufgaben nach Pauls Termin)

| Tag | Aufgabe | Wo |
|---|---|---|
| 1 (29.04. abends) | Erste echte Reservierung von Pub-Gast verifizieren in DB | Vercel-Logs + `pub_reservations` Tabelle |
| 2 (30.04.) | Morning Report 07:30 UTC checken | Telegram |
| 3-7 | Daily: Voice-Cron-Bestätigung in Telegram (07:13 CEST) | passive |
| 7 (06.05.) | Anruf bei Paul: "Wie läuft's? Was nervt? Was fehlt?" | Telefon ~15 Min |
| 7 (06.05.) | Lessons-Learned-Update in `docs/customers/lessons-learned.md` | git commit |

---

## 9 · Painpoint-Antworten (kopierbereit, falls Paul fragt)

> **"Was, wenn Lisa was Falsches sagt?"**
> "Ruf mich kurz an oder schreib WhatsApp — ich pushe ein Update meist innerhalb 30 Min, sonst spätestens am nächsten Morgen. Lisa wird täglich automatisch auf den aktuellen Tag und deine Events updated."

> **"Was, wenn die App nicht funktioniert?"**
> "Du hast einen Browser-Link als Backup — `flowsight.ch/ops/app/bigben-pub` öffnest du im Safari/Chrome und bist drin. Die App ist nur eine Hülle drumherum."

> **"Was kostet mich das im Monat?"**
> [Pauls Tarif einsetzen — siehe `tenant_config.json`. Im Zweifel: "Pauschal CHF X / Monat, kein Zähler, keine Lock-in-Vertrag."]

> **"Wer hört meine Anrufe ab?"**
> "Niemand — Recordings sind aus. Lisa transkribiert und löscht. Nur Anrufzeit + Telefonnummer + extrahierte Reservation-Daten landen in deinem System."

> **"Was passiert wenn ich kündigen will?"**
> "Anruf, Mail, WhatsApp — sofort wirksam. Forwarding zurückdrehen dauert 2 Min auf swisscom.ch."

---

## 10 · Notfall-Kontakte (für die Hosentasche heute)

- **Paul:** WhatsApp / Pub direkt **044 722 20 62**
- **Founder:** [aktuelle Founder-Nummer]
- **Swisscom-Hotline:** **0800 800 800**
- **Retell-Dashboard:** dashboard.retellai.com
- **Vercel-Status:** vercel.com/status

---

**Update-History**
- 2026-04-29 (heute) · CC · Initial-Version, abgeleitet von `live_setup_29_04.md` mit allen Bug-Fixes vom Vortag
