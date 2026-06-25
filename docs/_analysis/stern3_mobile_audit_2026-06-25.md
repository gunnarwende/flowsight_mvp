# Stern 3 — Mobile-Readiness & Pipeline-Forensik (Read-only Audit)

Datum: 2026-06-25
Autor: Laptop-CC (im Auftrag von Handy-CC; Handy kann das lokale Dateisystem nicht sehen)
Status: READ-ONLY. Es wurde nichts an der Pipeline verändert. Einziger Schreib-Output ist dieses Dokument.
Rahmenbedingung: Desktop = Windows. Mobile = Samsung S23 (Android). Kein macOS, kein iPhone in der Kette.

---

## Kernaussage in drei Sätzen

Stern 3 (die Simulations-/Beweis-Pipeline) ist die einzige harte Mobil-Grenze der gesamten Customer Journey — aber der Laptop-Zwang kommt NICHT aus Technologie-Lock-in: „ScreenFlow" ist keine macOS-App, sondern ein eigenes System aus Playwright/Chromium + ffmpeg + Canvas, das prinzipiell headless auf jeder Linux/CI-Box läuft.

Der eigentliche Laptop-Zwang sind drei lösbare Dinge: (1) rund 19 GB eingefrorene Medien-Assets, die nur lokal liegen und zu 0 % in git sind, (2) Secrets in `.env.local`, (3) die menschliche visuelle Abnahme plus ein lokaler Dev-Server.

Das größte Risiko ist nicht „mobil oder nicht", sondern Datenverlust: Wenn dieser Laptop verloren geht, sind die nicht-reproduzierbaren Quell-Aufnahmen (Loom-Gesichter, Screenflow-`.webm`, Locked-Audio-Master) und die Bunny-Zugangsdaten in der lokalen `Bunny.txt` unwiederbringlich weg.

---

## 1. Lokal vs. GitHub — die Lücke

Gesamtvolumen `docs/gtm/pipeline/06_video_production/` ≈ **19 GB**. Davon in git: **302 kleine Text-/JSON-Dateien (wenige MB)**. Medien in git: **0**. Die `.gitignore` schließt pauschal `*.mp4`, `*.mp3`, `*.wav`, `*.webm` aus (Zeilen 51–54) plus die Verzeichnisse `_generated/`, `_clean/`, `screenflows/*/`.

### 1a. Die vier Liefervideos (das Deliverable)
Pro Betrieb unter `master_takes/_delivery/<slug>/`. Beispiel `leins-ag`:

| Pfad | Format | Größe | in git |
|---|---|---|---|
| `master_takes/_delivery/<slug>/01_intro.mp4` | mp4 | 7.1 MB | NEIN (ignored) |
| `master_takes/_delivery/<slug>/02_anruf.mp4` | mp4 | 18.2 MB | NEIN |
| `master_takes/_delivery/<slug>/03_wizard.mp4` | mp4 | 5.9 MB | NEIN |
| `master_takes/_delivery/<slug>/04_bewertung.mp4` | mp4 | 14.9 MB | NEIN |

Existiert für **17 Betriebe**. `_delivery/` gesamt = 632 MB, komplett untracked. Quelle = die 4 Master-Takes `master_takes/take1..take4/<slug>.mp4` (`take4/` allein 3.1 GB).

Einzige Medien, die git behält (explizite Ausnahme `.gitignore:63`): die ausgespielten Website-Videos `src/web/public/videos/hero_v5.mp4` (1.3 MB) und `live_erleben_v5.mp4` (16.1 MB) — **tracked**.

### 1b. Audio-Master (mit stiller Falle)

