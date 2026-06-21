# Vorstellungsmaschine — Umsetzungsplan

> **Stand:** 17.04.2026 | **Deadline:** 30.04.2026 (Philippinen)
> **Budget:** 80h Founder-Fokuszeit
> **Pilot:** Dörfler AG (generisch = Basis für alle)
> **Script:** `docs/gtm/speakflow_template.md` — GEFROREN, keine Änderungen

---

## Reihenfolge pro Take

```
1. AUDIO → Founder nimmt auf (Rode USB)
2. SCREENFLOW → CC baut Screens/Captures passend zum Audio-Timing
3. KAMERA → Founder nimmt PiP-Video auf (Loom, parallel zu Screenflow+Audio)
4. ASSEMBLY → CC fügt alles zusammen → finale MP4
```

## Take-Spezifika

### Take 1: Vorstellung + Kernfrage
- **Audio:** Founder nimmt DURCHGEHEND auf (kein Split, muss fliessen)
- **Screen:** Nur Kamera (Founder gross im Bild)
- **Kamera:** Gross (Face), emotionaler Einstieg
- **Assembly:** Einfachster Take — Audio + Kamera-Video, kein Screenflow

### Take 2: Voice Agent + SMS + Leitsystem
- **Audio:** Founder nimmt in SEGMENTEN auf
- **Screen:** BRUTAL aufwändig:
  - Samsung Phone Screens (Kontakt → Anruf → Call-Timer → Beendet → SMS)
  - Lisa-Stimme im Anruf (Agent TTS, Firmennamen per STS geswapt)
  - Leitsystem (Playwright: Übersicht → Fall-Detail → Scroll)
  - Alles konsistent: Uhrzeit, Datum, Wochentag, Fallnummer, Stadt
- **Kamera:** Klein (PiP), Founder spricht während Screens laufen
- **Assembly:** Screenshot-Timeline + Audio-Sync + PiP-Overlay

### Take 3: Online-Meldung (Wizard + Website)
- **Audio:** Segmente
- **Screen:**
  - Website/Start-Seite (Modus 2: seine echte Website)
  - Wizard-Formular (ausgefüllt mit realistischem Fall)
  - E-Mail-Bestätigung
  - Leitsystem (neuer Fall erscheint)
- **Kamera:** Klein (PiP)
- **Assembly:** Screenshot-Timeline + Audio-Sync + PiP-Overlay

### Take 4: Bewertungen + Abschluss
- **Audio:** Segmente
- **Screen:**
  - Leitsystem: Fall auf "Erledigt" setzen
  - "Bewertung anfragen" Button
  - SMS/E-Mail an Kunden
  - Review Surface (Sterne klicken)
  - Google-Weiterleitung
  - Leitsystem: Bewertung sichtbar
- **Kamera:** Klein → Gross (Abschluss persönlich)
- **Assembly:** Screenshot-Timeline + Audio-Sync + PiP-Overlay + Kamera-Transition

---

## Workflow-Plan (chronologisch)

### Phase 1: Audio-Aufnahmen (Founder, ~4h)
1. Take 1 durchgehend aufnehmen (2-3 Versuche)
2. Take 2 Segmente aufnehmen
3. Take 3 Segmente aufnehmen
4. Take 4 Segmente aufnehmen
5. CC: Audio schneiden, normalisieren (-16 LUFS), beste Segmente auswählen

### Phase 2: Screenflow-Produktion (CC, ~20h)
Pro Take:
1. Audio-Timing analysieren (Marker setzen: "hier klickt er", "hier scrollt er")
2. Dörfler-spezifische Daten vorbereiten (Seed, Featured Case, Datum, Uhrzeit)
3. Samsung-Screens generieren (Templates + Playwright)
4. Leitsystem-Captures (Playwright, authentisiert)
5. Wizard/Website-Captures (Playwright)
6. Timeline bauen: welcher Screen wann, wie lange, welcher Übergang
7. Assembly: Screens + Audio → rohes Take-Video (ohne PiP)

### Phase 3: Kamera-Aufnahmen (Founder, ~3h)
1. Founder schaut sich rohes Take-Video an
2. Nimmt sich per Loom auf WÄHREND er zum Video spricht
3. Pro Take 2-3 Versuche
4. CC: PiP-Overlay ins finale Video einbauen

### Phase 4: Final Assembly + QA (CC + Founder, ~4h)
1. CC: 4 finale MP4s produzieren
2. Founder QA: "Würde ich das abschicken?"
3. Fix-Loop falls nötig
4. Upload auf Vorstellungsseite

---

## Skalierung (nach Dörfler-Pilot)

### Was pro Betrieb individuell sein MUSS:
- Firmenname in Audio (STS Splice)
- Telefonnummer auf Samsung-Screens
- Featured Case (Stadt, PLZ aus seinem Gebiet)
- Google-Sterne (real gecrawlt)
- SMS Sender-Name
- Case-ID-Prefix
- Founder-Einstieg (Kontext-Satz Variante A oder B)

### Was Master bleibt:
- Founder-Audio (Master + STS-Swaps für Firmennamen)
- Founder-Kamera (PiP Master, identisch für alle)
- Script-Wording (gefroren)
- Kamera-Regie + Übergänge
- Audio-Mix-Settings

### Was die Pipeline automatisch erzeugt:
- Samsung-Screens (HTML-Templates, parametrisch)
- Leitsystem-Screenshots (Playwright + Seed)
- SMS-Proof (automatisch nach Anruf)
- Case-Referenz + Stadt + Datum
- Finales MP4 (Assembly-Script)

---

## Kritische Konsistenz-Checks

| Element | Muss übereinstimmen mit | Prüfung |
|---------|------------------------|---------|
| Uhrzeit (Samsung) | Leitsystem-Screenshots + Audio | Manuell |
| Datum/Wochentag | Überall identisch | Automatisch (ein Parameter) |
| Firmenname | Audio + Screens + SMS + Case | STS + Templates |
| Fallnummer (DA-0073) | SMS + Leitsystem | Seed-Script |
| Stadt im Fall | Einzugsgebiet des Betriebs | Seed-Script |
| Google-Sterne | Echte Google-Bewertung | Crawl-Script |
| Öffnungszeiten | Voice Agent + Website | Prospect Card |

---

## Alte Assets — OBSOLET

Alles was bisher produziert wurde ist OBSOLET:
- `production/doerfler_take2/` — alte Audio-Segmente
- `docs/customers/doerfler-ag/takes/Take1.mp4` — altes Video
- `docs/customers/doerfler-ag/takes/Take2.mp4` — altes Video
- Alle bisherigen Loom-Aufnahmen

Grund: Script wurde komplett überarbeitet (20h Founder-Arbeit).
Neue Aufnahmen starten von Null.
