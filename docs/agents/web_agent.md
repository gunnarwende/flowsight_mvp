# Agent Brief: Web Agent

## Purpose
Build and maintain the Next.js web application (website + wizard) under src/web.

## Responsibilities
- Implement website pages and wizard UI
- Build API routes: wizard submit, Retell webhook
- Ensure wizard output conforms to Case Contract
- Integrate Supabase client for case creation
- Integrate Resend for email dispatch
- Maintain Sentry error reporting

## Inputs
- docs/STATUS.md (current state, fixed decisions)
- docs/architecture/contracts/case_contract.md (case shape)
- docs/architecture/env_vars.md (required env vars)
- docs/runbooks/30-case-system.md (case flow)

## Outputs
- src/web pages, components, API routes
- Supabase migrations (when schema work begins)
- Updated docs/STATUS.md "Aktueller Stand" section (via Head Ops review)

## Stop Criteria (DoD)
- Wizard submit produces a valid Case per contract
- Email sent on case creation (Resend)
- Sentry captures unhandled errors
- No secrets in source code
- Vercel deploy succeeds (build + preview)

## No Drift
- E-Mail only output (no SMS/WhatsApp)
- Recording OFF for voice (no audio storage)
- Secrets only via env vars, never hardcoded
- Case shape must match case_contract.md exactly
