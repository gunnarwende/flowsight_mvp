# Storage Setup — case-attachments Bucket

**Welle 7 Prerequisite.** Must be done BEFORE running the migration SQL.

## 1. Create Bucket (Supabase Dashboard)

1. Go to **Supabase Dashboard → Storage**
2. Click **"New Bucket"**
3. Name: `case-attachments`
4. **Uncheck** "Public bucket" (must be private)
5. File size limit: `10485760` (10 MB) — optional, defense-in-depth
6. Click **Create**

## 2. Run Migration SQL

Run the contents of `supabase/migrations/20260220200000_case_attachments.sql` in the **SQL Editor**:

- Creates `case_attachments` table
- Enables RLS with authenticated select/insert policies
- Creates storage policies for the bucket

## 3. Verify

```sql
-- Table exists
SELECT count(*) FROM case_attachments;

-- RLS enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'case_attachments';

-- Storage policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE 'case_attachments%';
```

## 4. Test

After deploy, open any case in /ops/cases/<id>:
- "Anhänge" section should show "Keine Anhänge."
- Upload a test image → should appear in list with download link
- Download link should open the image (signed URL, 1h TTL)
