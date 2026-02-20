-- Welle 7: Case Attachments (Fotos/Beweise)
-- Prerequisite: Founder must create bucket "case-attachments" (private)
--   in Supabase Dashboard → Storage → New Bucket BEFORE running this migration.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

CREATE TABLE case_attachments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name   text NOT NULL,
  mime_type   text,
  size_bytes  int8,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid
);

CREATE INDEX idx_case_attachments_case_id ON case_attachments (case_id);

-- ---------------------------------------------------------------------------
-- RLS (future-proof: minimal authenticated policies)
-- ---------------------------------------------------------------------------

ALTER TABLE case_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select" ON case_attachments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert" ON case_attachments
  FOR INSERT TO authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Storage policies for "case-attachments" bucket
-- (bucket must exist first — see prerequisite above)
-- ---------------------------------------------------------------------------

CREATE POLICY "case_attachments_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'case-attachments');

CREATE POLICY "case_attachments_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'case-attachments');
