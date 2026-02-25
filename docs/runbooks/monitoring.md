# Monitoring & Alerting Runbook

**Owner:** Head Ops Agent
**Last updated:** 2026-02-25 (originally Welle 9)
**Ziel:** "We know within minutes if intake is broken."

## Health Endpoint

```
GET https://flowsight-mvp.vercel.app/api/health
```

Response (200):
```json
{ "ok": true, "ts": "2026-02-20T14:00:00.000Z", "commit": "<sha>", "env": "production" }
```

- No auth required. No DB calls. No secrets.
- Use for external uptime monitoring (e.g. UptimeRobot, cron ping).
- `commit` = VERCEL_GIT_COMMIT_SHA (auto-provided by Vercel).
- `env` = VERCEL_ENV ("production" | "preview" | "development").

---

## Sentry Tag Schema

Alle Failure-Paths taggen Sentry Events mit diesen Tags:

| Tag | Werte | Zweck |
|-----|-------|-------|
| `_tag` | `retell_webhook`, `resend`, `cases_api` | Route/Service Identifier (Alert-Filter) |
| `stage` | `verify`, `parse`, `validate`, `db`, `email` | Failure-Phase |
| `decision` | `rejected`, `failed`, `skipped`, `missing_fields`, `no_tenant`, `insert_error`, `unexpected_error`, `created`, `sent` | Outcome |
| `error_code` | `NO_SIG_HEADER`, `NO_API_KEY`, `INVALID_SIG`, `VERIFY_EXCEPTION`, `PARSE_ERROR`, `MISSING_FIELDS`, `NO_TENANT`, `DB_INSERT_ERROR`, `UNEXPECTED`, `NO_REPLY_TO`, `RESEND_API_ERROR`, `RESEND_EXCEPTION` | Stable machine-readable Code |
| `area` | `voice`, `email`, `api` | Bereich |
| `provider` | `retell`, `resend` | Upstream-Service |
| `tenant_id` | UUID | Multi-Tenant Scope |
| `case_id` | UUID | Case Scope |

---

## Alert A: Voice Intake Failures

**Was:** Retell Webhook kann keine Cases erstellen (Sig-Fehler, Parse, fehlende Felder, DB-Error).

### Sentry Alert erstellen (Founder, ca. 5min)

1. Sentry Dashboard oeffnen: https://sentry.io → Projekt "flowsight-mvp"
2. Links: **Alerts** → **Create Alert**
3. Alert Type: **Issue Alert** (empfohlen) oder **Metric Alert**
4. Filter:
   - **When:** An event is seen
   - **IF:** Tag `_tag` equals `retell_webhook`
   - **AND:** Tag `decision` is NOT one of: `event_skipped`, `created`
5. Action: **Send notification to** → E-Mail (dein Login) oder Slack (falls konfiguriert)
6. Alert Name: `Voice Intake Failure`
7. Frequency: **Every time** (oder: max 1 per 10min to avoid noise)
8. Save.

### Was der Alert bedeutet:
- Retell hat eine Webhook-Nachricht geschickt, aber kein Case wurde erstellt.
- Ursache (via `error_code` Tag): Signatur-Fehler, fehlende Felder, kein Tenant, DB-Error.
- Action: Sentry Event oeffnen → Tags lesen → Runbook voice_debug.md folgen.

---

## Alert B: Email/Resend Failures

**Was:** Resend konnte keine E-Mail senden (Case-Notification oder ICS-Invite).

### Sentry Alert erstellen (Founder, ca. 5min)

1. Sentry Dashboard → **Alerts** → **Create Alert**
2. Alert Type: **Issue Alert**
3. Filter:
   - **When:** An event is seen
   - **IF:** Tag `_tag` equals `resend`
   - **AND:** Tag `decision` equals `failed`
4. Action: **Send notification to** → E-Mail oder Slack
5. Alert Name: `Email Send Failure`
6. Frequency: **Every time**
7. Save.

### Was der Alert bedeutet:
- Resend API hat einen Fehler zurueckgegeben oder eine Exception geworfen.
- Context-Tags: `case_id`, `error_code` (`RESEND_API_ERROR` oder `RESEND_EXCEPTION`).
- Action: Resend Dashboard pruefen (https://resend.com/emails), API Key + Domain verifizieren.

---

## Alert C (optional): Wizard/API Case Creation Failure

### Sentry Alert erstellen

1. Sentry Dashboard → **Alerts** → **Create Alert**
2. Filter:
   - **IF:** Tag `_tag` equals `cases_api`
   - **AND:** Tag `decision` equals `failed`
3. Alert Name: `Wizard Case Creation Failure`
4. Save.

---

## Verification Checklist

After creating alerts, verify they work:

1. **Health endpoint:**
   ```
   curl https://flowsight-mvp.vercel.app/api/health
   ```
   Expected: `{"ok":true,"ts":"...","commit":"...","env":"production"}`

2. **Sentry events exist:** Check Sentry Dashboard → Issues → filter by `_tag:retell_webhook` or `_tag:resend`. Previous test calls should have created events.

3. **Alert test:** Sentry allows "Test Alert" in the alert editor. Use it to verify notification delivery.

---

## P0 Monitoring Coverage

| Intake Path | Sentry _tag | Failure Decision | Console Log |
|-------------|-------------|------------------|-------------|
| Voice (Retell Webhook) | `retell_webhook` | `rejected`, `missing_fields`, `no_tenant`, `insert_error`, `unexpected_error` | 1 JSON line per invocation |
| Email (Case Notification) | `resend` | `failed`, `skipped` | 1 JSON line per invocation |
| Email (ICS Invite) | `resend` | `failed` | 1 JSON line per invocation |
| Wizard (POST /api/cases) | `cases_api` | `failed` | Via resend.ts (delegated) |

---

## Alert Channel: WhatsApp Founder-only (Welle 23)

**Scope:** System RED incidents only (something broke). NOT business events (customer Notfall).

| Code | Trigger | Routes |
|------|---------|--------|
| `CASE_CREATE_FAILED` | DB insert error or unexpected exception | `/api/retell/webhook`, `/api/cases` |
| `EMAIL_DISPATCH_FAILED` | Resend returns false (API error/exception) | `/api/retell/webhook`, `/api/cases` |

**Disabled (by design):**
- `NOTFALL_CASE` — removed. Customer urgency is a business event, not a system incident.

**Throttle:** Same code + ref max 1x per 15 minutes (in-memory, resets on cold start).

**Env Vars:**
- `FOUNDER_WHATSAPP_ENABLED` — must be `"true"` to send (safe default: anything else = skip)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` — Twilio credentials
- `TWILIO_WHATSAPP_FROM` — Sandbox or production WhatsApp sender
- `FOUNDER_WHATSAPP_TO` — Founder's WhatsApp number

**Message Format:** `🔴 INCIDENT <CODE> | refs | → ops_link`

**Log Evidence:** `wa_sent: true, wa_sid: "SM..."` in webhook logDecision (1-log rule preserved).

**Proof Script:** `bash scripts/_ops/proof_wa_alert.sh [target_url]` — triggers FK error → RED alert.

---

## Not Monitored (by design, not P0)

- Ops PATCH /api/ops/cases/[id] — internal tool, has Sentry.captureException but no alert
- Attachments — internal tool, has Sentry.captureException but no alert
- Auth failures (401) — expected operational noise, not intake failure
