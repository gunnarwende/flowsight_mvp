# Take 2 — Storyboard (Frame-genau, v2)

**Gesamtdauer:** 338.4s (5:38)
**Methode:** Screenshots + ffmpeg-Transitions + Audio + PiP Overlay
**Regel:** KEIN Live-Recording. Alles programmatisch generiert.
**Referenz:** 18 Screenflow-Bilder in `docs/customers/doerfler-ag/takes/Scaling/Take2/Screenflow/`

---

## Audio-Timeline (exakt)

| Start | Ende | Dauer | Segment | Inhalt |
|-------|------|-------|---------|--------|
| 0:00.0 | 0:31.8 | 31.8s | Seg1 | Intro "Nehmen wir an..." |
| 0:31.8 | 0:33.0 | 1.2s | Pause | |
| 0:33.0 | 3:45.5 | 192.5s | Seg2 | Call (Founder + Agent) |
| 3:45.5 | 3:47.0 | 1.5s | Pause | |
| 3:47.0 | 4:12.9 | 25.9s | Seg3 | SMS-Erklärung |
| 4:12.9 | 4:13.7 | 0.8s | Pause | |
| 4:13.7 | 4:28.0 | 14.3s | Seg4 | "Ihre eigene {Firma}-App" |
| 4:28.0 | 4:28.6 | 0.6s | Pause | |
| 4:28.6 | 4:54.1 | 25.5s | Seg5 | Leitzentrale-Überblick |
| 4:54.1 | 4:54.9 | 0.8s | Pause | |
| 4:54.9 | 5:38.4 | 43.5s | Seg6 | Falldetail + Abschluss |

---

## Screen-Storyboard (v2 — nach Screenflow-Analyse)

### Erzeugungsschichten

| Schicht | Screens | Methode | Individuell pro Betrieb? |
|---------|---------|---------|--------------------------|
| Samsung Native | S01-S05 | HTML-Templates → Playwright Screenshot | S01 nein, S02-S05 ja (Name, Nummer, Dauer) |
| Leitsystem | S06-S15 | Playwright → Live-App (Magic Link Auth) | Ja (alle KPIs, Fälle, Farben, Firma) |
| Transitions | T01-T08 | ffmpeg crossfade/slide/scroll | Nein (generisch) |

### Phase 1: Homescreen + Intro (0:00 — 0:33)

| Zeitpunkt | Screen | Template / Methode | Bild-Ref | Individuell |
|-----------|--------|--------------------|----------|-------------|
| 0:00.0 | Homescreen mit Leitsystem-App | `S01_homescreen` — statischer Master (echtes Foto) | Bild 1 | Nein |
| 0:30.0 | Homescreen → Kontakte öffnen | **T01** Crossfade 300ms | — | Nein |
| 0:31.0 | Kontakt "{Firma} Test" + Nummer | `S02_kontakt` — `contact_screen.html` | Bild 2 | **Ja** (Name, Nummer) |
| 0:32.5 | Grüner Hörer gedrückt | **T02** Flash 200ms + Crossfade | — | Nein |

### Phase 2: Anruf (0:33 — 3:45)

| Zeitpunkt | Screen | Template / Methode | Bild-Ref | Individuell |
|-----------|--------|--------------------|----------|-------------|
| 0:33.0 | Anruf-Screen "{Firma} Test" 00:00 | `S03_anruf` — `call_screen.html` + ffmpeg drawtext Timer | Bild 3 | **Ja** (Name) |
| 0:33–3:44 | Timer 00:00 → 03:11 | ffmpeg drawtext overlay (tabular-nums, white on gradient) | — | Nein |
| 3:44.0 | Auflegen-Button → Anruf beendet | **T03** Flash 200ms + Crossfade | — | Nein |
| 3:44.5 | "Anruf beendet 03:11" | `S04_anruf_beendet` — `call_ended_screen.html` | Bild 4 | **Ja** (Name, Nummer, Dauer) |
| 3:45.0 | → Homescreen | **T04** Slide-down 400ms | — | Nein |

### Phase 3: SMS (3:47 — 4:13)

| Zeitpunkt | Screen | Template / Methode | Bild-Ref | Individuell |
|-----------|--------|--------------------|----------|-------------|
| 3:46.5 | Homescreen (kurz) | `S01_homescreen` wiederverwendet | Bild 5 | Nein |
| 3:47.0 | SMS-Notification → SMS-App | **T05** Slide-up 500ms | — | Nein |
| 3:47.5 | SMS von "{Firma}" | `S05_sms` — `sms_screen.html` (mit Samsung-Frame) | Bild 6 | **Ja** (Sender, Case-Ref, Zeit) |
| 4:12.0 | SMS → Homescreen | **T06** Slide-down 400ms | — | Nein |

