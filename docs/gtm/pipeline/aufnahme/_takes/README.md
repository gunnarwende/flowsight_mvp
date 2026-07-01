# _takes — Founder-Audio Phase 1 (Ingest-Ergebnis)

Ergebnis des Ingest der Founder-Aufnahmen aus `docs/gtm/pipeline/Aufnahmen/`
(Rohaudio, untracked/lokal). **Textbasiert im git**, damit die Cloud-Session
mitarbeiten kann. Audio-Master liegen auf Bunny Storage (+ lokal für Phase 2).

## Dateien
- `manifest.json` — je Schnipsel: ID, Quelldatei(en), Start/Ende, Dauer, LUFS/Peak,
  **transkript (= ship-truth, tatsächlich gesprochen)**, `skript_soll` (gelockter
  Wortlaut), Match/Similarity, Status, `hosting_url` (Bunny), Master-Kennwerte.
- `REPORT.md` — Übersichtstabelle + Liste der Wortlaut-Abweichungen.
- `transcripts/<ID>.txt` — ship-truth vs. skript-soll je Schnipsel.
- `transcripts/_raw_per_file/*.txt` — Roh-Transkript je Quelldatei.
- `_masters/*.wav` — lokale Master (gitignored, für Phase-2-Montage auf dem Laptop).

## Governance
- **ship-truth = `transkript`** (was der Founder wirklich sagt). Die gelockten
  Skript-Wortlaute (`skript_soll`, Quelle `../HERO_DEMO_SPEC.md`) bleiben stehen.
- 42/42 Schnipsel ok · kein Re-Take (Founder-Freigabe 2026-07-01) · kein Clipping,
  nichts fehlt. 9 leichte Wortlaut-Abweichungen dokumentiert (kein technischer Defekt).

## Mapping-Besonderheiten (nicht 1:1 Datei→ID)
- Mehrere Schnipsel pro Datei (Satzgrenze, per Wort-Timestamps geschnitten):
  `Hero/cold/1`=HERO-01/02/03 · `Hero/cold/8`=HERO-10/11/12 · `K3/4`=K3-04/05 ·
  `K4/1`=K4-01/02 · `K4/3`=K4-04/05/06 · `K4/4`=K4-07/08/09.
- Ein Schnipsel über zwei Dateien: **HERO-13 = `Hero/cold/9` + `Hero/cold/10`** (gemergt).

## Master-Spec
- Verlustfrei aus den Originalen: Kanten getrimmt, 2-Pass loudnorm **−16 LUFS /
  True-Peak −1 dBTP**, 48 kHz Mono, `pcm_s24le`. Originale unangetastet.

## Master abrufen (Bunny Storage)
Basis: `hosting_url` je Schnipsel im Manifest. Abruf per GET mit Header
`AccessKey: <BUNNY_STORAGE_PASSWORD>` (Secret; Vercel/GitHub-Env). Kein Public-CDN.
Zone-Pfad: `flowsight-stern3-backup/hero-audio/masters/<ID>.wav`.

## Phase 2 (nicht hier)
Montage/Lisa-TTS/Screen-Renders — Laptop-gebunden, siehe `../HERO_PIPELINE_BAUPLAN.md`.
