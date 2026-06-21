# Founder Review: Serafini Heizung & Sanitär

**Slug:** serafini-heizung
**Datum:** 2026-06-18
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 1 Seiten
2. **Zefix verifiziert:** Serafini Heizung & Sanitär (CHE-431.681.917)
3. **Google Places:** 5★ bei 5 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 3 PLZs
5. **Call-Proof:** Preis (Variante B) (Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

---

## PFLICHT — Founder muss bestätigen (1 Punkte)

> **So geht's:** Unten die Felder prüfen. Vorschlag okay? → Weiter. Anpassen? → Wert direkt in `tenant_config.json` ändern.
> **Datei:** `docs/customers/serafini-heizung/tenant_config.json`

### 1. inhaber
Inhaber/GL nicht auf Website identifiziert.
**→ Muss befüllt werden** in `tenant_config.json`

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #0000ee | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`SE`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | ⚠️ (fehlt) | `voice_agent.opening_hours` |
| Inhaber/GL | ⚠️ (nicht gefunden) | `voice_agent.owner_names` |
| Team | ⚠️ (nicht gefunden) | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8280 Kreuzlingen, 8134 Adliswil, 8135 La | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Serafini Heizung & Sanitär | |
| Zefix UID | CHE-431.681.917 | |
| Google | 5★ / 5 Reviews | |
| Domain | Sanitär und Heizung | |
| Case-ID Prefix | SE | |
| SMS Sender | SerafiniHei | |
| Brand Color | #0000ee | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (3 PLZs) | 8280 Kreuzlingen, 8134 Adliswil, 8135 Langnau am Albis | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | serafini.h.s@gmail.com | |
| Video Hook | Willkommen bei SERAFINI Heizung & Sanitär, Ihrem Experten | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Serafini Heizung & Sanitär. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten."

**Einzugsgebiet-Frage:** "Wir sind in Kreuzlingen und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an serafini.h.s@gmail.com — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Bündtweg 3, 8280 Kreuzlingen."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Leistungen:** Sanitär: Willkommen bei SERAFINI Heizung & Sanitär, Ihrem Experten, für professionelle Sanitär- und Heizungsinstallationen., SERAFINI Heizung & Sanitär ist ein renommiertes Unternehmen, das sich auf die Installation hochwertiger Sanitär- und Hei, SERAFINI Heizung & Sanitär
Heizung: Willkommen bei SE...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär und Heizung** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug serafini-heizung --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
