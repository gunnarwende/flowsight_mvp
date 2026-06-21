# Voice Agent System — IST-Zustand (Stand: 2026-03-12)

> Belastbare Ist-Aufnahme des gesamten Voice-Agent-Systems als Grundlage für das Zielbild `voice.md`.
> Kein grober Überblick — jedes Detail zählt für die Redesign-Entscheidungen.

---

## 1. Executive Summary

FlowSight betreibt ein **Dual-Agent Voice System** auf Retell AI mit 4 Kunden-Pärchen (DE + INTL) = 8 Agents.
Jeder Anruf durchläuft: **Retell → Webhook → Supabase Case → E-Mail + SMS**.
Das System ist funktional, aber auf dem Stand einer schnellen MVP-Iteration — gewachsen über 29 Waves in 3 Wochen (Feb/März 2026).

**Kernzahlen:**
- 8 Agent-Konfigurationen (4× DE, 4× INTL)
- 2 Custom Voices (Ela DE, Juniper INTL)
- 1 Webhook-Route (645 LOC) + 1 Sales-Route
- 6-stufige Analyse-Chain (collect → analyze → correlate → report)
- 28 PLZ im City-Mapping (hardcoded)
- Max 7 Fragen pro Anruf, Recording OFF
- 9 Post-Call-Analyse-Felder (Intake), 6 Felder (Sales)

**Agents nach Funktion:**

| Funktion | DE Agent | INTL Agent | Modus |
|----------|----------|------------|-------|
| Brunner (Demo) | Intake + Info | Intake + Info | Dual |
| Dörfler (Kunde) | Intake only | Intake only | Dual |
| Weinberger (Goldstandard) | Intake + Info | Intake + Info | Dual |
| FlowSight Sales (Lisa) | Interest Capture | Interest Capture | Dual |

---

## 2. Agent Inventory — Vollständig

### 2.1 Übersicht

Alle Agents leben als JSON in `retell/exports/`. Die ID-Zuordnung liegt in `retell/agent_ids.json`.

```
retell/exports/
├── brunner_agent.json           # DE — Intake + Info
├── brunner_agent_intl.json      # INTL — Intake + Info (Transfer-Agent)
├── doerfler_agent.json          # DE — Intake only
├── doerfler_agent_intl.json     # INTL — Intake only (Transfer-Agent)
├── weinberger-ag_agent.json     # DE — Intake + Info
├── weinberger-ag_agent_intl.json # INTL — Intake + Info (Transfer-Agent)
├── flowsight_sales_agent.json   # DE — Interest Capture (Lisa)
└── flowsight_sales_agent_intl.json # INTL — Interest Capture (Transfer-Agent)
```

### 2.2 Agent-ID-Mapping (retell/agent_ids.json)

| Prefix | DE Agent ID | DE Flow ID | INTL Agent ID | INTL Flow ID | Last Synced |
|--------|------------|------------|---------------|--------------|-------------|
| brunner | agent_47deec4b... | conversation_flow_e2c3a7... | agent_01fad421... | conversation_flow_3c7d42... | 2026-03-10 |
| doerfler | agent_d7dfe45a... | conversation_flow_8170ad... | agent_fb4b956e... | conversation_flow_608d54... | 2026-03-10 |
| weinberger-ag | agent_d568564d... | conversation_flow_4254de... | agent_0976aabe... | conversation_flow_ac5b36... | 2026-03-11 |
| flowsight_sales | agent_6515d8d1... | conversation_flow_1f30bf... | agent_e03666c4... | conversation_flow_dd3212... | 2026-03-11 |

### 2.3 Konfigurationsunterschiede pro Agent

**Gemeinsame Einstellungen (alle 8 Agents):**
- `max_call_duration_ms`: 420'000 (7 min) für Intake, 300'000 (5 min) für Sales
- `interruption_sensitivity`: 1
- `responsiveness`: 0.9 (Intake) / nicht gesetzt (Sales)
- `reminder_trigger_ms`: 10'000
- `reminder_max_count`: 1
- `allow_user_dtmf`: true
- `post_call_analysis_model`: gpt-4.1-mini
- `model_choice`: cascading, gpt-4.1
- `response_engine`: conversation-flow (version 1)
- `data_storage_setting`: everything (Intake) / everything_except_pii (Sales)

**Abweichungen:**

| Dimension | Brunner DE | Dörfler DE | Weinberger DE | Sales DE |
|-----------|-----------|-----------|---------------|----------|
| Greeting | "Guten Tag, hier ist Lisa..." | "...Sanitär- und Heizungsdienst der Dörfler AG" | "Grüezi, hier ist Lisa..." | "Grüezi, hier ist Lisa von FlowSight" |
| Modi | Intake + Info | Intake only | Intake + Info | Callback + Info |
| Kategorien | 6 Werte | 6 Werte | **8 Werte** (+ Lüftung, Badsanierung) | N/A |
| Post-Call Felder | 9 | 8 | 9 | 6 (komplett anders) |
| PLZ required | nein | **ja** | nein | N/A |
| Persona-Name | Lisa | kein Name | Lisa | Lisa |
| Max Duration | 7 min | 7 min | 7 min | **5 min** |
| Data Storage | everything | everything | everything | **everything_except_pii** |

