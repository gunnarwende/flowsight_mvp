#!/usr/bin/env node
/**
 * Verify the voice pipeline end-to-end (zero npm deps).
 *
 * Checks:
 *   1. tenant_numbers mapping exists for +41445057420
 *   2. cases created in last N minutes (default 60)
 *   3. Production webhook is live (GET healthcheck + POST sig-check)
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/verify_voice_pipeline.mjs
 *   node --env-file=src/web/.env.local scripts/_ops/verify_voice_pipeline.mjs 30
 *                                                                      ^ minutes
 */

// ── Env ─────────────────────────────────────────────────────────────────
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
const PROD_WEBHOOK = "https://flowsight-mvp.vercel.app/api/retell/webhook";
const MINUTES = parseInt(process.argv[2] || "60", 10);

async function query(path) {
  const res = await fetch(`${REST}${path}`, { headers: HEADERS });
  const data = await res.json();
  return { status: res.status, data };
}

let exitCode = 0;

// ── 1. tenant_numbers ───────────────────────────────────────────────────
console.log("=== 1. tenant_numbers mapping ===\n");

const tn = await query("/tenant_numbers?active=eq.true&select=phone_number,tenant_id,active");
if (tn.status !== 200) {
  console.error("  Query FAILED:", tn.data);
  exitCode = 1;
} else {
  const rows = Array.isArray(tn.data) ? tn.data : [];
  console.log(`  Active rows: ${rows.length}`);
  for (const r of rows) {
    console.log(`  ${r.phone_number} -> ${r.tenant_id}`);
  }
  if (rows.length === 0) {
    console.log("  WARNING: No tenant_numbers rows. Run seed_tenant_number.mjs first.");
    exitCode = 1;
  }
}

// ── 2. Recent cases ─────────────────────────────────────────────────────
console.log(`\n=== 2. Cases created in last ${MINUTES} min ===\n`);

const since = new Date(Date.now() - MINUTES * 60 * 1000).toISOString();
const cases = await query(
  `/cases?created_at=gte.${encodeURIComponent(since)}&select=id,created_at,tenant_id,source,contact_phone,plz,city,category,urgency&order=created_at.desc&limit=20`
);

if (cases.status !== 200) {
  console.error("  Query FAILED:", cases.data);
  exitCode = 1;
} else {
  const rows = Array.isArray(cases.data) ? cases.data : [];
  console.log(`  Cases found: ${rows.length}`);
  if (rows.length === 0) {
    console.log("  (none) — If calls were made, check Vercel logs for decision=missing_fields");
  }
  for (const c of rows) {
    console.log(`\n  Case ${c.id}:`);
    console.log(`    created_at: ${c.created_at}`);
    console.log(`    source:     ${c.source}`);
    console.log(`    tenant_id:  ${c.tenant_id}`);
    console.log(`    phone:      ${c.contact_phone?.slice(0, 6)}...`); // mask PII
    console.log(`    plz/city:   ${c.plz} ${c.city}`);
    console.log(`    category:   ${c.category}`);
    console.log(`    urgency:    ${c.urgency}`);
  }
}

// ── 3. Production probe ─────────────────────────────────────────────────
console.log("\n=== 3. Production webhook probe ===\n");

try {
  const getRes = await fetch(PROD_WEBHOOK);
  const getText = await getRes.text();
  console.log(`  GET  ${PROD_WEBHOOK}`);
  console.log(`       HTTP ${getRes.status} | ${getText.slice(0, 60)}`);

  const postRes = await fetch(PROD_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  const postText = await postRes.text();
  console.log(`  POST ${PROD_WEBHOOK}`);
  console.log(`       HTTP ${postRes.status} | ${postText.slice(0, 80)}`);

  if (getRes.status === 200 && postRes.status === 401) {
    console.log("\n  Webhook LIVE (GET 200, POST 401 = sig verification active)");
  } else if (postRes.status === 404) {
    console.log("\n  BROKEN: 404 — deployment issue. See voice_debug.md section 0.");
    exitCode = 1;
  }
} catch (err) {
  console.error("  Probe failed:", err.message);
  exitCode = 1;
}

// ── Summary ─────────────────────────────────────────────────────────────
const caseCount = Array.isArray(cases.data) ? cases.data.length : 0;
const tnCount = Array.isArray(tn.data) ? tn.data.length : 0;

console.log("\n=== Summary ===\n");
console.log(`  tenant_numbers: ${tnCount > 0 ? `${tnCount} active` : "EMPTY (blocker)"}`);
console.log(`  cases (${MINUTES}min): ${caseCount > 0 ? `${caseCount} found` : "none"}`);
console.log(`  webhook:        ${exitCode === 0 ? "live" : "check above"}`);

if (caseCount === 0 && tnCount > 0) {
  console.log("\n  Next step: Check Vercel Function Logs for lines containing");
  console.log('  _tag: "retell_webhook" to see decision=event_skipped|missing_fields|created');
  console.log("  If missing_fields: configure Retell agent custom_analysis_data schema.");
}

console.log();
process.exit(exitCode);
