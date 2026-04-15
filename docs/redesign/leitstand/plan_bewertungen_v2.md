# Bewertungen v2 — Fundierte Analyse + Plan

**Datum:** 2026-04-15
**Anlass:** Founder-Test DA-0073 + DA-0071. Mehrere Luecken entdeckt. Thema ist business-kritisch — jeder Fehler hier faellt auf den Founder zurueck.
**Feedback:** FB15-FB21

---

## 1. Ist-Zustand (was funktioniert, was nicht)

### Was FUNKTIONIERT (bestaetigt durch Founder-Test)

- **Review Surface** (FB15 + FB18): Sieht gut aus. Doerfler AG gebrandet, Auftragsblock (Leck, 8942 Oberrieden, 14.04.2026), 5 Sterne klickbar, 4 Chips, Freitextfeld, "Jetzt auf Google bewerten" Button. Das ist solide.
- **Bewertungsanfrage-Button** (FB19): Im Verlauf sichtbar mit "Noch Bewertung moeglich" Badge. Betrieb sieht WANN er anfragen kann. Das ist besser als ich dachte.
- **E-Mail kommt an** (FB16): Doerfler AG E-Mail in Outlook sichtbar. Betreff "Wie war unser Service? — Doerfler AG". Gebrandete HTML-Karte mit CTA-Button.
- **KPIs** (FB21): FlowBar zeigt Bewertungen (Ø 4.7, erhalten/angefragt). Das reicht analytisch.
- **Pre-Filter**: ≥4★ zeigt Google-Link, ≤3★ zeigt nur Feedback-Textarea. Funktioniert.

### Was NICHT funktioniert (Founder-Test beweist es)

| # | Problem | Schwere | Beweis |
|---|---------|---------|--------|
| **B1** | **24h Termin-Reminder kommt nicht** | HOCH | DA-0073: Termin 16.04. 08:30 gesetzt am 15.04. 08:25. Kein SMS/E-Mail an Kunden nach 14 Min. |
| **B2** | **SMS-Bestaetigung bei Wizard-Fall fehlt** | HOCH | DA-0073: Wizard-Fall erstellt, E-Mail kam, aber KEIN SMS obwohl Toggle aktiv (FB17) |
| **B3** | **Push-Notification bei Bewertungseingang fehlt** | MITTEL | FB18: Bewertung abgeschickt, kein Push an Betrieb |
| **B4** | **Google-Uebergang holprig** | MITTEL | FB15: Text auf FlowSight geschrieben → Google oeffnet leer → Kunde muss neu schreiben |
| **B5** | **Kein Google-Konto = Sackgasse** | MITTEL | Button "Jetzt auf Google bewerten" setzt Google-Login voraus. Was wenn Kunde keines hat? |
| **B6** | **Stammkunden-Schutz fehlt** | HOCH | Wenn Kunde 3x/Jahr beim Betrieb ist, bekommt er 3x Bewertungsanfrage. Das nervt und fuehrt zum Betriebswechsel. |
| **B7** | **Negative Bewertungen unsichtbar** | MITTEL | ≤3★ Feedback landet in DB, aber Betrieb sieht es nicht proaktiv (kein Alert, kein Badge) |
| **B8** | **E-Mail vs. SMS: Welcher Kanal?** | KLAERUNGS-BEDARF | FB16 zeigt E-Mail. SMS noch nicht getestet. Was bevorzugt der Kunde? |

---

## 2. Die zwei Perspektiven die wir PERFEKT verstehen muessen

### Perspektive KUNDE (Endkunde des Betriebs)

**Situation:** Hat gerade einen Sanitaer-Einsatz hinter sich. Dichtung repariert, Leck behoben, Heizung gewartet. Ist zufrieden (oder nicht).

**Was der Kunde WILL:**
- In Ruhe gelassen werden, ausser der Service war wirklich gut
- Wenn er bewertet: schnell, unkompliziert, 30 Sekunden maximal
- Nicht genervt werden mit wiederholten Anfragen
- Kein Account erstellen muessen (kein Google-Login-Zwang)
- Wissen dass sein Feedback ankommt (nicht ins Leere schreiben)

**Was den Kunden NERVT:**
- Bewertungsanfrage fuer einen Miniauftrag (Dichtung wechseln = 5 Min = keine Bewertung wert)
- Mehrfache Anfragen im selben Jahr ("Schon wieder die?")
- Google-Login als Pflicht ("Ich hab kein Google-Konto / will mich nicht einloggen")
- Unpersoenliche E-Mail ("Wer ist das? Spam?")
- Kein Bezug zum konkreten Einsatz ("Welcher Service?")

