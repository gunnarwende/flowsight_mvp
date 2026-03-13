# Production Brief: Jul. Weinberger AG — Prospect Video (Leckerli A)

**Version:** 2.0 (aligned with schatztruhe_final.md)
**Erstellt:** 2026-03-12 | **Aktualisiert:** 2026-03-13
**Owner:** Founder
**Zielgruppe:** Christian Weinberger, Inhaber Jul. Weinberger AG, Thalwil
**Profil:** Meister/Betrieb, Modus 2 (eigene Website vorhanden), ICP 9 = HOT
**SSOT:** schatztruhe_final.md — Berührungspunkt-Architektur
**Dieses Dokument ist das einzige Drehbuch für die Aufnahme.**

---

## Kontext

Die E-Mail nutzt den defensiven Feedback-Ansatz ("Ich habe etwas ausprobiert — Ihre Meinung?").
Niedrige Erwartung → Video übertrifft um Längen → Kinnlade fällt runter.

Das Video ist der ERSTE Blick in die Schatztruhe. Es liefert 6 Beweise in ~130–140 Sekunden (Rohschnitt).
Nach der Aufnahme: Analyse-Session (Was kann raus? Wo ist weniger = mehr WOW?). Kein Versand vor Analyse.

**Modus 2:** Weinberger hat eine starke eigene Website (julweinberger.ch). Wir bauen KEINE neue.
Stattdessen: `/start/weinberger-ag` als Persönlicher Einstieg (Testnummer + Meldung + Leitstand).

---

## A. SEKUNDEN-GENAUES DREHBUCH (Rohschnitt 130–140s)

### Voraussetzung: Test-Anruf VOR der Aufnahme

Der Founder macht **vor** der Aufnahme einen Test-Anruf bei +41 43 505 11 01:
- Szenario: "Guten Tag, bei uns ist die Heizung komplett ausgefallen. Es sind minus 2 Grad."
- PLZ: 8800 → Lisa bestätigt "Thalwil"
- Adresse: Seestrasse 15
- Name: Müller
- Telefon: Founder-Handy (für SMS-Empfang)

Dieser Anruf erzeugt: (1) SMS auf dem Handy, (2) Fall im Leitstand.
Beides wird im Video gezeigt. **SMS nicht löschen!**

E2E-Prüfung nach Test-Anruf:
- [ ] SMS erhalten? Absender "Weinberger"?
- [ ] SMS-Text: Kategorie, Adresse, Korrekturlink?
- [ ] Leitstand: Fall sichtbar? Kategorie "Heizung", Dringlichkeit "Notfall", PLZ 8800?
- **Wenn IRGENDWAS nicht stimmt → STOPP. Erst fixen.**

---

### Das Drehbuch

| Zeit | Szene | Was Founder sagt (Wortlaut) | Was auf Screen | Gerät | Kill-Kriterium |
|------|-------|----------------------------|----------------|-------|----------------|
| **00:00–00:05** | SPIEGEL | "Jul. Weinberger AG. Haustechnik seit 1912. Thalwil." | `julweinberger.ch` — seine echte Website. Hero-Bereich sichtbar. | Laptop-Browser | Website muss laden. Firmenname muss sichtbar sein. |
| **00:05–00:12** | KONTEXT | "Dienstagabend, 19 Uhr. Heizung ausgefallen. Ihr Handy klingelt. Sie sind noch auf der Baustelle." | Weiterhin julweinberger.ch oder Übergang zu Handy-Aufnahme | Laptop → Handy | — |
| **00:12–00:15** | ÜBERLEITUNG | "Schauen Sie — ich rufe jetzt Ihre Nummer an." | Founder nimmt Handy, wählt +41 43 505 11 01 | Handy | — |
| **00:15–00:20** | BEWEIS 1: LISA-GREETING | *(Founder schweigt — Lisa spricht)* | Handy zeigt laufenden Anruf | Handy | **KILL: Lisa MUSS "Weinberger AG" klar sagen.** |

**Lisa sagt exakt (aus Agent-JSON, start-node):**
> "Grüezi, hier ist Lisa von der Weinberger AG — schön, dass Sie anrufen. Wie kann ich Ihnen helfen?"

