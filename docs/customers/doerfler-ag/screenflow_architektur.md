# Screenflow-Architektur — Authentische App-Animationen fuer Video-Pipeline

**Datum:** 2026-04-14
**Owner:** CC + Founder
**Status:** Definition. Umsetzung wenn Founder bereit fuer Video-Aufnahmen.
**Referenz-Betrieb:** Doerfler AG (Gold-Standard, Take 2)
**Skalierung:** Dynamisch pro Betrieb via Parameter (Name, Farbe, Faelle, Nummer)

---

## Problem

Der aktuelle Screenflow in der Video-Pipeline wirkt wie eine PowerPoint-Praesentation von 2010:

| Problem | IST-Zustand | SOLL-Zustand |
|---------|------------|-------------|
| **Button-Tap** | Weisser Highlight-Fleck, trifft Button nicht exakt | Press-State (scale 0.95, Hintergrund abdunkeln), 150ms, exakte Position |
| **App-Oeffnung** | Harter Cut: Screenshot A → Screenshot B | Scale-Animation 0.95→1.0 + Fade, 300ms, wie echte iOS/Android-App |
| **Scroll** | Gar nicht moeglich — harter Cut zwischen Scroll-Positionen | Smooth Scroll mit Deceleration (ease-out), Playwright scrollTo() |
| **Seitenwechsel** | Harter Cut | Slide-left/right (300ms), wie echte App-Navigation |
| **SMS-Notification** | Harter Cut: kein SMS → SMS sichtbar | Slide-down von oben (500ms), wie echte Notification |
| **Anruf-Aufbau** | Harter Cut: Kontakt → Anruf-Screen | Flash + Fade (200ms), Screen-Wechsel wie echtes Telefon |
| **Anruf beenden** | Harter Cut | Slide-down (400ms), zurueck zum Homescreen |
| **Timer** | Funktioniert (drawtext Overlay) | Behalten — einziges gutes Element |

---

## Loesung: Zwei Schichten

### Schicht 1: Samsung-Screens (S01-S05) — Animierte HTML-Templates

Die Samsung-Screens (Homescreen, Kontakt, Anruf, Anruf beendet, SMS) sind BEREITS HTML-Templates in `scripts/_ops/screen_templates/`. Aktuell werden sie als statische Screenshots gerendert.

**Aenderung:** Templates werden zu animierten Sequenzen umgebaut. Playwright nimmt sie als VIDEO auf (nicht als Screenshot).

#### S01 → S02: Homescreen → Kontakt oeffnen

```
IST:  Screenshot S01 (3s) → harter Cut → Screenshot S02
SOLL: Playwright Video-Recording:
  1. Homescreen sichtbar (2s)
  2. Tap-Animation auf Kontakte-Icon (scale 0.95, 150ms)
  3. Slide-up Transition: Kontakt-App oeffnet sich von unten (300ms ease-out)
  4. Kontakt "{Firma} Test" sichtbar mit Nummer
  5. Tap-Animation auf gruenen Hoerer (scale 0.95 + Farb-Pulse gruen, 200ms)
```

**Umsetzung:** CSS-Animationen im HTML-Template + Playwright `page.waitForTimeout()` fuer Timing.

#### S02 → S03: Kontakt → Anruf starten

```
IST:  Screenshot S02 → harter Cut → Screenshot S03 (Dialing)
SOLL:
  1. Gruener Hoerer press-state (150ms)
  2. Screen flasht kurz weiss (100ms)
  3. Crossfade zu Anruf-Screen "Wird angerufen..." (200ms)
  4. Nach 1.5s: "Wird angerufen..." → "Verbunden" (Crossfade 200ms)
  5. Timer startet bei 00:00
```

#### S03 → S04: Anruf → Anruf beendet

```
IST:  Screenshot S03 → harter Cut → Screenshot S04
SOLL:
  1. Roter Hoerer press-state (150ms)
  2. Kurzer Flash (100ms)
  3. Crossfade zu "Anruf beendet" Screen (200ms)
  4. Anrufdauer sichtbar: "03:11"
```

#### S04 → S01 → S05: Anruf beendet → Homescreen → SMS

```
IST:  Harter Cut zu Homescreen → Harter Cut zu SMS
SOLL:
  1. "Anruf beendet" (1.5s)
  2. Slide-down: zurueck zum Homescreen (400ms)
  3. Homescreen (1s)
  4. SMS-Notification slidet von OBEN rein (500ms ease-out, wie echte Notification)
  5. Tap auf Notification → SMS-App oeffnet sich (slide-up, 300ms)
  6. SMS von "{Firma}" sichtbar
```

