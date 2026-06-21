# T4 Master Spec — Dörfler AG (Apr-30 Founder-Gold)

**Source:** `master_takes/_REFERENCE_doerfler-ag_approved_2026-04-30/T4_doerfler-ag_with_mouse.mp4`
**Total Duration:** 176.90s (1440×900, 30fps)
**Extracted:** 2026-05-30
**Precision:** Phase-Boundaries ±0.1s, Animations ±0.05s
**JSON-SoT:** `take4_master_spec.json`

---

## 1. Monitor-Screen Phasen (22 Phasen über 176.9s)

| ID | Master-Time | Dauer | Content (Kurz) | Audio-Cue |
|----|-------------|-------|----------------|-----------|
| M01 | 0.0 – 10.1 | 10.1s | Dashboard "Guten Morgen, Dörfler" — KPI **3\|6\|21\|4.7** — Case-Liste 12 Cases — Loom klein bottom-left | "Zum Schluss möchte ich..." |
| M02 | 10.1 – 13.9 | 3.8s | Case-Detail Leck DA-0050 — Status **Neu** — Verlauf: Fall erstellt + SMS — Loom **GROSS** top-left | "in den eben erstellten Fall..." |
| M03 | 13.9 – 17.2 | 3.3s | Edit + Status-Dropdown OPEN — Neu→Geplant→In Arbeit hover | "ihn auf in Arbeit setzen" |
| M04 | 17.2 – 19.4 | 2.2s | Dropdown CLOSED — Status pill **In Arbeit** | (pause) |
| M05 | 19.4 – 23.3 | 3.9s | Termin-Picker — Di 28.04 — 08:00→10:00 — Übernehmen | "terminieren den Einsatz" |
| M06 | 23.3 – 23.8 | 0.5s | Termin gesetzt — **'▶ Termin versenden'** CTA-Button | "Dadurch wird der Kunde..." |
| M07 | 23.8 – 25.9 | 2.1s | **'⟲ Wird versendet...'** (loading) | (sending) |
| M08 | 25.9 – 27.7 | 1.8s | Speichern+Abbrechen normal — Verlauf 'Priorität... aktualisiert' | (brief) |
| M09 | 27.7 – 29.0 | 1.3s | **✓ 'Termin versendet'** Confirmation | "Stunden vorher automatisch erinnert" |
| M10 | 29.0 – 35.5 | 6.5s | Form-Edit-mode unter Phone-PiP-Overlay (P01) | "Risiko dass Termin vergessen wird" |
| M11 | 35.5 – 37.5 | 2.0s | Phone weg — Form CLOSED — In Arbeit | "Wenn der Auftrag sauber..." |
| M12 | 37.5 – 39.4 | 1.9s | Edit-mode #2 OPEN | (pause) |
| M13 | 39.4 – 42.9 | 3.5s | Dropdown #2 OPEN — In Arbeit → **Erledigt hover** | "Status hier auf erledigt..." |
| M14 | 42.9 – **44.4** | 1.5s | Dropdown CLOSED — Status pill **Erledigt** (grün) — Speichern active | "kurz gespeichert" |
| M15 | **44.4** – **50.2** | 5.8s | Form CLOSED — 'Gespeichert' — Footer 'Bewertung anfragen' Btn + 5 leere Sterne | "Und genau hier kann angestoßen werden" |
| M16 | **50.2** – 51.5 | 1.3s | **'Sende...'** Loading | "Der entscheidende Klick" |
| M17 | 51.5 – 67.0 | 15.5s | **5 gelbe Sterne + 'Bewertung angefragt' + 'Gesendet' Tag** — Anhänge briefly 'Laden...' | "Sie fragen nicht jeden..." |
| M18 | 67.0 – 85.0 | 18.0s | Case-Detail unter Phone-PiP-Overlay (P02) | (phone-driven) |
| M19 | 85.0 – 89.2 | 4.2s | Phone weg — Case full — **5 gelbe Sterne + 'Bewertet'** | "Und wenn einmal etwas..." |
| M20 | 89.2 – 96.9 | 7.7s | Dashboard zurück — KPI **2\|6\|22\|4.7** — Toast @ **93.0s** | "Feedback nicht direkt auf..." |
| M21 | 96.9 – 99.0 | 2.1s | Iris-Open Transition | (transition) |
| M22 | 99.0 – 176.9 | 77.9s | Fullscreen Loom Founder-Outro | "Founder-Monolog" |

