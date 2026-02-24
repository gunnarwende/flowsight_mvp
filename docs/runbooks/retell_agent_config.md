# Runbook: Retell Agent Configuration (FlowSight MVP)

**Date:** 2026-02-22
**Owner:** Head Ops Agent

## Prerequisites

- Retell account with agent created
- RETELL_AGENT_ID set in Vercel Env + .env.local
- Webhook URL: `https://flowsight-mvp.vercel.app/api/retell/webhook`

## 1. Webhook Configuration

In Retell Dashboard → Agent → Settings:

- **Webhook URL:** `https://flowsight-mvp.vercel.app/api/retell/webhook`
- **Webhook Events:** Enable `call_ended` and `call_analyzed`
- **Recording:** OFF (CLAUDE.md constraint)

## 2. Custom Analysis Data Schema

In Retell Dashboard → Agent → Post-Call Analysis → Custom Analysis Data:

Add these fields **exactly as named** (the webhook handler accepts both EN and DE aliases, but EN is canonical):

| Field | Type | Required | Description |
|---|---|---|---|
| `plz` | string | yes | Postleitzahl des Einsatzortes (4-stellig CH) |
| `city` | string | yes | Ort / Stadt des Einsatzortes |
| `category` | string | yes | Kategorie des Schadens (z.B. "Verstopfung", "Leck", "Heizung", "Boiler", "Rohrbruch", "Sanitär allgemein") |
| `urgency` | string | yes | Dringlichkeit — MUSS einer von: `notfall`, `dringend`, `normal` sein |
| `description` | string | yes | Kurzbeschreibung des Problems (1–3 Sätze) |

## 3. Dual-Agent Architecture

| Agent | ID | Flow | Role |
|-------|----|------|------|
| DE Intake | `agent_d7dfe45ab444e1370e836c3e0f` | `conversation_flow_8170ad3c2ca9` | German router + intake |
| INTL Intake | `agent_fb4b956eec31db9c591880fdeb` | `conversation_flow_608d542979bb` | Multilingual intake (EN/FR/IT/DE) |

### DE Agent Flow (8 nodes)
- **Welcome** (static greeting) → always → **Language Gate** (branch, no LLM)
- Language Gate: German → **Intake**, else → **Language Transfer** (swap-only)
- **Intake** (pure German, no swap tool) → skip → **Logic Split** (branch)
- Intake/Closing/OOS all have language-trigger edges → Language Transfer
- **Language Transfer**: only tool = `swap_to_intl_agent`, single instruction: "call swap immediately"
- `flex_mode: false` (CRITICAL — flex_mode=true bypasses the entire node graph)

### INTL Agent Flow (7 nodes)
- Welcome → Intake → Logic Split → Closing / Out-of-scope → End Call
- **DE Transfer** node (swap-only): only tool = `swap_to_de_agent` to DE agent ID
- German-detection edges on Intake/Closing/OOS/Logic Split → DE Transfer
- Language policy: **FOLLOW MODE** — always follow the caller's latest language, never lock
- `flex_mode: false`
- `responsiveness: 0.3` (patience ~4s before reprompt)

### Agent Prompt (Agent-as-File)

SSOT files:
- **DE:** `retell/exports/doerfler_agent.json`
- **INTL:** `retell/exports/doerfler_agent_intl.json`
- **Deploy:** `node scripts/retell_deploy.mjs deploy --mode debug`
- **Verify:** `node scripts/retell_deploy.mjs verify`

## 4. Publishing (CRITICAL — Founder-only until proven stable)

The Retell API `publish-agent` endpoint updates the draft but does NOT reliably publish the conversation flow to production. Callers may continue using the old published version.

**Rule: Always publish from the Retell Dashboard.**

1. Go to Retell Dashboard → Agent → Dörfler AG Intake (DE)
2. Verify the flow matches expectations (nodes, edges, prompts)
3. Click **"Publish"** — note the version number
4. Repeat for Dörfler AG Intake (INTL)
5. Make 1 test call and verify `agent_version` in the call JSON matches the published version

**How to verify:** After a call, check `agent_version` in the raw call JSON (via Spur 1). If it matches the Dashboard version → publish succeeded. If it shows an old version → re-publish from Dashboard.

**Deploy script (`scripts/retell_deploy.mjs`)** updates drafts and calls `publish-agent` as a best-effort. But treat Dashboard Publish as SSOT.

## 5. Verification

After configuring:

1. Make a test call to +41 44 505 74 20
2. Check Vercel Function Logs for:
   ```
   {"_tag":"retell_webhook","decision":"created","call_id":"...","case_id":"..."}
   ```
3. Run: `node --env-file=src/web/.env.local scripts/_ops/verify_voice_pipeline.mjs`
4. Expect: cases found > 0

If you see `decision: "missing_fields"` in Vercel logs, check which fields are in `missing_fields[]` and adjust the Retell agent prompt/schema.

## Allowed urgency values

The webhook handler **only** accepts these exact strings (lowercase):
- `notfall`
- `dringend`
- `normal`

Any other value (e.g., "Notfall", "NOTFALL", "emergency") will be rejected as invalid.

## Allowed category values

Currently free-text. Recommended values for sanitär:
- Verstopfung
- Leck
- Heizung
- Boiler
- Rohrbruch
- Sanitär allgemein
