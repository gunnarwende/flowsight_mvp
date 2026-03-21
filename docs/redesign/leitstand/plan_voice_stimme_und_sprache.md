# Voice Agent — Stimme + Sprach-Switch Plan

**Version:** 1.0 | **Datum:** 2026-03-21
**Status:** Umsetzung
**Pfad:** `docs/redesign/leitstand/plan_voice_stimme_und_sprache.md`

---

## Problem

Juniper (custom_voice_cf152ba48ccbac0370ecebcd88) ist aktuell auf ALLEN DE + INTL Agents.
Juniper hat einen **harten englischen Akzent** wenn sie Deutsch spricht → maximal nervig für Schweizer Anrufer (80% der Fälle).

## Lösung

### 1. Neue Stimme für DE Agents

| Agent-Typ | Stimme | Voice ID | Sprache |
|-----------|--------|----------|---------|
| **DE (alle Tenants)** | Laura (ElevenLabs) — Sharp and Professional | `zKHQdbB8oaQ7roNTiDTK` | Deutsch |
| **INTL (alle Tenants)** | Juniper (Retell Custom) — bleibt | `custom_voice_cf152ba48ccbac0370ecebcd88` | EN/FR/IT |
| **Sales DE** | Ela (Retell Custom) — bleibt | `custom_voice_3209d3305910d955836523bfac` | Deutsch |

### 2. Language Gate (bereits vorhanden, prüfen)

**Aktuell:** DE Agent hat `node-language-gate` mit Edge-Condition:
```
"The caller's latest message contains a non-German language keyword
(english, englisch, français, italiano, hello, bonjour, please, help,
I have, I need, can you, do you speak, j'ai, buongiorno, per favore),
is clearly not in German, or is garbled/nonsensical"
```

**Das ist gut.** Der Gate erkennt:
- Nicht-deutsche Sprache am Anfang
- Keywords wie "hello", "bonjour", "per favore"
- Garbled/nonsensical (wenn STT Schweizerdeutsch nicht versteht → NICHT als fremd werten!)

**Anpassung nötig:** Mid-Conversation Switch muss auch funktionieren. Aktuell gibt es einen `edge-language-trigger` auf dem Main Conversation Node. Das bedeutet: der Switch kann JEDERZEIT passieren, nicht nur am Anfang. ✅

### 3. Kontext-Erhaltung beim Switch

**Retell Transfer-Tool:** `swap_to_intl_agent` übergibt den bisherigen Gesprächskontext automatisch. Der INTL Agent sieht den Transcript des DE-Gesprächs. ✅

**Rückswitch:** INTL Agent hat `swap_to_de_agent` Tool. Gleicher Mechanismus. ✅

### 4. Schweizerdeutsch-Handling

Laura (ElevenLabs) spricht Hochdeutsch. Retell STT muss Schweizerdeutsch transkribieren.
- `language: "de-DE"` auf DE Agents (Retell nutzt eigenes STT)
- Schweizerdeutsche Wörter wie "Grüezi", "Tschüss", "Härd" werden von Retell STT als Hochdeutsch transkribiert
- Agent antwortet IMMER auf Hochdeutsch (Prompt: "Du sprichst AUSSCHLIESSLICH Deutsch")

---

## Umsetzung

### Schritt 1: Voice ID ändern in allen DE Agent JSONs
Betroffene Dateien (4 DE Agents):
- `retell/exports/brunner_agent.json`
- `retell/exports/doerfler_agent.json`
- `retell/exports/weinberger-ag_agent.json`
- `retell/exports/walter-leuthold_agent.json`

Änderung: `voice_id` von `custom_voice_cf152ba48ccbac0370ecebcd88` → `zKHQdbB8oaQ7roNTiDTK`

INTL Agents: KEINE Änderung (bleiben auf Juniper).
Sales DE: KEINE Änderung (bleibt auf Ela).

### Schritt 2: ElevenLabs Voice Provider in Retell

Retell unterstützt ElevenLabs Voices nativ. Die Voice ID `zKHQdbB8oaQ7roNTiDTK` wird direkt im Agent JSON gesetzt. Retell routet automatisch an ElevenLabs TTS.

**Voraussetzung:** ELEVENLABS_API_KEY muss ggf. in Retell Dashboard konfiguriert sein (oder die Voice ist über Retell's Voice Library zugänglich).

### Schritt 3: Agents syncen + publishen
```bash
node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs --prefix brunner
node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs --prefix doerfler
node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs --prefix weinberger-ag
node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs --prefix walter-leuthold
```

### Schritt 4: Founder-Test
- Deutsch anrufen → Laura antwortet (kein englischer Akzent)
- Schweizerdeutsch sprechen → Agent versteht, antwortet Hochdeutsch
- "Can you speak English?" → Switch zu INTL (Juniper)
- 15 Sek Englisch → "Können wir wieder auf Deutsch wechseln?" → Switch zurück
- Kontext prüfen: Was auf Deutsch gesagt wurde, ist nach EN-Switch noch bekannt

---

## Founder-Tasks (BLOCKER)

| # | Task | Wann | Status |
|---|------|------|--------|
| F1 | **ElevenLabs API Key in Retell Dashboard hinterlegen** | VOR Sync — Retell Dashboard → Settings → Voice Provider → ElevenLabs → API Key eintragen. Ohne diesen Key kennt Retell die Voice ID `zKHQdbB8oaQ7roNTiDTK` nicht. | **BLOCKER** — Sync schlägt fehl mit "Item not found from voice" |
| F2 | **Test-Anrufe** nach Sync | NACH Deploy | OFFEN |

### Ergebnis des ersten Sync-Versuchs (21.03.)
```
FATAL: PATCH /update-agent/agent_47deec4bdc891126de71dd42be → 404:
{"status":"error","message":"Item zKHQdbB8oaQ7roNTiDTK not found from voice"}
```
→ Voice IDs zurückgesetzt auf Juniper. Agents laufen weiter wie bisher.
→ Sobald F1 erledigt: CC setzt Voice IDs und synct erneut.

---

## Risiken

1. **Laura klingt anders als Juniper** → Founder muss Ton bewerten
2. **ElevenLabs Latenz** → Retell → ElevenLabs TTS könnte 100-200ms langsamer sein als Retell-native Voices
3. **Schweizerdeutsch STT** → Retell STT ist gut mit de-DE, aber starker Dialekt könnte Probleme machen
4. **Gesprächsfluss:** Keine Änderungen am Flow — nur Stimme. Wenn Laura unpassend klingt, kann schnell zurückgewechselt werden.
