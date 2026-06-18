# Founder Review: Dieterich AG

**Slug:** schaefli-dieterich
**Datum:** 2026-06-18
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 6 Seiten
2. **Zefix verifiziert:** nicht gefunden (keine UID)
3. **Google Places:** 4.5★ bei 28 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 1 PLZs
5. **Call-Proof:** Notdienst (Variante C) (Betrieb hat Notdienst → Lisa zeigt 24/7-Erreichbarkeit)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

---

## PFLICHT — Founder muss bestätigen (1 Punkte)

> **So geht's:** Unten die Felder prüfen. Vorschlag okay? → Weiter. Anpassen? → Wert direkt in `tenant_config.json` ändern.
> **Datei:** `docs/customers/schaefli-dieterich/tenant_config.json`

### 1. inhaber
Inhaber/GL nicht auf Website identifiziert.
**→ Muss befüllt werden** in `tenant_config.json`

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #0d6efd | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`DG`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | Mo-Do: 07:00-12:00
Fr: 07:00-12:00 | `voice_agent.opening_hours` |
| Inhaber/GL | ⚠️ (nicht gefunden) | `voice_agent.owner_names` |
| Team | ⚠️ (nicht gefunden) | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8500 Frauenfeld | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Dieterich AG | |
| Zefix UID | nicht gefunden | |
| Google | 4.5★ / 28 Reviews | |
| Domain | Sanitär und Heizung | |
| Case-ID Prefix | DG | |
| SMS Sender | DieterichAG | |
| Brand Color | #0d6efd | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (1 PLZs) | 8500 Frauenfeld | |
| Call-Proof | Notdienst (Variante C) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | empfang@haustechnet.ch | |
| Video Hook | Gemeinsam in die Zukunft | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Dieterich AG. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Wir sind Mo-Do: 07:00-12:00, Fr: 07:00-12:00 für Sie erreichbar."

**Einzugsgebiet-Frage:** "Wir sind in Frauenfeld und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an empfang@haustechnet.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Zürcherstrasse 254, 8500 Frauenfeld."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Notdienst:** "– 16:00 7-TAGE SERVICE TEL. 052 723 30 60 Unser Pikettdienst ist bei Notfällen auch ausserhalb der Öffnungszeiten für Sie da. Webdesign Aisberg.ch"

**Leistungen:** Sanitär: Bad- und Heizungsplaner
Heizung: WÄRME, Dünki Wärmetechnik GmbH aus Frauenfeld schliesst sich per 01.07.2026 mit der Schäfli + Dieterich AG zusammen., In einem innovativen Team arbeiten wir stets daran, uns nachhaltig und kontinuierlich weiterzuentwickeln, wodurch wir dy, Geschäftsintegrati...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär und Heizung** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug schaefli-dieterich --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
