# Production Brief: Jul. Weinberger AG — Prospect Video (Leckerli A)

**Erstellt:** 2026-03-12 | **Owner:** Founder
**Zielgruppe:** Christian Weinberger, Inhaber Jul. Weinberger AG, Thalwil
**Profil:** Betrieb (8+ Mitarbeiter), Modus 2 (eigene Website vorhanden — wir bauen KEINE neue), ICP 9 = HOT
**Nordstern:** gold_contact.md — Spiegel-Effekt, 5 Kaufstufen, WOW-Sequenz
**Modus-2-Regel:** Weinberger hat eine starke eigene Website (julweinberger.ch). Wir bauen KEINE FlowSight-Website. Stattdessen: Startseite unter flowsight.ch/start/weinberger-ag (Testnummer + Meldungsformular + Leitstand).
**Dieses Dokument ist das einzige Drehbuch für die Aufnahme.**

---

# SCHRITT 1: VOLLSTÄNDIGES CONTENT-INVENTAR

Alles was FlowSight für Weinberger real zeigen/beweisen kann — aus dem Code, nicht aus Wunschdenken.

---

## VOICE / LISA

### V1: Lisa-Greeting mit Firmenname
- **Was genau:** Lisa sagt: *"Grüezi, hier ist Lisa von der Weinberger AG — schön, dass Sie anrufen. Wie kann ich Ihnen helfen?"*
- **Dauer:** ~4 Sekunden
- **Kamera-sichtbar:** Audio hörbar. Handy-Screen zeigt laufenden Anruf.
- **Gerät:** Handy (Anruf) — oder Lautsprecher für Audio im Video

### V2: Intake-Flow (7 Fragen)
- **Was genau:** Lisa stellt bis zu 7 Fragen in flexibler Reihenfolge:
  1. Problem-Beschreibung (Anrufer erzählt, Lisa reagiert empathisch: "Verstehe." / "Das klingt unangenehm.")
  2. Kategorie (abgeleitet oder nachgefragt: "Handelt es sich eher um ein Leck, eine Verstopfung oder etwas anderes?")
  3. Strasse + Hausnummer ("Wie lautet die Strasse und Hausnummer des Einsatzortes?")
  4. PLZ + Ort ("Und die Postleitzahl und der Ort?")
  5. Name ("Und wie ist Ihr Name bitte? — Damit unser Techniker weiss, bei wem er klingeln muss.")
  6. Dringlichkeit ("Ist das ein Notfall, dringend, oder kann es normal eingeplant werden?")
  7. Zusammenfassung (implizit erfasst, 1-3 Sätze)
- **Dauer:** Kompletter Intake = 60-90 Sekunden real. Für Video: nur Greeting + 1-2 Fragen zeigen (~15 Sek).
- **Kamera-sichtbar:** Audio. Handy-Screen zeigt Anruf-Interface.
- **Gerät:** Handy

### V3: PLZ → Ort-Lookup
- **Was genau:** Anrufer sagt PLZ, Lisa bestätigt den Ort. Bekannte Orte für Weinberger:
  - Thalwil, Oberrieden, Horgen, Kilchberg, Rüschlikon, Adliswil, Langnau am Albis, Wädenswil, Richterswil, Au ZH
- **Lisa sagt:** "Thalwil, genau. Und die Strasse und Hausnummer?"
- **Dauer:** ~3 Sekunden
- **Kamera-sichtbar:** Nur Audio
- **Gerät:** Handy

### V4: Notfall-Erkennung + Empathie-Response
- **Was genau:** Bei Wörtern wie Rohrbruch, Überflutung, Heizungsausfall, Gasgeruch:
  Lisa: *"Oh je, das klingt dringend — keine Sorge, da kümmern wir uns sofort drum. Lassen Sie mich nur schnell ein paar Daten aufnehmen, damit unser Pikett-Team sich direkt bei Ihnen melden kann."*
- **Dauer:** ~8 Sekunden
- **Kamera-sichtbar:** Audio
- **Gerät:** Handy

### V5: Off-Topic-Robustheit
- **Was genau:** Bei fachfremden Anfragen (z.B. Steuerberatung):
  Lisa: *"Leider können wir Ihnen dabei nicht weiterhelfen — das liegt ausserhalb unseres Fachgebiets. Ich wünsche Ihnen trotzdem einen schönen Tag, auf Wiederhören!"*
- **Dauer:** ~5 Sekunden
- **Kamera-sichtbar:** Nur Audio
- **Gerät:** Handy

### V6: Closing
- **Was genau:** Nach Intake:
  Lisa: *"Vielen Dank, ich habe alles notiert. Sie erhalten gleich eine SMS auf Ihr Handy — dort können Sie die erfassten Daten nochmals prüfen, bei Bedarf korrigieren und auch Fotos vom Schaden hochladen. Das hilft unserem Techniker, sich optimal vorzubereiten. Ich wünsche Ihnen alles Gute, auf Wiederhören!"*
