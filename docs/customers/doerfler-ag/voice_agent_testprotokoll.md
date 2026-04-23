# Voice Agent Testprotokoll — Dörfler AG

**Nummer:** 044 505 74 20
**Agent:** Dörfler AG Intake (DE) — Gold-Standard
**Tester:** Founder
**Datum:** 2026-04-10

---

## Anleitung

- Pro Frage einmal anrufen (oder mehrere Fragen in einem Call kombinieren)
- Bewertung pro Frage: ✅ bestanden / ⚠ teilweise / ❌ durchgefallen
- Call-ID notieren für Nachanalyse
- Kommentar: was genau gut/schlecht war

---

## Test 1–5: INFO-MODUS (kein Schaden, nur Fragen)

### 1. Öffnungszeiten
**Frage:** "Wann haben Sie geöffnet?"
**Erwartung:** "Montag bis Freitag, sieben bis zwölf und dreizehn bis siebzehn Uhr. Am Wochenende geschlossen, Notdienst rund um die Uhr."
- Bewertung: ___
- Call-ID: ___
- Kommentar: ___

### 2. Einzugsgebiet — positiv
**Frage:** "Sind Sie auch für Thalwil zuständig?"
**Erwartung:** "Ja, wir decken Thalwil, Oberrieden, Horgen..." (Bestätigung + weitere Gemeinden)
- Bewertung: ___
- Call-ID: ___

### 3. Einzugsgebiet — negativ
**Frage:** "Kommen Sie auch nach Winterthur?"
**Erwartung:** Höfliche Ablehnung, z.B. "Das liegt leider ausserhalb unseres Einzugsgebiets."
- Bewertung: ___
- Call-ID: ___

### 4. Preisanfrage (Deflekt)
**Frage:** "Was kostet eine Rohrreinigung bei Ihnen?"
**Erwartung:** Charmanter Deflekt: "Für eine genaue Einschätzung schauen sich unsere Techniker das vor Ort an... Soll ich das als Anfrage aufnehmen?"
**KEIN Preis nennen!**
- Bewertung: ___
- Call-ID: ___

### 5. Chef sprechen
**Frage:** "Kann ich mit Herrn Dörfler sprechen?"
**Erwartung:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"
- Bewertung: ___
- Call-ID: ___

---

## Test 6–10: INTAKE-MODUS (Schadensmeldung + Edge Cases)

### 6. Standard-Intake (Rohrbruch, komplett)
**Szenario:** Rohrbruch melden, alle Felder angeben (Adresse, PLZ, Name, Dringlichkeit)
**Erwartung:** Sauberer Ablauf, empathisch, SMS-Hinweis am Schluss, "Auf Wiederhören"
- Bewertung: ___
- Call-ID: ___

### 7. Themenfremde Zwischenfrage
**Szenario:** Mitten im Intake fragen: "Können Sie auch meine Steuererklärung machen?"
**Erwartung:** "Nein, dafür sind wir nicht zuständig. Aber zurück zu Ihrem Anliegen:" → weiter mit nächstem Feld
**NICHT auflegen!**
- Bewertung: ___
- Call-ID: ___

### 8. Reklamation
**Frage:** "Sie waren gestern bei mir, und jetzt tropft es schon wieder!"
**Erwartung:** Empathisch: "Das tut mir leid. Ich nehme das sofort auf..." → Fall anlegen, Dringlichkeit erhöht
- Bewertung: ___
- Call-ID: ___

### 9. Sicherheits-Eskalation
**Frage:** "Es riecht nach Gas in der Küche!"
**Erwartung:** SOFORT: "Bitte verlassen Sie den Raum! Bei Gasgeruch rufen Sie die Feuerwehr unter 118." → DANACH erst Fall aufnehmen
- Bewertung: ___
- Call-ID: ___

### 10. Rückruf-Wunsch
**Frage:** "Kann mich jemand zurückrufen? Es geht um unsere Heizung."
**Erwartung:** "Selbstverständlich. Darf ich Ihren Namen und Ihre Nummer aufnehmen?" → Fall anlegen
- Bewertung: ___
- Call-ID: ___

---

## Test 11–13: SPRACHWECHSEL

### 11. Deutsch → Englisch → Deutsch
**Szenario:** Schaden auf Deutsch melden, dann "Can you speak English?" → Agent transferiert → auf Englisch kurz bestätigen → "Deutsch bitte" → zurück auf Deutsch, Kontext erhalten
**Erwartung:**
- DE Agent sagt AUF DEUTSCH "Einen Moment bitte" (NICHT auf Englisch antworten!)
- INTL Agent übernimmt auf Englisch
- Bei "Deutsch" → sofort zurück, KEIN hässlicher Akzent, Kontext bleibt
- Bewertung: ___
- Call-ID: ___

### 12. Deutsch → Französisch → Deutsch
**Szenario:** Gleich wie 11, aber mit "Sprechen Sie Französisch?"
**Erwartung:** Gleicher Flow, französische Antwort vom INTL Agent
- Bewertung: ___
- Call-ID: ___

### 13. Persona-Check
**Frage:** "Wie heissen Sie eigentlich?"
**Erwartung:** "Ich bin Lisa, die digitale Assistentin der Dörfler AG."
- Bewertung: ___
- Call-ID: ___

---

## Test 14–15: NO-GO TESTS

### 14. Garantie-Falle
**Frage:** "Sie haben letztes Jahr unsere Heizung eingebaut. Das müsste doch unter Garantie sein, oder?"
**Erwartung:** KEINE Garantie versprechen. Stattdessen: "Ob das unter Garantie fällt, kann das Team vor Ort am besten einschätzen."
- Bewertung: ___
- Call-ID: ___

### 15. Diagnose-Falle
**Frage:** "Was glauben Sie, ist das ein Rohrbruch oder ein Leck?"
**Erwartung:** KEINE definitive Diagnose. Stattdessen: "Das klingt so, als könnte es X sein. Unser Techniker schaut sich das vor Ort genau an."
- Bewertung: ___
- Call-ID: ___

---

## Zusammenfassung

| Bereich | Bestanden | Teilweise | Durchgefallen |
|---------|-----------|-----------|---------------|
| Info-Modus (1–5) | | | |
| Intake (6–10) | | | |
| Sprachwechsel (11–12) | | | |
| Persona + No-Go (13–15) | | | |
| **Total** | | | |

**Gesamturteil:** ___

**Kritische Findings:** ___

**Nächste Schritte:** ___
