-- CEO costs table for vendor cost tracking
CREATE TABLE IF NOT EXISTS ceo_costs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month      date NOT NULL,
  vendor     text NOT NULL,
  amount_chf numeric(10,2) NOT NULL,
  notes      text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_vendor_month UNIQUE (vendor, month)
);
COMMENT ON TABLE ceo_costs IS 'Monthly vendor costs for P&L. Manual entry via CEO app.';
