-- Migration: Add sequential case number per tenant
-- Display format: FS-0001, FS-0002, ... (per tenant_id)
-- Uses advisory lock to prevent race conditions on concurrent inserts.

ALTER TABLE cases ADD COLUMN seq_number integer;

-- Backfill existing cases
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY created_at) AS rn
  FROM cases
)
UPDATE cases SET seq_number = numbered.rn FROM numbered WHERE cases.id = numbered.id;

-- Auto-increment trigger (advisory lock = race-condition-safe)
CREATE OR REPLACE FUNCTION assign_case_seq_number()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(NEW.tenant_id::text));
  SELECT COALESCE(MAX(seq_number), 0) + 1 INTO NEW.seq_number
  FROM cases WHERE tenant_id = NEW.tenant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_seq_number
  BEFORE INSERT ON cases FOR EACH ROW
  EXECUTE FUNCTION assign_case_seq_number();

CREATE INDEX idx_cases_seq_number ON cases (tenant_id, seq_number);
