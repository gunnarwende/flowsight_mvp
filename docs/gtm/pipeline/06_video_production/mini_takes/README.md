# Betriebsspezifische Frage — 2 Varianten (Founder Decision 19.04.)

**Zweck:** Zwei Varianten der betriebsspezifischen Frage im Take 2 Call. Pro Betrieb wird automatisch die passende gewählt. Beide haben EXAKT gleiche Länge (Frage + Antwort).

**Regel:** Founder sagt NIE den Firmennamen. Lisa nennt auch NICHT den Firmennamen in dieser Antwort — die Personalisierung liegt im INHALT (Notdienst vs. Preis).

**Regel:** Beide Varianten haben EXAKT gleiche Sprechdauer (Sekunden). PiP-Reaktion ist identisch.

---

## Die 2 Varianten (Founder Decision 19.04.2026)

### Variante C — Notdienst (60% der Betriebe)

**Bedingung:** `crawl_extract.json → notdienst.value` ist vorhanden ODER Website erwähnt 24/7/Pikett/Notdienst.

**Founder-Frage:** "Stellen Sie sich mal vor, es wäre jetzt Feiertag oder Wochenende gewesen — was wenn das dann passiert wäre?"

**Lisa-Antwort (TTS, fixe Länge):** "Ja, dann hätte ich den Fall genauso aufgenommen und sofort den zuständigen Techniker kontaktiert. Wir bieten Notdienst rund um die Uhr an — auch an Sonn- und Feiertagen."

**Strategischer Effekt:** Betriebsinhaber denkt: "Notfälle = Umsatz. Lisa fängt die auf. Auch nachts und am Wochenende. Push an Techniker. Das bringt mir direkt Geld."

### Variante B — Preis-Deflekt (40% der Betriebe, Fallback)

**Bedingung:** Kein Notdienst erkennbar in crawl_extract.

**Founder-Frage:** "Oh, okay, das könnte ja ziemlich teuer werden. Was kostet denn sowas ungefähr?"

**Lisa-Antwort (TTS, fixe Länge):** "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an — je nach Situation kann das sehr unterschiedlich sein. Soll ich das als Anfrage aufnehmen?"

**Strategischer Effekt:** Betriebsinhaber denkt: "Die handhabt die Preisfrage genau richtig. Kein Versprechen, professionelle Weiterleitung."

### KRITISCH: Timing

| Element | Variante C | Variante B | Identisch? |
|---------|-----------|-----------|-----------|
| Founder-Frage (Sekunden) | ~5s | ~5s (Founder passt Länge an) | ✅ MUSS |
| Lisa-Antwort (Sekunden) | ~6s | ~6s (ElevenLabs Pacing) | ✅ MUSS |
| Founder-Reaktion | "Ah, okay, gut zu wissen." | "Ah, okay, gut zu wissen." | ✅ IDENTISCH |
| PiP (Gunnar nickt) | Gleiche Stelle | Gleiche Stelle | ✅ IDENTISCH |

### Pipeline-Logik (derive_config.mjs)

**DEFAULT = Variante B (Preis).** Immer korrekt, kein Risiko.

**Variante C NUR bei STARKEM Beweis:**
```
Variante C wenn ALLE zutreffen:
  1. crawl_extract.notdienst.value !== null
  2. notdienst.source !== "not_found" 
  3. notdienst.value enthält "24" ODER "rund um die Uhr" ODER "Pikett" ODER "7 Tage"
     (= expliziter 24/7-Hinweis, nicht nur das Wort "Notfall")

Sonst → Variante B (Preis) als sicherer Default
```

**Warum so streng:** Nichts ist schlimmer als einem Betrieb OHNE Notdienst ein Video zu schicken in dem Lisa sagt "Wir bieten Notdienst rund um die Uhr an." Das wäre eine Lüge → Vertrauensbruch → Game Over.

---

## Datei-Ablage

```
minitakes/
├── README.md              ← Dieses Dokument
├── variante_c_frage.wav   ← Founder: "Stellen Sie sich mal vor..."
├── variante_b_frage.wav   ← Founder: "Oh, okay, das könnte ja..."
```

Lisa-Antworten werden PRO BETRIEB via ElevenLabs TTS generiert (fixe Länge).
Variante C Antwort ist für ALLE Notdienst-Betriebe identisch.
Variante B Antwort ist für ALLE Nicht-Notdienst-Betriebe identisch.
