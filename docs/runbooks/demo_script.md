# Demo-Skript: FlowSight 15-Min Remote Demo

**Zielgruppe:** Sanitär-/Heizungsbetriebe Schweiz (5–25 MA)
**Dauer:** 15 Minuten (Remote, Screen-Share)
**Demo-Firma:** Brunner Haustechnik AG (fiktiv, Thalwil)
**Stand:** 2026-03-03
**Demo-Kit:** `demo-kit/` (Setup-Script, Audio-Proof, Reset-SQL, Cheat Sheet)
**Cheat Sheet:** `demo-kit/CHEAT_SHEET.md` (1 Seite, ausdrucken!)

---

## Guardrails (KRITISCH — auswendig lernen!)

| Regel | Warum | Konsequenz bei Verstoss |
|-------|-------|------------------------|
| **Immer PLZ + Ort nennen** beim Lisa-Anruf | Webhook rejected ohne PLZ/Ort | Kein Case im Dashboard, keine SMS, Demo-Killer |
| **Kein Englisch** während Lisa-Anruf (DE) | Trigger-Words ("hello", "please", "english") feuern Language-Gate | Lisa transferiert zum INTL-Agent, Anruf unterbrochen |
| **Max 3 Min** pro Lisa-Anruf | Agent hat 7-Min-Limit (`max_call_duration_ms: 420000`) | Retell trennt den Anruf |
| **Dry-Run-Nummer** für Tests vor der Demo | Jeder Anruf erzeugt SMS an Caller-Nummer | Doppel-SMS auf Demo-Handy = unprofessionell |
| **"Gesamter Bildschirm"** teilen, nie "Fenster" | "Include computer sound" gibt es NUR bei Screen-Share | Prospect hört Lisa nicht |

### Dry-Run vs. Live

| | Dry-Run (Vorbereitung) | Live (Demo) |
|---|---|---|
| **Anruf-Nummer** | 044 505 48 18 (gleich) | 044 505 48 18 (gleich) |
| **Caller-Handy** | Persönliches Handy / Zweitnummer | Demo-Handy (das auf Screen-Mirror läuft) |
| **Warum trennen** | Dry-Run-SMS landen auf persönlichem Handy, Demo-Handy zeigt nur Live-SMS |
| **Nach Dry-Run** | Reset ausführen: `demo-kit/RESET_FULL.sql` |

---

## Vorbereitung (10 Min vorher)

### Browser-Tabs vorbereiten (in Reihenfolge)

1. **Tab 1:** `flowsight.ch` (FlowSight Marketing-Website)
2. **Tab 2:** `flowsight.ch/brunner-haustechnik` (Kunden-Website — High-End Demo)
3. **Tab 3:** `flowsight.ch/brunner-haustechnik/meldung` (Wizard)
4. **Tab 4:** `flowsight.ch/ops/cases` (Dashboard, eingeloggt mit Brunner-Tenant)
5. **Tab 5:** E-Mail-Postfach (für eingehende Notifications)
6. **Tab 6:** Softphone / Browser-Dialer (für Lisa-Anruf vom Laptop)

### Preflight-Checkliste

**Audio (P0 — ohne das keine Voice-Demo möglich):**
- [ ] MicroSIP gestartet, Status "Online"
- [ ] MicroSIP Audio Output = **System-Speakers** (NICHT Headset!)
- [ ] Teams Mikro/Speaker = **Headset**
- [ ] Windows Exclusive Mode deaktiviert (siehe `demo-kit/setup_demo.ps1`)
- [ ] Audio-Proof durchgeführt: `demo-kit/AUDIO_PROOF.md` → **PASS**

**Tabs + Screen:**
- [ ] 6 Browser-Tabs offen (siehe Tab-Liste oben)
- [ ] Dashboard zeigt Brunner-Cases (10 Seed Cases, keine Test-Altlasten)
- [ ] E-Mail-Postfach offen (Founder-Adresse)
- [ ] Handy per USB verbunden, Screen-Mirror aktiv (für SMS-Demo)
- [ ] Screen-Share: **"Gesamter Bildschirm"** + **"Computersound einschliessen"** ✅
- [ ] Alle Notifications stumm (Windows Focus Assist, Handy Stummschalten)

**Final Check (mit Prospect im Call):**
- [ ] "Hören Sie mich gut?"
- [ ] "Sehen Sie meinen Bildschirm?"

---

## Demo-Ablauf

### Min 0–1: Einstieg + Kunden-Website

> "Stellen Sie sich vor, Sie sind die Brunner Haustechnik AG in Thalwil. So sieht Ihre Website bei FlowSight aus."

**Zeigen:**
- Tab 2: `/brunner-haustechnik`
- Scrolle durch: Hero → Services → Notdienst-Banner → Reviews → Team → Einzugsgebiet
- **Highlight:** "Alles automatisch generiert aus Ihren Daten. Wir richten das für Sie ein — in einer Woche."

### Min 1–3: Wizard live ausfüllen

> "Ein Kunde hat ein Problem und geht auf Ihre Website. So meldet er es."

