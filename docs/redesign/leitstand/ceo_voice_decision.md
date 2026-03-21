# Voice AI — Strategische Entscheidung

**Version:** 1.0 | **Datum:** 2026-03-21
**Status:** Entscheidung OFFEN — Founder-Input nötig
**Auslöser:** Testanruf 21.03. → 3 Min = $0.50 Retell-Kosten. Hochrechnung: ~$100/Monat/Betrieb bei 10 Calls/Tag.

---

## 1. Zweck dieses Dokuments

Bei CHF 299/Monat pro Betrieb und ~$100 Voice-Kosten/Monat bleibt zu wenig Marge. Dieses Dokument:
- Analysiert warum die Kosten so hoch sind
- Vergleicht Alternativen zu Retell AI
- Empfiehlt Top 3 Lösungen
- Gibt eine klare Empfehlung

---

## 2. Warum wir eine strategische Entscheidung brauchen

### Kostenrechnung (IST)

| Metrik | Wert |
|--------|------|
| Retell Kosten pro Minute (Real-World) | ~$0.15–0.20/min (Platform $0.07 + LLM + TTS) |
| Durchschnittlicher Anruf | 2–3 Minuten |
| Kosten pro Anruf | ~$0.30–0.60 |
| Anrufe pro Tag (ein aktiver Betrieb) | 5–15 |
| **Monatliche Voice-Kosten pro Betrieb** | **$50–$150** |
| FlowSight-Preis pro Betrieb | CHF 299 (~$330) |
| **Voice-Kostenanteil** | **15–45%** |

### Das Problem
- Bei 10 Betrieben: $500–$1'500/Monat nur für Voice
- Bei 50 Betrieben: $2'500–$7'500/Monat
- Die Voice-Kosten skalieren LINEAR mit dem Volumen — kein Economies-of-Scale-Effekt
- Gleichzeitig: Voice ist DAS Kernfeature — der Wow-Moment im Verkauf

### Was wir brauchen
- **Deutsch** als Default (80% der Anrufe), Schweizerdeutsch-Verständnis
- **EN/FR/IT** als Switch-Option (mid-conversation)
- **Strukturierte Datenextraktion** (PLZ, Kategorie, Urgency → Case erstellen)
- **SIP-Trunk** (Twilio/Peoplefone, Schweizer Nummern)
- **Recording OFF** (Datenschutz)
- **Max 7 Fragen**, Sanitär-spezifisch
- **Kosten < $50/Monat/Betrieb** als Ziel

---

## 3. Markt-Überblick — Was gibt es?

| Plattform | Kosten/Min (real) | LLM | Datenextraktion | SIP | Sprachen | Self-Host |
|-----------|-------------------|-----|-----------------|-----|----------|-----------|
| **Retell AI** (aktuell) | $0.13–0.20 | BYO (GPT-4o mini bis Opus) | Exzellent (Custom Fields) | Ja | DE/EN/FR/IT | Nein |
| **OpenAI Realtime API** | ~$0.04 | GPT-4o (native) | Basis (System Prompt) | Ja (neu 2026) | DE/EN/FR/IT | Nein |
| **Vapi.ai** | $0.13–0.25 | BYO | Gut (Webhook) | Ja | DE/EN/FR/IT | Nein |
| **Bland.ai** | $0.09–0.12 | Bundled | Basis | Ja | DE/EN/FR/IT | Nein |
| **Vocode** (Open Source) | Infra-Kosten | BYO | Custom Code | Ja | BYO STT/TTS | Ja |
| **Synthflow** | $0.08–0.45 | Bundled | Schwach | Ja | DE/EN/FR/IT | Nein |
| **Twilio AI Assistants** | $0.25–0.50 | BYO | Custom | Nativ | DE/EN/FR/IT | Nein |

---

## 4. Top 3 Lösungen für FlowSight

### Option A: Bei Retell bleiben + Kosten optimieren

**Ansatz:** Retell behalten, aber LLM-Kosten minimieren.

| Hebel | Einsparung | Aufwand |
|-------|-----------|---------|
| GPT-4o mini statt GPT-4o ($0.003 statt $0.06/min LLM) | ~40% | Config-Änderung |
| Kürzere Calls (striktere Prompts, schnelleres Closing) | ~20% | Prompt-Tuning |
| Retell Enterprise Volume Pricing (ab 50k Min/Monat) | ~30-50% | Verhandlung |
| ElevenLabs Turbo v2.5 statt Standard (schneller = kürzer) | ~10% | Config |

**Ergebnis:** Von ~$0.17/min auf ~$0.08–0.10/min → **$30–50/Monat/Betrieb**

**Vorteile:**
- Kein Migrations-Risiko (alles bleibt wie es ist)
- Beste Datenextraktion am Markt (Custom Fields → Case)
- Bereits 8 Agents konfiguriert + getestet
- Laura Voice funktioniert

**Nachteile:**
- Retell bleibt Vendor-Lock-in
- Kosten sinken, aber nicht dramatisch
- Platform-Fee ($0.07/min) bleibt fix

### Option B: OpenAI Realtime API (Migration)

**Ansatz:** Retell komplett ersetzen durch OpenAI's native Voice-to-Voice API.

**Kosten:** ~$0.04/min all-inclusive (GPT-4o native, kein separater LLM/TTS)

| 10 Calls/Tag × 2.5 Min | $1/Tag | ~$30/Monat/Betrieb |