| Zeit | Szene | Was Founder sagt | Was auf Screen | Gerät | Kill-Kriterium |
|------|-------|-----------------|----------------|-------|----------------|
| **00:20–00:26** | FOUNDER ALS ANRUFER | "Ja, guten Tag. Bei uns ist die Heizung ausgefallen — es ist eiskalt in der Wohnung." | Handy-Anruf läuft | Handy | — |
| **00:26–00:35** | BEWEIS: NOTFALL-EMPATHIE | *(Founder schweigt — Lisa spricht)* | Handy-Anruf läuft | Handy | Empathie-Ton muss natürlich klingen. |

**Lisa sagt sinngemäss (aus Agent-JSON, global_prompt Notfall-Regel):**
> "Oh je, das klingt dringend — keine Sorge, da kümmern wir uns sofort drum. Lassen Sie mich nur schnell ein paar Daten aufnehmen, damit unser Pikett-Team sich direkt bei Ihnen melden kann."

| Zeit | Szene | Was Founder sagt | Was auf Screen | Gerät | Kill-Kriterium |
|------|-------|-----------------|----------------|-------|----------------|
| **00:35–00:42** | STEUERERKLÄRUNG | Founder (am Handy): "Ah, und könnten Sie mir auch bei der Steuererklärung helfen?" | Handy-Anruf läuft | Handy | Lisa muss ablehnen, nicht mitspielen. |

**Lisa sagt sinngemäss (aus Agent-JSON, main-node Inline-Regel für beiläufige Nebenfragen):**
> "Dafür sind wir leider nicht zuständig — ich bin spezialisiert auf Sanitär- und Heizungsanliegen."

**WICHTIG:** Die Steuerfrage muss MITTEN im Intake kommen (als Nebenfrage), nicht als Einstieg.
Dann bleibt Lisa im Gespräch (kein out_of_scope-Exit). Genau das zeigt: Sie kennt ihre Grenzen.

| Zeit | Szene | Was Founder sagt | Was auf Screen | Gerät | Kill-Kriterium |
|------|-------|-----------------|----------------|-------|----------------|
| **00:42–00:52** | LISA CLOSING | *(Founder schweigt — Lisa schliesst ab)* | Handy-Anruf läuft → wird beendet | Handy | Professioneller Abschluss. |

**Lisa sagt exakt (aus Agent-JSON, node-closing-intake):**
> "Vielen Dank, ich habe alles notiert. Sie erhalten gleich eine SMS auf Ihr Handy — dort können Sie die erfassten Daten nochmals prüfen, bei Bedarf korrigieren und auch Fotos vom Schaden hochladen. Das hilft unserem Techniker, sich optimal vorzubereiten. Ich wünsche Ihnen alles Gute, auf Wiederhören!"

| Zeit | Szene | Was Founder sagt | Was auf Screen | Gerät | Kill-Kriterium |
|------|-------|-----------------|----------------|-------|----------------|
| **00:52–01:02** | BEWEIS 2: SMS (PHYSISCH) | "Und jetzt schauen Sie auf mein Handy." *(Pause)* "10 Sekunden nach dem Anruf: eine SMS — von Weinberger. Nicht von irgendeinem System. Von Ihrem Betrieb." | Handy: SMS-Notification. Absender: "Weinberger". Text sichtbar: "Weinberger: Ihre Meldung (Heizung) wurde aufgenommen..." | Handy (gross im Bild) | **KILL: Absender "Weinberger" muss lesbar sein. Keine Unschärfe. Kein fremder Chat im Bild.** |
| **01:02–01:12** | BEWEIS 3: LEITSTAND (STRUKTURELL) | "Und hier — Ihr Leitstand." *(Maus über Tabelle)* "Der Fall ist da. Kategorie Heizung, Dringlichkeit Notfall, PLZ 8800 Thalwil. Kein Anruf verloren." | Laptop-Browser: `/ops/cases` → Falltabelle mit Weinberger-Testfall. Fall-ID, "Heizung", Dringlichkeit rot, "Seestrasse 15, 8800 Thalwil" | Laptop-Browser | **KILL: "Heizung", "Notfall", "Thalwil" müssen lesbar sein. Keine PII anderer Kunden sichtbar.** |
| **01:12–01:24** | DIREKTMELDUNG | "Oder Ihre Kunden melden sich schriftlich — direkt hier." *(Klick auf CTA)* "Landet sofort im selben Leitstand." | Browser: `/start/weinberger-ag` → CTA "Anliegen schriftlich melden" → Formular öffnet → Kurz ausfüllen → Submit → Leitstand zeigt zweiten Fall | Laptop-Browser | Fall muss im Leitstand erscheinen. Nie "Wizard" sagen. |
| **01:24–01:30** | PERSÖNLICHER EINSTIEG | "Das ist Ihr persönlicher Einstieg — Nummer, Meldung, Leitstand. Alles an einem Ort." | Browser: `/start/weinberger-ag` — Firmenkarte mit Name, Sterne, 3 CTAs | Laptop-Browser | Firmenname + Sterne sichtbar. |
| **01:30–01:38** | CTA | "Das ist Ihre Nummer. Rufen Sie an — Lisa nimmt ab." | Nummer gross eingeblendet: **043 505 11 01** | Laptop-Browser (Startseite mit Nummer) | **KILL: Nummer muss lesbar sein.** |

