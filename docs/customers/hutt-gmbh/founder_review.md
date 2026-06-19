# Founder Review: Hutt GmbH

**Slug:** hutt-gmbh
**Datum:** 2026-06-19
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 3 Seiten
2. **Zefix verifiziert:** Hutt GmbH (CHE-359.932.333)
3. **Google Places:** 5★ bei 4 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 1 PLZs
5. **Call-Proof:** Preis (Variante B) (Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

## ✅ Alle Pflichtfelder automatisch abgeleitet

Keine manuelle Eingabe nötig. Direkt weiter mit Provision.

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #2b6cb0 | default | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`HG`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | ⚠️ (fehlt) | `voice_agent.opening_hours` |
| Inhaber/GL | Handelsregistereintrag Eingetragene Firma | `voice_agent.owner_names` |
| Team | Geschäftsleitung: Handelsregistereintrag | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8580 Amriswil | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Hutt GmbH | |
| Zefix UID | CHE-359.932.333 | |
| Google | 5★ / 4 Reviews | |
| Domain | Sanitär und Spenglerei | |
| Case-ID Prefix | HG | |
| SMS Sender | Hutt GmbH | |
| Brand Color | #2b6cb0 | |
| Wizard-Kategorien | Verstopfung, Leck, Umbau/Sanierung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (1 PLZs) | 8580 Amriswil | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | info@hutt.ch | |
| Video Hook | zuverlässig ausgeführt | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Hutt GmbH. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten."

**Einzugsgebiet-Frage:** "Wir sind in Amriswil und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an info@hutt.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Weinfelderstrasse 74, 8580 Amriswil."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Leistungen:** Sanitär: Sanitär, Spengler &, Sanitär, Von der kompletten Sanitärinstallation über Reparaturen bis zum regelmässigen Unterhalt. Schnell vor Ort bei Notfällen u, Von massgeschneiderten Motorrad-Umbauten bis zu einzigartigen Badezimmer-Ideen. Ich realisiere deine kreativen Projekte
Umbau/Sanierung: Vo...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär und Spenglerei** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Umbau/Sanierung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug hutt-gmbh --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
