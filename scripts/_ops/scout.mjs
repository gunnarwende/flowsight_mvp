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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_CSV = path.resolve(__dirname, "../../docs/sales/scout_raw.csv");
const PIPELINE_CSV = path.resolve(__dirname, "../../docs/sales/pipeline.csv");

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
const gemeinde = getArg("gemeinde");
const region = getArg("region");
const customQueries = getArg("queries");
const apiKey = getArg("api-key") || process.env.GOOGLE_SCOUT_KEY || "";

if (!apiKey) {
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

if (!gemeinde && !region) {
  console.error(`
  Usage:
    node scripts/_ops/scout.mjs --gemeinde Thalwil
    node scripts/_ops/scout.mjs --region zuerichsee-links
    node scripts/_ops/scout.mjs --gemeinde Horgen --dry-run

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

// ── Load existing IDs to skip duplicates ────────────────────────────
function loadExistingPlaceIds() {
  const ids = new Set();
  const names = new Set();

  for (const csvPath of [RAW_CSV, PIPELINE_CSV]) {
    if (!fs.existsSync(csvPath)) continue;
    const csv = fs.readFileSync(csvPath, "utf-8");
    for (const line of csv.split("\n").slice(1)) {
      if (!line.trim()) continue;
      // Parse first field (place_id or firma) for dedup
      const fields = parseCSVLine(line);
      const id = fields[0]?.trim();
      const name = (csvPath === RAW_CSV ? fields[1] : fields[0])?.trim().toLowerCase();
      if (id) ids.add(id);
      if (name) names.add(name);
    }
  }
  return { ids, names };
}

// Simple CSV line parser (handles quoted fields)
function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
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
 * ICP Scoring Model — "Digital Gap"
 *
 * We're looking for: strong local business + weak digital presence = leverage.
 * NOT: weak everything (might be dead) or strong everything (no gap).
 *
 * Score = Local Trust (0-5) + Digital Gap (0-5) + Contactable (0/1) - Disqualifiers
 *
 * LOCAL TRUST (0-5) — deterministic from rating × reviews
 *   5: rating ≥ 4.5 AND reviews ≥ 10    (strong proof)
 *   4: rating ≥ 4.0 AND reviews ≥ 5     (solid proof)
 *   3: rating ≥ 3.5 AND reviews ≥ 3     (some proof)
 *   2: reviews ≥ 1 (has presence)
 *   1: on Google Maps but 0 reviews      (exists)
 *   0: not applicable
 *
 * DIGITAL GAP (0-5) — heuristic from website presence + type
 *   5: no website at all                 (maximum gap)
 *   4: directory-only (local.ch, search.ch link)
 *   3: builder website (wix, jimdo, one.com, digitalone, squarespace)
 *   2: has website but basic domain (manual check needed)
 *   0: has professional-looking website   (low gap — but can't verify quality)
 *
 *   Limitation: we can only assess website existence and URL pattern.
 *   Actual quality (modern? fast? conversion-optimized?) requires founder review.
 *
 * CONTACTABLE (0-1) — deterministic
 *   1: has phone number
 *   0: no phone
 *
 * DISQUALIFIERS — heuristic
 *   -3: business types suggest chain/franchise/enterprise
 *   -2: name contains AG/SA + multiple location indicators
 *
 * Assumptions:
 *   - Google Places API returns accurate rating/review data
 *   - "No website" from API means truly no website (not just missing from API)
 *   - Builder URL patterns are reliable indicators
 *   - We cannot determine employee count from API data (proxy: review count as rough scale)
 */
function scorePlace(place) {
  const reasons = [];
  const website = place.websiteUri || "";
  const rating = place.rating || 0;
  const reviews = place.userRatingCount || 0;
  const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || "";
  const types = place.types || [];

  // ── Local Trust (0-5) ──
  let localTrust = 0;
  if (rating >= 4.5 && reviews >= 10) {
    localTrust = 5;
    reasons.push(`Trust 5: ${rating}★ × ${reviews} Reviews — starker Proof`);
  } else if (rating >= 4.0 && reviews >= 5) {
    localTrust = 4;
    reasons.push(`Trust 4: ${rating}★ × ${reviews} Reviews — solider Proof`);
  } else if (rating >= 3.5 && reviews >= 3) {
    localTrust = 3;
    reasons.push(`Trust 3: ${rating}★ × ${reviews} Reviews — etwas Proof`);
  } else if (reviews >= 1) {
    localTrust = 2;
    reasons.push(`Trust 2: ${reviews} Reviews — existiert digital`);
  } else {
    localTrust = 1;
    reasons.push("Trust 1: auf Maps, aber 0 Reviews");
  }

  // ── Digital Gap (0-5) ──
  let digitalGap = 0;
  const BUILDERS = ["wix", "jimdo", "one.com", "digitalone", "squarespace", "weebly", "webnode", "site123"];
  const DIRECTORIES = ["local.ch", "search.ch", "tel.search.ch", "yellow.ch"];
  const websiteLower = website.toLowerCase();

  if (!website) {
    digitalGap = 5;
    reasons.push("Gap 5: keine Website");
  } else if (DIRECTORIES.some((d) => websiteLower.includes(d))) {
    digitalGap = 4;
    reasons.push("Gap 4: nur Verzeichnis-Link");
  } else if (BUILDERS.some((b) => websiteLower.includes(b))) {
    digitalGap = 3;
    reasons.push(`Gap 3: Baukasten-Website`);
  } else {
    digitalGap = 2;
    reasons.push("Gap 2: hat Website (Qualität manuell prüfen)");
  }

  // ── Contactable (0-1) ──
  let contactable = 0;
  if (phone) {
    contactable = 1;
  } else {
    reasons.push("Kein Telefon gefunden");
  }

  // ── Disqualifiers ──
  let penalty = 0;
  const CHAIN_TYPES = ["department_store", "shopping_mall", "supermarket", "bank"];
  if (types.some((t) => CHAIN_TYPES.includes(t))) {
    penalty += 3;
    reasons.push("Disq: Kette/Grossbetrieb");
  }
  // Very high review count suggests larger operation
  if (reviews > 80) {
    penalty += 2;
    reasons.push(`Disq: ${reviews} Reviews — vermutlich Grossbetrieb`);
  }
  // Known enterprise/chain names (not our ICP)
  const nameLower = (place.displayName?.text || "").toLowerCase();
  const ENTERPRISE_NAMES = ["fust", "meier tobler", "coop", "migros", "jumbo", "hornbach", "bauhaus", "sanitas troesch"];
  if (ENTERPRISE_NAMES.some((e) => nameLower.includes(e))) {
    penalty += 5;
    reasons.push("Disq: Enterprise/Kette");
  }

  const score = Math.max(0, Math.min(10, localTrust + digitalGap + contactable - penalty));
  const tier = score >= 7 ? "HOT" : score >= 4 ? "WARM" : "COLD";

  return { score, tier, localTrust, digitalGap, contactable, penalty, reasons };
}

// ── CSV helpers ─────────────────────────────────────────────────────
function csvEscape(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes(";")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const RAW_HEADER = "place_id,firma,ort,adresse,telefon,website,google_rating,google_reviews,maps_url,score,tier,trust,gap,reasons,query,discovered";

function ensureRawCSV() {
  if (!fs.existsSync(RAW_CSV)) {
    fs.writeFileSync(RAW_CSV, RAW_HEADER + "\n");
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
  let apiCalls = 0;

  for (const gem of gemeinden) {
    console.log(`  --- ${gem} ---`);

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

        // Name-based dedupe fallback
        const name = p.displayName?.text || "";
        if (existingNames.has(name.toLowerCase())) continue;

        const address = p.formattedAddress || "";
        const ort = extractOrt(address);
        const phone = p.nationalPhoneNumber || p.internationalPhoneNumber || "";
        const { score, tier, localTrust, digitalGap, contactable, penalty, reasons } = scorePlace(p);

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
          contactable,
          penalty,
          reasons,
          query: textQuery,
        });
      }

      // Small delay to be nice to the API
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Sort by score descending
  const results = [...allResults.values()].sort((a, b) => b.score - a.score);

  // ── Display ─────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(90));
  console.log("  SCOUT RESULTS");
  console.log("=".repeat(90));

  if (results.length === 0) {
    console.log("\n  No new prospects found. All already known or no results.\n");
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
        `          Trust:${r.localTrust} + Gap:${r.digitalGap} + Tel:${r.contactable}` +
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
      csvEscape(r.placeId),
      csvEscape(r.name),
      csvEscape(r.ort),
      csvEscape(r.address),
      csvEscape(r.phone),
      csvEscape(r.website),
      r.rating || "",
      r.reviews || "",
      csvEscape(r.mapsUrl),
      r.score,
      r.tier,
      r.localTrust,
      r.digitalGap,
      csvEscape(r.reasons.join("; ")),
      csvEscape(r.query),
      today,
    ].join(",")
  );

  fs.appendFileSync(RAW_CSV, lines.join("\n") + "\n");
  console.log(`\n  ✅ ${results.length} entries written to scout_raw.csv`);

  // Show next steps for HOT
  if (tiers.HOT.length > 0) {
    console.log(`\n  Next steps for ${tiers.HOT.length} HOT prospects:`);
    console.log("  1. Review scout_raw.csv — confirm ICP fit");
    console.log("  2. Add best ones to pipeline.csv (manual)");
    console.log("  3. Build demo website: node scripts/_ops/prospect_pipeline.mjs --url <url> --slug <slug>");
    console.log("  4. Send email\n");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