**[FlowSight-Logo klein in Kamera-Ecke sichtbar während gesamtem Video]**

### Gesamtlänge Rohschnitt: ~130–140 Sekunden

### Nach der Aufnahme: Analyse-Session
- Was kann raus? Wo ist Weniger = Mehr WOW?
- Steuererklärung drin lassen oder cutten? (Entscheid nach Ansicht)
- Direktmeldung komplett oder gekürzt?
- Lisa-Closing komplett oder ab SMS-Hinweis cutten?
- **Kein Versand vor Analyse.**

---

### Kritische Audio-Stellen

| Zeitpunkt | Was hörbar sein MUSS | Kill? |
|-----------|---------------------|-------|
| 00:15–00:20 | Lisa: "Grüezi, hier ist Lisa von der **Weinberger AG**" | **JA** |
| 00:26–00:35 | Lisa: "Oh je, das klingt **dringend**" — Empathie-Ton natürlich | **JA** |
| 00:35–00:42 | Lisa lehnt Steuerfrage ab, bleibt im Gespräch | **JA** |
| 00:42–00:52 | Lisa-Closing mit SMS-Hinweis | Nein (kann gekürzt werden) |

### Kritische Visual-Stellen

| Zeitpunkt | Was sichtbar sein MUSS | Kill? |
|-----------|----------------------|-------|
| 00:00–00:05 | julweinberger.ch Hero, "Jul. Weinberger AG" | **JA** |
| 00:52–01:02 | SMS-Absender "Weinberger", Text lesbar | **JA** |
| 01:02–01:12 | Leitstand: "Heizung", "Notfall", "8800 Thalwil" | **JA** |
| 01:12–01:24 | Direktmeldung-Flow: Form → Submit → Leitstand | Nein (Nice-to-have) |
| 01:30–01:38 | Nummer 043 505 11 01 lesbar | **JA** |

---

## B. PRODUKTIONS-VORBEREITUNG

### Phase 1 — System-Check (30 Min, am Vortag oder 2h vor Aufnahme)

**1.1. E2E-Testanruf (DER wichtigste Schritt)**
- Handy: +41 43 505 11 01 anrufen
- Szenario: Heizungsausfall, PLZ 8800, Seestrasse 15, Name Müller
- Prüfen: SMS erhalten (Absender "Weinberger")? Fall im Leitstand?
- **Wenn FAIL → kein Video. Erst fixen.**
- SMS auf Handy behalten — wird im Video gezeigt!

**Bekannter Risikopunkt:** `DEMO_SIP_CALLER_ID` auf Vercel prüfen (3-Tier SMS-Routing).

**1.2. Leitstand prüfen**
- Browser: `flowsight-mvp.vercel.app/ops/cases` → Eingeloggt?
- Weinberger-Fälle sichtbar? Testfall von 1.1 da?
- Keine PII anderer Kunden sichtbar?
- Optional: 2-3 Demo-Fälle seed'en (verschiedene Kategorien, Zeitstempel)

