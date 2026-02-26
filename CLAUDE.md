# CLAUDE.md — Repo Guardrails

## No Drift (Fixed Decisions)
- MVP-critical: Website + Wizard + Voice Agent (Retell)
- Output: E-Mail only (customers). WhatsApp: Founder-only Ops Alerts (no customer-facing, no PII).
- Mail Provider: Resend (no 365 Graph in MVP)
- SSOT: Supabase (tenants + cases)
- Deploy: Vercel, Root Directory = src/web
- Secrets: Vercel Env = SSOT (runtime). Local .env.local via temp-dir pull sync only. Never commit to repo.
- Voice: intake-only, max 7 questions, sanitär-spezifisch, Recording OFF

## SSOT Paths
- Company status + document map: docs/STATUS.md
- Roadmap + execution: docs/OPS_BOARD.md
- Customer files: docs/customers/<slug>/status.md
- Contracts: docs/architecture/contracts/
- Runbooks: docs/runbooks/
- Compliance: docs/compliance/
- Env var registry: docs/architecture/env_vars.md
- Archive (wave log, north star v1): docs/archive/

## Conventions
- Library code: src/web/src/lib/*
- API routes: src/web/app/api/**/route.ts
- Supabase migrations: supabase/migrations/ (when created)
- Case shape: always match docs/architecture/contracts/case_contract.md

## Hygiene
- Never commit: .env*, .next, node_modules, logs, *.log
- Before every commit: run git diff + git status -sb, verify only intended files
- No force-push to main
- No secrets in any file (grep-check before commit)
- Never run `vercel deploy` from repo root — only from src/web
- Delete any .vercel/ directory at repo root after Vercel CLI commands (vercel ls, inspect, etc. re-create it)

## Monitoring (for later waves)
- Every failure path must emit a Sentry event
- Required tags on Sentry events: tenant_id, source, case_id
- P0 = case creation or email dispatch failure

## Status Update Format
- 5–10 lines max
- Include: date, owner, what changed, next steps
- Example:
  ```
  2026-02-18 | Head Ops | Added SSOT backbone (STATUS, contracts, env vars, agent briefs) | Next: Supabase schema
  ```
