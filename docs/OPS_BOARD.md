# OPS Board — Autopilot OS Roadmap (SSOT)

**Updated:** 2026-02-25
**Rule:** CC updates this board with every deliverable. Founder reviews weekly.

## NOW (Week 1-2, in flight)

| # | Deliverable | Owner | Blocker | Status | Evidence |
|---|-------------|-------|---------|--------|----------|
| 1 | Test data cleanup + Morning Report fix | CC + Founder (SQL) | — | DONE ✓ | Before: RED(20/17). After: YELLOW(2/0). Verified by Founder. |
| 2 | Compliance Doc Pack (subprocessors + retention) | CC | Founder decides retention periods | DONE ✓ | docs/compliance/data_processing.md (as-built, retention TBD) |
| 3 | Onboarding Template Refresh | CC | none | DONE ✓ | docs/runbooks/onboarding_customer_full.md (~55 min voice, ~25 min wizard-only) |
| 4 | Voice Post-Deploy Smoke Script | CC | none | DONE ✓ | scripts/_ops/smoke_voice.mjs — {"pass":true} verified |
| 5 | Release Evidence Standard | CC | none | DONE ✓ | docs/runbooks/release_checklist.md |
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

### Security & Access

| # | Task | Status | Notes |
|---|------|--------|-------|
| F6 | Account security / 2FA audit | pending | Enable 2FA + verify recovery codes for: Vercel, Supabase, Twilio, Retell, Resend, Sentry, Peoplefone, GitHub. Document who has access (Founder-only vs CC read-only). |

### Compliance & Privacy

| # | Task | Status | Notes |
|---|------|--------|-------|
| F7 | Data protection statements | pending | Customer disclosure/consent copy for Voice ("Dieses Gespräch wird nicht aufgezeichnet") + Wizard (privacy checkbox). Collect DPA links from each subprocessor (see docs/compliance/data_processing.md). No legal novel — just "ready to show" pack. |
| F2 | Retention periods decision | pending | Decide case + attachment retention (see TBD items in docs/compliance/data_processing.md). CC updates doc when decided. |

### Infrastructure & Billing

| # | Task | Status | Notes |
|---|------|--------|-------|
| F1 | Cost thresholds + upgrade triggers | pending | Document: Vercel Hobby limits, Twilio/Retell per-minute, Supabase plan, Resend quota. Define upgrade triggers (e.g., >100 calls/month). |
| F10 | Peoplefone/Twilio billing guard | pending | Set spend caps / credit alerts in Twilio Console + Peoplefone Portal. Prevent "suddenly dead" from exhausted credit. |
| F3 | Supabase backup awareness | pending | Document: current plan, backup interval, restore steps. Add 5-line section to 90-incident-triage.md. |
| F4 | WhatsApp Sandbox → Prod evaluation | pending | Trigger: when Ops Alerts need SLA or sandbox expires. Evaluate Twilio WhatsApp Business API costs. |

### Per-Customer Setup Gates

| # | Task | Status | Notes |
|---|------|--------|-------|
| F8 | Domain/DNS + email setup (Dörfler) | pending | Resend domain verified? DKIM/SPF/DMARC clean? Inbox test passed? (Follows deliverability gate in onboarding Step 3b.) |
| F9 | Google Business review link (Dörfler) | pending | Verify GOOGLE_REVIEW_URL is correct + review page is live. Test one review request via ops. |
| F11 | Customer go-live sign-off (Dörfler) | pending | Per-module checklist: Voice (test call PASS), Wizard (smoke PASS), Ops (login + workflow PASS), Reviews (send + receive PASS). Formal "live" declaration. |
| F5 | Peoplefone regression call | pending | Call +41 44 505 30 19 directly (Twilio Entry, no Peoplefone hop) to verify direct path still works. |

## Completed (this sprint)

| # | Deliverable | Owner | Closed | Evidence |
|---|-------------|-------|--------|----------|
| — | Strang E: Security/Compliance | CC | 2026-02-25 | Welle 23 (c4ba94d → cc68a62) |
| — | Strang C: WhatsApp + Morning Report | CC | 2026-02-25 | Welle 23-24 |
| — | Strang A: Entitlements | CC + Founder | 2026-02-25 | Welle 24 + migration applied |
| — | Strang B: Peoplefone Front Door | CC + Founder | 2026-02-25 | Welle 25 (case 255136a3) |
