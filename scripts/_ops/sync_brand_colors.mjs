#!/usr/bin/env node
/**
 * Sync brand colors from CustomerSite configs into tenant DB (modules.primary_color).
 *
 * This ensures the Leitsystem calendar, buttons, and accents use the correct tenant color.
 * Run once after onboarding, or whenever colors change.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/sync_brand_colors.mjs [--dry-run]
 */

const BRAND_COLORS = {
  "weinberger-ag": "#004994",
  "doerfler-ag": "#2b6cb0",
  "walter-leuthold": "#203784",
  "orlandini": "#1a5276",
  "widmer-sanitaer": "#1a4b8c",
  "brunner-haustechnik": "#0d7377",
};

const dryRun = process.argv.includes("--dry-run");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.");
  process.exit(1);
}

const REST = `${url}/rest/v1`;
const HEADERS = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

console.log("\n🎨 Sync Brand Colors → DB\n");

for (const [slug, color] of Object.entries(BRAND_COLORS)) {
  // Fetch tenant
  const res = await fetch(`${REST}/tenants?slug=eq.${slug}&select=id,name,slug,modules`, {
    headers: HEADERS,
  });
  const tenants = await res.json();

  if (!tenants?.length) {
    console.log(`  ⏭  ${slug} — not found in DB, skipping`);
    continue;
  }

  const tenant = tenants[0];
  const modules = tenant.modules ?? {};

  if (modules.primary_color === color) {
    console.log(`  ✅ ${slug} — already ${color}`);
    continue;
  }

  const oldColor = modules.primary_color ?? "(not set)";

  if (dryRun) {
    console.log(`  🔍 ${slug} — would set ${oldColor} → ${color}`);
    continue;
  }

  // Update modules.primary_color
  const updated = { ...modules, primary_color: color };
  const patchRes = await fetch(`${REST}/tenants?id=eq.${tenant.id}`, {
    method: "PATCH",
    headers: HEADERS,
    body: JSON.stringify({ modules: updated }),
  });

  if (patchRes.ok) {
    console.log(`  ✅ ${slug} — ${oldColor} → ${color}`);
  } else {
    const err = await patchRes.text();
    console.error(`  ❌ ${slug} — FAILED: ${err}`);
  }
}

console.log("\nDone.\n");
