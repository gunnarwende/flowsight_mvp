# Runway API — Prompt Set für Website-Videos

**Tool:** Runway Gen-3 Alpha Turbo (API)
**Steuerung:** CC sendet Prompts via API, pollt Status, lädt Clips herunter.
**Founder-Rolle:** Ergebnisse reviewen (15 Min), Ja/Nein pro Szene.

---

## Allgemeine Prompt-Regeln

- Immer EN (Runway versteht EN besser als DE)
- Immer "cinematic, high quality, 4K" am Ende
- Immer Licht-Stimmung angeben (warm, morning, natural)
- **NIEMALS:** corporate office, startup, modern tech, blue glow, neon
- **NIEMALS:** Stock-Ästhetik, generische Business-Menschen
- **IMMER:** Handwerk, Werkstatt, Schweiz, professionell, ruhig, warm

---

## Szene R1 — Werkstatt morgens (Live-erleben Sz. 1a)

**Dauer:** 5s
**Prompt:**
```
Exterior of a small Swiss plumbing workshop in early morning light. A white delivery van is parked outside. Clean facade, professional signage. Golden hour lighting, quiet street, no people visible. Cinematic, high quality, 4K. Slow dolly forward.
```
**Stimmung:** Vertraut, professionell, ruhig. Der Betrieb vor dem Arbeitstag.
**No-Go:** Kein heruntergekommenes Gebäude, keine Grossstadt, kein modernes Glasgebäude.

---

## Szene R2 — Telefon klingelt, niemand da (Live-erleben Sz. 1b)

**Dauer:** 5s
**Prompt:**
```
Interior of a small workshop office. A desk phone is ringing, light blinking. The chair is empty. Papers on the desk, a calendar on the wall. Warm indoor lighting, slightly dusty, authentic. No one is there. Cinematic, high quality, 4K. Static camera, subtle focus pull to the phone.
```
**Stimmung:** Alltäglich, nicht dramatisch. Ein normaler Moment — das Telefon klingelt, und niemand ist da.
**No-Go:** Kein Chaos, kein Müll, kein dunkler Raum. Sauber, aber leer.

---

## Szene R3 — SMS-Bestätigung auf Handy (Live-erleben Sz. 3)

**Dauer:** 5s
**Prompt:**
```
Close-up of a craftsman's hands holding a smartphone. On the screen: a text message notification. Workshop background blurred. The focus is on the phone and the message, not on a face. Natural light, cinematic, high quality, 4K.
```
**Stimmung:** Brückenmoment — die Nachricht ist angekommen. Sachlich, nicht werblich. Fokus auf Hände + Handy + Nachricht.
**No-Go:** Kein Gesicht, kein "zufriedener Blick", kein Lächeln, kein Werbemoment.

---

## Szene R4 — Techniker bei der Arbeit (Live-erleben Sz. 5-6, optional)

**Dauer:** 5s
**Prompt:**
```
Professional plumber working under a kitchen sink. Clean Swiss apartment, modern bathroom. He is focused, wearing work clothes, tools organized. Natural daylight from a window. No mess. Cinematic, high quality, 4K. Medium shot, steady.
```
**Stimmung:** Kompetent, sauber, professionell. Nicht "Notfall-Chaos" — organisierte Arbeit.
**No-Go:** Kein Wasserspritzen, kein Chaos, keine billige Wohnung.

---

## Szene R5 — Zufriedener Kunde (Live-erleben Sz. 7, optional)

**Dauer:** 5s
**Prompt:**
```
A middle-aged woman opens her front door, smiling warmly. A tradesman in work clothes is visible in the hallway behind her, putting tools back in his bag. Swiss residential entrance, clean, well-maintained. Afternoon light. Cinematic, high quality, 4K.
```
**Stimmung:** Abschluss, Zufriedenheit. Der Kunde ist happy, der Handwerker hat geliefert.
**No-Go:** Kein übertriebenes Lächeln, kein Händeschütteln-Klischee. Natürlich.

---

## Szene R6 — Telefon Close-up (Hero Sz. 1)

**Dauer:** 5s
**Prompt:**
```
Close-up of a smartphone on a wooden workbench, incoming call notification on screen. Background: blurred workshop tools, a work glove, warm morning light. Shallow depth of field. Cinematic, high quality, 4K.
```
**Stimmung:** Nah, warm, handwerksnah. Ein Kontakt, der aufgefangen wird. Die Werkbank verortet sofort im Handwerk.
**No-Go:** Kein sichtbarer App-Name, kein "Lisa"-Text, kein FlowSight-Logo auf dem Screen. Keine Hektik.

---

## API-Parameter (pro Request)

```json
{
  "model": "gen3a_turbo",
  "promptText": "[Prompt von oben]",
  "duration": 5,
  "ratio": "16:9",
  "watermark": false
}
```

---

## Priorisierung

| Szene | Priorität | Begründung |
|-------|-----------|------------|
| R6 (Telefon Close-up) | **MUSS** | Hero Sz. 1 — kein Ersatz möglich |
| R2 (Telefon klingelt, leer) | **MUSS** | Live-erleben Sz. 1 — Einstiegsszene |
| R1 (Werkstatt morgens) | **MUSS** | Live-erleben Sz. 1 — Kontext-Establishing |
| R3 (Handwerker + Handy) | **SOLL** | Live-erleben Sz. 3 — stärkt SMS-Moment |
| R4 (Techniker arbeitet) | **KANN** | Live-erleben Sz. 5-6 — UI-Captures tragen auch allein |
| R5 (Zufriedener Kunde) | **KANN** | Live-erleben Sz. 7 — Review-UI-Capture trägt auch allein |

**Minimum für v1:** R1, R2, R6 (3 Szenen). Rest kann in v2 ergänzt werden.
