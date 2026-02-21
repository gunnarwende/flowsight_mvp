# Retell Voice Agent — Agent-as-File

## File Structure

```
retell/
  agent_template.json          # Neutral template with {{placeholders}}
  exports/
    doerfler_agent.json         # Ready-to-import instance for Dörfler AG
  README.md                     # This file
docs/customers/<slug>/voice.md  # Per-customer voice config (placeholder values)
```

## Template Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{agent_name}}` | Agent display name in Retell | Dörfler AG Intake |
| `{{business_name}}` | Business name in prompts + greeting | Dörfler AG |
| `{{greeting_text}}` | Welcome node spoken text | Guten Tag, hier ist der Sanitär-... |
| `{{closing_text}}` | Closing node spoken text | Vielen Dank. Die Dörfler AG hat... |
| `{{voice_id}}` | Retell TTS voice | minimax-Cimo |
| `{{webhook_url}}` | FlowSight webhook endpoint | https://flowsight-mvp.vercel.app/api/retell/webhook |

## Creating a New Customer Agent

1. Copy `docs/customers/doerfler-ag/voice.md` to `docs/customers/<new-slug>/voice.md`
2. Fill in customer-specific values
3. Copy `agent_template.json`, replace all `{{placeholders}}` with values from voice.md
4. Save as `exports/<slug>_agent.json`
5. Import in Retell (see below)

## Import Steps (Retell Dashboard)

1. **All Agents -> Import** -> select the `exports/<slug>_agent.json` file
2. Retell generates new agent_id + conversation_flow_id automatically
3. **Post-import UI steps (mandatory):**
   - Assign phone number (Twilio CH number for this customer)
   - Verify webhook URL matches the export
   - Review conversation flow visually (nodes + edges should be intact)
   - **Publish** the agent
4. **Verification:**
   - Make a test call to the assigned number
   - Check Vercel Function Logs: `_tag:retell_webhook, decision:created`
   - Verify case appears in Supabase with correct fields
   - Check email notification delivered

## Constraints (from CLAUDE.md)

- Recording: OFF
- Max 7 questions per call
- Sanitär/Heizung only — polite rejection for other topics
- Categories: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein
- Urgency: notfall | dringend | normal (lowercase only)
- No PII in description (no names, phones, emails, addresses)
- max_call_duration_ms: 420000 (7 min)

## Privacy Note

`data_storage_setting` is set to `"everything"` (Retell default). This means Retell stores call transcripts and audio. For stricter privacy requirements, change to `"none"` in the Retell Dashboard after import.
