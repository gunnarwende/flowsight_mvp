# Retell Voice Agent — Agent-as-File

## File Structure

```
retell/
  agent_template_de.json        # DE template with {{placeholders}}
  agent_template_intl.json      # INTL template with {{placeholders}}
  exports/
    doerfler_agent.json          # Ready-to-import DE instance for Dörfler AG
    doerfler_agent_intl.json     # Ready-to-import INTL instance for Dörfler AG
  README.md                      # This file
scripts/
  gen_retell_agents.mjs          # Generator (produces all JSON files)
  patch_retell_agent_ids.mjs     # Patcher (wires DE→INTL agent_id before import)
docs/customers/<slug>/voice.md   # Per-customer voice config
```

## Dual-Agent Architecture

Each customer gets TWO agents:

1. **DE Agent** — German-only, primary phone number assigned here
   - Greets in German, runs intake in German
   - Has `AgentSwapTool` on the Intake Node
   - When caller speaks EN/FR/IT: transfers to INTL agent immediately
   - Voice: ElevenLabs Susi (or customer-specific DE voice)

2. **INTL Agent** — Multilingual (EN/FR/IT), transfer destination
   - Receives transferred calls with full conversation history
   - Detects caller's language, continues intake in that language
   - Voice: ElevenLabs Juniper (or customer-specific INTL voice)
   - `post_call_analysis_setting: only_destination_agent` (no duplicate webhook)

## Template Placeholders

### DE Template

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{agent_name}}` | Agent display name | Dörfler AG Intake (DE) |
| `{{business_name}}` | Business name in prompts | Dörfler AG |
| `{{greeting_text}}` | Welcome node spoken text | Guten Tag, hier ist... |
| `{{closing_text}}` | Closing node spoken text | Danke, ich habe alles... |
| `{{voice_id}}` | ElevenLabs voice ID (DE) | v3V1d2rk6528UrLKRuy8 |
| `{{webhook_url}}` | FlowSight webhook | https://flowsight-mvp.vercel.app/api/retell/webhook |
| `{{intl_agent_id}}` | Retell agent_id of INTL agent | agent_xxx |

### INTL Template

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{agent_name}}` | Agent display name | Dörfler AG Intake (INTL) |
| `{{business_name}}` | Business name in prompts | Dörfler AG |
| `{{closing_text}}` | Closing text (English base) | Thank you, I've recorded... |
| `{{voice_id}}` | ElevenLabs voice ID (INTL) | aMSt68OGf4xUZAnLpTU8 |
| `{{webhook_url}}` | FlowSight webhook | https://flowsight-mvp.vercel.app/api/retell/webhook |

## Creating a New Customer

1. Copy `docs/customers/doerfler-ag/voice.md` to `docs/customers/<new-slug>/voice.md`
2. Fill in customer-specific values
3. Add customer config in `scripts/gen_retell_agents.mjs` (follow Dörfler pattern)
4. Run: `node scripts/gen_retell_agents.mjs`
5. Import in Retell (see below)

## Import & Wiring (per customer)

**Import order: INTL first, then DE.**

### 1. Import + Publish INTL agent
- Retell Dashboard → All Agents → Import → `exports/<slug>_agent_intl.json`
- Retell generates new `agent_id` — copy it
- Publish the agent

### 2. Wire DE agent → INTL agent

**Preferred (Retell UI — no source edit):**
1. Import `exports/<slug>_agent.json`
2. Open agent → Conversation Flow → Intake Node → Tools → `swap_to_intl_agent`
3. Set `agent_id` to the INTL agent_id from step 1
4. Save + Publish

**Fallback (CLI patcher):**
```bash
node scripts/patch_retell_agent_ids.mjs \
  --in  retell/exports/<slug>_agent.json \
  --out retell/exports/<slug>_agent_patched.json \
  --intl <INTL_AGENT_ID>
```
Import the `_patched.json` file. Do NOT commit it.

### 3. Configure
- Assign phone number to **DE agent** (INTL agent has no phone number)
- Verify webhook URL on both: `https://flowsight-mvp.vercel.app/api/retell/webhook`

### 4. Verification
| Test | Expected |
|------|----------|
| German call | DE agent (Susi) handles fully, no transfer |
| English call | DE greets → detects EN → transfers to INTL (Juniper) → EN intake |
| French call | Same transfer → FR intake |
| Italian call | Same transfer → IT intake |

For each call check:
- Vercel Logs: `_tag:retell_webhook`, `event_type:call_analyzed`, `decision:created`
- Case in `/ops/cases` with correct German extraction
- Notification email delivered

## Constraints (from CLAUDE.md)

- Recording: OFF
- Max 7 questions per call
- Sanitär/Heizung only — polite rejection for other topics
- Categories: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein
- Urgency: notfall | dringend | normal (lowercase only)
- No PII in description
- max_call_duration_ms: 420000 (7 min)
- Post-call analysis: ALWAYS in German regardless of call language
- Webhook processes only `call_analyzed` events

## Privacy Note

`data_storage_setting` is set to `"everything"` (Retell default). For stricter privacy, change to `"none"` in Retell Dashboard after import.
