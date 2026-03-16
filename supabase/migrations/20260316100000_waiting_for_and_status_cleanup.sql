-- ============================================================================
-- Migration: Add waiting_for field + remove "contacted" from active workflow
-- ============================================================================

-- 1. Add waiting_for column with constrained values
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS waiting_for text NOT NULL DEFAULT 'niemand'
  CHECK (waiting_for IN ('niemand', 'kunde', 'material', 'partner', 'intern'));

-- 2. Migrate contacted cases
-- contacted + scheduled_at present → scheduled (Geplant)
UPDATE cases
  SET status = 'scheduled'
  WHERE status = 'contacted' AND scheduled_at IS NOT NULL;

-- contacted + no scheduled_at → new (Neu)
UPDATE cases
  SET status = 'new'
  WHERE status = 'contacted';

-- 3. Add index for waiting_for queries (Leitzentrale module)
CREATE INDEX IF NOT EXISTS idx_cases_waiting_for ON cases (waiting_for)
  WHERE waiting_for != 'niemand';