**Emotionale Kette (ideal):**
```
Einsatz erledigt → 1-2 Tage spaeter persoenliche SMS/E-Mail
→ "Frau Mueller, wie war unser Einsatz bei Ihnen in der Seestrasse?"
→ Klick → 5 Sterne → "Schnell & zuverlaessig" klicken → fertig (30 Sek)
→ Optional: "Moechten Sie das auch auf Google teilen?" (KEIN Zwang)
```

### Perspektive BETRIEB (Inhaber / Geschaeftsfuehrer)

**Situation:** Hat 10-50 Faelle pro Monat. Will gute Google-Bewertungen weil die direkt zu Neukunden fuehren. Hat aber keine Zeit fuer manuelles Nachfassen.

**Was der Betrieb WILL:**
- Automatisch die richtigen Kunden zur richtigen Zeit fragen
- NIE einen unzufriedenen Kunden auf Google schicken
- Sofort wissen wenn eine negative Bewertung reinkommt
- Sehen wieviele Bewertungen er hat und wie der Trend ist
- Keine Reibung mit Stammkunden (die sollen NICHT genervt werden)

**Was den Betrieb SCHADET:**
- Stammkunde wird 3x/Jahr gefragt → wechselt den Betrieb
- Unzufriedener Kunde bekommt Google-Link → 1-Stern-Bewertung oeffentlich
- Betrieb weiss nicht dass Kunde negatives Feedback gegeben hat → kein Follow-up
- Bewertungsanfrage geht raus ohne dass Betrieb es wollte (Auto-Trigger)

---

## 3. Konkrete Probleme + Loesungen

### B1: 24h Termin-Reminder kommt nicht

**Problem:** Toggle "24h Erinnerung an Kunden per SMS" ist aktiv (FB17), aber es passiert nichts.

**Root Cause:** Der Reminder braucht einen Cron-Job der taeglich alle Termine der naechsten 24h prueft und SMS/E-Mails versendet. Dieser Cron-Job existiert NICHT. Der Toggle in den Einstellungen ist ein UI-Element ohne Backend.

**Loesung:** GH Actions Cron (taeglich 07:00 UTC) → API-Route `/api/lifecycle/termin-reminder` → prueft alle Termine morgen → sendet SMS/E-Mail an Kunden mit Kontaktdaten.

**Aufwand:** 3-4h

### B2: SMS-Bestaetigung bei Wizard-Fall fehlt

**Problem:** Wizard-Fall erstellt, E-Mail kam, aber keine SMS. FB17 zeigt "SMS Bestaetigung an Kunden" ist aktiviert.

**Root Cause pruefen:** Wizard-Route (`/api/cases`) sendet E-Mail (Resend), aber moeglicherweise keine SMS. SMS wird nur bei Voice-Faellen gesendet (Post-Call SMS). Toggle in Einstellungen existiert aber Backend ignoriert ihn fuer Wizard.

**Loesung:** In `/api/cases` Route bei Wizard-Faellen pruefen ob `notify_termin_sms` aktiv ist → wenn ja, SMS-Bestaetigung senden.

**Aufwand:** 1-2h

### B3: Push bei Bewertungseingang

**Problem:** Bewertung abgeschickt (FB18), kein Push an Betrieb.

**Root Cause pruefen:** `rate/route.ts` ruft `sendOpsPush()` auf (fire-and-forget). Entweder Push nicht registriert oder Event-Type nicht korrekt.

**Loesung:** Pruefen ob Push-Subscription fuer Doerfler existiert. Wenn nicht: Push-Onboarding-Banner aktivieren. Wenn ja: Debugging des Push-Versands.

**Aufwand:** 1h

### B4: Google-Uebergang (Text nicht kopiert)

**Problem:** Kunde schreibt auf FlowSight-Surface → klickt "Jetzt auf Google bewerten" → Google oeffnet LEER → Kunde muss nochmal schreiben.

**Loesung:** Beim Klick auf "Jetzt auf Google bewerten":
1. Text aus Textarea + ausgewaehlte Chips in Clipboard kopieren (navigator.clipboard.writeText)
2. Kurze Bestaetigung: "Text in Zwischenablage kopiert! Einfach auf Google einfuegen."
3. DANN Google-Link oeffnen

**Aufwand:** 30 Min

### B5: Kein Google-Konto

**Problem:** "Jetzt auf Google bewerten" fuehrt zu Google → Login erforderlich. Nicht jeder hat ein Google-Konto (aeltere Kunden, Firmenkunden).

**Loesung:** Button-Text aendern zu: "Auf Google teilen (optional)". Darunter: "Ihre Bewertung wurde bereits gespeichert. Vielen Dank!" → klarstellen dass die interne Bewertung REICHT. Google ist ein Bonus, kein Pflicht.

