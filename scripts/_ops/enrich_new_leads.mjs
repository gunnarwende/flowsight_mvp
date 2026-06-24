#!/usr/bin/env node
/**
 * enrich_new_leads.mjs — reichert noch unangereicherte Leads an: crawlt deren
 * Website (crawl_extract → Inhaber/Mail/Größe/Leistungen) und schreibt das in
 * dieselbe Zeile (crawl_to_leads --place-id = nur Update, nie Duplikat).
 *
 * Wählt Leads mit `website` UND ohne Inhaber (`entscheider` leer), bestes ICP
 * zuerst, gedeckelt (--limit). Pro Lead try/catch — eine kaputte Website stoppt
 * den Lauf nicht. Reuse von crawl_extract.mjs + crawl_to_leads.mjs (unverändert).
 *
 * Lauf: node scripts/_ops/enrich_new_leads.mjs [--limit 12]
 * Env: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY (+ GOOGLE_SCOUT_KEY für Bewertung)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getArg(f) { const i = process.argv.indexOf(f); return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null; }
const LIMIT = Math.max(1, parseInt(getArg("--limit") || "12", 10) || 12);

const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const EXTRACT = path.resolve(__dirname, "crawl_extract.mjs");
const TOLEADS = path.resolve(__dirname, "crawl_to_leads.mjs");

function slugFromUrl(u) {
  try {
    const h = new URL(u.startsWith("http") ? u : `https://${u}`).hostname.replace(/^www\./, "");
    return h.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "betrieb";
  } catch { return "betrieb"; }
}

(async () => {
  // Kandidaten: Website vorhanden, Inhaber noch leer → bestes ICP zuerst
  const { data: leads, error } = await sb
    .from("leads")
    .select("id, place_id, firma, website, entscheider, icp_score")
    .not("website", "is", null)
    .is("entscheider", null)
    .order("icp_score", { ascending: false })
    .limit(LIMIT);
  if (error) { console.error("DB-Lesefehler:", error.message); process.exit(1); }
  const todo = (leads || []).filter((l) => l.website && l.place_id);

  console.log(`\n── Anreicherung: ${todo.length} Lead(s) (Limit ${LIMIT}) ──`);
  if (!todo.length) { console.log("Nichts anzureichern.\n"); return; }

  const env = { ...process.env };
  let ok = 0, fail = 0;
  for (const l of todo) {
    const wurl = l.website.startsWith("http") ? l.website : `https://${l.website}`;
    const slug = slugFromUrl(wurl);
    console.log(`\n>>> ${l.firma}  (${wurl})  → slug ${slug}`);
    try {
      execFileSync("node", [EXTRACT, "--url", wurl, "--slug", slug], { stdio: "inherit", env });
      execFileSync("node", [TOLEADS, "--slug", slug, "--place-id", l.place_id, "--execute"], { stdio: "inherit", env });
      ok++;
    } catch (e) { fail++; console.log(`  Fehler bei ${l.firma}: ${e.message} — weiter.`); }
  }
  console.log(`\n✓ Anreicherung fertig: ${ok} ok, ${fail} mit Fehler.\n`);
})().catch((e) => { console.error("FEHLER:", e.message); process.exit(1); });