- **Dauer:** ~12 Sekunden
- **Kamera-sichtbar:** Audio
- **Gerät:** Handy

### V7: FAQ/Preise
- **Was genau:** Lisa kennt Richtwerte:
  - Rohrreinigung ab CHF 180, Boiler-Entkalkung ab CHF 250, Notdienst-Zuschlag CHF 120
  - Öffnungszeiten: Mo-Fr 07:00-17:00, 24h Pikett
  - Adresse: Zürcherstrasse 73, 8800 Thalwil
- **Kamera-sichtbar:** Nur Audio
- **Gerät:** Handy

---

## SMS

### S1: SMS-Bestätigung nach Anruf
- **Was genau:** SMS-Text:
  ```
  Weinberger: Ihre Meldung (Heizung) wurde aufgenommen.

  Erfasste Adresse:
  Seestrasse 15, 8800 Thalwil

  Stimmt alles? Haben Sie Fotos vom Schaden?
  https://flowsight-mvp.vercel.app/v/{caseId}?t={token}

  Ihr Service-Team meldet sich schnellstmöglich.
  ```
- **Absender:** "Weinberger" (alphanumerisch, konfiguriert)
- **Geschwindigkeit:** ~10 Sekunden nach Anruf-Ende (Webhook → Case-Insert → SMS)
- **Kamera-sichtbar:** JA — Handy-Screen zeigt SMS-Eingang, Absender "Weinberger" sichtbar
- **Gerät:** Handy (Haupt-Proof!)

### S2: Korrektur-Seite (via SMS-Link)
- **Was genau:** Link in SMS → `/v/{caseId}` → Seite mit vorausgefüllten Daten (Name, Strasse, PLZ, Ort). Endkunde kann korrigieren + Fotos hochladen.
- **Kamera-sichtbar:** JA — Handy-Browser zeigt gebrandete Korrektur-Seite
- **Gerät:** Handy

---

## WIZARD

### W1: 3-Schritte-Formular
- **Was genau:** URL: `flowsight.ch/kunden/weinberger-ag/meldung`
  - **Schritt 1:** Kategorie (6 Kacheln: dynamisch + fix) + Dringlichkeit (3 Stufen: Notfall/Dringend/Normal)
  - **Schritt 2:** Einsatzort (Strasse, Nr., PLZ, Ort)
  - **Schritt 3:** Kontakt (Name, Telefon, E-Mail) + Beschreibung (Freitext) + Fotos (bis 5 Dateien)
- **Notfall-Screen:** Bei "Notfall" → roter Banner: "Notfall? Rufen Sie jetzt an." + Telefon-CTA + Sekundär: "Schriftlich melden"
- **Dauer real:** 60-90 Sekunden für komplettes Formular
- **Kamera-sichtbar:** JA — Browser-Screen
- **Gerät:** Handy oder Laptop

### W2: Success-Screen nach Submit
- **Was genau:** Grünes Häkchen, "Meldung aufgenommen", Zusammenfassung (Fall-Nr., Kategorie, Dringlichkeit, Ort), "Wir melden uns schnellstmöglich."
- **Kamera-sichtbar:** JA — Browser-Screen
- **Gerät:** Handy oder Laptop

### W3: Wizard-Fall im Dashboard
- **Was genau:** Wizard-Fall erscheint mit source="wizard" (Globus-Icon), gleiche Felder wie Voice-Fall. Kein visueller Unterschied in Datenqualität.
- **Kamera-sichtbar:** JA — im Dashboard sichtbar
- **Gerät:** Laptop

---

## DASHBOARD / LEITSTAND

### D1: Falltabelle
- **Was genau:** Nach Login via Magic Link → `/ops/cases` zeigt:
  - 4 KPI-Karten oben: Total Fälle, Neu heute, In Bearbeitung, Erledigt (7d)
  - Tabelle mit Spalten: Fall-ID (FS-0001), Kunde, Adresse, Problem (Kategorie + Beschreibung), Quelle (📞/🌐/➕), Dringlichkeit (farbiger Punkt), Status (Badge), Erstellt (Datum)
  - Filter: Status, Dringlichkeit, Quelle, Suche, Demo/Real-Tab
- **Kamera-sichtbar:** JA — Browser zeigt Tabelle mit Weinberger-Fällen
- **Gerät:** Laptop (primär)

### D2: Fall-Detail
- **Was genau:** Klick auf Fall → Detail-Ansicht mit allen Feldern:
  Kategorie, Dringlichkeit, Adresse (mit Maps-Link), Beschreibung, Kontaktdaten, Timeline, Status-Dropdown
