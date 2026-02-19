#!/usr/bin/env node
/**
 * Query Supabase for recent cases — filterable by source.
 * Zero deps (native fetch + PostgREST).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/print_latest_cases.mjs
 *   node --env-file=src/web/.env.local scripts/_ops/print_latest_cases.mjs wizard
 *   node --env-file=src/web/.env.local scripts/_ops/print_latest_cases.mjs voice 120
 *                                                                          ^source ^minutes (default 60)
 */

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
};

const SOURCE_FILTER = process.argv[2] || null;
const MINUTES = parseInt(process.argv[3] || "60", 10);
const since = new Date(Date.now() - MINUTES * 60 * 1000).toISOString();

let path = `/cases?created_at=gte.${encodeURIComponent(since)}&select=id,created_at,tenant_id,source,category,urgency,plz,city&order=created_at.desc&limit=20`;
if (SOURCE_FILTER) {
  path += `&source=eq.${encodeURIComponent(SOURCE_FILTER)}`;
}

console.log(`=== cases (last ${MINUTES} min, source=${SOURCE_FILTER ?? "all"}) ===\n`);

const res = await fetch(`${REST}${path}`, { headers: HEADERS });
const text = await res.text();
let data;
try { data = JSON.parse(text); } catch { data = text; }

if (res.status !== 200) {
  console.error("  FAILED:", data);
  process.exit(1);
}

const rows = Array.isArray(data) ? data : [];
console.log(`  Total: ${rows.length}\n`);

if (rows.length === 0) {
  console.log("  (none)");
} else {
  for (const c of rows) {
    console.log(`  [${c.created_at}] ${c.id}`);
    console.log(`    source=${c.source} category=${c.category} urgency=${c.urgency}`);
    console.log(`    plz=${c.plz} city=${c.city} tenant=${c.tenant_id}`);
    console.log();
  }
}
