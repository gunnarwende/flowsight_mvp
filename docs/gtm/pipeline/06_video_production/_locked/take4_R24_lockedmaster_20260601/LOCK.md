# Take 4 Dörfler AG — R24 LOCKED MASTER (01.06.2026)

**Status: GOLDMASTER. T4-Schablone eingefroren.** Referenz für alle Folge-Tenants
(Leins, Stark + Sanitär-Skalierung).

## Was ist neu gegenüber R23 (31.05.)

R24 = R23 + zwei wiederhergestellte/reparierte Post-Process-Layer + Pipeline-Verkettung:

1. **FB29-Toast „Bewertung erhalten" wiederhergestellt** (rechts unten, ~1:32).
   War im 21:59-Mouse-Build überschrieben. Matcht FB29 exakt (DA-Logo, 5 Sterne,
   „Gunnar Wende: Schnell & zuverlässig. Saubere Arbeit.", „über Microsoft Edge").
2. **„3 Issues" Dev-Badge gecovert** (links unten, 0:00–98.7s). Auto-gesampelte
   Sidebar-Farbe (0x02050f), y=842 (fängt Glow-Rand).
3. **Pipeline-Fix (Root-Cause):** Toast + Badge-Cover waren manuelle Nachsätze →
   der Mouse-Layer lief als letzter Build-Schritt und überschrieb beide. Jetzt
   fest in `build_take4_final.mjs` verkettet: **Mouse (7) → Toast (9) → Badge-Cover (10)**,
   gated auf `--with-mouse`. Damit erbt jeder Folge-Tenant beide Layer automatisch.

## Dateien

| Datei | Beschreibung |
|---|---|
| `R24_doerfler-ag_with-mouse.mp4` | **DELIVERY-GOLDMASTER** (16.7 MB, 176.8s). Toast + Badge + Mouse + Loom + Audio. |
| `R24_doerfler-ag_no-mouse.mp4` | No-Mouse-Base (15.7 MB, unverändert aus R23). |
| `take4_0[1-8]_*.webm` | 8 Quell-Recordings (unverändert — nur Post-Process kam dazu). |
| `take4_event_log.json` | Event-Log. |
| `mouse_R21-timed.json` | Mouse-Layer-Timing. |

## Reproduktion (für Folge-Tenant)

```bash
node scripts/_ops/build_take4_final.mjs --slug <slug> --with-mouse
# → master_takes/take4/<slug>_with_mouse.mp4 (mit Toast + Badge-Cover automatisch)
```

Variabel pro Tenant: `tenant_config.json` (name, case_id_prefix, brand_color) + DB-Cases.
Konstant: Schablone, Animationen, Toast-Layout, Badge-Cover-Region, Picker-Selector.

## Pre-Cover-Backup

`master_takes/take4/_backups/doerfler-ag_with_mouse_pre_devbadge.mp4` = raw Mouse-Build
(ohne Toast/Cover) für Re-Runs.

## Verwandt
- PIPELINE_BIBLE §60 (T4-Schablone), §64 (Zehntelsekunden-Findings + Badge/Toast-Fix)
- Memory: `patterns_devbadge_cover_drawbox.md`
- Vorgänger: `take4_R23_lockedmaster_20260531/`
