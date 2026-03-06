#!/usr/bin/env node
/**
 * promote.mjs — Promote reviewed scout_raw rows to pipeline.csv
 *
 * Reads scout_raw.csv, takes rows where manual_review = "yes",
 * and upserts them into pipeline.csv with correct field mapping.
 *
 * Usage:
 *   node scripts/_ops/promote.mjs              # promote all "yes" rows
 *   node scripts/_ops/promote.mjs --dry-run    # show what would be promoted
 *
 * Dedupe: by normalized firma name. Existing pipeline rows are preserved —
 * only new companies are added. Outreach fields (kontakt, email, status,
 * demo_url, email_gesendet, anruf_1) are never overwritten.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_CSV = path.resolve(__dirname, "../../docs/sales/scout_raw.csv");
const PIPELINE_CSV = path.resolve(__dirname, "../../docs/sales/pipeline.csv");

const BOM = "\uFEFF";
const dryRun = process.argv.includes("--dry-run");

// ── CSV helpers ──────────────────────────────────────────────────────
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

function normalizeName(name) {
  return name.toLowerCase()
    .replace(/\b(gmbh|ag|sa|inc|ltd|co)\b/g, "")
    .replace(/[.,\-&()/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Read scout_raw ───────────────────────────────────────────────────
// Header: firma;website;notiz;manual_review;tier;trust;gap;google_rating;google_reviews;reasons;score;ort;adresse;telefon;maps_url;query;discovered;place_id
const RAW_COLS = {
  firma: 0, website: 1, notiz: 2, manual_review: 3, tier: 4, trust: 5,
  gap: 6, google_rating: 7, google_reviews: 8, reasons: 9, score: 10,
  ort: 11, adresse: 12, telefon: 13, maps_url: 14, query: 15,
  discovered: 16, place_id: 17,
};

// ── Read pipeline ────────────────────────────────────────────────────
// Header: firma;ort;website;kontakt;telefon;email;status;notizen;demo_url;email_gesendet;anruf_1;google_rating;google_reviews;score
const PIPE_HEADER = "firma;ort;website;kontakt;telefon;email;status;notizen;demo_url;email_gesendet;anruf_1;google_rating;google_reviews;score";
const PIPE_COLS = {
  firma: 0, ort: 1, website: 2, kontakt: 3, telefon: 4, email: 5,
  status: 6, notizen: 7, demo_url: 8, email_gesendet: 9, anruf_1: 10,
  google_rating: 11, google_reviews: 12, score: 13,
};

function main() {
  if (!fs.existsSync(RAW_CSV)) {
    console.error("  scout_raw.csv not found. Run scout first.");
    process.exit(1);
  }

  // Parse scout_raw — find rows with manual_review = "yes"
  const rawLines = stripBOM(fs.readFileSync(RAW_CSV, "utf-8")).split("\n").filter((l) => l.trim());
  const candidates = [];

  for (let i = 1; i < rawLines.length; i++) {
    const f = parseCSVLine(rawLines[i]);
    const review = (f[RAW_COLS.manual_review] || "").trim().toLowerCase();
    if (review === "yes") {
      candidates.push(f);
    }
  }

  if (candidates.length === 0) {
    console.log("\n  No rows with manual_review = yes found in scout_raw.csv.");
    console.log("  Nothing to promote.\n");
    return;
  }

  console.log(`\n  Found ${candidates.length} row(s) with manual_review = yes`);

  // Load existing pipeline
  const existingPipeline = new Map(); // normName -> row fields
  let pipelineRows = [];

  if (fs.existsSync(PIPELINE_CSV)) {
    const pipeLines = stripBOM(fs.readFileSync(PIPELINE_CSV, "utf-8")).split("\n").filter((l) => l.trim());
    for (let i = 1; i < pipeLines.length; i++) {
      const f = parseCSVLine(pipeLines[i]);
      const norm = normalizeName(f[PIPE_COLS.firma] || "");
      existingPipeline.set(norm, f);
      pipelineRows.push(f);
    }
  }

  // Promote candidates
  let promoted = 0;
  let skipped = 0;

  for (const raw of candidates) {
    const firma = raw[RAW_COLS.firma] || "";
    const norm = normalizeName(firma);

    if (existingPipeline.has(norm)) {
      console.log(`  SKIP: "${firma}" — already in pipeline`);
      skipped++;
      continue;
    }

    // Map scout_raw fields to pipeline fields
    const pipeRow = [
      csvEscape(firma),                            // firma
      csvEscape(raw[RAW_COLS.ort] || ""),           // ort
      csvEscape(raw[RAW_COLS.website] || ""),       // website
      "",                                           // kontakt (blank — founder fills)
      csvEscape(raw[RAW_COLS.telefon] || ""),       // telefon
      "",                                           // email (blank — founder fills)
      "OFFEN",                                      // status
      csvEscape(raw[RAW_COLS.notiz] || ""),         // notizen (from scout notiz)
      "",                                           // demo_url
      "",                                           // email_gesendet
      "",                                           // anruf_1
      raw[RAW_COLS.google_rating] || "",            // google_rating
      raw[RAW_COLS.google_reviews] || "",           // google_reviews
      raw[RAW_COLS.score] || "",                    // score
    ];

    console.log(`  PROMOTE: "${firma}" (${raw[RAW_COLS.ort]}) → pipeline`);
    pipelineRows.push(pipeRow);
    existingPipeline.set(norm, pipeRow);
    promoted++;
  }

  console.log(`\n  Summary: ${promoted} promoted, ${skipped} skipped (already in pipeline)`);

  if (dryRun) {
    console.log("  DRY RUN — nothing written.\n");
    return;
  }

  // Write pipeline
  const output = [PIPE_HEADER, ...pipelineRows.map((r) => r.join(";"))].join("\n") + "\n";
  fs.writeFileSync(PIPELINE_CSV, BOM + output, "utf-8");
  console.log(`  ✅ pipeline.csv updated (${pipelineRows.length} total rows)\n`);
}

main();
