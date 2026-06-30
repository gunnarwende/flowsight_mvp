# Hero-Pipeline — Bauplan (Reuse-Map) · Stern 3

> **Zweck:** Das **WIE** der Hero-Produktion (90 s + Knoten), gebaut auf den **bestehenden**
> Pipeline-Primitiven in `scripts/_ops/` — NICHT neu erfunden. Der ganze Code + alle Assets der
> alten 4-Take-Pipeline liegen **live im Repo** (nur die Docs waren archiviert). Wir **ernten die
> Primitive** und schreiben **einen dünnen, neuen Hero-Orchestrator** obendrauf; die `take1/2/3/4`-
> *Orchestrierung* (an das 13-Min-Modell genagelt) schleppen wir NICHT mit.
>
> Quelle WAS = [`HERO_DEMO_SPEC.md`](HERO_DEMO_SPEC.md) (wortgenaues Script + Screenflow). Lessons =
> [`_archive/PIPELINE_BIBLE_historie_bis_20260603.md`](../../_archive/PIPELINE_BIBLE_historie_bis_20260603.md)
> (Audio=Master-Uhr · Gesicht-live-über-Audio · Variante-eigene-Timeline · Master-Asset-Swap).

## Grundprinzip (aus der Bible, hart erkämpft)
1. **Audio ist die Master-Uhr.** Erst Call-Audio final locken, dann slavt alles Visuelle darauf. NIE Screen-first (= der alte Resync-Rattenschwanz).
2. **Gesicht live über laufendes Audio+Screen aufnehmen** → 100 % synchron, null Post-Sync. (Founder, Drehtag.)
3. **Lego-Blöcke, eigene Timeline je Block** → eine Änderung kaskadiert nicht.
4. **Skalierbar + persönlich:** Mensch-Beats EINMAL (universell), pro Betrieb nur `[Betrieb]`/`[Inhaber]`-Zeilen neu vertont + Seed-Swap.

## Reuse-Map — was wir wiederverwenden / anpassen / neu bauen

| Hero-Komponente (Zeit) | Bestehendes Skript / Template | Status |
|---|---|---|
| **Telefon-Visual** klingeln→Anruf→beendet (13–37.5) | `record_phone_call_visual.mjs` · `screen_templates/sequences/take2_samsung.html` · `call_screen.html` · `call_ended_screen.html` · `_lib/renderPhoneBezel.mjs` · `render_status_bar.mjs` | ♻️ **Reuse-Engine**, ⚙️ Timing anpassen (Hero-Call ~22 s statt ~165 s) |
| **Call-Audio** Lisa+Brunner | `audio/assemble_call.mjs` · `_generated/lisa_tts/*` | ♻️ Assembly-Mechanik, 🆕 **Hero-Sprechsegmente** (Lisa 6 / Brunner 3 — kürzer als Take2); ⚠️ Greeting **volle-Zeile-Render** (kein fester Slot) |
| **Leitzentrale-Interaktion** NEU→Filter→Fall→Verlauf (38.5–49) | `record_leitsystem_screen.mjs` · `produce_screenflow.mjs` (Leitsystem-Welt, Playwright→echte App) | ♻️ Reuse-Engine, ⚙️ Navigationspfad auf Hero-Flow setzen |
| **Seed-Demo-Fall** Brunner / Bad·Wärmepumpe / Frauenfeld | `derive_config.mjs` + Seed-Schritt (Supabase-Case) | ⚙️ **Seed-Werte umstellen** (s. u.) — Lauf auf Laptop/CI (Supabase) |
| **Gesicht-Bookend** Hook + Schluss (bildfüllend) | `compose_take1_hero.mjs` (Face-Composite-Mechanik) | ♻️ Teil-Reuse, 🆕 **Full-Frame-Layout** (kein Split-Panel wie Take1) |
| **Heirat** Audio+Screen+Gesicht | `mix_demo_audio.mjs` · `compose_*` (ffmpeg) | ♻️ Reuse, 🆕 **Hero-Montage** (Lego: Hook→Call→Leitzentrale→Schluss→Reveal) |
| **Knoten-Reveal** (Karten gleiten unter Hero, Peek-Regel) | Beweis-Seite-Frontend | 🆕 **Neu** (Front-End-Animation auf der Hero-Seite) |
| **Quality-Gates** | `qg_video.mjs` | ♻️ Reuse, 🆕 Hero-Gates (Start≠schwarz · Greeting-Firmenname · Schluss-Stille-Cap) |
| **Verpackung → Beweis-Seite** `/p/[token]` | `build_proof_page.mjs` · `proof_add_variants.mjs` | ♻️ Reuse, ⚙️ „1 Hero + Knoten" statt „4 Takes" |
| **Gesicht-live-Aufnahme-Technik** | — (Founder-Loom/Røde) | 👤 **Founder am Drehtag** |

