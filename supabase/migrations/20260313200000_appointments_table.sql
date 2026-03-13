-- ============================================================================
-- Appointments Table
-- 2026-03-13 | Phase 0.2 — Gold Contact Renovation
-- ============================================================================
--
-- Appointments link a case to a staff member at a scheduled time.
-- Status lifecycle: scheduled → confirmed → completed → cancelled
-- Ref: leitstand.md §6, §10.1
-- ============================================================================

CREATE TABLE appointments (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid        NOT NULL REFERENCES tenants(id),
  case_id       uuid        NOT NULL REFERENCES cases(id),
  staff_id      uuid        NOT NULL REFERENCES staff(id),
  scheduled_at  timestamptz NOT NULL,
  duration_min  integer     NOT NULL DEFAULT 60,
  status        text        NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  ics_uid       text,
  ics_sequence  integer     NOT NULL DEFAULT 0,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE appointments IS 'Case appointments. Links case → staff → time slot.';

CREATE INDEX idx_appointments_tenant ON appointments (tenant_id);
CREATE INDEX idx_appointments_case ON appointments (case_id);
CREATE INDEX idx_appointments_staff_date ON appointments (staff_id, scheduled_at)
  WHERE status IN ('scheduled', 'confirmed');

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_select" ON appointments;
CREATE POLICY "tenant_select" ON appointments
  FOR SELECT
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

DROP POLICY IF EXISTS "tenant_insert" ON appointments;
CREATE POLICY "tenant_insert" ON appointments
  FOR INSERT
  WITH CHECK (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

DROP POLICY IF EXISTS "tenant_update" ON appointments;
CREATE POLICY "tenant_update" ON appointments
  FOR UPDATE
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR tenant_id::text = (auth.jwt()->'app_metadata'->>'tenant_id')
  );

DROP POLICY IF EXISTS "tenant_delete" ON appointments;
CREATE POLICY "tenant_delete" ON appointments
  FOR DELETE
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- ── Auto-update updated_at ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();
