# Live-erleben Video — Storyboard + Voiceover (~2:05 Min)

**Zweck:** Betriebsfluss erlebbar machen, Vertrauen aufbauen, Founder-Closer als persönlicher Anker.
**Format:** 1920x1080, 30fps, kein Loop, mit Voiceover + Hintergrundmusik.
**Produktionsweg:** Playwright + Runway API + ElevenLabs API + FFmpeg

---

## Voiceover-Skript (komplett, ~280 Wörter)

Ton: Ruhig, souverän, Hochdeutsch mit Schweizer Anklang. Nicht werblich, nicht radiomässig. Wie ein ruhiger Fachmann, der erklärt — nicht verkauft.

---

**Szene 1** (0:00–0:15)
> In den meisten Handwerksbetrieben klingelt das Telefon — und niemand geht ran. Nicht weil es niemanden interessiert. Sondern weil der Meister auf der Baustelle steht, die Hände voll hat, und das Büro schon geschlossen ist.

**Szene 2** (0:15–0:30)
> FlowSight nimmt jeden Anruf an. Mit dem Namen Ihres Betriebs. Was ist passiert, wo liegt das Problem, wie dringend ist es — alles wird aufgenommen. Ruhig, professionell, rund um die Uhr.

**Szene 3** (0:30–0:42)
> Ihr Kunde bekommt sofort eine Bestätigung per SMS — im Namen Ihres Betriebs. Er weiss: Seine Meldung ist angekommen.

**Szene 4** (0:42–0:57)
> Im Leitstand sehen Sie den Fall sofort. Kategorie, Dringlichkeit, Kontaktdaten — alles strukturiert, nichts auf Zetteln.

**Szene 5** (0:57–1:12)
> Ihr Team sieht, was ansteht. Termin setzen, Techniker zuweisen — direkt aus dem System heraus.

**Szene 6** (1:12–1:27)
> Wenn der Auftrag erledigt ist, sieht das jeder. Der Fall ist abgeschlossen, die Dokumentation steht.

**Szene 7** (1:27–1:42)
> Und Ihre zufriedenen Kunden? Die werden nach dem Einsatz um eine Bewertung gebeten. Automatisch, im richtigen Moment.

**Szene 8** (1:42–1:55)
> Vom ersten Kontakt bis zur Bewertung. Ein System. Damit in Ihrem Betrieb nichts mehr liegen bleibt.

**[PAUSE 1s]**

**Founder-Closer** (1:56–2:05)
> *(Founder spricht selbst, direkt in die Kamera)*
> "Ich bin Gunnar Wende. Ich richte Ihr Leitsystem persönlich ein."

---

## Szene-für-Szene Storyboard

---

### Szene 1 — Der Alltag (0:00–0:15)

| Feld | Wert |
|------|------|
| **Was man sieht** | Werkstatt / Betrieb von aussen, Morgenlight. Dann: Büro, Telefon klingelt, leerer Stuhl. Niemand da. |
| **Voiceover** | "In den meisten Handwerksbetrieben klingelt das Telefon — und niemand geht ran..." |
| **Overlay** | — (kein Overlay, Bild + Voice tragen) |
| **Bildquelle** | AI-Szene (Runway API): 2 Clips (Werkstatt aussen + Telefon klingelt) |
| **Dauer** | 15s (2 Clips à ~7s) |
| **Transition** | Soft cross-dissolve zwischen den beiden AI-Clips |
| **Stimmung** | Vertraut, warm, nicht negativ. Alltag, nicht Katastrophe. |

---

### Szene 2 — Anruf wird aufgefangen (0:15–0:30)

