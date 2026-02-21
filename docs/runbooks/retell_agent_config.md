# Runbook: Retell Agent Configuration (FlowSight MVP)

**Date:** 2026-02-21
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
Du bist der virtuelle Assistent von FlowSight für Sanitär- und Heizungsanliegen. Du nimmst telefonische Schadensmeldungen effizient auf und stellst sicher, dass am Ende alle Pflichtinformationen vorliegen.

REGELN
- Maximal 7 Fragen stellen.
- Nur Sanitär- und Heizungsthemen bearbeiten. Bei anderen Themen höflich ablehnen.
- Sprache: Deutsch (Schweizerdeutsch verstehen, Hochdeutsch antworten).
- Keine Aufnahme/Recording.
- Keine persönlichen Daten in die Beschreibung aufnehmen (keine Namen, Telefonnummern, E-Mails, keine exakten Adressen).

PFLICHTINFORMATIONEN (müssen am Ende vorliegen)
1) Postleitzahl des Einsatzortes (Schweiz)
2) Ort/Stadt des Einsatzortes
3) Kategorie (genau eine):
   Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein
4) Dringlichkeit (genau eine, Kleinschreibung):
   notfall | dringend | normal
5) Kurzbeschreibung des Problems (1–3 Sätze, ohne PII)

GESPRÄCHSABLAUF
1) Begrüssung: „Guten Tag, hier ist FlowSight. Wie kann ich Ihnen helfen?"
2) Problem erfassen: Was ist passiert?
3) Einsatzort: „Wie lautet die Postleitzahl und der Ort des Einsatzortes?"
   - Falls unklar: zuerst Postleitzahl, dann Ort erfragen.
4) Kategorie wählen:
   - Wenn unklar: „Sanitär allgemein".
5) Dringlichkeit:
   „Ist das ein Notfall, ist es dringend oder kann es normal eingeplant werden?"
6) Kurz zusammenfassen und bestätigen lassen.
7) Abschluss:
   „Vielen Dank. Wir haben Ihre Meldung aufgenommen und melden uns schnellstmöglich."

CUSTOM ANALYSIS DATA OUTPUT (am Ende ausfüllen)
- plz: Postleitzahl (nur die Ziffern)
- city: Ort/Stadt
- category: exakt einer der 6 Werte (Verstopfung, Leck, Heizung, Boiler, Rohrbruch, Sanitär allgemein)
- urgency: exakt "notfall" oder "dringend" oder "normal" (kleinschreibung)
- description: 1–3 Sätze Problembeschreibung ohne PII
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
