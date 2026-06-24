#!/usr/bin/env node
/**
 * discover_to_leads.mjs — „Go": gefundene Betriebe additiv in die leads-DB.
 *
 * Liest docs/sales/scout_raw.csv (vom scout.mjs frisch befüllt), nimmt die
 * besten <count> Betriebe der gewählten <gemeinde> und INSERTet nur die, deren
 * place_id noch NICHT in der DB ist. Bestehende Zeilen werden NIE angefasst
 * (Founder-/Tool-Daten sind sicher) — reine additive Discovery.
 *
 * Reuse der sync_leads_to_db-Konventionen (Tabelle leads, Service-Role-Client,
 * place_id als Schlüssel). Default = DRY-RUN; Schreiben nur mit --execute.
 *
 * Lauf:
 *   node scripts/_ops/discover_to_leads.mjs --gemeinde Sirnach --count 20 [--execute]
 *   Env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (in CI injiziert)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.resolve(__dirname, "../../docs/sales/scout_raw.csv");

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}
const gemeinde = (getArg("--gemeinde") || "").trim();
const count = Math.max(1, parseInt(getArg("--count") || "20", 10) || 20);
const EXECUTE = process.argv.includes("--execute");
if (!gemeinde) { console.error("ERROR: --gemeinde <Gemeinde> fehlt."); process.exit(1); }

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

// ── CSV-Parser (semikolon, BOM, Quoting) ─────────────────────────────────
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
const txt = (s) => { const v = String(s ?? "").trim(); return v === "" ? null : v; };

// Website-Qualität (Founder-Regel 24.06.): nur Betriebe mit EIGENER, überprüfbarer
// Website kommen in die Kontaktliste. KEINE Website + KEINE Verzeichnis-/Social-Seite
// (yellow.ch & Co. — da lässt sich nichts manuell prüfen, keine Leistungen erkennbar).
const DIRECTORY_HOSTS = [
  "yellow.ch", "local.ch", "search.ch", "telsearch.ch", "tel.search.ch",
  "gelbeseiten", "moneyhouse.ch", "monetas.ch", "zefix.ch", "firmenwissen",
  "facebook.com", "instagram.com", "linkedin.com", "twitter.com", "x.com",
  "linktr.ee", "google.com", "g.page", "goo.gl", "business.site", "wixsite.com",
  "jimdofree.com", "jimdosite.com", "wordpress.com", "blogspot.", "sites.google.com",
];
function usableWebsite(rawUrl) {
  const u = txt(rawUrl);
  if (!u) return false;
  let host;
  try { host = new URL(u.startsWith("http") ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return false; }
  if (!host || !host.includes(".")) return false;
  return !DIRECTORY_HOSTS.some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d));
}

(async () => {
  if (!fs.existsSync(RAW)) { console.error(`ERROR: ${RAW} fehlt — erst scout.mjs laufen lassen.`); process.exit(1); }
  const rows = parseCsv(fs.readFileSync(RAW, "utf-8"));
  const header = rows.shift();
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  const need = ["firma", "place_id", "ort", "score"];
  for (const n of need) if (!(n in idx)) { console.error(`ERROR: Spalte ${n} fehlt in scout_raw.csv.`); process.exit(1); }

  const G = gemeinde.toLowerCase();
  // Kandidaten der Gemeinde (ort ODER query enthält die Gemeinde), mit place_id, dedupe
  const seen = new Set();
  const candidates = [];
  for (const r of rows) {
    const placeId = txt(r[idx.place_id]);
    const ort = (r[idx.ort] || "").toLowerCase();
    const query = (idx.query != null ? r[idx.query] || "" : "").toLowerCase();
    if (!placeId || seen.has(placeId)) continue;
    if (!ort.includes(G) && !query.includes(G)) continue;
    seen.add(placeId);
    candidates.push({
      place_id: placeId,
      firma: txt(r[idx.firma]),
      website: txt(r[idx.website]),
      ort: txt(r[idx.ort]),
      adresse: txt(r[idx.adresse]),
      telefon: txt(r[idx.telefon]),
      rating: numOrNull(r[idx.google_rating]),
      reviews: intOrNull(r[idx.google_reviews]),
      tier: txt(r[idx.tier]),
      signale: txt(r[idx.reasons]),
      icp_score: intOrNull(r[idx.score]),
      score: numOrNull(r[idx.score]) ?? 0,
    });
  }
  candidates.sort((a, b) => b.score - a.score);
  const withName = candidates.filter((c) => c.firma);
  // Website-Gate: ohne eigene, prüfbare Website (oder nur yellow.ch & Co.) → raus.
  const named = withName.filter((c) => usableWebsite(c.website));
  const droppedNoWeb = withName.length - named.length;

  if (!named.length) {
    console.log(`\nKeine Betriebe MIT prüfbarer Website für „${gemeinde}" gefunden`
      + (droppedNoWeb ? ` (${droppedNoWeb} ohne/nur Verzeichnis-Website verworfen).` : ".") + "\n");
    return;
  }

  // Dedup gegen die DB ZUERST (über ALLE Kandidaten), dann die Top-N der NEUEN
  // nehmen → "Anzahl" = N neue pro Lauf (ein zweites Go liefert N weitere).
  const ids = named.map((c) => c.place_id);
  const existing = new Set();
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await sb.from("leads").select("place_id").in("place_id", ids.slice(i, i + 100));
    if (error) { console.error("DB-Lesefehler:", error.message); process.exit(1); }
    (data || []).forEach((r) => existing.add(r.place_id));
  }
  const fresh = named.filter((c) => !existing.has(c.place_id)).slice(0, count);

  console.log(`\n── Go: Discovery → leads (${EXECUTE ? "SCHREIBEN" : "DRY-RUN"}) ──`);
  console.log(`Gemeinde:   ${gemeinde}`);
  console.log(`Kandidaten (mit Website): ${named.length} · ohne/nur-Verzeichnis verworfen: ${droppedNoWeb} · schon in DB: ${existing.size} · NEU (Top ${count}): ${fresh.length}`);
  fresh.slice(0, 12).forEach((c) => console.log(`  + ${c.firma} · ${c.rating ?? "—"}★/${c.reviews ?? "—"} · ${c.tier ?? "?"}`));

  if (!EXECUTE) { console.log(`\nDRY-RUN — nichts geschrieben. Mit --execute schreiben.\n`); return; }
  if (!fresh.length) { console.log(`\nKeine neuen Betriebe (alle Kandidaten schon in der DB).\n`); return; }

  const now = new Date().toISOString();
  const payload = fresh.map((c) => {
    // Ort = die gewählte Gemeinde (eindeutig); scouts ort-Spalte ist teils die Strasse.
    const m = c.adresse ? c.adresse.match(/\b(\d{4})\b/) : null;
    return {
      place_id: c.place_id, firma: c.firma, ort: gemeinde, plz: m ? m[1] : null,
      telefon: c.telefon, website: c.website, rating: c.rating, reviews: c.reviews,
      tier: c.tier, signale: c.signale, icp_score: c.icp_score, status: "neu", updated_at: now,
    };
  });

  for (let i = 0; i < payload.length; i += 100) {
    const { error } = await sb.from("leads").insert(payload.slice(i, i + 100));
    if (error) { console.error("Insert-Fehler:", error.message); process.exit(1); }
  }
  console.log(`\n✓ ${payload.length} neue Betriebe in die Kontaktliste eingefügt (Gemeinde ${gemeinde}). Erscheinen in /ceo/journey.\n`);
})().catch((e) => { console.error("FEHLER:", e.message); process.exit(1); });
