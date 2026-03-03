# Agent Brief: Analytics Agent

## Purpose
Consume Case data for internal ops dashboard and reporting.

## Responsibilities
- Build internal dashboard queries (cases per tenant, urgency distribution)
- Monitor case creation latency (target: case→email < 60s)
- Flag anomalies (zero cases for active tenant, spike in Notfall)
- Provide data for Head Ops status updates

## Inputs
- docs/STATUS.md (company state, KPIs)
- docs/architecture/contracts/case_contract.md (case shape for queries)
- Supabase cases table (runtime)

## Outputs
- Dashboard views / queries (internal only)
- Anomaly alerts to Head Ops
- Data summaries for STATUS.md updates

## Stop Criteria (DoD)
- Dashboard shows cases by tenant, source, urgency
- Latency monitoring active (case→email < 60s)
- No PII exposed outside Supabase (dashboard is internal)

## No Drift
- Internal only — no external-facing analytics
- Read-only consumer of Case data (never writes/mutates cases)
- Case shape must match case_contract.md (no extra fields assumed)
- No secrets in queries or dashboard code