### Schicht 2: Leitsystem-Screens (S06-S15) — Playwright Video-Recording

Die Leitsystem-Screens werden NICHT mehr als Screenshots aufgenommen, sondern als **Playwright Video-Recording** der echten App.

**Playwright-Capabilities die wir nutzen:**
- `page.video()` — nimmt den gesamten Browser-Viewport als Video auf
- `page.click()` — klickt echte Buttons (mit echten CSS :active States)
- `page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }))` — echtes Smooth-Scrolling
- `page.waitForTimeout(1000)` — natuerliche Pausen zwischen Aktionen
- `page.goto()` — echte Seitennavigation mit echter Lade-Animation

#### Leitsystem-Sequenz (Playwright Video)

```
1. App oeffnet: page.goto('/ops/cases') → Ladebalken → Content erscheint
   - ECHTE Lade-Animation der Next.js App (kein Fake)
   - Dauer: ~2s

2. Leitzentrale-Uebersicht (S06): 3s statisch
   - FlowBar mit KPIs sichtbar
   - Falltabelle darunter

3. KPI-Taps (S07-S10): page.click('button:has-text("Neu")')
   - ECHTER Button-Highlight (CSS :active state)
   - ECHTE Filter-Animation in der Tabelle
   - 0.8s pro KPI, dann naechster

4. Scroll zur Tabelle (S11): page.evaluate(() => scrollTo({ top: 350, behavior: 'smooth' }))
   - ECHTES Smooth-Scrolling mit Deceleration
   - Dauer: 1s

5. Fall oeffnen (S12-S14): page.click() auf Tabellenzeile
   - ECHTE Seitennavigation (Router-Transition)
   - Falldetail laedt mit echtem Content
   - Scroll durch Fall: page.evaluate(() => scrollTo({ top: 250, behavior: 'smooth' }))
   - Dann weiter scrollen: scrollTo({ top: 550 })

6. Zurueck zur Uebersicht (S15): page.goBack()
   - ECHTE Browser-Back-Navigation
```

**Ergebnis:** Ein durchgehendes Video (~90s) das die ECHTE App zeigt — mit echtem Scrolling, echten Klicks, echten Animationen. Kein einziger harter Cut.

---

## Dynamische Parameter pro Betrieb

Alles was sich pro Betrieb aendert, wird VOR der Aufnahme gesetzt:

| Parameter | Wie gesetzt | Beispiel Doerfler | Beispiel Leuthold |
|-----------|------------|-------------------|-------------------|
| **Firmenname** (Kontakt, Anruf, SMS) | HTML-Template Variable | "Doerfler AG Test" | "Leuthold Test" |
| **Telefonnummer** | HTML-Template Variable | "+41 44 505 74 20" | "+41 44 505 30 19" |
| **SMS-Absender** | HTML-Template Variable | "Doerfler AG" | "Leuthold" |
| **Case-Ref** | HTML-Template Variable | "DA-88" | "WL-42" |
| **Brand-Color** (Leitsystem) | Cookie-Switch (fs_active_tenant) | #2b6cb0 | #203784 |
| **Faelle + KPIs** | Seed-Daten (seed_demo_data_v2.mjs) | 70 Doerfler-Cases | 70 Leuthold-Cases |
| **Featured Case** | Seed-Daten (Rohrbruch, Seestrasse 14) | Stadt aus Doerfler-Config | Stadt aus Leuthold-Config |
| **Greeting** | Aus Tenant-Config | "Guten Morgen, Doerfler" | "Guten Morgen, Leuthold" |

**Skalierungslogik:** 1 Kommando pro Betrieb generiert ALLES:

```bash
node --env-file=.env.local scripts/_ops/record_screenflow.mjs \
  --slug=doerfler-ag \
  --name="Doerfler AG Test" \
  --phone="+41 44 505 74 20" \
  --sms-sender="Doerfler AG" \
  --call-duration-sec=191
```

---

## Technische Umsetzung

### Neues Script: `record_screenflow.mjs`

Ersetzt die Screenshot-basierte Pipeline (`build_take2_screens.mjs` + `assemble_take2_video.mjs`) durch Video-basierte Pipeline.