**🆕 Wirklich neu (der dünne Orchestrator):** ein `produce_hero.mjs`, das die obigen Primitive in **Hero-Reihenfolge** fährt — kein Fork der take*-Skripte.

## Seed-Werte (umstellen — alt → neu)
- **alt:** Rohrbruch · Wende · Seestrasse 14, Oberrieden
- **neu:** Anliegen **Bad / Wärmepumpe** · Kunde **Herr Brunner** · Adresse **Bahnhofstrasse 14, 8500 Frauenfeld** (kanton-gebunden TG)
- Demo-Tenant für den Master-Dreh = **Dörfler AG**. Fall-Quelle = `voice` (Anruf). Brunner-Telefon = fiktive Kunden-Nummer (s. `derivePhoneDemoCase`).

## Was DU am Drehtag aufnimmst (universell, EINMAL)
Gesicht+Stimme zusammen (Røde als Mikro der Loom/Kamera): **Hook 0–10**, **Schluss-Beats 49–82**, **Knoten ③+④** (Gesicht), **WARM-Opener 0–13**. + **VO-Stimme** (nur Ton, über Screen): 10–15 · 38.5–49 · Knoten-①/②-VO. **Den Anruf nimmst du NICHT** (vorproduziertes Audio).

## Kritischer Pfad für den Drehtag (Reihenfolge)
1. **Seed** Brunner/Frauenfeld setzen *(Laptop/CI — Supabase)*.
2. **Hero-Call-Audio** assemblen + **locken** (Lisa-Hero-Zeilen + Brunner) → die Master-Uhr.
3. **Screen-Footage rendern:** Telefon-Visual (klingeln→Call→beendet) + Leitzentrale-Interaktion *(Playwright; Chromium ist in der CC-Sandbox — Render-Versuch hier möglich, sonst Laptop)*.
4. **Founder filmt Gesicht LIVE über das laufende Audio+Screen** (Bible-Technik) → null Post-Sync.
5. **Montage** (Lego-Blöcke) + `qg_video` + Beweis-Seite.

## Env-Realität (was läuft wo)
- **CC (Sandbox):** Code/Wiring, der Hero-Orchestrator, Audio-Segment-Listen, Seed-Werte; **evtl. Playwright-Renders** (Chromium ist vorinstalliert — Render-Versuch fürs Screen-Footage).
- **Laptop (Founder):** Gesicht-Aufnahme (Røde/Loom/Speakflow), finale ffmpeg-Heirat, visuelle Abnahme. Supabase-Seed (oder per CI-Workflow).

## Offen / als Nächstes (CC)
- `produce_hero.mjs` skizzieren (ruft die Primitive in Hero-Reihenfolge).
- Hero-Audio-Segmente exakt auf `assemble_call.mjs`-Struktur mappen (welche Zeile = welches Segment) + Greeting volle-Zeile-Render.
- Leitzentrale-Nav-Pfad in `record_leitsystem_screen.mjs` auf den Hero-Flow (NEU→Filter→Fall→Verlauf) setzen.
- Prüfen, ob die Screen-Renders in der Sandbox laufen (Chromium/Playwright) — sonst Laptop-Runbook.
