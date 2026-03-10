-- Lifecycle milestone timestamps for idempotent tick processing.
-- Each column tracks when a specific lifecycle event was last executed,
-- preventing duplicate emails/actions on re-runs.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS day7_checked_at    timestamptz,
  ADD COLUMN IF NOT EXISTS day10_alerted_at   timestamptz,
  ADD COLUMN IF NOT EXISTS day13_reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS day14_marked_at    timestamptz;

COMMENT ON COLUMN tenants.day7_checked_at IS 'Timestamp when Day 7 engagement check was executed';
COMMENT ON COLUMN tenants.day10_alerted_at IS 'Timestamp when Day 10 founder alert was sent';
COMMENT ON COLUMN tenants.day13_reminder_sent_at IS 'Timestamp when Day 13 trial-expiry reminder was sent to prospect';
COMMENT ON COLUMN tenants.day14_marked_at IS 'Timestamp when Day 14 status was set to decision_pending';
