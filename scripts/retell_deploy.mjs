#!/usr/bin/env node
// scripts/retell_deploy.mjs — Deploy Retell agents via API
//
// Usage (PowerShell — run from C:\flowsight_mvp):
//   $env:RETELL_API_KEY = "key_xxx"                                           # or load interactively
//   node scripts/retell_deploy.mjs verify                                     # Step A: diff API vs generated JSON
//   node scripts/retell_deploy.mjs deploy --mode debug                        # Deploy with debug privacy
//   node scripts/retell_deploy.mjs deploy --mode live --confirm               # Deploy with live privacy
//   node scripts/retell_deploy.mjs deploy --mode debug --dry-run              # Show diff without applying
//
// API paths verified against retell-sdk@5.2.0 source (see resources/agent.mjs,
// resources/conversation-flow.mjs). Agent + ConversationFlow use NO /v2/ prefix;
// Call endpoints use /v2/ prefix. Confirmed empirically via scripts/retell_probe.mjs.
//
// Prerequisites:
//   RETELL_API_KEY in env or src/web/.env.local (interactive fallback)

import { parseArgs } from "node:util";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { createInterface } from "node:readline";

// ── Agent IDs (stable — these never change on update) ────────────────────
const AGENTS = {
  de: {
    agent_id: "agent_d7dfe45ab444e1370e836c3e0f",
    label: "Dörfler DE",
  },
  intl: {
    agent_id: "agent_fb4b956eec31db9c591880fdeb",
    label: "Dörfler INTL",
  },
};

// ── Voice IDs ────────────────────────────────────────────────────────────
// Voice is UI-managed (set in Retell Dashboard). Retell wraps ElevenLabs
// voices in custom_voice_* IDs. We do NOT touch voice_id during deploy.
// Mapping (reference only):
//   DE  → ElevenLabs v3V1d2rk6528UrLKRuy8 (Susi)  → Retell custom_voice_c0c7eb84f182225ef8003c9576
//   INTL→ ElevenLabs aMSt68OGf4xUZAnLpTU8 (Juniper)→ Retell custom_voice_cf152ba48ccbac0370ecebcd88

// ── Privacy tiers ────────────────────────────────────────────────────────
const PRIVACY = {
  debug: {
    data_storage_setting: "everything",
    pii_config: { mode: "post_call", categories: [] },
  },
  live: {
    data_storage_setting: "everything_except_pii",
    // Category names from retell-sdk@5.2.0 AgentResponse.PiiConfig.categories
    pii_config: {
      mode: "post_call",
      categories: [
        "person_name", "phone_number", "email", "address",
        "date_of_birth", "ssn", "credit_card",
        "bank_account", "passport", "driver_license",
        "password", "pin", "medical_id", "customer_account_number",
      ],
    },
  },
};

const BASE_URL = "https://api.retellai.com";
const ENV_LOCAL_PATH = "src/web/.env.local";
const OUT_DIR = "tmp/retell_deploy";

// ── API key resolution (reused from run_chain.mjs) ───────────────────────

