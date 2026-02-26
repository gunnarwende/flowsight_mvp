# Wave Log — FlowSight MVP (Audit Trail)

**Scope:** Chronologische History aller Wellen (W1-W26). Archiviert aus STATUS.md am 2026-02-25.
**Nicht editieren** — nur append bei neuen Wellen.

## Wellen (W1-W26)

1) SSOT Backbone (Welle 1) — 2026-02-18
2) Supabase Schema (Welle 2A) — 2026-02-19
3) Case API + Email (Welle 2B) — 2026-02-19
4) Voice E2E (Welle 2C) — 2026-02-19
5) Wizard + doerfler-ag (Welle 3) — 2026-02-19
6) Ops/Observability (Welle 4) — 2026-02-19
7) Ops Core: Auth + Cases + Workflow (Welle 5) — 2026-02-20
8) Deep Links + Notifications (Welle 5.5) — 2026-02-20
9) Hardening: safeNext + dirty state UX (Welle 5.6a) — 2026-02-20
10) Scheduling + ICS Invite (Welle 6) — 2026-02-20 (f88ba73)
11) Attachments / Storage (Welle 7) — 2026-02-20 (5eeddd1)
12) Monitoring/Alerting (Welle 9) — 2026-02-20
13) Editable contact_email in Ops (Welle 10) — 2026-02-21
14) Wizard auto-confirmation to reporter (Welle 11) — 2026-02-21
15) Review Engine — manual button + review_sent_at (Welle 12) — 2026-02-21
16) Mini-Dashboard — 3 tiles (Welle 13) — 2026-02-21
17) Onboarding Docs (Welle 14) — 2026-02-21
18) Env Sync + Ops UI Quickwins (Welle 15) — 2026-02-21
19) Voice Prompt v2 + Testcall-Fixes (Welle 16) — 2026-02-22 (33889cb)
20) Dual-Agent Architecture + Address Fields (Welle 17) — 2026-02-22 (14b0014, 9157aa8)
21) Language Detection + Voice Debug Tooling (Welle 18) — 2026-02-23 (c38b177, 2ebcdb3)
22) Retell Deploy Tool + Transfer Fixes (Welle 19) — 2026-02-23 (98ea131, 377ed22, c2e4569)
23) Audio Forensics + Voice Hardening (Welle 20) — 2026-02-24 (640f568, 0a7d7ee)
24) P0 Voice Finishing (Welle 21) — 2026-02-25 (dee17de, 9a63112)
25) FlowSight GmbH Marketing Website (Welle 22) — 2026-02-25 (32c9398)
26) Foundations E+C + Notification Router (Welle 23) — 2026-02-25 (c4ba94d → cc68a62)
27) Morning Report + Entitlements (Welle 24) — 2026-02-25 (0b288c4)
28) Peoplefone Front Door (Welle 25) — 2026-02-25 (LIVE)
29) Autopilot OS Sprint (Welle 26) — 2026-02-25 (5/6 shipped, 1 deferred)

## Detailed Log (chronological)

### 2026-02-18

- Head Ops: Customer modernization pipeline SSOT added (docs/architecture/customer_modernization_pipeline.md)
- Head Ops: doerfler-ag auto-fill completed: 6/12 fields filled from website, 3 TBD blockers remain (logo, color, reviews)
- Web Agent: doerfler-ag Phase A demo built at `/doerfler-ag` — all 8 sections, verified content, stock images, Classic Premium palette

### 2026-02-19

- W2A: Env audit, Supabase schema migration (tenants, cases, tenant_numbers + RLS)
- W2B: Case API + Email (POST /api/cases, Resend, aliases, structured validation)
- W2C: Retell webhook, tenant resolver, voice E2E pipeline
- W2C FIX: Production 404 — CLI deploy from repo root overwrote Git deploy, Framework Preset fix
- W2C OBSERVABILITY: Structured JSON logging at every webhook path
- W2C VOICE E2E COMPLETE: Test call → case f2fddfef (voice, Rohrbruch, notfall, 8942)
- W3: Wizard frontend (3-step premium flow) + doerfler-ag integration
- W4: Email structured logging, 1-log-per-invocation pattern established
- Root cause: Vercel Hobby captures only ONE console.log per invocation

### 2026-02-20

- W5: Ops Core (Auth Magic Link, cases list/detail, workflow fields, 14 routes)
- W6: Scheduling + ICS Invite (Quick Actions, Outlook-compatible). Hotfix: UTC→local
- W7: Attachments / Storage (Supabase Storage, signed URLs, Upload UI)
- Voice Config: RETELL_AGENT_ID set, 2/2 testcalls verified
- W9: Monitoring/Alerting (health endpoint, Sentry high-signal tagging, monitoring runbook)
- GO-LIVE GATES ALL PASSED: Voice + Mobile QA + Monitoring + Email
- Timezone Fix: timeZone:"Europe/Zurich" in all formatDate calls

### 2026-02-21

- W10-W14: contact_email edit, wizard confirmation, review engine, mini-dashboard, onboarding docs
- W15: Env sync script, review engine deployed, Ops UI quickwins

### 2026-02-22

- W16: Voice Prompt v2, testcall fixes, agent-as-file, voice bakeoff (minimax-Max)
- Sentry Alerts DONE, Review Engine PASS, Twilio E2E PASS

### 2026-02-22 → 2026-02-25

- W17: Dual-Agent split DE/INTL, address fields e2e, language triggers
- W18: 3-layer language detection, ASR-drift handling, voice debug chain P0
- W19: retell_deploy.mjs, transfer agent_id fix, language re-design (50+ keywords)
- W20: Audio Forensics Spur 2 (WhisperX), Language Gate, INTL Follow-Mode
- W21: Rapid-fire loop fix, webhook conditional insert, PLZ digit-by-digit, secrets policy
- W22: FlowSight GmbH marketing website (homepage, pricing, legal)

### 2026-02-25

- W23: Foundations E1-E3 + Notification Router C1+C2 (WhatsApp system RED only)
- W24: Morning Report (10 KPIs) + Entitlements (hasModule)
- W25: Peoplefone Front Door LIVE (brand → Twilio → SIP → Retell, E2E proof PASS)
- W26: Autopilot OS Sprint (archived status, compliance, onboarding, smoke, release checklist)
- Founder P0: F10 billing guards DONE, F5 voice regression PASS, F2 email deliverability PASS
- Founder P1: F6 security/2FA DONE, F1 cost triggers DONE, F3 backup awareness DOCUMENTED
- F11 Go-Live Sign-off: PARTIAL (Voice+Wizard+Ops PASS, Reviews blocked by F9)