| Feld | Wert |
|------|------|
| **Was man sieht** | Visualisierung des Anrufs: AI-Szene eines aufgefangenen Telefonats (symbolisch, nicht real). Dann Text-Einblendung: "Grüezi, hier ist die Weinberger AG. Wie kann ich Ihnen helfen?" |
| **Voiceover** | "FlowSight nimmt jeden Anruf an. Mit dem Namen Ihres Betriebs..." |
| **Overlay** | **Anruf** — weiss, Inter 44px, unten links, fade-in 0.3s |
| **Bildquelle** | AI-Szene (Runway API) + Typografie-Overlay (FFmpeg) |
| **Dauer** | 15s |
| **No-Go** | Kein Avatar, kein Bot-Gesicht, kein KI-Framing, kein "Lisa"-Name im Bild. Der Anruf wird aufgefangen — wer dahintersteckt, erlebt der Prospect beim eigenen Testanruf. |

---

### Szene 3 — SMS kommt (0:30–0:42)

| Feld | Wert |
|------|------|
| **Was man sieht** | AI-Szene: Close-up von Handwerker-Händen, die ein Smartphone halten. Auf dem Screen: eine Nachricht. Werkstatt-Hintergrund unscharf. Kein Gesicht, kein Lächeln — nur der Brückenmoment: die Bestätigung ist da. Dann: UI-Capture der SMS-Bestätigung. |
| **Voiceover** | "Ihr Kunde bekommt sofort eine Bestätigung per SMS..." |
| **Overlay** | **Bestätigung** — weiss, fade-in 0.3s |
| **Bildquelle** | AI-Szene (Runway) + UI-Capture (Playwright: SMS-Verify `/v/[id]`, 390x844) |
| **Dauer** | 12s |

---

### Szene 4 — Fall im Leitstand (0:42–0:57)

| Feld | Wert |
|------|------|
| **Was man sieht** | Leitstand Admin-Ansicht: FlowBar oben, darunter Case-Liste mit neuem Fall hervorgehoben (blauer "Neu"-Badge). Kategorie "Sanitär", Dringlichkeit "Dringend", PLZ, Beschreibung sichtbar. |
| **Voiceover** | "Im Leitstand sehen Sie den Fall sofort..." |
| **Overlay** | **Fall** — weiss, fade-in 0.3s |
| **Bildquelle** | UI-Capture (Playwright: `/ops/cases`, Weinberger-Tenant, 1920x1080) |
| **Effekt** | Ken-Burns: Zoom auf den neuen Fall (105% → 100%) |
| **Dauer** | 15s |
| **No-Go** | Keine echten Melder-Daten. Demo-Cases. |

---

### Szene 5 — Planung (0:57–1:12)

| Feld | Wert |
|------|------|
| **Was man sieht** | Case-Detail: Terminpicker mit Datum/Uhrzeit, Staff-Dropdown mit Techniker-Namen, Status wechselt zu "Geplant" (violett). |
| **Voiceover** | "Ihr Team sieht, was ansteht..." |
| **Overlay** | **Planung** — weiss, fade-in 0.3s |
| **Bildquelle** | UI-Capture (Playwright: `/ops/cases/[id]`, Case-Detail, 1920x1080) |
| **Effekt** | Ken-Burns: sanfter Zoom auf Terminpicker-Bereich |
| **Dauer** | 15s |

---

### Szene 6 — Erledigt (1:12–1:27)

| Feld | Wert |
|------|------|
| **Was man sieht** | Case-Detail: Status "Erledigt" (grüner Badge), Timeline zeigt sauberen Verlauf (Fall erstellt → Geplant → In Arbeit → Erledigt). Geordnet, abgeschlossen. |
| **Voiceover** | "Wenn der Auftrag erledigt ist, sieht das jeder..." |
| **Overlay** | **Erledigt** — weiss, fade-in 0.3s |
| **Bildquelle** | UI-Capture (Playwright: Case-Detail nach Status-Wechsel auf "Erledigt") |
| **Effekt** | Ken-Burns: minimaler Zoom, Fokus auf Timeline |
| **Dauer** | 15s |

---

### Szene 7 — Bewertung (1:27–1:42)

