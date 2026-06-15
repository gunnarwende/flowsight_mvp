#!/usr/bin/env node
/**
 * build_leads.mjs — Lead-Motor Schicht 2: macht aus den Scout-Rohdaten die
 * gepflegte SSOT-Lead-Liste (`docs/sales/leads.csv` + `leads.md`).
 *
 * Pipeline:  scout.mjs (Discovery + ICP-Score) → scout_raw.csv
 *            → build_leads.mjs (Ring + Tarif + Entscheider, Merge-by-place_id)
 *            → leads.csv (SSOT) → todays_list.mjs (Tagesblätter)
 *
 * Hoheit (NICHT verhandelbar): Maschine besitzt die DATEN-Spalten, Founder die
 * STATUS-Spalten. Re-Run merged per place_id und fasst Founder-Spalten NIE an.
 *
 * ICP/Region/Tarif: docs/gtm/sales/SALES_BIBLE.md §3–§5.
 *   Leitsignal = "Inhaber-am-Telefon?". Größe = Preis-Schalter (Solo 900 / Premium 2000).
 *   Größe kommt v1 aus dem Override (verifizierte Profile) bzw. grobem Review-Proxy;
 *   die robuste Quelle (Crawl/Vision) ist der nächste Bau-Schritt (P12, §12).
 *
 * Usage:
 *   node scripts/_ops/build_leads.mjs              # merge scout_raw → leads.csv + leads.md
 *   node scripts/_ops/build_leads.mjs --dry-run    # nur anzeigen
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.resolve(__dirname, "../../docs/sales/scout_raw.csv");
const LEADS = path.resolve(__dirname, "../../docs/sales/leads.csv");
const LEADS_MD = path.resolve(__dirname, "../../docs/sales/leads.md");
const DRY = process.argv.includes("--dry-run");

// ── Region → Ring (PLZ-basiert) ──────────────────────────────────────
const RING0 = { 8942: "Oberrieden", 8810: "Horgen", 8800: "Thalwil", 8803: "Rüschlikon" };
const RING1 = {
  8134: "Adliswil", 8136: "Gattikon", 8135: "Langnau a.A.", 8820: "Wädenswil",
  8804: "Au", 8805: "Richterswil", 8802: "Kilchberg", 8833: "Samstagern", 8806: "Bäch",
};
function ringFor(plz) {
  if (RING0[plz]) return { ring: "0", ort: RING0[plz] };
  if (RING1[plz]) return { ring: "1", ort: RING1[plz] };
  return { ring: "2", ort: null };
}

// ── Verifizierte Overrides (aus stresstest_icp_profile.md) ───────────
// key = normalisierter Firmenname. ma = MA-Schätzung, dm = Entscheider, role, mail, phone-on-owner.
const OVERRIDES = {
  "walter leuthold sanitare anlagen": { ma: 1, dm: "Walter Leuthold", role: "Inhaber", inhaberTel: "ja" },
  "mpm haustechnik": { ma: 2, dm: null, role: "Inhaber", inhaberTel: "ja" },
  "dorfler ag": { ma: 5, dm: "Ramon Dörfler", role: "GL Sanitär", inhaberTel: "ja" },
  "doerfler ag": { ma: 5, dm: "Ramon Dörfler", role: "GL Sanitär", inhaberTel: "ja" },
  "benzenhofer heizungen ag": { ma: 3, dm: "Christian Benzenhofer", role: "Inhaber", inhaberTel: "ja" },
  "beeler haustechnik": { ma: 4, dm: "Patrik Beeler", role: "Inhaber", inhaberTel: "ja", flag: "SSL kaputt → Sonderfall" },
  "orlandini sanitar heizung": { ma: 8, dm: "Anastasia Orlandini", role: "Büro/GL", inhaberTel: "nein", flag: "Büro besetzt → softer Fit; 3.8★" },
  "schaub haustechnik": { ma: 10, dm: "Bünyamin Kökden", role: "GL/PL", inhaberTel: "teils" },
  "leins ag": { ma: 11, dm: "Michael Leins", role: "GL Sanitär & Heizung", inhaberTel: "teils" },
  "stark haustechnik": { ma: 7, dm: null, role: "Inhaber", inhaberTel: "ja" },
  "jul. weinberger ag": { ma: 20, dm: "Christian Weinberger", role: "GL", inhaberTel: "nein", flag: "15-25 MA → DQ (zu groß)" },
  "weinberger ag": { ma: 20, dm: "Christian Weinberger", role: "GL", inhaberTel: "nein", flag: "15-25 MA → DQ (zu groß)" },
  "walti & sohn ag": { ma: 15, dm: null, role: "GL", inhaberTel: "nein", flag: "10-20 MA → Premium-Obergrenze" },
  "geiger ag": { ma: 15, dm: null, role: "GL", inhaberTel: "nein", flag: "10-20 MA" },
  "widmer sanitare anlagen": { ma: null, dm: null, role: "Inhaber", inhaberTel: "ja" },
};

function normName(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\b(gmbh|ag|sa|sàrl|sarl)\b/g, "").replace(/[^a-z0-9& ]/g, "").replace(/\s+/g, " ").trim();
}
// Override-Keys durch dieselbe Normalisierung jagen, damit "Dörfler AG"→"dorfler" matcht.
const OVERRIDES_N = {};
for (const [k, v] of Object.entries(OVERRIDES)) OVERRIDES_N[normName(k)] = v;

// Nicht-Kern-Gewerk (Bau/Planung/Küchen-Ausstellung) markieren, nicht still droppen.
const NONCORE = /\b(bau|renovation|energieberatung|planung|kuchen|küchen|ausstellung)\b/i;
const CORE = /sanit|heiz|haustechnik|installat|spengler/i;

// ── Tarif aus MA-Größe (§4) ──────────────────────────────────────────
function tariffFor(ma) {
  if (ma == null) return { tariff: "TBD (Crawl)", maProxy: "?" };
  if (ma <= 3) return { tariff: "Solo (900)", maProxy: String(ma) };
  if (ma <= 12) return { tariff: "Premium (2000)", maProxy: String(ma) };
  return { tariff: "DQ (zu groß)", maProxy: String(ma) };
}
// grober Fallback ohne Override: Review-Anzahl als schwacher Proxy (markiert)
function maProxyFromReviews(reviews) {
  const r = Number(reviews) || 0;
  if (r > 0 && r < 15) return { ma: null, hint: "klein?" };
  return { ma: null, hint: "?" };
}

// ── CSV-Parser (semikolon, BOM, Quoting für reasons-Feld) ────────────
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
function csvCell(s) {
  s = String(s ?? "");
  return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

const LEAD_COLS = [
  "place_id", "firma", "ort", "plz", "ring", "ma_proxy", "tariff", "inhaber_am_telefon",
  "entscheider", "rolle", "mail", "telefon", "website", "rating", "reviews", "icp_score", "tier",
  "signale", "status", "letzter_kontakt", "naechster_schritt", "naechster_am", "notiz",
];
const HUMAN_COLS = ["status", "letzter_kontakt", "naechster_schritt", "naechster_am", "notiz"];

function loadExisting() {
  if (!fs.existsSync(LEADS)) return new Map();
  const rows = parseCsv(fs.readFileSync(LEADS, "utf-8"));
  const header = rows.shift();
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const map = new Map();
  for (const r of rows) {
    const o = {};
    for (const c of LEAD_COLS) o[c] = r[idx[c]] ?? "";
    map.set(o.place_id, o);
  }
  return map;
}

// ── Anreicherungs-Cache (enrich_leads.mjs / P12) ─────────────────────
const ENRICHED_PATH = path.resolve(__dirname, "../../docs/sales/leads_enriched.json");
const ENRICHED = fs.existsSync(ENRICHED_PATH) ? JSON.parse(fs.readFileSync(ENRICHED_PATH, "utf-8")) : {};

// ── Build ────────────────────────────────────────────────────────────
const rawRows = parseCsv(fs.readFileSync(RAW, "utf-8"));
const rh = rawRows.shift();
const ri = Object.fromEntries(rh.map((h, i) => [h, i]));
const existing = loadExisting();

let added = 0, updated = 0, dq = 0;
const out = new Map(existing); // start from existing, overlay machine fields

for (const r of rawRows) {
  const placeId = r[ri.place_id];
  if (!placeId) continue;
  const firma = r[ri.firma];
  const adresse = r[ri.adresse] || "";
  const m = adresse.match(/(\d{4})\s+(.+?)\s*$/);
  const plz = m ? Number(m[1]) : null;
  const { ring, ort: ringOrt } = ringFor(plz);
  const ort = ringOrt || (m ? m[2] : "");

  // Priorität: manueller Override > Anreicherung (Crawl/Vision) > Review-Proxy.
  const ov = OVERRIDES_N[normName(firma)];
  const en = ENRICHED[normName(firma)];
  // Guard: Firmenname/„Unternehmen" ist kein Entscheider; generische Mail ist kein Personen-Anker.
  const enRoleBad = en && /unternehmen|firma|company/i.test(en.rolle || "");
  const enDecider = en && en.entscheider && !enRoleBad && normName(en.entscheider) !== normName(firma) ? en.entscheider : null;
  const enMail = en && en.mail && !["info", "kontakt", "office", "mail", "service", "contact"].includes(en.mail.split("@")[0]) ? en.mail : "";
  const noncoreText = NONCORE.test(firma) && !CORE.test(firma);
  const ma = ov?.ma ?? en?.ma ?? maProxyFromReviews(r[ri.google_reviews]).ma;
  const { tariff, maProxy } = tariffFor(ma);
  if (tariff.startsWith("DQ")) dq++;
  // Gewerk-Flag: Vision (core=false) schlägt die reine Namens-Heuristik.
  const noncore = en ? en.core === false : noncoreText;

  const machine = {
    place_id: placeId,
    firma,
    ort,
    plz: plz ?? "",
    ring,
    ma_proxy: ma != null ? maProxy : (en ? "?" : maProxyFromReviews(r[ri.google_reviews]).hint),
    tariff,
    inhaber_am_telefon: ov?.inhaberTel ?? en?.inhaber_am_telefon ?? "?",
    entscheider: ov?.dm ?? enDecider ?? "",
    rolle: ov?.role ?? (enDecider ? en?.rolle : "") ?? "",
    mail: enMail,
    telefon: r[ri.telefon] || "",
    website: r[ri.website] || "",
    rating: r[ri.google_rating] || "",
    reviews: r[ri.google_reviews] || "",
    icp_score: r[ri.score] || "",
    tier: r[ri.tier] || "",
    signale: [noncore ? "⚠ Gewerk prüfen" : null, ov?.flag, en ? `angereichert(${en.size_source})` : null, (r[ri.reasons] || "").slice(0, 60)].filter(Boolean).join(" · "),
  };

  const prev = existing.get(placeId);
  const merged = { ...machine };
  for (const c of HUMAN_COLS) merged[c] = prev?.[c] ?? (c === "status" ? "neu" : "");
  out.set(placeId, merged);
  if (prev) updated++; else added++;
}

// Ranking: Ring 0 zuerst, dann nach ICP-Score
const sorted = [...out.values()].sort((a, b) => {
  if (a.ring !== b.ring) return a.ring.localeCompare(b.ring);
  return (Number(b.icp_score) || 0) - (Number(a.icp_score) || 0);
});

// ── Output ───────────────────────────────────────────────────────────
const csv = "﻿" + LEAD_COLS.join(";") + "\n" +
  sorted.map((o) => LEAD_COLS.map((c) => csvCell(o[c])).join(";")).join("\n") + "\n";

const ring0 = sorted.filter((o) => o.ring === "0");
const ring1 = sorted.filter((o) => o.ring === "1");
function mdTable(rows) {
  const h = "| Firma | Ort | MA | Tarif | Inh.@Tel | Entscheider | ★/Rev | Score | Status | Nächster Schritt |";
  const sep = "|---|---|---|---|---|---|---|---|---|---|";
  const body = rows.map((o) =>
    `| ${o.firma} | ${o.ort} | ${o.ma_proxy} | ${o.tariff} | ${o.inhaber_am_telefon} | ${o.entscheider || "—"}${o.rolle ? " (" + o.rolle + ")" : ""} | ${o.rating || "—"}/${o.reviews || "—"} | ${o.icp_score} | ${o.status} | ${o.naechster_schritt || "—"} |`
  ).join("\n");
  return [h, sep, body].join("\n");
}
const md = `# Leads — SSOT (auto-generiert aus scout_raw.csv via build_leads.mjs)

> **Hoheit:** Daten-Spalten = Maschine, Status-Spalten = Founder (Re-Run fasst Status nie an).
> ICP/Region/Tarif: \`docs/gtm/sales/SALES_BIBLE.md\`. Bearbeiten: \`docs/sales/leads.csv\`.
> Tagesblätter: \`node scripts/_ops/todays_list.mjs\`. Größe/Mail aus Crawl/Vision = nächster Bau-Schritt.

**Stand:** auto · Ring 0: ${ring0.length} · Ring 1: ${ring1.length} · gesamt: ${sorted.length}

## Ring 0 — Vor-Ort (Velo: Oberrieden · Horgen · Thalwil · Rüschlikon)
${mdTable(ring0)}

## Ring 1 — Telefon (lokale Glaubwürdigkeit)
${mdTable(ring1)}
`;

console.log(`Lead-Motor: ${rawRows.length} Scout-Zeilen · neu ${added} · aktualisiert ${updated} · DQ-groß ${dq}`);
console.log(`Ring 0: ${ring0.length} · Ring 1: ${ring1.length} · Ring 2: ${sorted.length - ring0.length - ring1.length}`);
if (DRY) { console.log("\n(DRY-RUN — nichts geschrieben)\n" + mdTable(ring0)); process.exit(0); }
fs.writeFileSync(LEADS, csv, "utf-8");
fs.writeFileSync(LEADS_MD, md, "utf-8");
console.log(`\n✅ geschrieben: ${path.relative(process.cwd(), LEADS)} + leads.md`);
