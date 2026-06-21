# Founder Review: Künzi Haustechnik AG

**Slug:** kuenzi-haustechnik
**Datum:** 2026-06-19
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 4 Seiten
2. **Zefix verifiziert:** Künzi Haustechnik AG (CHE-106.743.608)
3. **Google Places:** 5★ bei 12 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 1 PLZs
5. **Call-Proof:** Preis (Variante B) (Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

---

## PFLICHT — Founder muss bestätigen (1 Punkte)

> **So geht's:** Unten die Felder prüfen. Vorschlag okay? → Weiter. Anpassen? → Wert direkt in `tenant_config.json` ändern.
> **Datei:** `docs/customers/kuenzi-haustechnik/tenant_config.json`

### 1. inhaber
Inhaber/GL nicht auf Website identifiziert.
**→ Muss befüllt werden** in `tenant_config.json`

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #2b6cb0 | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`KH`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | ⚠️ (fehlt) | `voice_agent.opening_hours` |
| Inhaber/GL | ⚠️ (nicht gefunden) | `voice_agent.owner_names` |
| Team | Unser Team besteht aus 13 Mitarbeitenden | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 9548 Matzingen | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Künzi Haustechnik AG | |
| Zefix UID | CHE-106.743.608 | |
| Google | 5★ / 12 Reviews | |
| Domain | Sanitär, Heizung, Lüftung und Solar | |
| Case-ID Prefix | KH | |
| SMS Sender | Kuenzi AG | |
| Brand Color | #2b6cb0 | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 70 | |
| Einzugsgebiet (1 PLZs) | 9548 Matzingen | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | info@myls.ch | |
| Video Hook | Seit 1989 für Sie da. | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Künzi Haustechnik AG. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten."

**Einzugsgebiet-Frage:** "Wir sind in Matzingen und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an info@myls.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der 9548 Matzingen."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Notdienst:** "052 376 41 50 / Hauptnummer 052 376 30 39 / Notfallnummer info@kuenzi-haustechnik.ch Öffnungszeiten Mo. - Fr. 07:00 - 17:00 Uhr Sa. und So. geschlossen Hier klicken © 2026– Designed by myls Gm"

**Leistungen:** Sanitär: Ihre Sanitär- und Heizungsinstallationen erstellt, unterhaltet oder instandstellt?, Ihr Badezimmer renoviert und verschönert?, Sanitär
Heizung: Ihre Sanitär- und Heizungsinstallationen erstellt, unterhaltet oder instandstellt?, Heizungssanierungen kompetent ausführt?, Wie Wärmepumpen und So...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär, Heizung, Lüftung und Solar** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug kuenzi-haustechnik --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 70 Demo-Cases + Prospect-Zugang.