```
PHASE 1: Samsung-Screens als Video (Playwright + animierte HTML-Templates)
  1. Playwright oeffnet samsung_sequence.html (animierte Sequenz: Homescreen → Kontakt → Anruf → SMS)
  2. CSS-Animationen laufen automatisch mit korrektem Timing
  3. Playwright nimmt Video auf (page.video())
  4. Output: samsung_sequence.webm (~30s)

PHASE 2: Leitsystem als Video (Playwright + echte App)
  1. Playwright oeffnet flowsight.ch/ops/cases (mit Auth-Cookie fuer Tenant)
  2. Skript fuehrt Aktionen aus: KPI-Klicks → Scroll → Fall oeffnen → Scroll → Zurueck
  3. Playwright nimmt Video auf
  4. Output: leitsystem_sequence.webm (~90s)

PHASE 3: Assembly (FFmpeg)
  1. Samsung-Video (30s) + Leitsystem-Video (90s) → screen_complete.webm
  2. Timer-Overlay auf Anruf-Phase (wie bisher, FFmpeg drawtext)
  3. PiP-Compositing (Founder-Kamera oben-rechts, wie bisher)
  4. Audio-Sync (Founder-Narration + Agent-Call)
  5. Loudnorm -14 LUFS
  6. Output: take2_final.mp4
```

### Animierte Samsung-Sequenz (1 HTML-Datei statt 5 Templates)

Statt 5 separate HTML-Templates wird 1 animierte Sequenz gebaut:

```html
<!-- samsung_sequence.html — automatische Animation, Playwright nimmt auf -->
<div id="phone-frame">
  <!-- State 1: Homescreen (0-2s) -->
  <div class="state homescreen" data-start="0" data-end="2">
    [Homescreen mit App-Icons]
  </div>

  <!-- Transition: Tap + Slide-up (2-2.5s) -->

  <!-- State 2: Kontakt (2.5-4s) -->
  <div class="state contact" data-start="2.5" data-end="4">
    [{firma} Test, {phone}, gruener Hoerer]
  </div>

  <!-- Transition: Tap + Flash (4-4.3s) -->

  <!-- State 3: Anruf "Wird angerufen..." (4.3-5.5s) -->
  <!-- State 4: Anruf verbunden + Timer (5.5-{call_end}s) -->
  <!-- State 5: Anruf beendet (1.5s) -->
  <!-- Transition: Slide-down zu Homescreen -->
  <!-- State 6: Homescreen (1s) -->
  <!-- Transition: Notification slide-down -->
  <!-- State 7: SMS von "{firma}" -->
</div>

<script>
  // Timing-Engine: startet Animationen basierend auf data-start/data-end
  // Alle Werte kommen aus URL-Parametern (slug, firma, phone, etc.)
</script>
```

**Pro Betrieb aendern sich nur die URL-Parameter.** Das HTML/CSS/JS bleibt identisch.

### Playwright Video-Recording (bereits verfuegbar)

```javascript
// Playwright hat eingebautes Video-Recording
const context = await browser.newContext({
  recordVideo: {
    dir: outputDir,
    size: { width: 1080, height: 2340 } // Samsung S23 nativ
  }
});

const page = await context.newPage();
// ... Aktionen ausfuehren ...
await context.close(); // Video wird gespeichert
```

---

## Referenz-Implementierung: Doerfler AG Take 2

### Timeline (aus take2_storyboard.md)

| Zeit | Was | Methode IST | Methode NEU |
|------|-----|------------|-------------|
| 0:00-0:33 | Homescreen + Intro | Screenshot S01 (statisch) | Samsung-Sequenz Video (Homescreen) |
| 0:33-0:35 | Kontakt oeffnen + Tap | Harter Cut S01→S02 | Samsung-Sequenz Video (Tap-Animation + Slide-up) |
| 0:35-3:44 | Anruf (Timer laeuft) | Screenshot S03 + FFmpeg Timer | Samsung-Sequenz Video (Dialing→Connected) + Timer |
| 3:44-3:46 | Anruf beenden | Harter Cut S03→S04 | Samsung-Sequenz Video (Flash + Fade) |
| 3:46-3:47 | Homescreen kurz | Harter Cut | Samsung-Sequenz Video (Slide-down) |
| 3:47-4:13 | SMS Notification + Oeffnen | Harter Cut zu S05 | Samsung-Sequenz Video (Notification slide-down) |
| 4:13-5:38 | Leitsystem (KPIs, Scroll, Falldetail) | Screenshots S06-S15 (statisch) | Playwright Video (echte App mit echtem Scroll) |

### Doerfler-spezifische Parameter

