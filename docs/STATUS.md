# FlowSight – STATUS (Company SSOT)

**Datum:** 2026-02-20
**Owner:** Head Ops Agent
**Scope (MVP):** High-End Website + Wizard + Voice (Retell) + SSOT (Supabase) + E-Mail (Resend) + Sentry + Internal Ops Dashboard (intern)

## Fixe Entscheidungen (No Drift)
- Website + Wizard = MVP-kritisch
- Voice Agent (Intake-only, max 7 Fragen, sanitär-spezifisch, Recording OFF) = MVP-kritisch
- Output: E-Mail only (keine SMS/WhatsApp im MVP)
- SSOT: Supabase (tenants + cases)
- Deploy: Vercel, Root Directory = src/web
- Secrets: nur Vercel Env + Bitwarden (niemals ins Repo)
- Mail Provider MVP: Resend (365 Graph nein im MVP)

## Aktueller Stand (Kurz)
- Repo Layout: src/web (Next.js App Router) vorhanden
- Sentry Configs vorhanden (sentry.*.config.ts + instrumentation*.ts)
- API: POST /api/cases live (Supabase insert + Resend email + structured JSON log + Sentry tags)
- Supabase: Projekt verbunden (oyouhwcwkdcblioecduo), Schema applied (tenants, cases, tenant_numbers + RLS). Keys in .env.local + Vercel Env.
- Resend: API Key + MAIL_FROM/REPLY_TO/SUBJECT_PREFIX konfiguriert (.env.local + Vercel Env).
- Retell Webhook: /api/retell/webhook live (event gating call_analyzed, multi-path extraction, structured logging)
- Twilio CH Nummer: gekauft und konfiguriert (Verified: .env.local). SIP Trunk konfiguriert.
- Voice E2E: Twilio→Retell→Webhook→Supabase→Resend — proven (case f2fddfef)
- Wizard: /wizard (standalone) + /doerfler-ag/meldung (branded funnel mit ?category= preselect) — proven (cases 812ee2ed, df85ee52)
- doerfler-ag: Landing Page live unter /doerfler-ag mit CTAs → /doerfler-ag/meldung, Service deep-links

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

## Next (Countdown to Go-Live)
See docs/NORTH_STAR.md for full Launch Plan.
- Next: Mobile QA (30min, blocker) → Voice Config 2nd testcall → Go-Live
- Voice Config: RETELL_AGENT_ID gesetzt, 1 real call verified (case f2fddfef). Needs 2nd testcall evidence.
- W8 (Post-Job Voice Note): R&D/optional, nicht Go-Live-blocking.

## Go-Live Blockers (offen)
- [ ] Voice Config: 2nd testcall mit korrekten Feldern (plz/city/category/urgency/description)
- [x] Welle 9: Monitoring/Alerting — health endpoint + Sentry tags + alert runbook. Founder: create 2 Sentry alerts (docs/runbooks/monitoring_w9.md)
- [ ] Mobile QA: iOS + Android manuell (/ops/cases flow, attachments, ICS)

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
  - Monitoring runbook: docs/runbooks/monitoring_w9.md (2 Sentry alerts, click-by-click)
  - Logging discipline: no new console.logs, existing 1-log-per-invocation preserved
  - Gates: build clean (17 routes), voice regression green (webhook path unchanged)
