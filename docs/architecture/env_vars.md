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

## Tenant / Routing (temporär bis CH Nummer live)
- FALLBACK_TENANT_ID -> UUID eines Default-Tenants (nur server-side)
