#!/usr/bin/env node
/**
 * Sync Retell voice agents from local JSON configs → Retell API.
 *
 * Creates or updates conversation flows + agents, cross-links DE ↔ INTL
 * swap tools, and publishes. Idempotent — safe to re-run.
 *
 * Usage (from repo root):
 *   node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs \
 *     --prefix brunner [--dry-run]
 *
 * Reads:
 *   retell/exports/{prefix}_agent.json       (DE agent config)
 *   retell/exports/{prefix}_agent_intl.json  (INTL agent config)
 *   retell/agent_ids.json                    (existing IDs, if any)
 *
 * Writes:
 *   retell/agent_ids.json                    (persistent ID mapping)
 *
 * Env:
 *   RETELL_API_KEY   (required)
 *
 * Workflow:
 *   1. Create/update conversation flows (swap tools stripped initially)
 *   2. Create/update agents (linked to flows)
 *   3. Cross-link swap tools with correct agent IDs
 *   4. Publish both agents (draft → live)
 *   5. Save IDs to retell/agent_ids.json
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const RETELL_BASE = "https://api.retellai.com";

// ── CLI ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : null;
}
const dryRun = args.includes("--dry-run");
const prefix = getArg("--prefix");

if (!prefix) {
  console.error(`
Usage: node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs \\
  --prefix brunner [--dry-run]

Reads:  retell/exports/{prefix}_agent.json + {prefix}_agent_intl.json
Writes: retell/agent_ids.json (persistent ID mapping)

Env:    RETELL_API_KEY (required)
`);
  process.exit(1);
}

// ── Env ──────────────────────────────────────────────────────────────────

const apiKey = process.env.RETELL_API_KEY;
if (!apiKey) {
  console.error("FATAL: RETELL_API_KEY not set.");
  console.error(
    "Run with: node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs ..."
  );
  process.exit(1);
}

// ── Files ────────────────────────────────────────────────────────────────

const deFile = `retell/exports/${prefix}_agent.json`;
const intlFile = `retell/exports/${prefix}_agent_intl.json`;
const idsFile = "retell/agent_ids.json";

for (const f of [deFile, intlFile]) {
  if (!existsSync(f)) {
    console.error(`FATAL: Config not found: ${f}`);
    process.exit(1);
  }
}

const deConfig = JSON.parse(readFileSync(deFile, "utf-8"));
const intlConfig = JSON.parse(readFileSync(intlFile, "utf-8"));

let allIds = {};
if (existsSync(idsFile)) {
  allIds = JSON.parse(readFileSync(idsFile, "utf-8"));
}
const existing = allIds[prefix] ?? {};

// ── API Helpers ──────────────────────────────────────────────────────────

const hdrs = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};

async function retellPost(urlPath, body) {
  const res = await fetch(`${RETELL_BASE}${urlPath}`, {
    method: "POST",
    headers: hdrs,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      `POST ${urlPath} → ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return data;
}

async function retellPatch(urlPath, body) {
  const res = await fetch(`${RETELL_BASE}${urlPath}`, {
    method: "PATCH",
    headers: hdrs,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      `PATCH ${urlPath} → ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return data;
}

// ── Extractors ───────────────────────────────────────────────────────────

/** Extract conversation flow params from our JSON export format. */
function extractFlowParams(config) {
  const cf = config.conversationFlow;
  return {
    global_prompt: cf.global_prompt,
    nodes: cf.nodes,
    start_node_id: cf.start_node_id ?? "start-node",
    start_speaker: cf.start_speaker ?? "agent",
    model_choice: cf.model_choice,
    tool_call_strict_mode: cf.tool_call_strict_mode ?? true,
    knowledge_base_ids: cf.knowledge_base_ids ?? [],
    ...(cf.kb_config && { kb_config: cf.kb_config }),
  };
}

// Agent fields to EXCLUDE (response-only or handled separately)
const AGENT_EXCLUDE = new Set([
  "agent_id",
  "version",
  "is_published",
  "conversationFlow",
  "response_engine",
  "channel",
]);

