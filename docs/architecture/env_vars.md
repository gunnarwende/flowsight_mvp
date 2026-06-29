# Environment Variables – SSOT (KEINE Secrets hier reinschreiben)

Diese Datei ist eine Liste aller benötigten Env Vars + Herkunft. Keine Werte eintragen.

## Vercel Environments
- Production
- Preview
- Development (lokal via .env.local, gitignored)

## Supabase
- SUPABASE_URL -> Supabase Project Settings
- SUPABASE_ANON_KEY -> Supabase API Keys (public)
- SUPABASE_SERVICE_ROLE_KEY -> Supabase API Keys (server-only)
- NEXT_PUBLIC_SUPABASE_URL -> Same as SUPABASE_URL (browser-accessible, for Auth flows)
- NEXT_PUBLIC_SUPABASE_ANON_KEY -> Same as SUPABASE_ANON_KEY (browser-accessible, for Auth flows)

## Resend (Mail Provider)
- RESEND_API_KEY -> Resend Dashboard
- MAIL_FROM -> z.B. no-reply@flowsight.ch
- MAIL_REPLY_TO -> Office Inbox
- MAIL_SUBJECT_PREFIX -> z.B. "[FlowSight]"

## Sentry
- SENTRY_DSN -> Sentry Project
- NEXT_PUBLIC_SENTRY_DSN -> Sentry Project (public DSN)
- SENTRY_AUTH_TOKEN -> Sentry (für sourcemaps upload)
- SENTRY_ORG -> (org slug)
- SENTRY_PROJECT -> (project slug)
- SENTRY_ENVIRONMENT -> production / preview / development

## Retell
- RETELL_WEBHOOK_SECRET -> selbst generiert (Bitwarden)
- RETELL_API_KEY -> Retell Dashboard (optional)
- RETELL_AGENT_ID -> optional

## Cal.com (Self-Scheduling — Stern 5 Rückruf-Buchung)
- CAL_WEBHOOK_SECRET -> Cal.com Webhook „Secret" (für /api/cal/webhook Signatur-Check, Header X-Cal-Signature-256)
- CAL_BOOKING_URL -> öffentlicher Cal.com Buchungs-Link (Slot-Button in der Outreach-Mail), z.B. https://cal.com/gunnar-wende/rueckruf

## Twilio (Voice/SIP only — kein SMS)
- TWILIO_ACCOUNT_SID -> Twilio Console
- TWILIO_AUTH_TOKEN -> Twilio Console
- TWILIO_PHONE_NUMBER -> gekaufte CH Nummer (E.164) — nur SIP/Voice-Routing
- TWILIO_SIP_TRUNK_NAME -> SIP Trunk Name für Retell-Routing

## Peoplefone (Brand-Nummer, optional)
- Keine Env Vars nötig — Peoplefone-Routing ist Portal-seitig (Forward auf Twilio-Nummer)
- Brand-Nummer wird in tenant_numbers (Supabase) geseeded, nicht als Env Var
- Portal-Zugang: my.peoplefone.ch (Credentials in Bitwarden)
- Siehe: docs/runbooks/peoplefone_front_door.md

## eCall.ch (Einziger SMS-Provider für CH)
- ECALL_API_URL -> https://rest.ecall.ch/api/message (eCall REST endpoint)
- ECALL_API_USERNAME -> eCall Portal → REST API User
- ECALL_API_PASSWORD -> eCall Portal → REST API Passwort
- ECALL_SENDER_NUMBER -> FlowSight-Servicenummer (E.164, +41766012739). IMMER als SMS-Absender verwendet. Firmenname steht im SMS-Text. KEINE Founder-Privatnummer.

## SMS (Post-Call Verification)
- SMS_HMAC_SECRET -> selbst generiert (Bitwarden), für HMAC-SHA256 Token in Korrektur-Links
- SMS_ALLOWED_NUMBERS -> (optional) Komma-separierte E.164 Whitelist. Wenn gesetzt, gehen SMS nur an diese Nummern. Leer/fehlend = senden an alle. Testphase: nur Founder-Handy.

## Demo (SIP/MicroSIP)
- DEMO_SIP_CALLER_ID -> Founder-Handynummer E.164 (z.B. +41791234567). Muss als Twilio Outgoing Caller ID verifiziert sein. Retell sieht diese Nummer als from_number → SMS landet auf dem Demo-Handy.

## Scout (Prospect Discovery)
- GOOGLE_SCOUT_KEY -> Google Cloud Console (Places API New). Used by scripts/_ops/scout.mjs for prospect discovery. $200/month free credit.

## Trial Lifecycle
- LIFECYCLE_TICK_SECRET -> selbst generiert (Bitwarden). Bearer token für POST /api/lifecycle/tick. Auch als GitHub Actions Secret setzen.

## Morning Report (GH Actions Cron)
- FOUNDER_EMAIL -> Founder Outlook-Adresse. Empfängt Morning Report bei RED/YELLOW. GitHub Actions Secret.
- (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, APP_URL -> bereits oben, müssen auch als GitHub Actions Secrets gesetzt sein)

