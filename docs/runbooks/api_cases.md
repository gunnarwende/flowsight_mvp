# Runbook: POST /api/cases

**Date:** 2026-02-19
**Owner:** Head Ops Agent

## Endpoint

`POST /api/cases`

## Request

Content-Type: `application/json`

### Required fields (per case_contract.md)
- `source`: `"wizard"` | `"voice"`
- `contact_phone` or `contact_email` (at least one)
- `plz`: string
- `city`: string
- `category`: string
- `urgency`: `"notfall"` | `"dringend"` | `"normal"`
- `description`: string

### Optional fields
- `tenant_id`: uuid (defaults to `FALLBACK_TENANT_ID`)
- `photo_url`: string URL
- `raw_payload`: JSON object

## Curl Examples (no PII)

### Using canonical fields

```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{
    "source": "wizard",
    "contact_phone": "+41790000000",
    "plz": "8942",
    "city": "Oberrieden",
    "category": "Sanitär",
    "urgency": "normal",
    "description": "Test case from curl."
  }'
```

### Using shorthand aliases (phone, email, message)

```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{
    "source": "wizard",
    "phone": "+41790000000",
    "plz": "8942",
    "city": "Oberrieden",
    "category": "Sanitär",
    "urgency": "normal",
    "message": "Test case using aliases."
  }'
```

Aliases are normalized server-side before validation (see case_contract.md → API Input Normalization).

## Responses

| Status | Meaning |
|---|---|
| 201 | Case created. Body: `{ id, tenant_id, source, urgency, category, city, created_at }` |
| 400 | Validation error. Body: `{ error, missing_fields, allowed_values }` |
| 500 | Server error (Supabase or internal). Sentry event emitted. |

## Side Effects

- Inserts row into `cases` table (Supabase).
- Sends email notification via Resend (fire-and-forget; failure does not affect response).
- Sentry events on: insert error (`area:api, feature:cases`), email error (`area:email, provider:resend`).

## Related

- **Minimum payload examples + validation error shapes:** `docs/runbooks/api_cases_min_payload.md`

## Files

- Route: `src/web/app/api/cases/route.ts`
- Supabase client: `src/web/src/lib/supabase/server.ts`
- Email: `src/web/src/lib/email/resend.ts`
- Contract: `docs/architecture/contracts/case_contract.md`
