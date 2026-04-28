#!/usr/bin/env node
// bigben_clear_app_data.mjs
//
// Leert alle App-Daten für BigBen Pub Live-Übergabe an Paul (29.04.2026).
// User-Anforderung: Events, Sports, Bookings/Reservations → 0.
//
// Usage:
//   node --env-file=src/web/.env.local scripts/_ops/bigben_clear_app_data.mjs --confirm

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
if (!args.includes("--confirm")) {
  console.error("Pass --confirm to actually delete data. Aborting.");
  process.exit(1);
}

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SLUG = "bigben-pub";

console.log(`\n=== BigBen App-Data Reset (${new Date().toISOString()}) ===\n`);

// 1. Tenant-ID resolven
const { data: tenant, error: tenantErr } = await sb
  .from("tenants")
  .select("id, slug, name")
  .eq("slug", SLUG)
  .single();

if (tenantErr || !tenant) {
  console.error("✗ tenant not found:", SLUG, tenantErr);
  process.exit(2);
}

console.log(`tenant: ${tenant.name} (${tenant.id})`);

// 2. Counts BEFORE
const tablesToClear = ["pub_events", "pub_reservations"];
console.log("\nBefore:");
for (const table of tablesToClear) {
  const { count } = await sb
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenant.id);
  console.log(`  ${table}: ${count} rows`);
}

// 3. Clear
console.log("\nClearing...");
for (const table of tablesToClear) {
  const { error } = await sb.from(table).delete().eq("tenant_id", tenant.id);
  if (error) {
    console.error(`  ✗ ${table} delete error:`, error);
  } else {
    console.log(`  ✓ ${table} cleared`);
  }
}

// 4. Counts AFTER
console.log("\nAfter:");
for (const table of tablesToClear) {
  const { count } = await sb
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenant.id);
  console.log(`  ${table}: ${count} rows`);
}

console.log("\n✓ Done. App-Übergabe-Ready für Paul.");