**1.3. Persönlicher Einstieg prüfen**
- Browser: `flowsight.ch/start/weinberger-ag`
- Firmenkarte: "Jul. Weinberger AG", 4.4★, Services, Adresse korrekt?
- CTA "Lisa anrufen" → tel:-Link funktioniert?
- CTA "Anliegen schriftlich melden" → `/start/weinberger-ag/meldung` → Formular öffnet?
- CTA "Leitstand öffnen" → `/ops/cases`?
- Mobile-Viewport testen (Chrome DevTools → iPhone 14)

**1.4. Seine echte Website prüfen**
- Browser: `julweinberger.ch` → Lädt? Hero-Bereich sauber?

**1.5. Handy vorbereiten**
- Nicht stören aktivieren
- Alle Benachrichtigungen stumm
- SMS-App: Weinberger-SMS = oberster Eintrag
- Helligkeit Maximum
- Ggf. Screen-Recording bereit

### Phase 2 — Setup (15 Min, direkt vor Aufnahme)

**2.1. Browser — exakt 4 Tabs**

| Tab | URL | Zustand |
|-----|-----|---------|
| 1 | `julweinberger.ch` | Hero-Bereich sichtbar |
| 2 | `flowsight.ch/start/weinberger-ag` | Firmenkarte + 3 CTAs |
| 3 | `flowsight-mvp.vercel.app/ops/cases` | Eingeloggt, Testfall sichtbar |
| 4 | — | KEIN vierter Tab. Kein Gmail. Kein anderer Kunde. |

- Bookmarks-Leiste: Ausblenden oder nur FlowSight
- Browser-Zoom: 100% oder 110% (Text lesbar)
- Kein anderer Tab, kein anderes Fenster

**2.2. Loom**
- Loom Desktop App (Starter Plan, $15/mo)
- Modus: Screen + Camera (Founder-Bubble unten rechts)
- Audio: **Externes USB-Mikrofon** (kein Laptop-Mic!)
- Kamera: Gesicht sichtbar, Licht von vorne, kein Gegenlicht
- FlowSight-Logo: Als kleines Bild/Sticker in Kamera-Nähe positionieren ODER in Loom nachträglich als Overlay (Loom Starter erlaubt das nicht nativ → Alternative: physisch im Kamera-Bild positionieren, z.B. kleiner Aufkleber auf Laptop)
- Test: 5-Sekunden-Testaufnahme → Audio + Bild prüfen

**2.3. Skript-Karte**
Dieses Dokument auf zweitem Bildschirm ODER als Ausdruck. Stichwort-Karte (nicht ablesen):
```
1. julweinberger.ch → "Haustechnik seit 1912. Thalwil."
2. "Dienstagabend 19h. Heizung aus. Wer nimmt an?"
3. Handy → +41 43 505 11 01 → Lisa: "Weinberger AG"
4. "Heizung ausgefallen, eiskalt" → Lisa Notfall-Empathie
5. "Steuererklärung?" → Lisa: "Nicht zuständig"
6. Lisa Closing → Auflegen
7. "10 Sek: SMS von Weinberger." → Handy zeigen
8. Tab 3: Leitstand → "Heizung, Notfall, Thalwil"
9. Tab 2: /start/weinberger-ag → "Anliegen melden" → Formular → Submit
10. Tab 2: "Ihr persönlicher Einstieg"
11. "043 505 11 01. Lisa nimmt ab."
```

### Phase 3 — Aufnahme

**3.1. Checkliste vor jedem Take**
```
□ Browser: 3 Tabs offen, Tab 1 (julweinberger.ch) aktiv?
□ Handy: SMS "Weinberger" sichtbar? Nicht-Stören an?
□ Loom: Screen + Camera, externes Mikro, Aufnahme bereit?
□ Kein PII im Bild? (kein Gmail, keine anderen Kunden)
□ Licht ok? Gesicht sichtbar?
□ Skript-Karte sichtbar?
□ Ruhe? Tür zu?
```

**3.2. Aufnahme-Ablauf**

**Empfehlung: Zwei-Phasen-Aufnahme (sicherer als 100% live)**

