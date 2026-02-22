# Dörfler AG — Voice Agent Config

## Customer Parameters

| Key | Value |
|-----|-------|
| `agent_name` | Dörfler AG Intake |
| `business_name` | Dörfler AG |
| `greeting_text` | Guten Tag, hier ist der Sanitär- und Heizungsdienst der Dörfler AG. Wie kann ich Ihnen helfen? |
| `closing_text` | Danke, ich habe alles aufgenommen. Die Dörfler AG meldet sich bei Ihnen, um das weitere Vorgehen zu besprechen. |
| `voice_id` | minimax-Max |
| `webhook_url` | https://flowsight-mvp.vercel.app/api/retell/webhook |

## Post-Import UI Steps

1. Retell Dashboard: All Agents -> Import -> `retell/exports/doerfler_agent.json`
2. Telefonnummer zuweisen (Twilio CH: +41 44 505 74 20)
3. Webhook URL verifizieren (muss mit Wert oben übereinstimmen)
4. Agent publishen
5. Testcall machen -> Vercel Logs prüfen auf `_tag:retell_webhook, decision:created`

## Notes

- Recording: OFF (CLAUDE.md constraint)
- Kategorien: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein
- Dringlichkeit: notfall | dringend | normal (Kleinschreibung)
- data_storage_setting: "everything" (Retell default — bei Datenschutz-Anforderung auf "none" setzen)
