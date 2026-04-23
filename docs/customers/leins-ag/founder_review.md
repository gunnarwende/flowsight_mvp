# Founder Review: Leins AG

**Slug:** leins-ag
**Datum:** 2026-04-20
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision
**Config:** `docs/customers/leins-ag/tenant_config.json`

---

## 1. Was die Pipeline automatisch gemacht hat

| Schritt | Ergebnis |
|---------|----------|
| Website gecrawlt | ? Seiten |
| Zefix verifiziert | nicht gefunden (keine UID) |
| Google Places | 5★ bei 9 Bewertungen |
| Voice Agent | 23 Platzhalter befüllt → `voice_agent_de.json` |
| Wizard | 3 Custom + 3 Fixed = 6 Kategorien |
| Seed | 50 Cases, 8 PLZs |
| Call-Proof | Preis (Variante B) |

---

## 2. Betriebsdaten

> Stimmt das? Wenn nicht → Korrektur in die Spalte "Korrektur Founder" eintragen. CC übernimmt die Änderungen.

| Feld | Wert | Korrektur Founder |
|------|------|------------------|
| Firma | Leins AG | |
| Zefix UID | nicht gefunden | |
| Google | 5★ / 9 Reviews | |
| Adresse | Glärnischstrasse 18, 8810 Horgen | |
| Telefon | 043 244 66 55 | |
| E-Mail | info@leinsag.ch | |
| Website | https://www.leinsag.ch | |
| Gründungsjahr | (nicht bekannt) | |
| Inhaber/GL | Herbert Leins (Geschäftsgründer), Michael Leins (GL Sanitär & Heizung), Beat Leins (GL Spenglerei & Blitzschutz) | |
| Team | Herbert Leins (Geschäftsgründer), Michael Leins (GL Sanitär & Heizung), Beat Leins (GL Spenglerei & Blitzschutz), Tayfun Besinci (Techniker), Skender Bunjaku (Techniker), Renato Schmid (Hilfsmonteur) — 6 Personen | |
| Mitgliedschaften | (keine) | |

---

## 3. Pipeline-Konfiguration

| Feld | Wert | Korrektur Founder |
|------|------|------------------|
| Domain (Lisa Scope) | Spenglerei, Sanitär, Heizung und Blitzschutz | |
| Case-ID Prefix | LN | |
| SMS Sender | Leins AG | |
| Brand Color | #1e5f8c | |
| Wizard Top 3 | Verstopfung, Leck, Heizung | |
| Seed Cases | 50 | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) in Horgen | |
| Wizard-Fall | Leck (Normal) in Thalwil | |
| Prospect E-Mail | info@leinsag.ch | |
| Einzugsgebiet | 8 PLZs: 8810, 8800, 8802, 8803, 8804, 8805 (+2 weitere) | |

---

## 4. Was Lisa am Telefon sagen wird

> Das sind die KONKRETEN Antworten die Lisa gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:**
> "Hallo, hier ist Lisa — die digitale Assistentin der Leins AG. Wie kann ich Ihnen helfen?"

**Öffnungszeiten:**
> "Wir sind Montag bis Freitag von sieben bis zwölf und von halb zwei bis fünf Uhr für Sie erreichbar."

**Einzugsgebiet:**
> "Wir sind in Horgen und der näheren Umgebung für Sie da, also Thalwil, Kilchberg, Wädenswil und die umliegenden Gemeinden."

**Adresse/Anfahrt:** ❗
> "⚠️ FEHLT"

**Preise:**
> "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:**
> "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termine:**
> "Für Termine senden Sie am besten eine kurze Nachricht an info@leinsag.ch — das Team kann das dann direkt einplanen."

**Stellen/Bewerbung:**
> "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Notdienst:**
> "(kein Notdienst)"

**Leistungen (Lisa kennt):**
> Spenglerei: Dachrinnen, Blechverkleidungen, Flachdach
> Sanitär: Installationen, Reparaturen, Badsanierung
> Heizung: Heizungsersatz, Wartung, Wärmepumpen
> Blitzschutz: Blitzschutzanlagen, Erdung, Prüfungen

**Scope:** Lisa nimmt Anliegen im Bereich **Spenglerei, Sanitär, Heizung und Blitzschutz** auf. Alles andere → out_of_scope.

**Intake-Kategorien:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## 5. SMS & Wizard Preview

**SMS nach Anruf (Kunde bekommt):**
> Absender: "Leins AG"
> Text: "Ihre Meldung wurde aufgenommen. Hier können Sie die Daten prüfen und Fotos ergänzen: flowsight.ch/v/LN0088..."

**SMS Erinnerung (24h vor Termin):**
> Absender: "Leins AG"
> Text: "Erinnerung: Morgen [Uhrzeit] kommt Leins AG zu Ihnen. Bei Änderungen: [Link]"

**Wizard (Online-Formular):**
> Brand Color: #1e5f8c
> Reihe 1 (Custom): Verstopfung (Abfluss, WC, Kanalisation) | Leck (Wasserschaden, undichte Stelle) | Heizung (Heizung, Wärmepumpe)
> Reihe 2 (Fix): Allgemein | Angebot | Kontakt

**Review-Seite (Kunde bewertet):**
> Firmenname: Leins AG
> Brand Color: #1e5f8c
> Auftragsreferenz: z.B. "LN-0088 · Rohrbruch in Horgen"

---

## 6. Video-Konfiguration

| Feld | Wert |
|------|------|
| Firma (Display) | Leins AG |
| Firma (Silben) | 3 |
| Telefon (Display) | 043 244 66 55 |
| Prefix (Case-ID) | LN |
| Google Sterne | 5 |
| Call-Proof Variante | Preis (Variante B) |
| Video Hook | 5 Sterne bei 9 Google-Bewertungen. |

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
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug leins-ag --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
