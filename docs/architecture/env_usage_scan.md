# Environment Variable Usage Scan

**Date:** 2026-02-19
**Owner:** Head Ops Agent
**Method:** Grep of `src/web/**/*.{ts,tsx,mts,mjs}` for `process.env.*`

## Direct `process.env` References in Code

### instrumentation.ts
```
L4: if (process.env.NEXT_RUNTIME === "nodejs")
L8: if (process.env.NEXT_RUNTIME === "edge")
```
Vars: `NEXT_RUNTIME` (Next.js internal)

### sentry.server.config.ts
```
L8: environment: process.env.SENTRY_ENVIRONMENT,
L9: dsn: "https://e86f9a..." (HARDCODED — not via env var)
```
Vars: `SENTRY_ENVIRONMENT`
Issue: DSN hardcoded instead of using `process.env.SENTRY_DSN`

### sentry.client.config.ts
```
L4: dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
L5: environment: process.env.SENTRY_ENVIRONMENT,
```
Vars: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ENVIRONMENT`

### sentry.edge.config.ts
```
L9: environment: process.env.SENTRY_ENVIRONMENT,
L10: dsn: "https://e86f9a..." (HARDCODED — not via env var)
```
Vars: `SENTRY_ENVIRONMENT`
Issue: DSN hardcoded instead of using `process.env.SENTRY_DSN`

### next.config.ts
```
L12: org: "flowsight-gmbh",       (hardcoded, could be SENTRY_ORG)
L14: project: "flowsight-mvp",    (hardcoded, could be SENTRY_PROJECT)
L17: silent: !process.env.CI,
```
Vars: `CI`

## Vars Referenced in .env.sentry-build-plugin
```
SENTRY_AUTH_TOKEN  (picked up by @sentry/webpack-plugin at build time)
```

## Summary: Active vs Planned

| Category | Active in code | Planned (env_vars.md but not yet in code) |
|---|---|---|
| Sentry | SENTRY_ENVIRONMENT, NEXT_PUBLIC_SENTRY_DSN, SENTRY_DSN, SENTRY_AUTH_TOKEN | SENTRY_ORG, SENTRY_PROJECT (hardcoded) |
| Supabase | — | SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY |
| Resend | — | RESEND_API_KEY, MAIL_FROM, MAIL_REPLY_TO, MAIL_SUBJECT_PREFIX |
| Retell | — | RETELL_WEBHOOK_SECRET, RETELL_API_KEY, RETELL_AGENT_ID |
| Twilio | — | TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER |
| App | — | APP_URL, NEXT_PUBLIC_APP_URL, FALLBACK_TENANT_ID |
| Next.js | NEXT_RUNTIME, CI | — |