/** Extract agent params from our JSON export format. */
function extractAgentParams(config, flowId) {
  const params = {};
  for (const [key, value] of Object.entries(config)) {
    if (!AGENT_EXCLUDE.has(key)) {
      params[key] = value;
    }
  }
  params.response_engine = {
    type: "conversation-flow",
    conversation_flow_id: flowId,
  };
  return params;
}

/** Deep-clone nodes and strip agent_swap tools (for initial flow creation). */
function stripSwapTools(nodes) {
  return JSON.parse(JSON.stringify(nodes)).map((node) => {
    if (node.tools) {
      node.tools = node.tools.filter((t) => t.type !== "agent_swap");
      if (node.tools.length === 0) delete node.tools;
    }
    return node;
  });
}

/** Deep-clone nodes and set all agent_swap tools to the target agent ID. */
function withSwapAgentId(nodes, targetAgentId) {
  const clone = JSON.parse(JSON.stringify(nodes));
  for (const node of clone) {
    if (node.tools) {
      for (const tool of node.tools) {
        if (tool.type === "agent_swap") {
          tool.agent_id = targetAgentId;
        }
      }
    }
  }
  return clone;
}

// ── Main ─────────────────────────────────────────────────────────────────

console.log("\n╔════════════════════════════════════════════════════╗");
console.log("║         FlowSight — Retell Agent Sync             ║");
console.log("╚════════════════════════════════════════════════════╝\n");

console.log(`  Prefix:     ${prefix}`);
console.log(`  DE config:  ${deFile}`);
console.log(`  INTL config:${intlFile}`);
console.log(
  `  Mode:       ${existing.de_agent_id ? "UPDATE (IDs exist)" : "CREATE (first time)"}`
);
console.log(`  Dry-run:    ${dryRun ? "YES" : "no"}`);
console.log("");

if (dryRun) {
  console.log("  [DRY-RUN] No API calls will be made.\n");
  if (existing.de_agent_id) {
    console.log(`  Would update DE agent:   ${existing.de_agent_id}`);
    console.log(`  Would update DE flow:    ${existing.de_flow_id}`);
    console.log(`  Would update INTL agent: ${existing.intl_agent_id}`);
    console.log(`  Would update INTL flow:  ${existing.intl_flow_id}`);
  } else {
    console.log("  Would create new DE + INTL agent pair.");
  }
  console.log("");
  process.exit(0);
}

