#!/usr/bin/env node
/**
 * scout.mjs — Google Places Prospect Finder for FlowSight
 *
 * Discovers sanitär/heizung businesses per municipality, scores them
 * for FlowSight ICP fit, and writes to scout_raw.csv.
 *
 * Usage:
 *   # Scout a single municipality
 *   node scripts/_ops/scout.mjs --gemeinde Thalwil
 *
 *   # Scout all linker Zürichsee municipalities
 *   node scripts/_ops/scout.mjs --region zuerichsee-links
 *
 *   # Dry run (no file writes)
 *   node scripts/_ops/scout.mjs --gemeinde Kilchberg --dry-run
 *
 *   # Custom query (override defaults)
 *   node scripts/_ops/scout.mjs --gemeinde Horgen --queries "Sanitär,Heizung,Badumbau"
 *
 *   # Export styled XLSX for founder review (no API key needed)
 *   node scripts/_ops/scout.mjs --export-xlsx
 *
 * Env: GOOGLE_SCOUT_KEY (Vercel SSOT + .env.local)
 *
 * Scoring model — "Digital Gap" (see docs below for reasoning):
 *   Score = Local Trust (0-5) + Digital Gap (0-5) + Contactable (0-1) - Disqualifiers
 *   Perfect ICP: strong reviews + no/weak website = high score
 *   Bad lead: no reviews + strong website = low score
 *
 * Files:
 *   docs/sales/scout_raw.csv   ← all discovered candidates (this script writes here)
 *   docs/sales/pipeline.csv    ← founder-curated qualified prospects (manual promotion)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_CSV = path.resolve(__dirname, "../../docs/sales/scout_raw.csv");
const PIPELINE_CSV = path.resolve(__dirname, "../../docs/sales/pipeline.csv");
const COVERAGE_CSV = path.resolve(__dirname, "../../docs/sales/scout_coverage.csv");

// ── Env ─────────────────────────────────────────────────────────────
// Load .env.local if present (check multiple locations)
for (const rel of ["../../.env.local", "../../src/web/.env.local"]) {
  const envPath = path.resolve(__dirname, rel);
  if (!fs.existsSync(envPath)) continue;
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
    }
  }
}

// ── Args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}
const dryRun = args.includes("--dry-run");
const exportXlsx = args.includes("--export-xlsx");
const gemeinde = getArg("gemeinde");
const region = getArg("region");
const customQueries = getArg("queries");
const apiKey = getArg("api-key") || process.env.GOOGLE_SCOUT_KEY || "";

if (!apiKey && !exportXlsx) {
  console.error(`
  GOOGLE_SCOUT_KEY not set.

  Setup (5 min):
  1. console.cloud.google.com → project "FlowSight Scout"
  2. Enable "Places API (New)"
  3. Create API Key (restrict to Places API)
  4. Vercel: set GOOGLE_SCOUT_KEY
  5. Local: add to src/web/.env.local

  Free tier: $200/month = ~1000+ searches.
`);
  process.exit(1);
}

if (!gemeinde && !region && !exportXlsx) {
  console.error(`
  Usage:
    node scripts/_ops/scout.mjs --gemeinde Thalwil
    node scripts/_ops/scout.mjs --region zuerichsee-links
    node scripts/_ops/scout.mjs --gemeinde Horgen --dry-run
    node scripts/_ops/scout.mjs --export-xlsx

  Available regions:
    zuerichsee-links    Thalwil → Horgen (10 Gemeinden)
`);
  process.exit(1);
}

// ── Regions ─────────────────────────────────────────────────────────
const REGIONS = {
  "zuerichsee-links": [
    "Thalwil",
    "Oberrieden",
    "Horgen",
    "Au ZH",
    "Wädenswil",
    "Richterswil",
    "Kilchberg ZH",
    "Rüschlikon",
    "Adliswil",
    "Langnau am Albis",
  ],
};

// ── Query patterns ──────────────────────────────────────────────────
// Multiple patterns to catch firms that don't have "Sanitär" in their name
// (e.g. "Dörfler AG" is a sanitär business but name doesn't say so)
const DEFAULT_QUERIES = [
  "Sanitär",
  "Sanitärinstallateur",
  "Heizungsinstallateur",
  "Haustechnik",
  "Badumbau",
  "Sanitär Heizung",
];

// ── Name normalization (for fuzzy dedup) ─────────────────────────────
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/\b(gmbh|ag|sa|inc|ltd|co)\b/g, "")
    .replace(/[.,\-&()/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Load existing IDs to skip duplicates ────────────────────────────
function loadExistingPlaceIds() {
  const ids = new Set();
  const names = new Set();

  for (const csvPath of [RAW_CSV, PIPELINE_CSV]) {
    if (!fs.existsSync(csvPath)) continue;
    const csv = stripBOM(fs.readFileSync(csvPath, "utf-8"));
    for (const line of csv.split("\n").slice(1)) {
      if (!line.trim()) continue;
      const fields = parseCSVLine(line);
      if (csvPath === RAW_CSV) {
        // Layout: firma=0, place_id=17
        const name = fields[0]?.trim();
        const id = fields[17]?.trim();
        if (id) ids.add(id);
        if (name) names.add(normalizeName(name));
      } else {
        // pipeline.csv: firma=0
        const name = fields[0]?.trim();
        if (name) names.add(normalizeName(name));
      }
    }
  }
  return { ids, names };
}

// CSV line parser (semicolon-delimited, handles quoted fields)
function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ";" && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

// ── Google Places Text Search ───────────────────────────────────────
async function searchPlaces(textQuery) {
  const url = "https://places.googleapis.com/v1/places:searchText";

  const body = {
    textQuery,
    languageCode: "de",
    regionCode: "CH",
    maxResultCount: 20,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.websiteUri",
        "places.rating",
        "places.userRatingCount",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.googleMapsUri",
        "places.businessStatus",
        "places.types",
        "places.regularOpeningHours",
      ].join(","),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  API error (${res.status}) for "${textQuery}":`, err.slice(0, 200));
    return [];
  }

  const data = await res.json();
  return data.places || [];
}

// ── Scoring ─────────────────────────────────────────────────────────
/**
 * ICP Scoring Model v3 — "Digital Gap + Voice Fit"
 *
 * v3 adds Module 2 (Voice Agent) scoring alongside Module 1 (Website).
 *
 * Score = Module1 (0-5) + Module2 (0-5) + Contactable (0/1) - Disqualifiers
 *
 * MODULE 1: DIGITAL GAP (0-5) — website replacement potential
 *   5: no website at all
 *   4: directory-only (local.ch, search.ch link)
 *   3: builder website (wix, jimdo, etc.)
 *   2: has website (quality unknown)
 *
 * MODULE 2: VOICE FIT (0-5) — voice agent value potential
 *   Sum of: Emergency (0-2) + Hours Gap (0-2) + Service Breadth (0-1)
 *
 *   Emergency (0-2):
 *     2: types include "plumber" or name has "Notdienst/Pikett/24h"
 *     1: types include repair-adjacent categories
 *     0: no emergency signal
 *
 *   Hours Gap (0-2) — from regularOpeningHours:
 *     2: closed evenings + weekends (standard business hours only)
 *     1: extended hours but not 24/7
 *     0: 24/7 or no hours data (can't assess)
 *
 *   Service Breadth (0-1):
 *     1: multiple Gewerke (Sanitär + Heizung + Spenglerei)
 *     0: single specialty
 *
 * LOCAL TRUST — used as tiebreaker, not in main score
 *   Stored separately for founder review.
 *
 * CONTACTABLE (0-1): 1 if phone, 0 if not
 *
 * DISQUALIFIERS: -3 chain, -2 high reviews (>80), -5 enterprise name
 *
 * Tier thresholds (aligned with einsatzlogik.md):
 *   >= 8: HOT     → A+B-Full+C+D
 *   >= 6: WARM    → B-Full+D
 *   <  6: COLD    → SKIP
 */
