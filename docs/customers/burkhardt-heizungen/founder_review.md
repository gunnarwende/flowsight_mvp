# Founder Review: Burkhardt

**Slug:** burkhardt-heizungen
**Datum:** 2026-06-18
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 4 Seiten
2. **Zefix verifiziert:** Burkhardt (CHE-115.764.087)
3. **Google Places:** 4.8★ bei 22 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 3 PLZs
5. **Call-Proof:** Preis (Variante B) (Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

---

## PFLICHT — Founder muss bestätigen (1 Punkte)

> **So geht's:** Unten die Felder prüfen. Vorschlag okay? → Weiter. Anpassen? → Wert direkt in `tenant_config.json` ändern.
> **Datei:** `docs/customers/burkhardt-heizungen/tenant_config.json`

### 1. inhaber
Inhaber/GL nicht auf Website identifiziert.
**→ Muss befüllt werden** in `tenant_config.json`

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #2b6cb0 | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`BU`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | ⚠️ (fehlt) | `voice_agent.opening_hours` |
| Inhaber/GL | ⚠️ (nicht gefunden) | `voice_agent.owner_names` |
| Team | ⚠️ (nicht gefunden) | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8274 Tägerwilen, 8134 Adliswil, 8135 Lan | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Burkhardt | |
| Zefix UID | CHE-115.764.087 | |
| Google | 4.8★ / 22 Reviews | |
| Domain | Sanitär, Heizung und Solar | |
| Case-ID Prefix | BU | |
| SMS Sender | Burkhardt | |
| Brand Color | #2b6cb0 | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (3 PLZs) | 8274 Tägerwilen, 8134 Adliswil, 8135 Langnau am Albis | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | info@burkhardt-heizungen.ch | |
| Video Hook | Gegründet 2015. | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Burkhardt. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten."

**Einzugsgebiet-Frage:** "Wir sind in Tägerwilen und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an info@burkhardt-heizungen.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der 8274 Tägerwilen."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Notdienst:** "n. 24 Std. Reparaturdienst 071 / 669`11`65 Notfallreparaturen und Service an sämtlichen Heizungsanlagen & Sanitärinstallationen Wir beraten Sie gerne und erstellen Ihnen ein Angebot. Rog"

**Leistungen:** Sanitär: Sanitär, Burkhardt Heizungen & Sanitär in Tägerwilen, Seit über 55 Jahren arbeitet die Firma Burkhardt Heizungen & Sanitär professionell rund um Heizungen und Sanitärinst, Heizungsanlagen & Sanitärinstallationen, Roger & Bruno Burkhardt (eidg. FA Chefmonteur-Sanitär & Heizung EFZ)
Heizung: ...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär, Heizung und Solar** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug burkhardt-heizungen --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
