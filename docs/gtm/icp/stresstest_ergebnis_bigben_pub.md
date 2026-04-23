# BigBen Pub — E2E Stress Test Results

**Datum:** 2026-04-15
**Tester:** CC (automatisierte Code-Analyse, kein Live-Test)
**Kontext:** Founder trifft Paul MORGEN (16.04.). Erster zahlender Kunde (Barter-Deal).
**Methode:** Vollstaendige Code-Analyse aller relevanten Dateien, Szenarien-Simulation, Edge-Case-Pruefung.

---

## Zusammenfassung

| Kategorie | CRITICAL | HIGH | MEDIUM | LOW |
|-----------|----------|------|--------|-----|
| Sprache / i18n | 2 | 3 | 2 | 0 |
| Voice Agent | 1 | 2 | 1 | 0 |
| Reservation Flow | 0 | 2 | 2 | 1 |
| Event Management | 0 | 1 | 2 | 0 |
| Website | 0 | 0 | 2 | 1 |
| Dashboard | 0 | 1 | 1 | 0 |
| Data / Docs | 0 | 1 | 1 | 1 |
| **TOTAL** | **3** | **10** | **11** | **3** |

---

## 1. Event Management

### 1.1 Add Champions League Match (next Tuesday)
**Status:** FUNKTIONIERT
- Paul oeffnet /ops/events, waehlt Tab "Sport", klickt "+ New Match"
- Formular: Titel, Datum (Date-Picker), Uhrzeit (Time-Picker), Beschreibung (optional)
- Speichert via POST /api/bigben-pub/events, refresh zeigt neuen Eintrag

### 1.2 Edit existing event (wrong time)
**Status:** FUNKTIONIERT
- Inline-Edit via Stift-Icon direkt in der Eventliste
- PATCH /api/bigben-pub/events/[id] — erlaubt title, event_date, event_time, description, category
- Wird korrekt via `updated_at` getrackt

### 1.3 Delete cancelled event
**Status:** FUNKTIONIERT (Soft-Delete)
- Papierkorb-Icon → DELETE /api/bigben-pub/events/[id]
- Setzt `is_active = false` (kein harter Loeschvorgang)
- Event verschwindet sofort aus der Ansicht (Query filtert `is_active = true`)

### 1.4 Past events cleanup
**Status:** AUTOMATISCH GELOEST
- Events-Seite (/ops/events): Laedt nur `event_date >= today` (naechste 60 Tage)
- Dashboard: Laedt nur `today` und `> today` bis +7 Tage
- Website-API: Laedt nur `>= today` bis +21 Tage
- **Vergangene Events verschwinden automatisch aus allen Ansichten.**

### 1.5 Events auf der Public Website
**Status:** FUNKTIONIERT
- DynamicEvents Component fetcht `/api/bigben-pub/events?days=21`
- 2-Spalten-Layout: Sport links, Events rechts
- Erste 3 Events pro Spalte sichtbar, Rest via "+X more" Button
- Smart Emoji basierend auf Titel-Keywords (rugby, F1, karaoke, quiz, etc.)

### F1 — Placeholder-Text in Event-Formular ist Deutsch
**Severity:** HIGH
**Problem:** Im Event-Manager steht `placeholder="z.B. Premier League: Arsenal vs. Chelsea"` und `placeholder="z.B. Quiz Night"`. Paul spricht NUR Englisch. "z.B." ist Deutsch.
**Datei:** `src/web/app/ops/(dashboard)/events/EventManager.tsx`, Zeile 157
**Fix:** Ersetzen mit `"e.g. Premier League: Arsenal vs. Chelsea"` / `"e.g. Quiz Night"`
**CC kann fixen:** JA, 2 Minuten

---

## 2. Reservation Flow (Customer Perspective)

### 2.1 Customer calls +41445054818
**Status:** TEILWEISE — siehe Voice Agent Sektion (Szenario 6)
- Lisa nimmt den Anruf entgegen, sammelt: Name, Phone, Date, Time, Party Size
- Lisa sagt: "Paul will confirm shortly."
- **ABER: Es gibt KEINEN Mechanismus, der die Reservierung aus dem Anruf in die DB schreibt.**

