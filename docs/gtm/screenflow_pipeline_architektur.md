# Screenflow Pipeline — Architektur-Entwurf

> **Stand:** 17.04.2026 | **Status:** ENTWURF — Founder-Review nötig
> **Ziel:** 10 Betriebe/Tag, 4 Takes pro Betrieb, 0 Min Founder-Screentime pro Betrieb
> **Qualität:** Pixel-perfekt, nicht von echtem Gerät unterscheidbar

---

## Das Problem

Screenshots aneinandergereiht = künstlich.
Echtes Screen Recording auf Samsung = nicht skalierbar (Reihenfolge-Konflikte, SMS kommt nicht).
HTML-Templates = sehen nicht echt genug aus.

## Der Ansatz: Video-Recording via Playwright

Playwright kann nicht nur Screenshots, sondern **Videos aufnehmen** — inklusive:
- Scroll-Animationen (echte CSS scroll-behavior)
- Klick-Animationen (Touch-Ripple simulierbar)
- Zeitverlauf (Uhr im Header tickt mit)
- Übergänge zwischen Seiten (echte Next.js Page Transitions)

### Pro Take: Playwright navigiert die ECHTE App und nimmt ein Video auf

```
Playwright Script pro Take:
1. Öffne PWA im Mobile-Viewport (412×915, Samsung S24)
2. Setze System-Uhr auf gewünschte Zeit
3. Navigiere Seite für Seite
4. Warte X Sekunden pro Ansicht (passend zum Audio-Timing)
5. Scrolle, klicke, tippe — alles aufgezeichnet
6. Exportiere als MP4/WebM
```

### Was Playwright KANN:
- Echte App im Browser rendern (identisch mit PWA auf Samsung)
- Videos aufnehmen mit `page.video()`
- Maus/Touch-Events simulieren (scroll, click, swipe)
- Viewport exakt auf Samsung-Auflösung setzen
- Cookies/Auth vorab setzen (OTP-Injection)

### Was Playwright NICHT kann:
- Samsung Statusbar (Uhr, Batterie, Signal) → muss als Overlay drübergelegt werden
- Samsung Navigation Bar (Home, Back, Recent) → statisches Overlay
- Anruf-UI (Samsung Phone App) → NICHT die Web-App → braucht separaten Ansatz
- SMS-App (Samsung Messages) → NICHT die Web-App → braucht separaten Ansatz

---

## Zwei Welten: App-Screens vs. Native-Screens

### Welt 1: Web-App (Playwright — automatisierbar)
- Leitsystem (Übersicht, Filter, Falldetail, Scroll)
- Wizard (3 Schritte, ausgefüllt)
- Review Surface (Sterne, Feedback)
- /start-Seite
- Website (/kunden/[slug])

→ **Playwright Video-Recording** mit Samsung-Frame-Overlay

### Welt 2: Native Samsung Screens (NICHT Playwright)
- Homescreen (Wallpaper + App Icons)
- Telefon-App (Kontakt suchen, Anruf läuft, Anruf beendet)
- SMS-App (Nachricht empfangen)

→ **HTML-Nachbildungen** mit Samsung-UI-Kit
→ ODER: **Vorab auf echtem Gerät 1x aufnehmen, dann Firmennamen per Overlay swappen**

---

## Hybrid-Ansatz (Empfehlung)

### Samsung Native Screens: 1x Master-Recording, dann parametrisch swappen

1. Founder nimmt EINMAL auf echtem Samsung auf:
   - Homescreen → Telefon öffnen → "Test" anrufen → Timer läuft → Auflegen → SMS empfangen
   - ~60 Sekunden, einmalig

2. CC baut daraus Templates:
   - Firmenname = Text-Overlay (ffmpeg drawtext)
   - Telefonnummer = Text-Overlay
   - Uhrzeit in Statusbar = Text-Overlay
   - Anrufdauer = Timer-Animation (ffmpeg)

3. Pro Betrieb: ffmpeg swappt die Parameter → pixel-perfektes Samsung-Video

### Web-App Screens: Playwright Video pro Betrieb

1. Seed-Daten laden (pro Betrieb individuell)
2. Playwright öffnet PWA in Samsung-Viewport
3. Navigiert nach Audio-Timeline:
   - Leitsystem öffnen → X Sekunden warten
   - Scroll nach unten → X Sekunden
   - Filter klicken → X Sekunden
   - Fall öffnen → X Sekunden
   - Scroll im Fall → X Sekunden
4. Video exportieren
5. Samsung-Frame + Statusbar als Overlay drüberlegen

### Assembly: Beide Welten zusammenfügen

```
ffmpeg -i samsung_native_{slug}.mp4 -i playwright_leitsystem_{slug}.mp4 \
  -i founder_audio.wav -i founder_pip.mp4 \
  → take2_final_{slug}.mp4
```

---

## Take 2 Screenflow-Sequenz (19 Screens → Video-Segmente)

