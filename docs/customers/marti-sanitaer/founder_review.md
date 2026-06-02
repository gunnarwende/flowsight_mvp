# Founder Review: Marti Sanitär

**Slug:** marti-sanitaer
**Datum:** 2026-06-02
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): ? Seiten
2. **Zefix verifiziert:** nicht gefunden (keine UID)
3. **Google Places:** 4.6★ bei 14 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 0 PLZs
5. **Call-Proof:** Preis (Variante B) (Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

---

## PFLICHT — Founder muss bestätigen (2 Punkte)

> **So geht's:** Unten die Felder prüfen. Vorschlag okay? → Weiter. Anpassen? → Wert direkt in `tenant_config.json` ändern.
> **Datei:** `docs/customers/marti-sanitaer/tenant_config.json`

### 1. prospect_email
Keine E-Mail auf Website gefunden. Founder muss E-Mail beschaffen.
**→ Muss befüllt werden** in `tenant_config.json`

### 2. inhaber
Inhaber/GL nicht auf Website identifiziert.
**→ Muss befüllt werden** in `tenant_config.json`

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #2a5fb0 | logo_van (Option1) | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`MS`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | ⚠️ (fehlt) | `voice_agent.opening_hours` |
| Inhaber/GL | ⚠️ (nicht gefunden) | `voice_agent.owner_names` |
| Team | ⚠️ (nicht gefunden) | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | ⚠️ | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Marti Sanitär | |
| Zefix UID | nicht gefunden | |
| Google | 4.6★ / 14 Reviews | |
| Domain | Haustechnik | |
| Case-ID Prefix | MS | |
| SMS Sender | MartiSanita | |
| Brand Color | #2a5fb0 | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (0 PLZs) |  | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | FEHLT | |
| Video Hook | 4.6 Sterne bei 14 Google-Bewertungen. | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Marti Sanitär. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten."

**Einzugsgebiet-Frage:** "Wir sind in der Region für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an  — das Team kann das dann direkt einplanen."

**Adresse:** ""

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Leistungen:** (leer)

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Haustechnik** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug marti-sanitaer --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
