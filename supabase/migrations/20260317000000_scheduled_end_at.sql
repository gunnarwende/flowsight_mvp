ALTER TABLE cases ADD COLUMN scheduled_end_at timestamptz;
COMMENT ON COLUMN cases.scheduled_end_at IS 'End of appointment window. NULL = legacy 60-min default.';