**Zeigen:**
- Tab 3: `/brunner-haustechnik/meldung`
- Fülle live aus:
  - Kategorie: **Verstopfung**
  - Dringlichkeit: **Dringend**
  - Adresse: Seestrasse 42, 8800 Thalwil
  - Telefon: +41 79 000 00 00
  - E-Mail: demo@flowsight.ch
  - Beschreibung: "Abfluss in der Küche komplett verstopft, Wasser steht."
- **Submit** → Bestätigungsseite zeigen
- Tab 5: E-Mail zeigen → **"Schauen Sie — die E-Mail ist schon da."**

**Wow-Moment:** Echtzeit E-Mail-Benachrichtigung innert Sekunden.

### Min 3–5: Brunner Voice Agent anrufen (LIVE!)

> "Jetzt zeige ich Ihnen den zweiten Kanal. Die meisten Kunden rufen an — und da nimmt Ihr persönlicher Assistent ab."

**Aktion — Intake-Demo:**
- Softphone/Browser-Dialer: **044 505 48 18** anrufen
- Lisa meldet sich: "Guten Tag, hier ist Lisa — die digitale Assistentin der Brunner Haustechnik AG. Wie kann ich Ihnen helfen?"
- Beispiel-Fall durchspielen: "Ich habe einen Rohrbruch im Keller, es tropft von der Decke!"
- Agent sammelt Details natürlich (PLZ, Dringlichkeit, Beschreibung)
- Auflegen

> "Lisa nimmt 24/7 ab, in 5 Sprachen. Kein Anruf geht mehr verloren. Und das Ticket ist schon im System."

**Wow-Moment:** Live-Telefonat mit Lisa — Fall erscheint sofort im Dashboard.

### Min 5–6: Info-Anruf zeigen (optional, aber starker Effekt)

> "Und das Beste: Der Agent beantwortet auch die lästigen Alltagsfragen."

**Aktion — Info-Demo:**
- Nochmal **044 505 48 18** anrufen (Softphone)
- Frage: "Haben Sie heute noch offen?" → Agent antwortet mit Öffnungszeiten
- Frage: "Was kostet ungefähr eine Rohrreinigung?" → Agent gibt Richtwert
- Frage: "Kommen Sie auch nach Wädenswil?" → Agent bestätigt Einzugsgebiet
- Bedanken → Agent verabschiedet sich

> "Diese Anrufe kennen Sie — sie stören Ihren Arbeitsfluss und bringen kein Geld. Lisa übernimmt das."

**Wow-Moment:** Lisa beantwortet Alltagsfragen kompetent und freundlich — KEIN Ticket erstellt.

### Min 6–7: SMS-Nachverfolgung zeigen

> "Und jetzt passiert noch etwas: Der Anrufer bekommt automatisch eine SMS."

**Zeigen:**
- Handy-Screen am Laptop (Screen-Mirror)
- SMS von "BrunnerHT" zeigen: Bestätigungs-SMS mit Korrektur-Link
- Link antippen → Verify-Page zeigen
- **Highlight:** "Hier kann der Kunde seine Angaben prüfen, korrigieren und ein Foto hochladen — alles DSGVO-konform, mit Einmal-Link."

**Wow-Moment:** Automatisierte SMS-Nachverfolgung — der Kunde fühlt sich betreut, Sie haben bessere Daten.

### Min 7–9: Dashboard zeigen

> "Und wo landen all diese Fälle? In Ihrem Dashboard — automatisch, ohne dass Sie etwas tun müssen."

**Zeigen:**
- Tab 4: Dashboard
- **KPI-Kacheln** oben: Gesamt, Heute neu, In Bearbeitung, Erledigt (7 Tage)
  - **Click-to-Filter:** Klick auf "Heute neu" → Liste filtert sofort → "Ein Klick und Sie sehen nur die neuen Fälle."
- **Fälle-Liste:** Mix aus neuen, kontaktierten, geplanten und erledigten Fällen
  - **Highlight:** "Hier sehen Sie den Rohrbruch-Fall von eben — direkt aus dem Telefonat."
- **Fall öffnen** (z.B. den Notfall-Rohrbruch FS-0010):
  - Kontaktdaten, Beschreibung, Dringlichkeit auf einen Blick
  - **Timeline** → "Jeder Schritt ist dokumentiert: Eingang, Kontaktiert, Termin, Erledigt."
  - **Status ändern** → Kontaktiert → Speichern
  - **Termin setzen** → Datum + Uhrzeit wählen → "Der Kunde bekommt automatisch eine ICS-Terminbestätigung per E-Mail — direkt in seinen Kalender."
  - **Foto-Anhänge** → "Der Kunde hat über den SMS-Link ein Foto hochgeladen — Sie sehen den Schaden schon bevor Sie vor Ort sind."

### Min 9–10: Review-Anfrage

> "Und nach getaner Arbeit? Holen Sie sich automatisch eine Google-Bewertung."

