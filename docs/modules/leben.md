# Modul: Leben (Founder-persönlich)

> Teil der [FlowSight Bible](../flowsight_bible.md). **Nicht** das Geschäft —
> der CEO trägt Verantwortung fürs Business *und* für sich selbst. Dieses Modul
> ist die persönliche Säule in der CEO-App: Gesundheit, Sport, Energie.
> Sichtbar nur für den Founder (gleicher `isAdmin`-Guard wie der Rest von `/ceo`).

## Zweck
Ein Ort, an dem das Leben so reibungslos getrackt wird, dass der Founder es
**täglich gern** nutzt. Bausteine greifen ineinander; oben drauf zieht (später)
ein KI-Coach die Tagesbilanz und plant voraus. Leitthema: Gesundheit.

## Bausteine
| Baustein | Status | Quelle |
|---|---|---|
| **Running** (inkl. Fussball) | **Phase 1 — live gebaut** | Garmin Connect → garth (CI-Cron) → `life_activities` |
| Kraftsport | geplant (Phase 3) | — |
| Ernährung | geplant (Phase 3) | — |
| **KI-Coach** (Tagesbilanz + Plan + Chat) | geplant (Phase 2, bis Ende KW) | `src/lib/ai` (Anthropic) |

## Status heute (Phase 1)
- Neue Sektion „Leben" (10., unten in der CeoShell-Sidebar) → `/ceo/leben`.
- Tab **Running**: Jungfrau-Countdown, Wochenstatistik (km, Höhenmeter, Läufe, Zeit),
  Aktivitätenliste (Pace, Höhenmeter, Puls). Fussball wird mitgeführt, aber nicht
  als Lauf-Volumen gezählt; Tischtennis bewusst draussen.
- **Datenweg = Garmin-Direkt** (kostenlos, kein Strava): garth-Login einmalig →
  widerrufbares Token → CI-Cron (alle 30 Min) holt Läufe + „Aktualisieren"-Knopf.
  Kein Garmin-Passwort dauerhaft gespeichert. Runbook: `docs/runbooks/garmin_setup.md`.

## Datei-/Code-Bereich (Parallel-Konflikt-Regel)
- **Besitzt:** `app/ceo/(dashboard)/leben/*`, `app/api/ceo/leben/**`,
  `src/components/ceo/LebenView.tsx` + `RunningView.tsx`, `src/lib/leben/*`,
  `scripts/_ops/garmin_sync.py`, `.github/workflows/garmin-*.yml`,
  `supabase/migrations/*life*`, `docs/runbooks/garmin_setup.md`, diese Karte.
- **Kollidiert mit:** CeoShell-Nav (`src/components/ceo/CeoShell.tsx` — nur der
  `NAV_ITEMS`-Eintrag „Leben"), env_vars-Registry (Garmin-Block).

## Datenmodell
- `life_activities` — eine Zeile pro Aktivität, quell-agnostisch (`source` +
  `external_id`, UNIQUE) (Distanz, Zeit, Höhenmeter, Puls, raw).
- `life_settings` — Key/Value: `garmin_token` (widerrufbar), `garmin_last_sync`,
  `race` (Wettkampf-Ziel), später Trainingsplan.

## Nächste Schritte
1. **Phase 2 (bis Ende KW):** KI-Coach — Jungfrau-Trainingsplan (Horizont → Wochen/Tage),
   abendliche Tagesbilanz (Ziel erreicht? sportlich + Ernährung), interaktiver Chat.
2. **Phase 3:** Kraftsport- + Ernährungs-Bausteine; Coach zieht Bilanz über alle.
3. Renndatum final bestätigen; ggf. Wochenziel-/Höhenmeter-Plan hinterlegen.
