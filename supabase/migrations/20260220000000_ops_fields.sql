-- FlowSight Welle 5: Ops fields on cases table
-- Adds workflow fields for ticketing (status, assignee, scheduling, notes).
-- These fields are Ops-managed only — Producers (wizard/voice) never write them.

-- ============================================================
-- New columns
-- ============================================================

ALTER TABLE cases
  ADD COLUMN status text NOT NULL DEFAULT 'new'
    CONSTRAINT cases_status_check CHECK (status IN ('new', 'contacted', 'scheduled', 'done')),
  ADD COLUMN assignee_text text,
  ADD COLUMN scheduled_at timestamptz,
  ADD COLUMN internal_notes text,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

-- Index for default ops view (open cases sorted by urgency + created_at)
CREATE INDEX idx_cases_status ON cases (status) WHERE status != 'done';

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