### F2 — Voice-to-DB Integration fehlt
**Severity:** HIGH
**Problem:** Lisa sammelt Reservierungsdaten im Gespraech, aber `general_tools: []` ist leer. Es gibt kein Tool, das die Reservierung in die Datenbank schreibt. Lisa "notiert" die Reservierung nur verbal — sie landet NICHT in pub_reservations.
**Konsequenz:** Paul sieht Telefon-Reservierungen NICHT in seiner App. Er muesste sie manuell eintragen.
**Status-Doc sagt:** "Voice -> DB-Integration (Reservierung aus Anruf direkt in DB)" steht unter "Naechste Schritte"
**CC kann fixen:** NEIN (erfordert Retell Tool-Integration + Webhook, ist als Feature geplant)

### 2.2 Website Reservation Flow
**Status:** FUNKTIONIERT E2E
1. Kunde fuellt Formular aus (Name, Phone, Date, Time, Guests, Note)
2. POST /api/bigben-pub/reserve → Speichert in DB (status=pending)
3. SMS an Gast: "Your reservation request at Big Ben Pub: [Details]. Paul will confirm shortly."
4. Paul sieht Reservierung im Dashboard (amber Pending-Badge)
5. Paul klickt Confirm → PATCH /api/bigben-pub/reservations/[id] → SMS an Gast: "Your table is confirmed"
6. Paul klickt Decline → SMS an Gast: "Sorry — we're fully booked. Call 044 680 17 77"

### 2.3 Walk-in Flow
**Status:** FUNKTIONIERT
- /ops/reservations → "+ Add Reservation" Button
- Formular mit Label "Walk-in / Phone"
- Name (Pflicht), Phone (optional), Date, Time, Guests (Dropdown 1-20), Note
- Speichert mit `source: "manual"` und `phone: "—"` wenn kein Telefon angegeben
- SMS wird uebersprungen wenn phone = "—"

### F3 — Kein SMS an Paul bei neuer Reservierung
**Severity:** HIGH
**Problem:** In `/api/bigben-pub/reserve/route.ts` Zeile 80: `// No SMS to Paul — he sees new reservations via badge in his app.` Aber Push-Notifications sind noch NICHT implementiert (siehe F10). Paul bekommt KEINE aktive Benachrichtigung wenn eine neue Reservierung reinkommt. Er muss die App aktiv oeffnen.
**Konsequenz:** Paul ("faul") koennte Reservierungen verpassen, besonders ausserhalb der Oeffnungszeiten.
**CC kann fixen:** TEILWEISE (SMS an Paul = schnell machbar, Push = aufwendiger)

### F4 — Keine Kapazitaetsbegrenzung
**Severity:** MEDIUM
**Problem:** Es gibt keine Kapazitaetspruefung. 3 Reservierungen fuer Samstag 19:00 mit je 6 Personen = 18 Gaeste. Paul hat ~40 Plaetze. Kein System warnt bei Ueberbuchung.
**Konsequenz:** Paul muss manuell pruefen ob noch Platz ist. Bei "faul" = Risiko von Ueberbuchung.
**CC kann fixen:** NEIN fuer morgen (Feature-Request, erfordert Kapazitaets-Konfiguration)

### F5 — Reservation Form erlaubt Montag-Buchungen
**Severity:** MEDIUM
**Problem:** Das Website-Reservierungsformular (`ReservationForm.tsx`) hat `min={tomorrow}` als einzige Einschraenkung. Kunden koennen fuer Montag buchen — der Tag an dem das Pub geschlossen ist.
**CC kann fixen:** JA (Date-Validierung oder Hinweis im Formular, ~30 Min)

