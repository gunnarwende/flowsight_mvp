# FlowSight – STATUS (Company SSOT)

**Datum:** 2026-02-18
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
- API: POST /api/cases live (Supabase insert + Resend email notification)
- Supabase: Projekt verbunden (oyouhwcwkdcblioecduo), Schema applied (tenants, cases, tenant_numbers + RLS). Keys in .env.local + Vercel Env.
- Resend: API Key + MAIL_FROM/REPLY_TO/SUBJECT_PREFIX konfiguriert (.env.local + Vercel Env).
- Retell Webhook URL gesetzt auf https://flowsight-mvp.vercel.app/api/retell/webhook (Endpoint wird später implementiert)
- Twilio CH Nummer: gekauft und konfiguriert (Verified: .env.local). SIP Trunk konfiguriert.
- doerfler-ag Phase A Demo live unter /doerfler-ag

## SSOT Dateien
- Company SSOT: docs/STATUS.md
- Customer Akten: docs/customers/<slug>/status.md
- Runbooks: docs/runbooks/
- Contracts: docs/architecture/contracts/

## Next 5 Steps
1) SSOT Backbone: STATUS + Contracts + Env Vars + Agent Briefs (Welle 1) ✓
2) doerfler-ag: Founder confirms TBD items → Web Agent Demo Delivery (Phase A)
3) Supabase SSOT Schema: tenants/cases + constraints (Welle 2A) ✓
4) Plumbing: Case API + Email done (Welle 2B) ✓ — Wizard frontend + Retell webhook next
5) Voice E2E: Webhook strict mapping + tenant resolve + case creation done (Welle 2C) ✓ — Twilio→Retell routing TBD (debugger evidence needed)

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
