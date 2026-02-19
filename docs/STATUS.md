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
- Keine API routes (route.ts) bisher vorhanden
- Supabase: Projekt verbunden (oyouhwcwkdcblioecduo), Schema applied (tenants, cases, tenant_numbers + RLS). Anon/Service-Keys konfiguriert.
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
4) Plumbing: Wizard Submit -> Case -> Email + Retell Webhook -> Case -> Email (Welle 2, später)
5) Voice Routing aktivieren sobald CH Nummer vorhanden (Voice Agent, später)

## Recent Updates
- 2026-02-18 | Head Ops | Customer modernization pipeline SSOT added (docs/architecture/customer_modernization_pipeline.md)
- 2026-02-18 | Head Ops | doerfler-ag auto-fill completed: 6/12 fields filled from website, 3 TBD blockers remain (logo, color, reviews)
- Next: Founder resolves TBD → Web Agent starts Phase A Demo Delivery
- 2026-02-18 | Web Agent | doerfler-ag Phase A demo built at `/doerfler-ag` — all 8 sections, verified content, stock images, Classic Premium palette. Build + lint pass.
- Next: Deploy Vercel preview → founder reviews demo → confirm palette/slogan/area → Phase B
- 2026-02-19 | Head Ops | WELLE 2A: Env audit completed (3 undocumented vars found + added). Supabase schema migration created (tenants, cases, tenant_numbers + RLS). Runtime bindings documented. Twilio CH number confirmed purchased.
- Next: Copy Supabase Anon/Service keys to .env.local + Vercel → Supabase client lib → API routes (Welle 2B)
- 2026-02-19 | Head Ops | WELLE 2A FINALIZE: Schema migration applied to Supabase (supabase db push). Tables tenants, cases, tenant_numbers live. Supabase keys now configured in .env.local. Env audit updated.
- Next: Supabase client lib + API routes (Welle 2B)