### F6 — "9+ (call us)" im Website-Formular speichert "9+" als Guests-Wert
**Severity:** LOW
**Problem:** Wenn ein Kunde "9+ (call us)" waehlt, wird `parseInt("9+", 10)` = 9 gespeichert. Kein Anruf-Hinweis fuer Paul. Aber: Das ist ein Edge Case und Paul sieht die Party Size.
**CC kann fixen:** JA (niedrige Prioritaet)

---

## 3. Dashboard — Paul's Morning Check

### 3.1 Paul oeffnet um 10:00
**Status:** FUNKTIONIERT GUT
- Dashboard zeigt: Heute-Datum (formatiert en-GB: "Wednesday, 16 April 2026")
- 3 Kacheln: Events (heute), Bookings (heute), Guests (Summe Party Size)
- Darunter: heutige Events mit Emoji + Zeit
- Darunter: heutige Reservierungen mit Zeit, Name, Party Size, Status
- "Coming Up" Section: naechste 7 Tage Events + Reservierungen
- Ganz unten: Link "Your Website" → flowsight.ch/bigben-pub

### F7 — Datum-Formatierung in Dashboard/Events ist "de-CH"
**Severity:** CRITICAL
**Problem:** In PubDashboard.tsx (Zeile 53) und EventManager.tsx (Zeile 19-20): `toLocaleDateString("de-CH", ...)`. Dies erzeugt deutsche Wochentage/Datumsformate: "Di 15.04" statt "Tue 15/04". Paul versteht NUR Englisch.
**Dateien:**
- `src/web/app/ops/(dashboard)/pub-dashboard/PubDashboard.tsx` Zeile 53
- `src/web/app/ops/(dashboard)/events/EventManager.tsx` Zeilen 19-20
**Einzige Ausnahme:** Dashboard-Header-Datum ist korrekt `en-GB` (Zeile 111-112)
**CC kann fixen:** JA, 5 Minuten (Locale von "de-CH" auf "en-GB" aendern)

### F8 — Reservierungen zeigen "Heute" / "Morgen" auf Deutsch
**Severity:** CRITICAL
**Problem:** In `ReservationManager.tsx` Zeilen 40-41: `if (iso === today) return "Heute"; if (iso === tomorrow) return "Morgen";` Paul versteht "Heute" und "Morgen" NICHT.
**Datei:** `src/web/app/ops/(dashboard)/reservations/ReservationManager.tsx`
**CC kann fixen:** JA, 2 Minuten (aendern zu "Today" / "Tomorrow")

### F9 — "Pers." statt "guests" in Dashboard + Reservierungen
**Severity:** HIGH
**Problem:** An 3 Stellen wird `{r.party_size} Pers.` angezeigt. "Pers." ist die deutsche Abkuerzung fuer "Personen". Paul versteht das nicht.
**Dateien:**
- `PubDashboard.tsx` Zeilen 130, 204
- `ReservationManager.tsx` Zeile 218
**CC kann fixen:** JA, 3 Minuten (aendern zu "guests")

### F10 — pendingReservations Badge ist hardcoded 0
**Severity:** HIGH
**Problem:** In `layout.tsx` Zeile 83: `pendingReservations={0}`. Der Badge-Count fuer ausstehende Reservierungen im Nav wird NIE aus der DB geladen. Paul sieht KEINEN Badge am "Reservations" Nav-Item.
**Datei:** `src/web/app/ops/(dashboard)/layout.tsx`
**CC kann fixen:** JA, 15 Minuten (DB-Query + Count weiterreichen)

### F11 — Reservierungen: Datum-Formatierung "de-CH"
**Severity:** HIGH (selbes Problem wie F7)
**Problem:** `ReservationManager.tsx` Zeile 42: `toLocaleDateString("de-CH", ...)` erzeugt "Di 15.04" statt "Tue 15/04".
**CC kann fixen:** JA, zusammen mit F7

---

## 4. OpsShell / Navigation — German Leftovers

