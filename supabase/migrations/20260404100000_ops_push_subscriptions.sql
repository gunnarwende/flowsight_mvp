-- Per-tenant push subscriptions for the Leitsystem (OPS) app.
-- Each staff member can subscribe to push notifications for their tenant.
-- Notification preferences control which events trigger push.

CREATE TABLE IF NOT EXISTS ops_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  staff_email text,
  endpoint text NOT NULL UNIQUE,
  keys_p256dh text NOT NULL,
  keys_auth text NOT NULL,
  -- Notification preferences (granular control, no notification flood)
  notify_notfall boolean NOT NULL DEFAULT true,
  notify_assignment boolean NOT NULL DEFAULT true,
  notify_review boolean NOT NULL DEFAULT true,
  notify_all_cases boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by tenant (used when sending push to all staff of a tenant)
CREATE INDEX IF NOT EXISTS idx_ops_push_tenant ON ops_push_subscriptions(tenant_id);

-- RLS: service role only (push is server-side)
ALTER TABLE ops_push_subscriptions ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE ops_push_subscriptions IS 'Web Push subscriptions per tenant staff member. Used by Leitsystem (OPS) app.';
COMMENT ON COLUMN ops_push_subscriptions.notify_notfall IS 'Push on urgency=notfall cases. Default ON.';
COMMENT ON COLUMN ops_push_subscriptions.notify_assignment IS 'Push when a case is assigned to this user. Default ON.';
COMMENT ON COLUMN ops_push_subscriptions.notify_review IS 'Push when a review rating is received. Default ON.';
COMMENT ON COLUMN ops_push_subscriptions.notify_all_cases IS 'Push on ALL new cases regardless of urgency. Default OFF (prevents flood).';
