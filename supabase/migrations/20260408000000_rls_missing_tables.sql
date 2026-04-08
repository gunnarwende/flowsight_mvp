-- Fix: Enable RLS on 6 tables that were missing it.
-- Reported by Supabase security scan 2026-04-07.
-- Core tables (cases, staff, appointments, tenants) already have RLS.

-- 1. otp_codes — CRITICAL: OTP codes must not be readable via anon key
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
-- No policies = only service_role can access (which is correct — OTP logic runs server-side)

-- 2. ceo_costs — admin only
ALTER TABLE ceo_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_only" ON ceo_costs FOR ALL
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- 3. ceo_ai_usage — admin only
ALTER TABLE ceo_ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_only" ON ceo_ai_usage FOR ALL
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- 4. ceo_tasks — admin only
ALTER TABLE ceo_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_only" ON ceo_tasks FOR ALL
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- 5. ceo_notes — admin only
ALTER TABLE ceo_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_only" ON ceo_notes FOR ALL
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- 6. ceo_push_subscriptions — service_role only (no authenticated access needed)
ALTER TABLE ceo_push_subscriptions ENABLE ROW LEVEL SECURITY;
-- No policies = only service_role can access
