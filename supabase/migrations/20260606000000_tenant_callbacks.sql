-- tenant_callbacks — generalisierte "Rückrufe / Nachrichten"-Tabelle
-- (Onboarding-Cockpit Phase 2, OC1).
--
-- Verallgemeinert das Muster von pub_callback_requests (BigBen) auf ALLE
-- Betriebe/Module. Hintergrund: docs/gtm/onboarding/phase2_voice_dispositions.md
-- + phase2_datamodel_backend.md.
--
-- Lisa sortiert jeden Anruf in 3 Körbe: FALL (cases) / NACHRICHT (diese
-- Tabelle) / NICHTS. "NACHRICHT" = jemand will Rückruf, ohne dass Arbeit
-- (ein Fall) entsteht:
--   reason='callback'        -> Rückruf-Wunsch / Lieferant / "den Chef sprechen" (D3)
--   reason='order_followup'  -> Nachfrage zu bestehendem Auftrag (D4)
--
-- BEWUSST ADDITIV: pub_callback_requests (BigBen, live) bleibt UNANGETASTET.
-- Eine spätere Konsolidierung (BigBen -> tenant_callbacks) ist ein eigener,
-- founder-getesteter Schritt — hier wird NICHTS am Live-Pfad geändert.

CREATE TABLE IF NOT EXISTS tenant_callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Warum dieser Rückruf — steuert Label/Routing im Leitsystem
  reason TEXT NOT NULL DEFAULT 'callback'
    CHECK (reason IN ('callback', 'order_followup')),

  -- Anrufer (from_number; Name von Lisa via PCA extrahiert)
  caller_name TEXT,
  caller_phone TEXT NOT NULL,

  -- Worum ging's (free-text aus Lisas PCA)
  topic TEXT,

  -- Audit-Trail zum Retell-Call (Debugging + Idempotenz)
  call_id TEXT,
  transcript_excerpt TEXT,

  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hot path: pending callbacks je Tenant, neueste zuerst
CREATE INDEX IF NOT EXISTS idx_tenant_callbacks_tenant_status
  ON tenant_callbacks (tenant_id, status, created_at DESC);

-- Idempotenz: ein Retell-Call darf keine Duplikate erzeugen
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_callbacks_call_id
  ON tenant_callbacks (call_id)
  WHERE call_id IS NOT NULL;

ALTER TABLE tenant_callbacks ENABLE ROW LEVEL SECURITY;

-- Service role (Webhook / Voice-Pfad) umgeht RLS. Authed Users sehen + ändern
-- nur ihren eigenen Tenant (gleiches Muster wie pub_callback_requests).
CREATE POLICY "tenant_callbacks_tenant_read" ON tenant_callbacks
  FOR SELECT USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::UUID
      FROM auth.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "tenant_callbacks_tenant_update" ON tenant_callbacks
  FOR UPDATE USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::UUID
      FROM auth.users
      WHERE id = auth.uid()
    )
  );