---

## 2. Phone-PiP-Overlays

### P01 — Day-1-Reminder (29.0 – 35.5s, Dauer 6.5s)

| Event | Master-Time | Detail |
|-------|-------------|--------|
| Slide-IN start | **28.50s** | Phone außerhalb Frame (rechts) |
| Slide-IN end | **29.00s** | Phone in Position (x=380, y=30, 330×440px) |
| Notification erscheint | 29.10s | SMS-Banner top |
| SMS-Thread OPEN | 30.50s | "Ihre Meldung wurde aufgenommen..." + "Erinnerung..." |
| Slide-OUT start | **34.40s** | Phone fade/cut |
| Slide-OUT end | **34.60s** | Phone weg |

**Animation:** Slide-IN 0.5s ease-out from-right · Slide-OUT 0.2s cut/fade-up

### P02 — Day-2-Rating (67.0 – 85.0s, Dauer 18.0s)

| Event | Master-Time | Detail |
|-------|-------------|--------|
| Slide-IN start | **66.50s** | Phone außerhalb Frame |
| Slide-IN end | **67.00s** | Phone in Position |
| SMS-Thread Tag-2 visible | 67.00s | Alle 3 Messages inkl. Rating-Link |
| Rating-Page öffnet | 72.00s | 5 leere Sterne, "Wie zufrieden waren Sie?" |
| 5 gelbe Sterne + Tags | 76.00s | Schnell&zuverlässig, Saubere Arbeit, etc. |
| Tag-Select "Saubere Arbeit" | 79.50s | Hover blau |
| Submit-Click | 81.50s | "Bewertung abschliessen" |
| Confirmation Page | 83.00s | "Vielen Dank für Ihre Bewertung!" |
| Slide-OUT start | **84.75s** | |
| Slide-OUT end | **85.00s** | |

**Animation:** Slide-IN 0.5s ease-out from-right · Slide-OUT 0.25s cut/fade-up

---

## 3. Loom-States

| State | Master-Time | Position | Diameter | Comment |
|-------|-------------|----------|----------|---------|
| L01 — klein dashboard | 0.0 – 10.1 | x=8, y=718 | 110px | Bottom-left auf Dashboard |
| L02 — gross case-detail | 10.1 – 89.2 | x=8, y=138 | 195px | Top-left auf Case-Detail (Position-Swap @ 10.1) |
| L03 — klein dashboard return | 89.2 – 96.9 | x=8, y=718 | 110px | Zurück zu klein bottom-left |
| L04 — iris-open | **97.5 – 98.7** | expanding | xfade circleopen | **Dauer 1.2s** |
| L05 — fullscreen | 98.7 – 176.9 | x=360, y=90 | 720px | Centered fullscreen circle |

---

## 4. Toast-Notification

| Event | Master-Time |
|-------|-------------|
| Slide-IN start | **92.70s** |
| Slide-IN end | **93.00s** |
| Content stays | 93.0 – 99.0s |
| Disappears with iris | 99.0s |

**Position:** x=980, y=750, 460×80px (bottom-right)
**Content:** "Bewertung erhalten ★★★★★ — Gunnar Wende: Schnell & zuverlässig, Saubere Arbeit."
**Animation:** Slide-IN 0.3s ease-out from-right

---

## 5. Phone-Bezel-Spec (für P01 + P02)

| Property | Value |
|----------|-------|
| Container Size | 330×440 px |
| Container Position | x=380, y=30 |
| Bezel Color | #0a0a0a (dark navy/black) |
| Bezel Thickness | top=22, right=6, bottom=36, left=6 |
| Corner Radius | 30px |
| Inner Screen | 318×396 px @ x=386, y=52 |
| Status-Bar Height | 22px (Time + Notification + Signal/Wifi/Batt) |
| Nav-Bar Height | 36px (▭ menu | ◯ home | ◁ back) |

