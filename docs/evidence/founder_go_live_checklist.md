# Founder Go-Live Checklist

> Arbeite diese Liste von oben nach unten durch.
> Pro Test: Ergebnis eintragen + Screenshot in `docs/evidence/screenshots/` ablegen.
> Wenn alles PASS → Go/No-Go Entscheid am Ende.

---

## Vorbereitung

- [ ] Handy bereit (Samsung S23)
- [ ] Zweites Gerät oder Laptop für Ops Dashboard
- [ ] Screenshots-Ordner erstellt: `docs/evidence/screenshots/`

---

## Test 1: Voice — Anruf als Kunde

**Was:** Ruf die Brand-Nummer an und melde einen fiktiven Schaden.

| Schritt | Aktion | Zielzustand |
|---------|--------|-------------|
| 1.1 | Wähle **+41 44 552 09 19** (Peoplefone Brand-Nr) | Retell Agent "Susi" meldet sich auf Deutsch |
| 1.2 | Sage: "Ich habe einen Wasserschaden im Keller" | Agent fragt nach Details (PLZ, Dringlichkeit) |
| 1.3 | PLZ eingeben: z.B. **8942** | Agent wiederholt Ziffern einzeln: "acht, neun, vier, zwei" |
| 1.4 | Gespräch abschliessen | Agent verabschiedet sich, Anruf endet sauber |
| 1.5 | E-Mail checken | Ops-Notification E-Mail erhalten (Betreff mit Dringlichkeit) |

**Ergebnis:**
- [ ] PASS / FAIL
- Call ID (falls sichtbar): _______________
- Screenshot: `screenshots/01_voice_anruf.png`
- Screenshot: `screenshots/02_voice_email.png`
- Notizen: _________________________________

---

## Test 2: Wizard — Schaden online melden

**Was:** Fülle den Wizard als Kunde aus.

| Schritt | Aktion | Zielzustand |
|---------|--------|-------------|
| 2.1 | Öffne **flowsight.ch/doerfler-ag/meldung** | 3-Schritt-Formular erscheint |
| 2.2 | Schritt 1: Kategorie + Dringlichkeit wählen | Weiter-Button aktiv |
| 2.3 | Schritt 2: PLZ, Beschreibung, Kontaktdaten eingeben | Validierung OK |
| 2.4 | Schritt 3: Absenden | Bestätigungsmeldung erscheint |
| 2.5 | E-Mail checken (Ops) | Ops-Notification E-Mail erhalten |
| 2.6 | E-Mail checken (Reporter) | Bestätigungs-E-Mail an eingegebene Adresse |

**Ergebnis:**
- [ ] PASS / FAIL
- Case ID (aus E-Mail): _______________
- Screenshot: `screenshots/03_wizard_formular.png`
- Screenshot: `screenshots/04_wizard_bestaetigung.png`
- Screenshot: `screenshots/05_wizard_email_ops.png`
- Screenshot: `screenshots/06_wizard_email_reporter.png`
- Notizen: _________________________________

---

## Test 3: Ops Dashboard — Fall bearbeiten

**Was:** Logge dich ins Ops Dashboard ein und bearbeite die soeben erstellten Fälle.

| Schritt | Aktion | Zielzustand |
|---------|--------|-------------|
| 3.1 | Öffne **flowsight.ch/ops/login** und einloggen | Dashboard Fallliste erscheint |
| 3.2 | Finde den Voice-Fall (Test 1) | Fall sichtbar mit korrekten Details (PLZ, Kategorie, Dringlichkeit) |
| 3.3 | Finde den Wizard-Fall (Test 2) | Fall sichtbar mit korrekten Details |
| 3.4 | Öffne einen Fall → Status ändern (z.B. "in_progress") | Status-Update gespeichert |
| 3.5 | Termin setzen → ICS-Einladung senden | E-Mail mit Kalender-Einladung erhalten |
| 3.6 | Foto hochladen (Testbild) | Upload erfolgreich, Bild sichtbar |
| 3.7 | Review anfragen (Button klicken) | Review-E-Mail versendet (review_sent_at gesetzt) |

**Ergebnis:**
- [ ] PASS / FAIL
- Screenshot: `screenshots/07_ops_fallliste.png`
- Screenshot: `screenshots/08_ops_falldetail.png`
- Screenshot: `screenshots/09_ops_termin_email.png`
- Screenshot: `screenshots/10_ops_foto_upload.png`
- Notizen: _________________________________