**Aufwand:** 15 Min

### B6: Stammkunden-Schutz (KRITISCH)

**Problem:** Kunde hat 3 Faelle/Jahr beim selben Betrieb. Aktuell: 3x Bewertungsanfrage moeglich. Das nervt und schadet der Beziehung.

**Loesung — Stammkunden-Erkennung:**
1. Bei "Bewertung anfragen" pruefen: Hat dieser Kunde (contact_phone ODER contact_email) in den letzten 6 Monaten schon eine Bewertungsanfrage erhalten?
2. Wenn JA → Warnung an Betrieb: "Dieser Kunde wurde am [Datum] bereits um eine Bewertung gebeten. Trotzdem senden?"
3. Empfehlung im UI: "Bei Stammkunden empfehlen wir maximal 1 Bewertungsanfrage pro Jahr."

**Technisch:** Bei `request-review` API-Route: Query auf `case_events` WHERE `event_type = 'review_requested'` AND (`contact_phone = X` OR `contact_email = X`) AND `created_at > now() - 6 months` AND `tenant_id = Y`.

**Aufwand:** 2h

### B7: Negative Bewertungen sichtbar machen

**Problem:** ≤3★ Feedback landet in `review_text`, aber Betrieb sieht es nicht proaktiv.

**Loesung:**
1. Bei ≤3★: Rotes Badge im Falldetail ("Negatives Feedback erhalten")
2. Push-Notification: "Achtung: Negative Bewertung (2★) fuer Fall DA-0071"
3. In FlowBar: Negative Bewertungen als eigene Kennzahl (z.B. "1 negativ" in rot)

**Aufwand:** 2h

### B8: E-Mail vs. SMS Kanal

**Frage:** Was ist der bevorzugte Kanal fuer Bewertungsanfragen?

**Analyse:**
- **E-Mail:** Laenger, kann HTML (huebsch), Kunde kann spaeter lesen, weniger aufdringlich
- **SMS:** Kuerzer, sofort gelesen (98% Open Rate), persoenlicher, aber teurer (CHF 0.10/SMS)

**Empfehlung:** E-Mail als DEFAULT, SMS als FALLBACK (wenn keine E-Mail vorhanden). Grund:
- Bewertungsanfrage ist NICHT dringend (anders als SMS nach Voice-Call)
- E-Mail erlaubt huebschere Darstellung (Auftragsblock, CTA-Button)
- SMS-Kosten bei 50 Faellen/Monat = CHF 5/Mo extra

**Das ist bereits so implementiert.** E-Mail zuerst, SMS nur wenn E-Mail fehlt.

---

## 4. Priorisierter Umsetzungsplan

### SOFORT (blocking fuer Take 4 + Demo)

| # | Fix | Aufwand | Warum jetzt |
|---|-----|---------|-------------|
| **B4** | Google-Uebergang: Text in Clipboard kopieren | 30 Min | Take 4 zeigt Review-Flow E2E |
| **B5** | Google-Button: "optional" klarstellen | 15 Min | Vermeidet Sackgasse in der Demo |
| **B3** | Push bei Bewertungseingang debuggen | 1h | Take 4 Proof: "Betrieb sieht Bewertung sofort" |
| **B6** | Stammkunden-Schutz (6-Monate-Check + Warnung) | 2h | Geschaeftskritisch, muss von Tag 1 funktionieren |

### BALD (vor erstem echten Kunden-Trial)

| # | Fix | Aufwand | Warum |
|---|-----|---------|-------|
| **B7** | Negative Bewertungen: Rotes Badge + Push + KPI | 2h | Betrieb muss reagieren koennen |
| **B1** | 24h Termin-Reminder Cron | 3-4h | Versprechen einloesen (Take 4 erwaehnt es) |
| **B2** | SMS-Bestaetigung bei Wizard-Faellen | 1-2h | Einstellungen-Toggle muss funktionieren |

### SOFORT ERGAENZT (nach Founder-Review FB22 + Toggle-Audit)

| # | Fix | Aufwand | Warum |
|---|-----|---------|-------|
| **B9** | **Sterne aenderbar** — nach Klick auf 2★ (negative Phase) muessen Sterne weiterhin klickbar sein. Kunde kann von 2★ auf 5★ wechseln. Phase wechselt dynamisch. | 30 Min | FB22: Kunde hat sich verklickt, keine Rueckweg-Moeglichkeit |
| **B10** | **"Technologie-Partner: flowsight.ch" entfernen** — Identity Contract R4 Verletzung | 5 Min | FlowSight darf NICHT sichtbar sein fuer Endkunden |
| **B1a** | **Termin-Reminder Timing-Bug** — Cron laeuft 07:00 UTC (09:00 CH). Termine am naechsten Tag VOR 09:00 fallen durch. Fix: Cron auf 05:00 UTC (07:00 CH) vorziehen ODER Fenster auf 30h statt 24h erweitern. | 30 Min | DA-0073 beweist: Termin 08:30 wurde nicht reminded |
| **B11** | **Alle Settings-Toggles pruefen** — FB17 zeigt 8 Toggles. Welche funktionieren wirklich? | 2h | Jedes Toggle das nicht funktioniert = leeres Versprechen |

