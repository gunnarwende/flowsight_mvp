# Take 4 — Pipeline Current State (Doerfler-AG, 30.05.2026)

**Build:** `docs/gtm/pipeline/06_video_production/master_takes/take4/doerfler-ag_with_mouse.mp4` (177.10s, 14.4MB)
**Source-Recording:** 7 webms (48 events logged) + compose_take4_final + build_from_phase_schedule + apply_loom + mouse_layer
**SSIM vs Apr-30-Gold:** 41/46 PASS (89.1%)

## So liest du dieses Doc

- **Sek (Master-t):** Sekunde im finalen Video (1s-Intervall)
- **REF (Apr 30):** Was die Founder-Gold-Schablone zeigt
- **NEW (Pipeline):** Was die aktuelle Pipeline produziert
- **Δ:** OK (match), DRIFT (Inhalt anders), ⚠ (sichtbare Abweichung)

Thumbnails: `_frame_analysis/ref/tNN.png` ↔ `_frame_analysis/new/tNN.png` (jede Sekunde 0-99)

---

## Phase-Tabelle (Master-Zeiten aus take4.schedule)

| # | Phase | Master-Range | Audio-Cue | Beschreibung |
|---|---|---|---|---|
| 1 | dashboard_intro | 0:00,0–0:04,9 | "Zum Schluss möchte ich" | Dashboard Akt-1 (Guten Morgen, KPI, case-list, DA-0050 als Neu sichtbar) |
| 2 | dashboard_kpi_overview | 0:04,9–0:09,6 | "der für Ihren Alltag" | Dashboard, Hover auf KPI-Karten |
| 3 | dashboard_to_case | 0:09,6–0:12,5 | "in den eben erstellten" | Klick DA-0050 → Case-Detail lädt |
| 4 | case_initial_neu | 0:12,5–0:14,0 | "setzen" | Case-Detail Status NEU, ÜBERSICHT zu, Kontakt Gunnar Wende |
| 5 | case_status_dropdown | 0:14,0–0:15,7 | "ihn auf in Arbeit" | Status-Dropdown OFFEN, "In Arbeit" highlighted |
| 6 | case_status_inarbeit | 0:15,7–0:17,2 | "und" | Status "In Arbeit" gesetzt + Speichern+Abbrechen visible |
| 7 | case_termin_picker | 0:17,2–0:19,2 | "terminieren den Einsatz" | Termin-Picker offen (Kalender + Slots 08:00-10:00) |
| 8 | case_termin_set | 0:19,2–0:23,0 | "Dadurch wird der Kunde" | Termin gesetzt + ▶ Termin versenden btn |
| 9 | case_inarbeit_view | 0:23,0–0:28,7 | "Stunden vorher automatisch erinnert" | "Wird versendet..." → Termin versendet ✓ Verlauf |
| 10 | phone_reminder_pip | 0:28,7–0:33,5 | "Risiko dass ein Termin" | Phone PiP Homescreen + SMS Notification + Thread öffnet |
| 11 | case_inarbeit_view_post | 0:33,5–0:39,0 | "Wenn der Auftrag sauber" | Back to Case-Detail (Phone weg), Status weiterhin In Arbeit |
| 12 | case_status_erledigt_hover | 0:39,0–0:43,0 | "Status hier auf erledigt" | Status-Dropdown 2nd open, "Erledigt" highlighted |
| 13 | case_status_erledigt | 0:43,0–0:44,8 | "kurz gespeichert" | Status auf Erledigt gesetzt + Speichern |
| 14 | case_bewertung_pre | 0:44,8–0:49,8 | "Und genau hier kann" | Status Erledigt + "Bewertung anfragen" button visible |
| 15 | case_bewertung_pending | 0:49,8–0:52,3 | "angestoßen werden" | Click "Bewertung anfragen" |
| 16 | case_bewertung_button | 0:52,3–1:07,0 | "Sie fragen nicht jeden" | Bewertungsanfrage gesendet + 5 leere Sterne + Hold |
| 17 | phone_sms_appears | 1:07,0–1:10,5 | "Und der Kunde bekommt" | Phone PiP slide-in mit SMS-Thread (alle 3 SMS) |
| 18 | phone_sms_thread | 1:10,5–1:15,5 | "direkt aufs Handy" | Phone SMS Thread voll sichtbar |
| 19 | phone_rating_intro | 1:15,5–1:19,0 | "sondern ruhig und verständlich" | Phone Rating Page öffnet (5 empty stars) |
| 20 | phone_rating_stars | 1:19,0–1:22,0 | "Ohne unnötige Reibung" | 5 Stars filled + Chips + "Bewertung abschliessen" btn |
| 21 | phone_rating_submit | 1:22,0–1:25,0 | "in einem Moment" | Submit → "Vielen Dank" Confirmation |
| 22 | case_review_done | 1:25,0–1:29,5 | "Und wenn einmal etwas" | Back to Case-Detail mit "Bewertet" 5 Stars |
| 23 | dashboard_final | 1:29,5–2:57,1 | "Feedback nicht direkt auf" + 3s Outro | Dashboard final mit Gold-Case (87.6s freeze) |

