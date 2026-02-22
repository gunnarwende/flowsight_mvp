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

## 3. Agent Prompt (Agent-as-File)

The agent prompt is now managed as code via JSON files:

- **Generator:** `scripts/gen_retell_agents.mjs`
- **Template:** `retell/agent_template.json` (with `{{placeholders}}`)
- **Dörfler export:** `retell/exports/doerfler_agent.json` (import-ready)
- **Customer config:** `docs/customers/doerfler-ag/voice.md`

To update prompts: edit `scripts/gen_retell_agents.mjs`, run `node scripts/gen_retell_agents.mjs`, re-import in Retell Dashboard.

Key prompt features (v2, 2026-02-22):
- Natural conversational tone (no robot/checklist style)
- "Postleitzahl" enforced (never "PLZ" in speech)
- Full EN/FR language switch (extraction always DE)
- Empathetic micro-reactions before each question
- Anti-double-question rule
- 2-step category inference (derive from description first)

## 4. Verification

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
