# Dörfler AG — Voice Agent Config

## Dual-Agent Setup (DE + INTL)

Two agents work together: the DE agent handles German calls, the INTL agent handles EN/FR/IT calls. When the DE agent detects a non-German speaker, it transfers the call via Retell Agent Transfer (near-instant, full context preserved).

### DE Agent (Primary)

| Key | Value |
|-----|-------|
| `agent_name` | Dörfler AG Intake (DE) |
| `business_name` | Dörfler AG |
| `greeting_text` | Guten Tag, hier ist der Sanitär- und Heizungsdienst der Dörfler AG. Wie kann ich Ihnen helfen? |
| `closing_text` | Danke, ich habe alles aufgenommen. Die Dörfler AG meldet sich bei Ihnen, um das weitere Vorgehen zu besprechen. |
| `voice_id` | v3V1d2rk6528UrLKRuy8 (ElevenLabs Susi) |
| `language` | de-DE |
| `webhook_url` | https://flowsight-mvp.vercel.app/api/retell/webhook |

### INTL Agent (Transfer Destination)

| Key | Value |
|-----|-------|
| `agent_name` | Dörfler AG Intake (INTL) |
| `business_name` | Dörfler AG |
| `closing_text` | Thank you, I've recorded everything. Dörfler AG will contact you to discuss the next steps. |
| `voice_id` | aMSt68OGf4xUZAnLpTU8 (ElevenLabs Juniper) |
| `language` | en-US |
| `webhook_url` | https://flowsight-mvp.vercel.app/api/retell/webhook |

## Post-Import Steps

### Step 1: Import INTL agent first
1. Retell Dashboard: All Agents -> Import -> `retell/exports/doerfler_agent_intl.json`
2. Copy the new agent_id from Retell Dashboard

### Step 2: Update DE agent with INTL agent_id
1. In `scripts/gen_retell_agents.mjs`: replace `REPLACE_WITH_INTL_AGENT_ID` with the INTL agent_id
2. Re-run: `node scripts/gen_retell_agents.mjs`
3. Import DE agent: `retell/exports/doerfler_agent.json`

### Step 3: Configure & Test
1. Assign phone number (Twilio CH: +41 44 505 74 20) to the **DE agent**
2. Verify webhook URL on both agents
3. Publish both agents
4. Test calls:
   - German call -> DE agent handles fully
   - English call -> DE agent transfers to INTL agent (seamless)
   - French call -> same transfer
   - Italian call -> same transfer
5. Check Vercel Logs: `_tag:retell_webhook, decision:created`

## Agent Transfer Details

- **Mechanism**: AgentSwapTool on the DE Intake Node
- **Trigger**: Caller speaks EN/FR/IT (auto-detected, no question asked)
- **Context**: Full conversation history carries over to INTL agent
- **Webhook**: `post_call_analysis_setting: only_destination_agent` — only INTL agent sends webhook (no duplicate)
- **Voice switch**: Susi (DE) -> Juniper (INTL) — near-instant

## Notes

- Recording: OFF (CLAUDE.md constraint)
- Categories: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein
- Urgency: notfall | dringend | normal (Kleinschreibung)
- Post-call analysis: ALWAYS in German, regardless of call language
- data_storage_setting: "everything" (bei Datenschutz-Anforderung auf "none" setzen)