**Kritischer Befund: Inkonsistenz der Kategorie-Enums.**
- Brunner/Dörfler: 6 Werte (`Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein`)
- Weinberger: 8 Werte (`Sanitär | Heizung | Lüftung | Badsanierung | Boiler | Rohrbruch | Verstopfung | Notfall`)
- Die Webhook-Route validiert Kategorien NICHT gegen ein Enum — jeder String wird akzeptiert.
- Der Case Contract definiert category als freien String, kein Enum.
- **→ Im Dashboard/Leitstand gibt es keine einheitliche Filterung nach Kategorie.**

---

## 3. Voice Layer — Stimmen & Audio

### 3.1 Custom Voices

| Voice | Voice ID | Verwendung | Plattform | Sprache |
|-------|----------|-----------|-----------|---------|
| **Ela** | custom_voice_3209d3305910d955836523bfac | Alle DE Agents | ElevenLabs | Deutsch (de-DE) |
| **Juniper** | custom_voice_cf152ba48ccbac0370ecebcd88 | Alle INTL Agents | ElevenLabs | Multilingual (en/fr/it) |

**Historischer Kontext:** Ursprünglich wurde "Susi" als DE-Stimme verwendet. In PR #124 (2026-03-06) wurde Susi durch Ela ersetzt ("fix: swap Susi voice to Ela across all DE agents"). Grund: Ela klingt natürlicher für Schweizer Kontext.

### 3.2 Stimmenqualität — Bekannte Limitationen

- **Schweizerdeutsch-Verständnis:** Retell/ElevenLabs verarbeiten Schweizerdeutsch als Input (ASR), aber Lisa antwortet IMMER in Hochdeutsch. Die Agents sind auf `de-DE` konfiguriert, nicht `de-CH`.
- **Kein voice_temperature/voice_speed** in den Configs gesetzt → Retell-Defaults werden verwendet.
- **Grüezi vs. Guten Tag:** Weinberger und Sales nutzen "Grüezi" (schweizerischer), Brunner/Dörfler nutzen "Guten Tag". Inkonsistenz in der Markensprache.
- **Keine Prosodie-Steuerung:** Kein SSML, keine Pausen-Markierungen, keine Betonungskontrolle.

### 3.3 Recording & Datenschutz

- **Recording: OFF** — Systemweit enforced (CLAUDE.md Guardrail).
- `data_storage_setting: everything` speichert Transkript + Analyse, aber KEINE Audiodatei.
- Sales Agents nutzen `everything_except_pii` — schärfere Trennung.
- `opt_in_signed_url: false` — kein Download-Link für Aufnahmen.
- `pii_config: { post_call: true, categories: [] }` — PII-Erkennung aktiv, aber keine Kategorien konfiguriert (= effektiv deaktiviert).

---

## 4. Sprachlogik — Dual-Agent-Architektur

### 4.1 Grundprinzip

Jeder Tenant hat **zwei Agents**: DE (Primär) + INTL (Transfer-Ziel).
- Anruf startet IMMER beim DE Agent.
- DE Agent hat einen Language Gate Node am Anfang.
- Erkennt nicht-deutsche Sprache → `swap_to_intl_agent` Tool → Transfer zum INTL Agent.
- INTL Agent kann zurück-transferieren, wenn Anrufer doch Deutsch spricht.

### 4.2 Spracherkennung im DE Agent

**Trigger für Transfer (im Language Gate Node):**
- Anrufer spricht Englisch, Französisch oder Italienisch
- Explizite Anfrage: "English please", "en français", "in italiano"

**Kein Transfer bei:**
- Schweizerdeutsch (wird als Deutsch erkannt → bleibt beim DE Agent)
- Gemischte Sprache (Deutsch mit englischen Lehnwörtern)

### 4.3 INTL Agent — Sprachmodi

**Intake Agents (Brunner, Dörfler, Weinberger):**
- **FOLLOW MODE — NO LOCK**: Agent folgt der letzten Sprache des Anrufers
- Unterstützt: English, French, Italian
- Deutsch-Erkennung → sofort `swap_to_de_agent` zurück
- Post-Call Analysis IMMER auf Deutsch (de-CH Schreibweise)

**Sales Agent (FlowSight):**
- **STICKY MODE**: Sprache wird beim ersten Satz erkannt und für den gesamten Anruf beibehalten
- INTL Agent wechselt NIE zu Deutsch während des Anrufs (nur Transfer zurück zum DE Agent)
- Mehr Stabilität, aber weniger flexibel

### 4.4 Transfer-Mechanismus (technisch)

