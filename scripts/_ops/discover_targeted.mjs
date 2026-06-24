#!/usr/bin/env node
/**
 * discover_targeted.mjs — Output-basierter „Go": sammelt N NEUE Betriebe der
 * Zielgröße 1–3 Mitarbeiter, statt blind X zu crawlen.
 *
 * Vorgehen (kein Doppelaufwand — jede Firma genau 1× gecrawlt, place_id-Dedup):
 *   - Orte des Kantons scouten (Google Places via scout.mjs)
 *   - Kandidaten mit eigener, prüfbarer Website, NEU (place_id nicht in DB)
 *   - KLEINE FIRMEN ZUERST (wenige Google-Reviews = meist 1–3-Mann-Betrieb)
 *   - jeden Kandidaten sofort crawlen (crawl_extract → Größe/Inhaber/Mail),
 *     in die DB schreiben (crawl_to_leads, identitätstreu) und nach Größe bucketen:
 *       1–3   → zählt zum Ziel (deine Arbeitsliste)
 *       4–15  → gesammelt (für später)
 *       >15   → geparkt (>15-Tab)
 *   - Stop, sobald das Ziel erreicht ODER das Zeitbudget (CI) aufgebraucht ist.
 *
 * Reuse: scout.mjs + crawl_extract.mjs + crawl_to_leads.mjs (Unterprozesse).
 *
 * Lauf:
 *   node scripts/_ops/discover_targeted.mjs --kanton Thurgau --target 10 [--minutes 20] [--execute]
 *   Env: GOOGLE_SCOUT_KEY (+ Places für crawl) + SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY
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
const startGemeinde = (getArg("--start") || "").trim(); // optionaler Start-Ort; sonst Resume ab Frontier
const target = Math.max(1, parseInt(getArg("--target") || "10", 10) || 10);
const MINUTES = Math.max(2, parseInt(getArg("--minutes") || "20", 10) || 20);
const EXECUTE = process.argv.includes("--execute");
if (!kanton) { console.error("ERROR: --kanton <Kanton> fehlt."); process.exit(1); }

const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const JSON_PATH = path.resolve(__dirname, "../../src/web/src/data/ch_gemeinden_de.json");
const byKanton = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
const orte = byKanton[kanton];
if (!orte) { console.error(`ERROR: Kanton "${kanton}" nicht in der Liste.`); process.exit(1); }

const SCOUT = path.resolve(__dirname, "scout.mjs");
const EXTRACT = path.resolve(__dirname, "crawl_extract.mjs");
const TOLEADS = path.resolve(__dirname, "crawl_to_leads.mjs");
const RAW = path.resolve(__dirname, "../../docs/sales/scout_raw.csv");

// ── Helpers (bewusst klein gehalten; gleiche Konventionen wie discover_to_leads) ──
function parseCsv(txt) {
  txt = txt.replace(/^﻿/, "");
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"' && txt[i + 1] === '"') { field += '"'; i++; } else if (c === '"') q = false; else field += c; }
    else if (c === '"') q = true;
    else if (c === ";") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}
const txt = (s) => { const v = String(s ?? "").trim(); return v === "" ? null : v; };
const numOrNull = (s) => { const n = parseFloat(String(s ?? "").replace(",", ".")); return Number.isFinite(n) ? n : null; };
const intOrNull = (s) => { const n = parseInt(String(s ?? ""), 10); return Number.isFinite(n) ? n : null; };

const DIRECTORY_HOSTS = [
  "yellow.ch", "local.ch", "search.ch", "telsearch.ch", "tel.search.ch", "gelbeseiten", "moneyhouse.ch",
  "monetas.ch", "zefix.ch", "firmenwissen", "facebook.com", "instagram.com", "linkedin.com", "twitter.com",
  "x.com", "linktr.ee", "google.com", "g.page", "goo.gl", "business.site", "wixsite.com", "jimdofree.com",
  "jimdosite.com", "wordpress.com", "blogspot.", "sites.google.com",
];
function usableWebsite(rawUrl) {
  const u = txt(rawUrl); if (!u) return false;
  let host;
  try { host = new URL(u.startsWith("http") ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return false; }
  if (!host || !host.includes(".")) return false;
  return !DIRECTORY_HOSTS.some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d));
}
function slugFromUrl(u) {
  try {
    const h = new URL(u.startsWith("http") ? u : `https://${u}`).hostname.replace(/^www\./, "");
    return h.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "betrieb";
  } catch { return "betrieb"; }
}
function sizeTier(v) {
  const m = String(v ?? "").match(/\d+/); if (!m) return "offen";
  const n = parseInt(m[0], 10);
  return n <= 3 ? "solo" : n <= 15 ? "premium" : "dq";
}

(async () => {
  // Bereits erfasste place_ids (nie doppelt crawlen) + erfasste Orte (für Resume)
  const existing = new Set();
  const coveredOrte = new Set();
  {
    const { data, error } = await sb.from("leads").select("place_id, ort");
    if (error) { console.error("DB-Lesefehler:", error.message); process.exit(1); }
    (data || []).forEach((r) => { if (r.place_id) existing.add(r.place_id); if (r.ort) coveredOrte.add(String(r.ort).trim().toLowerCase()); });
  }

  // Resume nahtlos: zusammenhängendes erfasstes Präfix (A…) überspringen, am
  // Frontier weitermachen. Der Grenz-Ort wird nochmal gescoutet (falls letzter
  // Lauf mittendrin stoppte). Optionaler --start springt gezielt an einen Ort.
  let prefixEnd = 0;
  while (prefixEnd < orte.length && coveredOrte.has(orte[prefixEnd].toLowerCase())) prefixEnd++;
  let startIdx = Math.max(0, prefixEnd - 1);
  if (startGemeinde) {
    const gi = orte.findIndex((o) => o.toLowerCase() === startGemeinde.toLowerCase());
    if (gi >= 0) startIdx = gi;
  }

  const startedAt = Date.now();
  const deadline = startedAt + MINUTES * 60 * 1000;
  let smallFound = 0, crawled = 0, p415 = 0, p15 = 0, failed = 0;
  const scoutedOrte = [];
  const env = { ...process.env };
  const timeLeft = () => Date.now() < deadline;

  console.log(`\n── Targeted Go ${kanton} (${EXECUTE ? "SCHREIBEN" : "DRY-RUN"}) — Ziel ${target} neue 1–3-Betriebe, Budget ${MINUTES} Min ──`);
  console.log(`   Start ab "${orte[startIdx]}" (Index ${startIdx}/${orte.length}, erfasstes Präfix bis ${prefixEnd})\n`);

  for (let i = startIdx; i < orte.length; i++) {
    const ort = orte[i];
    if (!timeLeft() || smallFound >= target) break;
    // Voll erfasste Orte überspringen (außer dem Grenz-Ort, den wir fertig machen).
    if (coveredOrte.has(ort.toLowerCase()) && i !== prefixEnd - 1) continue;
    try { execFileSync("node", [SCOUT, "--gemeinde", `${ort} ${kanton}`], { stdio: "inherit", env }); }
    catch (e) { console.log(`  scout-Fehler bei ${ort}: ${e.message} — weiter.`); continue; }
    scoutedOrte.push(ort);
    if (!EXECUTE) continue;
    if (!fs.existsSync(RAW)) continue;

    // Kandidaten der Gemeinde: eigene Website, NEU, dedupe — KLEINE FIRMEN ZUERST (wenige Reviews)
    const rows = parseCsv(fs.readFileSync(RAW, "utf-8"));
    const header = rows.shift(); if (!header) continue;
    const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
    const G = ort.toLowerCase();
    const seen = new Set();
    const cands = [];
    for (const r of rows) {
      const placeId = txt(r[idx.place_id]);
      const o = (r[idx.ort] || "").toLowerCase();
      const query = (idx.query != null ? r[idx.query] || "" : "").toLowerCase();
      const website = txt(r[idx.website]);
      if (!placeId || seen.has(placeId) || existing.has(placeId)) continue;
      if (!o.includes(G) && !query.includes(G)) continue;
      if (!txt(r[idx.firma]) || !usableWebsite(website)) continue;
      seen.add(placeId);
      cands.push({
        place_id: placeId, firma: txt(r[idx.firma]), website, ort: txt(r[idx.ort]), adresse: txt(r[idx.adresse]),
        telefon: txt(r[idx.telefon]), rating: numOrNull(r[idx.google_rating]), reviews: intOrNull(r[idx.google_reviews]),
        tier: txt(r[idx.tier]), signale: txt(r[idx.reasons]), icp_score: intOrNull(r[idx.score]),
      });
    }
    // wenige Reviews zuerst (eher 1–3); null Reviews ganz vorne
    cands.sort((a, b) => (a.reviews ?? 0) - (b.reviews ?? 0));

    for (const c of cands) {
      if (!timeLeft() || smallFound >= target) break;
      existing.add(c.place_id);
      const m = c.adresse ? c.adresse.match(/\b(\d{4})\b/) : null;
      const now = new Date().toISOString();
      const base = {
        place_id: c.place_id, firma: c.firma, ort, plz: m ? m[1] : null, telefon: c.telefon, website: c.website,
        rating: c.rating, reviews: c.reviews, tier: c.tier, signale: c.signale, icp_score: c.icp_score,
        status: "neu", updated_at: now,
      };
      const ins = await sb.from("leads").insert(base);
      if (ins.error) { console.log(`  insert übersprungen (${c.firma}): ${ins.error.message}`); continue; }
      crawled++;

      const wurl = c.website.startsWith("http") ? c.website : `https://${c.website}`;
      const slug = slugFromUrl(wurl);
      console.log(`\n>>> [${ort}] ${c.firma}  (${wurl})  · ${c.reviews ?? 0} Reviews`);
      let size = null;
      try {
        execFileSync("node", [EXTRACT, "--url", wurl, "--slug", slug], { stdio: "inherit", env });
        execFileSync("node", [TOLEADS, "--slug", slug, "--place-id", c.place_id, "--execute"], { stdio: "inherit", env });
        const jsonPath = path.resolve(__dirname, "../../docs/customers", slug, "crawl_extract.json");
        if (fs.existsSync(jsonPath)) {
          const j = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
          size = j.team_groesse && j.team_groesse.value != null ? j.team_groesse.value : null;
        }
      } catch (e) { failed++; console.log(`  Crawl-Fehler bei ${c.firma}: ${e.message} — weiter.`); }

      const tier = sizeTier(size);
      if (tier === "solo") { smallFound++; console.log(`  → 1–3 ✓ (Ziel ${smallFound}/${target})`); }
      else if (tier === "premium") { p415++; console.log(`  → 4–15 (gesammelt)`); }
      else if (tier === "dq") { p15++; console.log(`  → >15 (geparkt)`); }
      else { console.log(`  → Größe offen`); }
    }
  }

  const mins = Math.round((Date.now() - startedAt) / 60000);
  console.log(`\n✓ Targeted Go ${kanton}: ${smallFound} neue 1–3-Betriebe (Ziel ${target}) in ~${mins} Min.`);
  console.log(`   Gecrawlt ${crawled} · 4–15 gesammelt ${p415} · >15 geparkt ${p15} · Fehler ${failed} · Orte ${scoutedOrte.length} [${scoutedOrte.join(", ")}]`);
  console.log(`   ${smallFound >= target ? "Ziel erreicht." : "Budget/Orte aufgebraucht — nächstes Go macht weiter."} Erscheint in /ceo/journey.\n`);
})().catch((e) => { console.error("FEHLER:", e.message); process.exit(1); });
