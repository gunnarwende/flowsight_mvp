# Stresstest — Zwischenergebnisse (01.06.2026)

3 Betriebe parallel von Anfang bis Ende durch die Pipeline (crawl → derive → provision → T1–T4).
Ziel: Skalierungs-Schwächen für echten 10/Tag-Betrieb finden.

## Status je Betrieb

| Betrieb | T1 Intro | T2 Anruf | T3 Wizard | T4 Bewertung | Variante |
|---|:---:|:---:|:---:|:---:|---|
| **Stark Haustechnik** | ✅ | ✅ | ✅ | ✅ | C/Notruf ✓ |
| **Walter Leuthold** | ✅ | ❌ | 🟡 teilweise | ✅ | C/Notruf ✓ |
| **Weinberger** | ✅ | ❌ | ❌ | ✅ | B/Preis ✓ |

✅ = final · 🟡 = Teil-Anchor (ohne Maus/Loom) · ❌ = blockiert

**Variant-Entscheidung (das Matchentscheidende) war bei allen 3 korrekt:** Walter Leuthold + Stark = Notruf (24/7-Evidenz), Weinberger = Preis. Die T2-Voice-Agent-Logik ist intakt.

## Warum T2/T3 bei WL + WB blockiert sind (die Funde)
Die Pipeline ist für **vorbereitete** Betriebe (wie Stark, der volle manuelle Vorarbeit hatte) robust, aber für **neue** Betriebe NICHT turnkey — eine Kette per-Tenant-Voraussetzungen:

| Take | Blocker | Status |
|---|---|---|
| T2 (WL/WB) | `take2.schedule`-Generator braucht notruf+preis-Master in EINEM Tenant — Dörfler hat nur notruf, Leins nur preis → schlägt fehl | 🔴 offen |
| T3 (WL) | per-Tenant `loom_t3.mp4` fehlt, kein greifender Shared-Fallback | 🔴 offen |
| T3 (WB) | Wizard-Recording-Timeout (8s locator.click) — Weinberger-spezifisch | 🔴 offen |

## Schon gefixt diese Session (Self-Sufficiency)
- `_overrides/<slug>/` mkdir (T2 STEP 1.5) — Beweis: **Stark-T2 lief danach durch**
- geteilter `homescreen_mai.png` → per-Tenant (Parallel-Race + Mai-Naming behoben)
- **take3-`.schedule`-Generator gebaut** (recording-deterministisch, validiert)

## Schablonen-Referenz (unangetastet, verifiziert intakt)
- Dörfler R24: `06_video_production/_locked/take4_R24_lockedmaster_20260601/`
- Leins komplett: `06_video_production/master_takes/_delivery/leins-ag/`
- Stresstest-Baseline-Configs: `_stresstest_baseline/`

## Empfehlung
Systematischer **New-Tenant-Self-Sufficiency-Audit** als eigener kontrollierter Durchgang (Backup-first, Dörfler/Leins gelockt als Referenz, jede Änderung einzeln verifiziert) — statt Schicht-für-Schicht-Whack-a-mole.
