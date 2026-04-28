# Founder Review: Stark Haustechnik GmbH

**Slug:** stark-haustechnik
**Datum:** 2026-04-21
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 3 Seiten
2. **Zefix verifiziert:** Stark Haustechnik GmbH (CHE-339.375.820)
3. **Google Places:** 4.8★ bei 18 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 16 PLZs
5. **Call-Proof:** Notdienst (Variante C) (Betrieb hat Notdienst → Lisa zeigt 24/7-Erreichbarkeit)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

## ✅ Alle Pflichtfelder automatisch abgeleitet

Keine manuelle Eingabe nötig. Direkt weiter mit Provision.

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Stark Haustechnik GmbH | |
| Zefix UID | CHE-339.375.820 | |
| Google | 4.8★ / 18 Reviews | |
| Domain | Sanitär, Heizung, Lüftung und Solar | |
| Case-ID Prefix | SH | |
| SMS Sender | Stark GmbH | |
| Brand Color | #003478 | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (16 PLZs) | 8001 Zürich, 8002 Zürich, 8003 Zürich, 8004 Zürich, 8005 Zürich, 8006 Zürich, 8008 Zürich, 8032 Zürich (+8 weitere) | |
| Call-Proof | Notdienst (Variante C) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | info@stark-haustechnik.ch | |
| Video Hook | zuverlässig und zu fairen Preisen, um Ihnen die optimale Lösung zu bieten | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Stark Haustechnik GmbH. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Wir sind Montag-Freitag: 08:00-17:00 für Sie erreichbar."

**Einzugsgebiet-Frage:** "Wir sind in Adliswil und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an info@stark-haustechnik.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Zürichstrasse 103, 8134 Adliswil."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Notdienst:** "Pikettdienst Rufen Sie uns im Notfall an, egal um welche Uhrzeit. +41 79 961 76 91 +41 76 310 29 71 STARTSITE UNTERNEHMEN DIENSTLEISTUNGEN SERVICEAUFTRÄGE AKTUELL REFERENZEN KONTAKT KONTAKT Shke"

**Leistungen:** Sanitär: STARK HAUSTECHNIK BERATUNG UND PLANUNG FÜR SANITÄR, HEIZUNG, LÜFTUNG UND ENERGIEBERATUNG, Langjährige Erfahrung und kompetentes Fachwissen machen uns zu Ihrem Partner für die Planung von Sanitär, Heizung, Lüftu
Heizung: STARK HAUSTECHNIK BERATUNG UND PLANUNG FÜR SANITÄR, HEIZUNG, LÜFTUNG UN...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär, Heizung, Lüftung und Solar** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug stark-haustechnik --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
