# Phone Routing Registry — SSOT

**Owner:** Founder
**Last updated:** 2026-03-05
**Rule:** Before ANY phone number assignment change in Retell, update this file FIRST.

## Phone Number Registry

| Number | Provider | Purpose | Published Where | Retell Agent | Retell Agent ID |
|--------|----------|---------|-----------------|--------------|-----------------|
| +41 44 552 09 19 | Peoplefone | FlowSight Sales | flowsight.ch, LinkedIn, Pitch Deck | **FlowSight Sales DE (Lisa)** | (see Retell Dashboard) |
| +41 44 505 30 19 | Twilio | Peoplefone forward target | NOWHERE (internal) | **FlowSight Sales DE (Lisa)** | (same as above) |
| +41 44 505 48 18 | Twilio | Brunner Demo Voice | NOWHERE (demo-kit intern) | **Brunner Intake DE** | agent_47deec4bdc891126de71dd42be |
| +41 44 505 74 20 | Twilio | Doerfler Testing/Legacy | NOWHERE (internal) | **Doerfler Intake DE** | agent_d7dfe45ab444e1370e836c3e0f |

## Routing Chains (PSTN)

### FlowSight Sales (044 552 09 19)
```
Caller dials 044 552 09 19
  -> Peoplefone Line 1 Forward -> +41 44 505 30 19 (Twilio)
  -> SIP Trunk "flowsight-retell-ch" -> Retell
  -> Agent: FlowSight Sales DE (Lisa)
  -> Webhook: POST /api/retell/sales
  -> Result: Lead email to Founder
```

### Brunner Demo (044 505 48 18)
```
Caller dials 044 505 48 18
  -> Twilio -> SIP Trunk -> Retell
  -> Agent: Brunner Intake DE
  -> Webhook: POST /api/retell/webhook
  -> resolveTenant(+41445054818) -> Brunner tenant
  -> Result: Case created + email
```

### Doerfler Testing (044 505 74 20)
```
Caller dials 044 505 74 20
  -> Twilio -> SIP Trunk -> Retell
  -> Agent: Doerfler Intake DE
  -> Webhook: POST /api/retell/webhook
  -> resolveTenant(+41445057420) -> Doerfler tenant
  -> Result: Case created + email
```

### Demo-Kit SIP (MicroSIP, separate path)
```
MicroSIP -> flowsight-demo.sip.twilio.com
  -> TwiML (/api/demo/sip-twiml) -> Dial +41445054818
  -> Retell Agent: Brunner Intake DE
  -> Webhook caller override via DEMO_SIP_CALLER_ID
```

## Supabase tenant_numbers Mapping

| phone_number | tenant | purpose |
|---|---|---|
| +41445520919 | Doerfler (48cae49e) | Peoplefone brand — for webhook tenant resolution |
| +41445053019 | Doerfler (48cae49e) | Twilio entry — for webhook tenant resolution |
| +41445057420 | Doerfler (48cae49e) | Legacy Twilio — for webhook tenant resolution |
| +41445054818 | Brunner (d0000000) | Brunner voice number |

**Note:** The tenant_numbers mapping for +41445520919 and +41445053019 still points to Doerfler.
This is CORRECT for the intake webhook, but irrelevant for Sales calls (Sales webhook doesn't do tenant lookup).

## Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-02-25 | +41445053019 assigned to Doerfler Intake DE | Peoplefone front door PoC |
| 2026-03-01 | +41445053019 reassigned to Brunner Intake DE | Demo-kit setup (broke Sales path) |
| 2026-03-05 | +41445053019 reassigned to FlowSight Sales DE (Lisa) | Fix #47 — restore correct routing |
| 2026-03-05 | Sales DE + INTL agents published, phone version updated to v7 | Root cause: agents were NEVER published after creation. Retell fallback behavior routed to Brunner. |

## Root Cause Analysis (#47)

The FlowSight Sales agents were imported via Retell Dashboard JSON upload but **never published**.
Retell's behavior when inbound_agent is not published: falls back to unknown/default agent (Brunner answered).
Additionally, the phone number was pinned to agent version 4 while the agent was at version 7.

**Fix:** Published both Sales agents + updated phone number to latest version.
**Prevention:** The `retell_sync.mjs` script always publishes after sync. Sales agents are now tracked in `retell/agent_ids.json` under `flowsight_sales`.

## Verification Checklist (run after ANY change)

- [ ] Call 044 552 09 19 -> Lisa answers ("digitale Assistentin von FlowSight")
- [ ] Call 044 505 48 18 -> Brunner Intake answers
- [ ] Call 044 505 74 20 -> Doerfler Intake answers
- [ ] MicroSIP SIP call -> Brunner Intake answers (demo-kit path unaffected)

## Anti-Drift Rules

1. **Never** reassign +41 44 505 30 19 in Retell without updating this file
2. **Never** change Peoplefone forward target without updating this file
3. After any Retell phone number change: run ALL 4 verification tests
4. This file is the SSOT for phone routing — not peoplefone_front_door.md (which is now outdated for agent assignment)
