# Founder Review: JulWeinberger

**Slug:** weinberger-ag
**Datum:** 2026-06-01
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 6 Seiten
2. **Zefix verifiziert:** nicht gefunden (keine UID)
3. **Google Places:** 4.4★ bei 20 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 8 PLZs
5. **Call-Proof:** Preis (Variante B) (Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

## ✅ Alle Pflichtfelder automatisch abgeleitet

Keine manuelle Eingabe nötig. Direkt weiter mit Provision.

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #004994 | default | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`JU`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | ⚠️ (fehlt) | `voice_agent.opening_hours` |
| Inhaber/GL | Markus Niedermann | `voice_agent.owner_names` |
| Team | Geschäftsleitung: Markus Niedermann
Unse | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8800 Thalwil, 8802 Kilchberg, 8803 Rüsch | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | JulWeinberger | |
| Zefix UID | nicht gefunden | |
| Google | 4.4★ / 20 Reviews | |
| Domain | Sanitär, Heizung und Lüftung | |
| Case-ID Prefix | JU | |
| SMS Sender | JulWeinberg | |
| Brand Color | #004994 | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 100 | |
| Einzugsgebiet (8 PLZs) | 8800 Thalwil, 8802 Kilchberg, 8803 Rüschlikon, 8804 Au ZH, 8805 Richterswil, 8810 Horgen, 8820 Wädenswil, 8942 Oberrieden | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | info@julweinberger.ch | |
| Video Hook | Seit 1912 für Sie da. | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der JulWeinberger. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten."

**Einzugsgebiet-Frage:** "Wir sind in Thalwil und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an info@julweinberger.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Zürcherstrasse 73, 8800 Thalwil."

**Stellen/Bewerbung:** "Ja, wir haben aktuell offene Stellen. Offene Stellen; Wir sind ein zukunftsorientiertes Unternehmen mit attraktiven Anstellungsbedingungen. Wir legen grossen Wert auf ein gutes Arbeitsklima und die Ausbildung von Lernenden. Eine attraktive Unternehmenskultur fördern wir mit regelmässigen internen Anlässen, Mitarbeiterinformationen und durch die Unterstützung von internen wie externen Weiterbildungen. Ein attraktiver Arbeitgeber zu sein, ist für uns von grosser Bedeutung. Denn davon profitieren schlussendlich alle: das Unternehmen, die Mitarbeitenden und die Kunden.; In dieser Funktion verstehen Sie es, eine Baustelle administrativ und technisch selbständig zu führen, Mitarbeiter zu motivieren und Lernende auszubilden. Dank Ihrem Fachwissen können Sie bei Um- und Neubauten Ihre Erfahrungen einbringen. Zudem passen Sie diese Fähigkeiten den individuellen Kundenbedürfnissen an.; Abgeschlossene Ausbildung als Sanitärinstallateur/in EFZ; Berufserfahrung als selbständiger Monteur"

**Leistungen:** Sanitär: Sanitär / Lüftung, Seit 2007 ist die Ausführung von sanitären Anlagen eine der Kernkompetenzen der Firma. Ob Neubau oder Sanierung – wir re, Gemeinsam mit Ihnen realisieren wir Ihr neues Wunschbad – ganz nach Ihren Bedürfnissen und Budget, sei es eine Kompletts, Sanitärinstallationen
Heizun...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär, Heizung und Lüftung** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug weinberger-ag --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 100 Demo-Cases + Prospect-Zugang.
