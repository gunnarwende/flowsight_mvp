#!/usr/bin/env node
/**
 * market_scan.mjs — Scan Swiss plumbing/heating businesses via Google Places API.
 *
 * Searches multiple municipalities in Kanton Zürich for Sanitär/Heizung businesses.
 * Collects: name, address, rating, review count, phone, website, types.
 * Outputs: docs/gtm/icp/market/scan_raw.json + scan_summary.md
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/market_scan.mjs
 *
 * Env: GOOGLE_SCOUT_KEY
 */

const API_KEY = process.env.GOOGLE_SCOUT_KEY;
if (!API_KEY) {
  console.error("Missing GOOGLE_SCOUT_KEY in env");
  process.exit(1);
}

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join("docs", "gtm", "icp", "market");

// ── Municipalities to scan (Kanton Zürich + Umgebung) ─────────────────
const QUERIES = [
  // Linkes Zürichseeufer (Kerngebiet)
  "Sanitär Heizung Thalwil",
  "Sanitär Heizung Oberrieden",
  "Sanitär Heizung Horgen",
  "Sanitär Heizung Kilchberg ZH",
  "Sanitär Heizung Rüschlikon",
  "Sanitär Heizung Adliswil",
  "Sanitär Heizung Langnau am Albis",
  "Sanitär Heizung Wädenswil",
  "Sanitär Heizung Richterswil",
  "Sanitär Heizung Au ZH",
  // Stadt Zürich + Agglomeration
  "Sanitär Heizung Zürich",
  "Sanitärinstallateur Zürich",
  "Heizungsinstallateur Zürich",
  "Sanitär Heizung Winterthur",
  "Sanitär Heizung Uster",
  "Sanitär Heizung Dübendorf",
  "Sanitär Heizung Dietikon",
  "Sanitär Heizung Wetzikon",
  "Sanitär Heizung Bülach",
  "Sanitär Heizung Kloten",
  // Rechtes Zürichseeufer
  "Sanitär Heizung Meilen",
  "Sanitär Heizung Küsnacht ZH",
  "Sanitär Heizung Zollikon",
  "Sanitär Heizung Stäfa",
  "Sanitär Heizung Männedorf",
  // Knonaueramt / Limmattal
  "Sanitär Heizung Affoltern am Albis",
  "Sanitär Heizung Birmensdorf",
  "Sanitär Heizung Schlieren",
  // Weitere Gewerke (Breite)
  "Spenglerei Sanitär Zürich",
  "Gebäudetechnik Zürich",
  "Haustechnik Zürich",
  "Heizung Wärmepumpe Zürich",
  "Sanitär Notdienst Zürich",
];

// ── Google Places API (New) ──────────────────────────────────────────
async function searchPlaces(query) {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": [
        "places.displayName",
        "places.formattedAddress",
        "places.rating",
        "places.userRatingCount",
        "places.websiteUri",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.types",
        "places.businessStatus",
        "places.id",
        "places.googleMapsUri",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "de",
      regionCode: "CH",
      maxResultCount: 20,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`  API Error ${response.status}: ${text.slice(0, 200)}`);
    return [];
  }

  const data = await response.json();
  return data.places || [];
}

// ── Dedup by place ID ────────────────────────────────────────────────
const allPlaces = new Map(); // placeId → place data

