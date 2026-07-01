# Hero-Produktion — RESUME / Handoff (Session-Einstieg)

> **Wenn du eine neue Session startest: LIES DIES ZUERST.** Fängt das Wissen ein, das sonst nur
> im Chat lebte. Alles Inhaltliche steht in den verlinkten SSOT-Docs — hier stehen Zustand,
> Reihenfolge, Arbeitsweise, Ausstattung, Env-Realität.

## Mission (die nächsten 2 Tage)
**Alle Founder-abhängigen Hero-Set-Aufnahmen im Kasten, höchste Qualität** (universelle Master-Assets,
einmal für ALLE Betriebe). Danach: Montage zur fertigen Beweis-Seite (Stern 3). Nordstern des Founders:
*„Der Erfolg meines Unternehmens steht über allem"* — **hart challengen, nie rubber-stampen.**

## Die 3 Hero-SSOT-Docs (Reihenfolge zum Einlesen)
1. [`HERO_DEMO_SPEC.md`](HERO_DEMO_SPEC.md) — **das WAS**: Hero 90 s wortgenau (COLD 0–85 + WARM-Opener + Knoten ①–④), Screenflow, Swap-Inventar, alle Regie-Entscheidungen gelockt.
2. [`HERO_DREHTAG_RUNSHEET.md`](HERO_DREHTAG_RUNSHEET.md) — **Drehtag**: Setup-/Qualitäts-Checkliste, Gesichts-Blöcke in Shoot-Reihenfolge, VO-Zeilen, Take-Disziplin, Performance-Regie.
3. [`HERO_PIPELINE_BAUPLAN.md`](HERO_PIPELINE_BAUPLAN.md) — **das WIE**: Reuse-Map der bestehenden `scripts/_ops`-Primitive (Telefon-Visual, Leitzentrale-Recorder, `assemble_call`, `mix_demo_audio`, `qg_video`, `build_proof_page`) + dünner neuer `produce_hero`-Orchestrator; Seed-Werte; Grundprinzip (Audio=Master-Uhr, Gesicht-live-über-Audio, Lego-Blöcke, Master-Asset-Swap).

Lessons-Fundus: [`_archive/PIPELINE_BIBLE_historie_bis_20260603.md`](../../_archive/PIPELINE_BIBLE_historie_bis_20260603.md).

## Wo wir stehen (Stand 2026-07-01)
- Hero-**Script + Runsheet + Bauplan = fertig & gemerged.** Founder verinnerlicht den Hero.
- **Founder dreht heute/morgen** die universellen Gesichts- + VO-Blöcke (Røde/Loom/Speakflow).
- **Noch NICHT gebaut:** `produce_hero`-Orchestrator · Hero-Call-Audio (Lisa+Brunner, neue kurze Zeilen) · Seed Brunner/Frauenfeld (Supabase) · Screen-Renders (Telefon + Leitzentrale-NEU→Filter→Fall→Verlauf) · Knoten-Reveal-Frontend · Hero-QG · Beweis-Seite auf „1 Hero + Knoten".

## Nächste Aktion (wenn Founder am Laptop / Aufnahmen im Kasten)
1. **Seed** Brunner/Bad-Wärmepumpe/Frauenfeld setzen (Demo-Tenant Dörfler AG) — Supabase/Laptop bzw. Workflow.
2. **Hero-Call-Audio** (Lisa 6 Zeilen + Brunner 3) rendern (ElevenLabs) + `assemble_call`-Struktur; **Greeting = volle-Zeile-Render**, kein fester Slot.
3. **Screen-Footage** via `record_leitsystem_screen.mjs` + `record_phone_call_visual.mjs` (Playwright).
4. **Montage** (Lego-Blöcke: Hook→Call→Leitzentrale→Schluss→Knoten-Reveal) + `qg_video` → Beweis-Seite.

## Founder-Ausstattung (Set)
Røde **NT-USB+** Mikro · **Audacity** (Audio-Takes) · **Loom** (Gesicht/PiP, teils frei gesprochen) · **Speakflow** (Teleprompter unter der Linse) · **Screenflow** (Screen-Recording). Er ist Deutscher in der Schweiz (deutsches Ohr) — Lisa-Stimm-Qualität ist für ihn **abgenommen** (kennt sie aus den alten 13-Min-Videos), **kein weiterer Stimm-Check nötig**.

## Env-Realität (was läuft wo)
- **CC-Sandbox:** Code/Wiring, Doc-SSOT, evtl. Playwright-Renders (Chromium vorinstalliert). **KEINE** Secrets/Supabase/.env, **kein** ElevenLabs-Egress.
- **Laptop (Founder) / CI-Workflow:** Supabase-Seeds, ElevenLabs-TTS, finale ffmpeg-Heirat, visuelle Abnahme, Gesicht-Aufnahme.
- Key-pflichtige Ops laufen als `workflow_dispatch` in CI (gated, Founder-Ein-Tap) — nie in der Sandbox.

## Arbeitsweise (in dieser Zusammenarbeit etabliert)
- **Direkt auf `main`** (Founder-Wunsch, kein Vorschau-Umweg): bauen → Branch → PR → CI grün (lint+build) → **squash-merge** → Branch auf `origin/main` zurücksetzen (force-with-lease).
- Branch-Protection „2 Checks up-to-date"; bei 405 → `update_pull_request_branch` (frische Checks), dann mergen.
- **Nie Secrets committen/loggen; nur Presence prüfen.** revDSG/Recording-OFF/E-Mail-only/ICP-Regeln gelten (s. `CLAUDE.md`).
- Doku IMMER mitziehen (STATUS.md · ticketlist.md · betroffene Specs) — deshalb ist Clearen verlustfrei.

## Andere offene Fäden (nicht Hero — s. STATUS.md)
- **Stern 6 Cockpit:** Code komplett + live; **Founder-Verifikation** (Durchklick) offen + echte Audio/Foto-Guides.
- **Swiss-Post-Adresse (V9):** pausiert (Post-Website-Ladefehler) — Founder legt technischen Benutzer an → `SWISSPOST_USER/PASSWORD` in Vercel → CC verdrahtet `callSwissPost()`. **Reminder: Mail an Milena Burgener beantworten.**
- **Leben/Running:** live; Backlog Phase 2 (KI-Coach + Jungfrau-Trainingsplan), Phase 3 (Kraftsport + Ernährung) — Parallel-Session.
- **Cold-Mail-Audio-Hook** (Leila-Idee): mit Stern 3 designen (s. HERO_DEMO_SPEC §Cold-Mail-Audio-Hook).
