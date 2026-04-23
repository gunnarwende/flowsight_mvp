# Take 2 — Call Script (Founder → Lisa)

**Zweck:** Exaktes Script für die Aufnahme des Telefonats mit der digitalen Assistentin.
**Referenz-Call:** call_8d24198e713f344bf4a1fcb1858 (Dörfler, vor Redesign)
**Aufnahme:** Rode USB + NTT (Audacity), separates Audio

---

## Ablauf

### Phase 1: Anruf + Begrüssung

**[Founder wählt Nummer → Es klingelt → Lisa nimmt ab]**

> **Lisa:** "Hallo, hier ist Lisa — die digitale Assistentin der [FIRMA]. Wie kann ich Ihnen helfen?"

**[Founder spricht — DRINGEND, leicht gestresst:]**

> **Founder:** "Ja, guten Tag. Ich bräuchte dringend Hilfe. Wir haben einen Wasserschaden im Keller. Die Leitung ist geplatzt und das Wasser steht knöcheltief."

### Phase 2: Lisa Intake (sie stellt Fragen)

Lisa wird automatisch in den Intake-Modus gehen und fragen:

> **Lisa:** "Das klingt dringend, das verstehe ich. Lassen Sie mich das sofort aufnehmen. Wie lautet die Strasse und Hausnummer des Einsatzortes?"

> **Founder:** "Seestrasse vierzehn."

> **Lisa:** "Und die Postleitzahl und der Ort?"

> **Founder:** "Acht neun vier zwei Oberrieden."

> **Lisa:** "Alles klar, danke."

> **Lisa:** (fragt nach Dringlichkeit falls nicht schon klar)

> **Founder:** "Ja, das ist dringend."

### Phase 3: BETRIEBSSPEZIFISCHE FRAGE — DER PROOF-MOMENT

**Zwei Varianten — gleiche Länge, gleiche Position im Audio:**

#### Variante C (60% — Betrieb bietet Notdienst an):

> **Founder:** "Stellen Sie sich mal vor, es wäre jetzt Feiertag oder Wochenende gewesen — was wenn das dann passiert wäre?"

> **Lisa:** "Ja, dann hätte ich den Fall genauso aufgenommen und sofort den zuständigen Techniker kontaktiert. Wir bieten Notdienst rund um die Uhr an — auch an Sonn- und Feiertagen."

**[Founder reagiert beeindruckt — für PiP: Nicken, "Wow"-Blick]**

> **Founder:** "Ah, okay, gut zu wissen."

**Strategisch:** Der Inhaber denkt: "Notfälle = Umsatz. Lisa fängt die auf. Auch nachts. Push an Techniker. Top."

#### Variante B (40% — Betrieb OHNE Notdienst):

> **Founder:** "Oh, okay, das könnte ja ziemlich teuer werden. Was kostet denn sowas ungefähr?"

> **Lisa:** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an — je nach Situation kann das sehr unterschiedlich sein. Soll ich das als Anfrage aufnehmen?"

**[Founder reagiert anerkennend — für PiP: gleiches Nicken wie bei C]**

> **Founder:** "Ah, okay, gut zu wissen."

**Strategisch:** Der Inhaber denkt: "Die handhabt die Preisfrage genau richtig. Professionell."

#### WICHTIG:
- **Founder-Frage C und B müssen EXAKT gleich lang sein** (Sekunden)
- **Lisa-Antwort C und B müssen EXAKT gleich lang sein** (ElevenLabs Pacing)
- **Founder-Reaktion ist IDENTISCH** → PiP bleibt synchron
- **derive_config.mjs** entscheidet automatisch: Hat Betrieb Notdienst? → C. Sonst → B.

### Phase 4: STEUERERKLÄRUNG — Kompetenzgrenze

**[Founder testet die Grenzen:]**

> **Founder:** "Ach, und können Sie mir auch bei meiner Steuererklärung helfen?"

