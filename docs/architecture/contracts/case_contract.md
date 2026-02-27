# Case Contract (SSOT) — darf nicht driften

Diese Datei definiert die SSOT-Form des Case-Objekts. Alle Producer (Wizard/Voice) und Consumer (Email/Analytics) müssen exakt daran ausrichten.

## Required Fields
- tenant_id (uuid)
- source ("wizard" | "voice" | "manual")
- created_at (timestamp)
- contact_phone OR contact_email (mindestens eins)
- street (string) — required for wizard, optional for voice + manual
- house_number (string) — required for wizard, optional for voice + manual
- plz (string)
- city (string)
- category (string)
- urgency ("notfall" | "dringend" | "normal")
- description (string)

## API Input Normalization

The POST /api/cases endpoint accepts these shorthand aliases. They are normalized to canonical fields before validation; the DB schema is unchanged.

| Alias | Canonical Field |
|---|---|
| `phone` | `contact_phone` |
| `email` | `contact_email` |
| `message` | `description` |

Canonical fields always take priority — if both `phone` and `contact_phone` are sent, `contact_phone` wins.

## Optional Fields (Producer)
- reporter_name (text, nullable) — extracted by voice agent, optional for wizard + manual, editable by ops
- photo_url (string URL)
- raw_payload (json) — optional, nur für Debugging (sparsam)

## System-managed Fields (read-only)
- seq_number (integer) — auto-assigned per tenant via DB trigger. Display: `FS-0001`, `FS-0002`, etc.

## Address Fields — Source-dependent Validation

| Field | Wizard | Voice | Manual | Ops |
|-------|--------|-------|--------|-----|
| street | required | best-effort | optional | editable |
| house_number | required | best-effort | optional | editable |
| plz | required | required | required | read-only |
| city | required | required | required | read-only |

DB columns are nullable (old rows + voice cases without address). Application-layer validation enforces requirements per source.

## Ops-managed Fields (Welle 5)

These fields are written ONLY by the Ops UI/API — Producers (wizard, voice) never set them.
They are not part of the case creation contract; they exist for workflow management.

- status (text, default "new") — allowed: "new" | "contacted" | "scheduled" | "done"
- assignee_text (text, nullable) — free text, e.g. operator name
- scheduled_at (timestamptz, nullable) — when the job is scheduled
- internal_notes (text, nullable) — private notes, never exposed to customers
- updated_at (timestamptz, auto) — auto-updated on every row change via DB trigger
- review_sent_at (timestamptz, nullable) — set when review request email is sent

## Case Events (Audit Log / Timeline)

Table: `case_events` — append-only log of case lifecycle events.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| case_id | uuid | FK → cases(id) ON DELETE CASCADE |
| event_type | text | See below |
| title | text | Human-readable event description (German) |
| detail | text | Optional additional detail |
| metadata | jsonb | Structured data (source, user_id, etc.) |
| created_at | timestamptz | Auto-set |

Event types:
- `case_created` — Case inserted (via wizard, voice, or manual)
- `status_changed` — Status updated by ops (metadata: from, to, user_id)
- `email_notification_sent` — Notification email sent to business
- `reporter_confirmation_sent` — Confirmation email sent to reporter
- `invite_sent` — Calendar invite sent
- `review_requested` — Review request email sent
- `fields_updated` — Ops fields updated (metadata: fields, user_id)

## Ops-editable Producer Fields (W10+)

These fields are set by Producers but can also be updated by Ops:
- contact_email (text, nullable) — Ops can add/update after callback
- street (text, nullable) — Ops can add/update after callback
- house_number (text, nullable) — Ops can add/update after callback

## Urgency Regeln (deterministisch)
Wenn description (oder voice answers/transcript) einen Notfall-Trigger enthält → urgency="notfall".
Sonst wenn eindeutige Dringlichkeits-Signale → urgency="dringend".
Sonst → urgency="normal".

### Notfall Trigger (Beispiele)
- "Wasserschaden", "Rohrbruch", "Wasser läuft", "Überschwemmung"
- "Gas", "Gasgeruch"
- "Brand", "Rauch"

### Dringend Signale (Beispiele)
- "heute", "sofort", "dringend", "kann nicht warten"
- "kein warmes Wasser", "Heizung geht nicht" (ohne klare Gefahr)

## Examples

### Wizard Example (normalized)
{
  "tenant_id": "UUID",
  "source": "wizard",
  "created_at": "2026-02-18T10:00:00Z",
  "contact_phone": "+4179...",
  "contact_email": null,
  "street": "Bahnhofstrasse",
  "house_number": "12",
  "plz": "8000",
  "city": "Zürich",
  "category": "Sanitär",
  "urgency": "dringend",
  "description": "Kein warmes Wasser seit heute Morgen.",
  "photo_url": null
}

### Voice Example (normalized)
{
  "tenant_id": "UUID",
  "source": "voice",
  "created_at": "2026-02-18T10:05:00Z",
  "contact_phone": "+4179...",
  "contact_email": null,
  "street": "Seestrasse",
  "house_number": "45",
  "plz": "8600",
  "city": "Dübendorf",
  "category": "Heizung",
  "urgency": "notfall",
  "description": "Rohrbruch im Keller, Wasser läuft.",
  "photo_url": null,
  "raw_payload": { "provider": "retell" }
}
