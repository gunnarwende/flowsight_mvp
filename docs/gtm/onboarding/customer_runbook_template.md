# Customer Onboarding Run Sheet — TEMPLATE

> Pro Kunde: dieses Template kopieren nach
> `docs/customers/<slug>/onboarding_<slug>.md` und alle `<...>` Platzhalter ersetzen.
> Die FB-Nummern der goldenen Regeln referenzieren `lessons_learned.md`.
>
> **Druck-Empfehlung:** 2 Seiten Querformat, ODER als Notes auf dem Handy
> beim Termin geöffnet. NICHT scrollen während du mit dem Kunden sprichst —
> alle 60-Min-Schritte sollen in einem Screen sichtbar sein.

---

# <Pub Name> — Onboarding Run Sheet
**<Kontaktperson> · <Pub Name> · <Adresse>**
**Termin: <YYYY-MM-DD> · ~60 Min · Founder + <Kontaktperson> vor Ort**

> **Eine Aufgabe heute:** <Kontaktperson> verlässt das Treffen mit einem
> funktionierenden System. Voice nimmt Anrufe ab, App ist installiert, die erste
> echte Reservierung läuft durch — alles getestet vor seinen Augen.

---

## 1 · 5 Min vor dem Klingeln (Founder, allein)

Alle vier müssen ✓ sein. Wenn einer rot: **vorher fixen**.

| Check | Wie | Erwartung |
|---|---|---|
| Voice live mit korrektem Datum | `<+41 ...>` anrufen, "What's today's date?" | Lisa: "<heutiges Datum>" |
| Website live | `https://flowsight.ch/<slug>` öffnen | Hero lädt, Forms in <Sprache> |
| App live | `https://flowsight.ch/ops/app/<slug>` auf eigenem Handy | OTP-Login geht, Dashboard sichtbar |
| Telegram-Cron-Bestätigung von <HH:MM CEST> | Telegram öffnen | "✓ <Tenant> voice refreshed · today: ..." |

---

## 2 · Was <Kontaktperson> mitbringt

| Was | Status | Falls offen |
|---|---|---|
| <Kunde>s Handy entsperrt | erforderlich | warten bis verfügbar |
| <Anbieter>-Forwarding-Login | erforderlich | <Anbieter>-Hotline als Backup |
| <Kunde>s geschäftliche E-Mail | erforderlich | für OTP-Code-Empfang |
| GBP-Zugriff | nice-to-have | später per Mail nachreichen |
| 2-3 echte Fotos | nice-to-have | per WhatsApp nachreichen |

---

## 3 · Was schon steht (für Kundenvertrauen)

Sag direkt am Anfang in einem Satz:
> "Bevor wir reingehen — alles ist schon scharf geschaltet, das letzte Stück ist
> nur noch deine Telefon-Weiterleitung und dein Handy."

Konkret bereits live:

- Voice-Agent **<Lisa-Name>** auf `<Telefonnummer>` (<Sprachen>)
- Tagesaktualisierung läuft automatisch 3× täglich (<Cron-Zeiten>) mit Verifikation + Telegram-Alert bei Fehler
- Website `flowsight.ch/<slug>`
- App `/ops/app/<slug>` mit <Modulen>
- Reservation läuft nur via SMS-Bestätigung NACH Confirm — keine Auto-Confirms
- Manuelle Walk-In-Eingabe in der App in <Sprache>, mit Pill-Datepicker

---

## 4 · Run Sheet (60 Min)

### 0:00 – 0:05 · Begrüssung & Anker setzen
"Heute machen wir es scharf. Ab heute Abend übernimmt <Voice-Name> deine Anrufe."
**Frage:** Hat <Kunde> schon Reservierungen für die nächsten Tage händisch im Kalender? → Wir tragen sie gleich gemeinsam in der App ein.

### 0:05 – 0:20 · Telefon-Weiterleitung [Live-Blocker]
<Kunde>s Pub-Nummer: **<Telefonnummer>**
Ziel: alle Anrufe → `<+41 ...>` (<Voice-Name>)

1. Login `<Anbieter-URL>` mit <Kunde>s Credentials
2. Festnetz → Rufweiterleitung → "Sofort weiterleiten"
3. Zielnummer eintragen: `<+41 ...>`
4. Speichern → Bestätigung warten
5. **Sofort-Test:** Founder-Handy ruft `<Pub-Nummer>` an → Voice-Agent muss antworten → ✅
6. Falls nicht: Hotline `<Anbieter-Hotline>`

### 0:20 – 0:30 · App auf Kundengerät installieren
**iPhone (Safari):** URL `flowsight.ch/ops/app/<slug>` → Teilen → Zum Home-Bildschirm → Login mit OTP-Code

**Android (Chrome):** Drei-Punkte → "App installieren" → Login mit OTP-Code

> Push-Permission *jetzt* erlauben, sonst kommen keine Alerts.

### 0:30 – 0:45 · App-Walkthrough
Reihenfolge — **immer**: zeigen → Kunde drückt selber → Effekt zeigen.

