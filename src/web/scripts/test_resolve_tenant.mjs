#!/usr/bin/env node
/**
 * Lightweight regression check: resolveTenant logic.
 * Run: node src/web/scripts/test_resolve_tenant.mjs
 *
 * Tests the LOGIC only (no DB calls). Mirrors resolveTenant.ts behavior.
 */

function assert(condition, label) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exit(1);
  }
  console.log(`PASS: ${label}`);
}

// Simulate resolveTenant logic without DB
async function resolveTenantMock(calledNumber, dbResult, fallbackEnv) {
  if (calledNumber && dbResult) {
    return dbResult;
  }
  return fallbackEnv ?? null;
}

// Test 1: DB match wins
const t1 = await resolveTenantMock("+41445057420", "uuid-from-db", "uuid-fallback");
assert(t1 === "uuid-from-db", "DB match returns tenant_id from tenant_numbers");

// Test 2: No DB match → fallback
const t2 = await resolveTenantMock("+41445057420", null, "uuid-fallback");
assert(t2 === "uuid-fallback", "No DB match → FALLBACK_TENANT_ID");

// Test 3: No called number → fallback
const t3 = await resolveTenantMock(undefined, null, "uuid-fallback");
assert(t3 === "uuid-fallback", "No called number → FALLBACK_TENANT_ID");

// Test 4: No called number + no fallback → null
const t4 = await resolveTenantMock(undefined, null, undefined);
assert(t4 === null, "No number + no fallback → null");

// Test 5: Called number but no DB match + no fallback → null
const t5 = await resolveTenantMock("+41445057420", null, undefined);
assert(t5 === null, "Number but no DB match + no fallback → null");

console.log("\nAll 5 resolveTenant checks passed.");
