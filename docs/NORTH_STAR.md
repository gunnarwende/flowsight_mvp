# FlowSight — North Star + Launch Plan

**Datum:** 2026-02-20
**Owner:** Founder
**Status:** Active — Countdown to Dörfler AG Go-Live

## Vision

FlowSight ist ein High-End Intake→Ticket→Dispatch System für Sanitärbetriebe (CH).
Kernnutzen: Geschwindigkeit + Klarheit.

- Notfälle werden sofort als Ticket erfasst (Voice) und sauber priorisiert.
- Geplante Fälle kommen via Wizard rein (Website Funnel).
- Der Betrieb arbeitet in /ops als Arbeitsliste (nicht in Supabase).
- Email ist der Trigger/Channel, Deep Links öffnen direkt den richtigen Case.
- Outcome: weniger Rückfragen, weniger Fehlfahrten, schneller "first response".

## Done (verified, deployed)

| Welle | Scope | Status |
|-------|-------|--------|
| 1 | SSOT Backbone (STATUS, Contracts, Env Vars, Agent Briefs) | Done |
| 2A | Supabase Schema (tenants, cases, tenant_numbers + RLS) | Done |
| 2B | Case API + Email (POST /api/cases, Resend, aliases) | Done |
| 2C | Voice E2E (Twilio→Retell→Webhook→Supabase→Resend) | Done |
| 3 | Wizard + doerfler-ag Integration (/wizard, /doerfler-ag/meldung) | Done |
| 4 | Ops/Observability (email logging, Sentry token prep) | Done |
| 5 | Ops Core (Auth Magic Link, cases list/detail, workflow fields) | Done |
| 5.5 | Deep Links + Notifications (email deep link, auth return-to) | Done |
| 5.6a | Hardening Minimal (safeNext, dirty state UX) | Done |
| 6 | Scheduling + ICS Invite (Quick Actions, Outlook-compatible) | Done — f88ba73 + e09423e |
| 7 | Attachments / Storage (Supabase Storage, signed URLs, Upload UI) | Done — 5eeddd1 |
| 9 | Monitoring/Alerting (health endpoint, Sentry tags, alert runbook) | Done |
| 10 | Editable contact_email in Ops | Done |
| 11 | Wizard auto-confirmation to reporter | Done |
| 12 | Review Engine (manual button, review_sent_at, GOOGLE_REVIEW_URL) | Done |
| 13 | Mini-Dashboard (3 tiles: open, today, done 7d) | Done |
| 14 | Onboarding Docs (full + reviews-only runbooks) | Done |

**Full closed loop:** Wizard/Voice → Case → Confirmation Email → Ops Notification → Deep Link → /ops → Case Detail → Schedule → ICS Invite → Attachments → Done → Review Request.

## Roadmap (Countdown to Go-Live)

### ~~Mini-Welle "Voice Config"~~ Done
- ~~RETELL_AGENT_ID fix (Vercel env)~~ Done
- Agent Prompt/Flow: max 7 Fragen, Recording OFF, sanitär-spezifisch — configured
- Extraction contract-treu (plz, city, category, urgency, description) — configured
- Evidence: 2/2 Testcalls verified (case f2fddfef + case 28941f2c). Mail delivered, deep link ok.

### ~~Welle 9 — Monitoring/Alerting~~ Done
- ~~Health probes + Alerts~~ GET /api/health + 2 Sentry alerts (see docs/runbooks/monitoring_w9.md)
- Sentry tags: _tag/stage/decision/error_code on all P0 paths
- Founder action: create 2 Sentry alerts per runbook

### ~~Mobile QA~~ Done
- ~~30min manueller Test auf Phone (iOS + Android)~~ Founder verified, keine Blocker.

### Welle 8 — Post-Job Voice Note (R&D / optional)
- Voice note upload → Transcription → Extraction → Suggested Updates → Apply
- **Markiert als R&D:** Nicht Go-Live-Blocking
- Wird später gesplittet (Transcribe, Extract, Review UI) wenn Bedarf im Betrieb
- Eigener Stack, eigene Evaluierung

## Go-Live Trigger (Dörfler AG)

**Go-Live = ALL of:**
1. Welle 6 (Scheduling) — ✅ Done (f88ba73 + e09423e)
2. Welle 7 (Attachments) — ✅ Done (5eeddd1)
3. Mini-Welle "Voice Config" — ✅ Done (2/2 testcalls: f2fddfef + 28941f2c)
4. Mobile QA — ✅ Done (Founder verified, keine Blocker)
5. Welle 9 (Monitoring) — ✅ Done (health endpoint + Sentry tags + runbook)
6. Email deliverability stable (Resend Dashboard: sent > 0, no bounces) — ✅ verified

**Bewusste Entscheidung:** Kein "half-live". Erst alle Gates, dann echter Betrieb.

## Non-negotiables

- CLAUDE.md wins.
- Keine Secrets ins Repo. Vercel Env = SSOT.
- App Router, API nur unter src/web/app/api/**/route.ts
- /api/retell/webhook Pfad bleibt unverändert.
- Kein Vercel CLI im Repo. Nur Temp-Dirs.
- Evidence-first: Jede Welle endet mit messbarer Evidence.

## Hobby Gap + Upgrade Trigger

**Aktuell:** Vercel Hobby + Supabase Free.
- 1 console.log pro Invocation (Hobby Limit)
- Kein Sentry Pro (limited retention)
- Kein RLS enforcement (server-side auth checks stattdessen)
- Kein custom domain (flowsight-mvp.vercel.app)

**Das ist korrekt für MVP/Pilot.** Kein falsches Enterprise-Versprechen.

**Upgrade Trigger:**
- Vercel Pro: wenn Log-Limit oder Build-Limit den Betrieb einschränkt
- Supabase Pro: wenn Storage-Limit (Welle 7) oder RLS-Policies nötig
- Custom Domain: wenn Dörfler AG es für Kunden-facing braucht

## Produkt-Qualität ("High-End Sanitär")

- Operator speed: wenige Klicks bis "Termin steht" und "Techniker informiert"
- Priorisierung: urgency/status sichtbar; offene Fälle verschwinden nie aus Default view
- Zero drift: Env/Deploy/Runbooks sauber, reproduzierbar
- Privacy: PII nur in UI/Email, nie in Logs

## Execution Model

- Challenge jeden Prompt: Scope, Risiken, Simplifications
- Implementiere minimal, keine neuen Env Vars unless zwingend
- Evidence in Commit summary: Logs, Supabase Query, Email Receipt
- Ziel ist Shipping, nicht Refactoring
