# Task Template: Head Ops

## Inputs (read before starting)
- docs/STATUS.md
- docs/architecture/contracts/case_contract.md
- docs/architecture/env_vars.md
- docs/runbooks/ (all)
- docs/agents/ (all briefs)
- docs/customers/<slug>/status.md (if customer-specific)

## Scope (allowed paths)
- docs/**/*.md
- CLAUDE.md
- No changes to src/web or any code files

## Discovery Checklist
- [ ] docs/STATUS.md read and current
- [ ] All agent briefs read
- [ ] Customer status files reviewed (if applicable)
- [ ] No missing inputs — or escalation filed

## Delivery Checklist
- [ ] STATUS.md updated with current state
- [ ] Tasks created for delegated agents (using templates)
- [ ] Review criteria defined (DoD per task)
- [ ] Learning log updated (docs/ops/learning.md) if applicable

## DoD / Stop Criteria
- STATUS.md reflects actual repo state
- All delegated tasks have clear scope + DoD
- No secrets in repo (grep-verified)
- Git history clean (no WIP commits on main)

## Commands to Run
```bash
git diff --stat
git status -sb
```

## Never Do
- Commit secrets or credential values
- Modify src/web code (delegate to Web Agent)
- Assume service access without confirmation
- Skip reading STATUS.md before any decision
- Make scope decisions without updating STATUS.md

## Output Format
```
Date: YYYY-MM-DD
Owner: Head Ops
Summary: <what was done, 3–5 bullets>
Next: <next steps, 1–3 bullets>
```

## Evidence
For each DoD item, provide:
- Filepath or command output proving completion
- Brief note explaining how criteria is met