---

## 6. Animation-Solutions

| Animation | Dauer | Easing | Implementation |
|-----------|-------|--------|----------------|
| **Phone Slide-IN** | 0.5s | ease-out | `overlay='x=if(lt(t,T1),W,if(gt(t,T2),X,W-(t-T1)/0.5*(W-X)))':y=30` |
| **Phone Slide-OUT** | 0.2s | cut/fade | `overlay='enable=between(t,T1,T2)'` toggle |
| **Loom Iris-Open** | 1.2s | circleopen | `xfade=transition=circleopen:duration=1.2:offset=97.5` |
| **Loom Position-Swap @ 10.1s** | instant | cut | 2 streams + enable-flag |
| **Toast Slide-IN** | 0.3s | ease-out | `overlay='x=if(lt(t,92.7),1440,if(gt(t,93.0),980,...))':y=750` |
| **Status pill color** | instant | native | UI re-render im Recording |
| **Dropdown open/close** | instant | native | UI im Recording erfasst |

---

## 7. Tenant-Scaling — Was variabel, was invariant

### VARIABEL pro Tenant (Data-Substitution):
- Tenant-Name, Logo (DA→XY), Brand-Color
- Customer-Name + Phone + Email + Address im Case
- Case-ID-Prefix (DA-0050)
- KPI-Numbers (tenant-DB-derived, day-relative)
- Case-Liste contents (tenant-spezifisch)
- Phone-Nummer + Adresse in SMS-Inhalten (P01, P02)
- Toast Review-Text (Customer-Name + Tags pro Tenant)

### INVARIANT (1:1 für alle Tenants):
- **Alle 22 Phase-Timings zehntelsekunden-genau**
- **Alle Animations-Kurven** (slide-in 0.5s, slide-out 0.2s, iris 1.2s, toast 0.3s)
- **Phone-Bezel-Dimensionen** (330×440 @ x=380,y=30)
- **Loom-Positionen** (klein bottom-left, gross top-left, fullscreen centered)
- **Mouse-Layer JSON** (Dörfler universal)
- **Audio** (Founder voice, 176.90s)
- **UI-Struktur** (Form fields, Dropdown options, Button labels)

---

## 8. Pipeline-Implications

1. **Recording** muss schedule-driven werden (wait-until-master-t statt manuelle Waits). Aktuell `record_take4.mjs` hat manuelle Timeouts → Fragile.
2. **Phone-PiP-Rendering** muss SEPARATE LAYER über Leitsystem-Recording sein, nicht eingebaut.
3. **Toast-Layer** neu — aktuell nicht in Pipeline.
4. **Loom-Iris** in `apply_loom_take4_grow.mjs` muss bei **97.5s** starten, nicht 96.9s (aktuell).
5. **Audio** locked 176.90s — INVARIANT.
6. **Mouse-Layer** universell aus Dörfler JSON — kein Re-Render.
7. **compose_take4_v3** mit fixen SCHEDULE_DUR-Slots ist FRAGIL — durch Phase-Schedule-Retiming ersetzen das pro Phase die Recording-Slice auf die Spec-Master-Time stretched/compresses.
8. **Total dur 176.90s** strikt — nicht 177.10s (aktuell hardcoded an mehreren Stellen).
9. **QG-Verifikation** via `verify_take4_against_spec.mjs` — validiert jeden Anchor mit SSIM gegen REF master.

---

## 9. Verification

```bash
node scripts/_ops/verify_take4_against_spec.mjs --slug doerfler-ag
```

Pruft alle 26 key_transitions + 22 phase_starts = ~48 Anchor-Punkte. Output:
- Console: per-anchor PASS/WARN/FAIL mit SSIM-Score
- Report: `_generated/verify/take4_<slug>_spec.md`
- Frames: `/tmp/spec_t4_verify/<slug>/{ref,new}_<ms>.png`

PASS = SSIM ≥ 0.92 · WARN = ≥ 0.80 · FAIL = < 0.80