function loadKeyFromEnvLocal() {
  if (!existsSync(ENV_LOCAL_PATH)) {
    console.error(`[key] ${ENV_LOCAL_PATH} not found.`);
    process.exit(1);
  }
  const content = readFileSync(ENV_LOCAL_PATH, "utf8");
  const match = content.match(/^RETELL_API_KEY\s*=\s*(.+)$/m);
  if (!match) {
    console.error(`[key] No RETELL_API_KEY in ${ENV_LOCAL_PATH}.`);
    process.exit(1);
  }
  const raw = match[1].trim().replace(/^["']|["']$/g, "");
  if (raw.length === 0) {
    console.error(`[key] RETELL_API_KEY in ${ENV_LOCAL_PATH} is empty.`);
    process.exit(1);
  }
  return raw;
}

function askLine(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function ensureApiKey() {
  if (process.env.RETELL_API_KEY) {
    console.log(`[key] RETELL_API_KEY from env (${process.env.RETELL_API_KEY.length} chars)`);
    return;
  }
  console.log("[key] RETELL_API_KEY not set in environment.");
  const yes = (await askLine(`[key] Load from ${ENV_LOCAL_PATH}? (y/N) `)) === "y";
  if (!yes) {
    console.error("[key] Aborted. Set RETELL_API_KEY first.");
    process.exit(1);
  }
  const key = loadKeyFromEnvLocal();
  process.env.RETELL_API_KEY = key;
  console.log(`[key] loaded from ${ENV_LOCAL_PATH} (${key.length} chars)`);
}

// ── Retell API helpers ───────────────────────────────────────────────────

function getApiKey() {
  const key = process.env.RETELL_API_KEY;
  if (!key) throw new Error("RETELL_API_KEY not set.");
  return key;
}

async function retellFetch(path, options = {}) {
  const key = getApiKey();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Retell API ${path} → ${res.status}: ${text}`);
  }
  // publish-agent returns 204 (no body)
  const ct = res.headers.get("content-type") || "";
  if (res.status === 204 || !ct.includes("application/json")) return {};
  return res.json();
}

// Paths from retell-sdk@5.2.0: Agent + ConversationFlow use NO /v2/ prefix.
// Call endpoints (/v2/get-call, /v2/list-calls) DO use /v2/.
async function getAgent(agentId) {
  return retellFetch(`/get-agent/${agentId}`);
}

async function updateAgent(agentId, params) {
  return retellFetch(`/update-agent/${agentId}`, {
    method: "PATCH",
    body: JSON.stringify(params),
  });
}

async function publishAgent(agentId) {
  return retellFetch(`/publish-agent/${agentId}`, { method: "POST" });
}

async function getConversationFlow(cfId) {
  return retellFetch(`/get-conversation-flow/${cfId}`);
}

async function updateConversationFlow(cfId, params) {
  return retellFetch(`/update-conversation-flow/${cfId}`, {
    method: "PATCH",
    body: JSON.stringify(params),
  });
}

// ── Deep diff utility ────────────────────────────────────────────────────

/**
 * Compare two values and return list of differences.
 * Returns array of { path, expected, actual } objects.
 * Skips cosmetic/generated fields.
 */
const SKIP_FIELDS = new Set([
  "agent_id", "conversation_flow_id", "version", "is_published",
  "last_modification_timestamp", "create_timestamp", "version_title",
  "display_position", "begin_tag_display_position",
]);

function deepDiff(expected, actual, path = "") {
  const diffs = [];

  if (expected === null || expected === undefined) {
    if (actual !== null && actual !== undefined) {
      diffs.push({ path: path || "(root)", expected, actual });
    }
    return diffs;
  }

  if (typeof expected !== typeof actual) {
    diffs.push({ path: path || "(root)", expected: typeof expected, actual: typeof actual });
    return diffs;
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      diffs.push({ path, expected: "array", actual: typeof actual });
      return diffs;
    }
    if (expected.length !== actual.length) {
      diffs.push({ path: `${path}.length`, expected: expected.length, actual: actual.length });
    }
    const len = Math.min(expected.length, actual.length);
    for (let i = 0; i < len; i++) {
      diffs.push(...deepDiff(expected[i], actual[i], `${path}[${i}]`));
    }
    return diffs;
  }

  if (typeof expected === "object") {
    const allKeys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    for (const key of allKeys) {
      if (SKIP_FIELDS.has(key)) continue;
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in expected)) {
        diffs.push({ path: childPath, expected: "(absent)", actual: summarize(actual[key]) });
      } else if (!(key in actual)) {
        diffs.push({ path: childPath, expected: summarize(expected[key]), actual: "(absent)" });
      } else {
        diffs.push(...deepDiff(expected[key], actual[key], childPath));
      }
    }
    return diffs;
  }

  // Primitives
  if (expected !== actual) {
    diffs.push({ path, expected: summarize(expected), actual: summarize(actual) });
  }
  return diffs;
}

function summarize(val) {
  if (typeof val === "string" && val.length > 80) {
    return `"${val.slice(0, 40)}…${val.slice(-20)}" (${val.length} chars)`;
  }
  if (typeof val === "object" && val !== null) {
    const s = JSON.stringify(val);
    if (s.length > 80) return `${s.slice(0, 60)}… (${s.length} chars)`;
    return s;
  }
  return JSON.stringify(val);
}

// ── CLI parsing ──────────────────────────────────────────────────────────

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    mode: { type: "string", short: "m" },
    confirm: { type: "boolean" },
    help: { type: "boolean", short: "h" },
    "dry-run": { type: "boolean" },
  },
});

const command = positionals[0];

if (values.help || !command) {
  console.log(`
Retell Agent Deploy Tool

Usage (PowerShell, from C:\\flowsight_mvp):
  $env:RETELL_API_KEY = "key_xxx"
  node scripts/retell_deploy.mjs verify                                     # Diff API vs generated JSON
  node scripts/retell_deploy.mjs deploy --mode debug                        # Deploy with debug privacy
  node scripts/retell_deploy.mjs deploy --mode live --confirm               # Deploy with live privacy
  node scripts/retell_deploy.mjs deploy --mode debug --dry-run              # Show diff without applying

Modes:
  debug   data_storage=everything, PII scrubbing OFF (pre go-live testing)
  live    data_storage=everything_except_pii, all 14 PII categories scrubbed

Flags:
  --confirm   Required for --mode live (hard gate, prevents accidental live deploy)
  --dry-run   Show what would change without making API calls

API paths: verified against retell-sdk@5.2.0 (no /v2/ for agent + flow endpoints).
  `.trim());
  process.exit(0);
}

// ═════════════════════════════════════════════════════════════════════════
// VERIFY command — Step A: compatibility check
// ═════════════════════════════════════════════════════════════════════════

async function runVerify() {
  await ensureApiKey();
  mkdirSync(OUT_DIR, { recursive: true });

  console.log("\n=== Step A: Verify ConversationFlow Compatibility ===\n");

  // 1. Load generated JSON
  const genDe = JSON.parse(readFileSync("retell/exports/doerfler_agent.json", "utf8"));
  const genIntl = JSON.parse(readFileSync("retell/exports/doerfler_agent_intl.json", "utf8"));

  const results = [];

  for (const [variant, agentDef, genObj] of [["de", AGENTS.de, genDe], ["intl", AGENTS.intl, genIntl]]) {
    console.log(`── ${agentDef.label} (${agentDef.agent_id}) ──`);

    // 2. Fetch current agent from API
    console.log("  Fetching agent...");
    const apiAgent = await getAgent(agentDef.agent_id);
    writeFileSync(`${OUT_DIR}/api_agent_${variant}.json`, JSON.stringify(apiAgent, null, 2) + "\n");

    // 3. Fetch current conversation flow
    const cfId = apiAgent.response_engine?.conversation_flow_id;
    if (!cfId) {
      console.error(`  ERROR: No conversation_flow_id on agent!`);
      results.push({ variant, compatible: false, reason: "no conversation_flow_id" });
      continue;
    }
    console.log(`  Fetching conversation flow (${cfId})...`);
    const apiFlow = await getConversationFlow(cfId);
    writeFileSync(`${OUT_DIR}/api_flow_${variant}.json`, JSON.stringify(apiFlow, null, 2) + "\n");

    // 4. Diff agent-level fields
    console.log("  Diffing agent fields...");
    // Fields from retell-sdk@5.2.0 AgentResponse
    // voice_id excluded — UI-managed (Retell wraps ElevenLabs in custom_voice_*)
    const agentFields = [
      "language", "data_storage_setting", "webhook_url",
      "max_call_duration_ms", "interruption_sensitivity",
      "post_call_analysis_data", "pii_config",
      "analysis_successful_prompt", "analysis_summary_prompt",
      "post_call_analysis_model",
    ];

    const agentDiffs = [];
    for (const field of agentFields) {
      const expected = genObj[field];
      const actual = apiAgent[field];
      if (expected === undefined) continue;
      const fieldDiffs = deepDiff(expected, actual, field);
      agentDiffs.push(...fieldDiffs);
    }

    // 5. Diff conversation flow
    console.log("  Diffing conversation flow...");
    const genFlow = genObj.conversationFlow;

    // Classify flow diffs into: addition (gen has, API doesn't — safe to push),
    // removal (API has, gen doesn't), conflict (different values), cosmetic (skip)
    const flowAdditions = [];
    const flowRemovals = [];
    const flowConflicts = [];
    const flowCosmetic = [];

    // Compare global_prompt
    if (genFlow.global_prompt !== apiFlow.global_prompt) {
      const genLen = (genFlow.global_prompt || "").length;
      const apiLen = (apiFlow.global_prompt || "").length;
      flowConflicts.push({
        path: "global_prompt",
        expected: `(${genLen} chars)`,
        actual: `(${apiLen} chars)`,
        type: "conflict",
      });
    }

    // Compare nodes by id
    const genNodes = genFlow.nodes || [];
    const apiNodes = apiFlow.nodes || [];
    const genNodeMap = Object.fromEntries(genNodes.map((n) => [n.id, n]));
    const apiNodeMap = Object.fromEntries(apiNodes.map((n) => [n.id, n]));

    const allNodeIds = new Set([...Object.keys(genNodeMap), ...Object.keys(apiNodeMap)]);
    for (const nodeId of allNodeIds) {
      if (!genNodeMap[nodeId]) {
        flowRemovals.push({ path: `nodes.${nodeId}`, expected: "(absent)", actual: "(exists in API)", type: "removal" });
        continue;
      }
      if (!apiNodeMap[nodeId]) {
        flowAdditions.push({ path: `nodes.${nodeId}`, expected: "(exists in gen)", actual: "(absent in API)", type: "addition" });
        continue;
      }
      // Both exist — deep diff, but separate additions (gen has field, API doesn't) from conflicts
      const genNode = genNodeMap[nodeId];
      const apiNode = apiNodeMap[nodeId];
      const allKeys = new Set([...Object.keys(genNode), ...Object.keys(apiNode)]);
      for (const key of allKeys) {
        if (SKIP_FIELDS.has(key)) {
          const kd = deepDiff(genNode[key], apiNode[key], `nodes.${nodeId}.${key}`);
          kd.forEach((d) => flowCosmetic.push({ ...d, type: "cosmetic" }));
          continue;
        }
        if (key in genNode && !(key in apiNode)) {
          flowAdditions.push({ path: `nodes.${nodeId}.${key}`, expected: summarize(genNode[key]), actual: "(absent)", type: "addition" });
        } else if (!(key in genNode) && key in apiNode) {
          flowRemovals.push({ path: `nodes.${nodeId}.${key}`, expected: "(absent)", actual: summarize(apiNode[key]), type: "removal" });
        } else {
          const kd = deepDiff(genNode[key], apiNode[key], `nodes.${nodeId}.${key}`);
          kd.forEach((d) => {
            if (SKIP_FIELDS.has(d.path.split(".").pop())) {
              flowCosmetic.push({ ...d, type: "cosmetic" });
            } else {
              flowConflicts.push({ ...d, type: "conflict" });
            }
          });
        }
      }
    }

    // Compare other flow-level fields
    for (const field of ["start_node_id", "start_speaker", "tool_call_strict_mode", "flex_mode", "is_transfer_cf"]) {
      if (genFlow[field] !== undefined && genFlow[field] !== apiFlow[field]) {
        flowConflicts.push({ path: field, expected: genFlow[field], actual: apiFlow[field], type: "conflict" });
      }
    }

    // Compare model_choice
    const modelDiffs = deepDiff(genFlow.model_choice, apiFlow.model_choice, "model_choice");
    modelDiffs.forEach((d) => flowConflicts.push({ ...d, type: "conflict" }));

    const allFlowDiffs = [...flowAdditions, ...flowRemovals, ...flowConflicts];

    // 6. Summary for this agent
    console.log(`\n  Agent-level diffs: ${agentDiffs.length}`);
    for (const d of agentDiffs.slice(0, 20)) {
      console.log(`    ${d.path}: expected=${d.expected} actual=${d.actual}`);
    }
    console.log(`  Flow diffs: ${allFlowDiffs.length} (${flowAdditions.length} additions, ${flowConflicts.length} conflicts, ${flowRemovals.length} removals, ${flowCosmetic.length} cosmetic)`);
    if (flowAdditions.length > 0) {
      console.log(`    Additions (safe to push):`);
      for (const d of flowAdditions) console.log(`      + ${d.path}`);
    }
    if (flowConflicts.length > 0) {
      console.log(`    Conflicts (value differs):`);
      for (const d of flowConflicts.slice(0, 10)) console.log(`      ! ${d.path}: expected=${d.expected} actual=${d.actual}`);
    }
    if (flowRemovals.length > 0) {
      console.log(`    Removals (API has, gen doesn't):`);
      for (const d of flowRemovals) console.log(`      - ${d.path}`);
    }

    // Compatible = no conflicts + no agent diffs. Additions are safe to push.
    const compatible = flowConflicts.length === 0 && agentDiffs.length === 0;

    results.push({
      variant,
      compatible,
      agentDiffs: agentDiffs.length,
      flowDiffs: allFlowDiffs.length,
      flowAdditions: flowAdditions.length,
      flowConflicts: flowConflicts.length,
      flowRemovals: flowRemovals.length,
      cfId,
      allAgentDiffs: agentDiffs,
      allFlowDiffs,
    });

    console.log(`  Compatible: ${compatible ? "YES ✓" : "NO — conflicts found"}\n`);
  }

  // 7. Write full diff report
  const hasAdditionsOnly = results.every((r) => r.compatible);
  const hasConflicts = results.some((r) => r.flowConflicts > 0 || r.agentDiffs > 0);
  const verdict = hasConflicts ? "NEEDS_MAPPING" : "COMPATIBLE";

  const report = {
    timestamp: new Date().toISOString(),
    results,
    verdict,
  };
  const reportPath = `${OUT_DIR}/verify_report.json`;
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");

  console.log(`\n=== Verdict: ${verdict} ===`);
  console.log(`Full report: ${reportPath}`);
  console.log(`API snapshots: ${OUT_DIR}/api_agent_*.json, ${OUT_DIR}/api_flow_*.json`);

  const totalAdditions = results.reduce((s, r) => s + (r.flowAdditions || 0), 0);
  if (totalAdditions > 0 && !hasConflicts) {
    console.log(`\n${totalAdditions} addition(s) will be pushed (new nodes/edges). No conflicts → deploy is safe.`);
  }
  if (hasConflicts) {
    console.log("\nConflicts found — review the report to determine if they are:");
    console.log("  (a) Intentional content updates we WANT to push");
    console.log("  (b) Structural incompatibilities (field names/shapes that differ)");
    console.log("\nIf (a) only: deploy will work. If (b): mapping layer needed first.");
  }

  process.exit(0);
}

// ═════════════════════════════════════════════════════════════════════════
// DEPLOY command — update + publish agents via API
// ═════════════════════════════════════════════════════════════════════════

async function runDeploy() {
  const mode = values.mode;
  if (!mode || !["debug", "live"].includes(mode)) {
    console.error("--mode must be 'debug' or 'live'.");
    process.exit(1);
  }

  if (mode === "live" && !values.confirm) {
    console.error("LIVE deploy requires --confirm flag. This is a hard gate.");
    console.error("Usage: node scripts/retell_deploy.mjs deploy --mode live --confirm");
    process.exit(1);
  }

  const dryRun = values["dry-run"] || false;

  await ensureApiKey();
  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`\n=== Deploy: mode=${mode}${dryRun ? " (DRY RUN)" : ""} ===\n`);

  // Load generated JSON
  const genDe = JSON.parse(readFileSync("retell/exports/doerfler_agent.json", "utf8"));
  const genIntl = JSON.parse(readFileSync("retell/exports/doerfler_agent_intl.json", "utf8"));

  const privacy = PRIVACY[mode];
  const deployResults = [];

  for (const [variant, agentDef, genObj] of [["de", AGENTS.de, genDe], ["intl", AGENTS.intl, genIntl]]) {
    console.log(`── ${agentDef.label} (${agentDef.agent_id}) ──`);

    // 1. Fetch current state (for diff)
    console.log("  Fetching current agent...");
    const currentAgent = await getAgent(agentDef.agent_id);
    const cfId = currentAgent.response_engine?.conversation_flow_id;

    if (!cfId) {
      console.error(`  ERROR: No conversation_flow_id on agent. Cannot deploy.`);
      deployResults.push({ variant, success: false, reason: "no conversation_flow_id" });
      continue;
    }

    console.log(`  Fetching current flow (${cfId})...`);
    const currentFlow = await getConversationFlow(cfId);

    // 2. Build agent update params (voice_id excluded — UI-managed)
    const agentUpdate = {
      agent_name: genObj.agent_name,
      language: genObj.language,
      webhook_url: genObj.webhook_url,
      max_call_duration_ms: genObj.max_call_duration_ms,
      interruption_sensitivity: genObj.interruption_sensitivity,
      post_call_analysis_data: genObj.post_call_analysis_data,
      post_call_analysis_model: genObj.post_call_analysis_model,
      analysis_successful_prompt: genObj.analysis_successful_prompt,
      analysis_summary_prompt: genObj.analysis_summary_prompt,
      // Privacy — mode-dependent
      data_storage_setting: privacy.data_storage_setting,
      pii_config: privacy.pii_config,
    };

    // 3. Build flow update params
    const genFlow = genObj.conversationFlow;
    const flowUpdate = {
      global_prompt: genFlow.global_prompt,
      nodes: genFlow.nodes,
      start_node_id: genFlow.start_node_id,
      start_speaker: genFlow.start_speaker,
      model_choice: genFlow.model_choice,
      tool_call_strict_mode: genFlow.tool_call_strict_mode,
      flex_mode: genFlow.flex_mode,
      is_transfer_cf: genFlow.is_transfer_cf,
    };

    // 4. Compute diffs for display
    const agentDiffs = [];
    for (const [key, newVal] of Object.entries(agentUpdate)) {
      const oldVal = currentAgent[key];
      const diffs = deepDiff(newVal, oldVal, key);
      agentDiffs.push(...diffs);
    }

    const promptChanged = genFlow.global_prompt !== currentFlow.global_prompt;
    const nodesChanged = JSON.stringify(genFlow.nodes) !== JSON.stringify(currentFlow.nodes);

    console.log(`\n  Changes detected:`);
    console.log(`    Agent fields: ${agentDiffs.length} diff(s)`);
    for (const d of agentDiffs.slice(0, 10)) {
      // Never print actual values of secrets or full prompts
      if (d.path.includes("webhook_url") || d.path.includes("prompt") || d.path.includes("description")) {
        console.log(`    ↳ ${d.path}: CHANGED (content diff, not shown)`);
      } else {
        console.log(`    ↳ ${d.path}: ${d.expected} → ${d.actual}`);
      }
    }
    if (agentDiffs.length > 10) console.log(`    ↳ ... and ${agentDiffs.length - 10} more`);
    console.log(`    Global prompt: ${promptChanged ? "CHANGED" : "unchanged"} (gen=${genFlow.global_prompt.length} chars, api=${(currentFlow.global_prompt || "").length} chars)`);
    console.log(`    Nodes: ${nodesChanged ? "CHANGED" : "unchanged"} (${genFlow.nodes.length} nodes)`);
    console.log(`    Privacy: data_storage=${privacy.data_storage_setting}, PII categories=${privacy.pii_config.categories.length}`);

    if (dryRun) {
      console.log(`  [DRY RUN] Skipping API calls.\n`);
      deployResults.push({ variant, success: true, dryRun: true, agentDiffs: agentDiffs.length, promptChanged, nodesChanged });
      continue;
    }

    // 5. Apply updates
    try {
      console.log(`  Updating conversation flow...`);
      await updateConversationFlow(cfId, flowUpdate);
      console.log(`  ✓ Flow updated`);

      console.log(`  Updating agent...`);
      await updateAgent(agentDef.agent_id, agentUpdate);
      console.log(`  ✓ Agent updated (draft)`);

      console.log(`  Publishing agent...`);
      await publishAgent(agentDef.agent_id);
      console.log(`  ✓ Agent published (live)`);
    } catch (err) {
      console.error(`  ✗ Update failed: ${err.message}`);
      deployResults.push({ variant, success: false, reason: err.message });
      continue;
    }

    // 6. Verify via retrieve
    console.log(`  Verifying...`);
    const verifiedAgent = await getAgent(agentDef.agent_id);
    const verifiedFlow = await getConversationFlow(cfId);

    const checks = [];

    // voice_id: not checked — UI-managed (Retell custom_voice_* wrapper)

    // Check data_storage_setting
    const storageOk = verifiedAgent.data_storage_setting === privacy.data_storage_setting;
    checks.push({ field: "data_storage_setting", ok: storageOk, got: verifiedAgent.data_storage_setting });

    // Check PII config
    const piiOk = JSON.stringify(verifiedAgent.pii_config) === JSON.stringify(privacy.pii_config);
    checks.push({ field: "pii_config", ok: piiOk, got: JSON.stringify(verifiedAgent.pii_config) });

    // Check global prompt length (content verification)
    const promptLenOk = (verifiedFlow.global_prompt || "").length === genFlow.global_prompt.length;
    checks.push({ field: "global_prompt.length", ok: promptLenOk, got: (verifiedFlow.global_prompt || "").length });

    // Check node count
    const nodeCountOk = (verifiedFlow.nodes || []).length === genFlow.nodes.length;
    checks.push({ field: "nodes.count", ok: nodeCountOk, got: (verifiedFlow.nodes || []).length });

    // Check webhook
    const webhookOk = verifiedAgent.webhook_url === genObj.webhook_url;
    checks.push({ field: "webhook_url", ok: webhookOk, got: verifiedAgent.webhook_url });

    const allOk = checks.every((c) => c.ok);

    for (const c of checks) {
      console.log(`    ${c.ok ? "✓" : "✗"} ${c.field}: ${c.ok ? "OK" : `expected different, got ${c.got}`}`);
    }

    // Save verified state
    writeFileSync(`${OUT_DIR}/verified_agent_${variant}.json`, JSON.stringify(verifiedAgent, null, 2) + "\n");
    writeFileSync(`${OUT_DIR}/verified_flow_${variant}.json`, JSON.stringify(verifiedFlow, null, 2) + "\n");

    deployResults.push({
      variant,
      success: allOk,
      cfId,
      agentDiffs: agentDiffs.length,
      promptChanged,
      nodesChanged,
      checks,
    });

    console.log(`  ${allOk ? "✓ All checks passed" : "✗ Some checks failed"}\n`);
  }

  // Summary
  const allSuccess = deployResults.every((r) => r.success);
  console.log(`\n=== Deploy ${dryRun ? "(DRY RUN) " : ""}Result: ${allSuccess ? "SUCCESS" : "FAILED"} ===`);
  console.log(`Mode: ${mode}`);
  console.log(`Agents: ${deployResults.filter((r) => r.success).length}/${deployResults.length} OK`);

  if (!dryRun && allSuccess) {
    console.log("\nNext steps:");
    console.log("  1. Make a test call to DE number → verify greeting");
    console.log("  2. Run: node scripts/run_chain.mjs voice --last 1");
    console.log("  3. Check Retell Dashboard → confirm voice + privacy tier");
  }

  process.exit(allSuccess ? 0 : 1);
}

// ── Main dispatch ────────────────────────────────────────────────────────

if (command === "verify") {
  runVerify().catch((err) => {
    console.error(`\nFATAL: ${err.message}`);
    process.exit(1);
  });
} else if (command === "deploy") {
  runDeploy().catch((err) => {
    console.error(`\nFATAL: ${err.message}`);
    process.exit(1);
  });
} else {
  console.error(`Unknown command: ${command}. Use 'verify' or 'deploy'.`);
  process.exit(1);
}
