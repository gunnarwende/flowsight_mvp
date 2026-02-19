#!/usr/bin/env node
/**
 * Query Supabase for recent cases + print connection info (host only, no secrets).
 * Also re-runs tenant_numbers check.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/print_latest_retell_decisions.mjs
 *   node --env-file=src/web/.env.local scripts/_ops/print_latest_retell_decisions.mjs 720
 *                                                                          ^ minutes (default 720 = 12h)
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
const MINUTES = parseInt(process.argv[2] || "720", 10);

async function query(path) {
  const res = await fetch(`${REST}${path}`, { headers: HEADERS });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

// ── Connection info ─────────────────────────────────────────────────────
const host = new URL(url).host;
console.log("=== Supabase connection ===\n");
console.log(`  Host: ${host}`);
console.log(`  Key:  ${key.slice(0, 10)}...${key.slice(-4)} (service_role)`);

// ── tenant_numbers ──────────────────────────────────────────────────────
console.log("\n=== tenant_numbers (active) ===\n");
const tn = await query("/tenant_numbers?active=eq.true&select=phone_number,tenant_id");
if (tn.status !== 200) {
  console.error("  FAILED:", tn.data);
} else {
  const rows = Array.isArray(tn.data) ? tn.data : [];
  if (rows.length === 0) console.log("  (empty — run seed_tenant_number.mjs)");
  for (const r of rows) console.log(`  ${r.phone_number} -> ${r.tenant_id}`);
}

// ── tenants ─────────────────────────────────────────────────────────────
console.log("\n=== tenants ===\n");
const tenants = await query("/tenants?select=id,slug,name&limit=10");
if (tenants.status !== 200) {
  console.error("  FAILED:", tenants.data);
} else {
  const rows = Array.isArray(tenants.data) ? tenants.data : [];
  if (rows.length === 0) console.log("  (empty)");
  for (const r of rows) console.log(`  ${r.id} | ${r.slug} | ${r.name}`);
}

// ── Recent cases ────────────────────────────────────────────────────────
const since = new Date(Date.now() - MINUTES * 60 * 1000).toISOString();
console.log(`\n=== cases (last ${MINUTES} min, since ${since}) ===\n`);

const cases = await query(
  `/cases?created_at=gte.${encodeURIComponent(since)}&select=id,created_at,tenant_id,source,contact_phone,plz,city,category,urgency,raw_payload&order=created_at.desc&limit=20`
);

if (cases.status !== 200) {
  console.error("  FAILED:", cases.data);
} else {
  const rows = Array.isArray(cases.data) ? cases.data : [];
  console.log(`  Total: ${rows.length}`);
  if (rows.length === 0) {
    console.log("  (none)");
    console.log("\n  If calls were made, check Vercel Function Logs for:");
    console.log('    {"_tag":"retell_webhook","decision":"..."}');
    console.log("  Possible decisions: event_skipped, missing_fields, created, insert_error");
  }
  for (const c of rows) {
    const phone = c.contact_phone ? `${c.contact_phone.slice(0, 6)}...` : "(none)";
    const provider = c.raw_payload?.provider ?? "?";
    const callId = c.raw_payload?.retell_call_id ?? "?";
    console.log(`\n  [${c.created_at}] Case ${c.id}`);
    console.log(`    source=${c.source} provider=${provider} call_id=${callId}`);
    console.log(`    tenant=${c.tenant_id}`);
    console.log(`    phone=${phone} plz=${c.plz} city=${c.city}`);
    console.log(`    category=${c.category} urgency=${c.urgency}`);
  }
}

console.log();
