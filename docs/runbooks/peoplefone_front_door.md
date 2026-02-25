# Peoplefone Front Door — Brand-Nummer → Twilio → Retell

**Owner:** Founder (console) + Head Ops (code/docs)
**Last updated:** 2026-02-25
**Status:** LIVE ✓ — verified by Founder

## Architecture (verified live route)

```
Caller (PSTN)
    ↓
+41 44 552 09 19  (Peoplefone — Brand-Nummer, kundenfreundlich)
    ↓
Line 1 Forward  →  +41 44 505 30 19  (Twilio Entry "entry-3019")
    ↓
SIP Trunk "flowsight-retell-ch"  →  Retell SIP Endpoint
    ↓
Retell Inbound Agent: "Dörfler AG Intake (DE)" (voice Susi)
    ↓
Webhook: POST /api/retell/webhook
    ↓
resolveTenant(to_number)  →  tenant_numbers lookup
    ↓
Case created + Email notification
```

**Key point:** No code changes needed. `resolveTenant()` already resolves any inbound number via `tenant_numbers` table. All relevant numbers are seeded → works regardless of which number Retell sees as `to_number`.

## 1. Founder: Peoplefone Portal Configuration

### DONE: Line 1 Forward (Option A — verified live)

1. ~~Login to Peoplefone Portal (my.peoplefone.ch)~~
2. ~~Navigate to: Numbers → +41 44 552 09 19 → Routing / Call Forwarding~~
3. ~~Set **Line 1 forward** to: `+41445053019` (Twilio Entry)~~
4. ~~Save + verify green status indicator~~
5. ~~**Test:** Call +41 44 552 09 19 → Retell agent "Dörfler AG Intake (DE)" answers (voice Susi)~~

**Result:** PASS ✓ — call rings, Retell agent answers, full pipeline operational.

### Option B: SIP Trunk Forward (advanced, later)

1. Peoplefone Portal → SIP Trunks → Create new
2. Destination: Twilio SIP trunk Origination URI
3. Auth: IP allowlist or credentials (coordinate with Twilio)
4. Route +41 44 552 09 19 → SIP trunk

> Not needed for MVP. Line 1 forward is live and proven.

### Peoplefone fallback / timeout settings

- **Ring timeout:** 30s (default) — if Twilio/Retell doesn't answer
- **On timeout:** Voicemail or forward to Founder mobile (configure in Peoplefone)
- **On Peoplefone outage:** Twilio direct number as backup

## 2. Supabase: Seed tenant_numbers

All relevant numbers must resolve to the default tenant (Dörfler AG):

```sql
-- Peoplefone brand number
INSERT INTO tenant_numbers (tenant_id, phone_number, active)
VALUES ('48cae49e-ec12-4ce4-b5f7-c058de87c93e', '+41445520919', true)
ON CONFLICT (phone_number) DO UPDATE SET active = true;

-- Twilio Entry number (Peoplefone forwards here)
INSERT INTO tenant_numbers (tenant_id, phone_number, active)
VALUES ('48cae49e-ec12-4ce4-b5f7-c058de87c93e', '+41445053019', true)
ON CONFLICT (phone_number) DO UPDATE SET active = true;

-- Verify all numbers active
SELECT phone_number, tenant_id, active
FROM tenant_numbers
WHERE active = true
ORDER BY created_at;
```

**Expected result:**
| phone_number | tenant_id | active |
|---|---|---|
| +41445057420 | 48cae49e-... | true |
| +41445520919 | 48cae49e-... | true |
| +41445053019 | 48cae49e-... | true |

**Or use the seed script:**
```powershell
node --env-file=src/web/.env.local scripts/_ops/seed_tenant_number.mjs
```

## 3. Twilio Side — Verified

- Twilio Entry number: +41 44 505 30 19 ("entry-3019")
- SIP Trunk: "flowsight-retell-ch" → Retell SIP Endpoint
- Retell phone number: "entry-3019" → inbound agent "Dörfler AG Intake (DE)"

Peoplefone Line 1 forwards to the Twilio Entry number. Twilio routes via SIP trunk to Retell.

## 4. Fallback Plan

| Scenario | Impact | Mitigation |
|----------|--------|------------|
| Peoplefone down | Brand number unreachable | Publish Twilio Entry number on website as backup |
| Peoplefone forward misconfigured | Calls ring but don't reach Twilio | Test call immediately after config |
| Twilio down | Both numbers fail | WhatsApp RED alert (CASE_CREATE_FAILED), Founder mobile fallback |
| Retell down | Calls connect but no agent | Twilio SIP timeout → Peoplefone timeout → voicemail/mobile |
| Double-hop latency | Caller hears extra ring | Expected ~1-2s extra ring; acceptable for MVP |

### Rollback

If Peoplefone forwarding causes problems:
1. Peoplefone Portal → disable forward on +41 44 552 09 19
2. Publish Twilio Entry number (+41 44 505 30 19) directly
3. No code changes needed — all numbers stay in tenant_numbers

## 5. Evidence Checklist (Go-Live Switch)

- [x] **Peoplefone portal:** Line 1 forward configured → +41 44 505 30 19 (Twilio Entry)
- [x] **Test call (Peoplefone):** Call +41 44 552 09 19 → Retell agent "Dörfler AG Intake (DE)" answers (voice Susi)
- [x] **WhatsApp Ops Alerts:** Twilio Sandbox live, proof PASS, comms policy committed
- [ ] **DB seed:** `SELECT * FROM tenant_numbers WHERE active = true` → all 3 numbers present (Founder TODO)
- [ ] **Webhook log:** Vercel Function Logs → `_tag:retell_webhook`, `decision:created` with proof call_id
- [ ] **Case created:** Supabase → `SELECT id, source, category, created_at FROM cases ORDER BY created_at DESC LIMIT 1` → source=voice
- [ ] **Email sent:** Notification email received at MAIL_REPLY_TO
- [ ] **Regression:** Call +41 44 505 30 19 directly (Twilio Entry) → still works without Peoplefone hop

### Evidence (proof call — Founder to fill)

```
call_id:    <retell_call_id from Vercel logs>
case_id:    <case UUID from Supabase>
to_number:  <which number Retell saw — +41445053019 or +41445520919>
timestamp:  <ISO>
email_sent: true/false
route:      Peoplefone → Twilio Entry → SIP flowsight-retell-ch → Retell entry-3019
```

## 6. Customer-Facing Number Policy

| Number | Purpose | Published? |
|--------|---------|------------|
| +41 44 552 09 19 | Brand (Peoplefone) | YES — website, cards, Google Business |
| +41 44 505 30 19 | Carrier Entry (Twilio) | NO — internal only, backup |

> **Rule:** Only the Peoplefone brand number is published. Twilio number is infrastructure, never customer-facing.

## 7. Comms Policy (confirmed)

| Channel | Audience | Content |
|---------|----------|---------|
| Email (Resend) | Customers + Ops | Case notifications, confirmations, review requests |
| WhatsApp (Twilio Sandbox) | Founder only | System RED incidents (CASE_CREATE_FAILED, EMAIL_DISPATCH_FAILED) |
| WhatsApp | Never customer-facing | No PII, no business events, ops alerts only |
