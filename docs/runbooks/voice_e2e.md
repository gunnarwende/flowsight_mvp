# Runbook: Voice E2E Verification

**Date:** 2026-02-19
**Owner:** Voice Agent

## Expected Flow

```
Caller → +41 44 505 7420 → Twilio SIP Trunk → Retell Agent →
  [call_ended/call_analyzed webhook] → /api/retell/webhook →
  Tenant resolve → Case insert (Supabase) → Email attempt (Resend) → 204
```

## Verification Steps

### Step 1: Twilio call routing

- **Evidence:** Run `node scripts/_ops/twilio_debug_evidence.mjs`
- **Expected:** Call SID with status `completed`, duration > 0
- **Slot:** Call SID: `________________`

### Step 2: Retell agent processes call

- **Evidence:** Retell Dashboard → Calls → find matching call
- **Expected:** Call shows transcript, call_analysis populated
- **Slot:** Retell call ID: `________________`

### Step 3: Webhook received + verified

- **Evidence:** Sentry breadcrumb `payload_keys` with event `call_ended` or `call_analyzed`
- **Expected:** No 401 errors, breadcrumb shows `customDataKeys` populated
- **Slot:** Sentry event ID: `________________`

### Step 4: Case created in Supabase

- **Evidence:** Supabase Dashboard → Table Editor → `cases` → filter `source = voice`
- **Expected:** Row with correct tenant_id, contact_phone, plz, city, category, urgency, description
- **Slot:** Case ID: `________________`

### Step 5: Email sent via Resend

- **Evidence:** Resend Dashboard → Emails → filter by subject containing case info
- **Expected:** Email delivered to MAIL_REPLY_TO address
- **Slot:** Resend message ID: `________________`

### Step 6: Sentry tags complete

- **Evidence:** Sentry → Issues/Events → filter by `area:voice`
- **Expected tags:** area=voice, provider=retell, tenant_id, retell_call_id, case_id
- **Slot:** Sentry debug event SID: `________________`

## Known Blockers (TBD)

| Blocker | Status | Resolution |
|---|---|---|
| Twilio→Retell SIP routing fails (duration 0) | TBD | Run twilio_debug_evidence.mjs, check error codes per voice_debug.md |
| Retell agent not configured with custom_analysis_data | TBD | Configure analysis schema in Retell Dashboard with: plz, city, category, urgency, description |
| RETELL_AGENT_ID not set | TBD | Set in Retell Dashboard → .env.local + Vercel Env |
| Sentry API 403 | TBD | Run sentry_probe.mjs, fix token scopes |

## Files

- Webhook handler: `src/web/app/api/retell/webhook/route.ts`
- Tenant resolver: `src/web/src/lib/tenants/resolveTenant.ts`
- Case API (wizard path): `src/web/app/api/cases/route.ts`
- Email lib: `src/web/src/lib/email/resend.ts`
- Debug decision tree: `docs/runbooks/voice_debug.md`