| Pfad | Format | Größe | in git |
|---|---|---|---|
| `_locked/audio/take2_notruf.wav` | wav | 36.5 MB | NEIN (ignored) |
| `_locked/audio/take2_preis.wav` | wav | 36.2 MB | NEIN (ignored) |
| `_locked/audio/take3.wav` | wav | 14.3 MB | NEIN (ignored) |
| `_locked/audio/take2_notruf.aac` | aac | 8.8 MB | **NEIN — nicht ignored, nur nie committet (RISIKO)** |
| `_locked/audio/take2_preis.aac` | aac | 8.7 MB | **NEIN — RISIKO** |
| `_locked/audio/take3.m4a` | m4a | 3.6 MB | **NEIN — RISIKO** |
| `_locked/audio/take4.m4a` | m4a | 2.6 MB | **NEIN — RISIKO** |
| `_locked/audio/take4_PRE-PAUSE-098-057.m4a` | m4a | 3.9 MB | **NEIN — RISIKO** |

Asymmetrie beachten: `.wav` ist global ignored, aber **`.m4a`/`.aac` stehen NICHT in der `.gitignore`** — sie sind einfach nie hinzugefügte Dateien. Das täuscht Sicherheit vor; bei Plattenverlust sind sie weg. Es sind die gemuxten Voice-Over-Master.

### 1c. „ScreenFlow"-Quellen (das eigene Aufnahme-System)
Keine `.screenflow`/`.scc`-Dateien im gesamten Repo. `screenflows/` (2.6 GB) = **234 `.webm`-Bildschirmaufnahmen + 129 `.json`** Event-/Config-Dateien, plus PNG-Masken/Bezel. `.gitignore:59–60` ignoriert `screenflows/*/` außer `_shared/`. Jede `screenflows/<slug>/` (die echten `.webm`-Quellaufnahmen + Event-Logs) ist **vollständig lokal-only**. In `_shared/` sind nur die kleinen PNG-Masken tracked; die großen `loom_*.mp4` fängt `*.mp4`.

### 1d. Locked Masters & generierte Artefakte

