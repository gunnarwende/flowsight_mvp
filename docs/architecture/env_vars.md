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

## Twilio (Carrier)
- TWILIO_ACCOUNT_SID -> Twilio Console
- TWILIO_AUTH_TOKEN -> Twilio Console
- TWILIO_PHONE_NUMBER -> gekaufte CH Nummer (E.164)
- TWILIO_SIP_TRUNK_NAME -> SIP Trunk Name für Retell-Routing

## Peoplefone (Brand-Nummer, optional)
- Keine Env Vars nötig — Peoplefone-Routing ist Portal-seitig (Forward auf Twilio-Nummer)
- Brand-Nummer wird in tenant_numbers (Supabase) geseeded, nicht als Env Var
- Portal-Zugang: my.peoplefone.ch (Credentials in Bitwarden)
- Siehe: docs/runbooks/peoplefone_front_door.md

## eCall.ch (Swiss SMS Gateway — Primary)
- ECALL_API_URL -> https://rest.ecall.ch/api/message (eCall REST endpoint)
- ECALL_API_USERNAME -> eCall Portal → REST API User
- ECALL_API_PASSWORD -> eCall Portal → REST API Passwort

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

## App / Routing
- APP_URL -> Canonical app URL (server-side, z.B. https://flowsight-mvp.vercel.app). Auch als GitHub Actions Secret (für lifecycle-tick + morning-report cron).
- NEXT_PUBLIC_APP_URL -> Same, but client-accessible (NEXT_PUBLIC_ prefix)
- FALLBACK_TENANT_ID -> UUID eines Default-Tenants (nur server-side, temporär bis Routing steht)

## Review Engine (W12)
- GOOGLE_REVIEW_URL -> Google Maps Review-URL des Kunden (single tenant, server-side)

## OpenAI (Whisper STT for CoreBot voice tickets)
- OPENAI_API_KEY -> OpenAI Dashboard (required for voice→issue transcription in CoreBot)

## CoreBot (Telegram → GitHub Issues)
- GITHUB_ISSUES_TOKEN -> GitHub Fine-grained PAT (Issues RW, flowsight_mvp only)
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
