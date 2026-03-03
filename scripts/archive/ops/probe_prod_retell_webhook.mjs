#!/usr/bin/env node
/**
 * Probe production Retell webhook endpoint.
 * Run: node scripts/_ops/probe_prod_retell_webhook.mjs
 *
 * Expected: 401 (missing signature) or 204 (valid).
 * If 404: deployment broken (see docs/runbooks/voice_debug.md).
 */

const URL = "https://flowsight-mvp.vercel.app/api/retell/webhook";

async function probe(method, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(URL, opts);
  const text = await res.text();
  console.log(
    `${method} ${URL} → HTTP ${res.status} | Body: ${text.slice(0, 120)}`
  );
  return res.status;
}

console.log("=== Probe: Production Retell Webhook ===\n");

const postStatus = await probe("POST", {});
const getStatus = await probe("GET");

console.log();
if (postStatus === 404) {
  console.log("❌ 404 — Deployment likely broken. Check Vercel Dashboard.");
  console.log("   Fix: push a commit to trigger Git-connected deploy.");
} else if (postStatus === 401) {
  console.log("✓ 401 — Endpoint live. Signature verification working.");
} else if (postStatus === 204) {
  console.log("✓ 204 — Endpoint live. Payload accepted.");
} else {
  console.log(`? Unexpected status ${postStatus}. Investigate.`);
}