```
DE Agent → Language Gate (non-German detected)
  → swap_to_intl_agent Tool (type: agent_swap)
    → post_call_analysis_setting: only_destination_agent
      → INTL Agent erhält Gesprächskontext
        → Kann swap_to_de_agent wenn Anrufer doch Deutsch spricht
```

**Placeholder-System:** In den JSON-Exports stehen `REPLACE_WITH_*_AGENT_ID` Platzhalter. `retell_sync.mjs` ersetzt diese automatisch mit den echten IDs aus `agent_ids.json` (Step 3: Cross-link Swap Tools).

**Bekanntes Problem:** Die JSON-Exports haben `is_published: false`. Die Publish-Logik läuft ausschliesslich über `retell_sync.mjs` (Step 4). Ein manueller JSON-Import über das Retell Dashboard publiziert NICHT automatisch.

### 4.5 Schwächen der Sprachlogik

1. **Nur 4 Sprachen:** Deutsch + Englisch/Französisch/Italienisch. Türkisch, Portugiesisch, Serbokroatisch (häufig in der Schweiz) → kein Support.
2. **Kein Schweizerdeutsch-Modus:** ASR interpretiert Schweizerdeutsch als Hochdeutsch. Starke Dialekte (Walliser-, Berndeutsch) können zu Erkennungsfehlern führen.
3. **Transfer-Latenz:** Agent Swap dauert ~1-2 Sekunden. Der Anrufer hört eine kurze Stille.
4. **Kein Fallback bei Swap-Fehler:** Wenn der INTL Agent nicht erreichbar ist, endet der Anruf. Kein Retry, kein Fallback zu DE.
5. **Follow Mode Instabilität:** Bei Code-Switching (z.B. Italiener, der einzelne deutsche Wörter nutzt) kann der INTL Agent fälschlicherweise zurück zu DE transferieren.

---

## 5. Conversation Flow — Node-Architektur

### 5.1 Standardflow (DE Intake Agent)

```
Welcome Node
  ↓
Language Gate
  ↓ (deutsch)          ↓ (nicht deutsch)
Main Conversation    Language Transfer Node
  ↓                     → swap_to_intl_agent
Logic Split
  ↓           ↓              ↓
Closing     Closing        Out-of-Scope
Intake      Info           Closing
  ↓           ↓              ↓
End Call    End Call        End Call
```

**Typisch 7-8 Nodes pro DE Agent, 6-8 Nodes pro INTL Agent.**

### 5.2 Main Conversation Node — Regeln

Der Kern des Agents. Enthält die gesamte Gesprächslogik als Prompt-Instructions:

**Mode Detection (automatisch):**
- **INTAKE:** Anrufer meldet einen Schaden oder braucht eine Reparatur → Felder sammeln
- **INFO:** Anrufer fragt nach Öffnungszeiten, Preisen, Kontakt → direkt beantworten

**Feldsammlung (Intake):**
1. **Kategorie** — Automatisch aus Beschreibung ableiten (nicht explizit fragen)
2. **PLZ** — Direkt fragen: "In welchem Ort oder welcher Postleitzahl befindet sich der Schaden?"
3. **Stadt** — Aus PLZ ableiten oder erfragen
4. **Strasse + Hausnummer** — Best-effort, nicht blockierend
5. **Dringlichkeit** — Aus Kontext ableiten (nicht fragen: "Ist es dringend?")
6. **Beschreibung** — Zusammenfassung des Problems
7. **Name** — Am Ende fragen, nach Adresse, best-effort

**Harte Regeln:**
- Max 7 Fragen
- Nie Felder doppelt fragen
- Nie den Namen wiederholen (ASR-Probleme)
- Nie eine Zusammenfassung vorlesen
- Swiss German: 'ss' nie 'ß'
- Beiläufige Nebenfragen sind KEIN out_of_scope
- Farewell: Wenn Anrufer Danke/Tschüss/Perfekt sagt → einmal antworten → `end_call`
- SMS-Hinweis im Abschluss: "Sie erhalten gleich eine SMS zur Bestätigung..."

### 5.3 Info-Fragen (Brunner/Weinberger)

Agents mit Info-Modus beantworten:
- Öffnungszeiten
- Einzugsgebiet
- Unverbindliche Preisindikationen
- Geschäftsleitung/Kontakt
- Lehrstellen
- Adresse/Anfahrt
- Beratung/Offertanfragen

**Dörfler hat KEINEN Info-Modus** — nur Intake. Alle Info-Anfragen werden als out-of-scope behandelt.

### 5.4 Closing Nodes

**DE Agents — Closing Intake:**
- Farewell-Text mit SMS-Hinweis
- `end_call` Tool wird aufgerufen

**INTL Agents — Closing Nodes:**
- Instruction: "Say NOTHING. Stay completely silent. The call is over."
- Grund: Post-Call Analysis läuft nur beim Destination Agent (`only_destination_agent`). Stilles Ende verhindert doppelte Verabschiedung.

### 5.5 Firmenspezifische Daten im Prompt