---

## Sekunden-genaue Beobachtung (NEW vs REF)

### Akt 1 — Dashboard + Case-Detail Setup (0:00 – 0:28,7)

| Sek | REF (Apr 30) | NEW (Pipeline) | Δ | Phase |
|---|---|---|---|---|
| 0 | Dashboard "Guten Morgen, Dörfler", KPI 3/6/21/4.7, case-list | Same, KPI 2/7/26/4.7 (Datenstand heute), DA-0050 als "Neu" Position 4 | OK (Data: aktuell) | dashboard_intro |
| 1 | Dashboard (stable) | Dashboard (stable) | OK | dashboard_intro |
| 2 | Dashboard | Dashboard | OK | dashboard_intro |
| 3 | Dashboard | Dashboard | OK | dashboard_intro |
| 4 | Dashboard | Dashboard | OK | dashboard_intro→kpi |
| 5 | Dashboard | Dashboard, Mouse hover | OK | dashboard_kpi_overview |
| 6 | Dashboard | Dashboard | OK | dashboard_kpi_overview |
| 7 | Dashboard | Dashboard | OK | dashboard_kpi_overview |
| 8 | Dashboard | Dashboard | OK | dashboard_kpi_overview |
| 9 | Dashboard | Dashboard | OK | dashboard_kpi_overview→to_case |
| 10 | Dashboard, Mouse near DA-0050 row | Dashboard | OK | dashboard_to_case |
| 11 | Dashboard, hover DA-0050 | Dashboard | OK | dashboard_to_case |
| 12 | **Case-Detail Leck NEU** (transition) | Dashboard | ⚠ DRIFT 1s (NEW lädt später) | case_initial_neu |
| 13 | Case-Detail NEU | **Case-Detail Leck NEU** | OK ✓ | case_initial_neu |
| 14 | **Status-Dropdown OFFEN** (In Arbeit hi) | Case-Detail NEU | ⚠ DRIFT (dropdown noch nicht offen) | case_status_dropdown |
| 15 | Status-Dropdown OFFEN | **Status-Dropdown OFFEN** | OK ✓ | case_status_dropdown |
| 16 | **Status "In Arbeit"** + Speichern visible | Status-Dropdown noch offen | ⚠ DRIFT | case_status_inarbeit |
| 17 | Status In Arbeit + Speichern | Status In Arbeit + Speichern | OK ✓ | case_status_inarbeit |
| 18 | Status In Arbeit + Speichern | Status In Arbeit + Speichern | OK | case_status_inarbeit→picker |
| 19 | **Termin-Picker OFFEN** (Kalender) | Status In Arbeit | ⚠ DRIFT (picker noch nicht offen) | case_termin_picker |
| 20 | Termin-Picker (April 2026) | **Termin-Picker OFFEN** | OK ✓ | case_termin_picker |
| 21 | Termin-Picker, Slot 08:00 selected | Termin-Picker, Slot 08:00 selected | OK | case_termin_picker |
| 22 | Termin-Picker, 08:00-10:00 + Übernehmen visible | Termin-Picker, Übernehmen | OK | case_termin_picker→set |
| 23 | **Termin gesetzt + ▶ Termin versenden btn** | Termin gesetzt + Termin versenden btn | OK ✓ | case_termin_set |
| 24 | Termin versenden btn (about to click) | Termin versenden btn | OK | case_termin_set |
| 25 | **"Wird versendet..."** button (post-click) | "Wird versendet..." button | OK ✓ | case_termin_set→inarbeit_view |
| 26 | Wird versendet... | Wird versendet... | OK | case_inarbeit_view |
| 27 | Wird versendet... | Wird versendet... | OK | case_inarbeit_view |
| 28 | **Termin versendet ✓** (green check, Verlauf) | Termin versendet | OK ✓ | case_inarbeit_view→phone |

### Phone Day 1 + Akt 2 — Reminder + Erledigt (0:28,7 – 1:07,0)

| Sek | REF | NEW | Δ |
|---|---|---|---|
| 29 | Termin versendet view | Termin versendet | OK |
| 30 | **Phone PiP Homescreen** + SMS Notification toast | Phone PiP slide-in | OK ✓ |
| 31 | Phone Homescreen | Phone Homescreen | OK |
| 32 | Phone | Phone | OK |
| 33 | Phone (transition zu SMS thread) | Phone SMS opening | OK |
| 34 | **Phone SMS Thread** "Dörfler AG" + reminder SMS | Phone SMS Thread | OK ✓ |
| 35-38 | Phone SMS Thread visible | Phone SMS Thread | OK |
| 39 | **Status-Dropdown 2nd open** "Erledigt" hi | Back to Case-Detail | ⚠ DRIFT |
| 40-43 | Status-Dropdown Erledigt | Case-Detail/Dropdown | ⚠ Drift Range |
| 44 | Status "Erledigt" + Speichern | Status Erledigt setting | OK ~ |
| 45 | **Status Erledigt + Bewertung anfragen btn** | Status Erledigt + Bewertung | OK ✓ |
| 46-49 | Bewertung anfragen visible | Bewertung anfragen visible | OK |
| 50-54 | Bewertung anfragen state (hold) | Bewertung anfragen state | OK |
| 55-59 | **"Bewertungsanfrage gesendet"** + 5 stars | Bewertungsanfrage gesendet | OK ✓ |
| 60-66 | Same (hold mit 5 stars) | Same | OK |
| 67 | **Phone SMS Thread (3 SMS)** slide-in | Phone slide-in | OK ✓ |

