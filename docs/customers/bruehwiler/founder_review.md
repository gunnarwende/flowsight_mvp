# Founder Review: Sanitär-Heizung-Solar GmbH

**Slug:** bruehwiler
**Datum:** 2026-06-19
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 5 Seiten
2. **Zefix verifiziert:** nicht gefunden (keine UID)
3. **Google Places:** 5★ bei 6 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 1 PLZs
5. **Call-Proof:** Preis (Variante B) (Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

---

## PFLICHT — Founder muss bestätigen (2 Punkte)

> **So geht's:** Unten die Felder prüfen. Vorschlag okay? → Weiter. Anpassen? → Wert direkt in `tenant_config.json` ändern.
> **Datei:** `docs/customers/bruehwiler/tenant_config.json`

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
| **Brand-Farbe** | #009ddd | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`SG`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | Montag-Donnerstag: 07.00-12.00 und 13.15-17.15
Freitag: 07.00-12.00 und 13.15-16.30 | `voice_agent.opening_hours` |
| Inhaber/GL | ⚠️ (nicht gefunden) | `voice_agent.owner_names` |
| Team | ⚠️ (nicht gefunden) | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8570 Weinfelden | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Sanitär-Heizung-Solar GmbH | |
| Zefix UID | nicht gefunden | |
| Google | 5★ / 6 Reviews | |
| Domain | Sanitär, Heizung und Solar | |
| Case-ID Prefix | SG | |
| SMS Sender | SanitaerHei | |
| Brand Color | #009ddd | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (1 PLZs) | 8570 Weinfelden | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | FEHLT | |
| Video Hook | Seit 1982 für Sie da. | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Sanitär-Heizung-Solar GmbH. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Wir sind Montag-Donnerstag: 07.00-12.00 und 13.15-17.15, Freitag: 07.00-12.00 und 13.15-16.30 für Sie erreichbar."

**Einzugsgebiet-Frage:** "Wir sind in Weinfelden und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an  — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Pestalozzistrasse 22, 8570 Weinfelden."

**Stellen/Bewerbung:** "Ja, wir haben aktuell offene Stellen. Home Dienstleistungen Lieferanten / Partner Bilder Über uns Kontakt Offene Stellen; Offene Stellen; COOKIE EINSTELLUNGEN"

**Leistungen:** Sanitär: Hier erhalten Sie einen groben Überblick über unsere Dienstleistungen: Als renommiertes Sanitärunternehmen sind wir best
Heizung: Heizung
Boiler/Warmwasser: Tropft bei Ihnen ständig der Wasserhahn oder haben Sie Probleme beim Abfluss? Kein Problem: Wir helfen Ihnen gerne und u
Verstopfung/A...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär, Heizung und Solar** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug bruehwiler --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
