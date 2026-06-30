-- ===========================================================================
-- Sektion "Leben" — Phase 1: Running
-- Founder-persoenlicher Bereich der CEO-App. Keine Tenant-/Kundendaten.
-- Quelle: Garmin Connect -> garth (GitHub-Actions-Cron) -> life_activities.
-- Quell-agnostisch gehalten (source/external_id), damit spaeter weitere
-- Quellen (z.B. Strava) ohne Schema-Aenderung andocken koennen.
-- ===========================================================================

-- Importierte Aktivitaeten (Laeufe, Fussball, ...). Eine Zeile pro Aktivitaet.
CREATE TABLE IF NOT EXISTS life_activities (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source           text NOT NULL DEFAULT 'garmin',   -- garmin | strava | ...
  external_id      text NOT NULL,                     -- Garmin activityId / Strava id
  sport_type       text,                              -- running, trail_running, soccer, ...
  name             text,
  start_time       timestamptz,                       -- startTimeGMT (UTC)
  start_time_local timestamptz,                        -- startTimeLocal (Anzeige)
  distance_m       numeric,
  moving_time_s    integer,
  elapsed_time_s   integer,
  elevation_gain_m numeric,
  avg_hr           numeric,
  max_hr           numeric,
  avg_speed_ms     numeric,                            -- m/s (Pace = abgeleitet)
  calories         numeric,
  raw              jsonb,                              -- vollstaendige Quell-Antwort
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  UNIQUE (source, external_id)
);
CREATE INDEX IF NOT EXISTS idx_life_activities_start ON life_activities (start_time DESC);
CREATE INDEX IF NOT EXISTS idx_life_activities_sport ON life_activities (sport_type);

-- Generischer Einstellungs-/Secret-Speicher fuer das Leben-Modul:
--   garmin_token     -> garth-OAuth-Token (base64), widerrufbar, kein Passwort
--   garmin_last_sync -> Zeitstempel des letzten erfolgreichen Abrufs
--   race             -> { date, name } (Wettkampf-Ziel)
--   spaeter: Trainingsplan etc.
CREATE TABLE IF NOT EXISTS life_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);
