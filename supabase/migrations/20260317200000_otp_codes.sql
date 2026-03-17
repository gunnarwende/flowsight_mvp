-- Custom OTP codes table — bypasses Supabase email rate limits.
-- Codes are verified server-side, then a Supabase session is created via admin API.
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX idx_otp_codes_email_code ON otp_codes (email, code) WHERE NOT used;

-- Auto-cleanup: delete codes older than 1 hour (cron or manual)
-- For now, we clean up in the API route on each request.
