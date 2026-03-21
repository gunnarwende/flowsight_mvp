# Voice AI — Strategische Entscheidung

**Version:** 2.0 | **Datum:** 2026-03-21
**Status:** Entscheidung OFFEN — Founder-Input nötig
**Auslöser:** Testanruf 21.03. → 3 Min = $0.50 Retell-Kosten. Erweitert um vollständige End-to-End-Kostenstruktur pro Fall.

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

---

## 7. End-to-End Kostenstruktur pro Fall

### 7.1 Die reale Kommunikationskette

Ein Kundenfall durchläuft diese Kette — jeder Schritt verursacht variable Kosten:

```
Kunde ruft an
  → [1] Voice Agent (Retell) nimmt auf                    VARIABLE — $0.15-0.20/min
  → [2] Case wird in Supabase erstellt                    GRATIS (Free Tier)
  → [3] E-Mail an Betrieb (Ops-Notification)              GRATIS (Resend Free Tier)
  → [4] SMS an Melder (Bestätigung + Korrekturlink)       VARIABLE — CHF 0.20-0.28 (2 Segmente!)

Betrieb bearbeitet im Leitstand
  → [5] E-Mail an Techniker (Zuweisung)                   GRATIS
  → [6] E-Mail+ICS an Techniker (Termin)                  GRATIS
  → [7] E-Mail an Melder (Terminbestätigung)              GRATIS (wenn E-Mail vorhanden)
  → [8] SMS an Melder (Terminbestätigung, Fallback)       CONDITIONAL — CHF 0.10-0.14
  → [9] SMS an Melder (24h-Erinnerung)                    CONDITIONAL — CHF 0.10-0.14

Fall erledigt
  → [10] E-Mail an Melder (Review-Anfrage, primär)        GRATIS
  → [11] SMS an Melder (Review-Anfrage, Fallback)         CONDITIONAL — CHF 0.10-0.14
```

### 7.2 Kostenbausteine

