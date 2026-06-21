# T4 Gold-Reference vs Schedule Cross-Check

**Gold:** `docs/gtm/pipeline/backlog/Take4/doerfler-ag.mp4` (READ-ONLY, Founder-approved)
**Schedule:** `docs\gtm\pipeline\06_video_production\_generated\transcripts\doerfler-ag\take4.schedule`
**Current Build:** `docs/gtm/pipeline/06_video_production/master_takes/take4/leins-ag_with_mouse.mp4`
**Generated:** 2026-05-29T15:48:01.890Z

## Frage: Stimmt Schedule-Master-Time mit Gold-Visual-Content überein?

Für jede Phase: Schedule sagt "bei master_t=X sollte content Y zu sehen sein". Gold-Thumb zeigt was wirklich zu sehen ist. Wenn Match → Schedule ist canonical.

## Phases

| # | Schedule-Time | Phase | Gold @ start | Current @ start | Audio-Kommentar | Match? |
|---|---------------|-------|--------------|-----------------|-----------------|--------|
| 1 | `0:00,0-0:04,9` | `dashboard_intro` | ![](_t4_gold/00_00000.jpg) | ![](_t4_current/00_00000.jpg) | "Zum Schluss möchte ich …" |   |
| 2 | `0:04,9-0:09,6` | `dashboard_kpi_overview` | ![](_t4_gold/01_00049.jpg) | ![](_t4_current/01_00049.jpg) | "der für Ihren Alltag …" |   |
| 3 | `0:09,6-0:12,5` | `dashboard_to_case` | ![](_t4_gold/02_00096.jpg) | ![](_t4_current/02_00096.jpg) | "in den eben erstellten …" |   |
| 4 | `0:12,5-0:14,0` | `case_initial_neu` | ![](_t4_gold/03_00125.jpg) | ![](_t4_current/03_00125.jpg) | "setzen" |   |
| 5 | `0:14,0-0:15,7` | `case_status_dropdown` | ![](_t4_gold/04_00140.jpg) | ![](_t4_current/04_00140.jpg) | "ihn auf in Arbeit" |   |
| 6 | `0:15,7-0:17,2` | `case_status_inarbeit` | ![](_t4_gold/05_00157.jpg) | ![](_t4_current/05_00157.jpg) | "und" |   |
| 7 | `0:17,2-0:19,2` | `case_termin_picker` | ![](_t4_gold/06_00172.jpg) | ![](_t4_current/06_00172.jpg) | "terminieren den Einsatz" |   |
| 8 | `0:19,2-0:23,0` | `case_termin_set` | ![](_t4_gold/07_00192.jpg) | ![](_t4_current/07_00192.jpg) | "Dadurch wird der Kunde …" |   |
| 9 | `0:23,0-0:28,7` | `case_inarbeit_view` | ![](_t4_gold/08_00230.jpg) | ![](_t4_current/08_00230.jpg) | "Stunden vorher automatisch erinnert …" |   |
| 10 | `0:28,7-0:33,5` | `phone_reminder_pip` | ![](_t4_gold/09_00287.jpg) | ![](_t4_current/09_00287.jpg) | "Risiko dass ein Termin …" |   |
| 11 | `0:33,5-0:39,0` | `case_inarbeit_view_post` | ![](_t4_gold/10_00335.jpg) | ![](_t4_current/10_00335.jpg) | "Wenn der Auftrag sauber …" |   |
| 12 | `0:39,0-0:43,0` | `case_status_erledigt_hover` | ![](_t4_gold/11_00390.jpg) | ![](_t4_current/11_00390.jpg) | "Status hier auf erledigt …" |   |
| 13 | `0:43,0-0:44,8` | `case_status_erledigt` | ![](_t4_gold/12_00430.jpg) | ![](_t4_current/12_00430.jpg) | "kurz gespeichert" |   |
| 14 | `0:44,8-0:49,8` | `case_bewertung_pre` | ![](_t4_gold/13_00448.jpg) | ![](_t4_current/13_00448.jpg) | "Und genau hier kann …" |   |
| 15 | `0:49,8-0:52,3` | `case_bewertung_pending` | ![](_t4_gold/14_00498.jpg) | ![](_t4_current/14_00498.jpg) | "angestoßen werden Der entscheidende …" |   |
| 16 | `0:52,3-1:07,0` | `case_bewertung_button` | ![](_t4_gold/15_00523.jpg) | ![](_t4_current/15_00523.jpg) | "Sie fragen nicht jeden …" |   |
| 17 | `1:07,0-1:10,5` | `phone_sms_appears` | ![](_t4_gold/16_00670.jpg) | ![](_t4_current/16_00670.jpg) | "Und der Kunde bekommt …" |   |
| 18 | `1:10,5-1:15,5` | `phone_sms_thread` | ![](_t4_gold/17_00705.jpg) | ![](_t4_current/17_00705.jpg) | "direkt aufs Handy Und …" |   |
| 19 | `1:15,5-1:19,0` | `phone_rating_intro` | ![](_t4_gold/18_00755.jpg) | ![](_t4_current/18_00755.jpg) | "sondern ruhig und verständlich …" |   |
| 20 | `1:19,0-1:22,0` | `phone_rating_stars` | ![](_t4_gold/19_00790.jpg) | ![](_t4_current/19_00790.jpg) | "Ohne unnötige Reibung und …" |   |
| 21 | `1:22,0-1:25,0` | `phone_rating_submit` | ![](_t4_gold/20_00820.jpg) | ![](_t4_current/20_00820.jpg) | "in einem Moment in …" |   |
| 22 | `1:25,0-1:29,5` | `case_review_done` | ![](_t4_gold/21_00850.jpg) | ![](_t4_current/21_00850.jpg) | "Und wenn einmal etwas …" |   |
| 23 | `1:29,5-2:57,1` | `dashboard_final` | ![](_t4_gold/22_00895.jpg) | ![](_t4_current/22_00895.jpg) | "Feedback nicht direkt auf …" + 3s Outro-Stille |   |

## Was du tust

1. Schau Gold-Thumb jeder Phase an.
2. Erwartet per phase_library_defs/take4_sanitaer.json: `23` distinct phases.
3. Match? → "✓" eintragen. Mismatch? → konkrete Beobachtung notieren.
4. Bei Mismatch: was sollte INSTEAD an dieser Zeit zu sehen sein?

Wenn alle Gold-Thumbs visuell zur Phase-Description passen → Schedule ist ZEHNTELSEKUNDEN-KORREKT canonical.
