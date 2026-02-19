-- Seed: Default tenant for MVP (doerfler-ag)
-- Run once via: supabase db execute < supabase/seed/seed_default_tenant.sql
-- Or paste into Supabase Dashboard → SQL Editor
--
-- The returned id must be set as FALLBACK_TENANT_ID in Vercel Env + .env.local.

INSERT INTO tenants (slug, name)
VALUES ('doerfler-ag', 'Dörfler AG')
ON CONFLICT (slug) DO NOTHING
RETURNING id, slug, name;
