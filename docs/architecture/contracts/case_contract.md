# Case Contract (SSOT) — darf nicht driften

Diese Datei definiert die SSOT-Form des Case-Objekts. Alle Producer (Wizard/Voice) und Consumer (Email/Analytics) müssen exakt daran ausrichten.

## Required Fields
- tenant_id (uuid)
- source ("wizard" | "voice")
- created_at (timestamp)
- contact_phone OR contact_email (mindestens eins)
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
- photo_url (string URL)
- raw_payload (json) — optional, nur für Debugging (sparsam)

## Ops-managed Fields (Welle 5)

These fields are written ONLY by the Ops UI/API — Producers (wizard, voice) never set them.
They are not part of the case creation contract; they exist for workflow management.

- status (text, default "new") — allowed: "new" | "contacted" | "scheduled" | "done"
- assignee_text (text, nullable) — free text, e.g. operator name
- scheduled_at (timestamptz, nullable) — when the job is scheduled
- internal_notes (text, nullable) — private notes, never exposed to customers
- updated_at (timestamptz, auto) — auto-updated on every row change via DB trigger
- review_sent_at (timestamptz, nullable) — set when review request email is sent

## Ops-editable Producer Fields (W10)

These fields are set by Producers but can also be updated by Ops:
- contact_email (text, nullable) — Ops can add/update after callback

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
  "plz": "8600",
  "city": "Dübendorf",
  "category": "Heizung",
  "urgency": "notfall",
  "description": "Rohrbruch im Keller, Wasser läuft.",
  "photo_url": null,
  "raw_payload": { "provider": "retell" }
}
