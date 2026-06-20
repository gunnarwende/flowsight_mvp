#!/usr/bin/env node
/**
 * retell_inspect.mjs — READ-ONLY deep Retell state inspector.
 *
 * For each given prefix (from retell/agent_ids.json) it GETs:
 *   - each agent (scalar fields) + its FULL version history (version/is_published)
 *   - each conversation flow (scalar fields)
 *   - all phone numbers, showing which agent + pinned version they route to
 *
 * Large fields (global_prompt, nodes) are stripped. Pure GET — never mutates.
 * Goal: understand the REAL live versioning/publish state (docs can be stale).
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

// collect our agent ids for phone cross-reference
const agentIdSet = new Set();
for (const pre of prefixes)
  for (const [k, id] of Object.entries(ids[pre] || {}))
    if (k.endsWith("_agent_id")) agentIdSet.add(id);

for (const pre of prefixes) {
  const o = ids[pre];
  console.log(`\n═══════════ ${pre} ═══════════`);
  if (!o) {
    console.log("  (no agent_ids entry)");
    continue;
  }
  for (const [k, id] of Object.entries(o)) {
    if (k.endsWith("_agent_id")) {
      const r = await get(`/get-agent/${id}`);
      console.log(`\n  AGENT ${k} = ${id}  → HTTP ${r.status}`);
      console.log("   ", JSON.stringify(r.ok ? scalars(r.d) : r.d));
      const v = await get(`/get-agent-versions/${id}`);
      if (v.ok && Array.isArray(v.d)) {
        const rows = v.d
          .map((x) => `v${x.version}${x.is_published ? "*PUB" : "·draft"}`)
          .join("  ");
        console.log(`    versions (${v.d.length}): ${rows}`);
      } else {
        console.log(`    versions → HTTP ${v.status}: ${JSON.stringify(v.d)}`);
      }
      // Surface the reporter_name analysis-field rule (was the caller-name bug)
      if (r.ok && Array.isArray(r.d.post_call_analysis_data)) {
        const rn = r.d.post_call_analysis_data.find((f) => f.name === "reporter_name");
        if (rn) {
          const restricted = /only fill if/i.test(rn.description);
          console.log(`    reporter_name: ${restricted ? "🔴 RESTRICTED" : "✅ all call types"} — …${rn.description.slice(-70)}`);
        }
      }
    } else if (k.endsWith("_flow_id")) {
      const r = await get(`/get-conversation-flow/${id}`);
      console.log(`\n  FLOW  ${k} = ${id}  → HTTP ${r.status}`);
      console.log("   ", JSON.stringify(r.ok ? scalars(r.d) : r.d));
    }
  }
}

console.log(`\n═══════════ phone numbers ═══════════`);
const pn = await get("/v2/list-phone-numbers");
if (!pn.ok) {
  console.log(`  → HTTP ${pn.status}: ${JSON.stringify(pn.d)}`);
} else {
  for (const p of pn.d.items ?? pn.d) {
    const mark = agentIdSet.has(p.inbound_agent_id) ? " ◀── ours" : "";
    console.log(
      `  ${p.phone_number}  inbound=${p.inbound_agent_id} v=${p.inbound_agent_version ?? "latest"}${mark}`
    );
  }
}

console.log("\n(done — read-only, nothing mutated)");
