#!/usr/bin/env node
/**
 * Sentry API Probe — diagnose 403 and fetch webhook-related issues.
 * Run: node scripts/_ops/sentry_probe.mjs
 *
 * Outputs ONLY: HTTP status codes, issue IDs, minimal hints. NO token output.
 */

import { readFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Parse .env.local
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = join(process.cwd(), "src", "web", ".env.local");
  const env = {};
  try {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const l = line.trim();
      if (!l || l.startsWith("#")) continue;
      const m = l.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      )
        v = v.slice(1, -1);
      env[m[1]] = v;
    }
  } catch (e) {
    console.error("Cannot read src/web/.env.local:", e.message);
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const ORG = env.SENTRY_ORG;
const PROJECT = env.SENTRY_PROJECT;
const TOKEN = env.SENTRY_AUTH_TOKEN;

if (!ORG || !PROJECT || !TOKEN) {
  console.error("Missing SENTRY_ORG, SENTRY_PROJECT, or SENTRY_AUTH_TOKEN");
  process.exit(1);
}

console.log(`\n=== Sentry API Probe ===`);
console.log(`Org: ${ORG} | Project: ${PROJECT}`);
console.log(`Token present: yes (${TOKEN.length} chars, not printed)\n`);

// ---------------------------------------------------------------------------
// Probe both hosts
// ---------------------------------------------------------------------------
const HOSTS = [
  { label: "sentry.io (US/default)", base: "https://sentry.io/api/0" },
  { label: "de.sentry.io (EU)", base: "https://de.sentry.io/api/0" },
];

for (const host of HOSTS) {
  console.log(`--- Probing ${host.label} ---`);

  // 1) Auth check: GET /organizations/{org}/
  const orgUrl = `${host.base}/organizations/${ORG}/`;
  try {
    const res = await fetch(orgUrl, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    console.log(`  GET ${orgUrl.replace(TOKEN, "***")}`);
    console.log(`  Status: ${res.status} ${res.statusText}`);

    if (res.status === 200) {
      console.log(`  ✓ Auth OK on ${host.label}`);
    } else if (res.status === 403) {
      console.log(
        `  ✗ 403 Forbidden — likely: token scopes missing, token invalid, or wrong host/org.`
      );
    } else if (res.status === 401) {
      console.log(`  ✗ 401 Unauthorized — token invalid or expired.`);
    } else if (res.status === 404) {
      console.log(`  ✗ 404 — org slug "${ORG}" not found on this host.`);
    }
  } catch (e) {
    console.log(`  ✗ Network error: ${e.message}`);
  }

  // 2) Issues query for webhook endpoint
  const issuesUrl = `${host.base}/projects/${ORG}/${PROJECT}/issues/?query=url%3A%2Fapi%2Fretell%2Fwebhook&limit=5`;
  try {
    const res = await fetch(issuesUrl, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    console.log(`  GET issues?query=url:/api/retell/webhook`);
    console.log(`  Status: ${res.status}`);

    if (res.ok) {
      const issues = await res.json();
      if (issues.length === 0) {
        console.log(`  No webhook-related issues found.`);
      } else {
        for (const i of issues) {
          console.log(
            `  Issue: id=${i.id} title="${(i.title || "").slice(0, 80)}" count=${i.count} lastSeen=${i.lastSeen}`
          );
        }
      }
    }
  } catch (e) {
    console.log(`  ✗ Issues query error: ${e.message}`);
  }

  // 3) Query for "payload_keys" message
  const payloadUrl = `${host.base}/projects/${ORG}/${PROJECT}/issues/?query=payload_keys&limit=5`;
  try {
    const res = await fetch(payloadUrl, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    console.log(`  GET issues?query=payload_keys`);
    console.log(`  Status: ${res.status}`);

    if (res.ok) {
      const issues = await res.json();
      if (issues.length === 0) {
        console.log(`  No "payload_keys" issues found.`);
      } else {
        for (const i of issues) {
          console.log(
            `  Issue: id=${i.id} title="${(i.title || "").slice(0, 80)}" count=${i.count}`
          );
        }
      }
    }
  } catch (e) {
    console.log(`  ✗ payload_keys query error: ${e.message}`);
  }

  console.log();
}

console.log("=== Done ===");
console.log(
  "If both hosts return 403: check token scopes in Sentry → Settings → Auth Tokens."
);
console.log(
  "Required scopes: project:read, org:read, event:read (minimum for API queries)."
);
