#!/usr/bin/env node
/**
 * purge_stale_leads.mjs — entfernt Alt-Crawl-Leads aus der DB („Klarheit").
 *
 * Hintergrund: Stern 1 zeigte 425 Leads = alter Zürichsee-Bulk-Crawl (altes
 * Niveau). Die go-Crawl baut Thurgau frisch auf dem neuen Standard auf.
 *
 * MODI (--mode):
 *   stale  (Default) — löscht NUR reine, nie bearbeitete Alt-Crawls:
 *                      Status "neu"/leer UND nirgends referenziert.
 *                      Aktive Pipeline (Simulationen/Calls) BLEIBT.
 *   worked          — „Klarheit, Altlasten heraus": löscht die BEARBEITETEN
 *                      Alt-Leads (Status ≠ "neu" ODER referenziert von
 *                      proof_pages/cockpit_sessions/journey_events — auch die,
 *                      die wir schon verschickt haben + 1–2× geöffnet wurden).
 *                      Frische, unbearbeitete Discovery (status="neu",
 *                      unreferenziert) BLEIBT — die Redesign-Leads sind sicher.
 *   all             — vollständiger Reset: löscht ALLE Leads (frischer Start).
 *   region          — Falsch-Region raus: löscht Leads, deren Ort NICHT im Kanton
 *                      --kanton liegt (Gemeindeliste). Behält den Rest. Leerer Ort
 *                      = behalten (nicht eindeutig).
 *
 * Beim Löschen referenzierter Zeilen: journey_events hängen per FK CASCADE dran
 * (verschwinden mit → Tagesüberblick wird sauber); proof_pages/cockpit_sessions
 * werden per SET NULL entkoppelt (bleiben als Verlauf, ohne Lead-Bezug).
 *
 * Default = DRY-RUN (zeigt nur, was gelöscht würde). Erst --execute löscht.
 *
 * Lauf:
 *   node … purge_stale_leads.mjs                       # Vorschau (stale)
 *   node … purge_stale_leads.mjs --mode worked         # Vorschau Altlasten-raus
 *   node … purge_stale_leads.mjs --mode worked --execute
 *   node … purge_stale_leads.mjs --mode all --execute  # kompletter Reset
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getArg(flag) { const i = process.argv.indexOf(flag); return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null; }
const EXECUTE = process.argv.includes("--execute");
const MODE = (getArg("--mode") || "stale").trim().toLowerCase();
const KANTON = (getArg("--kanton") || "").trim();
if (!["stale", "worked", "all", "region"].includes(MODE)) {
  console.error(`ERROR: --mode "${MODE}" unbekannt (erlaubt: stale | worked | all | region).`);
  process.exit(1);
}
// region-Modus: Gemeinde-Set des Kantons laden — behalten, was drin liegt, der Rest raus.
let regionSet = null;
if (MODE === "region") {
  if (!KANTON) { console.error("ERROR: --mode region braucht --kanton <Kanton>."); process.exit(1); }
  const JSON_PATH = path.resolve(__dirname, "../../src/web/src/data/ch_gemeinden_de.json");
  const orte = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"))[KANTON];
  if (!orte) { console.error(`ERROR: Kanton "${KANTON}" nicht in der Gemeindeliste.`); process.exit(1); }
  regionSet = new Set(orte.map((o) => o.trim().toLowerCase()));
}
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen (--env-file=src/web/.env.local?)");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const WORKED = (s) => s != null && String(s).trim() !== "" && String(s).trim() !== "neu";

async function refIds(table) {
  const { data, error } = await sb.from(table).select("lead_id");
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []).map((r) => r.lead_id).filter(Boolean);
}

(async () => {
  const { data: leads, error } = await sb.from("leads").select("id, firma, ort, status");
  if (error) { console.error("leads:", error.message); process.exit(1); }
  const all = leads ?? [];

  const referenced = new Set([
    ...(await refIds("proof_pages")),
    ...(await refIds("cockpit_sessions")),
    ...(await refIds("journey_events")),
  ]);

  const keep = [], del = [];
  for (const l of all) {
    const active = referenced.has(l.id) || WORKED(l.status);
    let remove;
    if (MODE === "all") remove = true;                 // alles
    else if (MODE === "region") {                      // Falsch-Region raus (Ort nicht im Kanton)
      const o = (l.ort || "").trim().toLowerCase();
      remove = o !== "" && !regionSet.has(o);          // leerer Ort = behalten (nicht eindeutig)
    }
    else if (MODE === "worked") remove = active;       // Altlasten (bearbeitet/referenziert) raus
    else remove = !active;                             // stale: nur unberührter Alt-Crawl raus
    (remove ? del : keep).push(l);
  }

  console.log(`\n── Lead-Bereinigung · Modus ${MODE} (${EXECUTE ? "LÖSCHEN" : "DRY-RUN"}) ──`);
  console.log(`Gesamt:        ${all.length}`);
  console.log(`Referenziert:  ${referenced.size} (proof/cockpit/events)`);
  console.log(`BLEIBT:        ${keep.length}`);
  console.log(`LÖSCHEN:       ${del.length}`);
  console.log(`\nBeispiele BLEIBT:`);
  keep.slice(0, 8).forEach((l) => console.log(`  ✓ ${l.firma} (${l.ort ?? "?"}) · status=${l.status ?? "neu"}`));
  console.log(`\nBeispiele LÖSCHEN:`);
  del.slice(0, 12).forEach((l) => console.log(`  ✕ ${l.firma} (${l.ort ?? "?"}) · status=${l.status ?? "neu"}`));

  if (!EXECUTE) { console.log(`\nDRY-RUN — nichts gelöscht. Wenn die Liste stimmt: --execute.\n`); return; }
  if (!del.length) { console.log(`\nNichts zu löschen.\n`); return; }

  const ids = del.map((l) => l.id);
  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200);
    const { error: e } = await sb.from("leads").delete().in("id", batch);
    if (e) { console.error("Löschfehler:", e.message); process.exit(1); }
    console.log(`  gelöscht ${Math.min(i + 200, ids.length)}/${ids.length}`);
  }
  console.log(`\n✓ ${ids.length} Alt-Crawl-Leads gelöscht. Stern 1 zeigt jetzt ${keep.length}.\n`);
})();
