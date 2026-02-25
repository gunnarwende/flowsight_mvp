# FlowSight – STATUS (Company SSOT)

**Datum:** 2026-02-25
**Owner:** Head Ops Agent
**Scope (MVP):** High-End Website + Wizard + Voice (Retell) + SSOT (Supabase) + E-Mail (Resend) + Sentry + Internal Ops Dashboard (intern)

## Fixe Entscheidungen (No Drift)
- Website + Wizard = MVP-kritisch
- Voice Agent (Intake-only, max 7 Fragen, sanitär-spezifisch, Recording OFF) = MVP-kritisch
- Output: E-Mail only (Kunden). WhatsApp: Founder-only Ops Alerts (kein Customer-facing, keine PII).
- SSOT: Supabase (tenants + cases)
- Deploy: Vercel, Root Directory = src/web
- Secrets: Vercel Env = SSOT (Runtime). Lokal nur .env.local via temp-dir pull sync. Niemals ins Repo.
- Mail Provider MVP: Resend (365 Graph nein im MVP)

## Aktueller Stand (Kurz)
- Repo Layout: src/web (Next.js App Router) vorhanden
- Sentry Configs vorhanden (sentry.*.config.ts + instrumentation*.ts)
- API: POST /api/cases live (Supabase insert + Resend email + structured JSON log + Sentry tags)
- Supabase: Projekt verbunden, Schema applied (tenants, cases, tenant_numbers + RLS). street + house_number Spalten: DONE (verified by Founder).
- Resend: API Key + MAIL_FROM/REPLY_TO/SUBJECT_PREFIX konfiguriert (.env.local + Vercel Env).
- Retell Webhook: /api/retell/webhook live (event gating call_analyzed, multi-path extraction, conditional address insert, structured logging)
- Voice: Dual-Agent Architektur (DE: agent_d7dfe4, INTL: agent_fb4b95). Language Gate (branch node), INTL Follow-Mode, PLZ digit-by-digit, explicit call termination.
- Peoplefone Brand-Nummer: +41 44 552 09 19 → Line 1 Forward → Twilio Entry +41 44 505 30 19 → SIP "flowsight-retell-ch" → Retell. LIVE ✓
- Twilio Entry: +41 44 505 30 19 ("entry-3019"), SIP Trunk → Retell. Original: +41 44 505 74 20 (legacy).
- Wizard: /wizard (standalone) + /doerfler-ag/meldung (branded funnel mit ?category= preselect)
- doerfler-ag: Landing Page live unter /doerfler-ag mit CTAs → /doerfler-ag/meldung
- FlowSight GmbH: Marketing Website live (homepage, pricing, legal)
- Voice Tooling: retell_deploy.mjs (verify/deploy), run_chain.mjs (Spur 1+2 + audio forensics)

## SSOT Dateien
- Company SSOT: docs/STATUS.md
- Customer Akten: docs/customers/<slug>/status.md
- Runbooks: docs/runbooks/
- Contracts: docs/architecture/contracts/

## Wellen (Done)
1) SSOT Backbone (Welle 1) ✓
2) Supabase Schema (Welle 2A) ✓
3) Case API + Email (Welle 2B) ✓
4) Voice E2E (Welle 2C) ✓
5) Wizard + doerfler-ag (Welle 3) ✓
6) Ops/Observability (Welle 4) ✓
7) Ops Core: Auth + Cases + Workflow (Welle 5) ✓
8) Deep Links + Notifications (Welle 5.5) ✓
9) Hardening: safeNext + dirty state UX (Welle 5.6a) ✓
10) Scheduling + ICS Invite (Welle 6) ✓ — f88ba73 + Hotfix e09423e
11) Attachments / Storage (Welle 7) ✓ — 5eeddd1
12) Monitoring/Alerting (Welle 9) ✓ — health endpoint, Sentry tags, alert runbook
13) Editable contact_email in Ops (Welle 10) ✓
14) Wizard auto-confirmation to reporter (Welle 11) ✓
15) Review Engine — manual button + review_sent_at (Welle 12) ✓
16) Mini-Dashboard — 3 tiles on /ops/cases (Welle 13) ✓
17) Onboarding Docs — full + reviews-only (Welle 14) ✓
18) Env Sync + Ops UI Quickwins (Welle 15) ✓
19) Voice Prompt v2 + Testcall-Fixes (Welle 16) ✓ — 33889cb
20) Dual-Agent Architecture + Address Fields (Welle 17) ✓ — ce68b63, 14b0014, 9157aa8
    - DE/INTL Agent Split (Susi/Juniper) mit agent-transfer routing
    - Address fields e2e (street + house_number), language triggers hardened, PLZ UX
    - W17 Migration (street + house_number Spalten): DONE — verified by Founder
