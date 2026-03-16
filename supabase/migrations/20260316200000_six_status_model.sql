-- ============================================================================
-- Migration: 6-status model (Neu, Geplant, In Arbeit, Warten, Erledigt, Abgeschlossen)
-- ============================================================================

-- 1. Update status CHECK constraint
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_status_check;
ALTER TABLE cases ADD CONSTRAINT cases_status_check
  CHECK (status IN ('new', 'scheduled', 'in_arbeit', 'warten', 'done', 'archived'));

-- 2. Update partial index (exclude terminal states)
DROP INDEX IF EXISTS idx_cases_status;
CREATE INDEX idx_cases_status ON cases (status)
  WHERE status NOT IN ('done', 'archived');
