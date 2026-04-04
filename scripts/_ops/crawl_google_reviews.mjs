#!/usr/bin/env node
/**
 * crawl_google_reviews.mjs — Weekly Google review crawl for all active tenants.
 *
 * Fetches rating + review count from Google Places API (New) and updates
 * tenant modules in Supabase. Designed for GH Actions cron (Monday 06:00).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/crawl_google_reviews.mjs
 *   node --env-file=src/web/.env.local scripts/_ops/crawl_google_reviews.mjs --dry-run
 *
 * Env: GOOGLE_SCOUT_KEY (or GOOGLE_PLACES_API_KEY), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Cost: ~$0.017 per request (Place Details). 50 tenants = $0.85/week = ~$3.50/month.
 */
import { createRequire } from "node:module";
import { sendEmail } from "./_lib/send_email.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

// ── Env ─────────────────────────────────────────────────────────────
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_SCOUT_KEY || "";
const dryRun = process.argv.includes("--dry-run");

if (!apiKey) {
  console.error("Missing GOOGLE_PLACES_API_KEY or GOOGLE_SCOUT_KEY");
  process.exit(1);
}

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Google Places API (New) ─────────────────────────────────────────

async function findPlaceId(businessName, city) {
  const query = `${businessName} ${city}`;
  const res = await fetch(
    `https://places.googleapis.com/v1/places:searchText`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({ textQuery: query, languageCode: "de" }),
    }
  );
  if (!res.ok) {
    console.error(`  Search failed (${res.status}):`, await res.text().catch(() => ""));
    return null;
  }
  const data = await res.json();
  return data.places?.[0] ?? null;
}

async function getPlaceDetails(placeId) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews",
      },
    }
  );
  if (!res.ok) return null;
  return await res.json();
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║  Google Review Crawl                 ║");
  console.log("╚══════════════════════════════════════╝\n");

  // Get all active tenants (converted + trial_active + interested)
  const { data: tenants } = await sb
    .from("tenants")
    .select("id, slug, name, modules")
    .neq("slug", "default")
    .not("trial_status", "in", '("offboarded","parked")');

  if (!tenants?.length) {
    console.log("No active tenants found.");
    return;
  }

  console.log(`Found ${tenants.length} active tenants.\n`);

  const results = [];

  for (const tenant of tenants) {
    const modules = (tenant.modules || {});
    const city = modules.city || "Zürich"; // fallback
    console.log(`── ${tenant.name} (${tenant.slug}) ──`);

    // Search for the business on Google
    const place = await findPlaceId(tenant.name, city);

    if (!place) {
      console.log("  ❌ Not found on Google Places\n");
      results.push({ name: tenant.name, status: "not_found" });
      continue;
    }

    const rating = place.rating ?? null;
    const reviewCount = place.userRatingCount ?? 0;
    const placeName = place.displayName?.text ?? "?";

    console.log(`  Found: "${placeName}"`);
    console.log(`  Rating: ${rating ?? "–"}★ (${reviewCount} reviews)`);

    // Get latest reviews (top 5)
    let latestReviews = [];
    if (place.id) {
      const details = await getPlaceDetails(place.id);
      if (details?.reviews) {
        latestReviews = details.reviews.slice(0, 5).map((r) => ({
          author: r.authorAttribution?.displayName ?? "Anonym",
          rating: r.rating,
          text: r.text?.text?.slice(0, 200) ?? "",
          time: r.relativePublishTimeDescription ?? "",
        }));
        console.log(`  Latest reviews: ${latestReviews.length}`);
      }
    }

    // Update tenant modules in DB
    const oldRating = modules.google_review_avg;
    const oldCount = modules.google_review_count;

    if (!dryRun && rating !== null) {
      const updatedModules = {
        ...modules,
        google_review_avg: rating,
        google_review_count: reviewCount,
        google_place_id: place.id,
        google_latest_reviews: latestReviews,
        google_crawled_at: new Date().toISOString(),
      };
      await sb.from("tenants").update({ modules: updatedModules }).eq("id", tenant.id);
      console.log(`  ✅ DB updated: ${oldRating ?? "–"} → ${rating}★, ${oldCount ?? "–"} → ${reviewCount} reviews`);
    } else if (dryRun) {
      console.log(`  DRY RUN — would update: ${rating}★, ${reviewCount} reviews`);
    }

    results.push({
      name: tenant.name,
      status: "ok",
      rating,
      reviewCount,
      oldRating,
      changed: oldRating !== rating,
    });

    console.log();

    // Rate limit: 100ms between requests
    await new Promise((r) => setTimeout(r, 100));
  }

  // Summary
  console.log("═══════════════════════════════════════");
  console.log("SUMMARY:");
  const ok = results.filter((r) => r.status === "ok");
  const notFound = results.filter((r) => r.status === "not_found");
  const changed = ok.filter((r) => r.changed);
  console.log(`  Crawled: ${ok.length}`);
  console.log(`  Not found: ${notFound.length}`);
  console.log(`  Rating changed: ${changed.length}`);
  if (changed.length > 0) {
    for (const c of changed) {
      console.log(`    ${c.name}: ${c.oldRating ?? "–"} → ${c.rating}★`);
    }
  }
  console.log("═══════════════════════════════════════");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
