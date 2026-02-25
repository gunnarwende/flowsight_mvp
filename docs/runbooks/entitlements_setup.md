# Entitlements Setup — FlowSight MVP

**Owner:** Founder (migration) + Head Ops (code)
**Last updated:** 2026-02-25

## Migration: Add modules column to tenants

Run in Supabase SQL Editor:

```sql
-- Add modules jsonb column (default empty = all modules allowed)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS modules jsonb DEFAULT '{}';

-- Set Dörfler AG modules (all enabled)
UPDATE tenants
SET modules = '{"website_wizard": true, "ops": true, "voice": true, "reviews": true}'::jsonb
WHERE slug = 'doerfler-ag';
```

## How it works

- `modules` is a jsonb column on `tenants`: `{"voice": true, "ops": true, ...}`
- `hasModule(tenantId, "voice")` checks if the module is enabled
- **Graceful fallback:** if `modules` is empty or column doesn't exist → all modules allowed
- This means existing tenants work without migration (no breaking change)

## Enforcement points

| Module | Route | Behavior when disabled |
|--------|-------|----------------------|
| `voice` | `/api/retell/webhook` | 204 skip + Sentry warning (call drops silently) |
| `website_wizard` | `/api/cases` (source=wizard) | 403 JSON error |
| `ops` | Planned: middleware or page-level | Redirect to "not enabled" |
| `reviews` | Planned: request-review route | 403 JSON error |

## Valid module names

- `website_wizard` — Website + Wizard intake form
- `ops` — Ops dashboard (/ops/cases)
- `voice` — Voice agent (Retell webhook)
- `reviews` — Review request engine

## Adding a new tenant

```sql
INSERT INTO tenants (id, slug, name, modules)
VALUES (
  gen_random_uuid(),
  'new-tenant',
  'New Tenant AG',
  '{"website_wizard": true, "ops": true, "voice": true}'::jsonb
);
```