Jeder Agent enthält die kompletten Firmendaten als Prompt-Kontext:

| Feld | Brunner | Dörfler | Weinberger |
|------|---------|---------|------------|
| Adresse | Seestrasse 42, 8800 Thalwil | (im Prompt) | Zürcherstrasse 73, 8800 Thalwil |
| Inhaber | Thomas Brunner | (im Prompt) | Christian Weinberger |
| Google Rating | 4.8 ★ (52 Reviews) | (im Prompt) | 4.4 ★ (20 Reviews) |
| Team-Grösse | 8 Mitarbeiter | (im Prompt) | 10+ Mitarbeiter |
| Gründung | — | — | 1912 |
| Notdienst | 24/7 | (im Prompt) | (im Prompt) |
| Preise | Ja (6 Kategorien) | — | Ja (ähnlich, Badsan. höher) |

**Kritischer Befund:** Diese Firmendaten sind HARDCODED im Agent-Prompt. Updates erfordern JSON-Edit + retell_sync.mjs. Es gibt keine dynamische Datenquelle (kein API-Call aus dem Agent heraus). Bei Änderungen (neue Telefonnummer, neuer Mitarbeiter, neuer Preis) muss der JSON manuell aktualisiert und neu deployed werden.

---

## 6. Datenqualität — Extraktion & Normalisierung

### 6.1 Post-Call Analysis Pipeline

```
Retell Call endet
  → Retell führt Post-Call Analysis aus (gpt-4.1-mini)
    → Extrahierte Felder in custom_analysis_data
      → Webhook empfängt call_analyzed Event
        → 4-Pfad-Probing für Feldzugriff
          → Normalisierung → Validierung → Case-Erstellung
```

### 6.2 Feld-Extraktion (Webhook, 4 Pfade)

Der Webhook probiert 4 verschiedene Pfade, um die extrahierten Felder zu finden:
1. `call.call_analysis.custom_analysis_data` (kanonisch)
2. `call.analysis` (Fallback)
3. `call.metadata` (Fallback)
4. Top-level Payload Keys (Fallback)

**Grund:** Retell hat die Payload-Struktur mehrfach geändert. Die 4-Pfad-Logik ist eine Defensiv-Massnahme.

### 6.3 PLZ-Normalisierung

```javascript
// Regex: erste 4 aufeinanderfolgende Ziffern extrahieren
const plzMatch = rawPlz.match(/\d{4}/);
```

- Akzeptiert: "8800", "PLZ 8800", "acht-acht-null-null" (wenn ASR korrekt transkribiert)
- Akzeptiert NICHT: gesprochene Zahlen ("achttausendachthundert") — Retell/ASR muss diese vorher in Ziffern umwandeln

### 6.4 City Auto-Korrektur (PLZ_CITY_MAP)

**28 hardcodierte PLZ-Stadt-Paare** im Webhook:

```
8800 → Thalwil, 8942 → Oberrieden, 8038 → Zürich,
8002 → Zürich, 8003 → Zürich, 8004 → Zürich,
8005 → Zürich, 8006 → Zürich, 8008 → Zürich,
8032 → Zürich, 8037 → Zürich, 8045 → Zürich,
8055 → Zürich, 8134 → Adliswil, 8135 → Langnau am Albis,
8802 → Kilchberg, 8803 → Rüschlikon, 8810 → Horgen,
8820 → Wädenswil, 8805 → Richterswil, 8804 → Au ZH,
8152 → Glattbrugg, 8600 → Dübendorf, 8610 → Uster,
8620 → Wetzikon, 8400 → Winterthur, 8500 → Frauenfeld,
8200 → Schaffhausen
```

**Zweck:** Korrigiert ASR-Fehler (z.B. "Talwil" → "Thalwil", "Kilberg" → "Kilchberg").

**Schwächen:**
1. **Nur 28 Einträge** — deckt nur die engeren Einzugsgebiete ab. Anrufer aus Bern, Basel, Luzern, St. Gallen → keine Korrektur.
2. **Hardcoded** — nicht pro Tenant konfigurierbar. Ein neuer Kunde in Bern braucht Code-Änderung + Deploy.
3. **Keine Validierung gegen Einzugsgebiet** — ein Anruf mit PLZ 3000 (Bern) wird akzeptiert, obwohl kein Betrieb dort operiert.
4. **Nur City-Name-Korrektur** — keine PLZ-Plausibilitätsprüfung (PLZ 9999 würde akzeptiert).

### 6.5 Strassen-Normalisierung

- `ß → ss` (Swiss German Konvention)
- Hausnummer: Wort-zu-Ziffer (`eins → 1` bis `zwanzig → 20`)
- Strasse und Hausnummer sind getrennte Felder (street + house_number)
- Best-effort: nicht blockierend, wenn fehlend wird trotzdem ein Case erstellt

### 6.6 Validierung (strikt)

