# Founder Review: Rickenbach AG

**Slug:** rickenbach-ag
**Datum:** 2026-06-19
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 2 Seiten
2. **Zefix verifiziert:** Rickenbach AG (CHE-423.807.530)
3. **Google Places:** 4.6★ bei 7 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 3 PLZs
5. **Call-Proof:** Preis (Variante B) (Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

## ✅ Alle Pflichtfelder automatisch abgeleitet

Keine manuelle Eingabe nötig. Direkt weiter mit Provision.

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #01509f | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`RA`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | Montag: 07.00-11.30 | `voice_agent.opening_hours` |
| Inhaber/GL | Remo Friberg | `voice_agent.owner_names` |
| Team | Geschäftsleitung: Remo Friberg | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8280 Kreuzlingen, 8134 Adliswil, 8135 La | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Rickenbach AG | |
| Zefix UID | CHE-423.807.530 | |
| Google | 4.6★ / 7 Reviews | |
| Domain | Sanitär, Heizung, Spenglerei und Solar | |
| Case-ID Prefix | RA | |
| SMS Sender | RickenbachA | |
| Brand Color | #01509f | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (3 PLZs) | 8280 Kreuzlingen, 8134 Adliswil, 8135 Langnau am Albis | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | info@rickenbach-ag.ch | |
| Video Hook | Seit 1963 für Sie da. | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Rickenbach AG. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Wir sind Montag: 07.00-11.30 für Sie erreichbar."

**Einzugsgebiet-Frage:** "Wir sind in Kreuzlingen und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an info@rickenbach-ag.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Hafenstrasse 11, 8280 Kreuzlingen."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Leistungen:** Sanitär: Rickenbach Sanitär Heizungen Kreuzlingen, Sanitär, fachmännische Leistungen rund um Sanitär, Dienstleistungen und ein Service, der begeistert – Heizung und Sanitär vom Experten in Ihrer Region!
Heizung: Rickenbach Sanitär Heizungen Kreuzlingen, Heizung, professionelle Leistungen rund um Hei...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär, Heizung, Spenglerei und Solar** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug rickenbach-ag --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
