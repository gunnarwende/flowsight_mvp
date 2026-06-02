# Founder Review: Obrist Sanitär

**Slug:** obrist-sanitaer
**Datum:** 2026-06-02
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 4 Seiten
2. **Zefix verifiziert:** nicht gefunden (keine UID)
3. **Google Places:** 4.7★ bei 10 Bewertungen
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
| **Brand-Farbe** | #1389ca | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`OS`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | ⚠️ (fehlt) | `voice_agent.opening_hours` |
| Inhaber/GL | Beat Obrist | `voice_agent.owner_names` |
| Team | Geschäftsleitung: Beat Obrist | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 6345 Neuheim | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Obrist Sanitär | |
| Zefix UID | nicht gefunden | |
| Google | 4.7★ / 10 Reviews | |
| Domain | Sanitär und Heizung | |
| Case-ID Prefix | OS | |
| SMS Sender | ObristSanit | |
| Brand Color | #1389ca | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (1 PLZs) | 6345 Neuheim | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | info@obrist-sanitaer.ch | |
| Video Hook | Seit 1985 für Sie da. | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Obrist Sanitär. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten."

**Einzugsgebiet-Frage:** "Wir sind in Neuheim und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an info@obrist-sanitaer.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Edlibachstrasse 40, 6345 Neuheim."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Notdienst:** "24/7-Service: 079 668 68 48 041 755 28 48 info@obrist-sanitaer.ch SANITÄR HEIZUNG TEAM KONTAKT 24/7 NOTFALL + − Leaflet | © OpenStreetMap contributors Kontaktieren Sie uns. Beat Obrist und sein Team f"

**Leistungen:** Sanitär: SANITÄR, Ihr Partner im Sanitär- und Heizungsbereich aus Neuheim im Kanton Zug., Sanitäranlagen, Planung und Bau von Sanitäranlagen in Neuheim, Menzingen, Baar, Zug und Umgebung., Wir sind 24/7 für Sie einsatzbereit und kümmern uns um sanitäre oder heizungstechnische Notfälle.
Heizung: HEIZ...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär und Heizung** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug obrist-sanitaer --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
