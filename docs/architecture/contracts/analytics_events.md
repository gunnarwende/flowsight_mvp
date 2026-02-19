# Analytics Event Names (SSOT)

**Date:** 2026-02-19
**Owner:** Analytics Agent
**Status:** Defined (not yet implemented in UI)

## Event Catalog

| Event Name | Source | Trigger | Implemented |
|---|---|---|---|
| `wizard_started` | Wizard UI | User opens wizard form | No (Welle 3) |
| `wizard_submitted` | Wizard UI | User submits wizard form | No (Welle 3) |
| `case_created` | API (/api/cases) | Case inserted into Supabase | No (emit in route) |
| `voice_call_started` | Webhook | Retell `call_started` event received | No (webhook acks only) |
| `voice_case_created` | Webhook | Voice call → case inserted | No (emit in webhook) |

## Notes

- Events are names only at this stage. No UI, no dashboard, no tracking SDK.
- Implementation will use Sentry breadcrumbs / custom events or a future analytics provider.
- All events must include `tenant_id` as a required attribute when implemented.
