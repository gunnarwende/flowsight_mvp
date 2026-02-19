# Runbook: Seed Default Tenant

**Date:** 2026-02-19
**Owner:** Head Ops Agent

## Purpose

Insert the first tenant row (`doerfler-ag`) into Supabase so the Case API can use `FALLBACK_TENANT_ID`.

## Steps

### 1. Apply seed SQL

**Option A — Supabase CLI (preferred):**
```bash
cd flowsight_mvp
npx supabase db execute --file supabase/seed/seed_default_tenant.sql
```

**Option B — Supabase Dashboard:**
1. Open https://supabase.com/dashboard/project/oyouhwcwkdcblioecduo/sql
2. Paste contents of `supabase/seed/seed_default_tenant.sql`
3. Click **Run**

### 2. Copy returned tenant id

The query returns one row:

| id | slug | name |
|---|---|---|
| `<uuid>` | doerfler-ag | Dörfler AG |

Copy the `id` value (UUID).

### 3. Set FALLBACK_TENANT_ID

- **Vercel:** Dashboard → Settings → Environment Variables → Add `FALLBACK_TENANT_ID` = `<uuid>` for all environments (Dev + Preview + Prod).
- **.env.local:** Add `FALLBACK_TENANT_ID=<uuid>` to `src/web/.env.local`.

### 4. Verify

```bash
cd src/web && npx next dev
# In another terminal:
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{"source":"wizard","contact_phone":"+41790000000","plz":"8942","city":"Oberrieden","category":"Sanitär","urgency":"normal","description":"Test case"}'
```

Expected: 201 with `{ "id": "<case-uuid>", ... }`.

## Evidence

- Seed file: `supabase/seed/seed_default_tenant.sql`
- Schema: `supabase/migrations/20260219000000_initial_schema.sql`
