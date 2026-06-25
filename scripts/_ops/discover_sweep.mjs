#!/usr/bin/env node
/**
 * discover_sweep.mjs — Kanton-Sweep: scoutet die noch nicht erfassten Orte eines
 * Kantons der Reihe nach und sammelt <count> NEUE Betriebe in die leads-DB.
 *
 * „Bereits erfasst" = der Ort hat schon Leads in der DB → wird übersprungen
 * (kein Doppel-Crawl, keiner rutscht durch — ein nächstes Go macht dort weiter,
 * wo das letzte aufgehört hat). Reuse von scout.mjs + discover_to_leads.mjs
 * (beide unverändert) als Unterprozess.
 *
 * Default = DRY-RUN (scoutet nur, schreibt nicht). Schreiben nur mit --execute.
 *
 * Lauf:
 *   node scripts/_ops/discover_sweep.mjs --kanton Thurgau --count 20 [--execute]
 *   Env: GOOGLE_SCOUT_KEY (scout) + SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY (DB)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getArg(f) { const i = process.argv.indexOf(f); return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null; }
const kanton = (getArg("--kanton") || "").trim();
const count = Math.max(1, parseInt(getArg("--count") || "20", 10) || 20);
const EXECUTE = process.argv.includes("--execute");
const MAX_ORTE = 20; // Obergrenze Orte pro Lauf (Zeit/API beschränken)
if (!kanton) { console.error("ERROR: --kanton <Kanton> fehlt."); process.exit(1); }

const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const JSON_PATH = path.resolve(__dirname, "../../src/web/src/data/ch_gemeinden_de.json");
const byKanton = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
const orte = byKanton[kanton];
if (!orte) { console.error(`ERROR: Kanton "${kanton}" nicht in der Liste.`); process.exit(1); }

const SCOUT = path.resolve(__dirname, "scout.mjs");
const HARVEST = path.resolve(__dirname, "discover_to_leads.mjs");

(async () => {
  // Schon erfasste Orte (haben Leads in der DB) → überspringen
  const { data: rows, error } = await sb.from("leads").select("ort");
  if (error) { console.error("DB-Lesefehler:", error.message); process.exit(1); }
  const scanned = new Set((rows || []).map((r) => (r.ort || "").trim().toLowerCase()).filter(Boolean));
  const candidates = orte.filter((o) => !scanned.has(o.toLowerCase()));

  console.log(`\n── Kanton-Sweep ${kanton} (${EXECUTE ? "SCHREIBEN" : "DRY-RUN"}) — Ziel ${count} neue ──`);
  console.log(`Orte gesamt ${orte.length} · schon erfasst ${orte.length - candidates.length} · offen ${candidates.length}`);
  if (!candidates.length) { console.log(`\nAlle Orte im Kanton ${kanton} sind bereits erfasst.\n`); return; }

  let inserted = 0;
  const scoutedOrte = [];
  const env = { ...process.env };
  for (const ort of candidates) {
    if (inserted >= count) break;
    if (scoutedOrte.length >= MAX_ORTE) { console.log(`\n(Obergrenze ${MAX_ORTE} Orte/Lauf erreicht — das nächste Go macht hier weiter.)`); break; }
    const remaining = count - inserted;
    console.log(`\n>>> ${ort}  (noch ${remaining} gesucht)`);
    try {
      execFileSync("node", [SCOUT, "--gemeinde", `${ort} ${kanton}`], { stdio: "inherit", env });
    } catch (e) { console.log(`  scout-Fehler bei ${ort}: ${e.message} — weiter.`); scoutedOrte.push(ort); continue; }
    scoutedOrte.push(ort);
    if (!EXECUTE) continue; // Dry-Run: nur scouten
    let out = "";
    try {
      out = execFileSync("node", [HARVEST, "--gemeinde", ort, "--count", String(remaining), "--execute"], { encoding: "utf-8", env });
    } catch (e) { out = e.stdout ? String(e.stdout) : ""; console.log(`  harvest-Fehler bei ${ort}: ${e.message}`); }
    process.stdout.write(out);
    const m = out.match(/✓\s+(\d+)\s+neue/);
    inserted += m ? parseInt(m[1], 10) : 0;
  }

  console.log(`\n✓ Sweep ${kanton}: ${inserted} neue Betriebe aus ${scoutedOrte.length} Ort(en) [${scoutedOrte.join(", ")}]. Erscheinen in /ceo/journey.\n`);
})().catch((e) => { console.error("FEHLER:", e.message); process.exit(1); });
