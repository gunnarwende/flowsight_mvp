# OPS Board — Autopilot OS Roadmap (SSOT)

**Updated:** 2026-02-25
**Rule:** CC updates this board with every deliverable. Founder reviews weekly.

## NOW (Week 1-2, in flight)

| # | Deliverable | Owner | Blocker | Status | Evidence |
|---|-------------|-------|---------|--------|----------|
| 1 | Test data cleanup + Morning Report fix | CC + Founder (SQL) | Founder runs archive SQL | in_progress | — |
| 2 | Compliance Doc Pack (subprocessors + retention) | CC | Founder confirms retention periods | pending | — |
| 3 | Onboarding Template Refresh | CC | none | pending | — |
| 4 | Voice Post-Deploy Smoke Script | CC | none | pending | — |
| 5 | Release Evidence Standard | CC | none | pending | — |
| 6 | Ops Daily Driver Quick Fixes | CC + Founder | Founder provides top 3 pain points | pending | — |

## NEXT (after NOW is closed, no overlap)

| # | Deliverable | Owner | Trigger |
|---|-------------|-------|---------|
| N1 | Ops-light UI (reviews-only mode) | CC | Reviews-only customer signs |
| N2 | CH PLZ validation (voice + wizard) | CC | Misrecognition rate data from production calls |
| N3 | WhatsApp Sandbox → Production | Founder | Ops Alerts need SLA (sandbox expires or volume grows) |
| N4 | Automated morning report (cron) | CC | Vercel Pro upgrade (enables cron jobs) |

## LATER (parked, explicit triggers)

| # | Deliverable | Owner | Trigger |
|---|-------------|-------|---------|
| L1 | Offboarding runbook | CC | Customer #2 onboards |
| L2 | Billing/Plan SOP | Founder | Customer #3 or pricing page drives inbound |
| L3 | Failure drills (telephony) | CC | First real incident (becomes the drill) |
| L4 | Sales/GTM system | Founder | Repeatable sales motion needed |
| L5 | Founder Agent v1 (Retell) | CC + Founder | Strang D stable, separate plan |
| L6 | Founder Ops Inbox | CC + Founder | Strang D stable, separate plan |

## Founder Backlog (on-the-business, parallel, CC not blocked)

These are Founder-owned tasks that run in parallel. CC does not implement these but tracks them here for SSOT.

| # | Task | Status | Notes |
|---|------|--------|-------|
| F1 | Cost thresholds + upgrade triggers | pending | Document: Vercel Hobby limits, Twilio/Retell per-minute rates, Supabase plan, Resend quota. Define upgrade triggers (e.g., >100 calls/month → Retell Pro). |
| F2 | Email deliverability gate per customer | pending | SPF/DKIM check + inbox test as onboarding step. Add to onboarding runbook after CC refreshes it (Deliverable #3). |
| F3 | Supabase backup awareness | pending | Document: current plan, backup interval, restore steps. Add 5-line section to docs/runbooks/90-incident-triage.md. |
| F4 | WhatsApp Sandbox → Prod evaluation | pending | Trigger: when Ops Alerts need SLA or sandbox expires. Evaluate Twilio WhatsApp Business API costs. |
| F5 | Peoplefone E2E regression call | pending | Call +41 44 505 30 19 directly (Twilio Entry, no Peoplefone hop) to verify regression. |

## Completed (this sprint)

| # | Deliverable | Owner | Closed | Evidence |
|---|-------------|-------|--------|----------|
| — | Strang E: Security/Compliance | CC | 2026-02-25 | Welle 23 (c4ba94d → cc68a62) |
| — | Strang C: WhatsApp + Morning Report | CC | 2026-02-25 | Welle 23-24 |
| — | Strang A: Entitlements | CC + Founder | 2026-02-25 | Welle 24 + migration applied |
| — | Strang B: Peoplefone Front Door | CC + Founder | 2026-02-25 | Welle 25 (case 255136a3) |