### F12 — Sidebar zeigt "Leitsystem" unter dem Firmennamen
**Severity:** MEDIUM
**Problem:** `OpsShell.tsx` Zeile 202: `<span>Leitsystem</span>` wird unter dem Tenant-Namen angezeigt. Paul sieht "Big Ben Pub" + darunter "Leitsystem" (Deutsch). Er versteht das nicht.
**CC kann fixen:** JA, 2 Minuten (conditional: isPubTenant ? "Dashboard" : "Leitsystem")

### F13 — Logout-Dialog ist komplett Deutsch
**Severity:** CRITICAL (Paul kann sich nicht abmelden ohne Hilfe)
**Problem:** OpsShell.tsx Zeilen 285-318:
- "Nach Abmeldung ist ein neuer E-Mail-Code noetig." (Deutsch)
- "Ja, abmelden" (Deutsch)
- "Abbrechen" (Deutsch)
- Button "Abmelden" (Deutsch)
Paul klickt versehentlich auf Logout und versteht keinen der Texte.
**CC kann fixen:** JA, 5 Minuten (conditional EN fuer Pub-Tenant oder generell i18n)

### F14 — Aria-Labels sind Deutsch
**Severity:** LOW
**Problem:** "Menue oeffnen" und "Menue schliessen" in OpsShell.tsx (Zeilen 350, 379). Screen-reader relevant, aber Paul nutzt keinen Screen-reader.
**CC kann fixen:** JA, 1 Minute

### F15 — "Rolle: Admin" / "Rolle: Techniker" Toggle ist Deutsch
**Severity:** MEDIUM
**Problem:** OpsShell.tsx Zeilen 417, 436. Nur sichtbar fuer Admin (Founder), nicht fuer Paul. Aber wenn Founder das System mit Paul zusammen anschaut, sieht Paul diese deutschen Labels.
**CC kann fixen:** JA, 2 Minuten

---

## 5. Login Flow

### F16 — Gesamte Login-Seite ist Deutsch
**Severity:** HIGH
**Problem:** LoginForm.tsx — ALLE Texte sind Deutsch:
- "Ungueltiger oder abgelaufener Link. Bitte erneut anfordern."
- "Kein Konto mit dieser E-Mail-Adresse. Bitte Admin kontaktieren."
- "Bitte X Sekunden warten und erneut versuchen."
- "Code gesendet an"
- "Anmeldung erfolgreich"
- "Weiterleitung..."
Paul muss sich per OTP einloggen. Er versteht NICHTS auf der Login-Seite.
**Datei:** `src/web/app/ops/(auth)/login/LoginForm.tsx`
**CC kann fixen:** JA, 15 Minuten (i18n oder Pub-Tenant-Detection)
**ABER:** Login-Seite hat keinen Tenant-Kontext (User ist noch nicht eingeloggt). Fix erfordert entweder URL-Parameter oder generelle Zweisprachigkeit.

### F17 — OTP aktuell auf gunnar.wende@flowsight.ch
**Severity:** HIGH
**Problem:** Laut status.md: `Staff "Paul" (admin), OTP: gunnar.wende@flowsight.ch`. Paul hat noch KEINE eigene E-Mail fuer OTP.
**Konsequenz:** Fuer die Demo morgen kann der Founder den Code ablesen und Paul eingeben lassen. Aber langfristig braucht Paul seinen eigenen OTP-Zugang.
**CC kann fixen:** NEIN (erfordert Pauls E-Mail-Adresse, Founder-Action)

---

## 6. Voice Agent (Lisa EN)

### 6.1 Agent-Konfiguration
- **Name:** "BigBen Pub EN"
- **Stimme:** 11labs-Adrian (maennlich, EN-GB)
- **Sprache:** en-GB
- **Greeting:** "Hi, Big Ben Pub — how can I help you?"
- **Ambient Sound:** coffee-shop (Volume 0.6) — guter Pub-Effekt
- **LLM:** gpt-4o-mini (schnell, kosteneffizient)
- **Max Call Duration:** 5 Minuten (300s)
- **End after silence:** 15 Sekunden

### 6.2 Event-Wissen
**Status:** PROBLEMATISCH

