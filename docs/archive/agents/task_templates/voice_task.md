# Task Template: Voice Agent

## Inputs (read before starting)
- docs/STATUS.md
- docs/architecture/contracts/case_contract.md
- docs/architecture/env_vars.md (RETELL_*, TWILIO_*)
- docs/agents/voice_agent.md
- docs/runbooks/30-case-system.md

## Scope (allowed paths)
- src/web/app/api/retell/** (webhook route)
- src/web/src/lib/voice/** (voice utilities, if created)
- No changes to docs/ (request via Head Ops)

## Discovery Checklist
- [ ] All input docs read
- [ ] Retell API key and webhook secret available
- [ ] Retell agent configured (agent ID known)
- [ ] Twilio phone number status confirmed (purchased or pending)
- [ ] Supabase accessible for case creation
- [ ] No missing inputs — or escalation filed

## Delivery Checklist
- [ ] Webhook route validates RETELL_WEBHOOK_SECRET on every request
- [ ] Retell payload normalized to case_contract.md shape
- [ ] Urgency classification follows contract rules (deterministic)
- [ ] Case created in Supabase
- [ ] Email sent via Resend on case creation
- [ ] Recording OFF enforced (no audio URLs stored)
- [ ] Error paths emit Sentry events with tags: tenant_id, source, case_id

## DoD / Stop Criteria
- Webhook accepts valid Retell payload → creates Case → sends email
- Invalid/unsigned requests rejected (401/403)
- Urgency classification matches contract examples
- No audio data stored anywhere
- Build passes

## Commands to Run
```bash
git diff --stat
git status -sb
cd src/web && npm run build
```

## Never Do
- Store audio recordings or transcript files
- Enable outbound calling
- Accept more than 7 questions per call flow
- Skip webhook secret validation
- Deviate from case_contract.md field names or types
- Commit Retell/Twilio secrets
- Assume phone number routing without confirming Twilio status

## Output Format
```
Date: YYYY-MM-DD
Owner: Voice Agent
Summary: <what was done, 3–5 bullets>
Webhook: <endpoint path, validation status>
Next: <next steps, 1–3 bullets>
```

## Evidence
For each DoD item, provide:
- Filepath + line number
- Brief note explaining how criteria is met
- For webhook secret validation: show the guard clause location
