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

**Closed loop live:** Wizard/Voice → Case → Email → Deep Link → /ops login → Case Detail → PATCH persists.

## Roadmap (Countdown to Go-Live)

### Welle 6 — Scheduling C-light
- scheduled_at Quick Actions + robust input in Ops
- "Termin senden" als ICS per Email an Dispatcher (MAIL_REPLY_TO)
- Kein zweites Recipient-Feld, kein OAuth
- ICS muss in Outlook/Apple/Google annehmbar sein

### Welle 7 — Attachments (Fotos/Beweise)
- Supabase Storage + RLS + signed URLs
- Upload UI in Ops Case Detail
- Ziel: weniger Rückfragen, bessere Diagnose, Nachweisführung

### Mini-Welle "Voice Config" (Go-Live Blocker)
- RETELL_AGENT_ID fix (Vercel env)
- Agent Prompt/Flow: max 7 Fragen, Recording OFF, sanitär-spezifisch
- Extraction contract-treu (plz, city, category, urgency, description)
- Evidence: 2 Testcalls → call_analyzed → Cases korrekt
- Scope: Founder-Console heavy, kleiner Code-Anteil

### Welle 9 — Monitoring/Alerting
- Health probes + Alerts
- Sentry API token scopes fix (nur wenn Use Case aktiv)

### Mobile QA (Go-Live Blocker)
- 30min manueller Test auf Phone (iOS + Android)
- Scope: /ops/cases list + detail + save + ICS flow
- Fixes nur wenn wirklich Blocker

### Welle 8 — Post-Job Voice Note (R&D / optional)
- Voice note upload → Transcription → Extraction → Suggested Updates → Apply
- **Markiert als R&D:** Nicht Go-Live-Blocking
- Wird später gesplittet (Transcribe, Extract, Review UI) wenn Bedarf im Betrieb
- Eigener Stack, eigene Evaluierung

## Go-Live Trigger (Dörfler AG)

**Go-Live = ALL of:**
1. Welle 6 (Scheduling) — Done
2. Welle 7 (Attachments) — Done
3. Welle 9 (Monitoring) — Done
4. Mini-Welle "Voice Config" — Done (RETELL_AGENT_ID + 2 Testcalls)
5. Mobile QA — Done (iOS + Android, keine Blocker)
6. Email deliverability stable (Resend Dashboard: sent > 0, no bounces)

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