| # | Baustein | Status | Quelle | Betrag | Confidence |
|---|----------|--------|--------|--------|------------|
| 1 | **Retell Platform Fee** | LIVE | retellai.com/pricing | $0.07/min | Known |
| 2 | **Retell LLM (GPT-4.1)** | LIVE | Agent JSON `model: "gpt-4.1"` | ~$0.06-0.08/min | Assumption (Retell transparent pricing, aber exakter GPT-4.1 Preis = OpenAI-Rate) |
| 3 | **Retell TTS (ElevenLabs Laura)** | LIVE | In Platform-Fee gebündelt | $0 separat | Known (bundled) |
| 4 | **Post-Call SMS** | LIVE, AUTOMATISCH | `postCallSms.ts`, `webhook/route.ts:557` | CHF 0.20-0.28 (2 Segmente) | Known (Template > 160 Chars) |
| 5 | **Termin-SMS an Melder** | LIVE, MANUELL | Matrix §4.2, Button "Termin versenden" | CHF 0.10-0.14 | Known |
| 6 | **24h-Reminder-SMS** | LIVE, AUTOMATISCH | `lifecycle/tick` processTerminReminders | CHF 0.10-0.14 | Known (wenn Modul aktiv) |
| 7 | **Review-SMS (Fallback)** | LIVE, MANUELL | `request-review/route.ts:154-163` | CHF 0.10-0.14 | Known (nur wenn keine E-Mail) |
| 8 | **E-Mails (alle)** | LIVE | Resend Free Tier | $0.00 | Known (bis 3'000/Monat) |
| 9 | **eCall Grundgebühr** | LIVE | eCall-Vertrag | **UNBEKANNT** | Unknown — Founder muss prüfen |
| 10 | **eCall SMS-Preis exakt** | LIVE | eCall-Vertrag / Portal | CHF 0.10-0.14 | Assumption — aus Matrix_kommunikation.md, nicht vertraglich belegt |

### 7.3 Wichtige Code-Fakten

**Post-Call SMS Template (die teuerste SMS):**
```
"{Sender}: Ihre Meldung {Kategorie} wurde erfasst. Bitte Name & Adresse prüfen und Fotos hochladen:
https://flowsight.ch/v/WB-0123?t=a7c8e2f1b3d4"
```
→ ~200-250 Zeichen → **2 SMS-Segmente** → doppelte Kosten.
Quelle: `postCallSms.ts:39`

**Review-Anfrage: E-Mail PRIMÄR, SMS nur Fallback:**
```typescript
// request-review/route.ts:141-163
if (row.contact_email) {
  sent = await sendReviewRequest({ ... }); // E-Mail primär
}
if (!sent && row.contact_phone) {
  // SMS nur wenn E-Mail nicht vorhanden oder fehlgeschlagen
  const smsBody = `${senderName}: Vielen Dank ...`;
  const smsResult = await sendSms(row.contact_phone, smsBody, senderName);
}
```
→ Voice-Fälle haben KEINE E-Mail → Review geht IMMER per SMS bei Voice-Cases.
→ Wizard-Fälle haben E-Mail → Review geht per E-Mail (gratis).

**Termin-SMS: Nur wenn KEINE E-Mail vorhanden:**
Matrix §4.2: "SMS → Manueller Klick + KEINE E-Mail + Telefon vorhanden + SMS aktiv"
→ Voice-Fälle → Termin per SMS (kostenpflichtig)
→ Wizard-Fälle → Termin per E-Mail (gratis)

### 7.4 Szenariorechnung

#### A) Minimalfall — Voice-Call, nur Bestätigung

| Baustein | Betrag |
|----------|--------|
| Voice Call (2 min × $0.17/min) | $0.34 |
| Post-Call SMS (2 Segmente) | CHF 0.24 |
| Ops-E-Mail | $0.00 |
| **TOTAL** | **$0.34 + CHF 0.24 ≈ CHF 0.55** |

Kein Termin, keine Review-Anfrage, Fall wird direkt erledigt oder ignoriert.

#### B) Typischer Fall — Voice + Termin + Review

| Baustein | Betrag |
|----------|--------|
| Voice Call (2.5 min × $0.17/min) | $0.43 |
| Post-Call SMS (2 Segmente) | CHF 0.24 |
| Termin-SMS an Melder (1 Segment) | CHF 0.12 |
| 24h-Reminder-SMS (1 Segment) | CHF 0.12 |
| Review-SMS (1 Segment, Fallback weil Voice=kein Email) | CHF 0.12 |
| E-Mails (Ops + Techniker + ICS) | $0.00 |
| **TOTAL** | **$0.43 + CHF 0.60 ≈ CHF 1.00** |

Der typische Voice-Fall kostet **~CHF 1.00** an variablen Kommunikationskosten.

#### C) Erweiterter Fall — Voice + Termin-Änderung + Review + Alternativ-Pfade

| Baustein | Betrag |
|----------|--------|
| Voice Call (3 min × $0.17/min) | $0.51 |
| Post-Call SMS (2 Segmente) | CHF 0.24 |
| Termin-SMS an Melder (1×) | CHF 0.12 |
| Termin-Änderung SMS (2×) | CHF 0.24 |
| 24h-Reminder-SMS (1×) | CHF 0.12 |
| Review-SMS (1×) | CHF 0.12 |
| Nochmals-Anfragen SMS (2. Review, 7d später) | CHF 0.12 |
| E-Mails (Ops + Techniker + ICS + Reminder) | $0.00 |
| **TOTAL** | **$0.51 + CHF 0.96 ≈ CHF 1.45** |

#### Wizard-Vergleich: Typischer Wizard-Fall

| Baustein | Betrag |
|----------|--------|
| Voice Call | $0.00 (kein Anruf) |
| Post-Call SMS (Bestätigung) | CHF 0.24 |
| Termin per E-Mail (Wizard hat E-Mail) | $0.00 |
| Reminder per E-Mail | $0.00 |
| Review per E-Mail (Wizard hat E-Mail) | $0.00 |
| **TOTAL** | **CHF 0.24** |

→ Wizard-Fälle kosten **75-80% weniger** als Voice-Fälle, weil die meiste Kommunikation per E-Mail läuft.

### 7.5 Fixkosten-Umlage

| Fixkosten (monatlich) | Betrag |
|----------------------|--------|
| eCall Grundgebühr | **UNBEKANNT** (Founder-Check) |
| Retell (kein Minimum) | $0 |
| Twilio SIP | ~$3-5 |
| Vercel/Supabase/Resend | $0 (Free Tier) |
| **Geschätzte Fixkosten** | **~$5 + eCall** |

| Umlage pro Fall | 100 Fälle/Mo | 300 Fälle/Mo | 1'000 Fälle/Mo |
|-----------------|-------------|-------------|----------------|
| $5 Fixkosten | $0.05/Fall | $0.02/Fall | $0.005/Fall |
| Falls eCall CHF 40/Mo | CHF 0.40/Fall | CHF 0.13/Fall | CHF 0.04/Fall |

→ Fixkosten sind bei Scale vernachlässigbar. Variablen Kosten dominieren.

### 7.6 Grösster Kostentreiber: Voice vs. SMS

| Kostentreiber | Anteil am typischen Fall | Optimierungshebel |
|---------------|-------------------------|-------------------|
| **Voice (Retell)** | ~43% (CHF 0.43 von CHF 1.00) | LLM auf GPT-4o mini (-40%), kürzere Calls, OpenAI Realtime (-70%) |
| **SMS (eCall)** | ~57% (CHF 0.60 von CHF 1.00) | Post-Call SMS auf ≤160 Chars (-40%), E-Mail statt SMS wo möglich |

**Überraschende Erkenntnis:** SMS-Kosten sind HÖHER als Voice-Kosten pro Fall.
Der initiale Fokus auf "Voice ist zu teuer" war zu eng — die SMS-Kette ist der grössere Hebel bei Voice-Fällen.

### 7.7 Offene Lücken

| Lücke | Impact auf Rechnung | Schnellster Weg zur Klärung |
|-------|--------------------|-----------------------------|
| **eCall exakter SMS-Preis** | ±30% auf SMS-Kosten | eCall-Portal Login → Preisliste oder Vertrag prüfen |
| **eCall Grundgebühr** | Fixkosten-Umlage unklar | eCall-Portal → Rechnungen der letzten 3 Monate prüfen |
| **Retell GPT-4.1 exakter LLM-Preis** | ±20% auf Voice-Kosten | Retell Dashboard → Usage → Cost Breakdown |
| **Retell Enterprise Pricing** | Könnte Platform-Fee von $0.07 auf $0.04-0.05 senken | Retell kontaktieren (sales@retellai.com) |

---

---

## 8. Challenge & Korrektur (21.03., Nachmittag)

### Was geprüft und korrigiert wurde

**Korrektur 1: Post-Call SMS ist NICHT 2 Segmente.**
Die Behauptung in §7.2/§7.6 "200-250 Chars → 2 Segmente → doppelte Kosten" war **falsch**. Tatsächliche Zeichenzählung gegen den echten Code (`postCallSms.ts:39`) mit realen Daten:
- Weinberger + Rohrbruch + Short-Token-URL = **148 Zeichen** → 1 Segment
- Dörfler + Leck = **137 Zeichen** → 1 Segment
- **Korrektur:** Post-Call SMS kostet CHF 0.10-0.14, nicht CHF 0.20-0.28.

**Korrektur 2: "OpenAI Realtime ist 70-80% günstiger" war FALSCH.**
Die $0.04/min-Zahl aus §3 stammte aus Web-Recherche und bezog sich auf Text-Tokens, nicht Audio-Tokens. OpenAI Realtime verwendet Audio-Tokens (~128 Tokens/Sekunde), die deutlich teurer sind. Gegen den echten Testanruf (3.34 min = $0.50 auf Retell) gerechnet:

| Stack | 3.34-min Call | vs. Retell IST |
|-------|-------------|----------------|
| **Retell IST (GPT-4.1 + ElevenLabs)** | **$0.50** | Referenz (gemessen) |
| OpenAI gpt-4o-realtime | **$1.43** | **2.9× TEURER** |
| OpenAI gpt-4o-mini-realtime | **$0.36** | 28% günstiger |
| **Retell + GPT-4o-mini (optimiert)** | **~$0.33** | **34% günstiger** |

→ OpenAI Realtime mit dem vollen Modell ist fast 3× teurer als Retell.
→ Retell mit GPT-4o-mini ist sogar günstiger als OpenAI Mini — ohne Migration.

**Korrektur 3: SMS-Kostenanteil war überhöht.**
Durch die Korrektur der Post-Call SMS (1 Segment statt 2) verschiebt sich das Verhältnis:

| Typischer 3-min Voice-Fall (korrigiert) | Betrag |
|----------------------------------------|--------|
| Voice (3.34 min × $0.15/min) | **$0.50** = CHF 0.46 |
| Post-Call SMS (1 Segment) | CHF 0.12 |
| Termin-SMS (conditional, 1 Segment) | CHF 0.12 |
| Reminder-SMS (conditional, 1 Segment) | CHF 0.12 |
| Review-SMS (conditional, 1 Segment) | CHF 0.12 |
| E-Mails (alle) | CHF 0.00 |
| **TOTAL (alle SMS-Events)** | **CHF 0.94** |
| **TOTAL (nur sichere: Voice + Post-Call)** | **CHF 0.58** |

→ **Voice ist der Hauptkostentreiber (79% des sicheren Minimums), nicht SMS.**
→ SMS wird erst dominant wenn 3+ optionale SMS pro Fall gesendet werden (unwahrscheinlich im Regelfall).

### 8.1 Der 3-Minuten-Fall: Retell vs. OpenAI (ehrlicher Vergleich)

**Annahmen (challenged + bestätigt):**
- Gesprächsdauer: 3.34 min (gemessen, call_7c631d627fc1052e511e0a3f885)
- Retell-Kosten: $0.50/Call (gemessen im Dashboard, Confidence: KNOWN)
- Retell per-min Rate: $0.15/min (daraus abgeleitet, Confidence: KNOWN)
- OpenAI Audio-Token-Rate: 128 Tokens/Sek (OpenAI Docs, Confidence: KNOWN)
- OpenAI gpt-4o-realtime: $40/$80 per 1M Input/Output Audio Tokens (Confidence: KNOWN, openai.com/api/pricing)
- OpenAI gpt-4o-mini-realtime: $10/$20 per 1M (Confidence: KNOWN)
- Caller/Agent Sprechanteil: 60/40% (Assumption, typisch für Intake)
- eCall SMS: CHF 0.12/SMS (Confidence: ASSUMPTION, ±30%)

**A) Heutiger Retell-Pfad (3-min Voice-Fall, sicher live):**