try {
  // ── Step 1: Create/update conversation flows ────────────────────────
  // Swap tools are stripped on create (agents don't exist yet).
  // On update, we also strip them — they're re-added in step 3.
  console.log("━━━ Step 1: Conversation Flows ━━━\n");

  const deFlowParams = extractFlowParams(deConfig);
  const intlFlowParams = extractFlowParams(intlConfig);

  let deFlowId, intlFlowId;

  if (existing.de_flow_id) {
    const body = { ...deFlowParams, nodes: stripSwapTools(deFlowParams.nodes) };
    await retellPatch(`/update-conversation-flow/${existing.de_flow_id}`, body);
    deFlowId = existing.de_flow_id;
    console.log(`  ✓ DE flow updated:   ${deFlowId}`);
  } else {
    const body = { ...deFlowParams, nodes: stripSwapTools(deFlowParams.nodes) };
    const res = await retellPost("/create-conversation-flow", body);
    deFlowId = res.conversation_flow_id;
    console.log(`  ✓ DE flow created:   ${deFlowId}`);
  }

  if (existing.intl_flow_id) {
    const body = {
      ...intlFlowParams,
      nodes: stripSwapTools(intlFlowParams.nodes),
    };
    await retellPatch(
      `/update-conversation-flow/${existing.intl_flow_id}`,
      body
    );
    intlFlowId = existing.intl_flow_id;
    console.log(`  ✓ INTL flow updated: ${intlFlowId}`);
  } else {
    const body = {
      ...intlFlowParams,
      nodes: stripSwapTools(intlFlowParams.nodes),
    };
    const res = await retellPost("/create-conversation-flow", body);
    intlFlowId = res.conversation_flow_id;
    console.log(`  ✓ INTL flow created: ${intlFlowId}`);
  }
  console.log("");

  // ── Step 2: Create/update agents ────────────────────────────────────
  console.log("━━━ Step 2: Agents ━━━\n");

  let deAgentId, intlAgentId;

  if (existing.de_agent_id) {
    const body = extractAgentParams(deConfig, deFlowId);
    await retellPatch(`/update-agent/${existing.de_agent_id}`, body);
    deAgentId = existing.de_agent_id;
    console.log(`  ✓ DE agent updated:   ${deAgentId}`);
  } else {
    const body = extractAgentParams(deConfig, deFlowId);
    const res = await retellPost("/create-agent", body);
    deAgentId = res.agent_id;
    console.log(`  ✓ DE agent created:   ${deAgentId}`);
  }

  if (existing.intl_agent_id) {
    const body = extractAgentParams(intlConfig, intlFlowId);
    await retellPatch(`/update-agent/${existing.intl_agent_id}`, body);
    intlAgentId = existing.intl_agent_id;
    console.log(`  ✓ INTL agent updated: ${intlAgentId}`);
  } else {
    const body = extractAgentParams(intlConfig, intlFlowId);
    const res = await retellPost("/create-agent", body);
    intlAgentId = res.agent_id;
    console.log(`  ✓ INTL agent created: ${intlAgentId}`);
  }
  console.log("");

  // ── Step 3: Cross-link swap tools ───────────────────────────────────
  console.log("━━━ Step 3: Cross-link swap tools ━━━\n");

  // DE flow → swap to INTL agent
  const deNodesLinked = withSwapAgentId(deFlowParams.nodes, intlAgentId);
  await retellPatch(`/update-conversation-flow/${deFlowId}`, {
    nodes: deNodesLinked,
  });
  console.log(`  ✓ DE flow → swap to INTL: ${intlAgentId}`);

  // INTL flow → swap to DE agent
  const intlNodesLinked = withSwapAgentId(intlFlowParams.nodes, deAgentId);
  await retellPatch(`/update-conversation-flow/${intlFlowId}`, {
    nodes: intlNodesLinked,
  });
  console.log(`  ✓ INTL flow → swap to DE: ${deAgentId}`);
  console.log("");

  // ── Step 4: Publish ─────────────────────────────────────────────────
  console.log("━━━ Step 4: Publish ━━━\n");

  await retellPost(`/publish-agent/${deAgentId}`, {});
  console.log(`  ✓ DE agent published`);

  await retellPost(`/publish-agent/${intlAgentId}`, {});
  console.log(`  ✓ INTL agent published`);
  console.log("");

  // ── Step 5: Save IDs ────────────────────────────────────────────────
  allIds[prefix] = {
    de_agent_id: deAgentId,
    de_flow_id: deFlowId,
    intl_agent_id: intlAgentId,
    intl_flow_id: intlFlowId,
    last_synced: new Date().toISOString(),
  };
  writeFileSync(idsFile, JSON.stringify(allIds, null, 2) + "\n");
  console.log(`  Saved IDs → ${idsFile}\n`);

  // ── Summary ─────────────────────────────────────────────────────────
  console.log("━━━ Sync complete ━━━\n");
  console.log(`  DE Agent:    ${deAgentId}`);
  console.log(`  DE Flow:     ${deFlowId}`);
  console.log(`  INTL Agent:  ${intlAgentId}`);
  console.log(`  INTL Flow:   ${intlFlowId}`);
  console.log(`  Published:   YES`);
  console.log("");
  console.log("  Next: Assign Twilio number to DE agent in Retell Dashboard.");
  console.log("");
} catch (err) {
  console.error(`\nFATAL: ${err.message}\n`);
  // Save partial IDs so we can resume
  if (allIds[prefix]) {
    writeFileSync(idsFile, JSON.stringify(allIds, null, 2) + "\n");
    console.error(`  Partial IDs saved to ${idsFile} for recovery.`);
  }
  process.exit(1);
}
