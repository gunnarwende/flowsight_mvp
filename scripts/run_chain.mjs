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
    process.exit(1);
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
