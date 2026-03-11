# Agent Brief: Interest Capture Agent (Lisa)

**Date:** 2026-03-11
**Owner:** Head Ops Agent
**Phone:** 044 552 09 19
**Role:** Interest Capture — NOT Sales

## Purpose

Lisa on 044 552 09 19 is an **Interest Capture Agent**, not a Sales Agent. She warmly receives inbound calls on FlowSight's business number, understands why the caller is reaching out, captures name/company/callback preference, and prepares a personal founder callback.

**What Lisa does NOT do:**
- No pricing (never, even if asked directly)
- No feature pitch or product explanations
- No demo booking or calendar scheduling
- No package/tier discussions

**Why:** Gold Contact principle — "Nicht erklären, zeigen." The founder calls back personally and builds the system for the prospect. Lisa is the warm reception, not the pitch.

## Architecture

| Component | Path |
|-----------|------|
| DE Agent Template | `retell/exports/flowsight_sales_agent.json` |
| INTL Agent Template | `retell/exports/flowsight_sales_agent_intl.json` |
| Webhook | `src/web/app/api/retell/sales/route.ts` |
| Email Function | `src/web/src/lib/email/resend.ts` → `sendSalesLeadNotification()` |

## Dual-Agent Setup

| Agent | Language | Voice | Role |
|-------|----------|-------|------|
| FlowSight Sales DE | de-DE | Susi (`custom_voice_3209d3...`) | German interest capture + language gate |
| FlowSight Sales INTL | en-US | TBD | Multilingual interest capture (EN/FR/IT) |

## Responsibilities

1. **Warm reception** — greet caller, understand context (email received? website seen? referral?)
2. **Capture interest** — collect name, company, preferred callback time
3. **Founder callback** — "Herr Wende meldet sich persönlich bei Ihnen"
4. **Language routing** — detect non-German → transfer to INTL agent
5. **Lead notification** — send email to founder after each call

## Conversation Flow

```
Welcome → Interest Capture → Logic Split
                                ├─ Callback Ready → Closing (callback confirmed)
                                ├─ Info Only → Closing (no callback wanted)
                                └─ Out of Scope → Closing (not FlowSight)
```

Typical call: 60-90 seconds. Maximum 5 turns. Short and warm.

## Deflection Patterns

| Caller asks | Lisa says |
|-------------|-----------|
| "Was kostet das?" | "Das hängt vom Betrieb ab. Herr Wende bespricht das am liebsten persönlich — soll ich einen Rückruf einrichten?" |
| "Was genau macht ihr?" | "Wir helfen Betrieben, erreichbar zu sein. Herr Wende erklärt das am besten persönlich." |
| "Kann man das testen?" | "Ja! Herr Wende baut das System persönlich für Ihren Betrieb. Soll er Sie zurückrufen?" |

## Post-Call Analysis Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `caller_name` | string | NO | Name of the caller |
| `company_name` | string | NO | Company name |
| `interest_level` | string | YES | "hoch" / "mittel" / "niedrig" |
| `callback_requested` | string | YES | "ja" / "nein" |
| `callback_time` | string | NO | Preferred callback time (e.g. "morgen Nachmittag") |
| `call_summary` | string | YES | 2-3 sentence summary (German) |

Phone number comes from `call.from_number` — not re-asked during the call.

## Webhook Flow

1. Verify Retell signature (`x-retell-signature` + `RETELL_API_KEY`)
2. Skip non-`call_analyzed` events
3. Extract interest-capture fields from post-call analysis
4. Send notification email to founder via Resend (subject: "Rückruf-Wunsch")
5. RED alert if email fails
6. Return 204

**No Supabase insert** — no case, no tenant lookup. Pure email notification.

## Stop Criteria

- Max call duration: 300s (5 min) — shorter than before (was 7 min), because no product pitch needed
- Non-FlowSight topics: polite decline → end call
- No recordings (CLAUDE.md constraint)

## Differences from Intake Agent

| Aspect | Intake Agent | Interest Capture Agent |
|--------|-------------|------------------------|
| Purpose | Damage reports for customers | Capture interest, arrange founder callback |
| Webhook | `/api/retell/webhook` | `/api/retell/sales` |
| DB insert | Yes (Supabase cases) | No |
| Tenant lookup | Yes | No |
| Email target | Tenant ops email | Founder (MAIL_REPLY_TO) |
| Fields | PLZ, city, category, urgency, description | caller_name, company, callback_requested, callback_time, summary |
| Pricing | Never | Never |
| Call duration | Up to 7 min | Up to 5 min |

## Founder Manual Steps (after deployment)

1. Import agents in Retell Dashboard (JSON upload)
2. Set webhook URL: `https://flowsight-mvp.vercel.app/api/retell/sales`
3. Set up INTL agent ID in DE agent's swap tool
4. Phone routing: 044 552 09 19 → Twilio → Retell Sales DE Agent
5. Test call on 044 552 09 19
6. Publish both agents (is_published must be true)
