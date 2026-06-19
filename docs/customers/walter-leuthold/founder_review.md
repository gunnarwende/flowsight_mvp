# Founder Review: Walter Leuthold, Sanitär-Spenglerei

**Slug:** walter-leuthold
**Datum:** 2026-06-01
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 3 Seiten
2. **Zefix verifiziert:** Walter Leuthold, Sanitär-Spenglerei (CHE-102.025.075)
3. **Google Places:** 4.9★ bei 44 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 8 PLZs
5. **Call-Proof:** Notdienst (Variante C) (Betrieb hat Notdienst → Lisa zeigt 24/7-Erreichbarkeit)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

## ✅ Alle Pflichtfelder automatisch abgeleitet

Keine manuelle Eingabe nötig. Direkt weiter mit Provision.

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #1e73be | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`WL`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | ⚠️ (fehlt) | `voice_agent.opening_hours` |
| Inhaber/GL | Walter Leuthold | `voice_agent.owner_names` |
| Team | Geschäftsleitung: Walter Leuthold | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8800 Thalwil, 8802 Kilchberg, 8803 Rüsch | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Walter Leuthold, Sanitär-Spenglerei | |
| Zefix UID | CHE-102.025.075 | |
| Google | 4.9★ / 44 Reviews | |
| Domain | Sanitär und Spenglerei | |
| Case-ID Prefix | WL | |
| SMS Sender | WalterLeuth | |
| Brand Color | #1e73be | |
| Wizard-Kategorien | Verstopfung, Leck, Boiler, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (8 PLZs) | 8800 Thalwil, 8802 Kilchberg, 8803 Rüschlikon, 8804 Au ZH, 8805 Richterswil, 8810 Horgen, 8820 Wädenswil, 8942 Oberrieden | |
| Call-Proof | Notdienst (Variante C) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | mail@walter-leuthold.ch | |
| Video Hook | Seit 2001 für Sie da. | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Walter Leuthold, Sanitär-Spenglerei. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten."

**Einzugsgebiet-Frage:** "Wir sind in Oberrieden und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an mail@walter-leuthold.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Seestrasse 98a, 8942 Oberrieden."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Notdienst:** "rtung Spengler Auf dem Dach Am Haus Kontakt 7/24h Notfall Kontakt Walter Leuthold Sanitär Haustechnik & Spenglerei Seestrasse 98a 8942 Oberrieden Schweiz +41 44 720 16 90 +41 79 417 74 41 Kontak"

**Leistungen:** Sanitär: Sanitär, Sanitär Haustechnik, Für Ihre Gesundheit, Entspannung und Hygiene sorgt sich Ihr Sanitär. Dank perfekt funktionierenden sanitären Installatio, Sie denken beim Begriff Sanitär sicher zuerst an das Badezimmer mit den Armaturen für Lavabo, Badewanne und Dusche. Aber
Boiler/Warmwasser:...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär und Spenglerei** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Boiler | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug walter-leuthold --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
