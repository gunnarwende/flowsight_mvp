# Voice Model Research Prompt

Paste this into Claude Chat or ChatGPT for research.

---

## Kontext / IST-Situation

Ich baue ein SaaS-Produkt (FlowSight) für Schweizer Sanitär-/Heizungsbetriebe. Kernfeature ist ein telefonischer Voice Agent, der Schadensmeldungen aufnimmt (Intake). Der Agent läuft auf **Retell AI** (retellai.com) als Conversation Flow mit Post-Call Analysis.

**Aktuelles Setup:**
- Plattform: Retell AI (retellai.com)
- LLM: GPT-4.1 (cascading mode, Retell-intern)
- Voice/TTS: `minimax-Cimo` (MiniMax Provider)
- Sprache: `de-DE`
- Telefon: Twilio CH-Nummer (+41...)
- Flow: Begrüssung → Intake (max 7 Fragen) → Logic Split → Closing/End Call
- Post-Call: Structured Data Extraction (plz, city, category, urgency, description)
- Recording: OFF
- Prompt-Sprache: Deutsch (Hochdeutsch antworten, Schweizerdeutsch verstehen)

**Was funktioniert:**
- E2E Flow funktioniert (Anruf → Case in DB → E-Mail an Ops)
- Structured Data Extraction ist korrekt
- Conversation Flow (Logic Split, Loop, Out-of-scope) funktioniert

## Pain / Problem

Die Voice (`minimax-Cimo`) hat einen **starken englischen Akzent** wenn sie Deutsch spricht. Teilweise werden 1-2 Wörter auf Englisch ausgesprochen. Das klingt unprofessionell für einen Schweizer Sanitärbetrieb.

**Details:**
- Begrüssung startet auf Deutsch, aber der Akzent kippt schnell ins Englische
- Einzelne Wörter werden englisch ausgesprochen (z.B. "emergency" statt "Notfall")
- Die Voice klingt wie eine englische Muttersprachlerin, die Deutsch liest
- Vermutung: MiniMax-Voices sind primär auf Englisch trainiert, und `language: de-DE` reicht nicht

## Ziel

Eine Voice finden, die:
1. **Per Default natürliches Hochdeutsch** spricht (kein Akzent, keine englischen Einsprengsel)
2. **Multilingual reagieren kann:** Wenn der Anrufer auf Englisch oder Französisch spricht, soll der Agent fliessend darauf wechseln können
3. **Die Ops-Daten trotzdem auf Deutsch erfasst** (Post-Call Analysis bleibt DE)
4. **Professionell und freundlich** klingt (Zielpublikum: Schweizer Hausbesitzer, 40-70 Jahre)
5. Auf Retell verfügbar ist (oder als Custom Voice integrierbar)

## Retell Voice Providers (verfügbar)

Retell bietet folgende TTS-Provider an. Jeweils nur 1-2 Voices mit Trait "German":
- **MiniMax** (aktuell, hat Akzent-Problem)
- **Fish Audio**
- **ElevenLabs** (bekannt für multilingual v2)
- **Cartesia** (bekannt für Sonic-Modelle)
- **OpenAI** (TTS, relativ neu)

## Fragen, die wir klären müssen

1. **Welcher TTS-Provider hat die beste native Hochdeutsch-Qualität?**
   - Gibt es Benchmarks oder Erfahrungsberichte für DE-Voices auf Retell?
   - ElevenLabs multilingual_v2 vs. Cartesia Sonic vs. OpenAI TTS — wer führt bei Deutsch?

2. **Multilingual Switching:**
   - Kann eine Voice innerhalb eines Calls die Sprache wechseln (DE→EN→DE)?
   - Oder braucht man separate Agents pro Sprache?
   - Wie handhabt Retell `language: de-DE` vs multilingual Voices?

3. **Retell-spezifische Constraints:**
   - Kann man Custom Voices (z.B. eigene ElevenLabs-Voice) in Retell einbinden?
   - Gibt es bei Retell ein Voice Cloning Feature?
   - Latenz-Unterschiede zwischen den Providern auf Retell?

4. **Schweizerdeutsch-Verständnis:**
   - Liegt das Verstehen von Schweizerdeutsch am LLM (GPT-4.1) oder an der STT-Komponente?
   - Welche STT nutzt Retell? Deepgram? Whisper?
   - Gibt es Provider mit besserem CH-DE Verständnis?

5. **Kosten:**
   - Preisunterschiede zwischen den Voice-Providern auf Retell?
   - ElevenLabs ist typisch teurer — lohnt sich das für die Qualität?

6. **Alternatives Setup:**
   - Wäre ein Wechsel von Retell zu einer anderen Voice-AI-Plattform sinnvoll (Vapi, Bland, Vocode)?
   - Oder ist Retell mit besserer Voice ausreichend?

## Gewünschtes Output

Bitte gib mir:
1. **Ranking** der 5 Provider für native Deutsch-Qualität (mit Begründung)
2. **Konkrete Voice-ID Empfehlung** für Retell (wenn bekannt)
3. **Multilingual-Strategie:** Empfehlung ob eine Voice oder mehrere Agents
4. **Quick-Test-Plan:** 3 Schritte die ich sofort in Retell testen kann
5. **Fallback-Strategie:** Was tun wenn keine Retell-Voice gut genug ist
