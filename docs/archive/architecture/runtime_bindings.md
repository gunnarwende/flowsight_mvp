# Runtime Bindings (SSOT) — KEINE Secrets

**Date:** 2026-02-19
**Owner:** Head Ops Agent

## Supabase

| Key | Value | Source |
|---|---|---|
| Project Ref | `oyouhwcwkdcblioecduo` | Extracted from SUPABASE_URL in .env.local |
| Region | EU (de.sentry.io pattern suggests EU hosting) | Assumption from URL structure |
| Dashboard | https://supabase.com/dashboard/project/oyouhwcwkdcblioecduo | Derived |
| Status | Project exists, URL configured. Anon + Service Role keys **configured** in .env.local. Schema applied via `supabase db push`. | Verified: .env.local + CLI output |

### Supabase Access Model (MVP)
- **Server-side only**: all DB operations go through API routes using `SUPABASE_SERVICE_ROLE_KEY`.
- **No client-side Supabase**: wizard submits to API route, not directly to Supabase.
- **RLS**: Enabled on all tables. No anon policies in MVP. Service role bypasses RLS.
- **Keys**: SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY configured in .env.local. Still needed in Vercel Env for production deploy.

### Schema
- Migration: `supabase/migrations/20260219000000_initial_schema.sql`
- **Applied**: 2026-02-19 via `supabase link` + `supabase db push`
- Tables: `tenants`, `cases`, `tenant_numbers`
- Enums: `case_source` ('wizard','voice'), `case_urgency` ('notfall','dringend','normal')
- Contract alignment: all fields match `docs/architecture/contracts/case_contract.md`

## Sentry

| Key | Value | Source |
|---|---|---|
| Org | `flowsight-gmbh` | Hardcoded in next.config.ts:12 |
| Project | `flowsight-mvp` | Hardcoded in next.config.ts:14 |
| DSN | Public (hardcoded in server/edge configs, env var in client config) | Verified: code scan |
| Region | EU (de.sentry.io) | Verified: DSN URL |

## Vercel

| Key | Value | Source |
|---|---|---|
| Project | flowsight-mvp | Verified: Vercel CLI comments in .env.local |
| Root Directory | src/web | Verified: CLAUDE.md |
| Framework | Next.js 16.1.6 | Verified: package.json |

## Twilio

| Key | Value | Source |
|---|---|---|
| CH Number | Configured in .env.local | Verified (value not shown — secrets policy) |
| SIP Trunk | Configured (TWILIO_SIP_TRUNK_NAME in .env.local) | Verified |
| Regulatory Bundle | Approved (number is purchased) | Verified: number present in .env.local |

## Retell

| Key | Value | Source |
|---|---|---|
| API Key | Configured in .env.local | Verified |
| Webhook Secret | Configured in .env.local | Verified |
| Webhook URL | https://flowsight-mvp.vercel.app/api/retell/webhook | Verified: docs/STATUS.md |
| Agent ID | Not yet configured | TBD |
