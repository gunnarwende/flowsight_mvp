-- BigBen Pub: Callback Requests table
--
-- Suppliers and business partners often phone the pub asking Paul to call
-- them back. Without a structured surface, Paul forgets these calls. We
-- capture them in their own table (NOT pub_reservations — they have no
-- date / time / party_size, the schema would just be 90% NULL).
--
-- Lisa detects "please have Paul call me back" passively from the call
-- and writes a row here via the sync-calls polling path. Paul sees a
-- "Callbacks" card on the dashboard with pending count + a list page
-- to mark each one resolved.

CREATE TABLE IF NOT EXISTS pub_callback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Caller identity (from Retell call: from_number; name extracted by Lisa)
  caller_name TEXT,
  caller_phone TEXT NOT NULL,

  -- What the call was about (free-text from Lisa's PCA — supplier name,
  -- delivery topic, business context, etc.)
  topic TEXT,

  -- Audit trail back to the original Retell call (for debugging extraction
  -- errors and listening to the recording if Paul wants context)
  call_id TEXT,
  transcript_excerpt TEXT,

  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hot path: list pending callbacks for a tenant, newest first
CREATE INDEX idx_pub_callback_requests_tenant_status
  ON pub_callback_requests (tenant_id, status, created_at DESC);

-- Idempotency for sync-calls: same call must not create duplicate rows
CREATE UNIQUE INDEX idx_pub_callback_requests_call_id
  ON pub_callback_requests (call_id)
  WHERE call_id IS NOT NULL;

ALTER TABLE pub_callback_requests ENABLE ROW LEVEL SECURITY;

-- Service role (sync-calls polling, voice path) bypasses RLS.
-- Authed users only see their own tenant's callbacks.
CREATE POLICY "pub_callback_requests_tenant_read" ON pub_callback_requests
  FOR SELECT USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::UUID
      FROM auth.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "pub_callback_requests_tenant_update" ON pub_callback_requests
  FOR UPDATE USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::UUID
      FROM auth.users
      WHERE id = auth.uid()
    )
  );