**Required für Case-Erstellung:**
- `contact_phone` (vom Anrufer, via Retell Caller ID)
- `plz` (4 Ziffern)
- `city` (String)
- `category` (String, kein Enum-Check!)
- `urgency` ("notfall" | "dringend" | "normal")
- `description` (String)

**Fehlende Felder → KEIN Case erstellt.** HTTP 204 + Sentry Warning. Stiller Datenverlust für den Anrufer — kein Retry, keine Benachrichtigung.

### 6.7 Bekannte Qualitätsprobleme

1. **PLZ als Einzelziffern:** Anrufer sagen "acht-acht-null-null" → ASR transkribiert manchmal "8 8 0 0" (mit Leerzeichen) statt "8800". Die Regex fängt das ab (sucht erste 4 zusammenhängende Ziffern), aber Retell's Post-Call Analysis kann Probleme haben.
2. **Strassennamen mit Umlauten:** "Zürcherstrasse" vs "Zurcherstrasse" — kein Umlaut-Handling in der Normalisierung.
3. **Reporter Name optional:** Wenn der Agent den Namen nicht erfasst, wird der Case ohne Name erstellt. Für den Betrieb schwieriger zu identifizieren.
4. **Doppelte Cases:** Wenn ein Anrufer auflegt und erneut anruft, entstehen zwei Cases. Keine Deduplizierung.
5. **Category Free-Text:** Webhook validiert nicht gegen ein Enum. Retell könnte "Wasserhahn tropft" statt "Leck" extrahieren → inkonsistente Dashboard-Daten.

---

## 7. Region & PLZ — Einzugsgebiet-Logik

### 7.1 Definierte Einzugsgebiete (pro Agent-Prompt)

**Brunner:** Thalwil, Horgen, Oberrieden, Kilchberg, Adliswil, Wädenswil, Rüschlikon, Langnau am Albis

**Weinberger:** Thalwil, Oberrieden, Horgen, Kilchberg, Rüschlikon, Adliswil, Langnau am Albis, Wädenswil, Richterswil, Au ZH (2 Gemeinden mehr)

**Dörfler:** Im Prompt definiert (Oberrieden-Umgebung)

### 7.2 Einzugsgebiet-Handling

- Agent kennt das Einzugsgebiet und kann Anrufer informieren
- **ABER:** Der Webhook prüft NICHT, ob die PLZ im Einzugsgebiet liegt
- Ein Anruf aus Bern mit PLZ 3000 erstellt einen gültigen Case
- Die Einzugsgebiet-Logik ist rein informativ (Agent sagt "Wir sind hauptsächlich in Thalwil und Umgebung tätig")
- **→ Kein technischer Filter. Betriebe müssen manuell aussortieren.**

### 7.3 PLZ → Tenant-Routing

Gibt es NICHT. Das Routing funktioniert über die **angerufene Telefonnummer**:
- Anrufer wählt Nummer von Brunner → `tenant_numbers` Tabelle → Brunner Tenant
- PLZ hat keinen Einfluss auf das Routing
- Korrekt für den aktuellen Use Case (jeder Betrieb hat eigene Nummer)

---

## 8. SMS-Kopplung — Post-Call Bestätigung

### 8.1 SMS-Flow

```
Case erstellt (Webhook)
  → getTenantSmsConfig(tenantId) → sms=true + sms_sender_name?
    → 3-Tier Target Resolution:
        1. tenant.modules.demo_sms_target (Prospect-Demo)
        2. DEMO_SIP_CALLER_ID env (Founder-Test)
        3. Echter Anrufer (Produktion)
    → Twilio-eigene Nummern erkennen → SMS überspringen
    → sendPostCallSms() via Twilio REST API
      → SMS mit Kategorie, Adresse, Korrekturlink
```

### 8.2 SMS-Inhalt

```
[SenderName]: Ihr [Kategorie]-Fall wurde erfasst.

Erfasste Adresse: [Strasse] [Hausnummer], [PLZ] [Stadt]
— ODER —
Erfassort: [PLZ] [Stadt]

Stimmt alles? Haben Sie Fotos vom Schaden?
[Korrekturlink]

Ihr Service-Team meldet sich schnellstmöglich.
```

### 8.3 Verifizierungslink

- Format: `{APP_URL}/v/{caseId}?t={shortToken}`
- Token: HMAC-SHA256 über `{caseId}:{createdAt}`, erste 16 Hex-Zeichen
- Timing-safe Vergleich (crypto.timingSafeEqual)
- Secret: `SMS_HMAC_SECRET` Env-Variable

### 8.4 SMS Sender

- Twilio Alphanumeric Sender (3-11 Zeichen, muss Buchstabe enthalten)
- Konfiguriert pro Tenant in `modules.sms_sender_name`
- `SMS_ALLOWED_NUMBERS` Whitelist (optional, für Testphase)

### 8.5 Twilio-eigene Nummern (SIP-Erkennung)