21) Language Detection + Voice Debug Tooling (Welle 18) ✓ — ec0ec1d, c38b177, 2ebcdb3
    - 3-layer language detection, ASR-drift handling, privacy defaults
    - Voice Debug Chain P0 (Spur 1): call analysis reports from Retell API
22) Retell Deploy Tool + Transfer Fixes (Welle 19) ✓ — f79415d, 98ea131, 377ed22, c2e4569
    - retell_deploy.mjs: verify/deploy/probe, flow normalization, PII categories
    - Transfer agent_id fix (placeholder → real ID), FR trigger expansion
    - Language detection re-design: 50+ natural speech keywords, bilingual fallback, max 1 retry
23) Audio Forensics + Voice Hardening (Welle 20) ✓ — 640f568, 0a7d7ee
    - Spur 2: WhisperX transcription + correlation (trigger/transfer analysis)
    - Language Gate = branch node (no LLM, no end_call), flex_mode=false
    - INTL Follow-Mode (no language lock), 5 edges to Language Transfer
    - Acceptance checklist (17 points): docs/runbooks/voice_multilingual_acceptance.md
24) P0 Voice Finishing (Welle 21) ✓ — 71f8a1c, becf4a7, dee17de, 9a63112
    - Rapid-fire loop fix, reprompt patience (responsiveness 0.3→0.9), INTL→DE back-transfer
    - Webhook conditional insert fix (address columns), logDecision on success path
    - PLZ digit-by-digit confirmation, explicit call termination (no "Sind Sie noch dran?")
    - Secrets policy runbook: docs/runbooks/99-secrets-policy.md
25) FlowSight GmbH Marketing Website (Welle 22) ✓ — 32c9398
    - Homepage, Pricing, Legal pages

26) Foundations E1–E3 + Notification Router C1+C2 (Welle 23) ✓ — c4ba94d → cc68a62
    - E1: Secrets policy consolidated (Vercel SSOT, incident playbook, compliance modes)
    - E2: Device loss runbook (10-step, priority-ordered)
    - E3: Monitoring rename (monitoring_w9.md → monitoring.md), incident triage populated
    - C1: Notification Router (src/web/src/lib/notify/) — WhatsApp via Twilio REST, throttle, templates
    - C2: Wired into webhook + cases API (CASE_CREATE_FAILED, EMAIL_DISPATCH_FAILED)
    - NOTFALL_CASE alerts: DISABLED (WhatsApp = system RED only, not business events)
    - CLAUDE.md: WhatsApp scope amendment + Vercel SSOT for secrets
    - Evidence: Proof alert received (FK error → WhatsApp RED), build clean (21 routes)

27) Morning Report + Minimal Entitlements (Welle 24) ✓
    - C3: Morning Report script (scripts/_ops/morning_report.mjs) — 10 KPIs, severity ampel, --send flag
    - A1: hasModule(tenantId, module) — tenants.modules jsonb, graceful fallback (empty = allow all)
    - Enforcement: /api/retell/webhook (voice), /api/cases (website_wizard)
    - Migration SQL: docs/runbooks/entitlements_setup.md (Founder applies)
    - Entitlements migration: DONE — applied by Founder (tenants.modules jsonb + Dörfler AG all true)

