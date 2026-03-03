// scripts/patch_retell_agent_ids.mjs — Patch AgentSwapTool target in DE agent export
// Usage:
//   node scripts/patch_retell_agent_ids.mjs \
//     --in  retell/exports/doerfler_agent.json \
//     --out retell/exports/doerfler_agent_patched.json \
//     --intl <INTL_AGENT_ID>
//
// The patched file is an import artifact — do NOT commit it.

import { readFileSync, writeFileSync } from "fs";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    in:   { type: "string" },
    out:  { type: "string" },
    intl: { type: "string" },
  },
  strict: true,
});

if (!values.in || !values.out || !values.intl) {
  console.error("Usage: node scripts/patch_retell_agent_ids.mjs --in <file> --out <file> --intl <agent_id>");
  process.exit(1);
}

const intlId = values.intl.trim();
if (!intlId || intlId === "REPLACE_WITH_INTL_AGENT_ID") {
  console.error("ERROR: --intl must be a real Retell agent_id, not the placeholder.");
  process.exit(1);
}

// Read and parse
const raw = readFileSync(values.in, "utf8");
const agent = JSON.parse(raw);

// Find all AgentSwapTools named swap_to_intl_agent
const nodes = agent.conversationFlow?.nodes ?? [];
let patchCount = 0;

for (const node of nodes) {
  if (!Array.isArray(node.tools)) continue;
  for (const tool of node.tools) {
    if (tool.type === "agent_swap" && tool.name === "swap_to_intl_agent") {
      tool.agent_id = intlId;
      patchCount++;
    }
  }
}

// Validate
if (patchCount === 0) {
  console.error("ERROR: No AgentSwapTool named 'swap_to_intl_agent' found in", values.in);
  process.exit(1);
}
if (patchCount > 1) {
  console.error("ERROR: Found", patchCount, "swap_to_intl_agent tools — expected exactly 1.");
  process.exit(1);
}

// Write patched output
writeFileSync(values.out, JSON.stringify(agent, null, 2) + "\n");

// Mask agent_id for logging (first4...last4)
const masked = intlId.length > 8
  ? intlId.slice(0, 4) + "..." + intlId.slice(-4)
  : "****";

console.log("OK: patched swap_to_intl_agent target to", masked);
console.log("Output:", values.out);
console.log("Import this file into Retell Dashboard (do NOT commit it).");