| Feld | Wert |
|------|------|
| **Was man sieht** | Review-Surface: 5 goldene Sterne, "Vielen Dank für Ihre tolle Bewertung!", Google-CTA-Button sichtbar. Dann: FlowBar Bewertungs-KPI mit goldenen Sternen. |
| **Voiceover** | "Und Ihre zufriedenen Kunden? Die werden nach dem Einsatz um eine Bewertung gebeten..." |
| **Overlay** | **Bewertung** — gold #d4a853, fade-in 0.3s |
| **Bildquelle** | UI-Capture (Playwright: `/review/[id]` mit 5 Sternen + FlowBar KPI) |
| **Effekt** | Ken-Burns + cross-dissolve zwischen Review-Surface und FlowBar |
| **Dauer** | 15s |

---

### Szene 8 — System (1:42–1:55)

| Feld | Wert |
|------|------|
| **Was man sieht** | Wide-Shot des Leitstands: FlowBar komplett sichtbar, alle 4 KPIs (Eingang → Bei uns → Erledigt → Bewertung), Quellen-Aufschlüsselung, Gold-Sterne. Das ganze System in einem Bild. |
| **Voiceover** | "Vom ersten Kontakt bis zur Bewertung. Ein System." |
| **Overlay** | — (kein Overlay, das Bild IST die Aussage) |
| **Bildquelle** | UI-Capture (Playwright: `/ops/cases`, FlowBar Full-Width) |
| **Effekt** | Statisch oder minimalster Zoom. Ruhe. |
| **Dauer** | 13s |
| **Transition OUT** | Fade-to-black 0.5s → 1s Schwarz → Closer |

---

### Founder-Closer (1:56–2:05)

| Feld | Wert |
|------|------|
| **Was man sieht** | Gunnar Wende, direkt in die Kamera, natürliches Licht, ruhiger Hintergrund. |
| **Audio** | Founder spricht selbst (kein Voiceover): "Ich bin Gunnar Wende. Ich richte Ihr Leitsystem persönlich ein." |
| **Untertitel** | **Gunnar Wende · Gründer, FlowSight** — weiss, Inter 36px, unten Mitte |
| **Bildquelle** | Smartphone-Aufnahme (Founder, Tag 9) |
| **Dauer** | ~8-10s |
| **Transition IN** | Fade-from-black 0.3s |
| **Transition OUT** | Fade-to-black 1.0s → Ende |

---

## Audio-Layers

| Layer | Inhalt | Lautstärke |
|-------|--------|------------|
| 1 | Voiceover (ElevenLabs) | 0dB (Master) |
| 2 | Hintergrundmusik | -18dB bis -20dB (unter Voiceover, nie dominant) |
| 3 | SFX (optional) | -12dB (Telefon-Klingeln Sz. 1, SMS-Ton Sz. 3 — nur wenn es nicht stört) |

Musik: Ruhig, ambient, confident. CC empfiehlt 2-3 freie Tracks in Tag 5.

---

## Zusammenfassung

| Szene | Zeit | Overlay | Quelle | CC-Tool |
|-------|------|---------|--------|---------|
| 1. Alltag | 0:00–0:15 | — | AI-Szene (2 Clips) | Runway API |
| 2. Lisa | 0:15–0:30 | Anruf | AI-Szene + Typo | Runway API + FFmpeg |
| 3. SMS | 0:30–0:42 | Bestätigung | AI + UI-Capture | Runway + Playwright |
| 4. Leitstand | 0:42–0:57 | Fall | UI-Capture | Playwright |
| 5. Planung | 0:57–1:12 | Planung | UI-Capture | Playwright |
| 6. Erledigt | 1:12–1:27 | Erledigt | UI-Capture | Playwright |
| 7. Bewertung | 1:27–1:42 | Bewertung (gold) | UI-Capture | Playwright |
| 8. System | 1:42–1:55 | — | UI-Capture | Playwright |
| C. Closer | 1:56–2:05 | Name+Titel | Founder-Video | FFmpeg |
| **Total** | **~2:05** | | | |