28) Peoplefone Front Door (Welle 25) ✓ — Strang B Delivery — LIVE
    - Brand-Nummer: +41 44 552 09 19 (Peoplefone, active/paid)
    - Verified route: Peoplefone → Line 1 Forward → Twilio Entry +41 44 505 30 19 → SIP "flowsight-retell-ch" → Retell "entry-3019" → "Dörfler AG Intake (DE)" (voice Susi)
    - Runbook: docs/runbooks/peoplefone_front_door.md (verified live, evidence placeholders)
    - Seed script: scripts/_ops/seed_tenant_number.mjs (3 numbers → Dörfler AG)
    - tenant_numbers: +41445520919 (brand) + +41445053019 (entry) + +41445057420 (legacy)
    - WhatsApp Ops Alerts: Twilio Sandbox live, proof PASS, comms policy committed
    - Comms policy: email-only customer, WhatsApp founder-only (system RED, no PII)
    - tenant_numbers seeded: 3/3 PASS (+41445057420, +41445053019, +41445520919 → Dörfler AG)
    - Routing proof: call_9211c02b… → agent answers (connectivity PASS)
    - E2E proof: call_b2feefb1… → case 255136a3 (voice, Leck, notfall, 8942). Full pipeline PASS ✓

29) Autopilot OS Sprint (Welle 26) — in progress
    - OPS_BOARD.md: NOW/NEXT/LATER roadmap SSOT with CC vs Founder ownership
    - #1 Test data cleanup: archived status (migration + ops dashboard + morning report + archive runbook)
    - Before: morning report RED (20 backlog, 17 stuck — all test data). After: real state only.
    - Founder TODO: run migration + archive SQL (docs/runbooks/archive_test_data.md)
    - #2 Compliance Doc Pack: docs/compliance/data_processing.md (7 subprocessors, retention as-built, 5-step deletion)
    - #3 Onboarding Refresh: [F]/[CC] owner tags, modules step, deliverability gate, ~55 min timed checklist
    - #4 Voice Smoke Script: scripts/_ops/smoke_voice.mjs — 4 checks, single JSON, pass/fail, evidence {"pass":true}
    - #5 Release Checklist: docs/runbooks/release_checklist.md (gates, smoke, evidence, rollback)
    - #6: see docs/OPS_BOARD.md
    - Founder Backlog expanded: F1-F11 (security, compliance, billing, per-customer gates)

## Next
- **Autopilot OS Sprint (6 deliverables):** see docs/OPS_BOARD.md for full board
- **Founder TODO:** Run archived migration + archive test data SQL
- **Product (Strang D):** Ops Daily Driver polish, Reviews productization — after sprint
- W8 (Post-Job Voice Note): R&D/optional, parked.

## Go-Live Blockers — ALL DONE ✓
- [x] Voice Config: 2/2 testcalls verified (case f2fddfef + case 28941f2c). Mail delivered, deep link ok.
- [x] Welle 9: Monitoring/Alerting — health endpoint + Sentry tags + alert runbook.
- [x] Sentry Alerts: DONE — Case Creation Failed + Email Dispatch Failed, test notifications received.
- [x] Mobile QA: iOS + Android verified by Founder. Keine Blocker.
- [x] Review Engine: PASS — button works, mail sent, disabled after send, review_sent_at persists after reload.
- [x] Twilio E2E: PASS — real call via production number, full audio path verified.

