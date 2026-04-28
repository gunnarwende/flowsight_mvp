# Voice Agent — Lessons Learned

**Erstellt:** 2026-04-10
**Letzte Aktualisierung:** 2026-04-10
**Zweck:** Alle hart erarbeiteten Erkenntnisse zu Retell Voice Agents. Muss VOR jeder Agent-Erstellung gelesen werden.

---

## Kritische Architektur-Regeln

### R1: `is_transfer_cf` muss beim ERSTELLEN des Flows gesetzt werden

**Problem:** Flows die als `is_transfer_cf: false` erstellt werden, können NICHT nachträglich auf `true` gepatcht werden. Die Retell API ignoriert den PATCH.

**Konsequenz:** INTL→DE Rückswitch scheitert → `agent_hangup` → Kunde wird aufgelegt.

**Lösung:** Wenn ein Flow Transfers empfangen soll (z.B. DE Flow empfängt Rückswitch von INTL), MUSS der Flow gelöscht und mit `is_transfer_cf: true` NEU erstellt werden.

**Ablauf bei Neuerstellung:**
1. Flow löschen (`DELETE /delete-conversation-flow/{id}`)
2. Flow neu erstellen (`POST /create-conversation-flow` mit `is_transfer_cf: true`)
3. Agent löschen (`DELETE /delete-agent/{id}`) — Agent Version >0 kann Flow nicht wechseln
4. Agent neu erstellen (`POST /create-agent` mit neuem Flow)
5. Telefonnummer zuordnen (`PATCH /update-phone-number/{phone}` mit `inbound_agent_id`)
6. Cross-Link Swap Tools (`retell_sync.mjs`)
7. Publishen

**WICHTIG:** Beim Löschen/Neuerstellen gehen ALLE Telefonnummer-Zuordnungen verloren. Immer danach prüfen!

### R2: Agent-Version >0 kann den Flow nicht wechseln

**Problem:** `PATCH /update-agent` mit neuer `conversation_flow_id` gibt 400 zurück: "Cannot update response engine of agent version > 0".

**Lösung:** Agent löschen und neu erstellen (siehe R1).

### R3: Telefonnummer-Zuordnung = `inbound_agent_id` (nicht `agent_id`)

**Problem:** `PATCH /update-phone-number/{phone}` mit `{ agent_id: "..." }` gibt 200 zurück aber ändert NICHTS.

**Richtig:** `{ inbound_agent_id: "agent_xxx" }` — das ist das korrekte Feld.

**Prüfen:** `GET /list-phone-numbers` — das Feld `inbound_agent_id` muss gesetzt sein.

### R4: `is_published` ist NICHT zuverlässig

**Problem:** `GET /get-agent` zeigt `is_published: false` selbst direkt nach `POST /publish-agent` (200 OK). Der Agent funktioniert trotzdem.

**Konsequenz:** Nicht auf `is_published` vertrauen. Stattdessen: Testanruf machen.

### R5: Alle 4 Nummern nach JEDER Agent-Neuerststellung prüfen

**Problem:** Das Löschen eines Agents entfernt die Telefonnummer-Zuordnung — auch für andere Tenants auf demselben Retell-Account.

**Checkliste nach jeder Neuerststellung:**
```
+41 44 505 74 20 → Dörfler AG
+41 44 505 48 18 → Brunner Haustechnik
+41 43 505 11 01 → Weinberger AG
+41 44 505 30 19 → Walter Leuthold
```

---

## Sprachwechsel-Regeln

### S1: DE Agent spricht NUR Deutsch. KEINE AUSNAHMEN.

**Problem (mehrfach aufgetreten):** DE Agent antwortet auf Englisch ("Hello! My name is Lisa...") statt zu transferieren. LLM ignoriert Prompt-Anweisungen.

**Lösung:** Prompt enthält jetzt VERBOTEN-Liste mit konkreten Negativbeispielen:
- VERBOTEN: "Hello! My name is Lisa"
- VERBOTEN: "I understand, no problem"
- VERBOTEN: "Of course, we can continue in English"

### S2: Jeder Agent sagt Brückensatz NUR in SEINER Sprache

**Problem:** INTL Agent (Juniper/Englisch) sagt "Natürlich, einen Moment" auf Deutsch → grässlicher Akzent.

