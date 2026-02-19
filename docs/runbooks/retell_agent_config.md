# Runbook: Retell Agent Configuration (FlowSight MVP)

**Date:** 2026-02-19
**Owner:** Head Ops Agent

## Prerequisites

- Retell account with agent created
- RETELL_AGENT_ID set in Vercel Env + .env.local
- Webhook URL: `https://flowsight-mvp.vercel.app/api/retell/webhook`

## 1. Webhook Configuration

In Retell Dashboard → Agent → Settings:

- **Webhook URL:** `https://flowsight-mvp.vercel.app/api/retell/webhook`
- **Webhook Events:** Enable `call_ended` and `call_analyzed`
- **Recording:** OFF (CLAUDE.md constraint)

## 2. Custom Analysis Data Schema

In Retell Dashboard → Agent → Post-Call Analysis → Custom Analysis Data:

Add these fields **exactly as named** (the webhook handler accepts both EN and DE aliases, but EN is canonical):

| Field | Type | Required | Description |
|---|---|---|---|
| `plz` | string | yes | Postleitzahl des Einsatzortes (4-stellig CH) |
| `city` | string | yes | Ort / Stadt des Einsatzortes |
| `category` | string | yes | Kategorie des Schadens (z.B. "Verstopfung", "Leck", "Heizung", "Boiler", "Rohrbruch", "Sanitär allgemein") |
| `urgency` | string | yes | Dringlichkeit — MUSS einer von: `notfall`, `dringend`, `normal` sein |
| `description` | string | yes | Kurzbeschreibung des Problems (1–3 Sätze) |

## 3. Agent Prompt (System Instructions)

Copy this into the Retell Agent "System Prompt" / "Instructions" field:

---

```
Du bist der virtuelle Assistent von FlowSight, einem Sanitär- und Heizungs-Notdienst. Du nimmst telefonische Schadensmeldungen entgegen.

REGELN:
- Maximal 7 Fragen stellen.
- Nur sanitär- und heizungsspezifische Anliegen bearbeiten. Bei anderen Themen höflich ablehnen.
- Keine Aufnahme / Recording (ist deaktiviert).
- Sprache: Deutsch (Schweizerdeutsch verstehen, Hochdeutsch antworten).
- Sei freundlich, professionell und effizient.

PFLICHTINFORMATIONEN (alle müssen am Ende vorliegen):
1. PLZ des Einsatzortes (4-stellige Schweizer Postleitzahl)
2. Ort / Stadt
3. Kategorie: Verstopfung, Leck, Heizung, Boiler, Rohrbruch, oder Sanitär allgemein
4. Dringlichkeit: Frage, ob es ein Notfall ist, ob es dringend ist, oder ob es normal warten kann.
   → Setze urgency auf genau einen Wert: "notfall", "dringend", oder "normal"
5. Kurze Beschreibung des Problems (1–3 Sätze)

GESPRÄCHSABLAUF:
1. Begrüssung: "Guten Tag, hier ist der FlowSight Sanitär-Notdienst. Wie kann ich Ihnen helfen?"
2. Problem erfassen: Was ist passiert?
3. Ort erfassen: "In welcher Gemeinde / PLZ befindet sich der Einsatzort?"
4. Dringlichkeit: "Handelt es sich um einen Notfall, ist es dringend, oder kann es normal eingeplant werden?"
5. Zusammenfassung: Wiederhole die erfassten Daten und frage, ob alles stimmt.
6. Abschluss: "Vielen Dank. Wir haben Ihre Meldung aufgenommen und melden uns schnellstmöglich."

CUSTOM ANALYSIS DATA OUTPUT:
Am Ende des Gesprächs fülle folgende Felder aus:
- plz: Die 4-stellige Postleitzahl
- city: Der Ortsname
- category: Eine der Kategorien (Verstopfung, Leck, Heizung, Boiler, Rohrbruch, Sanitär allgemein)
- urgency: Genau "notfall", "dringend", oder "normal" (Kleinschreibung, kein anderer Wert)
- description: Kurzbeschreibung des Problems in 1–3 Sätzen
```

---

## 4. Verification

After configuring:

1. Make a test call to +41 44 505 74 20
2. Check Vercel Function Logs for:
   ```
   {"_tag":"retell_webhook","decision":"created","call_id":"...","case_id":"..."}
   ```
3. Run: `node --env-file=src/web/.env.local scripts/_ops/verify_voice_pipeline.mjs`
4. Expect: cases found > 0

If you see `decision: "missing_fields"` in Vercel logs, check which fields are in `missing_fields[]` and adjust the Retell agent prompt/schema.

## Allowed urgency values

The webhook handler **only** accepts these exact strings (lowercase):
- `notfall`
- `dringend`
- `normal`

Any other value (e.g., "Notfall", "NOTFALL", "emergency") will be rejected as invalid.

## Allowed category values

Currently free-text. Recommended values for sanitär:
- Verstopfung
- Leck
- Heizung
- Boiler
- Rohrbruch
- Sanitär allgemein