Hardcodiert im Webhook:
- `+41445053019` — Dörfler AG SIP Trunk
- `+41445520919` — FlowSight Sales Nummer

Wenn die Caller ID eine dieser Nummern ist → SMS wird übersprungen (SIP-Anrufe haben keine SMS-fähige Nummer).

### 8.6 SMS-Schwächen

1. **Keine SMS für SIP-Anrufe:** Alle Peoplefone/SIP-Anrufe verlieren die SMS-Bestätigung. Der Anrufer bekommt keine Rückmeldung.
2. **Whitelist-Guard:** `SMS_ALLOWED_NUMBERS` blockiert SMS an unbekannte Nummern in der Testphase. Vergisst man die Whitelist zu erweitern, gehen SMS verloren.
3. **Kein Retry:** Wenn Twilio die SMS nicht zustellen kann, gibt es keinen Retry. Der Fehler wird geloggt, aber der Anrufer bekommt nichts.
4. **Korrekturseite rudimentär:** `/v/{caseId}` zeigt die erfassten Daten und erlaubt Korrekturen + Foto-Upload. Aber kein Feedback an den Betrieb, dass der Anrufer korrigiert hat.

---

## 9. Analyse-Stack — Voice Chain Pipeline

### 9.1 Architektur

```
scripts/run_chain.mjs                    (Chain-Runner)
  └── scripts/chains/voice/
        ├── collect.mjs                  (Spur 0: Retell API → Raw JSON)
        ├── analyze.mjs                  (Spur 1: Transcript-Analyse)
        ├── audio_collect.mjs            (Spur 2a: Audio-Download)
        ├── transcribe.mjs              (Spur 2b: WhisperX Re-Transkription)
        ├── correlate.mjs               (Spur 2c: Audio-Forensik)
        └── report.mjs                  (Report-Generierung)
```

### 9.2 Spur 1: Transcript-Analyse (analyze.mjs)

**6 Audit-Funktionen:**

| Audit | Prüft | Severity |
|-------|-------|----------|
| auditTriggers | Sprach-Trigger-Keywords in Turns (35 Keywords: en/fr/it) | warning/critical |
| auditTransfer | Transfer-Event abgeschlossen? | critical bei Fehler |
| auditGibberish | ASR-Qualität (Heuristik: kurze Tokens, fehlende Vokale, Wiederholungen) | warning ≥0.4, critical ≥0.6 |
| auditFlow | Double-Questioning, Express-Ignore (Anrufer gibt 3+ Felder, Agent fragt trotzdem) | warning |
| auditExtraction | Pflichtfelder vorhanden? PLZ 4-stellig? Urgency-Enum? | critical bei fehlend |
| auditTiming | Agent Talk Ratio >65%? Gaps >5s? Duration >240s? | warning |

### 9.3 Spur 2: Audio-Forensik (WhisperX)

**Nur verfügbar mit lokaler WhisperX-Installation (Python 3.12).**

Flow:
1. `audio_collect.mjs` — Download Recording-URL von Retell → `tmp/chains/voice/audio/{id}/input.wav`
2. `transcribe.mjs` — WhisperX Re-Transkription → `words.json`, `segments.json`, `transcript.vtt`
3. `correlate.mjs` — Vergleich Retell-Transkript vs. WhisperX:
   - Trigger-Erkennung in Audio (wurde Sprachswitch gehört?)
   - Speech Gaps (WhisperX hört etwas, wo Retell leer war)
   - Transfer-Timing (Trigger → Transfer innerhalb 5s?)

**Befunde-Typen:**
- `trigger_heard_no_transfer` (critical) — Sprachwechsel gehört, kein Transfer
- `speech_no_transcript` (warning) — WhisperX hört Worte, Retell zeigt nichts
- `trigger_agent_spoken` (info) — Keyword vom Agent gesagt, nicht vom Anrufer

### 9.4 Report-Generierung

Pro Anruf:
- `report.md` (Markdown-Narrative mit Verdict Badge: PASS/WARN/FAIL)
- `report.json` (strukturierte Daten)

Aggregiert:
- `summary.md` (alle Anrufe, Top-3-Regressionen, Audio-Gate-Quote)

**Verdict-Logik:**
- FAIL = mindestens 1 critical Finding
- WARN = ≥3 warning Findings
- PASS = sonst

### 9.5 Nutzung der Chain

Die Chain wird **manuell** ausgeführt:
```bash
node scripts/run_chain.mjs voice --last 10
```

**Keine automatische Ausführung.** Kein Cron, kein CI-Integration für regelmässige Analyse.
Der `smoke_voice.mjs` ist der einzige automatisierte Check — prüft aber nur Health + letzte Case-Alter.

---

## 10. Infrastruktur — Routing & Telephonie

### 10.1 Telefonie-Stack

```
Anrufer → Peoplefone (Brand-Nummer)
  → Twilio SIP Trunk (Entry-Nummer)
    → Retell AI (Agent)
      → Webhook (Vercel)
        → Supabase + Resend + Twilio SMS
```