| Screen | Welt | Was zu sehen ist | Methode |
|--------|------|-----------------|---------|
| 1.1 | Native | Samsung Homescreen | Master + Overlay |
| 1.2 | Native | Finger tippt auf Telefon-App | Master + Overlay |
| 2 | Native | Anruf wird aufgebaut ("Dörfler AG Test") | Master + Text-Swap |
| 3 | Native | Anruf läuft (Timer 00:02) | Master + Timer-Animation |
| 4 | Native | Anruf beendet (00:06, Firmenname, Nummer) | Master + Text-Swap |
| 5.1 | Native | Homescreen (zurück) | Master |
| 5.2 | Native | Finger tippt auf Messages | Master + Overlay |
| 6 | Native | SMS empfangen (Doerfler AG, Freitag 19:20) | Master + Text-Swap |
| 7 | Native | Homescreen (zurück) | Master |
| 8 | Web | Leitsystem Übersicht (13 Neu, 8 Bei uns...) | Playwright Video |
| 9 | Web | Leitsystem gefiltert (Notfall/Dringend) | Playwright Video |
| 10 | Web | Leitsystem gefiltert (Geplant/Leck) | Playwright Video |
| 11 | Web | Leitsystem gefiltert (Erledigt) | Playwright Video |
| 12.1 | Web | Leitsystem Bewertungen-KPI (4.7★) | Playwright Video |
| 12.2 | Web | Leitsystem Bewertungen-KPI Close-up + Filter | Playwright Video |
| 13 | Web | Leitsystem Übersicht (ungefiltert, zurück) | Playwright Video |
| 14 | Web | Leitsystem Scroll nach unten (Fallliste) | Playwright Video |
| 15 | Web | Falldetail (DA-0088, Rohrbruch, Übersicht) | Playwright Video |
| 16 | Web | Falldetail Scroll (Beschreibung sichtbar) | Playwright Video |
| 17 | Web | Falldetail Scroll (Verlauf, Kontakt) | Playwright Video |
| 18 | Web | Falldetail (zurück nach oben, Übersicht) | Playwright Video |
| 19 | Web | Leitsystem Übersicht (zurück) | Playwright Video |

---

## Konsistenz-Parameter (EIN Objekt steuert alles)

```json
{
  "betrieb": "Dörfler AG",
  "slug": "doerfler-ag",
  "telefon": "+41 44 505 74 20",
  "prefix": "DA",
  "datum": "2026-04-17",
  "wochentag": "Freitag",
  "uhrzeit_start": "08:35",
  "sms_zeit": "08:36",
  "sms_sender": "Doerfler AG",
  "featured_case": {
    "ref": "DA-0088",
    "kategorie": "Rohrbruch",
    "beschreibung": "Der Anrufer steht im Keller knöcheltief im Wasser...",
    "adresse": "Seestrasse 14, 8942 Oberrieden",
    "melder_phone": "+41764458942",
    "dringlichkeit": "Dringend"
  },
  "kpis": {
    "neu": 13,
    "bei_uns": 8,
    "erledigt": 11,
    "bewertung_avg": 4.7,
    "bewertung_erhalten": 3,
    "bewertung_angefragt": 4
  }
}
```

Seed-Script MUSS exakt diese Zahlen produzieren.
Samsung-Screens MÜSSEN diese Uhrzeit/Datum zeigen.
Leitsystem MUSS diese KPIs anzeigen.

---

## Offene Fragen an Founder

1. Soll die Uhr im Video WIRKLICH ticken (Sekunde für Sekunde) oder reicht es wenn sie pro Screen-Wechsel ~1 Min weiterspringt?
2. Samsung Homescreen: Dein echtes Wallpaper (Zürichsee-Foto) oder ein generisches?
3. Anruf-Timer: Soll er von 00:00 hochzählen (animiert) oder reicht ein statischer Wert?
4. SMS: Soll die Nachricht "einfahren" (Animation) oder statisch angezeigt werden?
5. Leitsystem Scrolling: Smooth-Scroll oder harte Sprünge?

---

## Zeitschätzung (ehrlich)

| Arbeitpaket | Aufwand | Wer |
|-------------|---------|-----|
| Samsung Master-Video aufnehmen (1×) | 30 Min | Founder |
| ffmpeg Parameter-Swap Pipeline bauen | 8h | CC |
| Playwright Video-Recording Pipeline bauen | 12h | CC |
| Seed-Script exakte KPIs erzeugen | 4h | CC |
| Assembly Pipeline (Native + Web + Audio + PiP) | 8h | CC |
| Samsung Frame + Statusbar Overlay | 4h | CC |
| QA + Iteration | 8h | CC + Founder |
| **TOTAL** | **~44h CC + 2h Founder** | |

Verbleibend nach Screenflow: ~36h für Take 1/3/4, Audio, Kamera, Assembly, BigBen.
