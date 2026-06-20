#!/usr/bin/env node
/**
 * retell_inspect.mjs — READ-ONLY Retell state inspector.
 *
 * For each given prefix (from retell/agent_ids.json) it GETs every flow + agent
 * and prints the SCALAR fields (is_published, version, timestamps, …) — the
 * large fields (global_prompt, nodes) are stripped for readability.
 *
 * Purpose: understand WHY an update to one tenant's conversation flow is
 * rejected ("Cannot update published conversation flow") while another tenant
 * (BigBen) patches fine daily. Pure GET — never mutates anything.
 *
 * Usage:  node scripts/_ops/retell_inspect.mjs [prefix1,prefix2,...]
 * Env:    RETELL_API_KEY (required)
 */
import { readFileSync } from "node:fs";

const API = "https://api.retellai.com";
const key = process.env.RETELL_API_KEY;
if (!key) {
  console.error("FATAL: RETELL_API_KEY not set.");
  process.exit(1);
}

const prefixes = (process.argv[2] || "doerfler,bigben-pub")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ids = JSON.parse(readFileSync("retell/agent_ids.json", "utf-8"));
const H = { Authorization: `Bearer ${key}` };

async function get(path) {
  const r = await fetch(API + path, { headers: H });
  const d = await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, d };
}

const BIG = new Set(["global_prompt", "nodes", "tools", "general_prompt", "states", "begin_message"]);
function scalars(o) {
  const out = {};
  for (const [k, v] of Object.entries(o || {})) {
    if (BIG.has(k)) continue;
    if (v && typeof v === "object") out[k] = Array.isArray(v) ? `[array:${v.length}]` : "{obj}";
    else out[k] = v;
  }
  return out;
}

for (const pre of prefixes) {
  const o = ids[pre];
  console.log(`\n═══════════ ${pre} ═══════════`);
  if (!o) {
    console.log("  (no agent_ids entry)");
    continue;
  }
  for (const [k, id] of Object.entries(o)) {
    if (k.endsWith("_flow_id")) {
      const r = await get(`/get-conversation-flow/${id}`);
      console.log(`\n  FLOW  ${k} = ${id}  → HTTP ${r.status}`);
      console.log("   ", JSON.stringify(r.ok ? scalars(r.d) : r.d));
    } else if (k.endsWith("_agent_id")) {
      const r = await get(`/get-agent/${id}`);
      console.log(`\n  AGENT ${k} = ${id}  → HTTP ${r.status}`);
      console.log("   ", JSON.stringify(r.ok ? scalars(r.d) : r.d));
    }
  }
}
console.log("\n(done — read-only, nothing mutated)");
