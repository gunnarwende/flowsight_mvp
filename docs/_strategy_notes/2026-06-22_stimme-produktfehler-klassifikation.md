# Stimme — Produktfehler: Klassifikation + Lösungsansätze

> **STATUS: PRODUKT-ANALYSE (2026-06-22)** — Founder: „Stimme ist aktuell ein Produktfehler. Erst Produkt, dann Demo."
> Basierend auf dem echten Pipeline-Code (`scripts/_ops/audio/`). Ziel: Probleme klassifizieren, Korrelation mit
> Adresse verstehen, saubere Lösungsansätze + Voraussetzungen. Verwandt: V8/V9, `…_voice-ch-und-adresse.md`.

## Ist-Stand (Pipeline gelesen)
- **3 Stimmen-Kontexte (nicht verwechseln!):**
  - **Live-Agent** (Retell): `voice_id custom_voice_3d93cf97…`, `de-DE`. **Das hören echte Anrufer = das Produkt.**
  - **Demo-Video** (Pipeline): `_lib/eleven.mjs` Voice **„ela"** (`NE7AIW5DoJ7lUosXV2KR`), Modell `eleven_multilingual_v2`, Settings **`style:0.0`** / `stability:0.5` / `similarity:0.75`. Das ist die Lisa in den Beweis-Videos.
  - **„gunnar"-Klon** (`Yyo65…`) = Fallback (der 45-Min-DIY-Klon, Founder-Urteil: schlecht).
- **TTS-Wrapper** `eleven.mjs → tts({text,voice,model,stability,similarity,style,speakerBoost})`, Cache per Hash. Braucht `ELEVENLABS_API_KEY`.
- **Dynamischer Slot:** Agent-Line #1 „Hallo, hier ist Lisa — die digitale Assistentin {{connector}} {{name}}…", Name dynamisch, Rechtsform (GmbH/AG) gestrippt.
- **FIXER Timing-Slot:** Greeting MUSS **preis 6,5s / notruf 7,0s** treffen, sonst Screenflow-Build-Fail (Kommentar in `lisa_lines.mjs` Z.118–122). **Nur im Demo-Video, NICHT im Live-Agent** (Echtzeit-Gespräch = kein Lock).

## Problem-Klassifikation
| # | Problem | Ursache | Wo |
|---|---------|---------|-----|
| **P1** | **Klang / keine Emotion** | `style:0.0` (null Ausdruck), altes Modell `multilingual_v2` (nicht v3); + Live-Stimme deutsch-deutsch | beide |
| **P2** | **Aussprache** CH-Orte/Strassen/Helvetismen | Stimme/Modell nicht CH-trainiert; keine Aussprache-Steuerung (Retell-Dict = English-only) | beide |
| **P3** | **Timing-Slot-Bindung** | jede Voice/Modell/Settings-Änderung ändert Sprechdauer → Greeting-Slot 6,5/7,0s | **nur Demo** |

## Korrelationen (der Knoten)
- **P2 ↔ Adresse (V9):** Die schlechte CH-Aussprache ist der **Grund**, warum Read-back deaktiviert wurde (V3). Entkopplung bleibt gültig (PLZ-Ziffern bestätigen + Ort aus PLZ ableiten + Swiss-Post-Validierung + Vertrauens-Ampel). **Bonus:** gute CH-Aussprache → natürliches Read-back zurück.
- **P1/P2 ↔ P3:** Ein Voice-Fix im **Demo** ist eine **gekoppelte Audio+Video-Änderung** (Slot re-fitten oder Screenflow re-timen), kein Drop-in. Im **Live-Agent** frei änderbar.

## Lösungsansätze
0. **Arenen trennen:** **Live-Agent zuerst** (das Produkt, frei änderbar) → **Demo danach** (Slot-gebunden).
1. **Settings-First (billigster Test):** `style` hoch + Modell **v3** auf der *bestehenden* Stimme — könnte „keine Emotion" schon stark heben, **bevor** wir neue Stimmen jagen. `style:0.0` ist vermutlich ein Hauptgrund für die Flachheit.
2. **Taste-Test-Matrix:** dieselben Lisa-Zeilen (Greeting + Empathie-Zeile + Adresse mit CH-Ort wie „Wädenswil") × {`multilingual_v2`, `v3`, `flash v2.5`} × {style/stability} × {Kandidaten-Stimmen, ggf. Cartesia} → durchhören, Sieger auf **BEIDES** (Emotion **und** CH-Aussprache).
3. **Adresse entkoppelt halten** (Ampel); Read-back nur als Bonus zurück, wenn Aussprache sitzt.
4. **Demo-Slot:** bei Voice-Wechsel Greeting-Dauer neu messen → Text re-fitten oder Screenflow re-timen.

## Voraussetzungen (um überhaupt zu testen/fixen)
- **`ELEVENLABS_API_KEY` (env) + Netzwerkzugang zu `api.elevenlabs.io`.** Beides im Sandbox aktuell zu (Key fehlt, Host geblockt — geprüft). Key liegt in Vercel/lokal.
- ffmpeg (da), node-Scripts (da), `tts()`-Wrapper (da). → **Infra ist komplett vorhanden.**
- **Mit Key + Egress nehme ich dir die Matrix ab:** generiere die Sample-Batterie über alle Varianten, du urteilst nur per Ohr.

## Offene Richtungs-Entscheide (Founder)
- Live-Agent zuerst (Empfehlung)?
- Settings-First-Quick-Win (style↑ + v3) als allererster Test?
- Bei ElevenLabs bleiben oder Cartesia mittesten?