**Regel:**
- DE Agent → "Natürlich, einen Moment bitte." (Deutsch, Ela-Stimme)
- INTL Agent bei EN → "Of course, one moment please." (Englisch, Juniper-Stimme)
- INTL Agent bei FR → "Bien sûr, un instant." (Französisch, Juniper-Stimme)
- INTL Agent bei IT → "Certo, un momento." (Italienisch, Juniper-Stimme)

**NIE die Zielsprache sprechen. Immer die aktuelle Sprache.**

### S3: INTL→DE Rückswitch braucht `is_transfer_cf: true` auf dem DE Flow

Siehe R1. Ohne das: `agent_hangup` bei jedem Rückswitch.

### S4: Language Gate Keywords müssen BEIDE Formen enthalten

**Problem:** Keyword-Liste hatte `italiano` aber nicht `italienisch` (deutsches Wort). "Sprechen Sie italienisch?" wurde nicht erkannt.

**Regel:** Immer BEIDE Formen: Fremdsprachiges Wort + deutsches Wort.
- `italiano` + `italienisch`
- `français` + `französisch`
- `english` + `englisch`
- Plus: `si si`, `parli`, `parlo`, `aiuto`, `aidez-moi`, `per favore`, etc.

### S5: Transfer-Dauer ~5-15 Sekunden ist normal

Retell Agent Swap ist KEIN sofortiger Switch. Es dauert 5-15 Sekunden. Während dieser Zeit: Stille. Das ist technisch bedingt und aktuell nicht verbesserbar.

---

## Intake-Regeln

### I1: Out-of-scope darf NICHT bei laufendem Intake feuern

**Problem:** Caller fragt "Können Sie meine Steuererklärung machen?" → Agent setzt `out_of_scope=true` → legt auf. Obwohl ein Rohrbruch-Intake läuft.

**Lösung:** Edge-Condition: "out_of_scope MUST remain false if ANY plumbing/heating data has been collected (category, address, PLZ, description)."

### I2: Themenfremde Fragen → deflektieren + weiter

**Antwort:** "Nein, dafür sind wir leider nicht zuständig. Aber zurück zu Ihrem Anliegen:" → nächste fehlende Frage stellen. NICHT end_call. NICHT "Auf Wiederhören".

### I3: NACH dem Farewell muss der Agent neue Fragen erkennen

**Problem:** Caller sagt "Danke, aber noch eine Rückfrage..." → Agent sagt "Auf Wiederhören" und legt auf.

**Lösung:** Unterscheidung:
- A) NUR "Danke"/"Tschüss" → end_call
- B) "Danke, ABER..." / neue Frage → NICHT auflegen, Frage bearbeiten

**Entscheidungsregel:** Wenn die Nachricht MEHR enthält als ein einfaches Danke/Tschüss → Fall B.

---

## Monitoring-Lücke: `agent_hangup` wird nicht erkannt

### Problem

Wenn der Agent aufgrund eines Bugs auflegt (`disconnection_reason: agent_hangup`), bekommt weder der Founder noch der Betrieb das mit. Der Kunde erlebt: "Die haben aufgelegt." Schlimmster Fall für das Image.

### Aktuelles Tracking

- `disconnection_reason` ist im Retell Call-Objekt verfügbar
- Morning Report trackt das NICHT
- Webhook `call_analyzed` liefert die Info, aber wir loggen sie nicht prominent

### TODO (priorisieren!)

- [ ] Morning Report: `agent_hangup` Calls mit Duration <120s als RED flaggen
- [ ] Webhook: Bei `agent_hangup` + Duration <60s → Telegram-Alert an Founder
- [ ] Wöchentlich: Agent-Hangup-Rate pro Tenant im CEO-Dashboard

---

## Retell API Quickref

| Operation | Endpoint | Methode | Wichtig |
|-----------|----------|---------|---------|
| Agent erstellen | `/create-agent` | POST | `response_engine.conversation_flow_id` muss gesetzt sein |
| Agent updaten | `/update-agent/{id}` | PATCH | Flow kann NICHT gewechselt werden bei Version >0 |
| Agent löschen | `/delete-agent/{id}` | DELETE | Löscht auch Telefonnummer-Zuordnung! |
| Agent publishen | `/publish-agent/{id}` | POST | `is_published` im GET danach unzuverlässig |
| Flow erstellen | `/create-conversation-flow` | POST | `is_transfer_cf: true` MUSS hier gesetzt werden |
| Flow updaten | `/update-conversation-flow/{id}` | PATCH | `is_transfer_cf` kann NICHT nachträglich geändert werden |
| Flow löschen | `/delete-conversation-flow/{id}` | DELETE | |
| Nummer zuordnen | `/update-phone-number/{phone}` | PATCH | Feld: `inbound_agent_id` (NICHT `agent_id`) |
| Nummern listen | `/list-phone-numbers` | GET | Prüfe `inbound_agent_id` nach jeder Änderung |
| Call abrufen | `/v2/get-call/{id}` | GET | `disconnection_reason`, `transcript_object`, `recording_multi_channel_url` |
| Calls listen | `/v2/list-calls` | POST | Body: `{ limit, sort_order }` |

