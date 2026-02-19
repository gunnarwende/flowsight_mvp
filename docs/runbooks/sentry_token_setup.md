# Sentry API Token Setup

**Status:** Ready to execute (Founder action required)
**ENV var:** `SENTRY_API_TOKEN`
**Where:** Vercel Environment Variables (+ optional src/web/.env.local for local scripts)

## Why

Ops scripts (e.g. `verify_sentry_token.mjs`) need read access to the Sentry API to verify events, issues, and traces. The current token (if any) returns 403.

## Steps (Founder)

### 1. Create Auth Token

1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Click **"Create New Token"**
3. Set name: `flowsight-ops-readonly`
4. Select scopes (least privilege):
   - `org:read`
   - `project:read`
   - `event:read`
5. Click **"Create Token"**
6. Copy the token value (shown once)

### 2. Set in Vercel

1. Go to https://vercel.com → Project **flowsight-mvp** → Settings → Environment Variables
2. Add:
   - Name: `SENTRY_API_TOKEN`
   - Value: (paste token)
   - Environments: Production, Preview, Development
3. Click **Save**

### 3. Set locally (optional, for ops scripts)

Add to `src/web/.env.local`:
```
SENTRY_API_TOKEN=sntrys_...
```

### 4. Verify

```bash
node --env-file=src/web/.env.local scripts/_ops/verify_sentry_token.mjs
```

Expected output: all 3 checks return HTTP 200.

## Context

- Org: `flowsight-gmbh` (from next.config.ts)
- Project: `flowsight-mvp` (from next.config.ts)
- DSN (ingest, NOT the API token): already configured in sentry.*.config.ts
- `SENTRY_AUTH_TOKEN` (if exists in Vercel) is for source map uploads at build time — **different** from `SENTRY_API_TOKEN` for API reads
