#!/usr/bin/env node
/**
 * market_analysis_v2.mjs — Professional market analysis via search.ch + Zefix + Google + Website crawl.
 *
 * Phase 1: Extract ALL Sanitär/Heizung/Haustechnik/Spenglerei businesses from search.ch
 *          for Kanton Zürich (the authoritative Swiss business directory)
 * Phase 2: Enrich each with Zefix (legal form, founding) + Google Places (rating, reviews)
 * Phase 3: Crawl top 100 websites for team size, services, digital maturity
 * Phase 4: Analysis + Report
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/market_analysis_v2.mjs --phase 1
 *   node --env-file=src/web/.env.local scripts/_ops/market_analysis_v2.mjs --phase 2
 *   node --env-file=src/web/.env.local scripts/_ops/market_analysis_v2.mjs --phase 3
 *   node --env-file=src/web/.env.local scripts/_ops/market_analysis_v2.mjs --phase 4
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const OUT_DIR = join("docs", "gtm", "icp", "market");
const GOOGLE_KEY = process.env.GOOGLE_SCOUT_KEY;

const args = process.argv.slice(2);
const phaseArg = args.includes("--phase") ? args[args.indexOf("--phase") + 1] : "1";

// ── Phase 1: Extract from search.ch ──────────────────────────────────
async function runPhase1() {
  console.log("\n=== PHASE 1: search.ch Extraktion (Kanton Zürich) ===\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    viewport: { width: 1280, height: 900 },
    locale: "de-CH",
  });

  // Search terms covering all relevant trades
  const searches = [
    { query: "Sanitär", region: "Kanton Zürich" },
    { query: "Heizungsinstallation", region: "Kanton Zürich" },
    { query: "Haustechnik", region: "Kanton Zürich" },
    { query: "Spenglerei", region: "Kanton Zürich" },
    { query: "Gebäudetechnik", region: "Kanton Zürich" },
    { query: "Sanitäre Anlagen", region: "Kanton Zürich" },
    { query: "Wärmepumpen Installation", region: "Kanton Zürich" },
  ];

  const allBusinesses = new Map(); // name+address → business

  for (const { query, region } of searches) {
    console.log(`\nSuche: "${query}" in ${region}`);
    let pageNum = 1;
    let hasMore = true;

    while (hasMore) {
      const page = await context.newPage();
      const url = `https://search.ch/tel/?q=${encodeURIComponent(query + " " + region)}&page=${pageNum}`;

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(2000);

        // Extract business listings
        const listings = await page.evaluate(() => {
          const results = [];
          // search.ch uses .tel-result elements
          const items = document.querySelectorAll(".tel-result, [data-entry-id], .vcard");

          for (const item of items) {
            const name = item.querySelector(".tel-result-name, .fn, h2 a, h3 a")?.textContent?.trim() || "";
            const address = item.querySelector(".tel-result-address, .adr, .street-address")?.textContent?.trim() || "";
            const phone = item.querySelector(".tel-result-phone, .tel, [href^='tel:']")?.textContent?.trim() || "";
            const category = item.querySelector(".tel-result-category, .category")?.textContent?.trim() || "";
            const website = item.querySelector("a[href*='http']:not([href*='search.ch'])")?.href || "";

            if (name && name.length > 2) {
              results.push({ name, address, phone, category, website });
            }
          }

          // Also try alternative extraction for different page layouts
          if (results.length === 0) {
            const entries = document.querySelectorAll("[itemtype*='LocalBusiness'], .tel-entry");
            for (const entry of entries) {
              const name = entry.querySelector("[itemprop='name'], .fn")?.textContent?.trim() || "";
              const addr = entry.querySelector("[itemprop='address'], .adr")?.textContent?.trim() || "";
              const tel = entry.querySelector("[itemprop='telephone'], .tel")?.textContent?.trim() || "";
              if (name) results.push({ name, address: addr, phone: tel, category: "", website: "" });
            }
          }

          return results;
        });

        let newCount = 0;
        for (const b of listings) {
          const key = (b.name + "|" + b.address).toLowerCase();
          if (!allBusinesses.has(key)) {
            allBusinesses.set(key, {
              ...b,
              searchQuery: query,
            });
            newCount++;
          }
        }

        console.log(`  Seite ${pageNum}: ${listings.length} Einträge, ${newCount} neu (Total: ${allBusinesses.size})`);

        // Check if there's a next page
        const hasNextPage = await page.evaluate(() => {
          const nextLink = document.querySelector("a.next, .pagination a[rel='next'], a:has(> .fa-angle-right)");
          return !!nextLink;
        });

        hasMore = hasNextPage && listings.length > 0;
        pageNum++;
      } catch (err) {
        console.error(`  Fehler auf Seite ${pageNum}: ${err.message}`);
        hasMore = false;
      }

      await page.close();
      await new Promise((r) => setTimeout(r, 500)); // Rate limiting
    }
  }

  await browser.close();

  const businesses = [...allBusinesses.values()];
  console.log(`\n=== Total: ${businesses.length} unique Betriebe aus search.ch ===\n`);

  // Save Phase 1 output
  const outPath = join(OUT_DIR, "phase1_searchch.json");
  await writeFile(outPath, JSON.stringify(businesses, null, 2), "utf-8");
  console.log(`Saved: ${outPath}`);

  return businesses;
}

// ── Phase 2: Enrich with Zefix + Google ──────────────────────────────
async function runPhase2() {
  console.log("\n=== PHASE 2: Zefix + Google Places Anreicherung ===\n");

  const inputPath = join(OUT_DIR, "phase1_searchch.json");
  if (!existsSync(inputPath)) {
    console.error("Phase 1 output not found. Run --phase 1 first.");
    process.exit(1);
  }

  const businesses = JSON.parse(await readFile(inputPath, "utf-8"));
  console.log(`Businesses to enrich: ${businesses.length}\n`);

  for (let i = 0; i < businesses.length; i++) {
    const b = businesses[i];
    process.stdout.write(`\r  [${i + 1}/${businesses.length}] ${b.name.slice(0, 40).padEnd(40)}`);

    // Zefix lookup
    try {
      const zBody = JSON.stringify({ name: b.name.slice(0, 60), searchType: "exact", maxEntries: 3 });
      const zr = await fetch("https://www.zefix.ch/ZefixREST/api/v1/firm/search.json", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8", Accept: "application/json", Origin: "https://www.zefix.ch", Referer: "https://www.zefix.ch/de/search/entity/welcome" },
        body: zBody,
        signal: AbortSignal.timeout(5000),
      });

      if (zr.ok) {
        const zd = await zr.json();
        if (zd.list?.length > 0) {
          const match = zd.list.find((c) => c.status === "EXISTIEREND") || zd.list[0];
          const FORMS = { 1: "Einzelunternehmen", 2: "Kollektivgesellschaft", 3: "AG", 4: "GmbH", 5: "Genossenschaft", 12: "Zweigniederlassung" };
          b.zefix = {
            name: match.name,
            uid: match.uidFormatted,
            legalFormId: match.legalFormId,
            legalForm: FORMS[match.legalFormId] || `Form ${match.legalFormId}`,
            legalSeat: match.legalSeat,
            status: match.status,
          };
        }
      }
    } catch { /* skip */ }

    // Google Places lookup (if API key available)
    if (GOOGLE_KEY && !b.google) {
      try {
        const city = b.address?.match(/\d{4}\s+(\S+)/)?.[1] || "";
        const gQuery = `${b.name} ${city}`.trim();
        const gr = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Goog-Api-Key": GOOGLE_KEY, "X-Goog-FieldMask": "places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber" },
          body: JSON.stringify({ textQuery: gQuery, languageCode: "de", regionCode: "CH", maxResultCount: 1 }),
          signal: AbortSignal.timeout(5000),
        });

        if (gr.ok) {
          const gd = await gr.json();
          if (gd.places?.length > 0) {
            const p = gd.places[0];
            b.google = {
              rating: p.rating || null,
              reviewCount: p.userRatingCount || 0,
              website: p.websiteUri || b.website || null,
              phone: p.nationalPhoneNumber || b.phone || null,
            };
            // Update website if we didn't have one
            if (!b.website && p.websiteUri) b.website = p.websiteUri;
          }
        }
      } catch { /* skip */ }
    }

    await new Promise((r) => setTimeout(r, 200)); // Rate limiting
  }

  console.log("\n");

  // Stats
  const withZefix = businesses.filter((b) => b.zefix).length;
  const withGoogle = businesses.filter((b) => b.google).length;
  const withWebsite = businesses.filter((b) => b.website || b.google?.website).length;

  console.log(`Zefix match: ${withZefix}/${businesses.length}`);
  console.log(`Google match: ${withGoogle}/${businesses.length}`);
  console.log(`Mit Website: ${withWebsite}/${businesses.length}`);

  const outPath = join(OUT_DIR, "phase2_enriched.json");
  await writeFile(outPath, JSON.stringify(businesses, null, 2), "utf-8");
  console.log(`\nSaved: ${outPath}`);
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  if (phaseArg === "1") await runPhase1();
  else if (phaseArg === "2") await runPhase2();
  else if (phaseArg === "3") console.log("Phase 3 (Website crawl) — wird nach Phase 2 gebaut");
  else if (phaseArg === "4") console.log("Phase 4 (Report) — wird nach Phase 3 gebaut");
  else console.error("Usage: --phase 1|2|3|4");
}

main().catch((err) => { console.error("FATAL:", err); process.exit(1); });
