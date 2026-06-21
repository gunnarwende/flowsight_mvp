# Audio-Pipeline — Der Masterplan

**Status:** 🟢 Phase A DONE (autonom gebaut Nacht 24→25.04.) | **Datum:** 2026-04-25 Morning
**Autor:** CC (Head Ops) — unter Founder-Briefing vom 24.04. + Klärung 24.04. Abend
**Lebt in:** `docs/gtm/pipeline/06_video_production/AUDIO_PIPELINE_PLAN.md`
**SSOT für Audio-Phase.** Phase-A-Learnings in PIPELINE_BIBLE §35 kodifiziert.

## 🟢 Phase A Completion Summary (2026-04-25 Morning)

**80/80 Quality-Gates PASS.** Alle 4 Referenz-Betriebe (Dörfler, Leins, Stark, Wälti) haben komplette Audio-Baseline:
- Take 1 Audio (~62s), Take 2 Notruf (~339s), Take 2 Preis (~335s), Take 3 (~170s), Take 4 (~152s)
- 20 Preview-Videos (Audio auf bestehendes Screenflow mit Freeze-Last-Frame bei Overlap)
- 20 MP3-Exports (~192kbps für Email-Review)
- HTML-QG-Report: `_generated/QUALITY_GATE_REPORT.html`

**Scripts gebaut (alle unter `scripts/_ops/audio/`):**
- `_lib/env.mjs` (env loader)
- `_lib/ffmpeg.mjs` (clean, loudnorm, concat, mux, waveform render)
- `_lib/eleven.mjs` (ElevenLabs TTS + content-addressed cache)
- `_lib/quality.mjs` (loudness/clipping/duration/silence gates)
- `_lib/scripts_parser.mjs` (call script parser)
- `_lib/lisa_lines.mjs` (canonical Lisa turns + variant/tenant resolver)
- `clean_founder_audio.mjs`
- `generate_lisa_tts.mjs`
- `assemble_call.mjs`
- `assemble_take2.mjs`
- `assemble_take_simple.mjs`
- `build_preview_video.mjs`
- `quality_gate_report.mjs`

**Output-Tree:**
```
docs/gtm/pipeline/06_video_production/
  _clean/                          # 36 cleaned Founder audios
  _generated/
    lisa_tts/
      _cache/                      # content-hashed MP3 cache
      generic/                     # 9 generic + 2 variant TTS WAVs
      tenants/<slug>/agent_01.wav  # 4 tenant greetings
    calls/<slug>/call_<variant>.wav    # 8 assembled calls
    takes/<slug>/take{1,2_notruf,2_preis,3,4}.wav  # 20 take audios
    audio_mp3/<slug>/              # MP3 exports
    previews/<slug>/               # preview videos
    QUALITY_GATE_REPORT.html       # single-file review artifact
```

**Nächste Schritte (Phase B):**
1. **Founder-Review** der QG-Reports (HTML in Browser öffnen, Audio-MP3s anhören, Preview-Videos schauen).
2. **Falls FB auf Lisa-Zeile:** Text in `_lib/lisa_lines.mjs` editieren → Cache-Key invalidiert sich automatisch → `generate_lisa_tts.mjs` neu laufen (nur geänderte Zeile re-generiert).
3. **Phase B-1:** Playwright-Scripts für Take 2 Screenflow anpassen — von 93s auf ~340s, Audio-Anchor pro Satz.
4. **Phase B-2:** Take 3 auf 170s, Take 4 auf 152s retimen.
5. **Phase B-3:** Take 1 Screenflow für Leins/Stark/Wälti aufnehmen (nur Dörfler hat bisher eins).

## ✅ Founder-Klarstellungen (24.04. Abend)

| Frage | Antwort | Konsequenz |
|-------|---------|------------|
| ElevenLabs API + Voice-IDs | `NE7AIW5DoJ7lUosXV2KR` (Ela), `aMSt68OGf4xUZAnLpTU8` (Juniper), `Yyo65tdqHVByAa8sywXw` (Gunnar Fallback) — bereits in codebase dokumentiert | ✅ Voice-IDs geklärt. API-Key offen (siehe §5.5) |
| Take 3/4 Längen | Founder-Audio = neue Referenz. Screenflow MUSS 100% auf Audio gestretcht werden (fein, nicht grob) | Screenflow-Retiming mit fein-granularer Timing-Config pro Satz |
| Final-Video-Struktur | **Aktuelle Struktur (Screenflow main + Face-PiP) ist FINAL.** Kein separates Loom-Main. | Vereinfacht Ebene 6 enorm — `take{N}_with_loom.mp4` ist bereits Zielformat |
| Take 1 Master.wav | 100% generisch, kein Firmenname. Kein STS nötig. | Take 1 ist cross-tenant identisch. Nur 1× Clean + Mastering |
| Skalierungs-Strategie | **Option B2 — 100% Autonomie + Generik.** Nur 2-3 individuelle Stellen (Lisa-Greeting, Notfall-vs-Preis-Video) | Face-PiP visuell neutral (Option B3 aus Q5). Face-PiP darf unabhängig von Turn #8-Sprachinhalt laufen — Lippen sind nicht detailliert sichtbar im kleinen PiP. |
| Multi-Branchen | **Pipeline muss Master-Pipeline für N Branchen sein** (Sanitär, Garagen, Elektriker, …). Grundlage JETZT richtig bauen. Pro Branche: neue Audios + neue Call-Scripts + neue Screenflow-Case-Typen. | Architektur bekommt `industry`-Dimension in tenant_config. Audio-Ordner-Struktur entsprechend. Siehe §5a Multi-Branchen-Architektur |
| Audio-Sync | **100% absolut perfekt synchron** — "Bild für Bild, Ton für Ton". Riesiger Initialaufwand OK, dann keine FB-Loops | Jeder gesprochene Satz bekommt einen Screenflow-Anchor. Timing-Config ist kanonisch. |
| Bestehende Audios | **Nicht wegwerfen.** | `_clean/`-Ordner neben Originalen, nie replace |
| Learnings in Bible | **Jedes Learning permanent in Pipeline-Bible** festhalten, SSOT-Pflege laufend | Nach Phase-A: Bible §35 direkt. Nach jeder Phase: §-Update. Nach jedem Cross-Betrieb-FB: Anti-Drift-Fix + Bible-Ergänzung |

---

## 0. Executive Summary

Die Screenflow-Pipeline ist seit 24.04. 10/10 Production-Baseline (§34). Der nächste Block ist **Audio**, und zwar nach dem Prinzip "**von innen nach außen bauen**":

```
[Call Notruf+Preis] → [Take 2 A-F] → [Take 3 A-E, Take 4 A-E, Take 1] → [Audio × Screenflow Mapping] → [Tenant-Swap pro Betrieb] → [Loom-Aufnahme Founder] → [Finales Video pro Betrieb]
```

**Kernprinzip:** Audio ist führend. Screenflow + Loom werden auf Audio-Länge gemappt, nicht umgekehrt. Pro Betrieb wird **eine einzige Lisa-Audio-Zeile** (das Greeting "Hallo, hier ist Lisa von {{firma}}") dynamisch per ElevenLabs generiert — alles andere ist generisch und wird **einmal gebaut, unendlich oft wiederverwendet**.

**Das Bermuda-Dreieck (Founder-Term):**
> Firmenname-Erwähnung muss an allen drei Stellen (Lisa-Greeting im Call, Founder-Audio in Take 2/F, Loom-Video-Lippen) **identisch lang** sein — sonst ist der Lip-Sync futsch.