---

## Test 4: Kunden-Website — Gesamteindruck

**Was:** Prüfe die Dörfler AG Website auf Vollständigkeit und Qualität.

| Schritt | Aktion | Zielzustand |
|---------|--------|-------------|
| 4.1 | Öffne **flowsight.ch/kunden/doerfler-ag** | Seite lädt schnell, kein Flackern |
| 4.2 | Hero-Bereich | Firmenname, Tagline, Brand-Farbe blau, CTA-Buttons |
| 4.3 | Leistungen aufklappen | Beschreibung + Bildergalerie erscheint |
| 4.4 | Bild in Galerie klicken | Lightbox öffnet sich, Prev/Next funktioniert |
| 4.5 | "Schaden melden" klicken | Wizard öffnet sich (/doerfler-ag/meldung) |
| 4.6 | Reviews-Bereich | 4.7 Sterne, 2 Bewertungskarten zentriert |
| 4.7 | Kontaktbereich | Adresse, Telefon, E-Mail, Google Maps sichtbar |
| 4.8 | Mobile Check (Samsung S23) | Alles responsive, nichts abgeschnitten |

**Ergebnis:**
- [ ] PASS / FAIL
- Screenshot: `screenshots/11_website_hero.png`
- Screenshot: `screenshots/12_website_leistungen.png`
- Screenshot: `screenshots/13_website_lightbox.png`
- Screenshot: `screenshots/14_website_mobile.png`
- Notizen: _________________________________

---

## Test 5: FlowSight Marketing — Demo-Buchung

**Was:** Prüfe die eigene FlowSight Website + Demo-Booking.

| Schritt | Aktion | Zielzustand |
|---------|--------|-------------|
| 5.1 | Öffne **flowsight.ch** | Homepage lädt, Navy+Gold Design |
| 5.2 | "Demo vereinbaren" klicken | Formular erscheint |
| 5.3 | Formular ausfüllen + absenden | Bestätigung erscheint |
| 5.4 | E-Mail checken | Demo-Anfrage E-Mail erhalten |
| 5.5 | Pricing-Seite prüfen | flowsight.ch/pricing lädt korrekt |
| 5.6 | Impressum + Datenschutz | Beide Seiten erreichbar |

**Ergebnis:**
- [ ] PASS / FAIL
- Screenshot: `screenshots/15_flowsight_homepage.png`
- Screenshot: `screenshots/16_demo_email.png`
- Notizen: _________________________________

---

## Test 6: Notfall-Szenario

**Was:** Simuliere einen Notfall-Anruf ausserhalb der Öffnungszeiten.

| Schritt | Aktion | Zielzustand |
|---------|--------|-------------|
| 6.1 | Ruf **+41 44 552 09 19** an | Agent meldet sich |
| 6.2 | Sage: "Rohrbruch, es ist dringend, Wasser überall" | Agent erkennt Notfall, fragt nach Adresse/PLZ |
| 6.3 | Nach Anruf: E-Mail prüfen | Ops-Notification mit Dringlichkeit "Notfall" / rotes Label |

**Ergebnis:**
- [ ] PASS / FAIL
- Screenshot: `screenshots/17_notfall_email.png`
- Notizen: _________________________________

---

## Go/No-Go Entscheid

### Zusammenfassung

| Test | Ergebnis |
|------|----------|
| 1. Voice Anruf | ☐ PASS / ☐ FAIL |
| 2. Wizard | ☐ PASS / ☐ FAIL |
| 3. Ops Dashboard | ☐ PASS / ☐ FAIL |
| 4. Kunden-Website | ☐ PASS / ☐ FAIL |
| 5. Marketing + Demo | ☐ PASS / ☐ FAIL |
| 6. Notfall-Szenario | ☐ PASS / ☐ FAIL |

### Entscheid

- [ ] **GO** — Alle Tests PASS. Bereit für Kundengespräche.
- [ ] **NO-GO** — Blocker gefunden (siehe Notizen oben). CC fixt vor nächstem Versuch.

**Datum:** _______________
**Unterschrift Founder:** _______________

---

### Nach Go-Live

- [ ] Screenshots committed: `git add docs/evidence/screenshots/ && git commit -m "evidence: founder go-live checklist completed"`
- [ ] STATUS.md: Dörfler AG Go-Live Status → LIVE
- [ ] Erste Kundengespräche terminieren
