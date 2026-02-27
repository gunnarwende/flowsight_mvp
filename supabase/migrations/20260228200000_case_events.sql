-- Migration: Case events table for timeline/audit log
-- Event types: case_created, status_changed, email_notification_sent,
--              reporter_confirmation_sent, invite_sent, review_requested, fields_updated

CREATE TABLE case_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id    uuid        NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  event_type text        NOT NULL,
  title      text        NOT NULL,
  detail     text,
  metadata   jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_events_case ON case_events (case_id, created_at);

ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;
