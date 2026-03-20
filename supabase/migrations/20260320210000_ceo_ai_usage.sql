CREATE TABLE IF NOT EXISTS ceo_ai_usage (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  provider   text NOT NULL,
  model      text NOT NULL,
  feature    text NOT NULL,
  tokens_in  int,
  tokens_out int,
  cost_usd   numeric(10,6),
  latency_ms int,
  success    boolean DEFAULT true
);

CREATE INDEX idx_ai_usage_created ON ceo_ai_usage (created_at DESC);

COMMENT ON TABLE ceo_ai_usage IS 'AI call tracking for cost transparency.';
