# Hörbare Audio-Master — Play-URLs (Founder-Abnahme)

Stand: 2026-07-02 · Quelle: die 42 Founder-Schnipsel (`aufnahme/_takes/_masters/`), je EIN
durchgehender Master (natürliche Pausen 0,55s). Playbar via Bunny Stream (am Handy antippen).
Brunner-Stimme im Call-Audio = **Platzhalter** (Founder-Klon) — finale Kundenstimme offen.

| Einheit | Dauer | Schnipsel | Play-URL (antippen) |
|---|---|---|---|
| Hero (COLD, voll) | 100 s | 15 | https://iframe.mediadelivery.net/embed/676117/e79a7214-4803-4cf8-84aa-b9f16510bbe5 |
| Hero (WARM, voll) | 95 s | 14 | https://iframe.mediadelivery.net/embed/676117/f9ea0ae6-76fa-404d-a944-41c84a175bc7 |
| Knoten ② — Überblick | 28 s | 5 | https://iframe.mediadelivery.net/embed/676117/c8236352-3dbd-4c28-9eab-f4c4b55cb839 |
| Knoten ③ — Haken | 53 s | 10 | https://iframe.mediadelivery.net/embed/676117/a60218db-79b0-4c66-ac27-fbe4339dbeae |
| Knoten ④ — Kosten | 46 s | 9 | https://iframe.mediadelivery.net/embed/676117/6baea12a-1146-4bdb-a173-873354eecd1a |
| Knoten ① — VO-Schluss | 12 s | 1 | https://iframe.mediadelivery.net/embed/676117/7da78a6f-e386-4d6f-b7bc-238be7f6bff7 |

**Aufbau Hero:** COLD = Hook (HERO-01–03) → Wende-VO (04/05) → Call-Audio → Dashboard-VO
(06/07) → Schluss (08–14). WARM = W1–W3 statt Hook, dann ab HERO-05 identisch (**kein HERO-04**,
das ist COLD-only).

**Offen:** Knoten ① = nur VO-Schluss (K1-01); die 3 Anrufe (Lisa + je eigene Kundenstimme)
sind noch nicht vertont. Brunner-Final-Stimme = Founder-Entscheid.

Neu erzeugen: `node --env-file=src/web/.env.local scripts/_ops/build_hoerbar_masters.mjs`
(GUIDs im gitignored `_generated/hoerbar_masters/hoerbar_masters.report.json`).