## Recent Updates
- 2026-02-18 | Head Ops | Customer modernization pipeline SSOT added (docs/architecture/customer_modernization_pipeline.md)
- 2026-02-18 | Head Ops | doerfler-ag auto-fill completed: 6/12 fields filled from website, 3 TBD blockers remain (logo, color, reviews)
- Next: Founder resolves TBD → Web Agent starts Phase A Demo Delivery
- 2026-02-18 | Web Agent | doerfler-ag Phase A demo built at `/doerfler-ag` — all 8 sections, verified content, stock images, Classic Premium palette. Build + lint pass.
- Next: Deploy Vercel preview → founder reviews demo → confirm palette/slogan/area → Phase B
- 2026-02-19 | Head Ops | WELLE 2A: Env audit completed (3 undocumented vars found + added). Supabase schema migration created (tenants, cases, tenant_numbers + RLS). Runtime bindings documented. Twilio CH number confirmed purchased.
- Next: Copy Supabase Anon/Service keys to .env.local + Vercel → Supabase client lib → API routes (Welle 2B)
- 2026-02-19 | Head Ops | WELLE 2A FINALIZE: Schema applied (supabase db push). Supabase + Resend keys verified in .env.local + Vercel Env. Env audit updated. TBD remaining: RETELL_AGENT_ID, FALLBACK_TENANT_ID, supabase/.temp/ gitignore.
- Next: Supabase client lib + API routes (Welle 2B)
- 2026-02-19 | Head Ops | WELLE 2B: Supabase client lib (server + anon), POST /api/cases route, Resend email notification (fire-and-forget), Sentry tags on all error paths. Seed script for default tenant created. Build + lint pass.
- Next: Founder seeds tenant + sets FALLBACK_TENANT_ID → smoke test → Wizard frontend (Welle 3)
- 2026-02-19 | Head Ops | W2B PATCH: /api/cases now accepts shorthand aliases (phone→contact_phone, email→contact_email, message→description). Contract canonical fields unchanged. Regression test (6 checks) pass. ESLint config: scripts/ excluded.
- Next: Founder smoke test with curl → Wizard frontend (Welle 3)
- 2026-02-19 | Head Ops | W2B DX CLOSEOUT: /api/cases 400 response now returns structured { error, missing_fields, allowed_values }. Min payload runbook added. Build + lint pass.
- Next: Founder seeds tenant + smoke test → Wizard frontend (Welle 3)
- 2026-02-19 | Head Ops | FALLBACK_TENANT_ID verified (Vercel + .env.local, proven by /api/cases 201). Only TBD remaining: RETELL_AGENT_ID.
- Next: Wizard frontend (Welle 3)
- 2026-02-19 | Voice+Head Ops | WELLE 2C: Retell webhook strict mapping (event gating, field extraction from custom_analysis_data, no silent defaults, missing_fields Sentry capture). Tenant resolver (called_number→tenant_numbers→fallback). Direct DB case insert with source="voice" + fire-and-forget Resend. Evidence scripts: twilio_debug_evidence.mjs + sentry_probe.mjs. Runbooks: voice_debug.md (decision tree), voice_e2e.md. Analytics event names defined. Build + lint pass.
- TBD: Twilio→Retell SIP routing (inbound calls fail at duration 0). Run evidence scripts. Retell agent custom_analysis_data schema not yet configured. RETELL_AGENT_ID still TBD. Sentry API 403 needs scope fix.
- Next: Run evidence scripts → fix Twilio routing → configure Retell agent → smoke test E2E → Wizard frontend (Welle 3)
- 2026-02-19 | Head Ops | W2C FIX: Production 404 root cause = CLI deploy from repo root overwrote Git deploy. Fix: removed root .vercel/, added GET health-check to webhook, push triggers correct Git-connected deploy (Root Dir = src/web). Probe script added. Twilio→Retell routing now verified (completed calls, duration >0).
- 2026-02-19 | Head Ops | W2C FIX (final): Production still 404 after deploy fix. Second root cause: Vercel project Framework Preset = "Other" (auto-detected from repo root at project creation, never corrected). Fix: added src/web/vercel.json with {"framework":"nextjs"}. All 5 production routes now verified: / (200), /doerfler-ag (200), /api/retell/webhook GET (200), POST (401), /api/cases POST (400). Probe script passes.
- TBD: Retell agent custom_analysis_data schema not yet configured. RETELL_AGENT_ID still TBD. Sentry API 403 needs scope fix.
- 2026-02-19 | Head Ops | W2C OBSERVABILITY: Root cause confirmed — calls hit POST 204 but no case created because custom_analysis_data not configured → all structured fields missing → decision=missing_fields skip. Fix: structured JSON logging at every 204 path (_tag=retell_webhook, decision field). Visible in Vercel Function Logs without Sentry. tenant_numbers seeded (+41445057420→default tenant). verify_voice_pipeline.mjs script. Retell agent config runbook with exact prompt + schema for Founder.
- BLOCKER: Founder must configure Retell agent custom_analysis_data schema (see docs/runbooks/retell_agent_config.md) then make 1 test call.
- Next: Founder configures Retell → test call → verify case created → Welle 3 (Wizard)
- 2026-02-19 | Head Ops | W2C VOICE E2E COMPLETE: Event gating fixed (only call_analyzed, not call_ended). Multi-path extraction probe. Founder configured Retell agent. Test call → case f2fddfef created (source=voice, Rohrbruch, notfall, 8942 Oberrieden). Voice pipeline proven end-to-end.
- 2026-02-19 | Head Ops | WELLE 3: Wizard frontend (3-step premium flow: Problem→Ort→Kontakt). Category cards + urgency cards + dark gradient surface + review summary + success screen. Zero new deps. POST /api/cases source=wizard. Structured JSON log + Sentry tags on success path.
- 2026-02-19 | Head Ops | WELLE 3 INTEGRATION: Wizard extracted to shared WizardForm component. /doerfler-ag/meldung renders wizard with ?category= preselect (allowlist: 6 values). Landing page CTAs → "Online melden", service cards deep-link with category mapping. Placeholder "wird später implementiert" removed.
- 2026-02-19 | Head Ops | WELLE 3 EVIDENCE-COMPLETE:
  - A) Supabase: 2 wizard cases (df85ee52 dringend, 812ee2ed normal), both source=wizard category=Heizung
  - B) Vercel Logs: console.log _tag=cases_api decision=created (route.ts:200-206) — verify in Dashboard → Logs → Function api/cases
  - C) Sentry Tags: Sentry.setTag source/tenant_id/case_id (route.ts:197-199) — verify in Dashboard → Performance → /api/cases transactions
  - D) Voice regression: green (tenant_numbers=1, webhook=live, cases found)
