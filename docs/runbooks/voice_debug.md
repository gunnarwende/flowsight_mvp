# Runbook: Voice Debug Decision Tree

**Date:** 2026-02-19
**Owner:** Head Ops Agent

## Evidence Sources

| Source | Script / Tool | Output |
|---|---|---|
| Twilio call logs | `node scripts/_ops/twilio_debug_evidence.mjs` | call_sid, status, duration, error_code |
| Twilio notifications | Same script | notification_sid, error_code, message |
| Sentry events | `node scripts/_ops/sentry_probe.mjs` | issue IDs, event meta |
| Retell dashboard | Manual | Call logs, agent config, webhook events |
| Prod webhook probe | `node scripts/_ops/probe_prod_retell_webhook.mjs` | HTTP status (expect 401) |

## Decision Tree

### 0. All production routes return 404

```
Every route returns 404 (not just webhook)?
├── YES → Deployment broken. Likely a CLI deploy from repo root.
│   ├── Fix: push any commit to trigger Git-connected deploy (uses Root Dir = src/web).
│   ├── Prevention: do NOT run `vercel deploy` from repo root. Only from src/web.
│   └── Verify: run probe script → expect 401.
└── NO → Only webhook 404? Check route.ts exists at src/web/app/api/retell/webhook/route.ts.
```

### 1. Inbound call fails immediately (duration 0)

```
Call status = "failed" or "no-answer" with duration 0?
├── YES → Check Twilio error_code
│   ├── 13224 (Invalid SIP URI) → SIP trunk misconfigured. Check Twilio Console → SIP Trunking → Termination URI.
│   ├── 13225 (SIP 403) → Retell rejecting the SIP connection. Check Retell agent phone number config.
│   ├── 13226 (SIP 404) → Retell SIP endpoint not found. Verify Retell SIP trunk domain.
│   ├── 13227 (SIP 408 Timeout) → Retell not responding in time. Check Retell service status.
│   ├── 13228 (SIP 480 Unavailable) → Retell agent not available. Check RETELL_AGENT_ID config.
│   ├── 13229 (SIP 486 Busy) → Retell agent busy / concurrency limit. Check Retell plan limits.
│   ├── 13230 (SIP 487 Cancelled) → Call cancelled before Retell answered. May be caller hangup.
│   ├── 13235 (SIP 503 Service Unavailable) → Retell service down. Check status.retell.ai.
│   ├── 32009 (SIP Invite Failure) → General SIP failure. Check trunk config + Retell SIP address.
│   ├── No error_code → Check Twilio Notifications for the CallSid
│   └── Other → Search Twilio docs: https://www.twilio.com/docs/api/errors/{code}
└── NO → Call connected. Check next step.
```

### 2. Call connects but webhook not received

```
Call has duration > 0 but no Sentry "payload_keys" breadcrumb?
├── Check Retell Dashboard → Agent → Webhook URL matches: https://flowsight-mvp.vercel.app/api/retell/webhook
├── Check Retell Dashboard → Agent → webhook_events includes "call_ended" or "call_analyzed"
├── Check Vercel deployment logs for /api/retell/webhook 401/500 responses
└── Run: node scripts/_ops/sentry_probe.mjs → look for signature verification failures
```

### 3. Webhook received but no case created

```
Sentry has "voice_case_missing_fields" warning?
├── YES → Check extra.missing_fields[] in Sentry event
│   ├── "plz", "city", "category", "urgency" missing → Retell agent not configured with structured outputs (custom_analysis_data). Update Retell agent prompt + analysis schema.
│   ├── "description" missing → Neither custom_analysis_data.description nor call_summary nor transcript available. Check Retell agent config.
│   ├── "contact_phone (from_number)" missing → Caller number not passed. Unusual — check call type.
│   └── "urgency" invalid → Value present but not one of: notfall, dringend, normal. Update Retell agent prompt.
├── Sentry has "voice_case_no_tenant"?
│   └── Neither tenant_numbers lookup nor FALLBACK_TENANT_ID matched. Check env var.
└── NO Sentry events → Webhook may have returned 204 for non-case event (call_started etc.). Check event type in breadcrumb.
```

### 4. Case created but no email

```
Case exists in Supabase but no email in Resend dashboard?
├── Check Sentry for area:email, provider:resend errors
├── Check MAIL_REPLY_TO is set
└── Email is fire-and-forget — case creation succeeded regardless
```

## Files

- Twilio evidence: `scripts/_ops/twilio_debug_evidence.mjs`
- Sentry evidence: `scripts/_ops/sentry_probe.mjs`
- Webhook handler: `src/web/app/api/retell/webhook/route.ts`
- Tenant resolver: `src/web/src/lib/tenants/resolveTenant.ts`
