-- Push notification subscriptions for CEO app
CREATE TABLE IF NOT EXISTS ceo_push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint   text NOT NULL UNIQUE,
  keys_p256dh text NOT NULL,
  keys_auth  text NOT NULL,
  user_email text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_push_subs_endpoint ON ceo_push_subscriptions (endpoint);
COMMENT ON TABLE ceo_push_subscriptions IS 'Web Push subscriptions for CEO notification delivery.';