**Ausnahme Take 2:** Wegen der zwei Call-Varianten (Notruf vs Preis) wird Founder **zwei Loom-Videos** aufnehmen — eins pro Variante. Das erspart Lip-Sync-Schmerz beim einzigen unterschiedlichen User-Turn (#8).

---

## 1. Inventar — Was Founder bereits geliefert hat

### 1.1 Scripts

| Datei | Inhalt | Status |
|-------|--------|--------|
| `docs/gtm/Final_generic_scripting.txt` | Master-Speakflow Take 1-4, komplett durchgeschrieben | ✅ final |
| `docs/gtm/pipeline/06_video_production/mini_takes/Take2/call/Notruf/notruf.txt` | Call-Script Notruf-Variante, 10 User-Zeilen + 11 Agent-Zeilen | ✅ final |
| `docs/gtm/pipeline/06_video_production/mini_takes/Take2/call/Preis/preis.txt` | Call-Script Preis-Variante, 10 User-Zeilen + 11 Agent-Zeilen | ✅ final |

**Delta zwischen Notruf und Preis:** Nur User-Zeile #8 und Agent-Zeile #8 sind unterschiedlich. Alles andere (Zeilen 1-7, 9-11) ist 1:1 identisch.

### 1.2 Founder-Audios (Ist-Zustand)

| Pfad | Datei | Dauer | Bemerkung |
|------|-------|-------|-----------|
| `master_takes/take1/` | `Master.wav` | **63.6s** | Take 1 komplett, durchgehend |
| `mini_takes/Take2/` | `A.wav` | 34.1s | Segment A (vor Anruf) |
| | `C.wav` | 31.7s | nach Anruf |
| | `D.wav` | 47.4s | Segment D |
| | `E.wav` | 38.1s | Segment E |
| | `F.wav` | 57.5s | Segment F (Abschluss) |
| | (B fehlt = Call) | — | wird von CC gebaut |
| `mini_takes/Take2/call/Notruf/Audio/` | `1.wav` – `10.wav` | 73.2s (Summe) | 10 User-Turns Notruf |
| `mini_takes/Take2/call/Preis/Audio/` | `1.wav` – `10.wav` | 72.4s (Summe) | 10 User-Turns Preis |
| `mini_takes/Take3/` | `A.wav` – `E.wav` | 185.4s | 5 Segmente |
| `mini_takes/Take4/` | `A.wav` – `E.wav` | 165.9s | 5 Segmente |

**Summe Founder-Audio insgesamt:** ca. 850s = 14:10 min reine Aufnahme-Arbeit. 👏

### 1.3 Bekannte Qualitäts-Artefakte

- **Maus-Klick am Ende jedes Segments** (Founder-Hinweis vom 24.04.) — muss raus.
- **Unterschiedliche Lautstärken** zwischen Segmenten (vermutet, nicht verifiziert) — wird normalisiert.
- **Natürliche Pausen** zwischen Segmenten könnten zu lang sein — wird per Gate kontrolliert.

### 1.4 Was NOCH fehlt (CC muss bauen)

- **Lisa-Agent-Zeilen als TTS** (11 Zeilen pro Call-Variante, 22 Lisa-Audios insgesamt + 1 Juniper-Zeile für Englisch-Switch)
- **Lisa-Greeting pro Tenant** (#1 der Agent-Zeilen, enthält Firmenname) — dynamisch pro Betrieb
- **ElevenLabs-API-Key** (aktuell NICHT in `.env.local` → Founder muss setzen, siehe §5.5)

### 1.5 Screenflow-Baseline (für Längen-Alignment)

Aktueller Screenflow (Dörfler AG):
- Take 2: 93.6s (Samsung 33.6s + Leitsystem 59.8s) → Audio-Bedarf: ~370s → **Faktor 4× Längen-Differenz**
- Take 3: 60.9s → Audio: 185s → Faktor 3×
- Take 4: 106.4s → Audio: 166s → Faktor 1.6×

**Implikation:** Der aktuelle Screenflow ist **visueller Sprint**. Audio erzählt narrativ. Screenflow muss entweder (A) verlängert werden (langsamere `waitForTimeout` in Recording-Scripts), oder (B) als **PiP-Einblendung** über einem **Loom-Founder-Face-Hauptvideo** laufen.

**Working Assumption:** (B) ist richtig — Loom ist Main-Video, Screenflow ist Phone-Mockup-PiP. Founder-Bestätigung im Plan-Approval nötig (siehe §9 Offene Punkte #3).

---

## 2. Ziel-Architektur — Sechs Ebenen von innen nach außen

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Ebene 6: FINAL VIDEO pro Betrieb pro Take                              │
│           take{N}_{tenant}_{variant}.mp4                                │
│           = Loom(Founder) + Screenflow(PiP) + Audio(gemastert)          │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▲
┌─────────────────────────────────────────────────────────────────────────┐
│  Ebene 5: AUDIO × SCREENFLOW MAPPING (pro Tenant)                       │
│           Audio-Beats anchoren Screenflow-Events + Loom-Sync            │
│           Output: take{N}_{tenant}_{variant}_audio.wav (Master)         │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▲
┌─────────────────────────────────────────────────────────────────────────┐
│  Ebene 4: TAKE-ASSEMBLY (pro Tenant)                                    │
│           Take 2 Notruf = A + B1 + C + D + E + F                        │
│           Take 2 Preis  = A + B2 + C + D + E + F                        │
│           Take 3        = A + B + C + D + E                             │
│           Take 4        = A + B + C + D + E                             │
│           Take 1        = Master (evtl. STS-Swap später)                │
│           Output: take{N}_{tenant}_{variant}_assembled.wav              │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▲
┌─────────────────────────────────────────────────────────────────────────┐
│  Ebene 3: CALL-ASSEMBLY (B1 Notruf + B2 Preis, pro Tenant)              │
│           Alternating: Lisa-Agent(#n) → Founder-User(#n) → Agent(#n+1)  │
│           Sprachwechsel EN: Agent#7 = Juniper, zurück Agent#8 = Ela     │
│           Output: B1_{tenant}.wav + B2_{tenant}.wav                     │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▲
┌─────────────────────────────────────────────────────────────────────────┐
│  Ebene 2: LISA-TTS GENERATION                                           │
│           (a) generisch (ein Mal für alle Betriebe)                     │
│               20× Ela-DE + 1× Juniper-EN                                │
│           (b) tenant-spezifisch (pro Betrieb)                           │
│               1× Ela-DE = Greeting mit {{firma}}                        │
│           Fix-Length-Regel: Greeting identisch lang ±100ms              │
│           Output: lisa_segments/_generic/ + lisa_segments/{slug}/       │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▲
┌─────────────────────────────────────────────────────────────────────────┐
│  Ebene 1: FOUNDER-AUDIO PREPROCESSING (ein Mal, nach Neu-Aufnahme)      │
│           - Maus-Klick-Entfernung (tail-trim)                           │
│           - Loudness-Normalisation -14 LUFS                             │
│           - Silence-Trim Anfang/Ende                                    │
│           - Fade-In/Fade-Out 50ms                                       │
│           Output: mini_takes/Take{N}/clean/*.wav                        │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▲
                  ROH-AUFNAHMEN VOM FOUNDER (Rode + Audacity)
```

**Warum innen nach außen?** Founder-Zitat 24.04.: "Hier möchte ich das hier von innen nach aussen bauen. Also bedeutet, innen ist der Call, ist der Anruf." Jede Ebene testet gegen Quality-Gates und wird erst nach Founder-Freigabe weiterverarbeitet.

---

## 3. Detail-Level pro Ebene

### Ebene 1: Preprocessing — Founder-Audios säubern

**Problem:** Jedes Founder-Segment hat am Ende einen Maus-Klick (Audacity Stop-Button).

**Fix (automatisiert):**
```bash
ffmpeg -i input.wav -af "
  silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,
  areverse,
  silenceremove=start_periods=1:start_duration=0.3:start_threshold=-35dB,
  areverse,
  afade=t=in:st=0:d=0.05,
  afade=t=out:st=${dur-0.05}:d=0.05,
  loudnorm=I=-14:TP=-1.5:LRA=11
" output.wav
```

**Was passiert:**
1. Stille am Anfang (> 50ms) entfernen
2. Audio umdrehen → 300ms "Ende" stille/klick-hafte Bereiche entfernen (höherer Threshold -35dB erwischt den Klick)
3. Umdrehen zurück
4. 50ms fade-in/out (saubere Kanten)
5. Lautstärke auf -14 LUFS normalisieren (YouTube/Mobile Standard, §D77)

**Quality-Gate Ebene 1:**
- [ ] `cleaned.wav` ist 100-600ms kürzer als `raw.wav` (Klick + Stille entfernt)
- [ ] Peak-Level -1.5 dBTP ± 0.5
- [ ] Integrated Loudness -14 LUFS ± 1
- [ ] Letzte 50ms haben kein Spike (Klick-Check via Amplitude-Threshold)

**Script:** `scripts/_ops/audio/clean_founder_audio.mjs`
**Input:** `mini_takes/Take{N}/**/*.wav` + `master_takes/take{N}/Master.wav`
**Output:** `mini_takes/Take{N}/_clean/*.wav` + `master_takes/take{N}/_clean/Master.wav`

**Idempotent:** Ja (re-run überschreibt, keine DB-Side-Effects).

---

### Ebene 2: Lisa-TTS Generation

**Voice-Engines:**
- **Ela (DE)** für alle deutschen Agent-Zeilen — matchend dem Live-Retell-Agent. Voice-ID siehe §9 Offene Punkte #1.
- **Juniper (INTL)** für die EINE englische Zeile im Sprachwechsel (Agent #7). Voice-ID siehe §9.

**Agent-Zeilen pro Call-Variante (insgesamt 11):**

Aus `notruf.txt` / `preis.txt` extrahiert:

| # | Sprecher | Zeile | Tenant-spezifisch? | Quelle |
|---|----------|-------|-------------------|--------|
| 1 | Ela | "Hallo, hier ist Lisa — die digitale Assistentin der **{{firma}}**. Wie kann ich Ihnen helfen?" | **✅ JA** | Per Tenant TTS |
| 2 | Ela | "Natürlich, das machen wir gerne für Sie. Erzählen Sie doch kurz, was genau passiert ist." | nein | 1× Generisch |
| 3 | Ela | "Oh, das klingt wirklich unangenehm. Da kümmern wir uns natürlich sofort darum. Wissen Sie, woher das Wasser kommt? Ist es eher ein Leck an einer Leitung, oder läuft es aus einem Gerät aus?" | nein | 1× Generisch |
| 4 | Ela | "Verstehe, das klingt dringend, das nehme ich sofort auf. Wie lautet die Strasse und Hausnummer des Einsatzortes?" | nein | 1× Generisch |
| 5 | Ela | "Alles klar, danke. Und die Postleitzahl und der Ort?" | nein | 1× Generisch |
| 6 | Ela | "Perfekt. Und könnten Sie mir als letztes sagen, wo unser Techniker klingeln darf?" | nein | 1× Generisch |
| 7 | **Juniper** | "Of course. I understand you have water in your basement — that sounds really stressful. Could you tell me where our technician should ring when they arrive?" | nein | 1× Generisch (INTL) |
| 8 | Ela | "Alles klar, ich mache auf Deutsch weiter. Wo darf unser Techniker klingeln?" | nein | 1× Generisch |
| 9a (**Notruf**) | Ela | "Dann hätten Sie uns genauso erreicht. Ich nehme den Fall auch dann sofort auf und gebe ihn direkt an den zuständigen Techniker weiter. Bei Notfällen sind wir rund um die Uhr erreichbar, auch an Sonn- und Feiertagen. Aber zurück zu Ihrem Anliegen: Wo darf unser Techniker bei Ihnen klingeln?" | nein | 1× Generisch (Notruf-Variante) |
| 9b (**Preis**) | Ela | "Das kommt ganz auf die Ursache und den Aufwand an — aus der Ferne wäre das nicht seriös einzuschätzen. Unsere Techniker schauen sich das deshalb zuerst vor Ort an. Aber zurück zu Ihrem Anliegen: Wo darf unser Techniker bei Ihnen klingeln?" | nein | 1× Generisch (Preis-Variante) |
| 10 | Ela | "Nein, dafür sind wir leider nicht zuständig. Aber zurück zum Wasserschaden: Wo darf unser Techniker klingeln, wenn er bei Ihnen eintrifft?" | nein | 1× Generisch |
| 11 | Ela | "Super, danke für die Info. Ich habe alles notiert. Sie erhalten gleich eine SMS auf Ihr Handy — dort können Sie die erfassten Daten nochmals prüfen, bei Bedarf korrigieren und auch Fotos vom Schaden hochladen. Das hilft unserem Techniker, sich optimal vorzubereiten. Ich wünsche Ihnen alles Gute, auf Wiederhören!" | nein | 1× Generisch |

**Summe:** 10 generische Ela-Zeilen + 1 Juniper + 1 Variant-Switch (#9a vs #9b) = **12 Audios einmalig**. Plus **1× Greeting pro Tenant**.

**Fix-Length-Regel für den Tenant-Greeting (#1):**

Die Silbenzahl des Firmennamens variiert:
- "Dörfler AG" → 3 Silben
- "Leins AG" → 3 Silben
- "Wälti & Sohn AG" → 6 Silben
- "Stark Haustechnik GmbH" → 7 Silben

Founder-Anforderung (Bermuda-Dreieck): **Greeting-Länge IDENTISCH über alle Betriebe** (±100ms), damit Lip-Sync im Loom-Video funktioniert.

**Technik:**
1. Alle Greeting-Varianten generieren mit ElevenLabs Ela (stability 0.5, similarity 0.75)
2. Dauer messen
3. Längste als Ziel setzen (z.B. "Stark Haustechnik GmbH" → 4.8s)
4. Kürzere mit **TRAILING SILENCE** auf Ziel-Dauer padden (nicht vorne — sonst Satzanfang zeitlich versetzt)
   - Alt.: Mit ElevenLabs `speed`-Parameter langsamer generieren bis Ziel erreicht ist (wenn verfügbar — experimentell prüfen)
5. Final-Gate: alle Greetings = Ziel-Dauer ± 100ms

**ElevenLabs API-Settings (fix für Reproducibility):**

```json
{
  "voice_id": "<ELA_ELEVENLABS_ID>",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.55,
    "similarity_boost": 0.75,
    "style": 0.1,
    "use_speaker_boost": true
  }
}
```

**Script:** `scripts/_ops/audio/generate_lisa_tts.mjs`
**Input:** Script-Text (aus `notruf.txt` / `preis.txt` parsen) + Tenant-Config (für Greeting)
**Output:**
- `mini_takes/Take2/call/_lisa/_generic/notruf/` — 10 generische Ela + 1 Juniper + 1 Variant-9a
- `mini_takes/Take2/call/_lisa/_generic/preis/` — 1 Variant-9b
- `mini_takes/Take2/call/_lisa/{slug}/greeting.wav` — pro Tenant

**Cost:** ElevenLabs charge ~$0.30 / 1000 chars. Ein Call (11 Zeilen, ~400 Zeichen gesamt) ≈ $0.12. Greeting pro Tenant ~$0.04. Für 100 Betriebe: ~$16 einmalige Generisch-Generation + $4 pro neue 100 Tenants. **Vernachlässigbar.**

**Quality-Gate Ebene 2:**
- [ ] Alle 12 generischen Audios existieren + Loudness-normalisiert
- [ ] Greeting-Dauer pro Tenant in Tolerance (±100ms zu Ziel)
- [ ] Stability-Check: Re-Run produziert identische Datei (zumindest byte-level gleich)
- [ ] A/B Hörtest: Klingt wie Live-Retell-Agent

---

### Ebene 3: Call-Assembly (B1 + B2)

**Ziel:** Eine einzige WAV pro Tenant pro Variante mit dem kompletten 21-Turn-Dialog.

**Reihenfolge pro Call:**

```
[Agent-Greeting-Tenant] → [User-#1] → [Agent-#2] → [User-#2] → [Agent-#3] → [User-#3] 
→ [Agent-#4] → [User-#4] → [Agent-#5] → [User-#5] → [Agent-#6] → [User-#6]
→ [Juniper-#7] → [User-#7] → [Agent-#8] → [User-#8 VARIANT]
→ [Agent-#9 VARIANT] → [User-#9] → [Agent-#10] → [User-#10] → [Agent-#11]
```

**Where VARIANT = Notruf | Preis** (beeinflusst nur User-#8, Agent-#9).

**Timing zwischen Turns:**
- Default-Gap: **300ms** (natürliche Gesprächspause)
- Ausnahme Turn #6→#7 (Switch EN): **600ms** (Founder denkt nach "Do you speak English?")
- Ausnahme Turn #7→#8 (Switch DE): **500ms**

**Cross-Fade:** 50ms zwischen Segmenten (Audio-Knackfreiheit).

**FFmpeg-Concat mit Gaps:**
```bash
ffmpeg -f concat -safe 0 -i concat_list.txt \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:a pcm_s24le B1_{tenant}.wav
```
(concat_list.txt enthält WAVs + Silenz-WAVs als Gaps)

**Quality-Gate Ebene 3:**
- [ ] Call-Dauer Notruf ≈ Preis (±3s, erlaubt wegen Turn #8 divergenz)
- [ ] Erste 3 Sekunden = Greeting (matcht Script)
- [ ] Kein Turn überlappt den vorherigen
- [ ] Alle Gaps zwischen 200-800ms (keine unnatürlichen Lücken)
- [ ] Loudness -14 LUFS ±1
- [ ] Waveform-Visualisierung ohne offensichtliche Artefakte

**Script:** `scripts/_ops/audio/assemble_call.mjs`
**Input:** `_clean/` Founder-Audios + `_lisa/_generic/` + `_lisa/{slug}/greeting.wav`
**Output:** `mini_takes/Take2/{slug}/B1.wav` + `B2.wav`

---

### Ebene 4: Take-Assembly (pro Tenant)

**Take 2 Notruf:** A + B1 + C + D + E + F
**Take 2 Preis:** A + B2 + C + D + E + F
**Take 3:** A + B + C + D + E
**Take 4:** A + B + C + D + E
**Take 1:** Master (ein Stück, evtl. später STS-Tenant-Swap, aktuell nicht nötig laut Script)

**Gap zwischen Segmenten:** 500ms (etwas länger als Turn-Gaps, erlaubt Szenen-Wechsel)

**Quality-Gate Ebene 4:**
- [ ] Gesamt-Dauer pro Take matcht Soll-Dauer aus Final_generic_scripting.txt ±10%
  - Take 1: Soll ~80s, Ist ~64s → OK im Rahmen
  - Take 2: Soll ~338s, Ist A+B+C+D+E+F ≈ 370s → OK
  - Take 3: Soll ~90s, Ist 186s → **MISMATCH** (Founder-Audio ist länger als Script-Angabe) → prüfen
  - Take 4: Soll ~90-100s, Ist 166s → **MISMATCH** → prüfen
- [ ] Alle Segment-Übergänge smooth (kein Klick/Knack)
- [ ] Konsistente Lautstärke
- [ ] Duration-Report: Sekundengenau pro Segment

**Action bei Take 3+4 Mismatch:** Mit Founder klären (siehe §9 Offene Punkte #2)

**Script:** `scripts/_ops/audio/assemble_take.mjs`
**Input:** `_clean/` Segmente + B1/B2 für Take 2
**Output:** `master_takes/take{N}/{slug}/take{N}_{variant}.wav`

---

### Ebene 5: Audio × Screenflow-Mapping (pro Tenant)

**Challenge:** Screenflow-Dauer ≪ Audio-Dauer (Faktor 2-4×).

**Lösung:** Screenflow wird AUF Audio-Länge **gestretcht** über Retiming der Recording-Events.

**Timing-Anchor-Konzept:**

Für Take 2 Notruf:

| Audio-Zeit | Audio-Segment | Screenflow-Event | Screenflow-Bereich |
|------------|---------------|------------------|--------------------|
| 0.0s – 34s | A (Intro) | Samsung Homescreen | Homescreen steht 34s |
| 34s – 38s | B1 Intro (Greeting klingelt) | Contact-Screen + Call-Start | 4s Anruf-Aufbau |
| 38s – 194s | B1 Call-Body | Call-Active (Samsung UI zeigt Anruf läuft) | 156s Call-Active |
| 194s – 200s | B1 Call-End | Call-Ended-Screen + SMS-Notification | 6s Call-End |
| 200s – 232s | C (SMS erklärt) | Samsung SMS-Thread | 32s SMS-Thread |
| 232s – 279s | D (Leitsystem intro) | Transition zu Leitsystem + App-Open | 47s inkl. Pop-Animation |
| 279s – 317s | E (Fall öffnen) | Leitsystem Fall-Detail | 38s |
| 317s – 375s | F (Abschluss) | Leitsystem Übersicht + Review-Teaser | 58s |

**Implementation:** Jedes Recording-Script bekommt eine **Timing-Config** die aus der Audio-Waveform abgeleitet wird:

```js
const timingConfig = {
  take2_notruf: {
    audioPath: "master_takes/take2/doerfler-ag/take2_notruf.wav",
    anchors: [
      { t: 0.0, event: "show_homescreen" },
      { t: 34.0, event: "open_contact" },
      { t: 38.0, event: "call_start" },
      { t: 194.0, event: "call_end" },
      { t: 200.0, event: "open_sms_thread" },
      { t: 232.0, event: "open_leitsystem" },
      // ...
    ],
  },
};
```

Recording-Script liest Anchor-Timing, wartet bis zum entsprechenden Audio-Timestamp, führt Event aus. So ist Screenflow perfekt synchron.

**Alternative (falls Loom dominant):** Screenflow bleibt 93.6s und wird als PiP-Loop 4× eingeblendet. Founder-Entscheidung nötig (§9 Punkt #3).

**Quality-Gate Ebene 5:**
- [ ] Audio-Dauer = Screenflow-Dauer (±500ms)
- [ ] Jeder Anchor-Event matcht sein erwartetes Audio-Segment (Timing im Script-Log)
- [ ] Kein Event ist "zu früh" (Audio kein noch nicht fertig)
- [ ] Kein Event ist "zu spät" (stiller Screen > 2s)

**Script:** `scripts/_ops/audio/map_audio_to_screenflow.mjs`
**Input:** Assembled Audio + tenant_config.json
**Output:**
- Timing-Config JSON
- Updated `record_take{N}.mjs`-Call mit Timing-Config
- Re-rendered `take{N}_{tenant}_{variant}.mp4` mit Audio + synchronem Screenflow

---

### Ebene 6: Final Video pro Betrieb

**Struktur des Finals (Take 2):**
- Hauptvideo: Loom-Founder-Face+Screen-Recording (Founder nimmt das AM SCHLUSS auf, nachdem Audio+Screenflow final sind)
- PiP: Der Phone-Bezel-Screenflow ist im Loom oben-rechts eingebettet (so wie aktuell via `take4_with_loom.mp4` gemacht)
- Audio: Das gemasterte Audio aus Ebene 4

**Für Take 2 → 2 Loom-Videos:**
- Loom Notruf mit take2_notruf_mp4 als Audio+Screenflow-Referenz
- Loom Preis mit take2_preis.mp4

**Pro Tenant:**
- Take 1: 1 Loom × 1 Audio = 1 Final
- Take 2: 2 Loom × 2 Audio = 2 Finals (Notruf + Preis) → Pipeline wählt per call_proof_variante welches versendet wird
- Take 3: 1 Loom × 1 Audio = 1 Final
- Take 4: 1 Loom × 1 Audio = 1 Final

**Gesamt pro Betrieb:** 5 Finals (1 Take 1 + 2 Take 2 + 1 Take 3 + 1 Take 4). Outreach schickt 4 davon (Take 2 je nach Variante).

**Quality-Gate Ebene 6:**
- [ ] Audio synchron mit Loom-Lippen (Spot-Check 3 Stellen)
- [ ] Screenflow-PiP sichtbar + eingebettet in Loom
- [ ] Dauer matcht Audio-Dauer
- [ ] Keine A/V-Drift (Ende identisch sync wie Anfang)

**Script:** `scripts/_ops/audio/compose_final_video.mjs`
**Input:** Audio + Screenflow-MP4 + Loom-MP4
**Output:** `docs/gtm/pipeline/06_video_production/final/{slug}/take{N}_{variant}.mp4`

---

## 4. Neue Scripts (vollständig)

```
scripts/_ops/audio/
├── _lib/
│   ├── elevenlabs_client.mjs    # API-Wrapper: TTS-Generate, Voices-List, Error-Retry
│   ├── audio_ffmpeg.mjs         # Helpers: trim, concat, normalize, silence-pad, measure-duration
│   ├── audio_qg.mjs             # Quality-Gate-Checks: loudness, peak, duration, silence-detection
│   └── script_parser.mjs        # notruf.txt / preis.txt → JSON Agent/User-Turns
│
├── clean_founder_audio.mjs      # Ebene 1: Klick-Entfernung + Normalisierung
├── generate_lisa_tts.mjs        # Ebene 2: Ela + Juniper TTS, generisch + tenant-spezifisch
├── assemble_call.mjs            # Ebene 3: B1 + B2 pro Tenant
├── assemble_take.mjs            # Ebene 4: Take 1-4 WAV pro Tenant pro Variante
├── map_audio_to_screenflow.mjs  # Ebene 5: Screenflow timing-alignment + re-render
├── compose_final_video.mjs      # Ebene 6: Loom + Screenflow + Audio → Final
│
├── audio_pipeline_run.mjs       # Orchestrator: --slug X --take {1|2|3|4|all} [--variant notruf|preis]
└── audio_qg_report.mjs          # Selbst-Report für Founder-Review (HTML-Output)
```

**Orchestrator-CLI:**
```bash
# Einzelner Betrieb, einzelner Take
node audio_pipeline_run.mjs --slug doerfler-ag --take 2 --variant notruf

# Einzelner Betrieb, alle Takes
node audio_pipeline_run.mjs --slug doerfler-ag --takes all

# Mehrere Betriebe (seriell, siehe §6 Skalierung)
node audio_pipeline_run.mjs --slugs doerfler-ag,waelti-sohn-ag --takes all
```

---

## 5. Tenant-Personalisierung — Persönlichkeit skalieren

### 5.1 Was wird personalisiert?

**NUR das Lisa-Greeting (#1)**: *"Hallo, hier ist Lisa — die digitale Assistentin der {{firma}}. Wie kann ich Ihnen helfen?"*

**Warum nur dieser Satz?** Ich habe `notruf.txt`, `preis.txt` und `Final_generic_scripting.txt` durchgeparst:
- Keine anderen Agent-Zeilen enthalten den Firmennamen
- Founder-Segmente A-F enthalten KEINE firmenspezifischen Formulierungen (Founder sagt "Ihre eigene App", nicht "{{firma}}-App")
- Alte Doku-Notiz "`{{firma}}-App` in Seg4 via STS" ist durch aktuelle Founder-Scripts überholt

**Konsequenz:** Nur 1 ElevenLabs-API-Call pro Tenant. Alles andere (die anderen 11 Lisa-Zeilen + Juniper + alle Founder-Segmente) ist **einmalig gebaut, unendlich oft wiederverwendet**.

### 5.2 Bermuda-Dreieck: 3 Stellen, identische Länge

Der Firmenname taucht in insgesamt **drei Stellen** auf, die **lip-sync-relevant** sind:

1. **Lisa-Greeting (Audio):** Ela spricht "{{firma}}" → Länge = X Sekunden
2. **Founder-Audio:** Founder spricht in A oder B-Pre den Firmennamen (aktueller Script: **keine direkte Nennung** — aber Founder nennt ihn möglicherweise in seinem Loom-Video improvisiert)
3. **Loom-Video:** Founder-Lippen bewegen sich beim Aussprechen

**Founder-Regel:** Bermuda-Dreieck muss SYNCHRON sein. Wenn Lisa "Dörfler AG" in 0.8s sagt und Loom-Founder "Dörfler AG" in 0.8s sagt → matcht. Wenn einer abweicht → sichtbar.

**Implementierung:**
- Lisa-Greeting wird pro Tenant auf **fixe Gesamt-Dauer** generiert (z.B. 4.8s, ausgerichtet am längsten Namen "Stark Haustechnik GmbH")
- Silenz-Padding am Ende für kürzere Namen
- Loom wird NACH Audio aufgenommen → Founder orientiert sich am fertigen Audio

### 5.3 Neue Tenants anlegen — Pipeline-Teil

Wenn Betrieb Nr. 5 (z.B. Müller GmbH) hinzukommt:

1. `tenant_config.json` existiert bereits (aus Phase-1 Pipeline)
2. Audio-Pipeline-Command: `node audio_pipeline_run.mjs --slug mueller-gmbh --takes all`
3. Pipeline:
   - Liest `tenant.name` aus config
   - Generiert NUR greeting.wav via ElevenLabs (API-Call $0.04)
   - Nutzt ALLE anderen Audios aus `_generic/`-Pool
   - Assembliert B1/B2 + Take 2/3/4
   - Mapped auf Screenflow
4. Founder nimmt Loom auf (1× Take 1, 2× Take 2, 1× Take 3, 1× Take 4)
5. Final-Compose → 5 Videos

**Skalierung:** Zeit pro neuem Betrieb = API-Call 2s + Assembly 30s + Screenflow-Rerender 5 min + Founder-Loom 30 min (nur Founder-Zeit) = **~35 min Founder-Zeit pro Betrieb**, davon 30s CC-Zeit.

Bei 10 Betrieben/Tag: **5h Founder-Zeit** (Loom-Aufnahmen). Das ist das Bottleneck, nicht CC.

### 5.4 Zukunfts-Optimierung

Wenn 100+ Betriebe erreicht sind und Founder nicht mehr manuell Loom aufnimmt:

- **Option A:** Loom-Master pro Take einmalig aufnehmen, Lippen-Swap via Deepfake für Firmenname-Anpassung (technisch bewiesen bei Synthesia)
- **Option B:** Founder nimmt "Generic-Loom" mit Platzhalter-Pause statt Firmenname auf → CC splejsst Audio-Greeting ein, visueller Jump-Cut unter Loom-PiP kaschiert

Aktuell: **Option B als Plan A** (Founder nimmt 1× pro Take Loom auf mit Platzhalter-Pause, CC macht Audio-Splice). Aber das ist Post-100-Betriebe, nicht jetzt.

### 5.5 ElevenLabs-API-Key als Infrastruktur

**STATUS AKTUELL (24.04. Abend nachverifiziert):** `ELEVENLABS_API_KEY` ist **NICHT** in `src/web/.env.local` gesetzt. Byte-genaue Prüfung:
- Datei-mtime: 2026-04-18 14:49 (6 Tage alt)
- `awk -F=` listet 52 Keys — keiner mit `ELEVEN` oder `LABS`
- `grep -ci "eleven|labs"` = 0 Treffer
- `node --env-file=.env.local -e "process.env.ELEVENLABS_API_KEY"` → UNDEFINED

**Founder-Action:** API-Key in `.env.local` eintragen.

**ENV-Variable-Name:** `ELEVENLABS_API_KEY` (wie in `scripts/_ops/splice_audio.mjs` referenziert)

**Voice-IDs sind schon da** (aus Codebase extrahiert, nicht von Founder benötigt):
- Ela: `NE7AIW5DoJ7lUosXV2KR`
- Juniper: `aMSt68OGf4xUZAnLpTU8`
- Gunnar-Clone: `Yyo65tdqHVByAa8sywXw` (Fallback für Audio-Korrekturen)

**Ohne Key:** Audio-Pipeline kann Ebene 2 nicht ausführen → alles blockiert.

### 5a. Multi-Branchen-Architektur — Master-Pipeline für alle

**Founder-Direktive (24.04.):** *"Wir bauen unsere Pipeline. Unsere Pipeline ist Autonomie und Generik pur. Das Ganze auch als Skalierungsmaschine für andere Branchen wie Garagen oder Elektriker."*

**Architektur-Anpassung:**

`tenant_config.json` bekommt ein `industry`-Feld:
```json
{
  "tenant": { ... },
  "industry": "sanitaer",  // "sanitaer" | "garage" | "elektriker" | "maler" | ...
  ...
}
```

**Ordner-Struktur pro Branche:**
```
docs/gtm/pipeline/06_video_production/
├── mini_takes/
│   ├── sanitaer/                 # aktuell, alle existierenden Audios hier
│   │   ├── Take2/A.wav … F.wav + call/Notruf/Preis
│   │   ├── Take3/A-E.wav
│   │   └── Take4/A-E.wav
│   ├── garage/                   # Zukunft
│   │   └── (gleiche Struktur)
│   └── elektriker/               # Zukunft
│       └── (gleiche Struktur)
│
├── master_takes/
│   ├── sanitaer/take1/Master.wav
│   ├── garage/take1/Master.wav
│   └── elektriker/take1/Master.wav
│
└── scripts/
    ├── sanitaer/
    │   ├── call_notruf.txt       # aktuell notruf.txt
    │   └── call_preis.txt
    ├── garage/
    │   ├── call_notfall.txt      # andere Szenarien: Auto-Panne statt Wasserschaden
    │   └── call_preis.txt
    └── elektriker/
        ├── call_notfall.txt      # Stromausfall-Szenario
        └── call_preis.txt
```

**Aktion im Refactor (wird in Phase A-1 mit durchgeführt):**
- Existierende Audios (in `mini_takes/Take2/`, `Take3/`, `Take4/`, `master_takes/take1/`) werden **nach `sanitaer/`** verschoben (nicht wegwerfen!)
- Scripts (aktuell `call/Notruf/notruf.txt` etc.) verschieben nach `scripts/sanitaer/`
- Alle Pipeline-Scripts lesen `industry` aus tenant_config und leiten entsprechende Source-Pfade ab
- Default: `industry = "sanitaer"` wenn nicht gesetzt (Backward-Compat für bestehende 4 Tenants)

**Pro neuer Branche:**
1. Founder nimmt Audios neu auf (gleiche Struktur: A-F + Notruf-User + Preis-User)
2. CC baut branchen-spezifische Scripts (call_notfall.txt, call_preis.txt)
3. CC baut branchen-spezifische Screenflow-Assets (Case-Typen in Samsung, Notfall-Beschreibungen)
4. Pipeline läuft durch — alles andere (Lisa-TTS Ela-Voice, Founder-Audio-Clean, Face-PiP etc.) bleibt identisch

**Skalierung:** Erste Branche (Sanitär) = initial big setup. Jede weitere Branche ≈ 1-2 Tage Founder-Audio + 1 Tag CC-Script + 1 Tag Screenflow-Assets = 4 Tage per Branche. Danach beliebig viele Tenants pro Branche in ~30min/Tenant.

---

## 6. Skalierungs-Strategie (Founder-Wunsch)

Founder-Zitat: "Wir fangen zuerst an, Step by Step, erst ein Betrieb und dann, also ein Betrieb pro Take, dann ein Betrieb alle Takes, dann zwei Betriebe gleichzeitig."

### Phase A: 1 Betrieb, 1 Take (Pilot)

**Ziel:** Dörfler AG Take 2 Notruf als Proof-of-Concept.

**Schritte:**
1. Dörfler-Audios durch Ebene 1 (Clean) → visueller QG-Report
2. Ela+Juniper+Dörfler-Greeting generieren (Ebene 2) → QG Report
3. B1_doerfler-ag.wav zusammenbauen (Ebene 3) → QG + Founder-Hörcheck
4. Take 2 Notruf assemblen (Ebene 4)
5. Screenflow re-mappen mit Timing-Config (Ebene 5)
6. Founder-Review (keine Loom-Aufnahme erforderlich in dieser Phase)

**Meilenstein:** Dörfler Take 2 Notruf Audio spielt synchron mit Screenflow. Founder ✅ oder ⏹.

**Dauer:** 1-2 Stunden CC-Arbeit.

### Phase B: 1 Betrieb, alle Takes

**Ziel:** Dörfler komplett durch alle Takes.

**Schritte:**
1. Take 2 Preis parallel zu Notruf (nur Variant-Call + Assembly)
2. Take 3 + Take 4 Audio-Mapping
3. Take 1 Audio-Mapping
4. Founder-Review der 5 Audio+Screenflow-Videos

**Meilenstein:** Dörfler hat 5 Master-Audio-Screenflow-Videos. Founder ✅ oder ⏹.

**Dauer:** 2-3 Stunden CC-Arbeit + Founder-Review.

### Phase C: 2 Betriebe parallel

**Ziel:** Dörfler + Wälti (oder anderer) gleichzeitig durch Pipeline.

**Schritte:**
1. `audio_pipeline_run.mjs --slugs doerfler-ag,waelti-sohn-ag --takes all`
2. Skalierungs-Validierung: Zeiten, API-Calls, QG-Reports aggregieren
3. Founder-Review

**Meilenstein:** 2 Betriebe parallel produziert, kein Ressourcen-Konflikt (ElevenLabs Rate-Limits, FFmpeg CPU).

**Dauer:** 1 Stunde CC-Arbeit.

### Phase D: 4 Betriebe (Referenz-Set komplett)

**Ziel:** Alle aktuellen Referenz-Betriebe (Dörfler, Leins, Stark, Wälti).

**Schritte:**
1. Alle 4 durch Pipeline (sequenziell oder parallel=2)
2. Gesamtzeit-Messung
3. Quality-Gates für alle 4
4. Founder-Review

**Meilenstein:** Alle 4 Referenz-Betriebe auf Audio-Ebene gelockt. Verhältnis zu Screenflow-Baseline: 1:1.

**Dauer:** 2-3 Stunden.

### Phase E: 10+ Betriebe (Outreach-Ready)

**Ziel:** Pipeline produktiv für Neukunden.

**Schritte:**
1. Founder-Loom-Aufnahmen für alle Takes (einmalig, wiederverwendbar via Option B)
2. Neue Betriebe automatisiert durch Pipeline
3. Monitoring: Audio-Qualität über Zeit konstant?

**Meilenstein:** Founder schickt 1. Outreach-Email mit synchronisiertem Audio+Video.

---

## 7. Quality-Gates — Selbst-Prüfungen (Founder braucht minimalen Analyseaufwand)

Pro Ebene läuft automatisch ein **QG-Report** (HTML-Report + CLI-Zusammenfassung). Founder kriegt eine einzige Datei pro Take pro Tenant:

```
docs/gtm/pipeline/06_video_production/qg/{slug}_take{N}_{variant}_report.html
```

**Inhalt:**
- Waveform-Screenshots pro Ebene (1-5)
- Dauer-Tabelle (Soll vs Ist)
- Lautstärke-Messungen (LUFS, Peak)
- Spot-Check-Audio-Snippets (3× 5-Sekunden-Stellen zum Anhören)
- "Pass/Fail pro Gate" Badge

**Automatische Gates (CC muss erfüllen):**

| Ebene | Gate | Schwelle | Fail-Action |
|-------|------|----------|-------------|
| 1 | Klick entfernt | kein Spike in letzten 100ms | Re-clean mit höherem Threshold |
| 1 | Loudness | -14 LUFS ±1 | Re-normalize |
| 2 | Greeting-Dauer | Ziel ±100ms | Re-generate mit angepasster Stability |
| 2 | Ela konsistent | Stimmen-Fingerprint matchend | Voice-ID Check |
| 3 | Call-Dauer Notruf=Preis | ±3s | Logik-Check im Script-Parser |
| 3 | Keine Turn-Überlappung | 100% | Assembly-Bug, re-run |
| 4 | Take-Dauer | Soll ±10% | Founder klären |
| 5 | Audio=Screenflow | ±500ms | Timing-Config anpassen |

**Manuelle Gates (Founder prüft):**

- [ ] Klingt natürlich, kein TTS-Robotik-Effekt
- [ ] Lip-Sync funktioniert bei späterer Loom-Aufnahme (Probe-Aufnahme)
- [ ] Firmenname klar verständlich
- [ ] Sprachwechsel EN→DE bruchlos
- [ ] Gesamteindruck: "Würde ich als Empfänger professionell finden"

**Report-Beispiel (Layout):**

```
╔═══════════════════════════════════════════════════════════════╗
║  DÖRFLER AG — Take 2 Notruf — Audio QG-Report                 ║
╠═══════════════════════════════════════════════════════════════╣
║  Ebene 1: Founder-Audio Cleanup         [✅ PASS]             ║
║  Ebene 2: Lisa-TTS Generation           [✅ PASS]             ║
║  Ebene 3: Call-Assembly B1              [✅ PASS] (162.3s)    ║
║  Ebene 4: Take-Assembly                 [✅ PASS] (374.1s)    ║
║  Ebene 5: Audio × Screenflow Mapping    [⚠  WARN] (Offset 0.6s) ║
╠═══════════════════════════════════════════════════════════════╣
║  GESAMT: 4/5 PASS, 1 WARN                                     ║
║  FOUNDER-REVIEW: 3 Spot-Check-Clips angehängt                 ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 8. Risiken & Migitation

| Risiko | Wahrscheinlichkeit | Impact | Migitation |
|--------|--------------------|--------|------------|
| ElevenLabs API-Key fehlt | ✅ bestätigt | Blocker | §9 Offene Punkte #1, Founder setzt Key |
| Ela klingt nicht wie Live-Retell | 30% | Mittel | Voice-ID matchen exakt, A/B-Test |
| Greeting-Länge divergiert pro Tenant | 60% | Mittel | Silenz-Padding, stability-Tuning, notfalls manual cut |
| Screenflow-Dauer << Audio-Dauer | ✅ bestätigt | Hoch | Retiming-Config (§3.5) oder Loom-PiP-Strategie |
| Mouse-Click in Founder-Audio bleibt | 20% | Niedrig | Threshold-Test pro Segment, manual fallback |
| ElevenLabs Rate-Limit bei 10+ Tenants | 10% | Niedrig | Sequential statt parallel, Retry-Logic |
| Turn #8 Varianten divergieren zu stark | 20% | Mittel | Beide Varianten nebeneinander hören, Founder prüft |
| FFmpeg-Concat-Knacken an Segmenten | 30% | Niedrig | Cross-Fade 50ms, test mit small sample zuerst |

---

## 9. Offene Punkte — Founder-Entscheidung nötig

**1. ElevenLabs API-Key**
   - `ELEVENLABS_API_KEY` in `src/web/.env.local` eintragen (oder mir als Env-Variable für den Dev-Run geben)
   - Plus: Die exakten ElevenLabs-voice_ids für "Ela" und "Juniper" — die `custom_voice_xxx` IDs aus Retell sind Retell-spezifische Kennungen, nicht direkt ElevenLabs-IDs
   - **Blocker für Ebene 2**

**2. Take-3/4-Audio-Längen-Mismatch**
   - Take 3 Script sagt ~90s, Founder-Audio ist 186s (2× länger)
   - Take 4 Script sagt ~90-100s, Founder-Audio ist 166s
   - Frage: Ist Founder-Audio die neue Referenz? → Dann Screenflow entsprechend verlängern
   - Oder: Soll Audio gekürzt werden?
   - **Entscheidet den Ansatz für Ebene 5**

**3. Screenflow vs. Loom-PiP — Welches ist Main-Video?**
   - Aktuell: `take4_with_loom.mp4` = Phone-Mockup main + Face PiP klein
   - Frage: Ist das final? Oder wird Final = Loom-Founder main + Phone-PiP klein?
   - Ich gehe im Plan von **Option B (Loom main)** aus — das passt zur Founder-Aussage "Ich werde 2 Loom-Videos aufnehmen"
   - **Entscheidet Ebene 6 Struktur**

**4. Take 1 — STS-Swap für Firmenname?**
   - Script sagt: "2 Master-Versionen: A (Einsatz) + B (Region). Pro Betrieb: STS tauscht `{{firma}}`"
   - Aber: Aktuell gibt es nur EINE Master.wav. Ist die generisch oder enthält sie einen Firmennamen?
   - Wenn generisch: kein STS nötig
   - Wenn spezifisch (z.B. "Dörfler"): STS-Swap pro Tenant (ElevenLabs Voice-Changer)
   - **Founder muss Master.wav anhören und klarstellen**

**5. Scalability-Phase Dauer pro Betrieb**
   - Meine Schätzung: 30s CC + 35min Founder (Loom-Aufnahmen)
   - Ist das tragbar für 100 Betriebe? Oder brauchen wir Option B (generischer Loom mit Audio-Splice)?
   - **Founder-Gefühl nötig**

---

## 10. Konkreter nächster Step (nach Plan-Approval)

**Founder-Approval des Plans → unmittelbar Folgeaktionen:**

1. **Founder-Action (Parallel):**
   - ELEVENLABS_API_KEY in `.env.local`
   - Ela + Juniper ElevenLabs voice_ids nennen
   - Entscheidung zu Offenen Punkten #2, #3, #4

2. **CC Phase-A Implementation (Ziel: 2h Arbeit):**
   - `scripts/_ops/audio/_lib/*` bauen
   - `clean_founder_audio.mjs` bauen + Dörfler durchlaufen lassen
   - `generate_lisa_tts.mjs` bauen + Ela+Juniper+Dörfler-Greeting generieren
   - `assemble_call.mjs` bauen + B1_doerfler-ag.wav erzeugen
   - QG-Report erzeugen + Founder-Hörcheck

3. **Meilenstein-Review:**
   - Founder hört B1_doerfler-ag.wav an (Dörfler Notruf Call, ~160s)
   - Entscheidet: ✅ → weiter Phase B | ❌ → Fix-Runde

4. **Pipeline-Bible §35 "Audio-Phase Baseline"** wird nach Phase-A-Approval geschrieben.

---

## 11. Projekt-Kommitment

- **CC-Discipline:** Jede Ebene wird vor der nächsten durch Gates abgenommen. Kein Überspringen.
- **Founder-Discipline:** Jeder Audio-Output wird 1× per Spot-Check angehört (3×5s Clips aus QG-Report) — das sollte max 1 Min Founder-Zeit pro Take-Variant-Tenant sein.
- **Bible-Discipline:** Jede Ebene → ein §-Block in PIPELINE_BIBLE.md sobald stabilisiert.
- **Anti-Drift-Regel (aus §34):** Wenn ein Audio-Bug bei Betrieb X gefunden wird, MUSS er für alle Betriebe gefixt werden. Nicht nur für X.

---

## 12. Anhang — Script-Kanonische Version

### 12.1 Call-Script Ela-Zeilen (aus notruf.txt parsed)

```
#1  [TENANT] "Hallo, hier ist Lisa — die digitale Assistentin der {{firma}}. Wie kann ich Ihnen helfen?"
#2  [GENERIC] "Natürlich, das machen wir gerne für Sie. Erzählen Sie doch kurz, was genau passiert ist."
#3  [GENERIC] "Oh, das klingt wirklich unangenehm. Da kümmern wir uns natürlich sofort darum. Wissen Sie, woher das Wasser kommt? Ist es eher ein Leck an einer Leitung, oder läuft es aus einem Gerät aus?"
#4  [GENERIC] "Verstehe, das klingt dringend, das nehme ich sofort auf. Wie lautet die Strasse und Hausnummer des Einsatzortes?"
#5  [GENERIC] "Alles klar, danke. Und die Postleitzahl und der Ort?"
#6  [GENERIC] "Perfekt. Und könnten Sie mir als letztes sagen, wo unser Techniker klingeln darf?"
#7  [GENERIC JUNIPER] "Of course. I understand you have water in your basement — that sounds really stressful. Could you tell me where our technician should ring when they arrive?"
#8  [GENERIC] "Alles klar, ich mache auf Deutsch weiter. Wo darf unser Techniker klingeln?"
#9a [NOTRUF]  "Dann hätten Sie uns genauso erreicht. Ich nehme den Fall auch dann sofort auf und gebe ihn direkt an den zuständigen Techniker weiter. Bei Notfällen sind wir rund um die Uhr erreichbar, auch an Sonn- und Feiertagen. Aber zurück zu Ihrem Anliegen: Wo darf unser Techniker bei Ihnen klingeln?"
#9b [PREIS]   "Das kommt ganz auf die Ursache und den Aufwand an — aus der Ferne wäre das nicht seriös einzuschätzen. Unsere Techniker schauen sich das deshalb zuerst vor Ort an. Aber zurück zu Ihrem Anliegen: Wo darf unser Techniker bei Ihnen klingeln?"
#10 [GENERIC] "Nein, dafür sind wir leider nicht zuständig. Aber zurück zum Wasserschaden: Wo darf unser Techniker klingeln, wenn er bei Ihnen eintrifft?"
#11 [GENERIC] "Super, danke für die Info. Ich habe alles notiert. Sie erhalten gleich eine SMS auf Ihr Handy — dort können Sie die erfassten Daten nochmals prüfen, bei Bedarf korrigieren und auch Fotos vom Schaden hochladen. Das hilft unserem Techniker, sich optimal vorzubereiten. Ich wünsche Ihnen alles Gute, auf Wiederhören!"
```

### 12.2 Call-User-Audio-Mapping (aus notruf.txt + Audio/-Ordner)

Der User-Audio `{i}.wav` gehört zur User-Zeile #i im Script (chronologisch 1-10). Script-Text (für Lip-Sync-Hinweis und Tests):

```
#1  5.9s "Hallo. Ja, ich würde gerne einen Schaden melden wollen."
#2  6.9s "Ja, ich bin bei mir im Keller und steh hier knöcheltief im Wasser."
#3  7.7s "Hmm nee, ich kann's nicht genau sagen. Sieht für mich eher nach einem Rohrbruch aus."
#4  5.1s "Das ist die Seestrasse vierzehn."
#5  4.1s "Acht neun vier zwei Oberrieden."
#6  6.5s "ähm Bevor ich das sage, sprichst Du auch Englisch? Do you speak english?"
#7  5.2s "Oh sorry, can we go back to German? Deutsch bitte."
#8  NOTRUF 9.5s / PREIS 8.7s (einzige Divergenz)
#9  15.2s "Ahh Okay, super. Ach und ich hab da immer Probleme mit meiner Steuererklärung, können Sie die für mich erledigen?"
#10 7.1s "hehe Ja okay, jetzt hast Du Dir die Antwort wirklich verdient. Bei Wende."
```

### 12.3 Datei-Pfad-Konventionen

```
docs/gtm/pipeline/06_video_production/
├── master_takes/
│   ├── take1/
│   │   ├── Master.wav                       # Founder raw (existiert)
│   │   └── _clean/Master.wav                # nach Ebene 1
│   ├── take2/
│   │   └── {slug}/                          # pro Tenant
│   │       ├── take2_notruf.wav             # nach Ebene 4
│   │       └── take2_preis.wav              # nach Ebene 4
│   ├── take3/{slug}/take3.wav
│   └── take4/{slug}/take4.wav
│
├── mini_takes/
│   ├── Take2/
│   │   ├── A.wav C.wav D.wav E.wav F.wav    # Founder raw (existiert)
│   │   ├── _clean/A.wav …                   # nach Ebene 1
│   │   ├── call/
│   │   │   ├── Notruf/
│   │   │   │   ├── notruf.txt
│   │   │   │   ├── Audio/1-10.wav           # Founder raw (existiert)
│   │   │   │   └── _clean/1-10.wav          # nach Ebene 1
│   │   │   └── Preis/ …
│   │   │
│   │   ├── _lisa/
│   │   │   ├── _generic/
│   │   │   │   ├── notruf/agent_2-11.wav    # 10 Ela + 1 Juniper
│   │   │   │   └── preis/agent_9b.wav       # nur divergenz
│   │   │   └── {slug}/greeting.wav          # tenant-spezifisch
│   │   │
│   │   └── {slug}/
│   │       ├── B1.wav                       # Call Notruf assembled
│   │       └── B2.wav                       # Call Preis assembled
│   │
│   ├── Take3/
│   │   ├── A.wav B.wav C.wav D.wav E.wav    # Founder raw
│   │   └── _clean/ …
│   └── Take4/
│       ├── A-E.wav
│       └── _clean/ …
│
├── final/
│   └── {slug}/
│       ├── take1_master.mp4
│       ├── take2_notruf.mp4
│       ├── take2_preis.mp4
│       ├── take3.mp4
│       └── take4.mp4
│
├── qg/                                      # Quality-Gate-Reports
│   └── {slug}_take{N}_{variant}_report.html
│
└── AUDIO_PIPELINE_PLAN.md                   # dieses Dokument
```

---

**ENDE DES PLANS.**

> "Die Bible ist die einzige Wahrheitsquelle. Wenn du jemals denkst, etwas ist anders — erst Bible prüfen." — §34
