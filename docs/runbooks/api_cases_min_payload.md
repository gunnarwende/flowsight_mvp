# Runbook: Minimum Passing Payloads for POST /api/cases

**Date:** 2026-02-19
**Owner:** Head Ops Agent

## Prerequisites

- Dev server running: `cd src/web && npm run dev`
- `FALLBACK_TENANT_ID` set in `.env.local`
- Supabase keys configured

## Example 1: Canonical fields

```bash
curl -s -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{
    "source": "wizard",
    "contact_phone": "+41790000000",
    "plz": "8942",
    "city": "Oberrieden",
    "category": "Sanitär",
    "urgency": "normal",
    "description": "Tropfender Wasserhahn in der Küche."
  }'
```

Expected 201:
```json
{
  "id": "<uuid>",
  "tenant_id": "<fallback-uuid>",
  "source": "wizard",
  "urgency": "normal",
  "category": "Sanitär",
  "city": "Oberrieden",
  "created_at": "2026-..."
}
```

## Example 2: Shorthand aliases

```bash
curl -s -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{
    "source": "wizard",
    "phone": "+41790000000",
    "plz": "8942",
    "city": "Oberrieden",
    "category": "Sanitär",
    "urgency": "normal",
    "message": "Tropfender Wasserhahn in der Küche."
  }'
```

Same 201 response — `phone` → `contact_phone`, `message` → `description` normalized server-side.

## Example 3: Validation failure (empty body)

```bash
curl -s -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected 400:
```json
{
  "error": "Missing or invalid fields: source, contact_phone/contact_email, plz, city, category, description, urgency. Aliases accepted: phone→contact_phone, email→contact_email, message→description.",
  "missing_fields": ["source", "contact_phone/contact_email", "plz", "city", "category", "description", "urgency"],
  "allowed_values": {
    "source": ["wizard", "voice"],
    "urgency": ["notfall", "dringend", "normal"]
  }
}
```

## Required fields summary

| Field | Type | Aliases | Notes |
|---|---|---|---|
| `source` | `"wizard"` \| `"voice"` | — | |
| `contact_phone` or `contact_email` | string | `phone`, `email` | At least one required |
| `plz` | string | — | Swiss postal code |
| `city` | string | — | |
| `category` | string | — | e.g. "Sanitär", "Heizung" |
| `urgency` | `"notfall"` \| `"dringend"` \| `"normal"` | — | |
| `description` | string | `message` | Free text |

## Files

- Route: `src/web/app/api/cases/route.ts`
- Contract: `docs/architecture/contracts/case_contract.md`
- Full runbook: `docs/runbooks/api_cases.md`
