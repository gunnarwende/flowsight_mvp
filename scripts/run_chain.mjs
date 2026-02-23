#!/usr/bin/env node
// scripts/run_chain.mjs — Chain orchestrator
//
// Usage:
//   node scripts/run_chain.mjs voice --last 2
//   node scripts/run_chain.mjs voice --id call_abc123 call_def456
//
// Prerequisites:
//   $env:RETELL_API_KEY = "rk_..."   (PowerShell)
//   export RETELL_API_KEY=rk_...     (bash)
//
// Output: tmp/chains/voice/reports/<date>_<call_id>.{md,json} + summary.md

import { parseArgs } from "node:util";
import { readFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline";

// ── Resolve RETELL_API_KEY ───────────────────────────────────────────────

const ENV_LOCAL_PATH = "src/web/.env.local";

function loadKeyFromEnvLocal() {
  if (!existsSync(ENV_LOCAL_PATH)) {
    console.error(`[key] ${ENV_LOCAL_PATH} not found.`);
    process.exit(1);
  }

  let content;
  try {
    content = readFileSync(ENV_LOCAL_PATH, "utf8");
  } catch (err) {
    console.error(`[key] Cannot read ${ENV_LOCAL_PATH}: ${err.message}`);
    process.exit(1);
  }

  const match = content.match(/^RETELL_API_KEY\s*=\s*(.+)$/m);
  if (!match) {
    console.error(`[key] No RETELL_API_KEY entry found in ${ENV_LOCAL_PATH}.`);
    process.exit(1);
  }

  // Trim whitespace + remove surrounding quotes (single or double)
  const raw = match[1].trim().replace(/^["']|["']$/g, "");
  if (raw.length === 0) {
    console.error(`[key] RETELL_API_KEY in ${ENV_LOCAL_PATH} is empty.`);
    process.exit(1);
  }

  return raw;
}

function askYesNo(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

async function ensureApiKey() {
  if (process.env.RETELL_API_KEY) {
    console.log(`[key] RETELL_API_KEY from env (${process.env.RETELL_API_KEY.length} chars)`);
    return;
  }

  console.log("[key] RETELL_API_KEY not set in environment.");
  const yes = await askYesNo(`[key] Load from ${ENV_LOCAL_PATH}? (y/N) `);

  if (!yes) {
    console.error("[key] Aborted. Set RETELL_API_KEY in your shell first:");
    console.error("  PowerShell: $env:RETELL_API_KEY='rk_...'");
    console.error("  bash:       export RETELL_API_KEY=rk_...");
    process.exit(1);
  }

  const key = loadKeyFromEnvLocal();
  process.env.RETELL_API_KEY = key;
  console.log(`[key] loaded from ${ENV_LOCAL_PATH} (${key.length} chars)`);
}

// ── Parse CLI args ───────────────────────────────────────────────────────

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    last: { type: "string", short: "n" },
    id: { type: "string", multiple: true },
    help: { type: "boolean", short: "h" },
  },
});

const chainName = positionals[0];

if (values.help || !chainName) {
  console.log(`
Voice Debug Chain — P0

Usage:
  node scripts/run_chain.mjs voice --last 2       # analyze last 2 calls
  node scripts/run_chain.mjs voice --id <id> ...   # analyze specific call(s)

Environment:
  RETELL_API_KEY   Required. Retell API key (rk_...).

Output:
  tmp/chains/voice/reports/<date>_<call_id>.md     Per-call report (human-readable)
  tmp/chains/voice/reports/<date>_<call_id>.json   Per-call report (machine-readable)
  tmp/chains/voice/reports/<date>_summary.md       Cross-call summary
  `.trim());
  process.exit(0);
}

if (chainName !== "voice") {
  console.error(`Unknown chain: ${chainName}. Available: voice`);
  process.exit(1);
}

// ── Run voice chain ──────────────────────────────────────────────────────

async function runVoiceChain() {
  // 0. Resolve API key (interactive fallback if env not set)
  await ensureApiKey();

  const runId = new Date().toISOString();
  console.log(`[voice-chain] run_id=${runId}`);

  // 1. Collect
  console.log("[voice-chain] collecting calls from Retell API...");
  const { collectCalls } = await import("./chains/voice/collect.mjs");

  const opts = {};
  if (values.id && values.id.length > 0) {
    opts.ids = values.id;
  } else {
    opts.last = parseInt(values.last ?? "2", 10);
  }

  let calls;
  try {
    calls = await collectCalls(opts);
  } catch (err) {
    console.error(`[voice-chain] collect failed: ${err.message}`);
    // Allow event loop to drain before exit (avoids UV_HANDLE_CLOSING assertion on Windows)
    setTimeout(() => process.exit(1), 50);
    return;
  }

  console.log(`[voice-chain] collected ${calls.length} call(s)`);

  // 2. Analyze
  console.log("[voice-chain] analyzing...");
  const { analyzeCall } = await import("./chains/voice/analyze.mjs");

  const results = [];
  for (const { callId, raw, rawPath } of calls) {
    const analysis = analyzeCall(raw);
    console.log(
      `  ${analysis.meta.call_id_short}: ${analysis.findings.length} findings, audio=${analysis.audio.available ? "yes" : "no"}`,
    );
    results.push({ callId, analysis, rawPath });
  }

  // 3. Report
  console.log("[voice-chain] writing reports...");
  const { writeCallReport, writeSummary } = await import(
    "./chains/voice/report.mjs"
  );

  for (const r of results) {
    const { mdPath, jsonPath } = writeCallReport(r.analysis, runId);
    r.report = { mdPath, jsonPath };
    console.log(`  ${r.analysis.meta.call_id_short}: ${mdPath}`);
  }

  const summaryPath = writeSummary(results, runId);
  console.log(`\n[voice-chain] summary: ${summaryPath}`);

  // 4. Print verdict
  const criticals = results.reduce(
    (n, r) => n + r.analysis.findings.filter((f) => f.severity === "critical").length,
    0,
  );
  const warnings = results.reduce(
    (n, r) => n + r.analysis.findings.filter((f) => f.severity === "warning").length,
    0,
  );

  let verdict;
  if (criticals > 0) verdict = "FAIL";
  else if (warnings >= 3) verdict = "WARN";
  else verdict = "PASS";

  console.log(`\n[voice-chain] verdict: ${verdict} (${criticals} critical, ${warnings} warning)`);

  // Exit code: 0=pass, 1=fail (scheduler-ready)
  process.exit(criticals > 0 ? 1 : 0);
}

runVoiceChain();
