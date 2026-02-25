# Peoplefone Front Door — Brand-Nummer → Twilio → Retell

**Owner:** Founder (console) + Head Ops (code/docs)
**Last updated:** 2026-02-25

## Architecture

```
Caller (PSTN)
    ↓
+41 44 552 09 19  (Peoplefone — Brand-Nummer, kundenfreundlich)
    ↓
Call Forward / SIP  →  +41 44 505 74 20  (Twilio — Carrier)
    ↓
Twilio SIP Trunk  →  Retell SIP Endpoint
    ↓
Retell Voice Agent (DE / INTL)
    ↓
Webhook: POST /api/retell/webhook
    ↓
resolveTenant(to_number)  →  tenant_numbers lookup
    ↓
Case created + Email notification
```

**Key point:** No code changes needed. `resolveTenant()` already resolves any inbound number via `tenant_numbers` table. Both the Peoplefone and Twilio numbers are seeded → works regardless of which number Retell sees as `to_number`.

## 1. Founder: Peoplefone Portal Configuration

### Option A: Simple Call Forward (recommended for MVP)

1. Login to Peoplefone Portal (my.peoplefone.ch)
2. Navigate to: Numbers → +41 44 552 09 19 → Routing / Call Forwarding
3. Set **unconditional forward** to: `+41445057420` (Twilio number)
4. Save + verify green status indicator
5. **Test:** Call +41 44 552 09 19 from any phone → should ring through to Retell

### Option B: SIP Trunk Forward (advanced, later)

1. Peoplefone Portal → SIP Trunks → Create new
2. Destination: Twilio SIP trunk Origination URI
3. Auth: IP allowlist or credentials (coordinate with Twilio)
4. Route +41 44 552 09 19 → SIP trunk

> **MVP recommendation:** Option A. PSTN forward is simpler, costs per-minute on Peoplefone side but no SIP credential management. Switch to Option B later if call volume justifies it.

### Peoplefone fallback / timeout settings

- **Ring timeout:** 30s (default) — if Twilio/Retell doesn't answer
- **On timeout:** Voicemail or forward to Founder mobile (configure in Peoplefone)
- **On Peoplefone outage:** Twilio direct number (+41 44 505 74 20) as backup — publish on website "bei Störung"

## 2. Supabase: Seed tenant_numbers

Both numbers must resolve to the default tenant (Dörfler AG):

```sql
-- Peoplefone brand number → Dörfler AG
INSERT INTO tenant_numbers (tenant_id, phone_number, active)
VALUES ('48cae49e-ec12-4ce4-b5f7-c058de87c93e', '+41445520919', true)
ON CONFLICT (phone_number) DO UPDATE SET active = true;

-- Verify both numbers active
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

**Or use the seed script:**
```powershell
node --env-file=src/web/.env.local scripts/_ops/seed_tenant_number.mjs
```

## 3. Twilio Side — No Changes Needed

Current Twilio setup remains unchanged:
- Phone number +41 44 505 74 20 active
- SIP Trunk → Retell endpoint configured
- Inbound routing → SIP Trunk

When Peoplefone forwards a call, Twilio receives it on the existing number and routes to Retell as normal.

## 4. Fallback Plan

| Scenario | Impact | Mitigation |
|----------|--------|------------|
| Peoplefone down | Brand number unreachable | Publish Twilio backup number on website |
| Peoplefone forward misconfigured | Calls ring but don't reach Twilio | Test call immediately after config |
| Twilio down | Both numbers fail | WhatsApp RED alert (CASE_CREATE_FAILED), Founder mobile fallback |
| Retell down | Calls connect but no agent | Twilio SIP timeout → Peoplefone timeout → voicemail/mobile |
| Double-hop latency | Caller hears extra ring | Expected ~1-2s extra ring; acceptable for MVP |

### Rollback

If Peoplefone forwarding causes problems:
1. Peoplefone Portal → disable forward on +41 44 552 09 19
2. Publish Twilio number (+41 44 505 74 20) directly
3. No code changes needed — both numbers stay in tenant_numbers

## 5. Evidence Checklist (Go-Live Switch)

After Founder completes portal config + DB seed, run these checks:

- [ ] **DB:** `SELECT * FROM tenant_numbers WHERE active = true` → both numbers present
- [ ] **Test call (Peoplefone):** Call +41 44 552 09 19 → Retell agent answers
- [ ] **Test call (Twilio direct):** Call +41 44 505 74 20 → Retell agent still works (regression)
- [ ] **Webhook log:** Vercel Function Logs → `_tag:retell_webhook`, `decision:created` with new call_id
- [ ] **Case created:** Supabase → `SELECT id, source, category, created_at FROM cases ORDER BY created_at DESC LIMIT 1` → source=voice
- [ ] **Email sent:** Notification email received at MAIL_REPLY_TO
- [ ] **WhatsApp (negative):** No WhatsApp alert (success path = no alert, correct)
- [ ] **WhatsApp (simulate):** If needed, re-run proof script to confirm RED alerts still work

### Evidence to record

After successful test call:
```
call_id:    <retell_call_id from Vercel logs>
case_id:    <case UUID from Supabase>
to_number:  <which number Retell saw — +41445057420 or +41445520919>
timestamp:  <ISO>
email_sent: true/false
```

## 6. Customer-Facing Number Policy

| Number | Purpose | Published? |
|--------|---------|------------|
| +41 44 552 09 19 | Brand (Peoplefone) | YES — website, cards, Google Business |
| +41 44 505 74 20 | Carrier (Twilio) | NO — internal only, backup |

> **Rule:** Only the Peoplefone brand number is published. Twilio number is infrastructure, never customer-facing.
