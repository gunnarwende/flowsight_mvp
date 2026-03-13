-- ============================================================================
-- Staff Table
-- 2026-03-13 | Phase 0.1 — Gold Contact Renovation
-- ============================================================================
--
-- Staff members per tenant. Used for case assignment and appointment scheduling.
-- Ref: leitstand.md §10.2
-- ============================================================================

CREATE TABLE staff (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid        NOT NULL REFERENCES tenants(id),
  display_name text        NOT NULL,
  role         text        NOT NULL DEFAULT 'techniker',
  phone        text,
  email        text,
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE staff IS 'Tenant staff members. Used for case assignment + scheduling.';

CREATE INDEX idx_staff_tenant ON staff (tenant_id) WHERE is_active = true;

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- SELECT: admin sees all, user sees own tenant
DROP POLICY IF EXISTS "tenant_select" ON staff;
CREATE POLICY "tenant_select" ON staff
  FOR SELECT
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

-- INSERT: admin or own tenant
DROP POLICY IF EXISTS "tenant_insert" ON staff;
CREATE POLICY "tenant_insert" ON staff
  FOR INSERT
  WITH CHECK (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

-- UPDATE: admin or own tenant
DROP POLICY IF EXISTS "tenant_update" ON staff;
CREATE POLICY "tenant_update" ON staff
  FOR UPDATE
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

-- DELETE: admin only
DROP POLICY IF EXISTS "tenant_delete" ON staff;
CREATE POLICY "tenant_delete" ON staff
  FOR DELETE
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
