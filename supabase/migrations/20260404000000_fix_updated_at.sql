-- Temporarily disable the auto-update trigger
ALTER TABLE cases DISABLE TRIGGER cases_updated_at;

-- Set realistic updated_at for done cases: 1-3 days after created_at
UPDATE cases
SET updated_at = created_at + (interval '1 day' * (1 + random() * 2))
WHERE status = 'done';

-- Set updated_at for non-done cases: same day as created
UPDATE cases
SET updated_at = created_at + (interval '1 hour' * random())
WHERE status != 'done';

-- Re-enable the trigger
ALTER TABLE cases ENABLE TRIGGER cases_updated_at;