### F18 — Voice Agent hat KEINE aktuellen Events
**Severity:** CRITICAL (fuer die Demo)
**Problem:** Der Agent-Prompt enthaelt `{{upcoming_events}}` als Platzhalter. Aber:
1. Es gibt KEINE Retell-Variable die diesen Platzhalter fuellt
2. `general_tools: []` — kein API-Call-Tool konfiguriert
3. Kein Cron-Job der den Prompt taeglich aktualisiert
**Konsequenz:** Wenn ein Kunde fragt "What's on this weekend?" oder "Do you show the Champions League?", hat Lisa KEINE Antwort. Der Platzhalter `{{upcoming_events}}` wird wahrscheinlich als Leerstring gerendert.
**CC kann fixen:** TEILWEISE
- Quick-Fix: Events manuell in den Prompt hardcoden (10 Min, aber nicht skalierbar)
- Richtig: Retell Custom Tool / taeglich aktualisierter Prompt via Cron (aufwendiger)

### 6.3 Sprachszenarien

| Frage | Erwartete Antwort | Status |
|-------|-------------------|--------|
| "Do you show the Champions League?" | Antwort basierend auf Events | BROKEN (F18) |
| "Can I book a table for 8?" | Sammelt Name, Phone, Date, Time, Party Size | OK (verbal) |
| "What's your address?" | "Alte Landstrasse 20, 8942 Oberrieden" | OK |
| "Do you have live music this weekend?" | Antwort basierend auf Events | BROKEN (F18) |
| "How much is a Guinness?" | Deflect: "Pints start around 7 francs..." | OK |
| "What time do you open?" | Oeffnungszeiten aus Prompt | OK |

### 6.4 Deutsch-Anrufer

### F19 — Kein deutscher Transfer-Agent
**Severity:** HIGH
**Problem:** Der Prompt sagt: "If someone speaks German: Say 'Natuerlich, einen Moment bitte' and transfer to the German agent." Aber:
1. Es gibt NUR `bigben-pub_agent.json` — kein `_intl.json` oder `_de.json`
2. `general_tools: []` — kein Transfer-Tool konfiguriert
3. Kein `is_transfer_cf` oder Transfer-Node im Agent
**Konsequenz:** Lisa sagt "Natuerlich, einen Moment bitte" aber der Transfer geht ins Leere. Der Anrufer wartet vergeblich oder wird nach 15s Stille abgeworfen.
**Oberrieden = Zuerich-Vorort:** Ein grosser Teil der Anrufer wird Deutsch sprechen!
**CC kann fixen:** NEIN fuer morgen (erfordert 2. Agent + Retell Transfer-Setup)
**Workaround:** Prompt aendern: Statt Transfer → Lisa antwortet auf Deutsch so gut wie moeglich ("I'll do my best in German. Wie kann ich Ihnen helfen?")

---

## 7. Website Public View