**Dokumentiert in:** `docs/runbooks/peoplefone_front_door.md`

### 10.2 Nummern-Zuordnung

| Rolle | Nummer | Beschreibung |
|-------|--------|-------------|
| Brand (Dörfler) | Peoplefone-Nummer | Kunden-seitig sichtbar |
| Entry (Dörfler) | +41 44 505 30 19 | Twilio SIP Trunk |
| Brand (FlowSight) | +41 44 552 09 19 | Sales-Nummer |
| Demo (Brunner) | — | Demo-Tenant |
| Prospect (Weinberger) | — | Goldstandard-Prospect |

### 10.3 Tenant-Nummern (Supabase)

Tabelle `tenant_numbers`:
- `phone_number` (E.164)
- `tenant_id` (UUID)
- `active` (boolean)

Webhook ruft `resolveTenant(calledNumber)` → Lookup in dieser Tabelle.
Fallback: `FALLBACK_TENANT_ID` env var.

### 10.4 Webhook-Endpoints

| Route | Zweck | Auth |
|-------|-------|------|
| `POST /api/retell/webhook` | Intake Cases (alle Tenants) | x-retell-signature |
| `POST /api/retell/sales` | Sales Lead Capture | x-retell-signature |
| `GET /api/retell/webhook` | Health Probe | keine |
| `POST /api/cases` | Wizard/Manual Cases | keine (public) |

### 10.5 Monitoring

- **smoke_voice.mjs:** Health + Webhook + Tenant Numbers + Last Case Age (~30s)
- **verify_voice_pipeline.mjs:** Tenant Mappings + Recent Cases + Production Probe
- **Sentry:** Alle Fehler getaggt (area=voice, provider=retell)
- **WhatsApp Alert:** RED bei CASE_CREATE_FAILED oder EMAIL_DISPATCH_FAILED
- **Morning Report:** Inkludiert Cases-KPIs (stuck_48h, backlog, notfall)

---

## 11. Historische Probleme — Gelöst & Lessons Learned

Chronologisch aus Git History und Wave Log:

### Wave 2C (2026-02-19) — Grundstein
- Retell Webhook, Tenant Resolver, Voice E2E Pipeline erstmals funktional

### Wave 16 (2026-02-22) — Voice Prompt v2
- Testcall-Fixes, Agent-as-File eingeführt (JSON statt Dashboard-Edit)

### Wave 17 (2026-02-22) — Dual-Agent Split
- DE/INTL-Trennung eingeführt, Address Fields E2E

### Wave 18 (2026-02-23) — Spracherkennung v1
- 3-Layer Language Detection, ASR-Drift Handling

### Wave 21 (2026-02-25) — PLZ & Loop-Fixes
- PLZ Digit-by-Digit Problem gelöst
- Secrets Policy verschärft
- Rapid-Fire Farewell Loop gefixt

### PR #40 (2026-02-26) — Sorry-Trigger entfernt
- "Sorry" wurde als Sprach-Trigger erkannt → falscher Transfer zu INTL
- end_call Tool eingeführt
- Warm Closing implementiert

### PR #41 (2026-02-26) — SMS Info-Repeat Bug
- Agent hat SMS-Hinweis nach Farewell wiederholt → POST-FAREWELL Rule

### PR #46 (2026-02-27) — Farewell Loop
- Agent blieb in Endlosschleife beim Verabschieden → Dynamic SIP Routing Fix

### PR #47 (2026-02-27) — SMS Alpha Sender
- Alphanumeric Sender Validation fehlte → Fix + Phone Routing Audit Tool

### PR #86 (2026-03-03) — Reporter Name
- reporter_name Feld über alle Agents, Webhook, Wizard, Verify Flow hinzugefügt

### PR #124 (2026-03-06) — Susi → Ela Voice Swap
- Voice "Susi" durch "Ela" ersetzt (natürlicherer Klang für Schweizer Kontext)

### PR #126 (2026-03-07) — Quality Wave
- Voice Closing Nodes sprechen Farewell (statt stumm)
- Tenant-scoped Review URL
- SMS SIP Detection eingeführt

### PR #127 (2026-03-07) — PLZ Lookup
- PLZ City Map erweitert
- Voice FAQ Fix

### PR #143 (2026-03-09) — Weinberger Blockers
- SMS Module fehlte → Fix
- Review URL falsch → Fix
- INTL Agent Name falsch → Fix

### PR #150 (2026-03-11) — Sales Agent Redesign
- Lisa Sales Agent → Interest Capture Agent (Gold-Contact-aligned)
- Komplett neuer Flow: kein Verkauf, nur warme Erfassung + Founder-Callback

---

## 12. Abhängigkeiten — Externe Services

