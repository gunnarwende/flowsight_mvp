-- ===========================================================================
-- Sektion "Leben" — Phase 1: Running (Strava-Bruecke)
-- Founder-persoenlicher Bereich der CEO-App. Keine Tenant-/Kundendaten.
-- Quelle: Garmin -> (Auto-Sync) -> Strava -> Webhook -> life_activities.
-- ===========================================================================

-- Importierte Aktivitaeten (Laeufe, Fussball, ...). Eine Zeile pro Strava-Aktivitaet.
CREATE TABLE IF NOT EXISTS life_activities (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strava_id        bigint UNIQUE NOT NULL,
  athlete_id       bigint,
  sport_type       text,                       -- Strava sport_type: Run, TrailRun, Soccer, ...
  type             text,                        -- Strava legacy type
  name             text,
  start_time       timestamptz,                 -- start_date (UTC)
  start_time_local timestamptz,                 -- start_date_local (Anzeige)
  distance_m       numeric,
  moving_time_s    integer,
  elapsed_time_s   integer,
  elevation_gain_m numeric,
  avg_hr           numeric,
  max_hr           numeric,
  avg_speed_ms     numeric,                      -- m/s (Pace = abgeleitet)
  calories         numeric,
  raw              jsonb,                        -- vollstaendige Strava-Antwort (fuer spaetere Auswertung)
  source           text DEFAULT 'strava',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_life_activities_start ON life_activities (start_time DESC);
CREATE INDEX IF NOT EXISTS idx_life_activities_sport ON life_activities (sport_type);

-- Strava OAuth-Tokens (Founder-only, i.d.R. genau eine Zeile).
CREATE TABLE IF NOT EXISTS life_strava_tokens (
  athlete_id    bigint PRIMARY KEY,
  access_token  text NOT NULL,
  refresh_token text NOT NULL,
  expires_at    bigint NOT NULL,                -- epoch seconds (UTC)
  scope         text,
  athlete_name  text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Generischer Einstellungs-Speicher fuer das Leben-Modul
-- (z.B. Wettkampf-Datum, Strava-Webhook-Subscription-ID, spaeter Trainingsplan).
CREATE TABLE IF NOT EXISTS life_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);
