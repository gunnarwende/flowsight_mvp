# Role Model — FlowSight Auth Architecture

**Created:** 2026-03-10 | **Owner:** CC
**Status:** ACTIVE — enforced in code via `resolveTenantScope.ts` + RLS + API routes

---

## Roles

| Role | `app_metadata.role` | Scope | Use Case |
|------|-------------------|-------|----------|
| **admin** | `"admin"` | All tenants | Founder, CC — sees everything |
| **tenant** | `"tenant"` | Own tenant only | Future: tenant staff login |
| **prospect** | `"prospect"` | Own tenant only, restricted | Demo access for sales prospects |

## Permission Matrix

| Action | admin | tenant | prospect |
|--------|-------|--------|----------|
| View cases (own tenant) | all tenants | own tenant | own tenant |
| Change case status | YES | YES | **YES** |
| Trigger review request | YES | YES | **YES** |
| Edit case details (notes, contact) | YES | YES | NO |
| Delete cases | YES | NO | NO |
| Create new cases | YES (service role) | NO (service role only) | NO |
| View tenant config | YES | own | NO |
| Manage users | YES | NO | NO |

## Auth Flow

### Admin / Tenant
- Standard Supabase Auth login (email + password or SSO)
- `app_metadata` set by admin scripts

### Prospect (Magic-Link)
- Created via `scripts/_ops/create_prospect_access.mjs`
- Receives one-time magic link (expires 24h default)
- `app_metadata: { role: "prospect", tenant_id: "<uuid>" }`
- Session: standard Supabase JWT (short-lived, auto-refresh)
- No password set — magic-link only

## Enforcement Layers

1. **RLS (Database):** Tenant isolation via `auth.jwt()->'app_metadata'->>'tenant_id'`
2. **API Routes:** `resolveTenantScope()` checks role + tenant_id, blocks unauthorized actions
3. **Dashboard UI:** Components conditionally render based on role (future)

## Implementation Files

| File | What |
|------|------|
| `src/web/src/lib/supabase/resolveTenantScope.ts` | Shared scope resolver |
| `src/web/app/api/ops/cases/[id]/route.ts` | Case PATCH permissions |
| `src/web/app/api/ops/cases/[id]/request-review/route.ts` | Review trigger permissions |
| `supabase/migrations/20260310000000_rls_tenant_isolation.sql` | RLS policies |
| `scripts/_ops/create_prospect_access.mjs` | Magic-Link provisioning |

## Rules

- **No new roles** without updating this contract
- **Prospect = read + limited write** (status + review only)
- **Case creation = service role only** (webhook, wizard) — never via authenticated user
- **Admin = god mode** — bypasses tenant filter, sees all
- **Magic-Link expiry** = 24h default, configurable