| Service | Rolle | Criticality | Fallback |
|---------|-------|-------------|----------|
| **Retell AI** | Voice Agent Platform | P0 — ohne Retell keine Anrufe | keiner |
| **ElevenLabs** | Voice Synthesis (Ela, Juniper) | P0 — ohne Stimme kein Agent | Retell-Standard-Stimmen |
| **Twilio** | SIP Trunk + SMS | P0 — ohne Twilio kein Routing/SMS | keiner für SIP |
| **Peoplefone** | Brand-Nummern | P0 — ohne Peoplefone keine Nummer | direkt Twilio (kein Brand) |
| **Supabase** | Case Storage + Tenant Config | P0 — ohne DB kein Case | keiner |
| **Resend** | E-Mail Notifications | P1 — Case wird trotzdem erstellt | keiner (Case ohne Notification) |
| **Vercel** | Webhook Hosting | P0 — ohne Webhook kein Processing | keiner |
| **Sentry** | Error Tracking | P2 — System funktioniert, aber blind | Console Logs |
| **OpenAI (via Retell)** | LLM (gpt-4.1, cascading) | P0 — ohne LLM kein Gespräch | keiner |
| **WhisperX** | Audio-Forensik (lokal) | P3 — nur für Chain-Analyse | nur Spur 1 |

### Kritische Kette (Single Points of Failure)

```
Peoplefone → Twilio → Retell → OpenAI (LLM) → Retell → Vercel → Supabase
```

**6 externe Services in Serie.** Ausfall eines einzelnen Services → kompletter Voice-Ausfall.
Kein Circuit Breaker, kein Graceful Degradation, kein Voicemail-Fallback.

---

## 13. Harte Bewertung — Stärken & Schwächen

### Was funktioniert gut

1. **End-to-End Pipeline steht.** Anruf → Case → E-Mail → SMS in unter 30 Sekunden.
2. **Dual-Agent-Architektur** ermöglicht echte Mehrsprachigkeit ohne Prompt-Chaos.
3. **retell_sync.mjs** ist robust — idempotent, auto-publish, Cross-Link.
4. **Post-Call Analysis** liefert strukturierte Daten (PLZ, Stadt, Kategorie, Dringlichkeit).
5. **Defensiv-Webhook** mit 4-Pfad-Probing, PLZ-Korrektur, Hausnummer-Normalisierung.
6. **SMS-Bestätigung** mit kryptographisch signiertem Korrekturlink.
7. **Analyse-Chain** existiert und kann Qualitätsprobleme systematisch aufdecken.
8. **Sentry-Tagging** ist granular (area, stage, decision, tenant_id, case_id).
9. **Agent-as-File** Paradigma ermöglicht Versionierung, Review, Diff.
10. **20-Minuten-Onboarding** pro neuer Betrieb (Copy Template → Adapt → Sync → Live).

### Was nicht funktioniert / kritisch ist

1. **Firmendaten hardcoded im Prompt.** Jede Änderung (Preis, Team, Öffnungszeiten) braucht JSON-Edit + Sync + Deploy. Skaliert nicht.
2. **Kategorie-Enum inkonsistent.** 6 Werte (Brunner/Dörfler) vs. 8 Werte (Weinberger). Kein zentrales Schema. Dashboard kann nicht filtern.
3. **PLZ-Map nur 28 Einträge.** Neue Kunden ausserhalb Zürichsee-Region → Code-Änderung nötig.
4. **Kein Einzugsgebiet-Filter.** Cases werden erstellt, egal woher der Anrufer kommt.
5. **Stiller Datenverlust.** Fehlende Pflichtfelder → HTTP 204 + Sentry Warning. Anrufer merkt nichts, Betrieb merkt nichts.
6. **6 Services in Serie, kein Fallback.** Kein Voicemail, kein "Bitte versuchen Sie es später".
7. **Analyse-Chain nicht automatisiert.** Qualitätsprobleme werden nur gefunden, wenn jemand die Chain manuell startet.
8. **Schweizerdeutsch nicht explizit unterstützt.** `de-DE` statt `de-CH`. Starke Dialekte → Erkennungsfehler.
9. **INTL Agent-Closing stumm.** Anrufer hört abruptes Gesprächsende nach Transfer → schlechte UX.
10. **Keine Case-Deduplizierung.** Wiederholte Anrufe zum gleichen Problem → doppelte Cases.

---

## 14. Abschluss — Was dieses Dokument NICHT abdeckt

- **Zielbild:** Wie der Voice Agent aussehen SOLL → siehe `voice.md` (kommt als nächstes)
- **Sales Voice Agent UX:** Lisa Interest Capture im Detail → separate Analyse wenn nötig
- **Retell Billing/Limits:** Kosten pro Minute, Concurrency Limits → Retell Dashboard
- **Peoplefone SIP-Details:** Trunk-Konfiguration, Failover → `docs/runbooks/peoplefone_front_door.md`
- **WhisperX Setup:** Lokale Installation, Python Environment → nicht dokumentiert
- **Historische Call-Daten:** Anzahl Cases, Erfolgsquoten, Durchschnittsdauer → Supabase/Leitstand