- **Status-Optionen:** Neu → Kontaktiert → Geplant → Erledigt → Archiviert
- **Kamera-sichtbar:** JA — Browser
- **Gerät:** Laptop

### D3: Demo-Fälle vs. echte Fälle
- **Was genau:** Tab-Toggle "Demo" / "Real" in der Falltabelle. Demo-Cases sind mit `is_demo` Flag markiert. Visuell identisch, nur über Tab getrennt.
- **Kamera-sichtbar:** JA — Browser
- **Gerät:** Laptop

---

## REVIEW-SURFACE

### R1: Review-Anfrage
- **Was genau:** Nach Status = "Erledigt" erscheint Badge "Review möglich". Betrieb klickt "Review anfragen" → E-Mail/SMS an Endkunde mit Link zu Review Surface.
- **Review Surface zeigt:** Auftrags-Details (Kategorie, Ort, Datum), editierbaren Text-Vorschlag, CTA "Auf Google bewerten" (kopiert Text + öffnet Google)
- **Kamera-sichtbar:** JA — aber nur wenn Demo-Case auf "done" gesetzt
- **Gerät:** Laptop (Dashboard-Seite) + Handy (Endkunden-Surface)

---

## STARTSEITE (Modus 2 — keine eigene Website)

### WS1: Startseite flowsight.ch/start/weinberger-ag
- **Was genau:** Leichte, gebrandete Einstiegsseite (KEIN Website-Ersatz) mit:
  - **Header:** Weinberger-Logo-Initialen in Brand-Color #004994 + "Ihr Leitsystem" + 24h-Notdienst-Badge
  - **CTA 1 (primär):** "Lisa anrufen" — grosse Karte mit Testnummer +41 43 505 11 01, Anruf-Button in Brand-Color
  - **CTA 2:** "Anliegen schriftlich melden" → führt zum Meldungsformular (/kunden/weinberger-ag/meldung)
  - **CTA 3:** "Leitstand öffnen" → führt zum Dashboard (/ops/cases)
  - **"So funktioniert's":** 3 Schritte (Anrufen → SMS prüfen → Leitstand öffnen)
  - **Footer:** "Powered by FlowSight" (dezent)
  - **Brand Color:** #004994 (Weinberger-Blau) durchgängig
- **Kein Hero-Foto, keine Services, keine Reviews** — das hat seine eigene Website bereits
- **Kamera-sichtbar:** JA — Browser-Screen, clean und fokussiert
- **Gerät:** Handy oder Laptop

### WS2: Seine echte Website julweinberger.ch
- **Was genau:** Seine bestehende, professionelle Website. Zeigen wir im Video als RESPEKT-Moment.
- **Kamera-sichtbar:** JA — kurzer Blick (3 Sek), um zu zeigen: "Sie haben bereits eine starke Präsenz"
- **Gerät:** Laptop-Browser

---

# SCHRITT 2: WOW-PRIORISIERUNG

Bewertung jedes Elements für Christian Weinberger (Betriebsprofil, 8+ Mitarbeiter, skeptisch, phone-first).

| # | Element | WOW-Score | Kaufstufe | Begründung |
|---|---------|-----------|-----------|------------|
| **V1** | Lisa sagt "Weinberger AG" | **10** | Beweis | DER Spiegel-Moment. "Die sagt meinen Firmennamen." Nichts anderes erzeugt diesen Effekt. |
| **V4** | Notfall-Empathie | **9** | Schmerz + Beweis | "Oh je, das klingt dringend" — zeigt: Lisa ist nicht nur Roboter. Für 24h-Pikett-Betrieb = Kernrelevanz. |
| **S1** | SMS von "Weinberger" | **10** | Beweis (Echtzeit) | Gold Contact: "Stärkster einzelner Moment." Körperlich spürbar (Vibration), überraschend schnell (10 Sek). SMS-Absender = sein Firmenname. |
| **D1** | Fall im Dashboard | **8** | Beweis (Substanz) | "Da steht alles." Kategorie, PLZ, Beschreibung — Disponentin sieht sofort was ansteht. |
| **WS1** | Startseite (Testnummer + Meldung + Leitstand) | **7** | Beweis (Substanz) | Zeigt: System existiert, ist gebrandelt, ist testbar. Kein Spiegel-Effekt wie bei Modus 1, aber funktionaler Beweis. |
| **WS2** | Seine echte Website (julweinberger.ch) | **8** | Sozial (Respekt) | "Sie haben bereits eine starke Präsenz." Zeigt: Wir ersetzen nichts, wir ergänzen. Vertrauensaufbau. |
| **V3** | PLZ → "Thalwil, genau" | **7** | Beweis | Regional-Kompetenz. "Die kennt unser Gebiet." |
| **V2** | Intake-Flow komplett | **6** | Beweis | Wichtig, aber im Video zu lang. Nur Ausschnitt zeigbar. |
| **W1** | Wizard (3 Schritte) | **5** | Beweis | Zusatzkanal. Relevant für Disponentin, aber nicht der WOW-Trigger. |
| **V6** | Closing mit SMS-Ankündigung | **7** | Beweis | Brücke zwischen Anruf und SMS-WOW. Macht den Übergang nachvollziehbar. |
| **D2** | Fall-Detail mit Status | **6** | Beweis (vertieft) | Substanz, aber kein eigener WOW-Moment. Kurz zeigen. |
| **R1** | Review-Surface | **4** | Post-Conversion | WOW 7 = nach Kauf. Für Video: nice-to-have, kein Kauftrigger. |
| **V5** | Off-Topic-Robustheit | **3** | Risiko-Null | Beruhigend, aber nicht video-würdig. Zu technisch. |
| **V7** | FAQ/Preise | **3** | Beweis | Nett, aber im Video: Ablenkung von Kernbotschaft. |
| **S2** | Korrektur-Seite | **4** | Beweis | Zusatzfeature. Verkompliziert die Video-Story. |
| **W2** | Wizard Success-Screen | **4** | Beweis | Bestätigung, kein eigener Moment. |
| **D3** | Demo vs. Real Tab | **2** | — | Internes Feature. Für Prospect irrelevant. |

