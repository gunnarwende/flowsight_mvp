#!/usr/bin/env node
/**
 * Seed tenant_numbers: map inbound phone numbers → tenant.
 *
 * Idempotent (ON CONFLICT via PostgREST upsert header).
 * Zero npm dependencies — uses native fetch against Supabase REST API.
 * Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from env.
 *
 * Usage (PowerShell, from repo root):
 *   node --env-file=src/web/.env.local scripts/_ops/seed_tenant_number.mjs
 */

// ── Config ──────────────────────────────────────────────────────────────
const TENANT_ID = "48cae49e-ec12-4ce4-b5f7-c058de87c93e";

const NUMBERS = [
  { phone: "+41445057420", label: "Twilio original (legacy direct)" },
  { phone: "+41445053019", label: "Twilio Entry (Peoplefone forward target)" },
  { phone: "+41445520919", label: "Peoplefone brand (front door)" },
];

// ── Env ─────────────────────────────────────────────────────────────────
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.");
  console.error(
    "Run with: node --env-file=src/web/.env.local scripts/_ops/seed_tenant_number.mjs"
  );
  process.exit(1);
}

const REST = `${url}/rest/v1`;
const HEADERS = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

// ── Helper ──────────────────────────────────────────────────────────────
async function query(path, opts = {}) {
  const res = await fetch(`${REST}${path}`, { ...opts, headers: { ...HEADERS, ...opts.headers } });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

// ── Step 1: Schema introspection ────────────────────────────────────────
console.log("=== tenant_numbers schema (columns) ===\n");

const schemaRes = await fetch(`${REST}/tenant_numbers?select=*&limit=0`, {
  headers: { ...HEADERS, Prefer: "count=exact" },
});
const count = schemaRes.headers.get("content-range");
const schemaOk = schemaRes.status >= 200 && schemaRes.status < 300;
console.log(`  Table accessible: ${schemaOk ? "YES" : "NO"} (HTTP ${schemaRes.status})`);
console.log(`  Current rows:     ${count ?? "unknown"}`);

// ── Step 2: Upsert all numbers ──────────────────────────────────────────
console.log("\n=== Seeding tenant_numbers ===\n");

for (const { phone, label } of NUMBERS) {
  console.log(`  ${phone} (${label})`);
  console.log(`  → tenant_id: ${TENANT_ID}`);

  const upsert = await query("/tenant_numbers?on_conflict=phone_number", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      phone_number: phone,
      tenant_id: TENANT_ID,
      active: true,
    }),
  });

  if (upsert.status !== 200 && upsert.status !== 201) {
    console.error(`\n  Upsert FAILED for ${phone} (HTTP ${upsert.status}):`, upsert.data);
    process.exit(1);
  }

  const row = Array.isArray(upsert.data) ? upsert.data[0] : upsert.data;
  console.log(`  Upsert OK (id: ${row.id}, active: ${row.active})\n`);
}

// ── Step 3: Verify ──────────────────────────────────────────────────────
console.log("=== Verification: all active tenant_numbers ===\n");

const verify = await query("/tenant_numbers?active=eq.true&select=phone_number,tenant_id,active&order=created_at");

if (verify.status !== 200) {
  console.error("Verify FAILED:", verify.data);
  process.exit(1);
}

const rows = Array.isArray(verify.data) ? verify.data : [];
console.log(`  Active rows: ${rows.length}`);
for (const r of rows) {
  console.log(`  ${r.phone_number} → tenant ${r.tenant_id} (active=${r.active})`);
}

// ── Step 4: Smoke-test resolveTenant logic ──────────────────────────────
console.log("\n=== Smoke: resolve both numbers ===\n");

let allPass = true;
for (const { phone, label } of NUMBERS) {
  const resolve = await query(
    `/tenant_numbers?phone_number=eq.${encodeURIComponent(phone)}&active=eq.true&select=tenant_id&limit=1`
  );

  if (resolve.status !== 200 || !Array.isArray(resolve.data) || resolve.data.length === 0) {
    console.error(`  ${phone} (${label}): FAILED`, resolve.data);
    allPass = false;
    continue;
  }

  const resolvedId = resolve.data[0].tenant_id;
  const match = resolvedId === TENANT_ID;
  console.log(`  ${phone} (${label}): ${match ? "PASS" : "FAIL"} → ${resolvedId}`);
  if (!match) allPass = false;
}

if (!allPass) {
  console.error("\nSome checks FAILED.");
  process.exit(1);
}

console.log("\n=== DONE — all tenant_numbers seeded and verified ===\n");