async function main() {
  console.log("=== Market Scan: Kanton Zürich Sanitär/Heizung ===\n");
  console.log(`Queries: ${QUERIES.length}`);
  console.log(`API Key: ${API_KEY.slice(0, 10)}...\n`);

  for (let i = 0; i < QUERIES.length; i++) {
    const query = QUERIES[i];
    console.log(`[${i + 1}/${QUERIES.length}] "${query}"`);

    try {
      const places = await searchPlaces(query);
      let newCount = 0;

      for (const p of places) {
        const id = p.id;
        if (!id || allPlaces.has(id)) continue;

        // Filter: only CH addresses, only operational businesses
        const addr = p.formattedAddress || "";
        if (!addr.includes("Schweiz") && !addr.includes("Switzerland") && !addr.match(/\b\d{4}\b/)) continue;
        if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue;

        allPlaces.set(id, {
          id,
          name: p.displayName?.text || "",
          address: addr,
          rating: p.rating || null,
          reviewCount: p.userRatingCount || 0,
          website: p.websiteUri || null,
          phone: p.internationalPhoneNumber || p.nationalPhoneNumber || null,
          types: p.types || [],
          mapsUrl: p.googleMapsUri || null,
        });
        newCount++;
      }

      console.log(`  → ${places.length} results, ${newCount} new (total: ${allPlaces.size})`);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }

    // Rate limiting: 200ms between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  // ── Convert to array and sort ──
  const businesses = [...allPlaces.values()].sort((a, b) => {
    // Sort by review count descending (proxy for business size)
    return (b.reviewCount || 0) - (a.reviewCount || 0);
  });

  console.log(`\n=== TOTAL: ${businesses.length} unique businesses ===\n`);

  // ── Analyze ──
  const withWebsite = businesses.filter((b) => b.website);
  const withRating = businesses.filter((b) => b.rating);
  const highRated = businesses.filter((b) => b.rating >= 4.5);
  const manyReviews = businesses.filter((b) => b.reviewCount >= 20);
  const fewReviews = businesses.filter((b) => b.reviewCount > 0 && b.reviewCount < 10);
  const noReviews = businesses.filter((b) => !b.reviewCount || b.reviewCount === 0);

  // Size estimation based on review count (proxy)
  const sizeBuckets = {
    "Solo/Micro (0-5 Reviews)": businesses.filter((b) => b.reviewCount <= 5),
    "Klein (6-20 Reviews)": businesses.filter((b) => b.reviewCount > 5 && b.reviewCount <= 20),
    "Mittel (21-50 Reviews)": businesses.filter((b) => b.reviewCount > 20 && b.reviewCount <= 50),
    "Gross (51-100 Reviews)": businesses.filter((b) => b.reviewCount > 50 && b.reviewCount <= 100),
    "Sehr Gross (100+ Reviews)": businesses.filter((b) => b.reviewCount > 100),
  };

  // Rating distribution
  const ratingBuckets = {
    "5.0★": businesses.filter((b) => b.rating === 5.0),
    "4.5-4.9★": businesses.filter((b) => b.rating >= 4.5 && b.rating < 5.0),
    "4.0-4.4★": businesses.filter((b) => b.rating >= 4.0 && b.rating < 4.5),
    "3.0-3.9★": businesses.filter((b) => b.rating >= 3.0 && b.rating < 4.0),
    "<3.0★ oder keine": businesses.filter((b) => !b.rating || b.rating < 3.0),
  };

  // Extract PLZ from address
  const plzCounts = {};
  for (const b of businesses) {
    const plzMatch = b.address.match(/\b(\d{4})\b/);
    if (plzMatch) {
      const plz = plzMatch[1];
      plzCounts[plz] = (plzCounts[plz] || 0) + 1;
    }
  }
  const topPLZ = Object.entries(plzCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // ── Save raw JSON ──
  const rawPath = join(OUT_DIR, "scan_raw.json");
  await writeFile(rawPath, JSON.stringify(businesses, null, 2), "utf-8");
  console.log(`Saved: ${rawPath}`);

  // ── Generate summary markdown ──
  let md = `# Marktanalyse — Sanitär/Heizung Kanton Zürich\n\n`;
  md += `**Datum:** ${new Date().toISOString().slice(0, 10)}\n`;
  md += `**Quelle:** Google Places API (${QUERIES.length} Suchbegriffe)\n`;
  md += `**Total:** ${businesses.length} unique Betriebe\n\n`;

  md += `## Übersicht\n\n`;
  md += `| Metrik | Anzahl | Anteil |\n|--------|--------|--------|\n`;
  md += `| Total Betriebe | ${businesses.length} | 100% |\n`;
  md += `| Mit Website | ${withWebsite.length} | ${pct(withWebsite.length, businesses.length)} |\n`;
  md += `| Mit Bewertungen | ${withRating.length} | ${pct(withRating.length, businesses.length)} |\n`;
  md += `| ≥4.5 Sterne | ${highRated.length} | ${pct(highRated.length, businesses.length)} |\n`;
  md += `| ≥20 Bewertungen | ${manyReviews.length} | ${pct(manyReviews.length, businesses.length)} |\n`;
  md += `| 1-9 Bewertungen | ${fewReviews.length} | ${pct(fewReviews.length, businesses.length)} |\n`;
  md += `| Keine Bewertungen | ${noReviews.length} | ${pct(noReviews.length, businesses.length)} |\n`;

  md += `\n## Grössenverteilung (Proxy: Bewertungsanzahl)\n\n`;
  md += `| Segment | Anzahl | Anteil | Ø Rating | ICP-Relevanz |\n|---------|--------|--------|----------|-------------|\n`;
  for (const [label, list] of Object.entries(sizeBuckets)) {
    const avgRating = list.length > 0
      ? (list.filter((b) => b.rating).reduce((s, b) => s + b.rating, 0) / list.filter((b) => b.rating).length).toFixed(1)
      : "-";
    md += `| ${label} | ${list.length} | ${pct(list.length, businesses.length)} | ${avgRating} | |\n`;
  }

  md += `\n## Rating-Verteilung\n\n`;
  md += `| Rating | Anzahl | Anteil |\n|--------|--------|--------|\n`;
  for (const [label, list] of Object.entries(ratingBuckets)) {
    md += `| ${label} | ${list.length} | ${pct(list.length, businesses.length)} |\n`;
  }

  md += `\n## Geographische Verteilung (Top 20 PLZ)\n\n`;
  md += `| PLZ | Betriebe |\n|-----|----------|\n`;
  for (const [plz, count] of topPLZ) {
    md += `| ${plz} | ${count} |\n`;
  }

  md += `\n## Top 30 Betriebe (nach Bewertungsanzahl)\n\n`;
  md += `| # | Betrieb | Ort | ★ | Reviews | Website | Telefon |\n`;
  md += `|---|---------|-----|---|---------|---------|--------|\n`;
  for (let i = 0; i < Math.min(30, businesses.length); i++) {
    const b = businesses[i];
    const city = b.address.split(",").slice(-2, -1)[0]?.trim() || b.address;
    const web = b.website ? "✅" : "❌";
    md += `| ${i + 1} | ${b.name} | ${city} | ${b.rating || "-"} | ${b.reviewCount} | ${web} | ${b.phone || "-"} |\n`;
  }

  md += `\n## Betriebe OHNE Website (potenzielle Leads)\n\n`;
  const noWeb = businesses.filter((b) => !b.website && b.reviewCount > 0);
  md += `| # | Betrieb | Ort | ★ | Reviews | Telefon |\n`;
  md += `|---|---------|-----|---|---------|--------|\n`;
  for (let i = 0; i < Math.min(20, noWeb.length); i++) {
    const b = noWeb[i];
    const city = b.address.split(",").slice(-2, -1)[0]?.trim() || b.address;
    md += `| ${i + 1} | ${b.name} | ${city} | ${b.rating || "-"} | ${b.reviewCount} | ${b.phone || "-"} |\n`;
  }

  md += `\n## Rohdaten\n\nSiehe: [scan_raw.json](scan_raw.json) (${businesses.length} Betriebe)\n`;

  const mdPath = join(OUT_DIR, "scan_summary.md");
  await writeFile(mdPath, md, "utf-8");
  console.log(`Saved: ${mdPath}`);

  // ── Console summary ──
  console.log("\n--- QUICK STATS ---");
  console.log(`Total: ${businesses.length}`);
  console.log(`Mit Website: ${withWebsite.length} (${pct(withWebsite.length, businesses.length)})`);
  console.log(`≥4.5★: ${highRated.length}`);
  console.log(`≥20 Reviews: ${manyReviews.length}`);
  for (const [label, list] of Object.entries(sizeBuckets)) {
    console.log(`  ${label}: ${list.length}`);
  }
  console.log("===================\n");
}

function pct(n, total) {
  return total > 0 ? `${Math.round((n / total) * 100)}%` : "0%";
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