---

# SCHRITT 3: MUST-HAVE vs. NICE-TO-HAVE vs. WEGLASSEN

## MUST-HAVE (Fehlt eines → kein Spiegel → kein Kauf)

| # | Element | Begründung (Gold Contact) |
|---|---------|--------------------------|
| **V1** | Lisa-Greeting "Weinberger AG" | Stufe 2 (Beweis): "Lisa sagt seinen Firmennamen." Ohne das = generische Demo. |
| **V4** | Notfall-Empathie | Stufe 1 (Schmerz): Weinberger hat 24h-Pikett. Heizungsausfall-Szenario IST sein Alltag. Er muss sehen, dass Lisa Notfälle richtig handhabt. |
| **S1** | SMS von "Weinberger" auf Handy | Stufe 2 (Beweis, Echtzeit): Gold Contact WOW 3 = "Stärkster einzelner Moment." Muss im Video sein. |
| **D1** | Dashboard mit dem Testfall | Stufe 2 (Beweis, Substanz): Gold Contact WOW 4 = "Da steht alles." Disponentin-Perspektive. |
| **WS2** | Seine echte Website (3 Sek) | Stufe 3 (Risiko-Null): "Die ersetzen nichts. Die ergänzen." Zeigt Respekt vor seinem Betrieb. |

## NICE-TO-HAVE (Würde stärken, aber nicht entscheidend)

| # | Element | Begründung |
|---|---------|------------|
| **V3** | PLZ-Lookup "Thalwil" | Verstärkt Regional-Kompetenz. Kann im Lisa-Ausschnitt natürlich vorkommen. |
| **V6** | Closing mit SMS-Hinweis | Gute Brücke. Wenn der Anruf-Ausschnitt bis zum Closing geht: mitnehmen. |
| **W1** | Wizard kurz zeigen | Zeigt zweiten Kanal. Nur wenn Gesamtlänge es erlaubt. |

## WEGLASSEN (Schadet Klarheit oder Vertrauen)

| # | Element | Begründung |
|---|---------|------------|
| **V5** | Off-Topic | Negativ-Szenario im Video = Misstrauen. Zeige was Lisa kann, nicht was sie nicht kann. |
| **V7** | FAQ/Preise | Ablenk. Preis-Thema = Gift im Erstkontakt (Gold Contact: "Preis erst nach Day 10"). |
| **R1** | Review | Post-Conversion. Im Prospect-Video irrelevant. Überlädt die Story. |
| **S2** | Korrektur-Seite | Nischenfeature. Verkompliziert den Flow. SMS allein reicht als WOW. |
| **D2** | Fall-Detail | Dashboard-Tabelle reicht. Detail-Ansicht = zu viel für 60 Sek. |
| **D3** | Demo/Real-Tab | Internes Feature. |
| **W2** | Wizard Success | Kein eigener Moment. |
| **V2 komplett** | Voller Intake | 90 Sekunden = ganzes Video. Nur Ausschnitt zeigen: Greeting + Notfall-Empathie + 1-2 Fragen. |

---

# SCHRITT 4: FORMAT-ENTSCHEID

## Brauchen wir Founder on-camera? (Talking Head)
**JA.** Loom-Style, Camera-Bubble unten rechts. Gründe:
- Gold Contact: "Ich habe das für Sie gebaut" = persönliche Botschaft
- Vertrauen: Ein Gesicht ist glaubwürdiger als eine Stimme
- Weinberger kennt keinen Gunnar Wende. Das Gesicht macht den Unterschied zwischen "Spam" und "persönlich".