1. **Dashboard** — heutige Übersicht
2. **Reservations** — Refresh, Pending-Confirm/Decline, Walk-In-Quick-Add
3. **Events** — falls Pub-Modul: wiederkehrende Events, Sport-Cards
4. **Guest Watch** — falls Pub-Modul: No-Show-Tracking
5. **Bookings Analytics** — falls Pub-Modul: 7-Tage-Trend

### 0:45 – 0:55 · End-to-End-Test mit echtem Anruf
1. Founder ruft <Pub-Nummer> an
2. Voice-Agent antwortet via Forwarding
3. Kompletter Reservierungsdialog (Test-Daten)
4. Auflegen → in Kunden-App **Reservations** Tab → erscheint binnen 30s
5. **Kunde drückt Confirm ✓** → Test-Handy bekommt SMS
6. ✅ Vollkreis geschlossen

### 0:55 – 1:00 · Übergabe & Q&A
- Handout drucken / WhatsApp: `docs/customers/<slug>/handout-<kunde>.md`
- Founder-Notfallnummer notiert
- Tag-7-Check-in vereinbart (<Datum + 7>)

---

## 5 · 5 Pflicht-Fragen vor dem Gehen

Eine pro Hand zählen — nicht weglassen:

1. **<Sub-Frage 1 — kunde-spezifisch>**
2. **<Sub-Frage 2 — z.B. Event-Tage>**
3. **<Sub-Frage 3 — z.B. nächste Events 14 Tage>**
4. **<Sub-Frage 4 — z.B. Daily Summary opt-in>**
5. **<Sub-Frage 5 — z.B. Custom Domain?>**

---

## 6 · Hand-Over-Pack

- ✅ App auf Home-Screen, eingeloggt
- ✅ Push-Notifications aktiv
- ✅ E-Mail vom OTP-Login dokumentiert
- ✅ Telefon weitergeleitet
- ✅ Handout (PDF / WhatsApp-Link)
- ✅ Founder-Direktnummer
- ✅ Erste Test-Reservierung confirmed im System

---

## 7 · 60-Sekunden-Cheat (wenn live etwas bricht)

| Symptom | Erste Aktion | Falls das nicht hilft |
|---|---|---|
| Voice antwortet nicht | Retell-Dashboard: Agent published? | `gh workflow run "<Tenant> Voice Daily Refresh"` |
| Voice sagt falsches Datum | `gh workflow run "<Tenant> Voice Daily Refresh"` | JSON in `retell/exports/<slug>_agent.json` direkt patchen + Publish |
| Reservation kommt nicht in App | "↻ Refresh calls" Button tappen | Retell-Dashboard: war der Call analysed? |
| Push kommt nicht | iOS: Settings → App → Notifications | Service-Worker reset: App neu installieren |
| App lädt nicht / weiße Seite | Hard-Reload | Browser-Cache vollständig leeren |
| SMS kommt nicht beim Confirm | Vercel-Logs greppen | SMS-Provider-Console prüfen |

---

## 8 · Day 1–7 (Founder-Aufgaben)

| Tag | Aufgabe | Wo |
|---|---|---|
| 1 abends | Erste echte Reservation in DB verifizieren | Vercel-Logs + DB |
| 2 | Morning Report 07:30 UTC checken | Telegram |
| 3-7 | Daily: Voice-Cron-Bestätigung | Telegram, passiv |
| 7 | Anruf bei <Kunde>: "Wie läufts? Was nervt? Was fehlt?" | Telefon ~15 Min |
| 7 | Lessons-Learned in `docs/gtm/onboarding/lessons_learned.md` | git commit |

---

## 9 · Painpoint-Antworten (kopierbereit)

> **"Was, wenn die KI was Falsches sagt?"**
> "Ruf mich kurz an oder schreib WhatsApp — Update meist 30 Min, sonst nächster Morgen. Voice wird täglich automatisch aktualisiert."

> **"Was, wenn die App nicht funktioniert?"**
> "Browser-Link als Backup — `flowsight.ch/ops/app/<slug>` im Safari/Chrome öffnen, du bist drin. App ist nur eine Hülle."

> **"Wer hört meine Anrufe ab?"**
> "Niemand — Recordings sind aus. KI transkribiert und löscht. Nur Anrufzeit + Telefonnummer + extrahierte Daten landen im System."

> **"Was passiert wenn ich kündigen will?"**
> "Anruf, Mail, WhatsApp — sofort. Forwarding zurückdrehen 2 Min."

---

## 10 · Notfall-Kontakte

- **<Kunde>:** WhatsApp / Pub direkt **<Telefonnummer>**
- **Founder:** [aktuelle Founder-Nummer]
- **<Provider>-Hotline:** **<Hotline-Nummer>**
- **Retell-Dashboard:** dashboard.retellai.com
- **Vercel-Status:** vercel.com/status

---

**Update-History**
- <YYYY-MM-DD> · CC · Initial-Version aus `customer_runbook_template.md` für `<slug>`
