#!/usr/bin/env node
/**
 * crawl_to_leads.mjs — spielt eine Crawl-Anreicherung ADDITIV in die leads-DB.
 *
 * Liest docs/customers/<slug>/crawl_extract.json und mergt es in die bestehende
 * leads-Zeile. Reuse der sync_leads_to_db-Konventionen (Tabelle leads,
 * Service-Role-Client, place_id als Schlüssel).
 *
 * REGELN (Übergabe Laptop-CC, 23.06.):
 *  - Match-Key #1: google.place_id (vom Crawl jetzt erfasst) → dieselbe Zeile,
 *    die der Scout angelegt hat. Kein place_id → über website matchen.
 *    Kein/mehrdeutiger Match → ÜBERSPRINGEN, NIEMALS blind eine neue Zeile anlegen
 *    (Ausnahme: echte, per place_id verschlüsselte neue Zeile = kein blinder Insert).
 *  - Additiv / Founder-Schutz: Enrichment überschreibt NIE die Founder-Felder
 *    (status, notiz, naechster_schritt, naechster_am, letzter_kontakt, icp_score,
 *    tier). Bei einem BEARBEITETEN Lead (WORKED: status ≠ "neu"/leer) werden nur
 *    LEERE Zielfelder gefüllt; objektive Daten (rating/reviews) immer aufgefrischt.
 *
 * Default = DRY-RUN (zeigt den Diff). Schreiben nur mit --execute.
 *
 * Lauf:
 *   node scripts/_ops/crawl_to_leads.mjs --slug <slug> [--execute]
 *   Env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (in CI injiziert)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}
const slug = getArg("--slug");
const EXECUTE = process.argv.includes("--execute");
if (!slug) { console.error("ERROR: --slug <slug> fehlt."); process.exit(1); }

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

// ── JSON laden ─────────────────────────────────────────────────────────────
const jsonPath = path.resolve(__dirname, "../../docs/customers", slug, "crawl_extract.json");
if (!fs.existsSync(jsonPath)) { console.error(`ERROR: ${jsonPath} fehlt (erst crawlen).`); process.exit(1); }
const c = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// ── Helpers ──────────────────────────────────────────────────────────────
const fieldVal = (f) => (f && f.value != null && String(f.value).trim() !== "" ? String(f.value).trim() : null);
const isEmpty = (x) => x == null || String(x).trim() === "";
const WORKED = (s) => s != null && String(s).trim() !== "" && String(s).trim() !== "neu";

function normDomain(u) {
  if (!u) return null;
  try { return new URL(u.startsWith("http") ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return null; }
}

function leistungenToText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  if (typeof val === "object") {
    const parts = [];
    for (const [k, v2] of Object.entries(val)) {
      if (v2 === true) parts.push(k);
      else if (typeof v2 === "string" && v2.trim()) parts.push(v2.trim());
      else parts.push(k); // Array/Objekt → Kategorie-Name
    }
    return [...new Set(parts)].join(", ");
  }
  return "";
}

// ── Crawl → Felder ─────────────────────────────────────────────────────────
let plz = null, ort = null;
const addr = fieldVal(c.adresse);
if (addr) {
  const m = addr.match(/(\d{4})\s+([A-Za-zÄÖÜäöüéèêÉÈ][\wäöüÄÖÜéèê.\- ]*)/);
  if (m) { plz = m[1]; ort = m[2].trim().split(/[,\n]/)[0].trim(); }
}

const sigParts = [];
if (fieldVal(c.notdienst)) sigParts.push("Notdienst");
const leist = leistungenToText(c.leistungen && c.leistungen.value);
if (leist) sigParts.push(leist);
let signale = sigParts.join(" · ");
if (signale.length > 240) signale = signale.slice(0, 237) + "…";

const website = (c._meta && c._meta.source_url) || fieldVal(c.website_url) || null;
const placeId = (c.google && c.google.place_id) || null;

// Enrichment (subjektiv/Kontakt — additiv geschützt):
const enrich = {
  firma: fieldVal(c.firma),
  entscheider: fieldVal(c.inhaber),
  rolle: fieldVal(c.inhaber) ? "Inhaber" : null,
  plz, ort,
  telefon: fieldVal(c.telefon),
  mail: fieldVal(c.email),
  website,
  ma_proxy: fieldVal(c.team_groesse),
  signale: signale || null,
};
// Objektiv (immer auffrischen, aber nie mit null überschreiben):
const rating = c.google && c.google.rating != null ? c.google.rating : null;
const reviews = c.google && c.google.review_count != null ? c.google.review_count : null;

// ── Match-Zeile finden ─────────────────────────────────────────────────────
async function findLead() {
  if (placeId) {
    const { data, error } = await sb.from("leads").select("*").eq("place_id", placeId).limit(1);
    if (error) throw new Error(error.message);
    if (data && data[0]) return { row: data[0], via: "place_id" };
    return { row: null, via: "place_id (neu)", newPlaceId: placeId };
  }
  const dom = normDomain(website);
  if (dom) {
    const { data, error } = await sb.from("leads").select("*").ilike("website", `%${dom}%`).limit(2);
    if (error) throw new Error(error.message);
    if (data && data.length === 1) return { row: data[0], via: "website" };
    if (data && data.length > 1) return { row: null, via: "website (mehrdeutig)" };
  }
  return { row: null, via: "kein Match" };
}

// ── Main ───────────────────────────────────────────────────────────────────
(async () => {
  const match = await findLead();
  console.log(`\n── Crawl → leads (${EXECUTE ? "SCHREIBEN" : "DRY-RUN"}) — slug=${slug} ──`);
  console.log(`place_id: ${placeId ?? "(keiner — Google fand nichts)"}`);
  console.log(`Match: ${match.via}${match.row ? ` → ${match.row.firma} (status=${match.row.status})` : ""}`);

  const payload = {};
  if (rating != null) payload.rating = rating;
  if (reviews != null) payload.reviews = reviews;

  let mode;
  if (match.row) {
    const worked = WORKED(match.row.status);
    mode = worked ? "additiv (WORKED → nur leere Felder)" : "update (unbearbeitet → Crawl-Werte)";
    for (const [col, val] of Object.entries(enrich)) {
      if (val == null) continue;
      if (worked && !isEmpty(match.row[col])) continue; // Bestands-/Founder-Wert schützen
      payload[col] = val;
    }
  } else if (match.newPlaceId) {
    if (!enrich.firma) { console.log("\nÜBERSPRUNGEN: kein firma im Crawl — Insert würde NOT NULL verletzen.\n"); return; }
    mode = "insert (neue place_id-Zeile, status=neu)";
    for (const [col, val] of Object.entries(enrich)) if (val != null) payload[col] = val;
    payload.place_id = match.newPlaceId;
    payload.status = "neu";
  } else {
    console.log(`\nÜBERSPRUNGEN: ${match.via} — niemals blind eine neue Zeile anlegen.\n`);
    return;
  }

  // Diff
  console.log(`Modus: ${mode}`);
  console.log("Änderungen:");
  let changes = 0;
  for (const [col, val] of Object.entries(payload)) {
    const before = match.row ? (match.row[col] ?? "∅") : "∅";
    if (String(before) !== String(val)) { console.log(`  ${col}: ${before} → ${val}`); changes++; }
  }
  if (!changes) console.log("  (keine)");

  if (!EXECUTE) { console.log(`\nDRY-RUN — nichts geschrieben. Mit --execute schreiben.\n`); return; }
  if (!changes && match.row) { console.log(`\nNichts zu schreiben.\n`); return; }

  payload.updated_at = new Date().toISOString();
  const res = match.row
    ? await sb.from("leads").update(payload).eq("id", match.row.id)
    : await sb.from("leads").insert(payload);
  if (res.error) { console.error("Schreibfehler:", res.error.message); process.exit(1); }
  console.log(`\n✓ leads ${match.row ? "aktualisiert" : "eingefügt"} — erscheint in /ceo/journey.\n`);
})().catch((e) => { console.error("FEHLER:", e.message); process.exit(1); });