### Phone Day 2 + Review + Closing (1:07,0 – 2:57,1)

| Sek | REF | NEW | Δ |
|---|---|---|---|
| 70-74 | Phone Thread (alle 3 SMS Mo 27.04 08:08/09:02/09:04) | Phone Thread mit 3 SMS heute | OK (Data aktuell) |
| 75 | **Phone Rating Page** (Dörfler AG, Leck/Oberrieden/27.04, 5 leere Sterne) | Phone Rating Page | OK ✓ |
| 76-78 | Rating Page (Mouse hovering Sterne) | Rating Page | OK |
| 79-81 | **5 Sterne filled** + "Vielen Dank" + Chips + Bewertung abschliessen | 5 Stars + Chips + Submit | OK ✓ |
| 82-84 | Submit-View "Vielen Dank für Ihre Bewertung" | Submit confirmation | OK |
| 85-89 | **Case-Verlauf "Bewertet"** + 5 stars | Case-Detail mit Bewertet | OK ✓ |
| 90 | **Dashboard final** (Guten Tag, KPI 2/6/22/4.7) | Dashboard final | OK ✓ |
| 91-99 | Dashboard final (hold) | Dashboard final hold | OK |
| 100-176 | Dashboard final freeze (87s freeze-extend) + Loom-Grow Transition zu Voll-Loom | Same | OK |
| 177,1 | END (3s Outro stille) | END | OK |

---

## Übersicht Δ-Punkte (sichtbare Drifts)

### Akt 1 (Sek 0-28,7) — meiste Drifts bei Phase-Boundaries

| Sek | Problem | Ursache |
|---|---|---|
| 12 | NEW lädt Case-Detail 1s später als REF | dashboard_to_case Recording-Slice startet ~1s nach Click — natural variance |
| 14 | NEW Dropdown noch nicht offen, REF schon | case_status_dropdown Boundary-Drift ~1s |
| 16 | REF Status In Arbeit set, NEW Dropdown noch offen | case_status_inarbeit Boundary-Drift |
| 19 | REF Termin-Picker, NEW Status In Arbeit | case_termin_picker Boundary-Drift |
| 39-44 | NEW noch in Case-Detail/Bewertung pre, REF schon in 2nd Dropdown | case_status_erledigt_hover Drift |

### Hand-/Phone-Bereich (Sek 28,7-39,0 + Sek 67-85) — Phasen stimmen content-mässig überein

Drifts sind primär **Boundary-Übergänge** (start/end). Innerhalb einer Phase ist Content korrekt.

---

## Files

- **Build:** `docs/.../master_takes/take4/doerfler-ag_with_mouse.mp4` (177.10s)
- **REF (Schablone):** `docs/.../master_takes/take4/doerfler-ag_pre_audio_fix.mp4` = `docs/gtm/pipeline/backlog/Take4/doerfler-ag.mp4` (177.10s)
- **Frame-Vergleich:** `docs/.../master_takes/take4/_frame_analysis/ref/tNN.png` ↔ `new/tNN.png`
- **Verify-Report:** `docs/.../_generated/verify/take4_doerfler-ag_v3.md` (41/46 PASS @ SSIM≥0.85)
- **Override:** `docs/.../phase_library_defs/_overrides/doerfler-ag/take4_sanitaer.json` (23 phases)
- **Event-Log:** `docs/.../screenflows/doerfler-ag/take4_event_log.json` (48 events)

---

## Was steht für Step 2 (Drift-Fix)

**Boundary-Drifts in Akt 1** sind die hauptsächlichen verbleibenden Issues. Sie kommen daher, dass `build_from_phase_schedule` Source-Ranges linear retimet, aber Click-Animationen + Page-Loads zwischen Apr 28 und heute leicht unterschiedlich lange dauern.

**Optionen für Step 2:**
- **A) Padding pro Phase-Boundary tunen:** Override mit ±0,5s Slack-Frames an kritischen Übergängen
- **B) Recording-Timing verkürzen:** waitForTimeout-Werte in record_take4 trimmen damit Recording näher an Apr-28-Geschwindigkeit ist
- **C) Akzeptieren:** ±1s Boundary-Drift bei sonst korrektem Content