| Verzeichnis | Größe | in git |
|---|---|---|
| `_generated/` | 9.7 GB | NEIN (ignored; laut Doku „aus Skripten reproduzierbar") |
| `master_takes/` | 4.2 GB | NEIN (alle Medien ignored) |
| `_locked/` | 286 MB | NEIN (nur 1 Datei tracked) |
| `_clean/` | 97 MB | NEIN (ignored) |
| `_baseline/` | 48 MB | NEIN (untracked) |

Highlights (alle untracked): `_locked/take4_R24_lockedmaster_20260601/R24_doerfler-ag_with-mouse.mp4` (16.7 MB), `_locked/schablonen/take2_notruf_schablone.mp4` (19 MB) / `take2_preis_schablone.mp4` (18.6 MB) / `take4_schablone.mp4` (15 MB), `_locked/take4/canonical_stars_ref.mp4` (45 KB, Gold-Stern-Referenz).

### 1e. Phase-/Anker-Daten (das „Rezept" — am ehesten wiederherstellbar, aber meist untracked)
`phase_library_defs/` = 76 Dateien, davon **8 tracked**:
- tracked: `take2_sanitaer.json`, `take3_sanitaer.json`, `take4_sanitaer.json`, `_calibration_anchors/take3_sanitaer.json`, `_overrides/{doerfler-ag,leins-ag,stark-haustechnik,waelti-sohn-ag}/take3_sanitaer.json`
- **untracked / RISIKO:** `_calibration_anchors/take4_sanitaer.json`, alle `_overrides/<slug>/take2_sanitaer.json` + `take4_sanitaer.json` (~21 Betriebe), `_locked/take4_phase_map.json` + `_v3.json`, `specs/take4_master_spec.json`, sämtliche `screenflows/<slug>/take*_event_log.json`.

Heißt: take3 ist in git gesichert, aber take2/take4-Overrides, der take4-Kalibrier-Anker, die take4-Phase-Maps, die Master-Spec und alle Event-Logs sind lokal-only.

### 1f. Bunny (CDN/Stream)
Code-only, **keine IDs/GUIDs committet**. `scripts/_ops/_lib/bunny.mjs` liest nur Env-Var-Namen (`BUNNY_STREAM_API_KEY`, `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_CDN_HOSTNAME`); GUIDs entstehen beim Upload und landen in Supabase `proof_pages`, nicht in einer Repo-Datei.
- **`Bunny.txt`** im Repo-Root (1782 B) — untracked UND in `.gitignore:99`. Hier liegen am wahrscheinlichsten die echten Bunny-Zugangsdaten/IDs. **Hochrisiko: bei Verlust ist die Verbindung zu allen bereits hochgeladenen CDN-Videos gekappt.** (Inhalt wurde nicht ausgegeben.)

### 1g. Loom (Quell-Footage, nicht in der Live-Pipeline als API)
„Loom" = vorab aufgenommenes Talking-Head-/Avatar-Material (Founder-Gesicht), per ffmpeg overlaid. Keine Loom.com-Integration, nur lokale `.mp4`:
- `screenflows/_shared/loom_t2_preis_final.mp4` (**403 MB — größte Einzeldatei**), `loom_t2_notruf_final.mp4` (193 MB), `loom_t3_final.mp4` (46 MB), `loom_t4_part1_synced.mp4` (95 MB), `_loom_fallback.mp4` (31 MB)
- `screenflows/<slug>/loom_avatar.mp4` (leins-ag 273 MB, doerfler-ag 121 MB)
- `_locked/loom/take2_notruf_loom.mp4` (7.4 MB), `take2_preis_loom.mp4` (7.0 MB)

**Jede Loom-`.mp4` ist ignored/lokal-only und NICHT aus Skripten reproduzierbar** (es sind Original-Aufnahmen).

---

## 2. As-Built-Landkarte

Terminologie: „Stern 3" ist die Journey-Phase „Simulation", nicht ein Take. Deliverable = private `/p/<token>`-Beweis-Seite mit **4 Videos: T1 Intro, T2 Anruf, T3 Wizard, T4 Bewertung**. „Loom" = das in jeden Take eingeblendete Founder-Gesicht, kein 5. Video. Autoritatives Dok: `docs/gtm/pipeline/PIPELINE_BIBLE.md` (Stand 03.06., Liefer-Update 18.06.).

```
[1] DATEN / ANKER
    Website --crawl_extract.mjs (Playwright)--> docs/customers/<slug>/crawl_extract.json
            (+ Zefix + Google Places)
    crawl_extract.json --derive_config.mjs--> docs/customers/<slug>/tenant_config.json   <= SSoT
            (+ founder_review.md ; FOUNDER-STOP, prüft v.a. brand_color)

[2] SEED (Daten in DB, datums-relativ)
    tenant_config.json --seed_screenflow_from_config.mjs--> Supabase cases + tenants.modules.primary_color
                       --insert_take3_wizard_case.mjs / insert_take4_lifecycle.mjs--> Demo-Cases

[3] AUDIO (universelle Locked-Master + per-Betrieb Greeting-Swap)
    ElevenLabs (audio/_lib/eleven.mjs) --generate_lisa_tts.mjs--> _generated/lisa_tts/.../agent_01.wav
    _locked/audio/take2_<variant>.wav --swap_tenant_greeting.mjs--> _generated/takes/<slug>/...
            (ersetzt NUR das Greeting im festen Slot [44.0s, +7.0s])
    T3/T4-Audio = voll universell locked: _locked/audio/take3.m4a, take4.m4a

[4] SCREENFLOW (per-Betrieb Bildschirmaufnahme — die eigene Render-Engine)
    produce_screenflow.mjs / record_take4.mjs / record_wizard_take3.mjs / record_leitsystem_take*.mjs
      = Playwright chromium + recordVideo gegen http://localhost:3000 (echte Next-App)
      + Samsung-HTML-Sequenzen (screen_templates/sequences/*.html)
      orchestriert von pipeline_screenflow.mjs --> screenflows/<slug>/take{2,3,4}_*.webm + Event-Logs

[5] COMPOSE / ANKER (per-Take .mjs)
    build_take2_final.mjs / build_take3_final.mjs / build_take4_final.mjs
      -> Override (_gen_t2/t3_override.mjs) -> phase_library_defs/_overrides/<slug>/take*_sanitaer.json
      -> build_from_phase_schedule.mjs (ffmpeg-Composite auf Master-Timing)
      -> Locked-Audio muxen (ffmpeg)

[6] LOOM-OVERLAY (universelles Founder-Gesicht, gleich für alle)
    _locked/loom/take2_<variant>_loom.mp4 / video_example/Video_default.mp4
      -> renderLoomCircle.mjs (Kreis-Crop) + ffmpeg-Overlay

[7] MAUS-LAYER (universeller aufgenommener Cursor)
    _generated/mouse_recordings/doerfler-ag/take{3,4}.json (auf <slug> kopiert)
      --mouse_layer/render.mjs (@napi-rs/canvas -> ffmpeg-Overlay)--> master_takes/take{3,4}/<slug>_with_mouse.mp4

[8] T4-FINISH (ffmpeg)  apply_toast_overlay -> apply_devbadge_cover -> apply_canonical_stars
[9] QG  qg_video.mjs / qg_t4_compare.mjs / qg_take3_vs_schablone.mjs / qg_t3_modal_timing.mjs
[10] COLLECT  collect_delivery.mjs -> 07_stresstest/abgenommen/<slug>/ bzw. master_takes/_delivery/<slug>/
              (T1 = CANONICAL: aus leins-ag bit-identisch kopiert)
[11] UPLOAD + SEITE  build_proof_page.mjs --(_lib/bunny.mjs)--> Bunny Stream (EU/Frankfurt)
              + Supabase proof_pages + /p/<token> ; make_t2_portrait.mjs + proof_add_variants.mjs
[12] VERSAND  send_outreach.mjs --live  (Resend, ein /p/-Link)

EIN Befehl orchestriert [2]->[11]:  scripts/_ops/produce_videos.mjs --slug <slug>
(run_chain.mjs + scripts/chains/voice/* ist eine SEPARATE Pipeline — Voice-Call-Analyse, nicht der Video-Build.)
```

---

## 3. Reproduzierbarkeit

**Ja, die 4 Videos sind heute aus Skripten neu erzeugbar** — via `produce_videos.mjs --slug <slug>` bzw. die per-Take-Kette. Es gibt keinen kreativen App-Schritt in der Regenerations-Schleife.

**Automatisiert** (Skript-getrieben): crawl, derive, seed, TTS, Greeting-Swap, alle Aufnahmen (Playwright), alles Compositing (ffmpeg), Maus-Overlay, QG, Bunny-Upload, E-Mail.

**Manuell / menschlich:**
- Founder-Review von `tenant_config.json` (v.a. brand_color) — STOP-Gate.
- Founder-Sichtabnahme jedes Takes + manuelles Verschieben nach `abgenommen/`.
- Lokaler Dev-Server muss laufen (`npm --prefix src/web run dev`) — Standard-Server, keine Kreativarbeit.

**Was bricht, wenn der Laptop weg ist** (Reproduzierbarkeit hat harte lokale Abhängigkeiten):
- **Eingefrorene, gitignorte, NICHT aus Config regenerierbare Assets:** `_locked/audio/take2_*.wav` + `take3.m4a`/`take4.m4a`; `_locked/loom/*` + `video_example/Video_default.mp4` (Founder-Gesicht); `_locked/schablonen/*`; die universellen Maus-JSONs `_generated/mouse_recordings/doerfler-ag/take{3,4}.json`; `_locked/take4/canonical_stars_ref.mp4`. Ohne Backup nur durch **Neu-Aufnahme** von Gesicht/Stimme/Maus wiederherstellbar. **Größtes Reproduzierbarkeits-Risiko.**
- **Secrets:** ElevenLabs/Supabase/Bunny/Resend/Retell/Anthropic in lokaler `.env.local` (gitignored). (Anmerkung: für CI sind diese seit 23.06. in GitHub Secrets gespiegelt — siehe `docs/architecture/env_vars.md`, Abschnitt „Mobile parity".)
- **`CANONICAL_T1_GUID`** ist in `_lib/bunny.mjs` hardcodiert; geht die Bunny-Library verloren, muss T1 via `upload_canonical_t1.mjs` neu hoch und die GUID ersetzt werden.
- **Bekannte Nicht-Determinismus** (Bible §9): T4-Timing jittert ±1–2 s pro Build; G_T4_CASEOPEN kann fehlschlagen und einen Rebuild erzwingen. Ein From-Scratch-Lauf konvergiert, braucht aber evtl. Retries.

---

## 4. Mobile-Blocker-Audit (Stern 1 → 8)

| Stern | Was | Mobil heute | Laptop-gebundene Teile |
|---|---|---|---|
| 1 Kontakt | Lead-Liste bauen/qualifizieren, jeden Betrieb crawlen | **Ja** | Keine — `crawl.yml` (workflow_dispatch). Go-Discovery (`discover.yml` + Bedienpult in `/ceo/journey`) gerade im Zulauf (PRs #697/#700). |
| 2 Cold Call | Das „Ja" zur Simulation gewinnen | **Ja** (Tooling mobil; der Call ist ein Telefonat) | Keine software-seitig. |
| 3 Simulation | 4-Video-Beweis-Seite bauen + Mail | **Nein (Build/Render)** | **Die Video-Produktion** (siehe unten). Versand ist server-gated. |
| 4 Gesehen | First-View-Signal -> warmer Follow-up | **Ja** | Keine (Tracking server-seitig). |
| 5 Verkaufsgespräch | Warmer Sales-Call | **Ja** | Keine software-seitig. |
| 6 Cockpit | Kunde baut sein Leitsystem | **Teilweise** | Große UI-Refactors -> Laptop (`session_ritual.md`). |
| 7 Go-live & Vertrag | Freigabe, Zahlung, Voice scharf | **Teilweise/meist ja** | Live-Ops mobil (`retell-publish.yml`, `db-migrate.yml`, `supabase-fix.yml`); Zahlung/Prod-Deploy bewusstes Founder-Gate. |
| 8 Begleitung & Wert | Erste Cases begleiten, Weekly Report | **Ja** | Keine (`weekly-report.yml`). |

**7 von 8 Sternen sind heute handy-fähig.** Stern 3 ist die einzige harte Grenze.

### Stern 3 — warum laptop-gebunden (und warum lösbar)
Belege im Repo: `docs/gtm/sales/.../mobile_founder_command_diagnose.md:32-35` („Harte Grenze … Video-Pipeline … ist laptop-gebunden"), `docs/runbooks/session_ritual.md:38`, `docs/STATUS.md:13`.

Die vier genannten Gründe — und ihre wahre Natur:
1. **Lokales ffmpeg-Rendering** — läuft auf der Maschine. *Portabel:* ffmpeg läuft auf jedem Linux/CI-Runner.
2. **Playwright-Browser-Recordings** — nehmen die Live-App auf `localhost:3000` auf. *Portabel:* headless Chromium läuft in CI (genau wie `crawl.yml` es schon tut); Ziel kann ein Preview-Deploy statt localhost sein.
3. **ElevenLabs-TTS + Bunny-Upload** — brauchen Keys + Egress. *Portabel:* Keys sind bereits in GitHub Secrets gespiegelt.
4. **Visuelle Qualitäts-Abnahme** — menschlicher Blick. *Bedingt mobil:* die Takes sind Videos und auf dem S23 abspielbar — die Abnahme selbst kann vom Handy erfolgen, sobald die Artefakte abrufbar sind.

**Kein Schritt ist macOS-/Desktop-App-gebunden.** Es gibt keine native Capture-App, kein GPU-App, nichts OS-gesperrtes. Die einzige echte Desktop-Sorge der Bible (§8) ist Encode-*Performance* (ohne guten H.264-Encoder >1 h) — eine Hardware-/Kosten-Frage, kein Plattform-Lock.

---

## 5. Machbarkeit mobil (erste Bewertung — KEINE Umsetzung)

Reihenfolge nach Wirkung. Aufwand/Risiko grob.

**B1 — Eingefrorene lokal-only Assets sichern.** (Aufwand: niedrig–mittel · Risiko: niedrig · zugleich der wichtigste Datenverlust-Fix, unabhängig von mobil.)
Loom-Footage, Screenflow-`.webm`-Quellen, Locked-Audio-Master, Maus-JSONs, Schablonen, `canonical_stars_ref`, `_calibration_anchors/take4`, take4-Phase-Maps, `specs/take4_master_spec.json`, `Bunny.txt` in durablen Cloud-Speicher legen (privater Bucket / Bunny-Storage / Git-LFS), damit CI sie ziehen kann. Sofort-Sub-Schritt: die paar untracked-aber-nicht-ignorten Rezept-JSONs/`.m4a` sind heute schon committbar (kein großes Volumen) — schließt die stillste Lücke.

**B2 — Secrets in CI.** (Aufwand: erledigt · Risiko: niedrig.)
ELEVENLABS/BUNNY/SUPABASE/RESEND sind seit 23.06. in GitHub Secrets gespiegelt. Für einen CI-Render-Workflow nichts Neues nötig.

**B3 — `produce_videos.mjs` als `workflow_dispatch`.** (Aufwand: mittel–hoch · Risiko: mittel.)
Analog zu `crawl.yml`/`discover.yml`: Chrome-Install + ffmpeg (Runner haben es) + B1-Assets ziehen + Next-App in CI starten oder gegen einen Preview-Deploy rendern. Offene Punkte: Encode-Zeit/Runner-Minuten (Kosten), und der Timing-Jitter (§9) braucht evtl. eine Retry-/Gate-Schleife. Inkrementell denkbar: erst T1/T3 (deterministischer), T4 zuletzt.

**B4 — Abnahme vom Handy.** (Aufwand: niedrig · Risiko: niedrig–mittel.)
Automatische QG (`qg_*.mjs`) läuft in CI; die gerenderten Takes als Preview abrufbar machen (z. B. Bunny-Preview oder Artifact-Link) -> Founder gibt vom S23 frei. Der menschliche Blick bleibt, ist aber nicht mehr laptop-gebunden.

**B5 — Dev-Server/Encode-Performance in CI.** (Aufwand: mittel · Risiko: mittel.)
Headless-Next in CI hochfahren oder gegen Preview-URL aufnehmen; H.264-Encode auf Runner kann langsamer/teurer sein als lokal. Messung nötig, bevor man es zum Default macht.

**Gesamturteil:** Stern 3 ist kein Plattform-Lock, sondern ein Portabilitäts- + Asset-Custody-Projekt. Sequenz B1 -> B3 -> B4 macht die Video-Produktion schrittweise vom S23 auslösbar — genau wie Stern 1. B1 ist sofort wertvoll (Datenverlust-Schutz), auch wenn mobil später käme.

---

## Anhang — Methodik
Read-only erhoben über drei parallele Explore-Agenten (lokale Asset-Forensik, Pipeline-As-Built, Mobile-Readiness Stern 1–8) plus direkte git/`.gitignore`-Prüfung. Es wurden keine Secret-Werte ausgegeben; bei Token-/ID-Dateien (`Bunny.txt`, `.env.local`) wurde nur der Tracking-Status, nicht der Inhalt erfasst.
