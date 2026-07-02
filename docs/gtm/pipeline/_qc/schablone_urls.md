# Hero Audio-SCHABLONE (Referenz-Temp-Track) — Play-URLs

Stand: 2026-07-02 · Regie: `../HERO_AUDIO_SCHABLONE_REGIE.md` · Skript: `scripts/_ops/build_hero_schablone.mjs`
Referenz zum Anhören/Iterieren — **nicht** der finale Master (Founder performt später dagegen).
Playbar via Bunny Stream (am Handy antippen). Brunner-Stimme im Call = **Platzhalter** (Founder-Klon).

| Variante | Dauer | Loudness/Clip | Play-URL (antippen) |
|---|---|---|---|
| Hero-Schablone COLD | 108 s | −16 LUFS / TP −1 · PASS | https://iframe.mediadelivery.net/embed/676117/c7867b64-be69-472d-997c-e88c92c1a343 |
| Hero-Schablone WARM | 102 s | −16 LUFS / TP −1 · PASS | https://iframe.mediadelivery.net/embed/676117/bdc30eb5-3b1e-4855-b777-268026978fcd |

**Umsetzung der Regie:**
- Pausen dynamisch aus der Regie-Tabelle (davor/danach je Segment als Konstanten im Skript).
  Gap ZWISCHEN zwei Stücken = `max(danach_prev, davor_cur)` → ehrt die stärkere Absicht (⭐ heilig bleibt).
- Klingel-Beat = `ring_tone_swiss.wav` ×2 mit 0,9 s Lücke (~3,1 s, 2 Töne) → dann CALL → 1,0 s „Anruf beendet" → HERO-06.
- Schluss = eine Bewegung; 1,5 s vor HERO-13 (heilig) + 2,0 s Stille am Ende (verifiziert erhalten).
- Loudness über den GANZEN Track (−16 LUFS / TP −1 dBTP), nicht pro Schnipsel.
- WARM = W1→W2→W3 statt Hook, kein HERO-04, ab HERO-05 identisch.

**Quelle:** die bereits kanten-sauberen Phase-1-Master (`aufnahme/_takes/_masters/`) — Schluss-Laut geschützt.
Tail-Bug in `cleanFounderSegment` (blindes End-Abschneiden) separat gefixt.

Neu erzeugen: `node --env-file=src/web/.env.local scripts/_ops/build_hero_schablone.mjs`
(Pausen-Werte oben im Skript justierbar; GUIDs im gitignored `_generated/hero_schablone/hero_schablone.report.json`).
