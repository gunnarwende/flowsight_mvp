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
- `produce_hero.mjs` skizzieren (ruft die Primitive in Hero-Reihenfolge). ✅ Phase „call" gebaut (`#773`).
- Hero-Audio-Segmente exakt auf `assemble_call.mjs`-Struktur mappen (welche Zeile = welches Segment) + Greeting volle-Zeile-Render.
- Leitzentrale-Nav-Pfad in `record_leitsystem_screen.mjs` auf den Hero-Flow (NEU→Filter→Fall→Verlauf) setzen.
- Prüfen, ob die Screen-Renders in der Sandbox laufen (Chromium/Playwright) — sonst Laptop-Runbook.

---

> **Geltungsbereich:** Dieser Bauplan gilt für das **ganze Stern-3-Bündel** — Hero **und** Knoten ①–④ **und** E-Mail/Beweis-Seite. Sie sind gekoppelt (s. „go"-Vertrag unten), nicht vier Einzelprojekte.

## 🛡️ Immunsystem — Lehren aus der alten Pipeline (nicht verhandelbar)
Destilliert aus `PIPELINE_BIBLE.md` §4/§8/§9 + Historie §47/§48/§53 (5 Wochen, inkl. 29.04.-Crash). Jede Regel hat Blut gekostet:
1. **Audio ist die Master-Uhr.** Erst Call-/VO-Audio final locken, dann slavt ALLES Visuelle (Screen, Gesicht) darauf. **Nie Screen-first** (= der Resync-Rattenschwanz, §53 Phase 2: „Mapping absolut falsch"). *(Bei Stern 3 präventiv erledigt: Founder-Audio Phase 1 zuerst gelockt.)*
2. **Gesicht/Overlay NIE in der Build-Source.** Visual-Layer (Gesicht, Maus) gehören in **Post**, nie in die Aufnahme (§48/§53: eingefrorenes Loom 0:11–0:50 durch Sharpness-Freeze der Source).
3. **Overlays in EINEN Filtergraph — kein N-faches Re-Encode.** Das 5-fach-Re-Encode auf 1440×900 H.264 fror die alte Pipeline ein (>1h, >300 MB, 29.04.-Crash). Toast/Badge/Stern-Region = ein `overlay/drawbox`-Graph, nicht sequenziell. Weniger Generationsverlust obendrein.
4. **Backup-first.** Source NIE ohne Backup überschreiben; **jeden abgenommenen Take/Master sofort sichern** (29.04. = 4–6 h verloren, gerettet nur durchs Apr-27-Backup). *(Stern 3: Founder-Master verlustfrei auf Bunny + Manifest, Originale unangetastet.)*
5. **Config/Manifest = SSOT, kein Hardcoding.** `HERO_DEMO_SPEC.md` (Wortlaut) + `aufnahme/_takes/manifest.json` (Audio) steuern downstream. Ein Firmenname steht in KEINEM Script.
6. **Gates = Immunsystem.** Jede vom Founder gefundene Fehlerklasse wird zu einem Gate → fängt sich beim nächsten Build selbst (alt: 12 Gates). Hero-Gates: Start≠schwarz · Greeting-Firmenname (STT) · Schluss-Stille-Cap · Reveal-Timing · Call-Loudness/Clipping (schon in `produce_hero`).

## ⚓ Anker-Disziplin (NEU — dynamisch + state-basiert)
Die alte Pipeline blutete, wo Anker **fehlten** (§9: „Part 5 GAR NICHT geankert → Maus hängt hinterher"). Neu, härter:
- **Anker nach JEDER Screenflow-Änderung** — jedes Bild, jeder Flow, jede Animation bekommt sofort einen Ankerpunkt.
- **State-basiert statt Zeit:** `waitForSelector`/echte Zustands-Events, **nicht** blinde `waitForTimeout` (killt den Aufnahme-Jitter an der Wurzel — der `holdUntilMaster`-Nachfolger).
- **Verify pro Durchlauf, pro Betrieb:** nach jedem Build je Betrieb gegen die Prüfsteine messen — **Dauer · Sequenz · Qualität**. Der Founder legt die Prüfsteine; jeder wird zu einem Gate.
- **Dynamisch, nicht hart verdrahtet:** Anker leiten sich aus der Audio-Master-Uhr + Zuständen ab, damit sie über Betriebe/Varianten tragen (alt≠neu: statt fixer Master-Zeiten → aus dem gelockten Audio abgeleitet).

## ⏱️ Performance-Ziel: ~10 Min/Betrieb (alt: 22–40)
Wo die Zeit steckte (§9-Messung Dörfler 04.06.): T2 5:23 · T3 6:15 · **T4 8:00** — fast alles in Echtzeit-Recordings + T4s fünf Re-Encodes. Hebel neu:
- **Kürzerer Körper:** 1 Hero (90 s) + kurze Knoten statt 4×~3–6 Min Takes.
- **Overlays gemerged** (ein Filtergraph, s. Immunsystem #3) → der größte alte Zeitfresser fällt.
- **Universell-einmal / Canonical-Prinzip:** Hero-Gesicht + Knoten ③/④ = einmal für alle; pro Betrieb nur Greeting/Anliegen-Swap + Seed → Re-Runs erzeugen fast nichts neu.
- **CI-Parallelität:** mehrere Betriebe auf getrennten Runnern (die alte „strikt sequenziell"-Regel galt dem *einen* lokalen Dev-Server; CI hebt den Flaschenhals).
- **Cache:** Screen-Renders + Call-Audio cachebar (nur bei Änderung neu).

## 🚦 Der „go"-Vertrag: 1 Betrieb = volles Bündel
**Trigger:** Sales-Go (Stern-2-Cold-Call positiv, Weg-1-„ja, schicken Sie") — nicht spekulativ kalt (s. `SALES_BIBLE`).
**Ein Kommando** (`produce_hero --slug <betrieb> --all`, Nachfolger von `produce_videos`) produziert das **ganze Bündel** für den Betrieb:
- **Hero** (90 s, Bookend) · **Knoten ①–④** · **E-Mail** (`send_outreach`) · **Beweis-Seite** `/p/[token]` (Hero + Knoten-Reveal statt 4 Takes).
- **Universell (einmal, geteilt):** Founder-Gesicht/VO-Master, Knoten ③/④-Gesicht, Lisa-Zeilen, Schablonen. **Pro Betrieb (Swap):** Greeting-`[Betrieb]`, Anliegen-Gewerk, `[Inhaber]`-Knoten-①-Zeilen, Seed (Fall/Adresse/Kanton), Brand-Farbe, E-Mail-Haken.
- Gate-gated + pro Betrieb verifiziert (Anker-Disziplin oben), bevor die Beweis-Seite scharf geht.