**Vorteile:**
- **70-80% günstiger** als Retell
- GPT-4o nativ = exzellente Sprachqualität
- SIP-native seit 2026 (Twilio-Integration)
- Kein zusätzlicher TTS-Provider nötig
- Multilingual nativ

**Nachteile:**
- **Kein Conversation-Flow-Builder** (kein visueller Editor wie Retell)
- Datenextraktion nur via System Prompt (nicht so strukturiert wie Retell Custom Fields)
- **Komplette Migration** aller 8 Agents nötig
- Neuer Code: eigener Webhook, eigene Session-Verwaltung
- Kein Post-Call-Analysis-Feature → muss custom gebaut werden
- **Lock-in auf GPT-4o** (kein Model-Wechsel möglich)
- Neuere Plattform, weniger Battle-Tested

**Aufwand:** 2-3 Tage Engineering + 1 Woche Testing

### Option C: Hybrid (Retell optimiert + OpenAI als Fallback)

**Ansatz:** Retell als Primary mit maximaler Kosten-Optimierung. OpenAI Realtime als Test-Track für neue Tenants.

**Phase 1 (sofort):** Retell-Kosten halbieren
- GPT-4o mini als LLM
- Striktere Prompts (kürzere Calls)
- Enterprise-Preise verhandeln

**Phase 2 (Q2 2026):** OpenAI Realtime pilotieren
- 1 neuen Tenant auf OpenAI aufschalten
- A/B-Test: Retell vs. OpenAI (Qualität, Kosten, Conversion)
- Wenn OpenAI gleichwertig → schrittweise Migration

**Kosten Phase 1:** ~$40-60/Monat/Betrieb (Retell optimiert)
**Kosten Phase 2:** ~$30/Monat/Betrieb (OpenAI für neue Tenants)

**Vorteile:**
- Kein Risiko (bestehende Agents bleiben)
- Datenbasierte Entscheidung (A/B statt Bauchgefühl)
- Schrittweise Migration möglich

**Nachteile:**
- Zwei Systeme parallel = mehr Wartung
- OpenAI-Pilot braucht Engineering-Zeit

---

## 5. Empfehlung: Option C (Hybrid)

### Warum?

| Kriterium | A (Retell bleiben) | B (OpenAI sofort) | **C (Hybrid)** |
|-----------|-------------------|-------------------|----------------|
| Risiko | Niedrig | Hoch | **Niedrig** |
| Kosten-Reduktion | -40-50% | -70-80% | **-50% sofort, -70% perspektivisch** |
| Aufwand | Gering | Hoch (2-3 Tage) | **Gering sofort, gestaffelt** |
| Qualitäts-Risiko | Keins | Unbekannt | **Keins (A/B-Test)** |
| Vendor-Lock-in | Retell | OpenAI | **Diversifiziert** |

### Sofort-Massnahmen (Phase 1, heute umsetzbar)

1. **LLM auf GPT-4o mini umstellen** in allen Agents → spart ~$0.05/min
2. **Post-Call Analysis auf gpt-4.1-mini** (bereits der Fall) ✅
3. **Prompt-Optimierung:** Schnelleres Closing, weniger Rückfragen → kürzere Calls
4. **Retell kontaktieren** für Volume Pricing (>50k Min/Monat Commitment)

### Mittelfristig (Phase 2, Q2 2026)

5. **OpenAI Realtime Pilot** mit einem neuen Tenant
6. **Vergleichs-Metriken:** Cost/Call, Extraction-Quality, Customer Satisfaction
7. **Entscheidung:** Migrate oder bleiben

---

## 6. Kostenprojektion

### Bei 10 aktiven Betrieben (Ziel H2 2026)

| Szenario | Voice-Kosten/Monat | MRR | Marge |
|----------|-------------------|-----|-------|
| IST (Retell unoptimiert) | ~$1'000 | CHF 2'990 | 67% |
| Option A (Retell optimiert) | ~$500 | CHF 2'990 | 83% |
| Option B (OpenAI) | ~$300 | CHF 2'990 | 90% |
| **Option C Phase 1** | **~$500** | **CHF 2'990** | **83%** |
| **Option C Phase 2** | **~$350** | **CHF 2'990** | **88%** |

### Bei 50 aktiven Betrieben (Ziel 2027)

| Szenario | Voice-Kosten/Monat | MRR | Marge |
|----------|-------------------|-----|-------|
| IST (Retell unoptimiert) | ~$5'000 | CHF 14'950 | 67% |
| Option A (Retell optimiert) | ~$2'500 | CHF 14'950 | 83% |
| Option B (OpenAI) | ~$1'500 | CHF 14'950 | 90% |
| **Option C Phase 2** | **~$1'750** | **CHF 14'950** | **88%** |

---

## 7. Nächste Schritte

| # | Aktion | Wer | Wann |
|---|--------|-----|------|
| 1 | **Founder-Entscheidung:** A, B oder C? | Founder | Sofort |
| 2 | LLM auf GPT-4o mini umstellen (alle Agents) | CC | Nach Entscheidung |
| 3 | Retell Enterprise-Team kontaktieren | Founder | Diese Woche |
| 4 | OpenAI Realtime API evaluieren (Technical Spike) | CC | Q2 2026 |
| 5 | Prompt-Optimierung für kürzere Calls | CC + Founder | Laufend |