### 7.1 Gesamteindruck
**Status:** SEHR GUT
- Dark Theme (Holz/Braun #1e1611) — sieht nach echtem Pub aus, nicht nach Template
- Full EN/DE Toggle oben rechts
- Hero mit Pub-Interior, "Book a Table" + "See the Menu" CTAs
- Dynamic Events (2-Spalten), Menu, Reviews (6 echte Google Reviews), Gallery, Reservierung, Map
- Footer: Instagram, Adresse, "Website by FlowSight"

### 7.2 Events-Darstellung
**Status:** FUNKTIONIERT
- Fetcht dynamisch von `/api/bigben-pub/events?days=21`
- Erste 3 pro Kategorie sichtbar, "+X more" Button
- Smart Emojis (Fussball, Rugby, F1, Karaoke, Quiz, Musik)
- Falls keine Events: "No matches scheduled yet."

### F20 — Oeffnungszeiten-Diskrepanz: Website vs. Voice Agent
**Severity:** MEDIUM
**Problem:** Verschiedene Quellen zeigen verschiedene Zeiten:
- **Website (BigBenContent.tsx):** Fr-Sa 16:00-00:00, So 16:00-22:00, Mi 16:00-23:00
- **Voice Agent Prompt:** Mi 16:00-23:30, Fr 16:00-00:30, Sa 14:00-00:30, So 14:00-22:00
- **Briefing.md:** Fr-Sa ab 16:00 (bis 00:00), So "offen", Sa 14:00 (????)
**Kritische Fragen:**
  - Samstag: Oeffnet um 14:00 oder 16:00?
  - Mittwoch: Bis 23:00 oder 23:30?
  - Freitag/Samstag: Bis 00:00 oder 00:30?
**Konsequenz:** Gast ruft an → Lisa sagt "Saturday 14:00". Gast schaut Website → sagt "Saturday 16:00". Verwirrung.
**CC kann fixen:** NEIN (erfordert Bestaetigung durch Paul/Founder welche Zeiten korrekt sind)

### F21 — "Website by FlowSight" im Footer
**Severity:** MEDIUM
**Problem:** Identity Contract R4 sagt "No FlowSight visible to end users." Der Footer zeigt "Website by FlowSight" mit Link zu flowsight.ch.
**Datei:** `BigBenContent.tsx` Zeile 597
**CC kann fixen:** JA, 1 Minute (entfernen oder in "Website by GW" aendern)
**ABER:** Koennte bewusste Marketing-Entscheidung sein (Referenz-Kunde). Founder-Entscheidung noetig.

### F22 — Gallery Bild "food_nachos.png" Referenz
**Severity:** LOW
**Problem:** Die Gallery referenziert `food_nachos.png`, aber das Bild im Public-Ordner heisst `food_nachos.png`. Datei existiert. Kein Problem — nur erwaehnt weil `docs/customers/bigben-pub/images/` ein Bild `foot nachos.png` hat (mit Leerzeichen). Die public-Version ist korrekt benannt.
**CC kann fixen:** N/A (kein Fix noetig)

---

## 8. Edge Cases

### 8.1 Paul pflegt Events 2 Wochen nicht
**Status:** KEIN PROBLEM
- Vergangene Events verschwinden automatisch (Datum-Filter)
- Website zeigt "No matches scheduled yet." / "No events scheduled yet."
- Voice Agent zeigt leere Event-Liste (aber das ist schon broken, siehe F18)
- **Risiko:** Leere Events-Sektion sieht schlecht aus. Aber: Permanent-Features (Karaoke, Quiz, Live Music) sind als statische BigEventCards IMMER sichtbar auf der Website, unabhaengig von der DB.

### 8.2 Mehrere Reservierungen gleiche Zeit
**Status:** KEIN SCHUTZ
- Kein Kapazitaetslimit, keine Warnung (siehe F4)
- Paul muss manuell pruefen

### 8.3 Voice Agent gefragt nach Events die nicht existieren
**Status:** Korrekt gehandhabt
- Prompt: "NEVER invent events or matches that aren't in the events list"
- Lisa wuerde korrekt sagen: "I don't have any specific events listed right now — best to check our Instagram @bigbenpubzh!"

### 8.4 Login Flow (OTP)
- Email ist auf Founders Adresse (F17)
- Login-Seite komplett Deutsch (F16)
- Supabase OTP-Email ist wahrscheinlich auch Deutsch (Standard-Template)

---

## 9. Integration Check

### F23 — Push-Notifications: NICHT implementiert
**Severity:** MEDIUM
**Problem:** Push-Notifications fuer neue Reservierungen stehen in den "Naechsten Schritten" (status.md). Aktuell gibt es keinen aktiven Alert-Mechanismus fuer Paul.
**CC kann fixen:** Nicht fuer morgen

### 9.1 Email-Notifications
**Status:** Keine E-Mails an Paul. Nur SMS an Gaeste. Paul bekommt KEINE Benachrichtigung (siehe F3).

### 9.2 Nav Items
**Status:** KORREKT KONFIGURIERT
- Pub-Tenant bekommt: Dashboard, Events, Reservations, Help
- "Leitzentrale", "Einstellungen", "Einsatzplanung" werden korrekt ENTFERNT
- "Support" wird zu "Help" umbenannt mit href="/ops/help"

---

## 10. Docs / Data Integrity

### F24 — links.md zeigt falsche URLs
**Severity:** MEDIUM
**Problem:** `docs/customers/bigben-pub/links.md` zeigt:
```
Website: https://flowsight.ch/kunden/bigben-pub
Links-Seite: https://flowsight.ch/kunden/bigben-pub/links
Wizard: https://flowsight.ch/kunden/bigben-pub/meldung
```
Die echte Website ist `flowsight.ch/bigben-pub` (unter /demos, nicht /kunden).
BigBen hat keinen Wizard oder Links-Seite — das sind Sanitaer-Templates.
**CC kann fixen:** JA, 2 Minuten

### F25 — status.md Telefonnummer-Diskrepanz
**Severity:** LOW
**Problem:** status.md listet zwei Telefonnummern:
- "Telefon: 044 722 20 62" (laut briefing: Weiterleitung auf Pauls Handy)
- "Pub Telefon: 044 680 17 77" (laut Voice Agent + SMS-Templates)
Welche ist die richtige Pub-Nummer? Der Voice-Agent und die SMS-Decline-Message verwenden 044 680 17 77.
**CC kann fixen:** NEIN (Founder-Bestaetigung noetig)

---

## Prioritaets-Ranking fuer morgen

### MUSS gefixt werden (blockiert Demo)
| # | Finding | Aufwand | Impact |
|---|---------|---------|--------|
| F18 | Voice Agent: Events-Platzhalter leer | 15 Min (hardcode Events) | Paul zeigt Lisa → Lisa weiss nichts |
| F7/F11 | Datum-Formatierung "de-CH" statt "en-GB" | 5 Min | Paul sieht "Di 15.04" statt "Tue 15/04" |
| F8 | "Heute"/"Morgen" statt "Today"/"Tomorrow" | 2 Min | Paul versteht nichts |
| F9 | "Pers." statt "guests" | 3 Min | Verwirrend |
| F13 | Logout-Dialog Deutsch | 5 Min | Paul kann nicht ausloggen |
| F1 | Event-Formular Placeholder Deutsch | 2 Min | "z.B." statt "e.g." |

### SOLLTE gefixt werden (macht Demo besser)
| # | Finding | Aufwand | Impact |
|---|---------|---------|--------|
| F10 | pendingReservations Badge hardcoded 0 | 15 Min | Paul sieht keinen Badge |
| F12 | "Leitsystem" unter Tenant-Name | 2 Min | Verwirrend fuer Paul |
| F3 | Kein SMS an Paul bei neuer Reservierung | 10 Min | Paul verpasst Buchungen |
| F19 | Deutsch-Transfer geht ins Leere | 10 Min (Prompt aendern) | Deutsch-Anrufer stranden |
| F24 | links.md falsche URLs | 2 Min | Nur Docs-Hygiene |

### KANN warten (nach Demo)
| # | Finding | Aufwand |
|---|---------|---------|
| F16 | Login-Seite Deutsch | 15 Min+ |
| F17 | OTP auf Founder-Email | Founder-Action |
| F20 | Oeffnungszeiten-Diskrepanz | Founder-Bestaetigung |
| F21 | "Website by FlowSight" | Founder-Entscheidung |
| F4 | Keine Kapazitaetsbegrenzung | Feature |
| F5 | Montag-Buchungen moeglich | 30 Min |
| F23 | Push-Notifications fehlen | Feature |
| F2 | Voice-to-DB fehlt | Feature |

---

## Gesamtbewertung

**Das System ist zu 80% demo-ready.** Die Kernfunktionen (Event-Pflege, Reservierungen, Website) funktionieren solide. Die kritischen Probleme sind fast ausschliesslich SPRACH-PROBLEME: Deutsche Texte in einem System fuer einen englischsprachigen Nutzer. Das sind alles schnelle Fixes (zusammen ~35 Minuten).

Der Voice Agent hat zwei ernste Luecken: Keine Events (F18) und kein Deutsch-Transfer (F19). Beides sind bekannte Limitierungen die in den "Naechsten Schritten" stehen.

**Empfehlung fuer morgen:**
1. Fix F7, F8, F9, F13, F1, F12 (alle Sprach-Fixes, ~20 Min)
2. Fix F10 (Badge Count, ~15 Min)
3. Hardcode aktuelle Events in Voice Agent Prompt (F18, ~15 Min)
4. Aendere Deutsch-Transfer zu "I'll try in German" Fallback (F19, ~10 Min)
5. Optional: SMS an Paul bei neuer Reservierung (F3, ~10 Min)

Total: ~70 Minuten fuer ein demo-bereites System.

---

## Paul's Lisa

### Telefonnummer
**+41 44 505 48 18** (umgeroutet von Brunner Demo-Nummer)

### Persona
- **Name:** Keiner. Lisa tritt als "Big Ben Pub" auf, nicht als Person.
- **Greeting:** "Hi, Big Ben Pub — how can I help you?"
- **Tonfall:** Freundlich, laessig, warm — wie ein hilfsbereiter Barkeeper, nicht wie eine Firmen-Empfangsdame.
- **Typische Phrasen:** "Sure thing!", "No worries!", "You're welcome anytime."
- **Ambient Sound:** Coffee-Shop Atmosphaere (Volume 0.6) — simuliert Pub-Hintergrund
- **Stimme:** 11labs-Adrian (maennliche, britisch klingende Stimme, en-GB)
- **LLM:** GPT-4o-mini (schnelle Antworten, kosteneffizient)

### Sprachen
- **Primaer:** Englisch (en-GB)
- **Deutsch:** Sagt "Natuerlich, einen Moment bitte" und soll zu einem deutschen Agent transferieren — **ABER Transfer funktioniert nicht** (kein DE-Agent vorhanden, kein Transfer-Tool konfiguriert). Der Anrufer wird nach 15s Stille abgeworfen.
- **Franzoesisch/Italienisch:** Beantwortet auf Englisch weiter ("I'll be happy to help in English.")

### Events die Lisa aktuell kennt
**KEINE.** Der Prompt enthaelt den Platzhalter `{{upcoming_events}}`, der nicht befuellt wird. Lisa hat keine Kenntnis ueber aktuelle Spiele oder Events. Sie wuerde bei Event-Fragen auf Instagram oder die Website verweisen.

### Was Lisa kann
- Oeffnungszeiten nennen (aus dem Prompt)
- Adresse und Anfahrt beschreiben ("Alte Landstrasse 20, 8942 Oberrieden, near the train station")
- Pub-Angebot beschreiben (Guinness, Pub Food, Darts, Terrasse, Live Sport, Events)
- Reservierungen VERBAL aufnehmen (Name, Phone, Date, Time, Party Size)
- Preis-Fragen deflecten ("Pints start around 7 francs, food from about 12 francs")
- Private Events erwaehnen ("Talk to Paul")

### Was Lisa NICHT kann
- **Events nennen:** Platzhalter leer (F18)
- **Reservierungen speichern:** Kein DB-Write-Tool (F2). Reservierung bleibt nur "im Gespraech"
- **Auf Deutsch transferieren:** Kein DE-Agent (F19)
- **Preise nennen:** Prompt verbietet spezifische Preise
- **Erfundene Events nennen:** Prompt verbietet explizit Erfindung
- **FlowSight erwaehnen:** Prompt verbietet explizit

### Limitierungen
1. Max. 5 Minuten pro Anruf (300.000ms)
2. Anruf endet nach 15s Stille
3. Keine Aufzeichnung der Gespraeche
4. Keine SMS/Benachrichtigung nach dem Anruf
5. Kein Tool-Zugriff (keine DB-Writes, keine API-Calls)
6. Event-Wissen: statisch (manuell im Prompt zu pflegen)
