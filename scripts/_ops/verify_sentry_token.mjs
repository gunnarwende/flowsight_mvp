#!/usr/bin/env node
/**
 * Verify Sentry API auth token has working read access.
 * Zero deps (native fetch).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/verify_sentry_token.mjs
 *
 * Requires:
 *   SENTRY_API_TOKEN — Sentry Auth Token with org:read + project:read scopes.
 *   See docs/runbooks/sentry_token_setup.md for setup instructions.
 */

const token = process.env.SENTRY_API_TOKEN;

if (!token) {
  console.error("FATAL: SENTRY_API_TOKEN not set in environment.");
  console.error("See docs/runbooks/sentry_token_setup.md for setup instructions.");
  process.exit(1);
}

const ORG = "flowsight-gmbh";
const PROJECT = "flowsight-mvp";
const BASE = "https://sentry.io/api/0";

async function probe(label, url) {
  console.log(`\n  ${label}`);
  console.log(`  ${url}`);
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`  HTTP ${res.status}`);
    if (res.status === 403) {
      console.log("  FAILED: 403 Forbidden — token missing required scopes.");
    } else if (res.status === 401) {
      console.log("  FAILED: 401 Unauthorized — token invalid or expired.");
    } else if (res.ok) {
      console.log("  OK");
    }
    return res.status;
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
    return 0;
  }
}

console.log("=== Sentry API Token Verification ===");
console.log(`\n  Org:     ${ORG}`);
console.log(`  Project: ${PROJECT}`);
console.log(`  Token:   ${token.slice(0, 8)}...${token.slice(-4)}`);

const s1 = await probe(
  "1) org:read — list projects",
  `${BASE}/organizations/${ORG}/projects/?per_page=1`
);

const s2 = await probe(
  "2) project:read — project details",
  `${BASE}/projects/${ORG}/${PROJECT}/`
);

const s3 = await probe(
  "3) event:read — recent issues",
  `${BASE}/projects/${ORG}/${PROJECT}/issues/?per_page=1`
);

console.log("\n=== Summary ===\n");
const all = [s1, s2, s3];
const pass = all.every((s) => s >= 200 && s < 300);
if (pass) {
  console.log("  All checks PASSED (2xx). Token is working.");
} else {
  console.log("  Some checks FAILED. Fix token scopes:");
  console.log("  See docs/runbooks/sentry_token_setup.md");
}
console.log();