## Brauchen wir echten Telefonanruf mit Audio?
**JA, zwingend.** Gold Contact: "Was nicht als Beweis zählt: Ein Video, in dem jemand anderes das System benutzt." Der Anruf muss live sein, Lisas Stimme muss hörbar sein. Kein Voice-Over, kein Fake.

## Was wird auf Handy-Screen gezeigt?
1. Laufender Anruf auf +41 43 505 11 01 (Lisa-Greeting hörbar)
2. SMS-Eingang von "Weinberger" (DAS Kernbild)

## Was wird auf Laptop/Browser gezeigt?
1. Dashboard `/ops/cases` mit dem Weinberger-Testfall
2. Website `flowsight.ch/kunden/weinberger-ag` (Mobile-Viewport oder Desktop)

## Brauchen wir Split-Screen?
**NEIN.** Sequenziell ist klarer. Ein Element nach dem anderen. Split-Screen = Aufmerksamkeit geteilt.

## Wie lange wird das Video realistisch?
**60-70 Sekunden.** Durch den Wegfall der FlowSight-Website (Modus 2) wird das Video fokussierter:
- Einstieg (seine Website + Startseite): 14 Sek
- Lisa-Anruf (Greeting + Notfall + Kommentar): 23 Sek
- SMS-Moment auf Handy: 8 Sek
- Leitstand: 8 Sek
- CTA + Abschluss: 9 Sek
- **Total: ~65 Sek**

**Entscheid:** Max 70 Sekunden. Hart. Fokus auf Lisa + SMS + Leitstand. Kein Website-Feature-Tour.

## Einzel-Video oder Haupt + Anhang?
**Ein Video.** Keine Anhänge. Christian Weinberger öffnet genau ein Video oder gar keins.

---

# SCHRITT 5: SEKUNDEN-GENAUES DREHBUCH

## Gesamtlänge: ~78 Sekunden

### Vorbereitung: Test-Anruf VOR der Aufnahme

Der Founder macht **vor** der Aufnahme einen Test-Anruf bei +41 43 505 11 01 mit folgendem Szenario:
- "Guten Tag, bei uns ist die Heizung komplett ausgefallen. Es sind minus 2 Grad. Wir brauchen dringend Hilfe."
- PLZ: 8800 Thalwil
- Adresse: Seestrasse 15
- Name: Müller
- Telefon: Founder-Handy (für SMS-Empfang)

Dieser Anruf erzeugt den Fall im Dashboard + die SMS auf dem Handy. Beides wird später im Video gezeigt.

---

### Das Drehbuch

| Zeit | Szene | Was Founder sagt (Wortlaut) | Was auf Screen sichtbar | Gerät |
|------|-------|----------------------------|------------------------|-------|
| **0:00–0:05** | Einstieg | "Guten Tag Herr Weinberger. Mein Name ist Gunnar Wende. Ich habe für Ihren Betrieb etwas gebaut." | Seine echte Website julweinberger.ch — kurzer Blick auf Startseite (Respekt-Moment: "Starke Präsenz") | Laptop-Browser |
| **0:05–0:14** | Schmerz | "Dienstagabend, 19 Uhr. Eine Mieterin meldet: Heizung komplett ausgefallen. Minus 2 Grad draussen. Ihre Bürokraft ist längst zuhause. Wer nimmt den Anruf an?" | Browser wechselt zu: `flowsight.ch/start/weinberger-ag` — seine Startseite mit "Lisa anrufen"-Karte prominent | Laptop-Browser |
| **0:14–0:17** | Überleitung | "Schauen Sie — ich rufe jetzt Ihre Nummer an." | Founder nimmt Handy, wählt +41 43 505 11 01 | Handy |
| **0:17–0:22** | Lisa Greeting | *(Founder schweigt — Lisa spricht)* Lisa: *"Grüezi, hier ist Lisa von der Weinberger AG — schön, dass Sie anrufen. Wie kann ich Ihnen helfen?"* | Handy zeigt laufenden Anruf | Handy |
| **0:22–0:28** | Founder als Anrufer | Founder (am Handy): "Ja, guten Tag. Bei uns ist die Heizung ausgefallen — es ist eiskalt in der Wohnung." | Handy-Anruf läuft | Handy |
| **0:28–0:36** | Lisa Notfall-Empathie | *(Founder schweigt — Lisa spricht)* Lisa: *"Oh je, das klingt dringend — keine Sorge, da kümmern wir uns sofort drum. Lassen Sie mich nur schnell ein paar Daten aufnehmen..."* | Handy-Anruf läuft | Handy |
| **0:36–0:40** | Founder-Kommentar | Founder (zur Kamera, Anruf im Hintergrund): "Lisa erkennt den Notfall, reagiert sofort, sammelt alle Daten — rund um die Uhr." | Anruf wird beendet (oder als Schnitt: Founder legt auf) | Handy → Ablegen |
| **0:40–0:48** | SMS-WOW | "Und jetzt schauen Sie auf mein Handy." *(Kurze Pause)* "10 Sekunden nach dem Anruf: eine SMS — von Weinberger. Nicht von irgendeinem System. Von Ihrem Betrieb." | Handy-Screen: SMS-Eingang, Absender "Weinberger", Text sichtbar: "Weinberger: Ihre Meldung (Heizung) wurde aufgenommen..." | Handy (gross im Bild) |
| **0:48–0:56** | Leitstand | "Und hier — Ihr Leitstand." *(Maus bewegt sich über Tabelle)* "Der Fall ist da. Kategorie Heizung, Dringlichkeit Notfall, PLZ 8800 Thalwil. Ihre Bürokraft sieht morgens sofort, was über Nacht reingekommen ist." | Laptop-Browser: `/ops/cases` → Tabelle mit dem Weinberger-Testfall. Fall-ID FS-XXXX, Kategorie "Heizung", Dringlichkeit rot "Notfall", Adresse "Seestrasse 15, 8800 Thalwil", Status "Neu" | Laptop-Browser |
| **0:56–1:05** | CTA + Abschluss | "Lisa nimmt ab, wenn Sie nicht können. Abends, am Wochenende, in der Mittagspause. Testen Sie es selbst — Ihre persönliche Nummer: 043 505 11 01. Den Link zu Ihrem System schicke ich Ihnen gleich. Ich freue mich auf Ihre Rückmeldung." | Browser zeigt nochmal `flowsight.ch/start/weinberger-ag` — die Startseite. Founder lächelt. | Laptop-Browser |

