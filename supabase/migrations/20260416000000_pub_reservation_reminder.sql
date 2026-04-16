-- Add reminder_sent_at to pub_reservations for 24h reminder idempotency
ALTER TABLE pub_reservations
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
