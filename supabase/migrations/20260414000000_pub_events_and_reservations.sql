-- BigBen Pub: Events + Reservations tables
-- Used by /ops/events (pub owner manages events) and /api/bigben-pub/ routes

-- ── pub_events: Sport matches + pub events ──────────────────────
CREATE TABLE IF NOT EXISTS pub_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('sport', 'event')),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_time TIME,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pub_events_tenant_date ON pub_events (tenant_id, event_date);
CREATE INDEX idx_pub_events_category ON pub_events (tenant_id, category, event_date);

ALTER TABLE pub_events ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; authenticated users see their tenant's events
CREATE POLICY "pub_events_tenant_read" ON pub_events
  FOR SELECT USING (true); -- Public read (events are shown on website)

CREATE POLICY "pub_events_tenant_write" ON pub_events
  FOR ALL USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::UUID
      FROM auth.users
      WHERE id = auth.uid()
    )
  );

-- ── pub_reservations: Table bookings ────────────────────────────
CREATE TABLE IF NOT EXISTS pub_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled', 'no_show')),
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'voice', 'manual', 'phone')),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pub_reservations_tenant_date ON pub_reservations (tenant_id, reservation_date);

ALTER TABLE pub_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pub_reservations_insert" ON pub_reservations
  FOR INSERT WITH CHECK (true); -- Anyone can make a reservation (website/voice)

CREATE POLICY "pub_reservations_tenant_read" ON pub_reservations
  FOR SELECT USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::UUID
      FROM auth.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "pub_reservations_tenant_update" ON pub_reservations
  FOR UPDATE USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::UUID
      FROM auth.users
      WHERE id = auth.uid()
    )
  );