### SPAETER (nach Go-Live)

| # | Fix | Aufwand | Warum |
|---|-----|---------|-------|
| — | Google Places API Integration (automatischer Review-Sync) | 6-8h | Phase 2, Founder muss Google Cloud einrichten |
| — | Review-Conversion-Analytics (gesendet → geoeffnet → bewertet → Google) | 3h | Optimierung, nicht blocking |

---

## 5. Nicht-Verhandelbare Regeln (fuer alle Betriebe)

| Regel | Warum |
|-------|-------|
| **Bewertungsanfrage NUR manuell** — kein Auto-Trigger bei status=done | Betrieb entscheidet bewusst, nicht das System |
| **Max 2 Anfragen pro Fall, 7 Tage Cooldown** | Kunde nicht nerven |
| **Stammkunden-Schutz: Max 1 Anfrage pro Kontakt pro 6 Monate** | Stammkunden-Beziehung schuetzen |
| **≤3★ = KEIN Google-Link** | Negative Reviews intern halten |
| **≥4★ = Google optional, nicht Pflicht** | Kunde soll sich nicht gezwungen fuehlen |
| **Text wird in Clipboard kopiert vor Google-Weiterleitung** | Reibungslosen Uebergang sicherstellen |
| **Negative Bewertung = sofortiger Alert an Betrieb** | Chance zur Service-Recovery |
| **Kein "[FlowSight]" in E-Mail/SMS** — nur Betriebsname | Identity Contract |
| **Sterne IMMER aenderbar** — auch nach erstem Klick | Verklicker-Schutz |
| **"Technologie-Partner: flowsight.ch" ENTFERNEN** | Identity Contract R4 |

---

## 6. Go-Live Checkliste (ALLES muss funktionieren fuer Take 4)

### Kundenseite (was der Endkunde erlebt)

- [ ] E-Mail kommt an mit Betriebsname im Betreff (NICHT FlowSight)
- [ ] E-Mail zeigt Auftragsblock (Kategorie, Ort, Datum)
- [ ] Review-Surface zeigt Betriebsname + Auftragsblock
- [ ] Sterne sind klickbar UND AENDERBAR (auch nach erstem Klick)
- [ ] ≥4★: Chips + Freitext + "Auf Google teilen (optional)" + Clipboard-Copy
- [ ] ≤3★: Feedback-Textarea + "Feedback senden" (KEIN Google-Link)
- [ ] Kein "FlowSight" sichtbar (kein Footer, kein Betreff, kein Text)
- [ ] Google-Button: Text vorher in Clipboard kopiert + Hinweis
- [ ] Ohne Google-Konto: "Ihre Bewertung wurde bereits gespeichert" sichtbar

### Betriebsseite (was der Inhaber erlebt)

- [ ] "Noch Bewertung moeglich" Badge sichtbar bei erledigten Faellen
- [ ] Button "Bewertung anfragen" funktioniert E2E
- [ ] Fehlermeldung spezifisch wenn nicht moeglich (Status, Kontakt, Cooldown, Max)
- [ ] Stammkunden-Warnung wenn Kontakt in letzten 6 Monaten schon gefragt
- [ ] Push-Notification wenn Bewertung eingeht (positiv UND negativ)
- [ ] Rotes Badge/Alert bei ≤3★ Bewertung
- [ ] KPIs: Ø Rating + erhalten/angefragt Zahlen stimmen
- [ ] Max 2 Anfragen pro Fall, 7 Tage Cooldown

### Termin + Benachrichtigungen

- [ ] 24h Termin-Reminder kommt an (SMS und/oder E-Mail je nach Toggle)
- [ ] Timing: auch Termine vor 09:00 werden reminded
- [ ] Alle Settings-Toggles funktionieren wie beschriftet:
  - E-Mail Bestaetigung an Kunden
  - SMS Bestaetigung an Kunden
  - E-Mail Terminbestaetigung an Kunden
  - SMS Terminbestaetigung an Kunden
  - E-Mail Terminbestaetigung an Mitarbeiter
  - SMS Terminbestaetigung an Mitarbeiter
  - 24h Erinnerung an Kunden per SMS
