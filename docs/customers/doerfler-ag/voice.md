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

- **Mechanism**: AgentSwapTool on the DE Intake Node (real tool execution, not just spoken announcement)
- **Trigger (3-layer detection)**:
  1. **Keyword match** — explicit language tokens (english, englisch, français, italiano, etc.) → instant transfer
  2. **Plausibility check** — first utterance doesn't parse as German (ASR drift, e.g. "Hi, Herr Bend") → ask once "Sprechen Sie Deutsch?", if still no German → transfer
  3. **Mid-call request** — caller says language keyword at any point → instant transfer
- **Max transfers**: 1 per call (after transfer, DE agent is no longer involved)
- **Context**: Full conversation history carries over to INTL agent
- **Webhook**: `post_call_analysis_setting: only_destination_agent` — only INTL agent sends webhook (no duplicate)
- **Voice switch**: Susi (DE) → Juniper (INTL) — near-instant
- **Events**: only `call_analyzed` is processed by our webhook (call_started/call_ended ignored)

## Transfer Verification (Founder must test)

| Test scenario | Expected behavior | How to verify |
|---------------|-------------------|---------------|
| EN from start ("I have an emergency") | Transfer within first exchange, INTL agent continues in English | Retell call timeline shows `agent_transfer` event |
| DE call, mid-call "Englisch." | Transfer immediately, INTL agent continues in English | Retell call timeline shows `agent_transfer` event after DE turns |
| ASR drift (EN garbled to DE) | Agent asks "Sprechen Sie Deutsch?" once, then transfers | Call timeline: 1 clarification turn, then `agent_transfer` |
| No flip-flop | Only 1 transfer event in call timeline | Check Retell call detail: exactly 1 `agent_transfer` |

**Critical check**: After "Ich verbinde Sie" (or equivalent), the transfer MUST actually happen (tool execution). If the call just hangs/stalls after the announcement, the tool was not called — re-import with updated config.

## Privacy Defaults — DSGVO Checklist (Founder must configure in Retell UI)

### Mandatory before Live

- [ ] **Data Storage**: Both agents → Security & Fallback Settings → Data Storage = **"Everything except PII"** (config-as-code default is now `everything_except_pii`, but verify after import)
- [ ] **PII Redaction**: Both agents → Security & Fallback Settings → PII Redaction → Enable → configure categories:
  - [x] Person names
  - [x] Phone numbers
  - [x] Email addresses
  - [x] Physical addresses (street, house number)
  - [x] Postal codes / city names (if available)
  - [x] Free text with personal references
- [ ] **Recording**: OFF on both agents (CLAUDE.md constraint — verify toggle)
- [ ] **Data Retention**: If Retell offers retention settings → set to shortest available. If not configurable: document manual deletion cadence (quarterly review recommended, create calendar reminder)

### Optional — Ultra-Safe Debug Mode

For debugging transfer/ASR issues during testing:
1. Temporarily set Data Storage = "Everything" on the test agent
2. Run test calls, inspect full transcript + analysis
3. **MANDATORY**: Switch back to "Everything except PII" immediately after debugging
4. Delete test call data in Retell Dashboard

### Post-Import Verification

After every agent import, verify in Retell Dashboard:
- [ ] Data Storage = "Everything except PII"
- [ ] PII Redaction = enabled with categories above
- [ ] Recording = OFF
- [ ] Webhook URL = `https://flowsight-mvp.vercel.app/api/retell/webhook`
- [ ] Voice ID: DE = `v3V1d2rk6528UrLKRuy8` (Susi), INTL = `aMSt68OGf4xUZAnLpTU8` (Juniper)

## Notes

- Recording: OFF (CLAUDE.md constraint)
- Categories: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein
- Urgency: notfall | dringend | normal (Kleinschreibung)
- Post-call analysis: ALWAYS in German, regardless of call language
- data_storage_setting: `"everything_except_pii"` (config-as-code default)
