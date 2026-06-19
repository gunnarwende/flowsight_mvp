#!/usr/bin/env node
/**
 * sync_leads_to_db.mjs — Customer-Journey Phase 1: spiegelt docs/sales/leads.csv
 * in die DB-Tabelle `leads` (Upsert per place_id).
 *
 * Übergangs-Architektur (siehe docs/gtm/customer_journey_buildplan.md §4):
 *   - JETZT: leads.csv ist noch die Arbeits-Wahrheit (Lead-Motor schreibt CSV).
 *     Dieser Sync hebt sie in die DB, damit das /ceo-Journey-Tool + CC sie lesen.
 *   - SPÄTER (Phase 2, wenn das Tool die CSV-Bearbeitung ersetzt): DB wird SSOT,
 *     Richtung dreht sich (DB → CSV-Export). Bis dahin: CSV → DB.
 *
 * Sicher + idempotent: voller Upsert per place_id. Kein Löschen — Leads, die nicht
 * mehr in der CSV stehen, bleiben in der DB (Status/Verlauf gehen nie verloren).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/sync_leads_to_db.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEADS = path.resolve(__dirname, "../../docs/sales/leads.csv");
const DRY = process.argv.includes("--dry-run");

// ── CSV-Parser (semikolon, BOM, Quoting) — identisch zu build_leads.mjs ───
function parseCsv(txt) {
  txt = txt.replace(/^﻿/, "");
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) {
      if (c === '"' && txt[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ";") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

const numOrNull = (s) => { const n = parseFloat(String(s ?? "").replace(",", ".")); return Number.isFinite(n) ? n : null; };
const intOrNull = (s) => { const n = parseInt(String(s ?? ""), 10); return Number.isFinite(n) ? n : null; };
const dateOrNull = (s) => { const v = String(s ?? "").trim(); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null; };
const txtOrNull = (s) => { const v = String(s ?? "").trim(); return v === "" ? null : v; };

// ── Build rows ────────────────────────────────────────────────────────────
if (!fs.existsSync(LEADS)) { console.error(`ERROR: ${LEADS} fehlt.`); process.exit(1); }
const rows = parseCsv(fs.readFileSync(LEADS, "utf-8"));
const header = rows.shift();
const idx = Object.fromEntries(header.map((h, i) => [h.replace(/^﻿/, ""), i]));
const get = (r, k) => r[idx[k]] ?? "";

const records = [];
let skipped = 0;
for (const r of rows) {
  const place_id = String(get(r, "place_id")).trim();
  if (!place_id) { skipped++; continue; }
  records.push({
    place_id,
    firma: get(r, "firma") || "(ohne Name)",
    ort: txtOrNull(get(r, "ort")),
    plz: txtOrNull(get(r, "plz")),
    ring: txtOrNull(get(r, "ring")),
    ma_proxy: txtOrNull(get(r, "ma_proxy")),
    tariff: txtOrNull(get(r, "tariff")),
    inhaber_am_telefon: txtOrNull(get(r, "inhaber_am_telefon")),
    entscheider: txtOrNull(get(r, "entscheider")),
    rolle: txtOrNull(get(r, "rolle")),
    mail: txtOrNull(get(r, "mail")),
    telefon: txtOrNull(get(r, "telefon")),
    website: txtOrNull(get(r, "website")),
    rating: numOrNull(get(r, "rating")),
    reviews: intOrNull(get(r, "reviews")),
    icp_score: intOrNull(get(r, "icp_score")),
    tier: txtOrNull(get(r, "tier")),
    signale: txtOrNull(get(r, "signale")),
    status: txtOrNull(get(r, "status")) || "neu",
    letzter_kontakt: dateOrNull(get(r, "letzter_kontakt")),
    naechster_schritt: txtOrNull(get(r, "naechster_schritt")),
    naechster_am: dateOrNull(get(r, "naechster_am")),
    notiz: txtOrNull(get(r, "notiz")),
    updated_at: new Date().toISOString(),
  });
}

console.log(`leads.csv: ${records.length} Leads gelesen (${skipped} ohne place_id übersprungen).`);
if (DRY) {
  console.log("(DRY-RUN — nichts geschrieben). Beispiel-Zeile:");
  console.log(JSON.stringify(records[0], null, 2));
  process.exit(0);
}

// ── Upsert ──────────────────────────────────────────────────────────────
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen (--env-file=src/web/.env.local?)"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const CHUNK = 200;
let done = 0;
for (let i = 0; i < records.length; i += CHUNK) {
  const batch = records.slice(i, i + CHUNK);
  const { error } = await sb.from("leads").upsert(batch, { onConflict: "place_id" });
  if (error) { console.error(`Upsert-Fehler (Batch ${i}):`, error.message); process.exit(1); }
  done += batch.length;
  console.log(`  upserted ${done}/${records.length}`);
}

const { count } = await sb.from("leads").select("*", { count: "exact", head: true });
console.log(`\n✅ Sync fertig. leads-Tabelle enthält jetzt ${count} Zeilen.`);
