# Hero-Video Storyboard (12–15s Loop)

**Zweck:** Visueller Beweis auf der Homepage — FlowSight ist ein geschlossenes System, kein einzelnes Tool.
**Format:** 1920x1080, 30fps, Loop, MUSS ohne Sound funktionieren.
**Produktionsweg:** Playwright (Captures) + Runway API (AI-Szene) + FFmpeg (Assembly)

---

## Szene 1 — Kontakt (0:00–0:03)

| Feld | Wert |
|------|------|
| **Was man sieht** | Close-up: Smartphone-Display, eingehender Anruf. Warmes Bokeh im Hintergrund. Kein Gesicht, kein Büro — nur das Telefon, das Signal. |
| **Overlay-Text** | **Kontakt** — weiss, Inter 52px, unten links, fade-in 0.3s, fade-out bei 2.8s |
| **Bildquelle** | AI-Szene (Runway API) |
| **Dauer** | 3s |
| **Transition OUT** | Cross-dissolve 0.4s |
| **Stimmung** | Warm, ruhig, nah. Kein Stress, kein Klingeln-Panik. Ein Kontakt, der aufgefangen wird. |
| **No-Go** | Kein hektisches Vibrieren, kein sichtbarer App-Name, kein "Lisa"-Branding im Bild. |

---

## Szene 2 — Rückmeldung (0:03–0:06)

| Feld | Wert |
|------|------|
| **Was man sieht** | SMS-Bestätigung auf Handy-Screen: "Weinberger AG — Ihre Meldung wurde erfasst." Klarer, sauberer UI-Moment. |
| **Overlay-Text** | **Rückmeldung** — weiss, Inter 52px, unten links, fade-in 0.3s |
| **Bildquelle** | UI-Capture (Playwright: SMS-Verify-Seite `/v/[id]`, Mobile Viewport 390x844) |
| **Effekt** | Ken-Burns: langsamer Zoom 105% → 100% über 3s |
| **Dauer** | 3s |
| **Transition OUT** | Cross-dissolve 0.4s |
| **No-Go** | Keine echten Telefonnummern. Demo-Case mit fiktivem Melder. |

---

## Szene 3 — Fall (0:06–0:10)

| Feld | Wert |
|------|------|
| **Was man sieht** | Leitstand Admin-Ansicht: FlowBar mit 4 KPIs, darunter 4-5 Fälle in verschiedenen Status (Neu/blau, Geplant/violett, Erledigt/grün, Gold). Saubere Ordnung. |
| **Overlay-Text** | **Fall** — weiss, Inter 52px, unten links, fade-in 0.3s |
| **Bildquelle** | UI-Capture (Playwright: `/ops/cases`, Weinberger-Tenant, Desktop 1920x1080) |
| **Effekt** | Ken-Burns: sanfter Zoom auf FlowBar (103% → 100%), dann leichter Pan nach unten zur Case-Liste |
| **Dauer** | 4s |
| **Transition OUT** | Cross-dissolve 0.4s |
| **No-Go** | Keine echten Melder-Namen in der Case-Liste. Nur Demo-Cases (is_demo=true). |

---

## Szene 4 — Abschluss (0:10–0:14)

| Feld | Wert |
|------|------|
| **Was man sieht** | Erledigter Fall mit Gold-Status. Review-KPI in der FlowBar zeigt goldene Sterne + "4.4★". Oder: Case-Detail mit Gold-Badge, saubere Timeline "Fall erstellt → Geplant → Erledigt → Bewertung erhalten". Ruhiger Endzustand. |
| **Overlay-Text** | **Abschluss** — gold #d4a853, Inter 52px, unten links, fade-in 0.3s |
| **Bildquelle** | UI-Capture (Playwright: FlowBar Bewertungs-KPI ODER Case-Detail mit Gold-Badge) |
| **Effekt** | Ken-Burns: minimaler Zoom 102% → 100%. Ruhig. |
| **Dauer** | 4s |
| **Transition OUT** | Cross-dissolve 1.0s → zurück zu Szene 1 (Loop) |
| **Stimmung** | Abgeschlossen. Geordnet. Gold = Belohnung. Kein Feature-Reveal, sondern ein ruhiger Endzustand. |
| **No-Go** | Kein "5★ Bewertung" als Text-Overlay. Die Sterne sind im UI sichtbar — nicht doppelt pushen. |

---

## Loop-Logik

Szene 4 endet mit langsamem Cross-dissolve (1.0s) → Szene 1 beginnt. Endlos.

Der Loop muss sich natürlich anfühlen: Gold-Ruhe → warmes Telefon-Bokeh = emotionaler Kreislauf, nicht harter Sprung.

---

## Audio (optional, Hero muss ohne Sound funktionieren)

- Ambient-Track bei -20dB: minimal, confident, ~80-90 BPM
- Kein Beat-Drop, kein Swoosh, kein Corporate-Jingle
- CC empfiehlt 2-3 lizenzfreie Tracks (Tag 6, nach Assembly)

---

## Zusammenfassung

| Szene | Overlay | Dauer | Quelle | CC-Tool |
|-------|---------|-------|--------|---------|
| 1. Kontakt | Kontakt (weiss) | 3s | AI-Szene | Runway API |
| 2. Rückmeldung | Rückmeldung (weiss) | 3s | UI-Capture | Playwright |
| 3. Fall | Fall (weiss) | 4s | UI-Capture | Playwright |
| 4. Abschluss | Abschluss (gold) | 4s | UI-Capture | Playwright |
| Loop-Fade | — | 1s | — | FFmpeg |
| **Total** | | **15s** | | |
