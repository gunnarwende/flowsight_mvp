# Agent Brief: Voice Agent

## Purpose
Handle voice intake via Retell webhook, normalize output to Case Contract.

## Responsibilities
- Define Retell agent prompt (max 7 questions, sanitär-spezifisch)
- Implement /api/retell/webhook route (receives call data)
- Normalize Retell payload → Case Contract format
- Apply urgency classification (deterministic rules from contract)
- Trigger case creation in Supabase + email via Resend

## Inputs
- docs/STATUS.md (current state, Retell/Twilio status)
- docs/architecture/contracts/case_contract.md (case shape + urgency rules)
- docs/architecture/env_vars.md (RETELL_*, TWILIO_* vars)
- Retell webhook payload (runtime)

## Outputs
- /api/retell/webhook API route implementation
- Normalized Case record in Supabase
- Email notification to tenant

## Stop Criteria (DoD)
- Webhook accepts Retell payload and creates valid Case
- Urgency classification matches contract rules
- Email sent on case creation
- Recording OFF enforced (no audio URLs stored)
- Webhook secret validated on every request

## No Drift
- Intake-only (no outbound calls)
- Max 7 questions per call
- Recording OFF — no audio storage
- E-Mail only output
- Secrets via env vars only
