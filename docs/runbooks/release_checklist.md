# Release Checklist

**Owner:** CC (execution) + Founder (voice rollback)
**Last updated:** 2026-02-25

## Pre-Push Gates

```bash
# 1. Lint (when src/web touched)
cd src/web && npx eslint . --max-warnings 0

# 2. Build
cd src/web && npx next build

# 3. Diff review — only intended files
git diff --stat
git status -sb
```

All three must pass. No `--no-verify`, no skipped checks.

## Post-Push Smoke (~60s after deploy settles)

```bash
# 4. Voice smoke (health + webhook + tenant_numbers + case age)
node --env-file=src/web/.env.local scripts/_ops/smoke_voice.mjs
# Expect: {"pass":true,...}

# 5. Health quick check (confirms deploy is live)
curl -s https://flowsight-mvp.vercel.app/api/health | head -c 200
# Expect: {"status":"ok",...}
```

Both must return ok. If smoke fails → investigate before moving on.

## Evidence Pack (per release)

Record in STATUS.md under the current wave:

```
commit:     <short SHA>
build:      clean (<N> routes)
smoke:      {"pass":true,"health":"ok","webhook":"ok","numbers":<N>,"last_voice_case_age_h":<N>}
```

No PII, no secrets, no free text beyond what the tools output.

## SSOT Updates

- [ ] STATUS.md: wave entry updated (date, bullets, commit, evidence)
- [ ] OPS_BOARD.md: deliverable status updated (if applicable)

## Rollback

### Web (Vercel)

```bash
git revert HEAD
git push origin main
# Wait ~90s for Vercel deploy
node --env-file=src/web/.env.local scripts/_ops/smoke_voice.mjs
```

### Voice (Retell agents)

Founder-only — Retell Dashboard:
1. Open agent → Version History → select previous version → Publish
2. Verify with test call

> API `publish-agent` is unreliable. Always use Dashboard for voice rollback.

### Database (Supabase migrations)

Write a reverse migration SQL. Do NOT use `DROP TABLE` or `DROP COLUMN` without explicit Founder approval.