**Zeigen:**
- Erledigten Fall öffnen (z.B. FS-0001)
- **"Review anfragen"** Button klicken
- E-Mail zeigen (oder erklären): "Der Kunde bekommt eine freundliche E-Mail mit dem direkten Link zu Ihrem Google-Profil. Ein Klick — fertig."

> "Die meisten Betriebe vergessen Bewertungen. Mit FlowSight passiert das automatisch."

### Min 10–12: Fragen

> "Was sind Ihre ersten Gedanken? Wo sehen Sie den grössten Nutzen für Ihren Betrieb?"

- Aktiv zuhören
- Auf spezifische Bedenken eingehen
- Bei technischen Fragen: "Das richten wir für Sie ein — Sie müssen sich um nichts kümmern."
- Bei "Ich muss drüber nachdenken": "Verstehe ich total. Wir können Ihnen gerne eine Testversion mit Ihrem Firmennamen einrichten — kostet Sie nichts."

### Min 12–14: Preise + 30-Tage-Versprechen

> "Was kostet das?"

**Preise nennen:**
- **Starter** (ab CHF 99/Mt.): Website + Wizard + Bestätigungs-E-Mail + persönliches Onboarding
- **Professional** (ab CHF 249/Mt.): + KI-Telefonassistent Lisa + Ops Dashboard + Foto-Anhänge
- **Premium** (ab CHF 349/Mt.): + Google Reviews + Morning Report + Prioritäts-Support

**Zusatz-Infos (bei Nachfrage):**
- Voice-Minuten: Abrechnung nach Verbrauch, kein Grundpreis für Minuten
- Setup kostenfrei
- Monatlich kündbar, keine Bindung

> "Und unser 30-Tage-Versprechen: Wenn Sie nach 30 Tagen nicht mindestens 10 strukturierte Fälle im Dashboard haben und Ihre erste 5-Sterne-Google-Bewertung — ist der gesamte erste Monat kostenfrei. Null Risiko."

### Min 14–15: Close

> "Sollen wir das für Ihren Betrieb einrichten? Ich brauche nur Ihren Firmennamen, die Adresse und eine Telefonnummer — den Rest machen wir. In einer Woche ist alles live."

- **Nächster Schritt:** Onboarding-Termin vereinbaren
- Kontaktdaten austauschen
- Bedanken + verabschieden

---

## Fallback-Szenarien

### Lisa nimmt nicht ab / Fehler

> "Manchmal braucht die Leitung einen Moment. Das ist die Live-Telefonie — normalerweise klappt das innert 2 Sekunden."

- **Retry:** Nochmal anrufen
- **Plan B:** Überspringen: "Im Normalbetrieb klappt das zuverlässig. Ich zeige Ihnen stattdessen das Dashboard, wo die Fälle ankommen."

### E-Mail kommt verzögert

> "Die E-Mail braucht manchmal 10–15 Sekunden. Das ist die Resend-API im Hintergrund."

- Kurz warten, ggf. Postfach refreshen
- **Plan B:** Screenshot einer früheren E-Mail zeigen

### SMS kommt nicht sofort

> "Die SMS kommt meistens innert 10 Sekunden. Ich zeige Ihnen in der Zwischenzeit das Dashboard."

- Weiter mit Dashboard, SMS später zeigen wenn angekommen
- **Plan B:** Screenshot einer früheren SMS zeigen

### Dashboard lädt langsam

- Seite refreshen
- Ggf. auf vorbereiteten Screenshot zurückgreifen

### Prospect hat Fragen zu Datenschutz

> "Komplett DSGVO-konform. EU-Server. Keine Gesprächsaufnahmen. Der SMS-Link ist HMAC-gesichert — nur der Empfänger kann ihn nutzen."

---

## Reset-Anleitung (vor nächster Demo)

**Vollständiges Reset-SQL:** `demo-kit/RESET_FULL.sql`

Dieses SQL-Script:
1. **Löscht** alle Demo-erstellten Cases (Wizard + Voice) inkl. Events + Attachments (CASCADE)
2. **Setzt** alle 10 Seed Cases auf ihren Original-Status zurück (done/scheduled/contacted/new)
3. **Verifiziert** das Ergebnis mit einer SELECT-Abfrage

**Ausführen:** Supabase Dashboard > SQL Editor > `demo-kit/RESET_FULL.sql` einfügen > Run

**Tipp:** Query als Bookmark im Supabase SQL Editor speichern → 1 Klick vor jeder Demo.

**Nach dem Reset:** Alle Browser-Tabs neu laden.

---

## Key Messages (Elevator-Pitch-Bausteine)

- "Kein Anruf geht mehr verloren — 24/7, in 5 Sprachen."
- "Ihre Kunden sehen eine professionelle Website, nicht eine Baustelle."
- "Vom Anruf bis zur Google-Bewertung — alles in einem System."
- "Setup kostenfrei. Erster Monat gratis. Monatlich kündbar."
- "Wir richten alles für Sie ein — in einer Woche live."
- "30-Tage-Versprechen: 10 Fälle + erste Google-Bewertung — oder der Monat ist gratis."
- "DSGVO-konform, Schweizer Firma, keine Aufnahmen."
