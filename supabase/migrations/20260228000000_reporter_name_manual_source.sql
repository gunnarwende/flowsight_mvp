-- Migration: Add reporter_name column + manual source type
-- reporter_name: extracted by voice agent, optional from wizard, editable by ops
-- manual: new source type for cases created via OPS dashboard (LinkedIn, SMS, phone call)

ALTER TABLE cases ADD COLUMN reporter_name text;

ALTER TYPE case_source ADD VALUE 'manual';
