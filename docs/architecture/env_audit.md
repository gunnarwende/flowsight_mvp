# Environment Variables Audit

**Date:** 2026-02-19
**Owner:** Head Ops Agent
**Scope:** src/web code scan + .env.local status (no values!)

## Code Usage Matrix

| Variable | Used in Code | File:Line | Documented (env_vars.md) | Configured (.env.local) | Notes |
|---|---|---|---|---|---|
| `NEXT_RUNTIME` | Yes | instrumentation.ts:4,8 | No | Auto (Next.js) | Next.js internal — no action needed |
| `SENTRY_ENVIRONMENT` | Yes | sentry.server.config.ts:8, sentry.client.config.ts:5, sentry.edge.config.ts:9 | Yes | Set | |
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | sentry.client.config.ts:4 | Yes | Set | |
| `SENTRY_DSN` | Yes (fallback) | sentry.client.config.ts:4 | Yes | Set | |
| `CI` | Yes | next.config.ts:17 | No | Auto (CI) | CI-only — no action needed |
| `SENTRY_AUTH_TOKEN` | No (build plugin) | .env.sentry-build-plugin | Yes | Set | Used by @sentry/webpack-plugin at build time |
| `SENTRY_ORG` | No (hardcoded) | next.config.ts:12 | Yes | Set | Hardcoded as "flowsight-gmbh" in next.config.ts |
| `SENTRY_PROJECT` | No (hardcoded) | next.config.ts:14 | Yes | Set | Hardcoded as "flowsight-mvp" in next.config.ts |
| `SUPABASE_URL` | Yes | src/lib/supabase/server.ts, client.ts | Yes | Set | Welle 2B |
| `SUPABASE_ANON_KEY` | Yes | src/lib/supabase/client.ts | Yes | Set | Configured 2026-02-19 |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | src/lib/supabase/server.ts | Yes | Set | Configured 2026-02-19. Server-only (import "server-only") |
| `RESEND_API_KEY` | Yes | src/lib/email/resend.ts | Yes | Set | Configured 2026-02-19 (Vercel + .env.local) |
| `MAIL_FROM` | Yes | src/lib/email/resend.ts | Yes | Set | Defaults to noreply@flowsight.ch |
| `MAIL_REPLY_TO` | Yes | src/lib/email/resend.ts | Yes | Set | Notification recipient |
| `MAIL_SUBJECT_PREFIX` | Yes | src/lib/email/resend.ts | Yes | Set | Defaults to [FlowSight] |
| `RETELL_API_KEY` | No (not yet) | — | Yes | Set | |
| `RETELL_WEBHOOK_SECRET` | No (not yet) | — | Yes | Set | |
| `RETELL_AGENT_ID` | No (not yet) | — | Yes | Not present | Optional |
| `TWILIO_ACCOUNT_SID` | No (not yet) | — | Yes | Set | |
| `TWILIO_AUTH_TOKEN` | No (not yet) | — | Yes | Set | |
| `TWILIO_PHONE_NUMBER` | No (not yet) | — | Yes | Set | CH number purchased and configured |
| `FALLBACK_TENANT_ID` | Yes | app/api/cases/route.ts | Yes | **TBD** | Seed tenant first → set UUID. See docs/runbooks/supabase_seed_tenant.md |
| `APP_URL` | No | — | **No** | Set | Undocumented — add to env_vars.md |
| `NEXT_PUBLIC_APP_URL` | No | — | **No** | Set | Undocumented — add to env_vars.md |
| `TWILIO_SIP_TRUNK_NAME` | No | — | **No** | Set | Undocumented — add to env_vars.md |

## Vercel Auto-Injected (no action needed)

VERCEL, VERCEL_ENV, VERCEL_URL, VERCEL_TARGET_ENV, VERCEL_GIT_*, VERCEL_OIDC_TOKEN, TURBO_*, NX_DAEMON — auto-injected by Vercel. Not documented in env_vars.md (correct, these are platform vars).

## Issues Found

1. **Sentry DSN hardcoded** in `sentry.server.config.ts:9` and `sentry.edge.config.ts:10` — should use `process.env.SENTRY_DSN` like client config does. Low priority (DSN is public), but inconsistent.
2. **SENTRY_ORG/PROJECT hardcoded** in `next.config.ts:12-14` — could use env vars for flexibility. Low priority.
3. **3 undocumented vars** need adding to env_vars.md: APP_URL, NEXT_PUBLIC_APP_URL, TWILIO_SIP_TRUNK_NAME.
4. ~~**Supabase keys empty**~~ — RESOLVED 2026-02-19. Keys configured in .env.local + Vercel Env.
5. ~~**Resend keys empty**~~ — RESOLVED 2026-02-19. RESEND_API_KEY, MAIL_FROM, MAIL_REPLY_TO, MAIL_SUBJECT_PREFIX configured in .env.local + Vercel Env.

## RLS Decision (MVP)

- Row Level Security: **ENABLED** on all tables (tenants, cases, tenant_numbers).
- MVP access model: **service_role_key only** for all server-side operations (API routes).
- Anon key: not used in MVP. No public read access to cases.
- Rationale: simplest secure default. Cases contain PII (phone, email). No client-side Supabase queries needed in MVP (wizard submits via API route → server-side insert).
- Phase B consideration: if dashboard needs client-side queries, add RLS policies per tenant.
