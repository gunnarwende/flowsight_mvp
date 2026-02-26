# OPS Board — Autopilot OS Roadmap (SSOT)

**Updated:** 2026-02-25 (EOD P0 update)
**Rule:** CC updates this board with every deliverable. Founder reviews weekly.

## NOW (Week 1-2, in flight)

| # | Deliverable | Owner | Blocker | Status | Evidence |
|---|-------------|-------|---------|--------|----------|
| 1 | Test data cleanup + Morning Report fix | CC + Founder (SQL) | — | DONE ✓ | Before: RED(20/17). After: YELLOW(2/0). Verified by Founder. |
| 2 | Compliance Doc Pack (subprocessors + retention) | CC | Founder decides retention periods | DONE ✓ | docs/compliance/data_processing.md (as-built, retention TBD) |
| 3 | Onboarding Template Refresh | CC | none | DONE ✓ | docs/runbooks/onboarding_customer_full.md (~55 min voice, ~25 min wizard-only) |
| 4 | Voice Post-Deploy Smoke Script | CC | none | DONE ✓ | scripts/_ops/smoke_voice.mjs — {"pass":true} verified |
| 5 | Release Evidence Standard | CC | none | DONE ✓ | docs/runbooks/release_checklist.md |
| 6 | Ops Daily Driver Quick Fixes | CC + Founder | — | DEFERRED | Trigger: ≥5 active customers or same friction observed 3× |

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
| L7 | PLZ readback voice quality | CC + Founder | Observed: digit-by-digit cadence unnatural ("acht … neun … vier … zwei"), hard to understand. Retell prompt tuning (Founder publishes via Dashboard). |

## Founder Backlog (on-the-business, parallel, CC not blocked)

These are Founder-owned tasks that run in parallel. CC does not implement these but tracks them here for SSOT.

> **F8 merged into F2** (same scope: email deliverability). 11 items, no scope lost.

### P0 — Go-Live Critical (Dörfler)

| # | Task | Status | Notes |
|---|------|--------|-------|
| F10 | Peoplefone/Twilio billing guard | **DONE** ✅ | Twilio: usage triggers $10/$25. Peoplefone: auto top-up <CHF 20 → +CHF 50 + auto-renew. |
| F5 | Voice Regression Call Gate | **PASS** ✅ | E2E: call_cb50d6fd… → case 9d89cf6b → email received. Full path verified. |
| F2 | Email Deliverability Gate (Dörfler) | **PASS** ✅ | flowsight.ch verified in Resend. DMARC p=none. Inbox test: SPF=pass, DKIM=pass, DMARC=pass. |
| F9 | Google Business review link (Dörfler) | **BLOCKED** ⏳ | No customer Google Business Profile access / no official review link yet. |
| F11 | Customer go-live sign-off (Dörfler) | **PARTIAL** ⏳ | Voice: PASS. Wizard: PASS (case 5fb36e99). Ops: READY. Reviews: blocked by F9. |

### P1 — Week 2

| # | Task | Status | Notes |
|---|------|--------|-------|
| F6 | Account security / 2FA audit | **DONE** ✅ | docs/runbooks/access_matrix.md. 6/8 services 2FA enabled. Gaps: Retell + Peoplefone (no 2FA available). |
| F1 | Cost thresholds + upgrade triggers | **DONE** ✅ | docs/runbooks/cost_triggers.md. 6 vendors, trigger + action per vendor. |
| F3 | Supabase backup awareness | **DOCUMENTED** ⚠️ | Free plan = no backups. Risk accepted. Upgrade trigger defined. docs/runbooks/backup_awareness.md + section in incident-triage. |

### P2 — Trigger-based (park)

| # | Task | Status | Notes |
|---|------|--------|-------|
| F12 | Retention decisions | pending | Decide case + attachment retention periods (see TBD items in docs/compliance/data_processing.md). CC updates doc + implements enforcement when decided. |
| F4 | WhatsApp Sandbox → Prod evaluation | pending | Trigger: when Ops Alerts need SLA or sandbox expires. Evaluate Twilio WhatsApp Business API costs. |
| F7 | Data protection statements | pending | Customer disclosure/consent copy for Voice ("Dieses Gespräch wird nicht aufgezeichnet") + Wizard (privacy checkbox). Collect DPA links from each subprocessor (see docs/compliance/data_processing.md). No legal novel — just "ready to show" pack. |

## 40h Go-Live Sprint (2026-02-26)

### CC Blocks
| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | DemoForm Backend — `/api/demo` → E-Mail an Founder | **DONE** ✅ | POST → Resend email, commit 9fa311f |
| 2 | Dörfler AG Website — High-End Rebuild (12 Sektionen, Template, Lightbox) | **DONE** ✅ | /kunden/doerfler-ag live, commits fa6586e → 5aaae1d |
| 3 | SSOT Update — STATUS + OPS_BOARD + Customer File | **DONE** ✅ | This update |
| 4 | Ops Dashboard Screenshot — echten (redacted) Screenshot, Mockup ersetzen | OFFEN | |
| 5 | Mobile-Fixes — Feedback aus Founder iPhone-Test einarbeiten | OFFEN | Wartet auf Founder Block C |
| 6 | Voice Smoke — Regressions-Call, PLZ-Qualität prüfen | OFFEN | |
| 7 | End-to-End Evidence — kompletter Flow dokumentiert | OFFEN | |

### Founder Blocks
| # | Task | Status | Notes |
|---|------|--------|-------|
| A | F9: Google Review Link (oder Entscheid: ohne Reviews launchen) | OFFEN | F9 ist NICHT Go-Live-kritisch — nachrüsten wenn Link da |
| B | F11: E2E Dry Run — als Kunde anrufen, Wizard, Ops-Flow | OFFEN | |
| C | Mobile QA — flowsight.ch + /doerfler-ag auf iPhone | OFFEN | |
| D | Dörfler Input — Logo, Farbe, fehlende Texte | PARTIAL | Brand Color + Google Reviews geliefert |
| E | Go/No-Go Entscheid | OFFEN | |
| F | Kommunikation an Dörfler | OFFEN | |

## Completed (this sprint)

| # | Deliverable | Owner | Closed | Evidence |
|---|-------------|-------|--------|----------|
| — | Strang E: Security/Compliance | CC | 2026-02-25 | Welle 23 (c4ba94d → cc68a62) |
| — | Strang C: WhatsApp + Morning Report | CC | 2026-02-25 | Welle 23-24 |
| — | Strang A: Entitlements | CC + Founder | 2026-02-25 | Welle 24 + migration applied |
| — | Strang B: Peoplefone Front Door | CC + Founder | 2026-02-25 | Welle 25 (case 255136a3) |
| — | DemoForm Backend | CC | 2026-02-26 | /api/demo → Resend email |
| — | Customer Website Template + Dörfler AG | CC | 2026-02-26 | /kunden/doerfler-ag (12 sections, SSG, lightbox) |
| — | Lessons Learned Doc | CC | 2026-02-26 | docs/customers/lessons-learned.md |
