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

## Founder Checklist — Import & Go-Live

### Step 1: Import INTL agent
1. Retell Dashboard → All Agents → Import → `retell/exports/doerfler_agent_intl.json`
2. Publish the INTL agent
3. Copy its `agent_id` from the Retell Dashboard

### Step 2: Wire DE agent → INTL agent

**Preferred (UI):** Import DE agent first, then set swap target in Retell:
1. Import `retell/exports/doerfler_agent.json` → Retell creates agent
2. Open DE agent → Conversation Flow → Intake Node → Tools → `swap_to_intl_agent`
3. Set the `agent_id` field to the INTL agent_id from Step 1
4. Save + Publish

**Fallback (CLI patcher):** Pre-wire before import:
```bash
node scripts/patch_retell_agent_ids.mjs \
  --in  retell/exports/doerfler_agent.json \
  --out retell/exports/doerfler_agent_patched.json \
  --intl <INTL_AGENT_ID>
```
Then import `doerfler_agent_patched.json` (do NOT commit patched file).

### Step 3: Configure
1. Assign phone number (Twilio CH: +41 44 505 74 20) to the **DE agent**
2. Verify webhook URL on both agents: `https://flowsight-mvp.vercel.app/api/retell/webhook`
3. Ensure both agents are published

### Step 4: Test calls
| Test | Expected |
|------|----------|
| German call | DE agent (Susi) handles fully, no transfer |
| English call | DE agent greets → detects EN → transfers to INTL (Juniper) → EN intake |
| French call | Same transfer → FR intake |
| Italian call | Same transfer → IT intake |

For each call verify:
- Vercel Logs: `_tag:retell_webhook`, `event_type:call_analyzed`, `decision:created`
- Case appears in `/ops/cases` with correct German extraction (plz, city, category, urgency)
- Notification email delivered

## Agent Transfer Details

- **Mechanism**: AgentSwapTool on the DE Intake Node
- **Trigger**: Caller speaks EN/FR/IT (auto-detected, no question asked)
- **Context**: Full conversation history carries over to INTL agent
- **Webhook**: `post_call_analysis_setting: only_destination_agent` — only INTL agent sends webhook (no duplicate)
- **Voice switch**: Susi (DE) → Juniper (INTL) — near-instant
- **Events**: only `call_analyzed` is processed by our webhook (call_started/call_ended ignored)

## Notes

- Recording: OFF (CLAUDE.md constraint)
- Categories: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein
- Urgency: notfall | dringend | normal (Kleinschreibung)
- Post-call analysis: ALWAYS in German, regardless of call language
- data_storage_setting: "everything" (bei Datenschutz-Anforderung auf "none" setzen)
