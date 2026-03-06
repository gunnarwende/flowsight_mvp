#!/usr/bin/env node
/**
 * scout.mjs — Google Places Prospect Finder for FlowSight
 *
 * Searches Google Maps for businesses matching a query + location,
 * scores them for FlowSight relevance, and appends to pipeline.csv.
 *
 * Usage:
 *   node scripts/_ops/scout.mjs --query "Sanitär Heizung" --location "Adliswil, Zürich"
 *   node scripts/_ops/scout.mjs --query "Sanitär" --location "47.2727,8.5835" --radius 5000
 *   node scripts/_ops/scout.mjs --query "Sanitär Heizung" --location "Thalwil" --dry-run
 *
 * Requires: GOOGLE_PLACES_API_KEY env var (or --api-key flag)
 * Google Cloud: Enable "Places API (New)" — $200/month free credit covers ~1000 searches
 *
 * Scoring (0-10):
 *   +3  no website or very basic website
 *   +2  few Google reviews (< 10)
 *   +2  high Google rating (>= 4.0) with reviews (happy customers = upsell potential)
 *   +1  low rating (< 4.0) = pain = opportunity
 *   +1  has phone number (contactable)
 *   +1  small business signals (no chain/franchise indicators)
 *   -5  already in pipeline.csv (skip duplicates)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PIPELINE_CSV = path.resolve(__dirname, "../../docs/sales/pipeline.csv");

// ── Args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}
const dryRun = args.includes("--dry-run");
const query = getArg("query") || "Sanitär Heizung";
const location = getArg("location") || "Zürichsee";
const radius = getArg("radius") || "8000";
const apiKey = getArg("api-key") || process.env.GOOGLE_PLACES_API_KEY || "";

if (!apiKey) {
  console.error(`
╔══════════════════════════════════════════════════════════════╗
║  GOOGLE_PLACES_API_KEY not set.                              ║
║                                                              ║
║  Setup (5 min):                                              ║
║  1. Go to console.cloud.google.com                           ║
║  2. Create project "FlowSight Scout"                         ║
║  3. Enable "Places API (New)"                                ║
║  4. Create API Key (restrict to Places API)                  ║
║  5. Set: export GOOGLE_PLACES_API_KEY=AIza...                ║
║                                                              ║
║  Free tier: $200/month = ~1000 searches. More than enough.   ║
╚══════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

// ── Load existing pipeline to skip duplicates ───────────────────────
function loadExistingFirms() {
  if (!fs.existsSync(PIPELINE_CSV)) return new Set();
  const csv = fs.readFileSync(PIPELINE_CSV, "utf-8");
  const lines = csv.split("\n").slice(1); // skip header
  const firms = new Set();
  for (const line of lines) {
    const name = line.split(",")[0]?.trim().toLowerCase();
    if (name) firms.add(name);
  }
  return firms;
}

// ── Google Places Text Search ───────────────────────────────────────
async function searchPlaces(textQuery, locationBias) {
  // Use Places API (New) — Text Search
  const url = "https://places.googleapis.com/v1/places:searchText";

  const body = {
    textQuery: `${textQuery} in ${locationBias}`,
    languageCode: "de",
    regionCode: "CH",
    maxResultCount: 20,
  };

  // If location looks like coordinates, add locationBias
  const coordMatch = locationBias.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    body.locationBias = {
      circle: {
        center: { latitude: parseFloat(coordMatch[1]), longitude: parseFloat(coordMatch[2]) },
        radius: parseFloat(radius),
      },
    };
    body.textQuery = textQuery;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
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
    console.error(`Google API error (${res.status}):`, err);
    process.exit(1);
  }

  const data = await res.json();
  return data.places || [];
}

// ── Score a place ───────────────────────────────────────────────────
function scorePlaceForFlowSight(place) {
  let score = 0;
  const pros = [];
  const cons = [];

  const website = place.websiteUri || "";
  const rating = place.rating || 0;
  const reviews = place.userRatingCount || 0;
  const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || "";

  // No or basic website = big opportunity
  if (!website) {
    score += 3;
    pros.push("Keine Website");
  } else if (website.includes("digitalone") || website.includes("wix") || website.includes("jimdo") || website.includes("one.com")) {
    score += 2;
    pros.push("Baukasten-Website");
  }

  // Few reviews = not yet tapping digital potential
  if (reviews > 0 && reviews < 10) {
    score += 2;
    pros.push(`Nur ${reviews} GR`);
  } else if (reviews >= 10 && reviews < 30) {
    score += 1;
    pros.push(`${reviews} GR`);
  } else if (reviews >= 30) {
    cons.push(`${reviews} GR (gut aufgestellt)`);
  }

  // High rating with reviews = happy customers, upsell potential
  if (rating >= 4.0 && reviews >= 3) {
    score += 2;
    pros.push(`${rating} Sterne`);
  } else if (rating > 0 && rating < 4.0) {
    score += 1;
    pros.push(`${rating} Sterne (Verbesserungspotential)`);
  }

  // Has phone = contactable
  if (phone) {
    score += 1;
  } else {
    cons.push("Kein Telefon");
  }

  // Strong website = less need
  if (website && !website.includes("digitalone") && !website.includes("wix") && !website.includes("jimdo")) {
    // Check if it's a real company site (not a directory)
    if (!website.includes("local.ch") && !website.includes("search.ch")) {
      cons.push("Hat Website");
    }
  }

  return { score: Math.min(score, 10), pros, cons };
}

// ── CSV escape ──────────────────────────────────────────────────────
function csvEscape(val) {
  const s = String(val || "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔍 Searching: "${query}" in ${location} (radius ${radius}m)\n`);

  const places = await searchPlaces(query, location);
  console.log(`Found ${places.length} results from Google Places.\n`);

  if (places.length === 0) {
    console.log("No results. Try a broader search query or different location.");
    return;
  }

  const existing = loadExistingFirms();
  const results = [];

  for (const p of places) {
    const name = p.displayName?.text || "Unknown";
    const address = p.formattedAddress || "";
    const ort = address.split(",").slice(-2, -1)[0]?.trim() || "";

    // Skip if already in pipeline
    if (existing.has(name.toLowerCase())) {
      console.log(`  ⏭  ${name} — already in pipeline`);
      continue;
    }

    const { score, pros, cons } = scorePlaceForFlowSight(p);

    results.push({
      name,
      ort,
      website: p.websiteUri || "",
      rating: p.rating || 0,
      reviews: p.userRatingCount || 0,
      phone: p.nationalPhoneNumber || p.internationalPhoneNumber || "",
      score,
      pros: pros.join("; "),
      cons: cons.join("; "),
      mapsUrl: p.googleMapsUri || "",
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Display results
  console.log("─".repeat(80));
  console.log("  Score │ Firma                              │ Ort           │ ★    │ GR  │ Website");
  console.log("─".repeat(80));

  for (const r of results) {
    const websiteShort = r.website ? "✓" : "✗";
    const scoreColor = r.score >= 5 ? "🟢" : r.score >= 3 ? "🟡" : "⚪";
    console.log(
      `  ${scoreColor} ${String(r.score).padStart(2)}  │ ${r.name.padEnd(35).slice(0, 35)}│ ${r.ort.padEnd(14).slice(0, 14)}│ ${String(r.rating || "-").padStart(4)} │ ${String(r.reviews).padStart(3)} │ ${websiteShort}`
    );
    if (r.pros) console.log(`        │   ✅ ${r.pros}`);
    if (r.cons) console.log(`        │   ❌ ${r.cons}`);
  }

  console.log("─".repeat(80));

  const hot = results.filter((r) => r.score >= 4);
  const warm = results.filter((r) => r.score >= 2 && r.score < 4);
  console.log(`\n📊 ${results.length} results: ${hot.length} hot (≥4), ${warm.length} warm (2-3), ${results.length - hot.length - warm.length} cold (<2)\n`);

  if (dryRun) {
    console.log("🏁 Dry run — not writing to pipeline.csv\n");
    return;
  }

  // Append to pipeline.csv
  const newLines = results.map((r) =>
    [
      csvEscape(r.name),
      csvEscape(r.ort),
      csvEscape(r.website),
      r.rating || "",
      r.reviews || "",
      r.score,
      csvEscape(r.pros),
      csvEscape(r.cons),
      r.score >= 4 ? "OFFEN" : "SKIP",
      "", // email_gesendet
      "", // demo_url
      csvEscape(r.phone ? `Tel: ${r.phone}` : ""),
    ].join(",")
  );

  fs.appendFileSync(PIPELINE_CSV, "\n" + newLines.join("\n"));
  console.log(`✅ ${results.length} entries appended to pipeline.csv\n`);
  console.log(`Next steps for hot prospects (score ≥ 4):`);
  console.log(`  1. Review pipeline.csv — confirm relevance`);
  console.log(`  2. Run: node scripts/_ops/prospect_pipeline.mjs --url <website> --slug <slug>`);
  console.log(`  3. Send email with demo link\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
