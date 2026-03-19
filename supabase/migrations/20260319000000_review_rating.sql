-- Add review rating fields to cases (FB6 gold status + review KPI)
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS review_rating smallint CHECK (review_rating >= 1 AND review_rating <= 5),
  ADD COLUMN IF NOT EXISTS review_received_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_sent_count smallint DEFAULT 0;