- 2026-02-19 | Head Ops | WELLE 4 (Ops/Observability):
  - Email structured logging in resend.ts (5 exit paths: skipped/sent/failed + source tag in all Sentry captures). Early return on missing RESEND_API_KEY.
  - Root cause: Vercel Hobby plan captures only ONE console.log per serverless invocation → separate _tag:"email" log was silently dropped.
  - Fix: merged email_attempted:true into existing cases_api/retell_webhook decision log (single log line).
  - Sentry Token: PREP done — verify_sentry_token.mjs + runbook (docs/runbooks/sentry_token_setup.md). Token creation deferred (Founder action, no active use case yet).
- 2026-02-19 | Head Ops | WELLE 4 EVIDENCE-COMPLETE:
  - A) Supabase: case 080727c5 (wizard, Rohrbruch, notfall, 8942 Oberrieden)
  - B) Vercel Log (programmatisch via vercel logs --project flowsight-mvp --json aus temp dir):
    {"_tag":"cases_api","decision":"created","source":"wizard","case_id":"080727c5-...","email_attempted":true}
  - C) Sentry: resend.ts has captureException + tags (area/provider/source/tenant_id/case_id) on all error paths. Success tags via route.ts Sentry.setTag. Token for API verification deferred (see runbook).
  - D) Voice regression: green (webhook live, tenant_numbers active)
  - E) Vercel CLI method: npx vercel logs --project <name> --json from temp dir (C:\tmp\vercel_logs), no .vercel/ in repo.