**Anruf-Phase (vor Loom):**
1. Anruf bei +41 43 505 11 01 → Heizungsausfall-Szenario durchspielen
2. MITTEN im Intake: Steuerfrage stellen → Lisa lehnt ab
3. Lisa schliesst ab → SMS kommt auf Handy
4. Prüfen: SMS da? Leitstand aktualisiert?
5. Handy-Screen-Recording des Anrufs aufnehmen (für Einspieler im Video)

**Video-Phase (Loom):**
1. Loom starten → Aufnahme läuft
2. Tab 1: julweinberger.ch → Einstieg sprechen (00:00–00:12)
3. "Schauen Sie, ich rufe Ihre Nummer an" → Handy-Recording einspielen ODER neuen Live-Anruf starten
4. Lisa-Greeting + Notfall-Empathie (aus Aufnahme oder live)
5. Steuerfrage (aus Aufnahme oder live)
6. Lisa-Closing (aus Aufnahme oder live)
7. "SMS von Weinberger" → Handy in Kamera halten (echte SMS von Phase 1)
8. Tab 3: Leitstand → "Heizung, Notfall, Thalwil"
9. Tab 2: /start/weinberger-ag → "Anliegen melden" → Formular → Submit
10. Tab 2: Persönlicher Einstieg zeigen
11. CTA: "043 505 11 01. Lisa nimmt ab." → Ende
12. Loom stoppen

**Alternative: 100% Live (authentischer, riskanter)**
- Loom starten, ALLES in einem Take: Website → Live-Anruf → SMS abwarten → Leitstand → Formular → CTA
- Vorteil: Maximale Authentizität
- Risiko: Lisa-Latenz, SMS-Delay, unerwartete Antworten
- Nur wenn Founder sich sicher fühlt und E2E-Testanruf 100% PASS war

**3.3. Takes**
- **Take 1:** Komplett durchspielen. Nicht bei kleinen Fehlern stoppen.
- Anschauen: Audio ok? Lisa hörbar? SMS sichtbar? Leitstand lesbar?
- **Take 2:** Korrekturen aus Take 1.
- **Take 3:** Nur wenn nötig. Nicht aus Perfektionismus.
- Realistisch: 2–3 Takes für den Rohschnitt.

---

## C. QUALITY GATE (12 Punkte)

### Kill-Kriterien (Retake wenn FAIL)

| # | Kriterium | Prüfung | Kill? |
|---|----------|---------|-------|
| Q1 | Lisa sagt "Weinberger AG" klar hörbar | Audio bei 00:15–00:20 | **JA** |
| Q2 | SMS-Absender "Weinberger" lesbar | Frame bei 00:52–01:02 | **JA** |
| Q3 | Leitstand: "Heizung", "Notfall", "Thalwil" lesbar | Frame bei 01:02–01:12 | **JA** |
| Q4 | Nummer 043 505 11 01 lesbar im CTA | Frame bei 01:30–01:38 | **JA** |
| Q5 | Keine PII anderer Kunden sichtbar | Ganzes Video Frame-für-Frame | **JA** |
| Q6 | Kein "äh", kein Stottern, keine langen Pausen | Audio komplett | **JA** |
| Q7 | Founder-Gesicht erkennbar in Camera-Bubble | Stichprobe 3 Stellen | **JA** |
| Q8 | Audio sauber (kein Rauschen, kein Echo, kein Laptop-Mic) | Kopfhörer, volle Lautstärke | **JA** |
| Q9 | julweinberger.ch erkennbar im Spiegel-Moment | Frame bei 00:00–00:05 | **JA** |
| Q10 | Kein SaaS-Wording nach aussen ("Wizard", "Dashboard", "Agent", "Cockpit") | Audio + Screen | **JA** |
| Q11 | Keine generische AI-Sprache ("innovative Lösung", "digitale Transformation") | Audio | **JA** |
| Q12 | **Würde-Test:** Würdest du das Christian Weinberger mit gutem Gewissen schicken? | Ehrlich. | **JA** |

### Nicht-Kill (kein Retake nötig)

- Natürlicher Atemzug
- Minimale stimmliche Unvollkommenheit (wirkt authentischer)
- Lisa antwortet leicht anders als im Drehbuch (Retell ist nicht deterministisch)
- Leichtes Papier-Rascheln oder Mausklick hörbar
- Nicht "ultra polished" — Rohschnitt-Qualität ist bewusst

