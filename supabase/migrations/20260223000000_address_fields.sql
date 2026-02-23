-- Add street + house_number to cases table
-- Nullable: old rows + voice cases may not have address data.
-- Wizard enforces required at application layer.
-- Aligned with case_contract.md update.

ALTER TABLE cases ADD COLUMN street text;
ALTER TABLE cases ADD COLUMN house_number text;

COMMENT ON COLUMN cases.street IS 'Street name of the service location. Required for wizard, optional for voice.';
COMMENT ON COLUMN cases.house_number IS 'House number of the service location. Required for wizard, optional for voice.';