- TBD remaining: Sentry API token (ready to execute, see runbook). doerfler-ag Phase B (logo, color, reviews). Voice Config 2nd testcall.
- 2026-02-20 | Head Ops | WELLE 5 (Ops Core / Ticketing Light):
  - Auth: Supabase Magic Link via @supabase/ssr, proxy.ts gating /ops/*, /auth/confirm callback, /ops/login page
  - DB: Migration 20260220 — cases table + status (CHECK: new/contacted/scheduled/done), assignee_text, scheduled_at, internal_notes, updated_at (trigger)
  - API: GET/PATCH /api/ops/cases/[id] with auth check + allowlist update + structured log (_tag:ops_cases_api, no PII)
  - UI: /ops/cases (list, default=open, filter chips: status/urgency), /ops/cases/[id] (detail + edit form: status/assignee/scheduled/notes)
  - Logout: POST /api/ops/logout
  - Case contract updated: Ops-managed fields section (producers never write these)
  - Founder handoff: docs/runbooks/ops_setup.md (Supabase Auth config, redirect URLs, NEXT_PUBLIC env vars, migration)
  - Gates: ESLint clean, build passes (14 routes, 0 warnings), voice regression green
- TBD: Founder must execute ops_setup.md (auth config + migration + env vars). Sentry API token.
- Next: Founder executes ops_setup → smoke test /ops → doerfler-ag Phase B → Hardening
- 2026-02-20 | Head Ops | WELLE 6 (Scheduling + ICS Invite):
  - Quick Actions (Heute/Morgen) + datetime-local input in Ops Case Detail
  - "Termin senden" disabled wenn dirty (Save-Guard UX)
  - ICS Invite Route: /api/ops/cases/[id]/send-invite (Resend inline, METHOD:REQUEST, ORGANIZER/ATTENDEE, UTC Z)
  - Hotfix: datetime-local zeigte UTC (slice(0,16)); Fix: toDatetimeLocal() → browser-lokal
  - Evidence: Outlook Invite Accept/Decline funktioniert
  - Commits: f88ba73 + e09423e
- 2026-02-20 | Head Ops | WELLE 7 (Attachments / Storage):
  - case_attachments table + RLS (Supabase migration executed by Founder)
  - API: /api/ops/cases/[id]/attachments (GET list + signed download, POST request-upload + confirm)
  - UI: AttachmentsSection in Ops Case Detail (upload, list, download)
  - Supabase Storage Bucket "case-attachments" (private) erstellt by Founder
  - Evidence: Upload, Liste, Download im Ops Case Detail funktioniert
  - Commit: 5eeddd1
- 2026-02-20 | Head Ops | Voice Config Status:
  - RETELL_AGENT_ID + RETELL_API_KEY + RETELL_WEBHOOK_SECRET gesetzt (Vercel Env)
  - Retell Webhooks konfiguriert (global + agent-level, events: call_started/ended/analyzed)
  - Real test call #1: Case erstellt, source=voice, Felder plausibel
  - OFFEN: 2nd testcall mit Feld-Verifikation (plz/city/category/urgency/description)
- 2026-02-20 | Head Ops | SSOT Sync: STATUS.md + NORTH_STAR.md + mobile_qa.md runbook
- 2026-02-20 | Head Ops | Timezone Fix: timeZone:"Europe/Zurich" in alle 4 formatDate Stellen (list/detail/attachments/invite email). Commit: 39c2784
- 2026-02-20 | Head Ops | WELLE 9 (Monitoring/Alerting):
  - Health endpoint: GET /api/health (200 JSON, no DB, no secrets, commit SHA + env)
  - Sentry high-signal tagging: _tag + stage + decision + error_code on all P0 failure paths
  - Routes: retell/webhook (9 paths), resend.ts (4 paths), cases/route.ts (2 paths), send-invite (2 paths)
  - Monitoring runbook: docs/runbooks/monitoring.md (2 Sentry alerts, click-by-click)
  - Logging discipline: no new console.logs, existing 1-log-per-invocation preserved
  - Gates: build clean (17 routes), voice regression green (webhook path unchanged)
- 2026-02-20 | Head Ops | GO-LIVE GATES ALL PASSED:
  - Voice Config: 2/2 testcalls (f2fddfef + 28941f2c), mail delivered, deep link ok
  - Mobile QA: Founder verified, keine Blocker
  - All 6 Go-Live gates ✓. Next: Founder Go-Live decision.
- 2026-02-21 | Head Ops | WELLEN 10–14 (Closed Loop + Outtake):
  - W10: contact_email editable in Ops (PATCH allowlist + CaseDetailForm input)
  - W11: Wizard auto-confirmation email to reporter (sendReporterConfirmation, no extra log, merged into existing JSON)
  - W12: Review Engine (manual button, POST /api/ops/cases/[id]/request-review, review_sent_at migration, GOOGLE_REVIEW_URL env)
  - W13: Mini-Dashboard (3 tiles: open/today/done-7d on /ops/cases, parallel stats query)
  - W14: Onboarding Docs (onboarding_customer_full.md + onboarding_reviews_only.md, skip-section hints)
  - Gates: build clean (18 routes), voice webhook path unchanged, 1-log-per-invocation preserved
  - Founder TODO: run migration review_sent_at, set GOOGLE_REVIEW_URL env, configure Sentry alerts
- 2026-02-21 | Head Ops | Founder TODOs: migration review_sent_at DONE, GOOGLE_REVIEW_URL DONE. Sentry alerts: bewusst später.
- 2026-02-21 | Head Ops | WELLE 15 (Env Sync + Ops UI Quickwins):
  - Env sync: scripts/env_sync.ps1 (Vercel pull via temp dir, backup, key verification)
  - Review engine: deployed (45372fb), verified on prod (/api/health commit match, request-review route 401)
  - Ops list: uppercase table headers, better spacing, group hover, source+assignee filter chips
  - Ops detail: Schnellwahl day tabs (Heute/Morgen toggle) + 4 time chips, action grouping (Save primary, Termin+Review secondary)
  - Gates: build clean (18 routes), ESLint clean
- 2026-02-22 | Head Ops | WELLE 16 (Voice Prompt v2 + Testcall-Fixes):
  - Voice prompt v2 (9affef7): natural tone, full EN/FR switch, anti-robot, "Postleitzahl" enforced
  - Testcall-fixes (33889cb): no duplicate questions (KEIN-DOPPELT-FRAGEN-REGEL), sticky language mode, turn-taking (interruption_sensitivity 1.0), single confirmation step, PLZ digit-by-digit confirmation, separate PLZ/Ort questions
  - Closing/OOS/End nodes: static_text → prompt (language-aware closing for EN/FR calls)
  - Agent-as-file: retell/exports/doerfler_agent.json reimported in Retell
  - Voice bakeoff winner: minimax-Max
  - Sentry Alerts: DONE (Case Creation Failed + Email Dispatch Failed)
  - Review Engine: PASS (button, mail, disabled state, review_sent_at persist)
  - Twilio E2E: PASS (real call via production number +41 44 505 74 20)
- 2026-02-22→25 | Head Ops | WELLEN 17–22 (Voice Architecture + Hardening + Marketing):
  - W17: Dual-Agent split DE/INTL, address fields e2e, language triggers. Migration street+house_number DONE (verified by Founder).
  - W18: 3-layer language detection, ASR-drift handling, privacy defaults, voice debug chain P0.
  - W19: retell_deploy.mjs (verify/deploy/probe), transfer agent_id fix, language re-design (50+ keywords, bilingual fallback).
  - W20: Audio Forensics Spur 2 (WhisperX), Language Gate branch node, INTL Follow-Mode, acceptance checklist.
  - W21: Rapid-fire loop fix, webhook conditional insert, PLZ digit-by-digit, explicit call termination, secrets policy.
  - W22: FlowSight GmbH marketing website (homepage, pricing, legal).
  - Gates: build clean, voice regression green, P0 call→case→email pipeline proven.
  - Next: Foundations (Security + Monitoring + WhatsApp Alerts) → Control Plane → Delivery.
- 2026-02-25 | Head Ops | WELLE 23 (Foundations E+C):
  - E1-E3: Secrets policy (Vercel SSOT, incident playbook), device loss runbook, monitoring rename, incident triage.
  - C1-C2: Notification Router + WhatsApp channel (Twilio REST, zero deps). Wired into webhook + cases API.
  - WhatsApp scope: system RED only (CASE_CREATE_FAILED, EMAIL_DISPATCH_FAILED). NOTFALL_CASE disabled.
  - CLAUDE.md amended: WhatsApp Founder-only Ops Alerts + Vercel SSOT.
  - Evidence: Proof alert delivered (FK error trigger), Twilio message SID confirmed, build clean (21 routes).
  - Commits: c4ba94d, 7b9154c, d163054, e783bf3.
  - Next: C3 Morning Report → Control Plane (A) → Delivery (B).