### Gesamtlänge: ~65 Sekunden

---

### Kritische Audio-Stellen

| Zeitpunkt | Was hörbar sein MUSS | Risiko |
|-----------|---------------------|--------|
| 0:17–0:22 | Lisa: "Grüezi, hier ist Lisa von der **Weinberger AG**" | Firmenname muss kristallklar sein. Sonst: Retake. |
| 0:28–0:36 | Lisa: "Oh je, das klingt **dringend**" | Empathie-Ton muss natürlich klingen. Kein Roboter-Gefühl. |
| 0:40–0:48 | Founder erklärt SMS | SMS muss bereits auf Handy sein (vorbereiteter Anruf) |

### Kritische Visual-Stellen

| Zeitpunkt | Was sichtbar sein MUSS | Kill-Risiko |
|-----------|----------------------|-------------|
| 0:40–0:48 | SMS-Absender "Weinberger" | Muss lesbar sein. Kein fremder Chat, keine Benachrichtigungen im Weg. |
| 0:50–0:58 | Dashboard: "Heizung", "Notfall", "8800 Thalwil" | Muss lesbar sein. Keine PII anderer Kunden sichtbar. |
| 0:00–0:05 | Website: "Jul. Weinberger AG" in Hero | Erster Eindruck. Muss perfekt laden. |

---

# SCHRITT 6: PRODUKTIONS-VORBEREITUNG

## Reihenfolge — Schritt für Schritt

### Phase A: System vorbereiten (30 Min, am Vortag oder 2h vor Aufnahme)

**A1. Dashboard säubern**
- Browser: `flowsight-mvp.vercel.app/ops/cases` öffnen
- Prüfen: Sind Weinberger-Fälle sichtbar? Sind fremde Fälle/PII sichtbar?
- Falls nötig: Tenant-Filter aktiv. Demo-Fälle ggf. seed'en (2-3 realistische Fälle: ein Sanitär-Notfall, eine Heizungswartung, eine Verstopfung — verschiedene Zeitstempel)
- **Ziel:** Dashboard sieht aus wie ein aktiver Betrieb mit 3-5 Fällen, nicht leer und nicht überladen

**A2. Startseite + Meldungsformular prüfen**
- Browser: `flowsight.ch/start/weinberger-ag` öffnen
- Prüfen: Firmenname korrekt? Brand-Color #004994? Testnummer sichtbar? "Lisa anrufen"-Button funktioniert?
- "Anliegen schriftlich melden" klicken → Meldungsformular öffnet? Kategorien korrekt?
- "Leitstand öffnen" klicken → Dashboard öffnet?
- Mobile-Viewport testen (Chrome DevTools → Responsive → iPhone 14)
- Browser: `julweinberger.ch` öffnen (seine echte Website — für Video-Einstieg)
- **Kill-Check:** Startseite zeigt "Jul. Weinberger AG"? Alle drei CTAs funktionieren?

