# Stresstest-Status — 01.06. (QG-bewiesen, nicht behauptet)

## Stand (per QG `qg_video.mjs` geprüft, nicht Einzel-Frame-Spotcheck)
| Betrieb | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| **Stark** | ✅ | ✅ | ✅ | ✅ |
| **Walter** | ✅ | ❌ Offset 0:00–36 + Greeting=Dörfler + SMS-Sequenz | ✅ | ❌ Sterne/Maus |
| **Weinberger** | ✅ | ✅ (Greeting gefixt: Weinberger, QG PASS) | ✅ | ❌ Sterne/Maus |

## Was diese Runde gefixt + QG-bewiesen wurde
- **Weinberger T2 Greeting:** war Leins (preis-Swap-Slot [44–51] falsch). STT zeigte preis-Greeting @40–46s. Slot **variant-spezifisch** gemacht (notruf [44–51] / preis [40–46.5]). Re-swap + re-mux → STT bestätigt „Juhl. Weinberger AG". QG ALL PASS. ✅
- **QG-Script `qg_video.mjs`** gebaut: G_GREETING (STT via Whisper → Firmenname), G_START0 (Frame@0:00 nicht schwarz). Validiert: fängt Greeting-Bugs (weinberger FAIL→PASS, stark PASS, **walter FAIL = Dörfler** — Bug den ich übersehen hatte!).

## Noch offen (QG RED-geflaggt)
- **Walter T2:** Offset (0:00–36 verschoben) → bricht auch den Greeting-Swap (Greeting landet auf Dörfler-Stelle) + SMS-Sequenz kaputt. **Root = Offset; muss zuerst gefixt werden, dann greift Greeting-Swap.** Tiefer Build-Fix nötig.
- **Walter + Weinberger T4:** Stern/Maus-Sync (mein Rebuild hat es NICHT zuverlässig gelöst; Einzel-Frame-Check war unzureichend). QG-Stern-Gate = TODO.

## QG-Ausbau (quality_gates.md = SoT)
Implementiert: Greeting-STT, Frame@0:00. **TODO als Code-Gate:** Akku-Pixel, KPI-Timing@4:37, Phone-SMS-Sequenz, **T4-Stern/Maus über mehrere Frames**, Variante notruf/preis. Diese als `qg_video.mjs`-Gates + in build_takeN_final als letzter Schritt → kein „final" mehr ohne grünen QG.

**Lehre:** „final" gilt erst, wenn `qg_video.mjs` grün ist — nie per Einzel-Frame/Datei-Existenz.
