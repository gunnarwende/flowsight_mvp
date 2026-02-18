# Task Template: Web Agent

## Inputs (read before starting)
- docs/STATUS.md
- docs/architecture/contracts/case_contract.md
- docs/architecture/env_vars.md
- docs/architecture/website_playbook.md
- docs/brand/style_dna.md
- docs/qa/high_end_gates.md
- docs/runbooks/30-case-system.md

## Scope (allowed paths)
- src/web/**
- supabase/migrations/** (when schema work begins)
- No changes to docs/ (request via Head Ops)

## Discovery Checklist
- [ ] All input docs read
- [ ] Env vars available locally (.env.local) or confirmed in Vercel
- [ ] Supabase project accessible (if DB work needed)
- [ ] Sentry DSN configured
- [ ] No missing inputs — or escalation filed

## Delivery Checklist
- [ ] Code changes match case_contract.md shape exactly
- [ ] Website follows website_playbook.md IA structure
- [ ] Design follows style_dna.md rules
- [ ] QA gates addressed (docs/qa/high_end_gates.md)
- [ ] No secrets in code (grep-verified)
- [ ] Build passes: `npm run build` (from src/web)

## DoD / Stop Criteria
- All applicable QA gates pass with evidence
- Case output matches contract (if wizard/API work)
- Email dispatch works via Resend (if email work)
- Sentry captures errors with required tags
- Vercel preview deploy succeeds

## Commands to Run
```bash
git diff --stat
git status -sb
cd src/web && npm run build
```

## Never Do
- Commit .env files or secrets
- Deviate from case_contract.md field names or types
- Add SMS/WhatsApp output (email-only in MVP)
- Store voice recordings or audio URLs
- Use stock photos (real images only, per style_dna.md)
- Skip QA gate checklist before requesting merge
- Assume env var values — check docs/architecture/env_vars.md

## Output Format
```
Date: YYYY-MM-DD
Owner: Web Agent
Summary: <what was done, 3–5 bullets>
QA Gates: <which gates pass, which deferred + reason>
Next: <next steps, 1–3 bullets>
```

## Evidence
For each DoD/gate item, provide:
- Filepath + line number (e.g., `src/web/app/page.tsx:L45`)
- Brief note explaining how criteria is met
- If deferred: reason and when it will be addressed