function scorePlace(place) {
  const reasons = [];
  const website = place.websiteUri || "";
  const rating = place.rating || 0;
  const reviews = place.userRatingCount || 0;
  const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || "";
  const types = place.types || [];
  const nameLower = (place.displayName?.text || "").toLowerCase();
  const hours = place.regularOpeningHours;

  // ── Local Trust (0-5) — tiebreaker, not in main score ──
  let localTrust = 0;
  if (rating >= 4.5 && reviews >= 10) {
    localTrust = 5;
    reasons.push(`Trust 5: ${rating}★ × ${reviews} Reviews`);
  } else if (rating >= 4.0 && reviews >= 5) {
    localTrust = 4;
    reasons.push(`Trust 4: ${rating}★ × ${reviews} Reviews`);
  } else if (rating >= 3.5 && reviews >= 3) {
    localTrust = 3;
    reasons.push(`Trust 3: ${rating}★ × ${reviews} Reviews`);
  } else if (reviews >= 1) {
    localTrust = 2;
    reasons.push(`Trust 2: ${reviews} Reviews`);
  } else {
    localTrust = 1;
    reasons.push("Trust 1: auf Maps, 0 Reviews");
  }

  // ── Module 1: Digital Gap (0-5) — website replacement potential ──
  let digitalGap = 0;
  const BUILDERS = ["wix", "jimdo", "one.com", "digitalone", "squarespace", "weebly", "webnode", "site123"];
  const DIRECTORIES = ["local.ch", "search.ch", "tel.search.ch", "yellow.ch"];
  const websiteLower = website.toLowerCase();

  if (!website) {
    digitalGap = 5;
    reasons.push("M1=5: keine Website");
  } else if (DIRECTORIES.some((d) => websiteLower.includes(d))) {
    digitalGap = 4;
    reasons.push("M1=4: nur Verzeichnis-Link");
  } else if (BUILDERS.some((b) => websiteLower.includes(b))) {
    digitalGap = 3;
    reasons.push("M1=3: Baukasten-Website");
  } else {
    digitalGap = 2;
    reasons.push("M1=2: hat Website");
  }

  // ── Module 2: Voice Fit (0-5) — voice agent value ──
  let voiceFit = 0;

  // Emergency indicator (0-2)
  const EMERGENCY_TYPES = ["plumber"];
  const EMERGENCY_KEYWORDS = ["notdienst", "pikett", "24h", "notfall", "24-stunden"];
  const REPAIR_TYPES = ["electrician", "hvac_contractor", "roofing_contractor"];

  if (EMERGENCY_TYPES.some((t) => types.includes(t)) ||
      EMERGENCY_KEYWORDS.some((k) => nameLower.includes(k))) {
    voiceFit += 2;
    reasons.push("M2+2: Notdienst/Sanitär");
  } else if (REPAIR_TYPES.some((t) => types.includes(t))) {
    voiceFit += 1;
    reasons.push("M2+1: Reparatur-nah");
  }

  // Hours Gap (0-2) — from regularOpeningHours
  if (hours && hours.periods && hours.periods.length > 0) {
    const periods = hours.periods;
    // Check if open 7 days
    const daysOpen = new Set(periods.map((p) => p.open?.day)).size;
    // Check if any period extends past 18:00
    const hasEveningHours = periods.some((p) => {
      const closeHour = p.close?.hour ?? 0;
      return closeHour >= 20;
    });

    if (daysOpen <= 5 && !hasEveningHours) {
      voiceFit += 2;
      reasons.push("M2+2: Mo-Fr Bürozeiten (Lücke abends+Sa/So)");
    } else if (daysOpen <= 6 || !hasEveningHours) {
      voiceFit += 1;
      reasons.push("M2+1: erweitert, nicht 24/7");
    } else {
      reasons.push("M2+0: 24/7 oder fast");
    }
  } else {
    // No hours data — assume standard business hours (most small businesses)
    voiceFit += 1;
    reasons.push("M2+1: keine Öffnungszeiten (Standard angenommen)");
  }

  // Service Breadth (0-1)
  const MULTI_GEWERK_KEYWORDS = ["sanitär", "heizung", "spenglerei", "lüftung", "klima", "haustechnik"];
  const gewerkCount = MULTI_GEWERK_KEYWORDS.filter((k) => nameLower.includes(k)).length;
  if (gewerkCount >= 2) {
    voiceFit += 1;
    reasons.push(`M2+1: ${gewerkCount} Gewerke im Namen`);
  }

  // Cap voiceFit at 5
  voiceFit = Math.min(5, voiceFit);

  // ── Contactable (0-1) ──
  let contactable = 0;
  if (phone) {
    contactable = 1;
  } else {
    reasons.push("Kein Telefon");
  }

  // ── Disqualifiers ──
  let penalty = 0;
  const CHAIN_TYPES = ["department_store", "shopping_mall", "supermarket", "bank"];
  if (types.some((t) => CHAIN_TYPES.includes(t))) {
    penalty += 3;
    reasons.push("Disq: Kette/Grossbetrieb");
  }
  if (reviews > 80) {
    penalty += 2;
    reasons.push(`Disq: ${reviews} Reviews — Grossbetrieb`);
  }
  const ENTERPRISE_NAMES = ["fust", "meier tobler", "coop", "migros", "jumbo", "hornbach", "bauhaus", "sanitas troesch"];
  if (ENTERPRISE_NAMES.some((e) => nameLower.includes(e))) {
    penalty += 5;
    reasons.push("Disq: Enterprise/Kette");
  }

  // ── Final score: M1 + M2 + Contactable - Penalty ──
  const score = Math.max(0, Math.min(10, digitalGap + voiceFit + contactable - penalty));
  const tier = score >= 8 ? "HOT" : score >= 6 ? "WARM" : "COLD";

  return { score, tier, localTrust, digitalGap, voiceFit, contactable, penalty, reasons };
}

