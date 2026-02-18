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
- Sentry Configs vorhanden (src/web/sentry.*.config.ts + instrumentation*.ts)
- Keine API routes (route.ts) bisher vorhanden
- Supabase Ordner/Migrations noch nicht vorhanden
- Retell Webhook URL ist gesetzt auf https://flowsight-mvp.vercel.app/api/retell/webhook (Endpoint wird später implementiert)
- Twilio CH Regulatory Bundle: pending approval → Ziel: CH Nummer kaufen → Voice Routing

## SSOT Dateien
- Company SSOT: docs/STATUS.md
- Customer Akten: docs/customers/<slug>/status.md
- Runbooks: docs/runbooks/
- Contracts: docs/architecture/contracts/

## Next 5 Steps
1) SSOT Backbone: STATUS + Contracts + Env Vars + Agent Briefs (Welle 1)
2) Supabase SSOT Schema: tenants/cases + constraints (Welle 2, später)
3) Plumbing: Wizard Submit -> Case -> Email + Retell Webhook -> Case -> Email (Welle 2, später)
4) Website/Wizard UX polish (Web Agent, später)
5) Voice Routing aktivieren sobald CH Nummer vorhanden (Voice Agent, später)
