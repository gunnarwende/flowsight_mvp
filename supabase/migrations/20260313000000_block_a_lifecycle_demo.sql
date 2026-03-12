-- Block A: Day-5 nudge + Day-7 engagement snapshot + Demo-case flag
-- Safe to re-run: all ADD COLUMN IF NOT EXISTS

-- Day-5 nudge timestamp (lifecycle tick milestone)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS day5_nudge_sent_at timestamptz;

-- Day-7 engagement snapshot (JSONB: cases_created, calls_count, statuses)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS day7_snapshot jsonb;

-- Demo-case flag on cases table (for tab separation in Leitstand)
ALTER TABLE cases ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