---

## D. MODUS-HINWEIS

Dieses Briefing = **Modus 2** (Weinberger hat eigene Website, wir ersetzen sie nicht).

### Für Modus 1 (z.B. Dörfler AG):
- Zusätzliche Szene 00:00–00:20: Neu gebaute FlowSight-Website zeigen
- Founder: "Ich habe für [Firma] eine Website gebaut — schauen Sie kurz."
- Mobile-Viewport, Services, Galerie, Kontakt (schnell durchscrollen)
- Danach: identischer Flow (Lisa, SMS, Leitstand, Formular, CTA)
- Gesamtlänge Rohschnitt Modus 1: ~150–160s
- Separates Briefing pro Prospect in `docs/gtm/videos/[slug]/production_brief.md`

---

## E. REFERENZ: ECHTE LISA-TEXTE (aus Agent-JSON)

Damit der Founder beim Aufnehmen weiss was kommt — nicht auswendig lernen, sondern wissen was Lisa sagen WIRD:

**Greeting (start-node):**
> "Grüezi, hier ist Lisa von der Weinberger AG — schön, dass Sie anrufen. Wie kann ich Ihnen helfen?"

**Notfall-Empathie (global_prompt):**
> "Oh je, das klingt dringend — keine Sorge, da kümmern wir uns sofort drum. Lassen Sie mich nur schnell ein paar Daten aufnehmen, damit unser Pikett-Team sich direkt bei Ihnen melden kann."

**PLZ-Bestätigung (global_prompt, Schritt 5):**
> "[Ort], richtig?" (z.B. "Thalwil, richtig?")

**Off-Topic Nebenfrage (global_prompt, main-node Inline):**
> Sinngemäss: "Dafür sind wir leider nicht zuständig." + macht weiter mit Intake

**Off-Topic als Hauptanliegen (node-out-of-scope):**
> "Leider können wir Ihnen dabei nicht weiterhelfen — das liegt ausserhalb unseres Fachgebiets. Für solche Anliegen wenden Sie sich am besten an den Gewerbeverband in Ihrer Region. Ich wünsche Ihnen trotzdem einen schönen Tag, auf Wiederhören!"

**Closing nach Intake (node-closing-intake):**
> "Vielen Dank, ich habe alles notiert. Sie erhalten gleich eine SMS auf Ihr Handy — dort können Sie die erfassten Daten nochmals prüfen, bei Bedarf korrigieren und auch Fotos vom Schaden hochladen. Das hilft unserem Techniker, sich optimal vorzubereiten. Ich wünsche Ihnen alles Gute, auf Wiederhören!"

**Hinweis:** Lisa ist LLM-basiert (GPT-4.1). Antworten sind sinngemäss, nicht wortgleich. Der Founder sollte sich nicht wundern wenn Lisa leicht anders formuliert — das ist normal und wirkt natürlicher.

---

## F. ZUSAMMENFASSUNG: Was muss bereit sein

| # | Was | Verifiziert? |
|---|-----|-------------|
| 1 | Testnummer +41 43 505 11 01 funktioniert | □ E2E-Testanruf |
| 2 | Lisa sagt "Weinberger AG" korrekt | □ Im Testanruf gehört |
| 3 | SMS kommt an, Absender "Weinberger" | □ SMS auf Handy behalten |
| 4 | Leitstand zeigt Testfall | □ Nach Testanruf geprüft |
| 5 | `/start/weinberger-ag` lädt fehlerfrei | □ Mobile + Desktop |
| 6 | `julweinberger.ch` lädt | □ Hero sauber |
| 7 | Browser: 3 Tabs, keine PII | □ Vorbereitet |
| 8 | Handy: Nicht-Stören, SMS oben | □ Vorbereitet |
| 9 | Loom Starter: Screen + Camera, ext. Mikro | □ Getestet |
| 10 | Skript-Karte neben Laptop | □ Ausgedruckt |
| 11 | Licht, Ruhe, Tür zu | □ Geprüft |
| 12 | `DEMO_SIP_CALLER_ID` auf Vercel gesetzt | □ Founder prüft |
