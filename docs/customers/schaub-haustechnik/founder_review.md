# Founder Review: Schaub Haustechnik GmbH

**Slug:** schaub-haustechnik
**Datum:** 2026-06-02
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 3 Seiten
2. **Zefix verifiziert:** Schaub Haustechnik GmbH (CHE-362.756.367)
3. **Google Places:** 4.3★ bei 4 Bewertungen
4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, 6 Wizard-Kategorien, 8 PLZs
5. **Call-Proof:** Preis (Variante B) (Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt)
6. **Voice Agent JSON** generiert: `voice_agent_de.json`

## ✅ Alle Pflichtfelder automatisch abgeleitet

Keine manuelle Eingabe nötig. Direkt weiter mit Provision.

---

## ⚠️ BESTÄTIGEN für die Video-Takes (jetzt — ~30 Sek)

> Nur EIN Feld ist für die Demo-Videos kritisch UND aus der Website schwer zuverlässig zu extrahieren:

| Feld | Auto-Wert (Entwurf) | Quelle | Korrektur-Pfad |
|------|------|------|------|
| **Brand-Farbe** | #e73744 | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`SA`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | Montag-Donnerstag: 7.30-12.00 und 13.00-17.00 | `voice_agent.opening_hours` |
| Inhaber/GL | Team Bünyamin Kökden, Edin Arifagic Geschäftsleitung | `voice_agent.owner_names` |
| Team | Geschäftsleitung: Team Bünyamin Kökden,  | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8800 Thalwil, 8802 Kilchberg, 8803 Rüsch | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Schaub Haustechnik GmbH | |
| Zefix UID | CHE-362.756.367 | |
| Google | 4.3★ / 4 Reviews | |
| Domain | Haustechnik | |
| Case-ID Prefix | SA | |
| SMS Sender | Schaub GmbH | |
| Brand Color | #e73744 | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (8 PLZs) | 8800 Thalwil, 8802 Kilchberg, 8803 Rüschlikon, 8804 Au ZH, 8805 Richterswil, 8810 Horgen, 8820 Wädenswil, 8942 Oberrieden | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | kontakt@schaub-haustechnik.ch | |
| Video Hook | Wir arbeiten mit starken Partnern | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Schaub Haustechnik GmbH. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Wir sind Montag-Donnerstag: 7.30-12.00 und 13.00-17.00 für Sie erreichbar."

**Einzugsgebiet-Frage:** "Wir sind in Horgen und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an kontakt@schaub-haustechnik.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der Aaweiherstrasse 3, 8810 Horgen."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Notdienst:** "en +41 44 718 20 20 kontakt@schaub-haustechnik.ch 24/7 Service Schaub Haustechnik Home Dienstleistungen Unternehmen Referenzen Kontakt Du bist hier: Startseite » Kontakt Öffnungszeiten Montag–Donners"

**Leistungen:** Kundendienst: 24/7 Service

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Haustechnik** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug schaub-haustechnik --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