```javascript
{
  slug: "doerfler-ag",
  firma: "Doerfler AG Test",
  phone: "+41 44 505 74 20",
  smsSender: "Doerfler AG",
  caseRef: "DA-88",
  callDurationSec: 191,
  brandColor: "#2b6cb0",
  tenantId: "d0000000-0000-0000-0000-000000000002",
  featuredCase: "Rohrbruch, Seestrasse 14, 8942 Oberrieden"
}
```

---

## Skalierung: Von Doerfler auf N Betriebe

### Was einmalig gebaut wird (Doerfler als Referenz)

1. `samsung_sequence.html` — animierte Samsung-Sequenz mit URL-Parametern
2. `record_screenflow.mjs` — Playwright-Script fuer Samsung + Leitsystem Video-Recording
3. Timing-Konfiguration (welche Aktion wann, synchron zum Audio)
4. FFmpeg Assembly-Pipeline (PiP + Audio + Timer)

### Was pro Betrieb laeuft (automatisch, 1 Kommando)

```bash
node --env-file=.env.local scripts/_ops/record_screenflow.mjs --slug={slug} --name="{Firma} Test" --phone="{nummer}" --sms-sender="{sender}" --call-duration-sec=191
```

**Dauer:** ~5 Min (Playwright Recording) + ~5 Min (FFmpeg Assembly) = ~10 Min pro Betrieb
**Founder-Aufwand:** 0 Minuten (alles automatisch)
**Kosten:** CHF 0 (kein API-Call, alles lokal)

### Was sich pro Betrieb WIRKLICH aendert

| Element | Automatisch per Parameter |
|---------|--------------------------|
| Firmenname in Samsung-Screens | Template-Variable |
| Telefonnummer | Template-Variable |
| SMS-Absender | Template-Variable |
| Brand-Color im Leitsystem | Cookie-Switch (Tenant-ID) |
| KPI-Zahlen | Seed-Daten (vorher generiert) |
| Faelle in der Tabelle | Seed-Daten |
| Featured Case (Falldetail) | Seed-Daten |
| Case-ID Prefix | Aus Tenant-Config |

### Was IDENTISCH bleibt

| Element | Warum identisch |
|---------|----------------|
| Samsung-Animationen (Tap, Slide, Notification) | Identisches Betriebssystem |
| Leitsystem-Interaktionen (KPI-Klick, Scroll, Fall-oeffnen) | Identische App |
| Timing (wann welcher Screen) | Synchron zum generischen Audio |
| PiP-Overlay (Founder-Kamera) | Einmalige Aufnahme, wiederverwendbar |
| Audio (Founder + Agent) | Master-Aufnahme + Agent-Greeting-Splice |

---

## Qualitaets-Gates

| # | Check | Schwelle |
|---|-------|---------|
| 1 | Kein einziger harter Cut zwischen Samsung-Screens | 0 harte Cuts |
| 2 | Scroll im Leitsystem ist smooth (kein Ruckeln) | Visuell fluessig |
| 3 | Button-Taps treffen den Button exakt | Pixel-genau |
| 4 | SMS-Notification wirkt wie echte Notification | Founder sagt "sieht echt aus" |
| 5 | App-Oeffnung hat natuerliche Animation | Scale + Fade, nicht harter Cut |
| 6 | Gesamter Screenflow wirkt wie echtes Screen-Recording | Nicht von manuellem Recording unterscheidbar |

---

## Abhaengigkeiten

| Was | Muss vorher existieren |
|-----|----------------------|
| Seed-Daten | `seed_demo_data_v2.mjs` muss gelaufen sein |
| Tenant in DB | `provision_trial.mjs` muss gelaufen sein |
| Auth-Cookies | `generate_auth_link.mjs` muss gelaufen sein |
| Samsung Base-Images | `production/screen_masters/` (bereits vorhanden) |
| Audio (Founder + Agent) | Master-Aufnahme muss existieren |

---

## Zusammenfassung

**Das Screenflow-Problem ist KEIN AI-Problem. Es ist ein Animations-Problem.**

Die Loesung: Playwright Video-Recording (echte App) + CSS-animierte Samsung-Templates (echte Transitions). Kein Kling, kein AI-Video. Stattdessen: echte Software, echt aufgenommen, echt animiert.

**Kosten pro Betrieb:** CHF 0 (alles lokal, kein API)
**Dauer pro Betrieb:** ~10 Min (automatisch)
**Qualitaet:** Nicht von echtem Screen-Recording unterscheidbar
**Skalierung:** 1 Kommando pro Betrieb, alle Parameter dynamisch