| Baustein | Status | Betrag | Confidence |
|----------|--------|--------|------------|
| Retell Voice (3.34 min) | LIVE, automatisch | $0.50 = CHF 0.46 | **KNOWN** (gemessen) |
| Post-Call SMS (1 Segment) | LIVE, automatisch | CHF 0.12 | Assumption (±30%) |
| Ops-E-Mail | LIVE, automatisch | CHF 0.00 | KNOWN |
| **Sicheres Minimum** | | **CHF 0.58** | |
| + Termin-SMS (manuell, conditional) | LIVE, manuell | CHF 0.12 | Assumption |
| + Reminder-SMS (auto, conditional) | LIVE, automatisch wenn Termin | CHF 0.12 | Assumption |
| + Review-SMS (manuell, conditional) | LIVE, manuell, nur Voice-Fälle | CHF 0.12 | Assumption |
| **Typischer Fall (Voice + Termin + Review)** | | **CHF 0.82** | |

**B) Retell optimiert (GPT-4o-mini statt GPT-4.1):**

| Baustein | Betrag | vs. IST |
|----------|--------|---------|
| Retell Voice (3.34 min, GPT-4o-mini) | ~$0.33 = CHF 0.31 | **-34%** |
| Post-Call SMS | CHF 0.12 | gleich |
| **Sicheres Minimum** | **CHF 0.43** | **-26%** |
| **Typischer Fall** | **CHF 0.67** | **-18%** |

