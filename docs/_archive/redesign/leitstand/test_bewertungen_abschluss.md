# Test-Checkliste: Bewertungen Abschluss

> Founder-Test in ~15 Minuten. 3 PRs (#470, #471, #472 + Runde 3).
> Vorbereitung: Login als Admin auf flowsight.ch/ops

---

## Setup: 1 Test-Fall vorbereiten (2 Min)

1. Leitstand offnen: https://flowsight.ch/ops/cases
2. "Neuer Fall" klicken
3. Ausfullen:
   - Name: `Test Bewertung`
   - Telefon: `076 123 45 67` (lokales Format!)
   - E-Mail: `gunnar.wende@flowsight.ch`
   - PLZ/Ort: `8800 Thalwil`
   - Kategorie: **Dropdown sollte Tenant-Kategorien zeigen** (FB35)
4. Speichern

**Pruf-Punkt:** Fall muss sofort in der Liste erscheinen (FB36).

---

## Test 1: Telefon-Normalisierung (1 Min)

1. Fall offnen
2. Kontakt-Bereich: Telefon sollte `+41761234567` zeigen (normalisiert)
3. **Pass?** Nummer wurde beim Speichern automatisch umgewandelt

---

## Test 2: Review-Anfrage per E-Mail (3 Min)

1. Status auf "Erledigt" setzen + speichern
2. "Bewertung anfragen" klicken
3. **Pruf:** Erfolgsmeldung "Gesendet"
4. E-Mail-Postfach prufen: Review-Anfrage muss ankommen
5. Link in E-Mail klicken
6. **Pruf:** Review Surface offnet sich mit Firmen-Branding

---

## Test 3: Review Surface — Positiv-Pfad (3 Min)

1. 5 Sterne klicken
2. **Pruf:** Text "Sterne-Bewertung wurde gespeichert" (FB41 — stimmt jetzt)
3. Chips auswahlen + Freitext eingeben
4. "Auf Google teilen" klicken
5. **Pruf:** Text wird in Zwischenablage kopiert, Google Maps offnet sich
6. Zuruck zur Review-Surface: "Vielen Dank"-Screen

---

## Test 4: Review Surface — Negativ-Pfad (2 Min)

1. Neuen Fall erstellen + auf "Erledigt" + Bewertung anfragen
2. Review-Link offnen
3. 2 Sterne klicken → Negativ-Phase
4. Feedback-Text eingeben → "Feedback senden"
5. **Pruf:** Danke-Meldung erscheint

---

## Test 5: Leitstand nach Bewertung (2 Min)

1. Zuruck zum Fall im Leitstand (oder Seite neu laden)
2. **Pruf:** BewertungEndCap zeigt "Bewertet: XX" mit echten Sternen (BUG-1)
3. **Pruf:** Positiv = Gold-Sterne, Negativ = Rot-Sterne
4. **Pruf:** Verlauf zeigt Review-Text + "Negatives Feedback"-Badge (wenn <=3)
5. SystemCard prufen: Erledigt-Node hat farbigen Rand (FB34)
6. Bewertungs-Node: zeigt Anzahl + Durchschnitt (FB34b)

---

## Test 6: Push-Benachrichtigung (1 Min)

1. Bei Negativ-Bewertung: Push muss ankommen (trotz deaktiviertem Notfall-Push)
2. Einstellungen > Push-Benachrichtigungen prufen:
   - "Immer aktiv" (3 Punkte, nicht deaktivierbar)
   - "Optional" (2 Toggles funktionieren)

---

## Test 7: Fehlermeldungen (1 Min)

1. Fall OHNE Kontaktdaten auf "Erledigt" setzen
2. "Bewertung anfragen" klicken
3. **Pruf:** Deutsche Fehlermeldung "Keine E-Mail oder Telefonnummer..." (FB44)

---

## Test 8: Sicherheit (kurz prufen)

1. Review-Link aus E-Mail: Token in URL vorhanden?
2. Browser-Konsole: POST an /api/review/.../rate enthalt Token?
3. Review-Link nach 90 Tagen theoretisch abgelaufen (nicht testbar, aber Code ist da)

---

## Test 9: Login-Redirect (1 Min)

1. Abmelden
2. Direkt-Link zu einem Fall offnen: https://flowsight.ch/ops/cases/[CASE_ID]
3. **Pruf:** Login-Seite offnet sich
4. Einloggen
5. **Pruf:** Landet auf dem Fall (nicht auf der Fallliste) (FB38)

---

## Schnell-Ergebnis

| # | Test | Pass? |
|---|------|-------|
| 1 | Telefon `076` → `+41` normalisiert | |
| 2 | Review-Anfrage per E-Mail | |
| 3 | Positiv-Pfad (5★ + Google) | |
| 4 | Negativ-Pfad (2★ + Feedback) | |
| 5 | Leitstand zeigt Bewertung + Sterne | |
| 6 | Push bei negativer Bewertung | |
| 7 | Deutsche Fehlermeldung | |
| 8 | Token in API-Calls | |
| 9 | Login-Redirect bewahrt URL | |

---

## Bekannte Limitierungen (kein Bug)

- **Foto-Upload bei Fall-Erstellung:** Geht nur nach Erstellung (Edit-Modus). Feature fur spater.
- **SMS-Test mit `076`:** Funktioniert nur wenn eCall-Allowlist die Nummer enthalt.
- **Push-Preferences:** Nur sichtbar wenn Push auf dem Gerat aktiviert ist.
- **Kategorien-Dropdown:** Nur Betriebe mit Registry-Eintrag haben dynamische Kategorien.
