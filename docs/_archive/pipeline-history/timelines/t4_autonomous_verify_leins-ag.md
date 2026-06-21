# T4 Autonomous Verification — leins-ag vs Gold-Dörfler

**Gold:** `docs/gtm/pipeline/backlog/Take4/doerfler-ag.mp4` (READ-ONLY)
**Build:** `docs\gtm\pipeline\06_video_production\master_takes\take4\leins-ag_with_mouse.mp4`
**Generated:** 2026-05-29T17:30:23.226Z

## Methodology

For each of 23 schedule phases, sample 3 anchor points:
- **START** (phase.start + 0.05s)
- **MID** ((phase.start + phase.end) / 2)
- **END** (phase.end - 0.05s)

SSIM compares same master-time in Build vs Gold. Pass if ≥0.5 (visual same scene, data deltas OK).

## Results

| # | Phase | Anchor | Master-t | SSIM | Match |
|---|-------|--------|----------|------|-------|
| 1 | `dashboard_intro` | START | 0:00.1 | 0.8670 | ✓ |
| 1 | `dashboard_intro` | MID | 0:02.5 | 0.8661 | ✓ |
| 1 | `dashboard_intro` | END | 0:04.9 | 0.8673 | ✓ |
| 2 | `dashboard_kpi_overview` | START | 0:05.0 | 0.8246 | ✓ |
| 2 | `dashboard_kpi_overview` | MID | 0:07.3 | 0.8674 | ✓ |
| 2 | `dashboard_kpi_overview` | END | 0:09.5 | 0.8672 | ✓ |
| 3 | `dashboard_to_case` | START | 0:09.7 | 0.8677 | ✓ |
| 3 | `dashboard_to_case` | MID | 0:11.1 | 0.9729 | ✓ |
| 3 | `dashboard_to_case` | END | 0:12.4 | 0.9752 | ✓ |
| 4 | `case_initial_neu` | START | 0:12.6 | 0.9748 | ✓ |
| 4 | `case_initial_neu` | MID | 0:13.3 | 0.9749 | ✓ |
| 4 | `case_initial_neu` | END | 0:13.9 | 0.8174 | ✓ |
| 5 | `case_status_dropdown` | START | 0:14.1 | 0.9689 | ✓ |
| 5 | `case_status_dropdown` | MID | 0:14.8 | 0.9696 | ✓ |
| 5 | `case_status_dropdown` | END | 0:15.6 | 0.9469 | ✓ |
| 6 | `case_status_inarbeit` | START | 0:15.8 | 0.9470 | ✓ |
| 6 | `case_status_inarbeit` | MID | 0:16.4 | 0.9471 | ✓ |
| 6 | `case_status_inarbeit` | END | 0:17.1 | 0.7925 | ✓ |
| 7 | `case_termin_picker` | START | 0:17.3 | 0.7931 | ✓ |
| 7 | `case_termin_picker` | MID | 0:18.2 | 0.7905 | ✓ |
| 7 | `case_termin_picker` | END | 0:19.1 | 0.7905 | ✓ |
| 8 | `case_termin_set` | START | 0:19.3 | 0.9568 | ✓ |
| 8 | `case_termin_set` | MID | 0:21.1 | 0.9500 | ✓ |
| 8 | `case_termin_set` | END | 0:22.9 | 0.7859 | ✓ |
| 9 | `case_inarbeit_view` | START | 0:23.1 | 0.7851 | ✓ |
| 9 | `case_inarbeit_view` | MID | 0:25.9 | 0.7829 | ✓ |
| 9 | `case_inarbeit_view` | END | 0:28.6 | 0.8142 | ✓ |
| 10 | `phone_reminder_pip` | START | 0:28.8 | 0.7531 | ✓ |
| 10 | `phone_reminder_pip` | MID | 0:31.1 | 0.1945 | ✗ |
| 10 | `phone_reminder_pip` | END | 0:33.5 | 0.2602 | ✗ |
| 11 | `case_inarbeit_view_post` | START | 0:33.5 | 0.2601 | ✗ |
| 11 | `case_inarbeit_view_post` | MID | 0:36.3 | 0.6173 | ✓ |
| 11 | `case_inarbeit_view_post` | END | 0:39.0 | 0.8155 | ✓ |
| 12 | `case_status_erledigt_hover` | START | 0:39.0 | 0.8163 | ✓ |
| 12 | `case_status_erledigt_hover` | MID | 0:41.0 | 0.9320 | ✓ |
| 12 | `case_status_erledigt_hover` | END | 0:43.0 | 0.9308 | ✓ |
| 13 | `case_status_erledigt` | START | 0:43.0 | 0.9308 | ✓ |
| 13 | `case_status_erledigt` | MID | 0:43.9 | 0.9119 | ✓ |
| 13 | `case_status_erledigt` | END | 0:44.8 | 0.8995 | ✓ |
| 14 | `case_bewertung_pre` | START | 0:44.8 | 0.8105 | ✓ |
| 14 | `case_bewertung_pre` | MID | 0:47.3 | 0.8026 | ✓ |
| 14 | `case_bewertung_pre` | END | 0:49.8 | 0.8004 | ✓ |
| 15 | `case_bewertung_pending` | START | 0:49.8 | 0.8014 | ✓ |
| 15 | `case_bewertung_pending` | MID | 0:51.0 | 0.8407 | ✓ |
| 15 | `case_bewertung_pending` | END | 0:52.3 | 0.8402 | ✓ |
| 16 | `case_bewertung_button` | START | 0:52.3 | 0.8402 | ✓ |
| 16 | `case_bewertung_button` | MID | 0:59.6 | 0.8373 | ✓ |
| 16 | `case_bewertung_button` | END | 1:07.0 | 0.5802 | ✓ |
| 17 | `phone_sms_appears` | START | 1:07.0 | 0.5803 | ✓ |
| 17 | `phone_sms_appears` | MID | 1:08.8 | 0.5559 | ✓ |
| 17 | `phone_sms_appears` | END | 1:10.5 | 0.5555 | ✓ |
| 18 | `phone_sms_thread` | START | 1:10.5 | 0.5554 | ✓ |
| 18 | `phone_sms_thread` | MID | 1:13.0 | 0.6455 | ✓ |
| 18 | `phone_sms_thread` | END | 1:15.5 | 0.5423 | ✓ |
| 19 | `phone_rating_intro` | START | 1:15.5 | 0.5404 | ✓ |
| 19 | `phone_rating_intro` | MID | 1:17.3 | 0.5051 | ✓ |
| 19 | `phone_rating_intro` | END | 1:19.0 | 0.5048 | ✓ |
| 20 | `phone_rating_stars` | START | 1:19.0 | 0.5047 | ✓ |
| 20 | `phone_rating_stars` | MID | 1:20.5 | 0.5057 | ✓ |
| 20 | `phone_rating_stars` | END | 1:22.0 | 0.5940 | ✓ |
| 21 | `phone_rating_submit` | START | 1:22.0 | 0.5958 | ✓ |
| 21 | `phone_rating_submit` | MID | 1:23.5 | 0.7981 | ✓ |
| 21 | `phone_rating_submit` | END | 1:25.0 | 0.8413 | ✓ |
| 22 | `case_review_done` | START | 1:25.0 | 0.8413 | ✓ |
| 22 | `case_review_done` | MID | 1:27.3 | 0.8385 | ✓ |
| 22 | `case_review_done` | END | 1:29.5 | 0.8389 | ✓ |
| 23 | `dashboard_final` | START | 1:29.5 | 0.6903 | ✓ |
| 23 | `dashboard_final` | MID | 2:13.3 | 0.8488 | ✓ |
| 23 | `dashboard_final` | END | 2:57.0 | — | ✗ |

## Summary

- **Total anchors:** 69
- **Pass:** 65 (94.2%)
- **Fail:** 4 (5.8%)

### Phases with mismatches:

- `phone_reminder_pip`: 2/3 anchors failed
- `case_inarbeit_view_post`: 1/3 anchors failed
- `dashboard_final`: 1/3 anchors failed
