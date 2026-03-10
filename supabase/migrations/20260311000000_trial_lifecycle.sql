-- ============================================================================
-- Trial Lifecycle Fields on Tenants
-- 2026-03-11 | Operating Model: Trial-driven Sales Machine
-- ============================================================================
--
-- WHAT THIS DOES:
-- 1. Adds trial lifecycle fields to tenants table
-- 2. Adds prospect contact info for follow-up
--
-- These fields power the Trial Lifecycle:
--   scouted → contacted → interested → trial_active → converted/offboarded
-- ============================================================================

-- ── 1. Trial lifecycle fields ────────────────────────────────────────────────

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_status text
  CHECK (trial_status IN (
    'scouted', 'contacted', 'interested',
    'trial_active', 'follow_up_due', 'decision_pending',
    'converted', 'live_dock', 'offboarded', 'parked'
  ));
COMMENT ON COLUMN tenants.trial_status IS 'GTM lifecycle status. See docs/gtm/operating_model.md';

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_start timestamptz;
COMMENT ON COLUMN tenants.trial_start IS 'When 14-day trial was activated';

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_end timestamptz;
COMMENT ON COLUMN tenants.trial_end IS 'When trial expires (trial_start + 14 days)';

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS follow_up_at timestamptz;
COMMENT ON COLUMN tenants.follow_up_at IS 'When follow-up is due (trial_start + 10 days)';

-- ── 2. Prospect contact info ─────────────────────────────────────────────────

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS prospect_email text;
COMMENT ON COLUMN tenants.prospect_email IS 'Prospect contact email for trial communication';

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS prospect_phone text;
COMMENT ON COLUMN tenants.prospect_phone IS 'Prospect phone (E.164) for follow-up calls';

-- ── 3. Index for active trials ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_tenants_trial_status
  ON tenants (trial_status)
  WHERE trial_status IN ('trial_active', 'follow_up_due', 'decision_pending', 'live_dock');

-- ============================================================================
-- VERIFICATION:
--   SELECT slug, trial_status, trial_start, trial_end, follow_up_at
--   FROM tenants WHERE trial_status IS NOT NULL;
-- ============================================================================
