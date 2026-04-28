# Founder Review: Dörfler AG

**Slug:** doerfler-ag
**Datum:** 2026-04-20
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision
**Config:** `docs/customers/doerfler-ag/tenant_config.json`

---

## 1. Was die Pipeline automatisch gemacht hat

| Schritt | Ergebnis |
|---------|----------|
| Website gecrawlt | 1 Seiten |
| Zefix verifiziert | Dörfler AG (CHE-110.607.871) |
| Google Places | 4.7★ bei 3 Bewertungen |
| Voice Agent | 23 Platzhalter befüllt → `voice_agent_de.json` |
| Wizard | 3 Custom + 3 Fixed = 6 Kategorien |
| Seed | 50 Cases, 8 PLZs |
| Call-Proof | Notdienst (Variante C) |

---

## 2. Betriebsdaten

> Stimmt das? Wenn nicht → Korrektur in die Spalte "Korrektur Founder" eintragen. CC übernimmt die Änderungen.

| Feld | Wert | Korrektur Founder |
|------|------|------------------|
| Firma | Dörfler AG | |
| Zefix UID | CHE-110.607.871 | |
| Google | 4.7★ / 3 Reviews | |
| Adresse | Hubstrasse 30, 8942 Oberrieden | |
| Telefon | 043 443 52 00 | |
| E-Mail | info@doerflerag.ch | |
| Website | https://www.doerflerag.ch | |
| Gründungsjahr | 1926 (3. Generation, seit fast 100 Jahren) | |
| Inhaber/GL | Ramon Dörfler (Sanitärmeister), Luzian Dörfler (Spengler/Heizung) | |
| Team | Ramon und Luzian Dörfler (Geschäftsleitung, 3. Generation seit 2004) | |
| Mitgliedschaften | suissetec (Schweizerisch-Liechtensteinischer Gebäudetechnikverband) | |

---

## 3. Pipeline-Konfiguration

| Feld | Wert | Korrektur Founder |
|------|------|------------------|
| Domain (Lisa Scope) | Sanitär und Heizung | |
| Case-ID Prefix | DA | |
| SMS Sender | Doerfler AG | |
| Brand Color | #2b6cb0 | |
| Wizard Top 3 | Verstopfung, Leck, Heizung | |
| Seed Cases | 50 | |
| Call-Proof | Notdienst (Variante C) | |
| Phone-Fall | Rohrbruch (Dringend) in Oberrieden | |
| Wizard-Fall | Leck (Normal) in Kilchberg | |
| Prospect E-Mail | info@doerflerag.ch | |
| Einzugsgebiet | 8 PLZs: 8800, 8802, 8803, 8804, 8805, 8810 (+2 weitere) | |

---

## 4. Was Lisa am Telefon sagen wird

> Das sind die KONKRETEN Antworten die Lisa gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:**
> "Hallo, hier ist Lisa — die digitale Assistentin der Dörfler AG. Wie kann ich Ihnen helfen?"

**Öffnungszeiten:**
> "Wir sind Montag bis Freitag von sieben bis zwölf und dreizehn bis siebzehn Uhr für Sie da. Am Wochenende ist das Büro geschlossen, aber unser Notdienst ist rund um die Uhr erreichbar."

**Einzugsgebiet:**
> "Ja, wir decken die Region Zimmerberg ab — Oberrieden, Thalwil, Horgen, Kilchberg und die umliegenden Gemeinden am linken Zürichseeufer."

**Adresse/Anfahrt:**
> "Unser Büro ist an der Hubstrasse dreissig in Oberrieden."

**Preise:**
> "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:**
> "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termine:**
> "Für Termine senden Sie am besten eine kurze Nachricht an info@doerflerag.ch — das Team kann das dann direkt einplanen."

**Stellen/Bewerbung:**
> "Ob aktuell Stellen offen sind, kann ich leider nicht sagen. Aber Initiativbewerbungen sind immer willkommen — einfach per E-Mail an info ät doerflerag Punkt ch."

**Notdienst:**
> "24 Stunden, 7 Tage die Woche — für echte Notfälle (Rohrbruch, Überflutung, Heizungsausfall). Auch an Sonn- und Feiertagen erreichbar."

**Leistungen (Lisa kennt):**
> Sanitär: Badezimmer-Renovationen, WC-/Lavabo-Installationen, Armaturen, Abflussreinigung, Rohrbruch-Reparatur
> Heizung: Heizungsersatz, Wärmepumpen, Fussbodenheizung, Heizkörper, Heizungsservice
> Spenglerei: Dachrinnen, Blechverkleidungen, Stehfalzdächer, Kaminverkleidungen
> Solartechnik: Solarthermie und Photovoltaik
> Blitzschutz: Blitzschutzanlagen, Fangstangen, Ableitungen
> Reparaturservice: Notfall-Reparaturen, allgemeine Reparaturen

**Scope:** Lisa nimmt Anliegen im Bereich **Sanitär und Heizung** auf. Alles andere → out_of_scope.

**Intake-Kategorien:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## 5. SMS & Wizard Preview

**SMS nach Anruf (Kunde bekommt):**
> Absender: "Doerfler AG"
> Text: "Ihre Meldung wurde aufgenommen. Hier können Sie die Daten prüfen und Fotos ergänzen: flowsight.ch/v/DA0088..."

**SMS Erinnerung (24h vor Termin):**
> Absender: "Doerfler AG"
> Text: "Erinnerung: Morgen [Uhrzeit] kommt Dörfler AG zu Ihnen. Bei Änderungen: [Link]"

**Wizard (Online-Formular):**
> Brand Color: #2b6cb0
> Reihe 1 (Custom): Verstopfung (Abfluss, WC, Kanalisation) | Leck (Wasserschaden, undichte Stelle) | Heizung (Heizung, Wärmepumpe)
> Reihe 2 (Fix): Allgemein | Angebot | Kontakt

**Review-Seite (Kunde bewertet):**
> Firmenname: Dörfler AG
> Brand Color: #2b6cb0
> Auftragsreferenz: z.B. "DA-0088 · Rohrbruch in Oberrieden"

---

## 6. Video-Konfiguration

| Feld | Wert |
|------|------|
| Firma (Display) | Dörfler AG |
| Firma (Silben) | 4 |
| Telefon (Display) | 043 443 52 00 |
| Prefix (Case-ID) | DA |
| Google Sterne | 4.7 |
| Call-Proof Variante | Notdienst (Variante C) |
| Video Hook | Seit 1926 für Sie da. |

---

## 7. Staff (Dropdown im Video)

| Name | Rolle |
|------|------|
| Max Mustermann | (Dummy-Name) |
| Anna Beispiel | (Dummy-Name) |
| Peter Muster | (Dummy-Name) |

> Hinweis: Im Video werden IMMER Dummy-Namen gezeigt (Max Mustermann etc.). Keine echten Mitarbeiternamen.

---

## Nächster Schritt

```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug doerfler-ag --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