> **Lisa:** "Nein, dafür sind wir leider nicht zuständig. Aber zurück zu Ihrem Anliegen..."

### Phase 5: SPRACHWECHSEL — DE → EN → DE

**[Founder wechselt plötzlich auf Englisch:]**

> **Founder:** "Actually, can you also speak English?"

> **Lisa:** "Natürlich, einen Moment bitte."

**[Agent-Swap → INTL-Agent (Juniper) übernimmt:]**

> **INTL Lisa:** "Hello! I've been briefed on your situation — a water leak in the basement at Seestrasse fourteen, is that correct?"

> **Founder:** "Yes, exactly."

> **INTL Lisa:** "Perfect. We have everything noted. Is there anything else?"

> **Founder:** "Nein, das reicht. Auf Deutsch wieder bitte."

**[Agent-Swap zurück → DE-Agent:]**

> **Lisa:** "Alles klar, ich mache auf Deutsch weiter."

### Phase 6: NAME + ABSCHLUSS

> **Lisa:** "Und könnten Sie mir als letztes sagen, wo unser Techniker klingeln darf?"

> **Founder:** "Wende. Gunnar Wende."

> **Lisa:** "Vielen Dank, ich habe alles notiert. Sie erhalten gleich eine SMS auf Ihr Handy — dort können Sie die Daten prüfen, bei Bedarf korrigieren und auch Fotos vom Schaden hochladen. Das hilft unserem Techniker, sich optimal vorzubereiten. Ich wünsche Ihnen alles Gute, auf Wiederhören!"

> **Founder:** "Danke, tschüss."

> **Lisa:** "Sehr gerne, und keine Sorge — wir kümmern uns darum. Auf Wiederhören!"

**[Call endet]**

---

## Zusammenfassung: Was dieser Call beweist

| Moment | Was es beweist | Zielgruppe |
|--------|---------------|------------|
| Lisa nennt Firmennamen | "Das ist MEINE Assistentin" | Alle |
| Notfall-Intake | "Die kann Fälle aufnehmen" | Alle |
| Betriebsspezifische Frage | "Die KENNT meinen Betrieb" | Alle (höchster Proof) |
| Steuererklärung-Deflekt | "Die weiss was sie NICHT kann" | Alle (Vertrauen) |
| Sprachwechsel DE→EN→DE | "Die kann sogar Fremdsprachen" | Alle (Wow) |
| SMS-Ankündigung | "Der Kunde wird direkt informiert" | Alle |

---

## Technische Hinweise

- **Lisa-Audio:** Wird aus Retell extrahiert (Call-ID nach Aufnahme mitteilen)
- **Founder-Audio:** Audacity, separate WAV
- **Betriebsspezifische Antwort:** Wird pro Betrieb via ElevenLabs TTS ersetzt (fixe Länge!)
- **Lisa Greeting:** Wird pro Betrieb via TTS ersetzt (Firmenname dynamisch)
- **Sprachwechsel:** INTL-Agent Audio ebenfalls aus Retell extrahiert

## Für den Pool: Die 10 Fragen SEPARAT aufnehmen

Nach dem Call bitte noch die 10 Mini-Take-Fragen einzeln einsprechen (gleiche Aufnahme-Session, gleiche Stimme/Stimmung):

1. "Was deckt der Betrieb eigentlich alles ab?"
2. "Und was sagen die Kunden über den Betrieb?"
3. "Wo ist der Betrieb denn überall im Einsatz?"
4. "Wie lange gibt es den Betrieb eigentlich schon?"
5. "Macht der Betrieb auch Heizungen?"
6. "Und wenn es am Wochenende passiert?"
7. "Bietet der Betrieb auch erneuerbare Energien an?"
8. "Macht der Betrieb auch Badsanierungen?"
9. "Worauf hat sich der Betrieb spezialisiert?"
10. "Wann ist der Betrieb denn erreichbar?"