---

## Retell Sync Script (`retell_sync.mjs`)

**Was es macht:** JSON-Config → Flow erstellen/updaten → Agent erstellen/updaten → Cross-Link Swap Tools → Publishen → Telefonnummer unpin.

**Was es NICHT macht:**
- `is_transfer_cf` korrigieren (wenn Flow als `false` erstellt wurde)
- Telefonnummer zuordnen (wenn Agent neu erstellt wurde)
- Agent-Version prüfen (Flow-Wechsel bei Version >0 schlägt fehl)

**Nach jedem `retell_sync.mjs`:** Telefonnummer-Zuordnung prüfen!

---

## Checkliste: Voice Agent Smoke-Test (nach jeder Änderung)

- [ ] Anrufen: Kommt der Agent ran? (Kein "Leitung belegt")
- [ ] Greeting: Sagt "Hallo, hier ist Lisa — die digitale Assistentin von {Firma}"?
- [ ] Info-Frage: "Wann haben Sie geöffnet?" → korrekte Antwort?
- [ ] Intake: Schaden melden → alle Felder → Farewell mit SMS-Info?
- [ ] Sprachwechsel DE→EN: "English please" → "Natürlich, einen Moment" → EN Agent?
- [ ] Rückswitch EN→DE: "Deutsch" → "Of course, one moment" → DE Agent → KEIN Auflegen?
- [ ] Off-topic: "Steuererklärung?" → Deflekt + weiter mit Intake?
- [ ] Nach Farewell neue Frage → NICHT auflegen?

### S6: Language-Transfer-Edge MUSS auf ALLEN Nodes sein (nicht nur node-main)

**Problem (10.04., call_50a65b88 + call_feda7085):** Nach Farewell ("SMS auf Ihr Handy...") wechselt der Flow in `node-closing-intake`. Dort gab es KEINE Language-Edge. User sagt "English" → Agent findet keinen Weg zum Transfer → 14s Stille → `end_call`.

**Root Cause:** Language-Transfer-Edges existierten nur auf `node-main` und `node-language-gate`. Nicht auf `node-closing-intake`, `node-closing-info`, `node-out-of-scope`.

**Fix:** Language-Transfer-Edge auf ALLEN conversation-Nodes die end_call haben. Regel: **Von jedem Punkt im Flow muss ein Sprachwechsel möglich sein.**

**Checkliste für jeden neuen Agent:**
- [ ] node-main → hat edge-language-trigger ✅
- [ ] node-closing-intake → hat edge-closing-language-trigger ✅
- [ ] node-closing-info → hat edge-closing-info-language-trigger ✅
- [ ] node-out-of-scope → hat edge-oos-language-trigger ✅

### S7: INTL Agent DE-Transfer Edge AUCH auf allen Closing-Nodes

**Problem (10.04., call_34bfe61c):** INTL Agent übernahm Call, Intake war fast komplett → Agent wechselte in closing-Node → User sagte "Deutsch" → keine DE-Transfer Edge → end_call.

**Identisches Problem wie S6, aber auf dem INTL Agent.** Beide Agents (DE + INTL) brauchen Transfer-Edges auf ALLEN Nodes.

### S8: INTL Agent darf NIE Deutsch sprechen — FORBIDDEN-Liste nötig

**Problem:** DE-Transfer Node Prompt sagte "Say it in your current language" aber LLM sagte trotzdem "Natürlich, einen Moment bitte" auf Deutsch mit britischem Akzent.

**Fix:** Explizite FORBIDDEN-Liste im Prompt: "ABSOLUTELY FORBIDDEN: Any German word. No 'Natürlich'. No 'Einen Moment'. No 'Auf Deutsch'. You are the ENGLISH/FRENCH/ITALIAN agent — you do NOT speak German."
