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

## Optional Fields
- photo_url (string URL)
- raw_payload (json) — optional, nur für Debugging (sparsam)

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
