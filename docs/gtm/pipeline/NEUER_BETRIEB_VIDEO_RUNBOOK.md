# Runbook: Neuer Betrieb → Founder-Review-Video (kanonischer Weg)

> Lehre aus dem Burkhardt-Lauf (18.06.): Es gibt ZWEI Video-Lineages — nur einer speist die
> Beweis-Seite. Diesen Weg gehen, keinen anderen. Ziel: schnellstmöglich eine `/p/`-Beweis-Seite
> zum Founder-Gegenprüfen.

## Die EINE-Wahrheit-Regel (Lineage)
- **Kanonisch (Auslieferung): `build_take2_final` / `build_take3_final` / `build_take4_final`** →
  `_generated/previews/<slug>/take2_<variant>_FINAL_v102` + `master_takes/take3|4/<slug>_with_mouse`.
  Genau das erwartet `collect_delivery` → `build_proof_page`.
- **NICHT für Auslieferung: `run_pipeline_multi.mjs`** (älter, D95). Erzeugt QG-grüne Takes, aber als
  `screenflows/<slug>/take*_complete.mp4` — falsches Format für `collect_delivery`. War der Umweg.

## Voraussetzungen (einmalig)
- Dev-Server läuft: `npm --prefix src/web run dev` → http://localhost:3000 (Check: `curl localhost:3000` = 200).
- `src/web/.env.local` mit SUPABASE_*, RETELL_API_KEY, ANTHROPIC_API_KEY, Bunny-Keys.

## Schritt-für-Schritt (pro Betrieb)

1. **Crawl + Config:**
   `node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --url <URL> --slug <slug>`
   → `tenant_config.json` + `founder_review.md` (STOP).

2. **Config verifizieren (Founder-Review-Items):** Variante (Notruf C / Preis B), `tenant.name`
   (voller Firmenname!), `brand_color` (gegen Website, nicht Default-Blau), `owner_names`. Falsche
   Daten hier kosten später am meisten (S13: nie raten → „?").

3. **Provision (video-sicher):**
   `node --env-file=src/web/.env.local scripts/_ops/provision_from_config.mjs --slug=<slug> --skip-voice --skip-retell`
   → Tenant + 50 Seed-Cases. **Keine** Twilio-Nummer, **kein** Retell-Publish (D91 — kommen erst zur
   Telefon-Schaltung). Vorher `--dry-run` zeigt, was es anfasst.

4. **Screenflow-Seed:** `node --env-file=src/web/.env.local scripts/_ops/seed_screenflow_from_config.mjs --slug <slug>`

5. **Takes bauen (kanonisch, Dev-Server nötig):**
   ```
   APP_URL=http://localhost:3000 node --env-file=src/web/.env.local scripts/_ops/build_take2_final.mjs --slug <slug>
   APP_URL=http://localhost:3000 node --env-file=src/web/.env.local scripts/_ops/build_take3_final.mjs --slug <slug>
   APP_URL=http://localhost:3000 node --env-file=src/web/.env.local scripts/_ops/build_take4_final.mjs --slug <slug> --with-mouse
   ```
   (T4 IMMER `--with-mouse`, sonst kein Maus/canonical-stars → STARSYNC-Fail.)

6. **Auslieferung sammeln:** `node --env-file=src/web/.env.local scripts/_ops/collect_delivery.mjs --slug <slug>`
   → benennt in T1_intro/T2_anruf_<variant>/T3/T4 um (T1 = canonical, D98).

7. **Beweis-Seite:** `node --env-file=src/web/.env.local scripts/_ops/build_proof_page.mjs --slug <slug>`
   → Bunny-Upload + private `/p/<token>`-Seite. **Diese URL = Founder-Review-Artefakt.**

7b. **Handy-Hochkant-Variante (PFLICHT — sonst Mobile-Drift):**
   ```
   node --env-file=src/web/.env.local scripts/_ops/make_t2_portrait.mjs --slug <slug>
   node --env-file=src/web/.env.local scripts/_ops/proof_add_variants.mjs --slug <slug> --token <token>
   ```
   → `take2_portrait.mp4` (Handy gross + EIN runder Loom am Rahmen) + setzt `videos.t2_portrait`.
   **Ohne diesen Schritt zeigt das Handy die kleine Querformat-T2** (= der Burkhardt-Drift 18.06.: Loom-Position + Handy-Grösse stimmten auf Mobile nicht wie bei Dörfler).

8. **Founder-Gegenprüfung:** `/p/`-URL öffnen, 4 Videos prüfen. Erst auf OK an den Betrieb (`send_outreach --live`).

## Ein-Kommando-Weg (GEBAUT 18.06.)
- **`node --env-file=src/web/.env.local scripts/_ops/produce_videos.mjs --slug <slug>`** zieht Schritt 3–7b
  in EINEM Befehl durch (provision → seed → take2/3/4 → collect → Staging → Beweis-Seite → **Hochkant-Variante**)
  und gibt die `/p/`-URL aus. Dev-Server muss laufen, Config (Schritt 1–2) verifiziert sein.
  → Verhindert strukturell den 18.06.-Drift (vergessene Portrait-/Staging-Schritte). Bevorzugt diesen Weg.

## Offene Effizienz-Hebel (TODO)
- **Outreach `email.json` auto-generieren** (D100, noch offen): `send_outreach` braucht
  `docs/customers/<slug>/outreach/email.json`; für neue Betriebe existiert die noch nicht. Für reine
  Founder-Review reicht die `/p/`-URL — die Mail erst für den echten Betriebs-Versand nötig.