## Calendar Integration (Outlook/Graph API)
- MICROSOFT_CLIENT_ID -> Azure Portal → App Registrations → FlowSight (multi-tenant). Application (client) ID.
- MICROSOFT_CLIENT_SECRET -> Azure Portal → App Registrations → Certificates & secrets. Client secret value (nicht die ID).
- CALENDAR_ENCRYPTION_KEY -> selbst generiert (Bitwarden). 64 hex chars (32 bytes). AES-256-GCM Key für Token-Verschlüsselung in tenants.modules + HMAC-Signatur OAuth State. Generieren: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## App / Routing
- APP_URL -> Canonical app URL (server-side, z.B. https://flowsight-mvp.vercel.app). Auch als GitHub Actions Secret (für lifecycle-tick + morning-report cron).
- NEXT_PUBLIC_APP_URL -> Same, but client-accessible (NEXT_PUBLIC_ prefix)
- FALLBACK_TENANT_ID -> UUID eines Default-Tenants (nur server-side, temporär bis Routing steht)

## Review Engine (W12)
- GOOGLE_REVIEW_URL -> Google Maps Review-URL des Kunden (single tenant, server-side)

## Anthropic (CEO-App AI + QA Sweep)
- ANTHROPIC_API_KEY -> Anthropic Console (console.anthropic.com → API Keys)
  - CEO-App: Pulse-Comment (claude-haiku-4-5-20251001), Triage (claude-haiku-4-5-20251001), Analysis (claude-opus-4-6), Tenant-Insights
  - QA Sweep: qa_sweep.mjs Phase B (screenshot analysis via Claude Vision API)
  - Optional: CEO-App AI features degrade gracefully (comment: null) without key. QA Phase A (DOM checks) runs without it.

## OpenAI (CEO-App AI + CoreBot STT)
- OPENAI_API_KEY -> OpenAI Dashboard (platform.openai.com → API Keys)
  - CEO-App: Outreach Drafts (gpt-4o), Revenue Forecast (gpt-4o)
  - CoreBot: voice→issue transcription via Whisper STT
  - Optional: CEO-App AI features degrade gracefully without key.

## Sentry (CEO-App Digest)
- SENTRY_API_TOKEN -> Sentry Dashboard → Settings → Auth Tokens → Project Read-Only Token
  - Used by CEO-App Monitoring → Sentry Digest (letzte 24h Errors, gruppiert nach Area)
  - Scope: project:read on flowsight_mvp project only
  - Optional: Sentry Digest zeigt Platzhalter ohne Token.

## CoreBot (Telegram → GitHub Issues)
- GH_ISSUES_TOKEN -> GitHub Fine-grained PAT (Issues RW, flowsight_mvp only). (Umbenannt von GITHUB_ISSUES_TOKEN am 2026-06-23 — GitHub verbietet Secrets mit Prefix GITHUB_.)
- TELEGRAM_SHARED_SECRET -> self-generated (webhook verification, shared with Telegram setWebhook)
- TELEGRAM_BOT_TOKEN -> BotFather (already documented under Telegram CI)
- TELEGRAM_ALLOWED_USER_ID -> Founder Telegram user ID (whitelist)

---

## How to sync env (no drift)

**One-time setup:** `npx vercel login` (once per machine).

**Sync command:**
```powershell
pwsh scripts/env_sync.ps1
```

This pulls the current Vercel production env vars into `src/web/.env.local` using a temp dir (`C:\tmp\vercel_envsync_flowsight`). It creates a timestamped backup of the previous `.env.local` and verifies required keys are present.

**WARNING:** Never run `vercel link`, `vercel pull`, or any Vercel CLI command inside the repo root. Always use the script or a temp directory. See CLAUDE.md.

---

## Mobile parity: GitHub Secrets = mirror of Vercel (no drift)

Ziel: Vom Handy genauso arbeitsfähig wie vom Laptop. Prinzip: **Das Handy fasst nie einen Key an. Keys leben in der Cloud; das Handy löst nur aus** (workflow_dispatch). Jede Operation, die einen Key braucht, muss als GitHub Action laufbar sein — dann hat sie in CI vollen Key-Zugriff (inkl. Supabase/DB).

**SSOT-Kette (eine Richtung, kein Rückfluss):**

```
Vercel (Wahrheit) --env_sync.ps1--> src/web/.env.local --env_to_gh_secrets.ps1--> GitHub Actions Secrets
```

**Re-Sync (nach jeder Key-Änderung in Vercel):**
```powershell
pwsh scripts/env_sync.ps1            # Vercel -> .env.local
pwsh scripts/env_to_gh_secrets.ps1   # .env.local -> GitHub Secrets (idempotent)
```

`env_to_gh_secrets.ps1` spiegelt nur echte Business-Keys: es überspringt `VERCEL_*`, `TURBO_*`, `NX_DAEMON` (Build-System), leere Werte und `GITHUB_*` (von GitHub verboten). Werte erscheinen nie im Log.

**Regel bei JEDEM neuen Key:** in Vercel setzen -> beide Sync-Skripte laufen -> Name hier in dieser Registry eintragen. Nur in `.env.local` = Drift (Laptop kann es, Handy schlägt still fehl).

**Offene Punkte (Stand 2026-06-23, beim ersten Voll-Sync entdeckt):**
- `GH_DISPATCH_TOKEN` und `RETELL_COCKPIT_TEST_AGENT_ID` sind in Vercel **leer** -> nicht gespiegelt. `GH_DISPATCH_TOKEN` ist der Token für workflow_dispatch (Mobil-Pfad) — prüfen, ob er anderswo lebt oder gesetzt werden muss.
- `GITHUB_ISSUES_TOKEN` -> `GH_ISSUES_TOKEN` umbenannt (2026-06-23): in Vercel (Founder) + Code (telegram/webhook, ops/support, ceo/admin/env-status) + Doku. Muss deployt werden, damit Prod den neuen Namen liest.