**Bild 7 (dunkler Übergang) ELIMINIERT** — war Scrcpy-Artefakt ("Zurück zum Tab"), wird durch saubere T06→T07 Crossfade ersetzt.

### Phase 4: App öffnen (4:13 — 4:28)

| Zeitpunkt | Screen | Template / Methode | Bild-Ref | Individuell |
|-----------|--------|--------------------|----------|-------------|
| 4:13.7 | Homescreen → Leitsystem-Icon angetippt | **T07** Zoom-in auf App-Icon 400ms | — | Nein |
| 4:14.5 | Leitsystem lädt → Übersicht | `S06_leitsystem_overview` — Playwright | Bild 8 | **Ja** |

### Phase 5: Leitzentrale KPIs (4:28 — 4:54)

| Zeitpunkt | Screen | Template / Methode | Bild-Ref | Individuell |
|-----------|--------|--------------------|----------|-------------|
| 4:28.6 | Übersicht statisch | `S06_leitsystem_overview` | Bild 8 | **Ja** |
| 4:31.0 | "was neu ist" → NEU KPI | `S07_kpi_neu` — Playwright: click NEU → screenshot | Bild 9 | **Ja** |
| 4:33.0 | "was läuft" → BEI UNS | `S08_kpi_bei_uns` — Playwright: click BEI UNS → screenshot | Bild 10 | **Ja** |
| 4:35.0 | "erledigt" → ERLEDIGT | `S09_kpi_erledigt` — Playwright: click ERLEDIGT → screenshot | Bild 11 | **Ja** |
| 4:37.0 | "Bewertungen" → BEWERTUNG | `S10_kpi_bewertung` — Playwright: click BEWERTUNG → screenshot | Bild 12 | **Ja** |
| 4:42.0 | Filter zurücksetzen → Scroll | Playwright: click reset + scroll → screenshot | — | — |
| 4:44.0 | Scrolled table | `S11_tabelle` — Playwright scroll(400px) | Bild 13 | **Ja** |

### Phase 6: Falldetail (4:54 — 5:38)

| Zeitpunkt | Screen | Template / Methode | Bild-Ref | Individuell |
|-----------|--------|--------------------|----------|-------------|
| 4:54.9 | Fall angetippt → Detail | **T08** Slide-right 400ms | — | — |
| 4:56.0 | Falldetail oben | `S12_fall_oben` — Playwright: case detail, scroll(0) | Bild 14 | **Ja** |
| 5:02.0 | Scroll → Beschreibung | `S13_fall_mitte` — Playwright: scroll(250) | Bild 15 | **Ja** |
| 5:10.0 | Scroll → Verlauf | `S14_fall_unten` — Playwright: scroll(550) | Bild 16 | **Ja** |
| 5:20.0 | Zurück zur Übersicht | **T09** Slide-left 400ms | — | — |
| 5:22.0 | Leitsystem Übersicht (fade) | `S06_leitsystem_overview` wiederverwendet | Bild 18 | **Ja** |
| 5:38.0 | Ende | Fade-to-black 500ms | — | — |

---

## Screenshot-Inventar (pro Betrieb)

| ID | Beschreibung | Template/Methode | Parameter |
|----|-------------|-----------------|-----------|
| `S01_homescreen` | Samsung Homescreen + App-Icon | Statischer Master (einmalig) | — |
| `S02_kontakt` | Kontakt "{Firma} Test" | `contact_screen.html` | name, phone, initial |
| `S03_anruf` | Call connected, Timer 00:00 | `call_screen.html` | name, location, start_sec |
| `S04_anruf_beendet` | "Anruf beendet 03:11" | `call_ended_screen.html` | name, phone, duration |
| `S05_sms` | SMS von "{Firma}" | `sms_screen.html` | sender, time, clock, case_ref, token |
| `S06_leitsystem_overview` | KPI-Übersicht | Playwright → /ops/cases | slug, seed data |
| `S07_kpi_neu` | NEU KPI highlighted | Playwright: click NEU | slug |
| `S08_kpi_bei_uns` | BEI UNS highlighted | Playwright: click BEI UNS | slug |
| `S09_kpi_erledigt` | ERLEDIGT highlighted | Playwright: click ERLEDIGT | slug |
| `S10_kpi_bewertung` | BEWERTUNG highlighted | Playwright: click BEWERTUNG | slug |
| `S11_tabelle` | Scrolled table view | Playwright: scroll down | slug |
| `S12_fall_oben` | Case detail top | Playwright: case detail page | slug, case_id |
| `S13_fall_mitte` | Case description expanded | Playwright: scroll 250px | slug, case_id |
| `S14_fall_unten` | Case timeline/Verlauf | Playwright: scroll 550px | slug, case_id |

