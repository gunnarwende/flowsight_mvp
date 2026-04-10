-- Soft delete for cases: is_deleted flag + deleted_at timestamp
-- Cases are never physically deleted, only flagged.
-- KPIs and active views filter on is_deleted = false.

ALTER TABLE cases ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