**A3. Test-Anruf machen (DER wichtigste Vorbereitungsschritt)**
- Handy nehmen, +41 43 505 11 01 anrufen
- Szenario durchspielen:
  - "Guten Tag, bei uns ist die Heizung komplett ausgefallen. Es ist minus 2 Grad. Wir brauchen dringend Hilfe."
  - PLZ: 8800
  - Ort: Thalwil (Lisa bestätigt)
  - Adresse: Seestrasse 15
  - Name: Müller
  - Telefon: eigene Handynummer
- **Prüfen nach Anruf:**
  - [ ] SMS erhalten? Absender "Weinberger"?
  - [ ] SMS-Text korrekt? Kategorie, Adresse, Korrekturlink?
  - [ ] Dashboard: Neuer Fall sichtbar? Kategorie "Heizung", Dringlichkeit "Notfall", Adresse korrekt?
- **Wenn IRGENDWAS nicht stimmt → STOPP. Nicht aufnehmen. Erst fixen.**
- SMS-Nachricht auf dem Handy **nicht löschen** — die wird im Video gezeigt!

**A4. Handy vorbereiten**
- **Nicht stören** aktivieren (keine Anrufe/Nachrichten während Aufnahme)
- Alle Benachrichtigungen stumm schalten
- SMS-App öffnen: Die Weinberger-SMS muss der letzte/oberste Eintrag sein
- Bildschirmhelligkeit auf Maximum
- Falls Screen-Capture geplant: Screen-Recording-App bereit haben

### Phase B: Aufnahme-Setup (15 Min, direkt vor Aufnahme)

**B1. Browser vorbereiten — exakt 4 Tabs**
- **Tab 1:** `julweinberger.ch` (seine echte Website — für Einstiegs-Moment)
- **Tab 2:** `flowsight.ch/start/weinberger-ag` (Startseite — für Überleitung + CTA)
- **Tab 3:** `flowsight-mvp.vercel.app/ops/cases` (Leitstand, eingeloggt, Weinberger-Fälle sichtbar, der Testfall von A3 sichtbar)
- **Kein anderer Tab.** Keine PII. Kein Gmail. Kein anderer Kunde.
- Browser-Bookmarks-Leiste: Ausblenden oder nur FlowSight-relevante Einträge
- Browser-Zoom: 100% oder 110% (Text muss lesbar sein im Video)

**B2. Loom vorbereiten**
- Loom Desktop App öffnen
- Modus: "Screen + Camera" (Founder-Bubble unten rechts)
- Audio: Externes Mikrofon (kein Laptop-Mikrofon!)
- Kamera: Gesicht sichtbar, Licht von vorne (Fenster oder Lampe), kein Gegenlicht
- Test: 5-Sekunden-Testaufnahme → Audio + Bild prüfen

**B3. Skript bereitlegen**
- Dieses Dokument auf zweitem Bildschirm ODER als Ausdruck neben dem Laptop
- Stichwort-Karte (8 Punkte, nicht ablesen — als Gedächtnisstütze):
  ```
  1. "Guten Tag Herr Weinberger. Gunnar Wende. Für Ihren Betrieb gebaut."
     → Tab 1: julweinberger.ch zeigen (Respekt)
  2. "Dienstagabend 19h. Heizung ausgefallen. Wer nimmt an?"
     → Tab 2: Startseite zeigen
  3. → Handy: Anruf. Lisa: "Weinberger AG"
  4. → Lisa Notfall-Empathie
  5. "10 Sekunden: SMS von Weinberger."
  6. → Tab 3: Leitstand: Heizung, Notfall, Thalwil
  7. "043 505 11 01. Link schicke ich gleich."
     → Tab 2: Startseite nochmal zeigen
  ```

### Phase C: Aufnahme (45-60 Min)

**C1. Aufnahme-Checkliste (vor jedem Take)**
```
□ Browser: 4 Tabs offen, Tab 1 (julweinberger.ch) aktiv?
□ Handy: SMS von "Weinberger" sichtbar? Nicht-Stören an?
□ Loom: Screen + Camera, externes Mikro, Aufnahme bereit?
□ Kein PII im Bild? (keine E-Mails, keine anderen Kunden)
□ Licht ok? Gesicht sichtbar?
□ Skript-Karte sichtbar?
□ Ruhe? Tür zu? Handy auf stumm?
```

**C2. Aufnahme-Ablauf**

**Option A: Live-Anruf im Video (empfohlen, authentischer)**
1. Loom starten → Aufnahme läuft
2. Website zeigen + Einstieg sprechen (0:00-0:15)
3. Handy nehmen, +41 43 505 11 01 anrufen — LIVE
4. Lisa-Greeting abwarten, Heizungsausfall-Szenario spielen
5. Lisa-Empathie abwarten, Kommentar zur Kamera
6. Anruf beenden
7. Auf SMS warten (~10 Sek) → Handy in die Kamera halten
8. Dashboard zeigen → Website zeigen → CTA + Ende
9. Loom stoppen

