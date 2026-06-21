# Founder Review: Regiotherm AG

**Slug:** regiotherm
**Datum:** 2026-06-19
**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision

---

## Was die Pipeline automatisch gemacht hat

1. **Website gecrawlt** (Playwright): 4 Seiten
2. **Zefix verifiziert:** Regiotherm AG (CHE-109.289.965)
3. **Google Places:** 4.5★ bei 12 Bewertungen
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
| **Brand-Farbe** | #2b6cb0 | website_home | `tenant.brand_color` |

Der Algorithmus kann die Marken-Farbe nicht sicher von einem Akzent/CTA-Ton unterscheiden — **immer kurz visuell gegen die Website abgleichen.** Firma, Prefix (`RG`), Wizard-Kategorien & Google-Rating sind via Zefix/Google zuverlässig und brauchen i.d.R. keine Korrektur.

---

## 📞 Für den Voice-Agent (SPÄTER — erst vor der Telefon-Schaltung)

> Diese Felder erscheinen in KEINEM Video — sie steuern nur die LIVE-Telefonassistentin (Lisa). Erst bestätigen/befüllen, wenn der Prospect positiv reagiert und ein Telefon-Setup ansteht (kleiner Funnel, NICHT Teil des 10/Tag-Video-Outreach).

| Feld | Auto-Wert | Korrektur-Pfad |
|------|------|------|
| Öffnungszeiten | Mo-Do: 08:00-12:00 und 13:30-16:30 | `voice_agent.opening_hours` |
| Inhaber/GL | Ansprechpartner Administration Finanzen | `voice_agent.owner_names` |
| Team | Geschäftsleitung: Ansprechpartner Admini | `voice_agent.team_section` |
| Einzugsgebiet (Voice-Text) | 8590 Romans | `voice_agent.service_area` |

---

## Konfiguration prüfen

Stimmt das? Wenn etwas falsch ist → in `tenant_config.json` korrigieren.

| Feld | Wert | Stimmt? |
|------|------|--------|
| Firma | Regiotherm AG | |
| Zefix UID | CHE-109.289.965 | |
| Google | 4.5★ / 12 Reviews | |
| Domain | Heizung | |
| Case-ID Prefix | RG | |
| SMS Sender | RegiothermA | |
| Brand Color | #2b6cb0 | |
| Wizard-Kategorien | Verstopfung, Leck, Heizung, Allgemein, Angebot, Kontakt | |
| Seed Cases | 50 | |
| Einzugsgebiet (1 PLZs) | 8590 Romans | |
| Call-Proof | Preis (Variante B) | |
| Phone-Fall | Rohrbruch (Dringend) | |
| Wizard-Fall | Leck (Normal) | |
| Prospect E-Mail | info@regiotherm.ch | |
| Video Hook | Seit 1912 für Sie da. | |

---

## Was Lisa sagen wird (Voice Agent Preview)

> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in `tenant_config.json` unter `voice_agent.*` korrigieren.

**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der Regiotherm AG. Wie kann ich Ihnen helfen?"

**Öffnungszeiten-Frage:** "Wir sind Mo-Do: 08:00-12:00 und 13:30-16:30 für Sie erreichbar."

**Einzugsgebiet-Frage:** "Wir sind in Romans und der näheren Umgebung für Sie da."

**Preis-Frage:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?"

**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"

**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an info@regiotherm.ch — das Team kann das dann direkt einplanen."

**Adresse:** "Sie finden uns an der erweg 6b, 8590 Romans."

**Stellen/Bewerbung:** "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei."

**Notdienst:** "­linie Daten­schutz Impressum Zum Inhalt springen Notfalltelefon Kundenservice Angebote & Services Bera­tung Heiz­sy­steme Kontrolle & Wartung Gas/Biogas HEIZ­SY­STEME Mass­ge­schnei­derte Wärme­lö­su"

**Leistungen:** Heizung: Heiz­sy­steme
Boiler/Warmwasser: Um Ihnen ein optimales Erlebnis zu bieten, verwenden wir Technologien wie Cookies, um Geräteinformationen zu speichern u
Kundendienst: Kundenservice, Angebote & Services, Kontrolle & Wartung, Wir sind Ihr kompe­tenter Ansprech­partner rund ums Gas. Wir unter...

**Scope (Domain):** Lisa nimmt Anliegen im Bereich **Heizung** auf. Alles andere → out_of_scope.

**Kategorien für Intake:** Verstopfung | Leck | Heizung | Allgemein | Angebot | Kontakt

---

## Nächster Schritt

Wenn alles stimmt:
```bash
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug regiotherm --from provision
```

Das provisioniert: Supabase Tenant + Voice Agent + 50 Demo-Cases + Prospect-Zugang.
