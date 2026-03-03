#!/usr/bin/env node
// scripts/retell_probe.mjs — Probe Retell API endpoints empirically
//
// Determines which API paths are valid for Agent + ConversationFlow resources.
// Uses the same base URL + auth pattern as scripts/chains/voice/collect.mjs.
//
// Usage (PowerShell):
//   $env:RETELL_API_KEY = "key_xxx"          # or load from .env.local
//   node scripts/retell_probe.mjs
//
// Output: status code per candidate path (200 = confirmed, 404 = wrong path)

import { readFileSync, existsSync } from "node:fs";

const BASE_URL = "https://api.retellai.com";
const ENV_LOCAL_PATH = "src/web/.env.local";

// Known agent ID (DE agent — always exists)
const PROBE_AGENT_ID = "agent_d7dfe45ab444e1370e836c3e0f";

// ── API Key ──────────────────────────────────────────────────────────────

function resolveApiKey() {
  if (process.env.RETELL_API_KEY) {
    return process.env.RETELL_API_KEY;
  }
  if (existsSync(ENV_LOCAL_PATH)) {
    const content = readFileSync(ENV_LOCAL_PATH, "utf8");
    const match = content.match(/^RETELL_API_KEY\s*=\s*(.+)$/m);
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

// ── Probe a single endpoint ──────────────────────────────────────────────

async function probe(method, path) {
  const key = resolveApiKey();
  if (!key) {
    console.error("RETELL_API_KEY not found. Set in env or src/web/.env.local.");
    process.exit(1);
  }

  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });
    return { path, method, status: res.status, ok: res.ok };
  } catch (err) {
    return { path, method, status: "ERR", ok: false, error: err.message };
  }
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Retell API Endpoint Probe ===\n");
  console.log(`Agent ID: ${PROBE_AGENT_ID}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  // Candidate paths — with and without /v2/ prefix
  const candidates = [
    // Agent: retrieve
    ["GET", `/get-agent/${PROBE_AGENT_ID}`],
    ["GET", `/v2/get-agent/${PROBE_AGENT_ID}`],
    // Agent: list (to verify pattern)
    ["GET", "/list-agents"],
    ["GET", "/v2/list-agents"],
    // Agent: publish (POST, but 404 vs 405 tells us if path exists)
    ["POST", `/publish-agent/${PROBE_AGENT_ID}`],
    ["POST", `/v2/publish-agent/${PROBE_AGENT_ID}`],
  ];

  const results = [];

  for (const [method, path] of candidates) {
    const result = await probe(method, path);
    const indicator = result.ok ? "OK" : result.status;
    console.log(`  ${method.padEnd(5)} ${path.padEnd(55)} → ${indicator}`);
    results.push(result);
  }

  // Now probe ConversationFlow — we need the flow ID from the agent response
  const agentResult = results.find((r) => r.ok && r.path.includes("get-agent"));
  if (agentResult) {
    // Re-fetch to get body
    const key = resolveApiKey();
    const agentRes = await fetch(`${BASE_URL}${agentResult.path}`, {
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    });
    const agent = await agentRes.json();
    const cfId = agent.response_engine?.conversation_flow_id;

    if (cfId) {
      console.log(`\n  ConversationFlow ID: ${cfId}\n`);

      const cfCandidates = [
        ["GET", `/get-conversation-flow/${cfId}`],
        ["GET", `/v2/get-conversation-flow/${cfId}`],
        ["GET", "/list-conversation-flows"],
        ["GET", "/v2/list-conversation-flows"],
      ];

      for (const [method, path] of cfCandidates) {
        const result = await probe(method, path);
        const indicator = result.ok ? "OK" : result.status;
        console.log(`  ${method.padEnd(5)} ${path.padEnd(55)} → ${indicator}`);
        results.push(result);
      }
    } else {
      console.log("\n  (no conversation_flow_id on agent — skipping flow probes)");
    }
  } else {
    console.log("\n  (no successful agent fetch — skipping flow probes)");
  }

  // Summary
  console.log("\n=== Summary ===");
  const working = results.filter((r) => r.ok);
  const broken = results.filter((r) => !r.ok);
  console.log(`Working: ${working.length}  |  Failed: ${broken.length}`);

  if (working.length > 0) {
    console.log("\nConfirmed paths:");
    for (const r of working) {
      console.log(`  ${r.method} ${r.path}`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Probe failed:", err.message);
  process.exit(1);
});
