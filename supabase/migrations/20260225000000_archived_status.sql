-- FlowSight: Add 'archived' status for test data cleanup
-- Archived cases are hidden from ops dashboard + morning report.
-- They remain in the DB for audit trail.

-- Expand CHECK constraint
ALTER TABLE cases DROP CONSTRAINT cases_status_check;
ALTER TABLE cases ADD CONSTRAINT cases_status_check
  CHECK (status IN ('new', 'contacted', 'scheduled', 'done', 'archived'));

-- Update partial index to also exclude archived
DROP INDEX IF EXISTS idx_cases_status;
CREATE INDEX idx_cases_status ON cases (status) WHERE status NOT IN ('done', 'archived');