**C) OpenAI Realtime als Vergleich (hypothetisch):**

| Modell | Voice-Kosten (3.34 min) | vs. Retell IST | vs. Retell optimiert |
|--------|------------------------|----------------|---------------------|
| gpt-4o-realtime | $1.43 = CHF 1.32 | **+186% TEURER** | +325% TEURER |
| gpt-4o-mini-realtime | $0.36 = CHF 0.33 | -28% günstiger | **±0% (gleich)** |

→ OpenAI Realtime lohnt sich NUR mit dem Mini-Modell — und selbst da ist der Vorteil gegenüber Retell-optimiert minimal (~CHF 0.02 pro Call).
→ Dafür: kein Conversation-Flow-Builder, keine strukturierte Post-Call-Analysis, komplette Migration nötig.

### 8.2 Klare Founder-Schlussfolgerung

**Ist OpenAI konkret günstiger?**
Nein — nicht bei vergleichbarer Qualität. OpenAI gpt-4o-realtime (das vergleichbare Modell) ist 3× teurer. Die Mini-Variante ist marginal günstiger als Retell-optimiert, aber ohne Retells Datenextraktions-Feature.

**Wie gross ist der Hebel wirklich?**
Der einzig relevante Hebel ist **LLM-Downgrade von GPT-4.1 auf GPT-4o-mini innerhalb Retell**:
- Spart ~$0.17 pro Call (von $0.50 auf ~$0.33)
- Bei 10 Betrieben à 5 Calls/Tag = **~$187/Monat Ersparnis**
- Kein Migrationsrisiko, Config-Änderung in den Agent JSONs

