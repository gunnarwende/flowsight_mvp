-- Seed realistic review demo data for Weinberger AG
-- Covers 7d, 30d, and YTD ranges for both Admin and Techniker views

-- Weinberger tenant_id: fc4ba994-c99c-4c17-9fa7-6c10bd0d6fa8
DO $$
DECLARE
  t_id uuid := 'fc4ba994-c99c-4c17-9fa7-6c10bd0d6fa8';
BEGIN

-- ── Update existing done cases with review data ────────────────────
-- Set review_sent_at on some done cases (review requested but no response yet)
UPDATE cases
  SET review_sent_at = updated_at + interval '1 day',
      review_sent_count = 1
  WHERE tenant_id = t_id
    AND status = 'done'
    AND review_sent_at IS NULL
    AND review_rating IS NULL
    AND id IN (
      SELECT id FROM cases
      WHERE tenant_id = t_id AND status = 'done' AND review_sent_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    );

-- Set review_rating on some done cases (customer responded with good rating)
UPDATE cases
  SET review_rating = 5,
      review_received_at = updated_at + interval '2 days',
      review_sent_at = COALESCE(review_sent_at, updated_at + interval '1 day'),
      review_sent_count = COALESCE(NULLIF(review_sent_count, 0), 1)
  WHERE tenant_id = t_id
    AND status = 'done'
    AND review_rating IS NULL
    AND id IN (
      SELECT id FROM cases
      WHERE tenant_id = t_id AND status = 'done' AND review_rating IS NULL
      ORDER BY created_at ASC
      LIMIT 3
    );

-- Set one 4-star rating
UPDATE cases
  SET review_rating = 4,
      review_received_at = updated_at + interval '3 days',
      review_sent_at = COALESCE(review_sent_at, updated_at + interval '1 day'),
      review_sent_count = COALESCE(NULLIF(review_sent_count, 0), 1)
  WHERE tenant_id = t_id
    AND status = 'done'
    AND review_rating IS NULL
    AND id IN (
      SELECT id FROM cases
      WHERE tenant_id = t_id AND status = 'done' AND review_rating IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    );

-- Set one 3-star rating (internal only, not gold)
UPDATE cases
  SET review_rating = 3,
      review_received_at = updated_at + interval '2 days',
      review_sent_at = COALESCE(review_sent_at, updated_at + interval '1 day'),
      review_sent_count = COALESCE(NULLIF(review_sent_count, 0), 1)
  WHERE tenant_id = t_id
    AND status = 'done'
    AND review_rating IS NULL
    AND id IN (
      SELECT id FROM cases
      WHERE tenant_id = t_id AND status = 'done' AND review_rating IS NULL
      ORDER BY random()
      LIMIT 1
    );

END $$;
