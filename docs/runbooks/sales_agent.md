# Agent Brief: Sales Voice Agent

**Date:** 2026-02-26
**Owner:** Head Ops Agent
**Phone:** 044 552 09 19

## Purpose

The Sales Voice Agent handles inbound calls on FlowSight's business number. It answers questions about FlowSight products, pricing, and features, and helps interested callers book a demo.

## Architecture

| Component | Path |
|-----------|------|
| DE Agent Template | `retell/flowsight_sales_de.json` |
| INTL Agent Template | `retell/flowsight_sales_intl.json` |
| Webhook | `src/web/app/api/retell/sales/route.ts` |
| Email Function | `src/web/src/lib/email/resend.ts` → `sendSalesLeadNotification()` |

## Dual-Agent Setup

| Agent | Language | Voice | Role |
|-------|----------|-------|------|
| FlowSight Sales DE | de-DE | Susi (`v3V1d2rk6528UrLKRuy8`) | German sales + language gate |
| FlowSight Sales INTL | en-US | TBD | Multilingual sales (EN/FR/IT) |

## Responsibilities

1. **Answer FlowSight questions** — products, pricing, features, setup process
2. **Book demos** — collect name, company, phone number
3. **Language routing** — detect non-German → transfer to INTL agent
4. **Lead notification** — send email to founder after each call

## Knowledge Base

The agent's knowledge is embedded in the conversation flow prompt (no external KB). Content sources:
- Marketing website (flowsight.ch)
- 3-tier pricing: Starter (CHF 99), Professional (CHF 249), Premium (CHF 349)
- Key facts: Swiss company, DSGVO-konform, no recordings, monthly cancellation

## Post-Call Analysis Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `caller_name` | string | NO | Name of the caller |
| `company_name` | string | NO | Company name |
| `interest_level` | string | YES | "hoch" / "mittel" / "niedrig" |
| `demo_requested` | string | YES | "ja" / "nein" |
| `call_summary` | string | YES | 2-3 sentence summary (German) |

Phone number comes from `call.from_number` — not re-asked during the call.

## Webhook Flow

1. Verify Retell signature (`x-retell-signature` + `RETELL_API_KEY`)
2. Skip non-`call_analyzed` events
3. Extract sales fields from post-call analysis
4. Send lead email to founder via Resend
5. RED WhatsApp alert if email fails
6. Return 204

**No Supabase insert** — no case, no tenant lookup. Pure email notification.

## Stop Criteria

- Max call duration: 420s (7 min)
- Non-FlowSight topics: polite decline → end call
- No recordings (CLAUDE.md constraint)

## Differences from Intake Agent

| Aspect | Intake Agent | Sales Agent |
|--------|-------------|-------------|
| Purpose | Damage reports | Product consultation + demo booking |
| Webhook | `/api/retell/webhook` | `/api/retell/sales` |
| DB insert | Yes (Supabase cases) | No |
| Tenant lookup | Yes | No |
| Email target | Tenant ops email | Founder (MAIL_REPLY_TO) |
| Fields | PLZ, city, category, urgency, description | caller_name, company_name, interest, demo, summary |

## Founder Manual Steps (after deployment)

1. Import agents in Retell Dashboard (JSON upload)
2. Set webhook URL: `https://flowsight-mvp.vercel.app/api/retell/sales`
3. Set up INTL agent ID in DE agent's swap tool
4. Phone routing: 044 552 09 19 → Twilio → Retell Sales DE Agent
5. Test call on 044 552 09 19
