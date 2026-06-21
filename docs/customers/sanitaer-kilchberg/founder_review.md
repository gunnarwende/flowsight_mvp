# Founder Review: Wälti & Sohn AG

**Slug:** sanitaer-kilchberg
**Datum:** 2026-06-02
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 4 Seiten
2. **Zefix verifiziert:** Wälti & Sohn AG (CHE-190.443.228)
3. **Google Places:** 5★ bei 11 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 16 PLZs
5. **Call-Proof:** Preis (Variante B) (Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

## ✅ Alle Pflichtfelder automatisch abgeleitet

Keine manuelle Eingabe nötig. Direkt weiter mit Provision.

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #0000ee | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`WO`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | ⚠️ (fehlt) | `voice_agent.opening_hours` |
| Inhaber/GL | Heinz Wälti | `voice_agent.owner_names` |
| Team | Geschäftsleitung: Heinz Wälti | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8001 Zürich, 8002 Zürich, 8003 Zürich, 8 | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Wälti & Sohn AG | |
| Zefix UID | CHE-190.443.228 | |
| Google | 5★ / 11 Reviews | |
| Domain | Sanitär, Heizung und Solar | |
| Case-ID Prefix | WO | |
| SMS Sender | Waelti AG | |
| Brand Color | #0000ee | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (16 PLZs) | 8001 Zürich, 8002 Zürich, 8003 Zürich, 8004 Zürich, 8005 Zürich, 8006 Zürich, 8008 Zürich, 8032 Zürich (+8 weitere) | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | info@waeltisohn.ch | |
| Video Hook | Seit 1952 für Sie da. | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Wälti & Sohn AG. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten."

**Einzugsgebiet-Frage:** "Wir sind in Langnau am Albis und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an info@waeltisohn.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Gartenweg 2, 8135 Langnau am Albis."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Leistungen:** Sanitär: SANITÄR, WC, Defekter WC Sitz, WC-Rollenhalter, Griffe, ...), Installationen von WC`s die mit Wasser reinigen
Heizung: HEIZUNG, Heizkörper / Radiatoren / Ventile, Fehlender Komfort (Heizstaab), Reparaturen von bestehenden Heizkörpern, Installation von Thermostatventilen
Boiler/Warmwasser: B...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Sanitär, Heizung und Solar** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug sanitaer-kilchberg --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
