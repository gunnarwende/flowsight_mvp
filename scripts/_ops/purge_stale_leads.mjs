#!/usr/bin/env node
/**
 * purge_stale_leads.mjs — entfernt die Alt-Crawl-Leads aus der DB.
 *
 * Hintergrund: Stern 1 zeigte 425 Leads = alter Zürichsee-Bulk-Crawl (altes
 * Niveau). Die go-Crawl baut Thurgau frisch auf dem neuen Standard auf.
 *
 * SICHERHEITS-REGEL — was BLEIBT (wird NIE gelöscht):
 *   - Lead ist referenziert von proof_pages / cockpit_sessions / journey_events
 *     (= aktive Pipeline: Simulationen, Aufbau, geloggte Calls), ODER
 *   - Lead-Status ist gepflegt (≠ "neu"/leer) — du hast ihn angefasst.
 * GELÖSCHT wird nur: Status "neu"/leer UND nirgends referenziert
 *   = reiner, nie bearbeiteter Alt-Crawl.
 *
 * Default = DRY-RUN (zeigt nur, was gelöscht würde). Erst --execute löscht.
 *
 * Lauf:
 *   node --env-file=src/web/.env.local scripts/_ops/purge_stale_leads.mjs            # Vorschau
 *   node --env-file=src/web/.env.local scripts/_ops/purge_stale_leads.mjs --execute  # löschen
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const EXECUTE = process.argv.includes("--execute");
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
    if (referenced.has(l.id) || WORKED(l.status)) keep.push(l);
    else del.push(l);
  }

  console.log(`\n── Lead-Bereinigung (${EXECUTE ? "LÖSCHEN" : "DRY-RUN"}) ──`);
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
