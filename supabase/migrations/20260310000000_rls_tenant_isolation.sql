-- ============================================================================
-- RLS Tenant Isolation + Demo Data Support
-- 2026-03-10 | D8 (Tenant-scoped Cases) + D10 (Demo Dataset)
-- ============================================================================
--
-- WHAT THIS DOES:
-- 1. Adds is_demo boolean to cases (demo dataset marker)
-- 2. Adds tenant_id to case_events (denormalization for RLS)
-- 3. Creates RLS policies on cases, case_events, case_attachments
--
-- RLS RULES:
-- - Authenticated users with app_metadata.tenant_id → see only their tenant
-- - Authenticated users with app_metadata.role = 'admin' → see all
-- - Service role (API inserts via webhook/wizard) → bypasses RLS as before
--
-- HOW TO APPLY:
-- Option A: Supabase Dashboard → SQL Editor → paste & run
-- Option B: supabase db push (if linked)
-- ============================================================================

-- ── 1. Add is_demo to cases ────────────────────────────────────────────────
ALTER TABLE cases ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN cases.is_demo IS 'True for seed/demo data. Used to separate demo cases from production.';

-- Index for filtering demo cases
CREATE INDEX IF NOT EXISTS idx_cases_is_demo ON cases (is_demo) WHERE is_demo = true;

-- ── 2. Add tenant_id to case_events (denormalization for RLS) ──────────────
ALTER TABLE case_events ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);
COMMENT ON COLUMN case_events.tenant_id IS 'Denormalized from cases.tenant_id for RLS. Set by trigger.';

-- Backfill existing events
UPDATE case_events ce
SET tenant_id = c.tenant_id
FROM cases c
WHERE ce.case_id = c.id AND ce.tenant_id IS NULL;

-- Trigger: auto-set tenant_id on new case_events
CREATE OR REPLACE FUNCTION set_case_event_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    SELECT tenant_id INTO NEW.tenant_id FROM cases WHERE id = NEW.case_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_case_events_tenant_id ON case_events;
CREATE TRIGGER trg_case_events_tenant_id
  BEFORE INSERT ON case_events
  FOR EACH ROW
  EXECUTE FUNCTION set_case_event_tenant_id();

-- ── 3. RLS Policies: cases ─────────────────────────────────────────────────
-- RLS is already enabled on cases (initial_schema.sql). Drop old if any, create new.

-- Helper: extract tenant_id from JWT app_metadata
-- Usage: auth.jwt()->'app_metadata'->>'tenant_id'

-- SELECT: admin sees all, user sees own tenant
DROP POLICY IF EXISTS "tenant_select" ON cases;
CREATE POLICY "tenant_select" ON cases
  FOR SELECT
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

-- UPDATE: admin can update all, user can update own tenant
DROP POLICY IF EXISTS "tenant_update" ON cases;
CREATE POLICY "tenant_update" ON cases
  FOR UPDATE
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

-- INSERT: only via service role (webhook, wizard). No authenticated insert policy.
-- This means getAuthClient() cannot insert cases — only getServiceClient() can.
-- This is intentional: case creation is a system operation.

-- DELETE: admin only (for cleanup)
DROP POLICY IF EXISTS "tenant_delete" ON cases;
CREATE POLICY "tenant_delete" ON cases
  FOR DELETE
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- ── 4. RLS Policies: case_events ───────────────────────────────────────────
-- RLS is already enabled on case_events (20260228200000).

DROP POLICY IF EXISTS "tenant_select" ON case_events;
CREATE POLICY "tenant_select" ON case_events
  FOR SELECT
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

-- INSERT: same as cases — only via service role
-- No authenticated insert policy needed.

-- ── 5. RLS Policies: case_attachments ──────────────────────────────────────
-- Currently has permissive "authenticated" policies. Replace with tenant-scoped.
-- case_attachments has case_id FK but no tenant_id. Use subquery.

DROP POLICY IF EXISTS "authenticated_select" ON case_attachments;
DROP POLICY IF EXISTS "authenticated_insert" ON case_attachments;

DROP POLICY IF EXISTS "tenant_select" ON case_attachments;
CREATE POLICY "tenant_select" ON case_attachments
  FOR SELECT
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_attachments.case_id
      AND c.tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
    )
  );

DROP POLICY IF EXISTS "tenant_insert" ON case_attachments;
CREATE POLICY "tenant_insert" ON case_attachments
  FOR INSERT
  WITH CHECK (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_attachments.case_id
      AND c.tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
    )
  );

-- ── 6. RLS Policies: tenants ───────────────────────────────────────────────
-- RLS is enabled but no policies. Add read-only for authenticated users.

DROP POLICY IF EXISTS "tenant_select" ON tenants;
CREATE POLICY "tenant_select" ON tenants
  FOR SELECT
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

-- ── 7. RLS Policies: tenant_numbers ────────────────────────────────────────
-- RLS is enabled but no policies. Read-only for own tenant.

DROP POLICY IF EXISTS "tenant_select" ON tenant_numbers;
CREATE POLICY "tenant_select" ON tenant_numbers
  FOR SELECT
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

-- ============================================================================
-- VERIFICATION QUERIES (run manually after applying):
--
-- 1. Check policies exist:
--    SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
--
-- 2. Check is_demo column:
--    SELECT column_name, data_type, column_default FROM information_schema.columns
--    WHERE table_name = 'cases' AND column_name = 'is_demo';
--
-- 3. Check case_events.tenant_id backfill:
--    SELECT COUNT(*) FROM case_events WHERE tenant_id IS NULL;
--    -- Should be 0 after backfill
--
-- 4. Test as admin (should see all):
--    SET request.jwt.claims = '{"app_metadata":{"role":"admin"}}';
--    SELECT count(*) FROM cases;
--
-- 5. Test as tenant user (should see only own):
--    SET request.jwt.claims = '{"app_metadata":{"tenant_id":"fc4ba994-c99c-4c17-9fa7-6c10bd0d6fa8"}}';
--    SELECT count(*) FROM cases;
-- ============================================================================
