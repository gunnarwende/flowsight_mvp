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
  gen_retell_agents.mjs          # Generator script (produces all JSON files)
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

## Import Steps (Retell Dashboard)

**Import order matters: INTL first, then DE.**

### 1. Import INTL agent
- All Agents -> Import -> `exports/<slug>_agent_intl.json`
- Retell generates new agent_id
- Copy the agent_id

### 2. Update DE agent with INTL agent_id
- In `scripts/gen_retell_agents.mjs`: set `intl_agent_id` to the copied ID
- Re-run: `node scripts/gen_retell_agents.mjs`

### 3. Import DE agent
- All Agents -> Import -> `exports/<slug>_agent.json`
- Assign phone number to this agent
- Verify webhook URL on both agents
- Publish both agents

### 4. Verification
- Test call (German): full intake in German with Susi voice
- Test call (English): German greeting, then transfer to Juniper, English intake
- Test call (French): same transfer, French intake
- Test call (Italian): same transfer, Italian intake
- Check Vercel Logs: `_tag:retell_webhook, decision:created`
- Verify case appears in Supabase with correct German fields
- Check email notification delivered

## Constraints (from CLAUDE.md)

- Recording: OFF
- Max 7 questions per call
- Sanitär/Heizung only — polite rejection for other topics
- Categories: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein
- Urgency: notfall | dringend | normal (lowercase only)
- No PII in description
- max_call_duration_ms: 420000 (7 min)
- Post-call analysis: ALWAYS in German regardless of call language

## Privacy Note

`data_storage_setting` is set to `"everything"` (Retell default). For stricter privacy, change to `"none"` in Retell Dashboard after import.
