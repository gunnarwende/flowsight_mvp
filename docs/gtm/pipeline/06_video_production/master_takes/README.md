# Master Takes — Pipeline-Final-Sammlung pro Tenant

> **Stand: 2026-04-28 PM.** Vorherige README-Version (Audacity-only, segments/-Struktur, pip/-master) ist
> obsolet. Aktuelle Architektur ist via PIPELINE_BIBLE §43 (Take 3 Master-Source-Brand-Overlay)
> + §46 (Take 1 Drei-Spuren-Pattern) etabliert.

## Was hier liegt

```
master_takes/
├── README.md            ← du bist hier
├── scripting_flow.txt   ← Founder-Talk-Scripts pro Take (Referenz, vor Re-Use verifizieren)
├── take1/               ← Take 1 Finals: ein File pro Tenant
│   ├── doerfler-ag.mp4       ← abgenommen 28.04. PM
│   ├── leins-ag.mp4          ← (kommt nach Founder-Approval)
│   ├── stark-haustechnik.mp4 ← (kommt nach Founder-Approval)
│   └── waelti-sohn-ag.mp4    ← (kommt nach Founder-Approval)
├── take2/               ← Take 2 Finals (mit notruf|preis variant suffix)
│   ├── CALL_SCRIPT.md
│   ├── doerfler-ag_notruf.mp4    ← productive variant für Dörfler
│   ├── leins-ag_preis.mp4        ← productive variant für Leins
│   ├── stark-haustechnik_notruf.mp4
│   └── waelti-sohn-ag_preis.mp4
├── take3/               ← Take 3 Finals
│   └── <slug>.mp4
└── take4/               ← Take 4 Finals
    └── <slug>.mp4
```

**Konvention:** Jede Datei hier ist ein **Founder-abgenommener** Final-Cut, bereit
für die E-Mail-Pipeline. Anchor-Builds (Review-Stage, noch nicht abgenommen)
liegen NICHT hier sondern in `_generated/previews/<slug>/takeN_anchor.mp4`.

## Workflow — wie kommt ein File hierher?

1. Build-Phase produziert Anchor → `_generated/previews/<slug>/takeN_anchor.mp4`
2. Founder reviewt diesen Anchor + sagt OK
3. `node scripts/_ops/mark_take_approved.mjs --slug <slug> --take <N>` schreibt
   **simultan** zwei Destinations:
   - `_generated/takes/<slug>/takeN_complete.mp4` (interne Email-Pipeline-Quelle)
   - `master_takes/take<N>/<slug>[_variant].mp4` (diese browsbare Sammlung)
4. Ab dann ist der Take final. Bei späteren Re-Builds (z.B. nach Master-Source-Update)
   wird re-approved → File hier wird überschrieben.

**Idempotent:** Re-Run von `mark_take_approved.mjs` ohne Änderung am Anchor ist no-op.

## Take-spezifische Konventionen

### Take 1 — generic Master, drei Spuren (siehe PIPELINE_BIBLE §46)
- Audio + Face sind **generisch** (1× aufgenommen, für alle Tenants identisch).
- Brand-Panel rendert sich tenant-spezifisch via HTML.
- Master-Quellen liegen in `mini_takes/Take1/Master.wav` + `mini_takes/Take1/take1_master.mp4`.
- Per-Tenant-Build: `compose_take1_hero.mjs --slug <slug>` (defaults greifen).

### Take 2 — Phone-Call-Replay, Variants
- Variante = `notruf` wenn Tenant `voice_agent.emergency_policy` nicht-leer hat,
  sonst `preis`.
- Lisa-TTS + Founder-Voiceover Segmente assemblet via `assemble_take2.mjs`.
- Filename hier: `<slug>_<variant>.mp4` damit Variant aus Filename ablesbar.

### Take 3 — Wizard-Flow (PIPELINE_BIBLE §43)
- Master-Source-Brand-Overlay: Master-Wizard-Recording (Dörfler 40.2s) für ALLE Tenants,
  Brand-Overlay (Header-Logo + Footer-Text) per Tenant gestempelt, dann gesplict mit
  tenant-spezifischer Leitsystem-Aufnahme.
- 5-Schritt-Pipeline-Skripte pro Folge-Tenant (~5 min):
  ```
  build_wizard_brand_overlay → splice_take3_master_branded → apply_loom_take3
    → auto_calibrate_phase_library_v2 → build_from_phase_schedule
  ```

### Take 4 — Lifecycle (Bewertung, Termin-Versand)
- §28 Quality-Gates-Framework greift hier voll.
- Sharpness-Gate (§40) sichert Phase-Library-Schärfe.

## Ungeklärt / TODO

- **§47 Maus-Integration** für T3 + T4 — realistische Maus-Antizipation
  (Hover-vor-Klick), kein animiertes Gewackel. **Vor Founder-Loom-Aufnahme nötig.**
- **scripting_flow.txt verifizieren** — wahrscheinlich noch valide für Take 1+2,
  aber Take 3+4 sind seither weiterentwickelt (siehe §31, §32, §43, §46).

## Anker

- `docs/gtm/pipeline/PIPELINE_BIBLE.md` — kanonische Pipeline-Doku
- `docs/gtm/pipeline/PIPELINE_BIBLE.md` §43 — Take 3 Master-Source-Brand-Overlay
- `docs/gtm/pipeline/PIPELINE_BIBLE.md` §46 — Take 1 Drei-Spuren-Pattern
- `scripts/_ops/compose_take1_hero.mjs` — Take 1 builder
- `scripts/_ops/mark_take_approved.mjs` — Anchor → Complete + Master-Takes-Sync
- `_generated/previews/<slug>/takeN_anchor.mp4` — Review-Stage-Builds
- `_generated/takes/<slug>/takeN_complete.mp4` — Approved Finals (Email-Pipeline-Quelle)