// ── CSV helpers (semicolon-delimited, UTF-8 BOM for Excel) ──────────
const BOM = "\uFEFF";

function csvEscape(val) {
  const s = String(val ?? "");
  if (s.includes(";") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function stripBOM(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

const RAW_HEADER = "firma;website;notiz;manual_review;tier;trust;gap;voice_fit;google_rating;google_reviews;reasons;score;ort;adresse;telefon;maps_url;query;discovered;place_id";

function ensureRawCSV() {
  if (!fs.existsSync(RAW_CSV)) {
    fs.writeFileSync(RAW_CSV, BOM + RAW_HEADER + "\n", "utf-8");
  }
}

// ── Extract municipality from address ───────────────────────────────
function extractOrt(address) {
  // Swiss addresses: "Street, PLZ Ort, Schweiz" or "Street, Ort, Schweiz"
  const parts = address.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    // Second-to-last part usually has PLZ + Ort
    const plzOrt = parts[parts.length - 2];
    // Remove PLZ (4 digits)
    return plzOrt.replace(/^\d{4}\s*/, "").trim();
  }
  return "";
}

// ── Coverage tracking ────────────────────────────────────────────────
const COVERAGE_HEADER = "gemeinde;last_scouted_at;run_source;queries_run;results_found";

function loadCoverage() {
  if (!fs.existsSync(COVERAGE_CSV)) return new Map();
  const rows = new Map();
  const lines = stripBOM(fs.readFileSync(COVERAGE_CSV, "utf-8")).split("\n").slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const fields = parseCSVLine(line);
    rows.set(fields[0]?.trim(), {
      gemeinde: fields[0]?.trim(),
      last_scouted_at: fields[1]?.trim(),
      run_source: fields[2]?.trim(),
      queries_run: fields[3]?.trim(),
      results_found: fields[4]?.trim(),
    });
  }
  return rows;
}

function writeCoverage(rows) {
  const lines = [COVERAGE_HEADER];
  for (const row of rows.values()) {
    lines.push([
      csvEscape(row.gemeinde),
      row.last_scouted_at,
      csvEscape(row.run_source),
      row.queries_run,
      row.results_found,
    ].join(";"));
  }
  fs.writeFileSync(COVERAGE_CSV, BOM + lines.join("\n") + "\n", "utf-8");
}

function updateCoverage(targetedGemeinden, queriesPerGem, resultsPerGem, runSource) {
  const rows = loadCoverage();
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  for (const gem of targetedGemeinden) {
    rows.set(gem, {
      gemeinde: gem,
      last_scouted_at: now,
      run_source: runSource,
      queries_run: String(queriesPerGem),
      results_found: String(resultsPerGem.get(gem) || 0),
    });
  }
  writeCoverage(rows);
}

// ── XLSX Export ─────────────────────────────────────────────────────
const XLSX_OUT = path.resolve(__dirname, "../../docs/sales/scout_review.xlsx");

async function exportToXlsx() {
  // exceljs lives in src/web/node_modules (dev dep of the Next.js app)
  const require = createRequire(path.resolve(__dirname, "../../src/web/package.json"));
  const ExcelJS = require("exceljs");
  const wb = new ExcelJS.Workbook();

  // ── Shared design tokens ──
  const DESIGN = {
    headerFont: { bold: true, size: 11, color: { argb: "FFFFFFFF" } },
    headerAlign: { vertical: "middle", horizontal: "center", wrapText: true },
    headerHeight: 28,
    headerColor: "FF1E293B", // slate-800 — same across all sheets
    border: {
      top: { style: "thin", color: { argb: "FFE2E8F0" } },
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    },
    link: { color: { argb: "FF2563EB" }, underline: true },
    review: {
      yes:   { font: { bold: true, color: { argb: "FF16A34A" } }, fill: "FFF0FDF4" },
      no:    { font: { bold: true, color: { argb: "FFDC2626" } }, fill: "FFFEF2F2" },
      maybe: { font: { bold: true, color: { argb: "FFD97706" } }, fill: "FFFFFBEB" },
    },
    tier: {
      HOT:  { font: { bold: true, color: { argb: "FFDC2626" } }, row: "FFFEF3F2" },
      WARM: { font: { bold: true, color: { argb: "FFD97706" } }, row: "FFFFFBEB" },
      COLD: { font: { color: { argb: "FF94A3B8" } }, row: "FFF1F5F9" },
    },
    status: {
      OFFEN:       { font: { color: { argb: "FF6B7280" } }, fill: "FFF9FAFB" },
      KONTAKTIERT: { font: { bold: true, color: { argb: "FF2563EB" } }, fill: "FFEFF6FF" },
      DEMO:        { font: { bold: true, color: { argb: "FF7C3AED" } }, fill: "FFF5F3FF" },
      GEWONNEN:    { font: { bold: true, color: { argb: "FF16A34A" } }, fill: "FFF0FDF4" },
      VERLOREN:    { font: { color: { argb: "FF94A3B8" } }, fill: "FFF1F5F9" },
    },
  };

  // ── Shared helpers ──
  function styleHeader(ws, headers, rowCount) {
    const hRow = ws.getRow(1);
    hRow.font = DESIGN.headerFont;
    hRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DESIGN.headerColor } };
    hRow.alignment = DESIGN.headerAlign;
    hRow.height = DESIGN.headerHeight;
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: rowCount, column: headers.length } };
  }

  function styleBorders(ws, rowCount, colCount) {
    for (let r = 1; r <= rowCount; r++) {
      const row = ws.getRow(r);
      for (let c = 1; c <= colCount; c++) {
        row.getCell(c).border = DESIGN.border;
      }
    }
  }

  function styleLinks(ws, colIdx, rowCount) {
    if (colIdx < 0) return;
    for (let r = 2; r <= rowCount; r++) {
      const cell = ws.getRow(r).getCell(colIdx + 1);
      const url = String(cell.value || "").trim();
      if (url && url.startsWith("http")) {
        cell.value = { text: url, hyperlink: url };
        cell.font = { ...cell.font, ...DESIGN.link };
      }
    }
  }

  // ── Sheet 1: Scout Raw ──
  if (fs.existsSync(RAW_CSV)) {
    const ws = wb.addWorksheet("Scout Raw");
    const rawLines = stripBOM(fs.readFileSync(RAW_CSV, "utf-8")).split("\n").filter((l) => l.trim());
    const headers = rawLines[0].split(";");
    for (const line of rawLines) ws.addRow(line === rawLines[0] ? headers : parseCSVLine(line));

    const lastRow = rawLines.length;
    styleHeader(ws, headers, lastRow);

    // Column widths
    const colWidths = {
      firma: 30, website: 35, notiz: 28, manual_review: 14, tier: 7, trust: 7, gap: 6,
      google_rating: 8, google_reviews: 9, reasons: 45, score: 7, ort: 18,
      adresse: 30, telefon: 16, maps_url: 20, query: 22, discovered: 12, place_id: 20,
    };
    headers.forEach((h, i) => { ws.getColumn(i + 1).width = colWidths[h] || 15; });

    // Freeze firma + website + notiz + manual_review (4 cols) + header
    ws.views = [{ state: "frozen", xSplit: 4, ySplit: 1 }];

    // Row styling
    const tierCol = headers.indexOf("tier");
    const reviewCol = headers.indexOf("manual_review");
    const notizCol = headers.indexOf("notiz");
    const reasonsCol = headers.indexOf("reasons");

    for (let r = 2; r <= lastRow; r++) {
      const row = ws.getRow(r);

      // Tier row tinting
      const tierVal = row.getCell(tierCol + 1).value;
      const tierStyle = DESIGN.tier[tierVal];
      if (tierStyle) {
        for (let c = 1; c <= headers.length; c++) {
          row.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: tierStyle.row } };
        }
        row.getCell(tierCol + 1).font = tierStyle.font;
      }

      // manual_review coloring
      const rv = String(row.getCell(reviewCol + 1).value || "").trim().toLowerCase();
      const reviewStyle = DESIGN.review[rv];
      if (reviewStyle) {
        row.getCell(reviewCol + 1).font = reviewStyle.font;
        row.getCell(reviewCol + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: reviewStyle.fill } };
      }

      // Wrap notiz + reasons
      if (notizCol >= 0) row.getCell(notizCol + 1).alignment = { wrapText: true, vertical: "top" };
      if (reasonsCol >= 0) row.getCell(reasonsCol + 1).alignment = { wrapText: true, vertical: "top" };
    }

    styleLinks(ws, headers.indexOf("website"), lastRow);
    styleBorders(ws, lastRow, headers.length);
  }

  // ── Sheet 2: Pipeline ──
  if (fs.existsSync(PIPELINE_CSV)) {
    const ws = wb.addWorksheet("Pipeline");
    const pipeLines = stripBOM(fs.readFileSync(PIPELINE_CSV, "utf-8")).split("\n").filter((l) => l.trim());
    const headers = pipeLines[0].split(";");
    for (const line of pipeLines) ws.addRow(line === pipeLines[0] ? headers : parseCSVLine(line));

    const lastRow = pipeLines.length;
    styleHeader(ws, headers, lastRow);

    // Column widths
    const colWidths = {
      firma: 30, ort: 16, website: 30, kontakt: 20, telefon: 16, email: 24,
      status: 14, notizen: 35, demo_url: 28, email_gesendet: 14, anruf_1: 12,
      google_rating: 8, google_reviews: 9, score: 7,
    };
    headers.forEach((h, i) => { ws.getColumn(i + 1).width = colWidths[h] || 15; });

    // Freeze firma + ort + website (3 cols) + header
    ws.views = [{ state: "frozen", xSplit: 3, ySplit: 1 }];

    // Status coloring + links + notizen wrapping
    const statusCol = headers.indexOf("status");
    const notizenCol = headers.indexOf("notizen");

    for (let r = 2; r <= lastRow; r++) {
      const row = ws.getRow(r);
      const sv = String(row.getCell(statusCol + 1).value || "").trim().toUpperCase();
      const statusStyle = DESIGN.status[sv];
      if (statusStyle) {
        row.getCell(statusCol + 1).font = statusStyle.font;
        row.getCell(statusCol + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusStyle.fill } };
      }
      if (notizenCol >= 0) row.getCell(notizenCol + 1).alignment = { wrapText: true, vertical: "top" };
    }

    styleLinks(ws, headers.indexOf("website"), lastRow);
    styleLinks(ws, headers.indexOf("demo_url"), lastRow);
    styleBorders(ws, lastRow, headers.length);
  }

  // ── Sheet 3: Coverage ──
  if (fs.existsSync(COVERAGE_CSV)) {
    const ws = wb.addWorksheet("Coverage");
    const covLines = stripBOM(fs.readFileSync(COVERAGE_CSV, "utf-8")).split("\n").filter((l) => l.trim());
    const headers = covLines[0].split(";");
    for (const line of covLines) ws.addRow(line === covLines[0] ? headers : parseCSVLine(line));

    const lastRow = covLines.length;
    styleHeader(ws, headers, lastRow);

    const colWidths = { gemeinde: 24, last_scouted_at: 22, run_source: 24, queries_run: 12, results_found: 14 };
    headers.forEach((h, i) => { ws.getColumn(i + 1).width = colWidths[h] || 15; });

    // Freeze gemeinde + header
    ws.views = [{ state: "frozen", xSplit: 1, ySplit: 1 }];

    styleBorders(ws, lastRow, headers.length);
  }

  await wb.xlsx.writeFile(XLSX_OUT);
  const rawCount = wb.getWorksheet("Scout Raw")?.rowCount - 1 || 0;
  const pipeCount = wb.getWorksheet("Pipeline")?.rowCount - 1 || 0;
  const covCount = wb.getWorksheet("Coverage")?.rowCount - 1 || 0;
  console.log(`\n  ✅ Exported to ${path.relative(process.cwd(), XLSX_OUT)}`);
  console.log(`  Scout Raw: ${rawCount} rows | Pipeline: ${pipeCount} rows | Coverage: ${covCount} rows\n`);
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const gemeinden = region
    ? REGIONS[region] || (() => { console.error(`Unknown region: ${region}`); process.exit(1); })()
    : [gemeinde];

  const queries = customQueries
    ? customQueries.split(",").map((q) => q.trim())
    : DEFAULT_QUERIES;

  console.log(`\n  Scout: ${gemeinden.length} Gemeinde(n), ${queries.length} Queries each`);
  console.log(`  Gemeinden: ${gemeinden.join(", ")}`);
  console.log(`  Queries: ${queries.join(", ")}`);
  console.log(`  Mode: ${dryRun ? "DRY RUN" : "WRITE to scout_raw.csv"}\n`);

  const { ids: existingIds, names: existingNames } = loadExistingPlaceIds();
  const allResults = new Map(); // place_id → result object (dedupe across queries)
  const runNames = new Set(); // normalized names seen in this run (catches same company, different place_id)
  const resultsPerGem = new Map(); // gemeinde → count (for coverage tracking)
  let apiCalls = 0;

  for (const gem of gemeinden) {
    console.log(`  --- ${gem} ---`);
    let gemCount = 0;

    for (const q of queries) {
      const textQuery = `${q} ${gem}`;
      const places = await searchPlaces(textQuery);
      apiCalls++;

      for (const p of places) {
        const placeId = p.id;
        if (!placeId) continue;

        // Skip if already known (in raw or pipeline)
        if (existingIds.has(placeId)) continue;

        // Skip if already found in this run
        if (allResults.has(placeId)) continue;

        // Name-based dedupe (normalized: strips GmbH/AG, punctuation, whitespace)
        const name = p.displayName?.text || "";
        const norm = normalizeName(name);
        if (existingNames.has(norm)) continue;
        if (runNames.has(norm)) continue;
        runNames.add(norm);

        const address = p.formattedAddress || "";
        const ort = extractOrt(address);
        const phone = p.nationalPhoneNumber || p.internationalPhoneNumber || "";
        const { score, tier, localTrust, digitalGap, voiceFit, contactable, penalty, reasons } = scorePlace(p);

        allResults.set(placeId, {
          placeId,
          name,
          ort,
          address,
          phone,
          website: p.websiteUri || "",
          rating: p.rating || 0,
          reviews: p.userRatingCount || 0,
          mapsUrl: p.googleMapsUri || "",
          score,
          tier,
          localTrust,
          digitalGap,
          voiceFit,
          contactable,
          penalty,
          reasons,
          query: textQuery,
        });
        gemCount++;
      }

      // Small delay to be nice to the API
      await new Promise((r) => setTimeout(r, 200));
    }

    resultsPerGem.set(gem, gemCount);
  }

  // Sort by score descending
  const results = [...allResults.values()].sort((a, b) => b.score - a.score);

  // ── Display ─────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(90));
  console.log("  SCOUT RESULTS");
  console.log("=".repeat(90));

  if (results.length === 0) {
    console.log("\n  No new prospects found. All already known or no results.");
    if (!dryRun) {
      const runSource = region ? `region:${region}` : gemeinden[0];
      updateCoverage(gemeinden, queries.length, resultsPerGem, runSource);
      console.log(`  ✅ Coverage updated for ${gemeinden.length} Gemeinde(n) in scout_coverage.csv\n`);
    }
    return;
  }

  const tiers = { HOT: [], WARM: [], COLD: [] };
  for (const r of results) tiers[r.tier].push(r);

  for (const [tierName, tierResults] of Object.entries(tiers)) {
    if (tierResults.length === 0) continue;
    const icon = tierName === "HOT" ? "🔴" : tierName === "WARM" ? "🟡" : "⚪";
    console.log(`\n  ${icon} ${tierName} (${tierResults.length})`);
    console.log("  " + "-".repeat(86));

    for (const r of tierResults) {
      const web = r.website ? "🌐" : "❌";
      console.log(
        `  [${r.score}/10] ${r.name}` +
        `  |  ${r.ort}  |  ${r.rating || "-"}★ ${r.reviews}R  |  ${web} Website  |  ${r.phone || "kein Tel"}`
      );
      // Show scoring breakdown
      console.log(
        `          M1:${r.digitalGap} + M2:${r.voiceFit} + Tel:${r.contactable} (Trust:${r.localTrust})` +
        (r.penalty ? ` - Penalty:${r.penalty}` : "")
      );
      // Show top reasons (max 2 for readability)
      const topReasons = r.reasons.slice(0, 2).join(" | ");
      console.log(`          ${topReasons}`);
      if (r.website) console.log(`          ${r.website}`);
    }
  }

  console.log("\n" + "=".repeat(90));
  console.log(`  Total: ${results.length} new  |  ${tiers.HOT.length} HOT  |  ${tiers.WARM.length} WARM  |  ${tiers.COLD.length} COLD`);
  console.log(`  API calls: ${apiCalls}  |  Gemeinden: ${gemeinden.length}  |  Queries: ${queries.length}`);
  console.log("=".repeat(90));

  if (dryRun) {
    console.log("\n  DRY RUN — nothing written.\n");
    return;
  }

  // ── Write to scout_raw.csv ──────────────────────────────────────
  ensureRawCSV();
  const today = new Date().toISOString().split("T")[0];
  const lines = results.map((r) =>
    [
      csvEscape(r.name),
      csvEscape(r.website),
      "",  // notiz — blank, filled by founder
      "",  // manual_review — blank, filled by founder
      r.tier,
      r.localTrust,
      r.digitalGap,
      r.voiceFit,
      r.rating || "",
      r.reviews || "",
      csvEscape(r.reasons.join("; ")),
      r.score,
      csvEscape(r.ort),
      csvEscape(r.address),
      csvEscape(r.phone),
      csvEscape(r.mapsUrl),
      csvEscape(r.query),
      today,
      csvEscape(r.placeId),
    ].join(";")
  );

  fs.appendFileSync(RAW_CSV, lines.join("\n") + "\n");
  console.log(`\n  ✅ ${results.length} entries written to scout_raw.csv`);

  // ── Update coverage tracker ──────────────────────────────────────
  const runSource = region ? `region:${region}` : gemeinden[0];
  updateCoverage(gemeinden, queries.length, resultsPerGem, runSource);
  console.log(`  ✅ Coverage updated for ${gemeinden.length} Gemeinde(n) in scout_coverage.csv`);

  // Show next steps for HOT
  if (tiers.HOT.length > 0) {
    console.log(`\n  Next steps for ${tiers.HOT.length} HOT prospects:`);
    console.log("  1. Review scout_raw.csv — confirm ICP fit");
    console.log("  2. Add best ones to pipeline.csv (manual)");
    console.log("  3. Build demo website: node scripts/_ops/prospect_pipeline.mjs --url <url> --slug <slug>");
    console.log("  4. Send email\n");
  }
}

const run = exportXlsx ? exportToXlsx : main;
run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