**Vorteil:** 100% authentisch. Kein Schnitt nötig.
**Risiko:** Lisa-Latenz, unerwartete Antworten. Daher: Vorher Test-Anruf (A3) gemacht haben.

**Option B: Vorbereiteter Anruf + Zusammenschnitt (sicherer)**
1. Test-Anruf VOR der Video-Aufnahme machen (Phase A3 = fertig)
2. Loom starten
3. Website + Einstieg (0:00-0:15)
4. Überleitung: "Schauen Sie, ich rufe Ihre Nummer an." → Handy nehmen
5. NEUEN Anruf starten — diesmal NUR Greeting + Notfall-Szene (20 Sek, dann auflegen)
6. "Und jetzt schauen Sie" → Handy zeigen mit SMS von vorherigem Anruf (A3)
7. Dashboard → Website → CTA → Ende
8. In Loom: Pausen trimmen. Ergebnis: ~78 Sek.

**Empfehlung: Option B.** Sicherer, vorhersehbarer, professionelleres Ergebnis.

**C3. Takes**
- **Take 1:** Komplett durchspielen. Nicht bei kleinen Fehlern stoppen.
- **Anschauen:** Audio ok? Lisa hörbar? SMS sichtbar? Dashboard lesbar? Gesamteindruck?
- **Take 2:** Korrekturen aus Take 1.
- **Take 3:** Nur wenn nötig. Nicht aus Perfektionismus.

---

## Quality Gate — JEDES Kriterium muss PASS sein

| # | Kriterium | Prüfung | Kill? |
|---|----------|---------|-------|
| Q1 | Lisa sagt "Weinberger AG" klar hörbar | Audio abhören bei 0:18-0:23 | **JA — sofortiger Retake** |
| Q2 | SMS-Absender "Weinberger" lesbar auf Handy | Frame bei 0:40-0:48 prüfen | **JA** |
| Q3 | Leitstand zeigt "Heizung", "Notfall", "8800 Thalwil" | Frame bei 0:48-0:56 prüfen | **JA** |
| Q4 | Startseite zeigt "Jul. Weinberger AG" + "Lisa anrufen" | Frame bei 0:05-0:14 prüfen | **JA** |
| Q5 | Keine PII anderer Kunden sichtbar | Ganzes Video Frame-für-Frame | **JA** |
| Q6 | Kein "äh", kein Stottern, keine langen Pausen | Audio komplett prüfen | **JA** |
| Q7 | Founder-Gesicht erkennbar in Camera-Bubble | Stichprobe 3 Stellen | **JA** |
| Q8 | Audio sauber (kein Rauschen, kein Echo) | Kopfhörer, volle Lautstärke | **JA** |
| Q9 | Gesamtlänge 60-70 Sekunden | Loom-Timer | **JA (>70 = kürzen)** |
| Q10 | Kein FlowSight in Endkunden-Flächen | Website, SMS, Dashboard prüfen | **JA** |
| Q11 | Keine generische AI-Sprache | "Innovative Lösung", "digitale Transformation" = Kill | **JA** |
| Q12 | **Würde-Test:** Würdest du das Christian Weinberger mit gutem Gewissen schicken? | Ehrliche Antwort. | **JA** |

---

## Zusammenfassung: Was muss bereit sein

| # | Was | Status vor Aufnahme |
|---|-----|-------------------|
| 1 | Testnummer +41 43 505 11 01 funktioniert | ✅ Verifiziert via Test-Anruf |
| 2 | Lisa sagt "Weinberger AG" korrekt | ✅ Verifiziert via Test-Anruf |
| 3 | SMS kommt an, Absender "Weinberger" | ✅ Verifiziert, SMS auf Handy behalten |
| 4 | Dashboard zeigt Testfall | ✅ Verifiziert nach Test-Anruf |
| 5 | Startseite flowsight.ch/start/weinberger-ag lädt fehlerfrei | ✅ Geprüft auf Mobile + Desktop |
| 5b | Seine Website julweinberger.ch lädt | ✅ Geprüft |
| 6 | Browser: genau 4 Tabs, keine PII | ✅ Vorbereitet |
| 7 | Handy: Nicht-Stören, SMS oben | ✅ Vorbereitet |
| 8 | Loom: Screen + Camera, externes Mikro | ✅ Getestet |
| 9 | Skript-Karte neben Laptop | ✅ Ausgedruckt/2. Bildschirm |
| 10 | Licht, Ruhe, Tür zu | ✅ Geprüft |