**Total: 14 Screenshots + 1 Homescreen-Master = 15 Bilder pro Betrieb**

---

## Dynamische Parameter (Logik-Konsistenz)

Wenn 10 Betriebe am Tag durchlaufen, MUSS alles logisch stimmen:

| Parameter | Logik | Beispiel |
|-----------|-------|---------|
| `clock` | Gleiche Uhrzeit auf allen Samsung-Screens | "08:36" |
| `time` | Zeitpunkt des Anrufs = "Heute HH:MM" in Leitsystem | "15:00" |
| `call_duration` | Exakt passend zum Audio (Seg2 Dauer) | "03:11" (191s) |
| `day_label` | Wochentag deutsch aus Datum berechnet | "Freitag · 15:00" |
| `greeting` | Tageszeit-basiert: Morgen/Tag/Abend | "Guten Morgen, Dörfler" |
| `case_ref` | Tenant-Prefix + fortlaufend | "DA-0088" |
| `featured_case` | Immer der neueste Voice-Case in Seed (Rohrbruch, Dringend) | Aus seed_demo_data_v2.mjs |
| `kpi_*` | Müssen zu den gezeigten Fällen passen | Aus Seed-Daten |
| `address` | Stadt aus Tenant-Service-Area (locations[0]) | "8942 Oberrieden" |

---

## Transition-Typen

| ID | Übergang | Methode | Dauer |
|----|----------|---------|-------|
| T01 | Homescreen → Kontakt | Crossfade | 300ms |
| T02 | Kontakt → Anruf | Flash + Crossfade | 200ms |
| T03 | Anruf → Beendet | Flash + Crossfade | 200ms |
| T04 | Beendet → Homescreen | Slide-down | 400ms |
| T05 | Homescreen → SMS | Slide-up (Notification) | 500ms |
| T06 | SMS → Homescreen | Slide-down | 400ms |
| T07 | Homescreen → Leitsystem | Zoom-in auf Icon | 400ms |
| T08 | Tabelle → Falldetail | Slide-right | 400ms |
| T09 | Falldetail → Übersicht | Slide-left | 400ms |

---

## Fixes angewendet (v2)

1. **"Rohr..." Truncation** — `truncate` Klasse von h1 in `cases/[id]/page.tsx` entfernt
2. **"Oberwesen"** — Featured Case in `seed_demo_data_v2.mjs` nutzt korrekte Stadt aus Tenant-Location
3. **Scrcpy "SM-S911B"** — Alle Leitsystem-Screens via Playwright (kein Scrcpy). Samsung-Screens via HTML-Templates.
4. **Bild 7 (dunkler Übergang)** — Eliminiert. Saubere Crossfade-Animation stattdessen.
5. **SMS ohne Samsung-Frame** — `sms_screen.html` hat jetzt Status-Bar + Nav-Bar integriert.
6. **Neues Template** — `call_ended_screen.html` für "Anruf beendet" Screen (Bild 4).

---

## Assembly-Pipeline (1 Kommando pro Betrieb)

```bash
node --env-file=.env.local scripts/_ops/build_take2_screens.mjs \
  --slug=doerfler-ag \
  --name="Dörfler AG Test" \
  --phone="+41 44 505 74 20" \
  --sms-sender="Doerfler AG" \
  --case-ref="DA-88" \
  --time="15:00" \
  --call-duration-sec=191
```

**Output:**
```
production/screens/doerfler-ag/
  S01_homescreen.png        (static master)
  S02_kontakt.png           (HTML template)
  S03_anruf_start.png       (HTML template)
  S03_anruf_end.png         (HTML template)
  S04_anruf_beendet.png     (HTML template)
  S05_sms.png               (HTML template)
  S06_leitsystem_overview.png  (Playwright)
  S07_kpi_neu.png           (Playwright)
  S08_kpi_bei_uns.png       (Playwright)
  S09_kpi_erledigt.png      (Playwright)
  S10_kpi_bewertung.png     (Playwright)
  S11_tabelle.png           (Playwright)
  S12_fall_oben.png         (Playwright)
  S13_fall_mitte.png        (Playwright)
  S14_fall_unten.png        (Playwright)
```

**Founder-Aufwand: 0 Minuten** (alles automatisiert)
**Dauer pro Betrieb: ~3 Min** (Playwright + Templates + ffmpeg)
