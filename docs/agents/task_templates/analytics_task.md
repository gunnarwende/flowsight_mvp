# Task Template: Analytics Agent

## Inputs (read before starting)
- docs/STATUS.md
- docs/architecture/contracts/case_contract.md
- docs/agents/analytics_agent.md

## Scope (allowed paths)
- src/web/app/api/internal/** (internal dashboard routes, if created)
- src/web/src/lib/analytics/** (analytics utilities, if created)
- No changes to docs/ (request via Head Ops)

## Discovery Checklist
- [ ] All input docs read
- [ ] Supabase accessible (read-only queries)
- [ ] Case contract fields confirmed (query targets)
- [ ] No missing inputs — or escalation filed

## Delivery Checklist
- [ ] Queries use only fields defined in case_contract.md
- [ ] Dashboard is internal-only (no public routes)
- [ ] No PII exposed outside Supabase
- [ ] Latency monitoring: case→email < 60s target tracked
- [ ] Anomaly detection: zero cases for active tenant, Notfall spikes

## DoD / Stop Criteria
- Dashboard shows cases grouped by: tenant, source, urgency
- Latency metric visible
- No mutations to case data (read-only)
- No external-facing endpoints
- Build passes

## Commands to Run
```bash
git diff --stat
git status -sb
cd src/web && npm run build
```

## Never Do
- Write or mutate case records (read-only consumer)
- Expose dashboard routes publicly
- Assume fields not in case_contract.md
- Store PII outside Supabase
- Commit secrets or connection strings

## Output Format
```
Date: YYYY-MM-DD
Owner: Analytics Agent
Summary: <what was done, 3–5 bullets>
Queries: <which metrics implemented>
Next: <next steps, 1–3 bullets>
```

## Evidence
For each DoD item, provide:
- Filepath + line number
- Brief note explaining how criteria is met
- For read-only enforcement: show that no INSERT/UPDATE/DELETE is used
