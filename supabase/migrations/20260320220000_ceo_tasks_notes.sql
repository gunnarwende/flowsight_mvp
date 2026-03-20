-- CEO Tasks & Notes tables for Phase 10: Team Management
CREATE TABLE IF NOT EXISTS ceo_tasks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  due_at     date,
  tenant_id  uuid REFERENCES tenants(id),
  done_at    timestamptz,
  priority   text DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ceo_tasks_due ON ceo_tasks (due_at) WHERE done_at IS NULL;

CREATE TABLE IF NOT EXISTS ceo_notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text       text NOT NULL,
  tenant_id  uuid REFERENCES tenants(id),
  pinned     boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ceo_notes_created ON ceo_notes (created_at DESC);
