-- FlowSight W12: Review engine — track when review request was sent.
-- Ops-managed field, set by POST /api/ops/cases/[id]/request-review.

ALTER TABLE cases
  ADD COLUMN review_sent_at timestamptz;