**Ist Voice der Hauptkostentreiber oder SMS?**
**Einzelner Voice-Call:** Voice dominiert (79%). **Gesamtes Betriebsprofil:** SMS dominiert (57-84%), weil SMS an ALLE Fälle geht (Voice + Wizard), während Voice nur Voice-Fälle betrifft. Siehe finale Analyse: `pricing_und_marge.md` §4 (10 Realitätsprofile).

**Welche Architekturentscheidung folgt daraus heute?**
**Option A (Retell optimieren) ist der richtige Weg — nicht Option C (Hybrid).**

Die Hybrid-Empfehlung in §5 basierte auf der falschen Annahme, dass OpenAI Realtime dramatisch günstiger sei. Das stimmt nicht. Der reale Hebel liegt bei:
1. LLM-Downgrade innerhalb Retell (sofort, -34% Voice-Kosten)
2. Retell Volume Pricing verhandeln (mittelfristig, weitere -20-30%)
3. OpenAI Realtime beobachten, aber NICHT aktiv pilotieren (Kosten-Vorteil zu gering)

### 8.3 Empfehlung (korrigiert)

**Bleib bei Retell. Stelle das LLM auf GPT-4o-mini um.** Das senkt die Voice-Kosten pro Call von $0.50 auf ~$0.33 — ohne Migrationsrisiko, ohne neuen Code, ohne Qualitäts-Einbussen bei einem 7-Fragen-Intake. OpenAI Realtime ist bei Audio-Token-Pricing kein Kostenvorteil und bringt Nachteile bei strukturierter Datenextraktion. Verhandle parallel mit Retell Enterprise-Pricing — bei 50+ Betrieben wird das der zweite Hebel. Die SMS-Kosten sind korrekt aber nicht der Haupttreiber — Voice dominiert mit 79% der sicheren Kosten pro Fall.

---

## Founder-Fazit (korrigiert)

1. **Ein Voice-Fall kostet sicher CHF 0.58 (Voice + Post-Call SMS), typisch ~CHF 0.82 (+ Termin + Review).** Die vorherige Schätzung (CHF 1.00) war zu hoch wegen falscher SMS-Segment-Annahme.
2. **Voice ist der Hauptkostentreiber (79%), nicht SMS.** Der grösste Sofort-Hebel ist LLM-Downgrade auf GPT-4o-mini: spart 34% Voice-Kosten, keine Migration nötig.
3. **OpenAI Realtime ist KEIN Kostenvorteil** bei vergleichbarer Qualität. Audio-Tokens sind teuer. Retell optimiert + Enterprise-Pricing ist der richtige Weg.

---

---

## 9. Pricing- und Margen-Implikation

**Vollständige Analyse:** `docs/redesign/leitstand/pricing_und_marge.md`

### Kernaussage

CHF 299 ist für **80% unseres ICP (3-20 MA) extrem profitabel** — 80-95% Marge. Das 4-stufige Pricing (299/499/899/1290) bestraft die Mitte unnötig. Stattdessen:

| Tier | MA | Preis | Marge (optimiert) | Inkl. Fälle |
|------|-----|-------|-------------------|-------------|
| **Standard** | ≤20 | CHF 299 | 80-95% | 200/Mo |
| **Professional** | 21-30 | CHF 799 | 89% | 400/Mo |
| **Enterprise** | 30+ | Custom | Custom | Custom |

**Sweetspot:** 4-10 MA Betriebe. CHF 26-40 variable Kosten bei CHF 299 Umsatz = 87-91% Marge.
**Gefährlich:** 30+ MA bei CHF 299 = nur 61% Marge. Braucht Custom-Pricing.

---

## 10. Nächste Schritte (aktualisiert)

| # | Aktion | Wer | Wann |
|---|--------|-----|------|
| 1 | **LLM auf GPT-4o-mini umstellen** (alle Agents) → -34% Voice-Kosten | CC | Sofort (nach Founder-OK) |
| 2 | **eCall SMS-Preis + Grundgebühr klären** (Portal/Vertrag) | Founder | Diese Woche |
| 3 | **Retell Dashboard Usage prüfen** → exakte Kosten-Breakdown | Founder | Diese Woche |
| 4 | **Pricing-Page anpassen** (Standard + Professional + Custom) | CC + Founder | Nach Pricing-Entscheidung |
| 5 | **Retell Enterprise-Team kontaktieren** (Volume Discount ab 50k Min/Mo) | Founder | Wenn >5 Betriebe |
| 6 | OpenAI Realtime beobachten (NICHT pilotieren — kein Kostenvorteil) | CC | Laufend |
