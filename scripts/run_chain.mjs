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
    "with-audio": { type: "boolean" },
    "no-whisperx": { type: "boolean" },
    "keep-audio": { type: "boolean" },
    "whisper-model": { type: "string" },
    mode: { type: "string" },
  },
});

const chainName = positionals[0];

if (values.help || !chainName) {
  console.log(`
Voice Debug Chain

Usage:
  node scripts/run_chain.mjs voice --last 2          # Spur 1: analyze last 2 calls
  node scripts/run_chain.mjs voice --id <id> ...     # Spur 1: specific call(s)
  node scripts/run_chain.mjs voice --last 1 --with-audio   # Spur 1+2: with audio forensics

Audio Forensics (Spur 2):
  --with-audio         Download recordings + run WhisperX + correlate
  --no-whisperx        Download audio only, skip WhisperX transcription
  --keep-audio         Keep WAV files after analysis (default ON in debug mode)
  --whisper-model <m>  WhisperX model size: tiny, base, small, medium (default: base)
  --mode <m>           debug (default, full artifacts) or live (redacted)

Environment:
  RETELL_API_KEY   Required. Retell API key (rk_...).

Output:
  tmp/chains/voice/reports/     Per-call .md/.json + summary
  tmp/chains/voice/audio/       WAV + WhisperX output + correlation (Spur 2)
  `.trim());
  process.exit(0);
}

if (chainName !== "voice") {
  console.error(`Unknown chain: ${chainName}. Available: voice`);
  process.exit(1);
}

// ── Run voice chain ──────────────────────────────────────────────────────

async function runVoiceChain() {
  // 0. Resolve mode + flags
  const mode = values.mode ?? "debug";
  const withAudio = values["with-audio"] ?? false;
  const noWhisperx = values["no-whisperx"] ?? false;
  const keepAudio = values["keep-audio"] ?? (mode === "debug"); // ON by default in debug
  const whisperModel = values["whisper-model"] ?? "base";

  // 0b. Resolve API key (interactive fallback if env not set)
  await ensureApiKey();

  const runId = new Date().toISOString();
  console.log(`[voice-chain] run_id=${runId} mode=${mode} audio=${withAudio}`);

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
    process.exitCode = 1;
    return;
  }

  console.log(`[voice-chain] collected ${calls.length} call(s)`);

  // 1b. Filter out ultra-short calls (< 3s = connection noise, 0:00 calls)
  const MIN_DURATION_MS = 3000;
  const preFilterCount = calls.length;
  calls = calls.filter(({ raw }) => {
    const dur = (raw.end_timestamp || 0) - (raw.start_timestamp || 0);
    if (dur > 0 && dur < MIN_DURATION_MS) {
      const shortId = (raw.call_id || "").slice(0, 12);
      console.log(`  Skipping ${shortId}: duration ${dur}ms < ${MIN_DURATION_MS}ms`);
      return false;
    }
    return true;
  });
  if (calls.length < preFilterCount) {
    console.log(`[voice-chain] filtered: ${preFilterCount} → ${calls.length} call(s) (${preFilterCount - calls.length} ultra-short skipped)`);
  }

  // 2. Analyze (Spur 1)
  console.log("[voice-chain] analyzing...");
  const { analyzeCall } = await import("./chains/voice/analyze.mjs");

  const results = [];
  for (const { callId, raw, rawPath } of calls) {
    const analysis = analyzeCall(raw);
    console.log(
      `  ${analysis.meta.call_id_short}: ${analysis.findings.length} findings, audio=${analysis.audio.available ? "yes" : "no"}`,
    );
    results.push({ callId, raw, analysis, rawPath });
  }

  // 3. Audio Forensics (Spur 2) — only if --with-audio
  if (withAudio) {
    console.log("[voice-chain] === Spur 2: Audio Forensics ===");

    const { collectAudio } = await import("./chains/voice/audio_collect.mjs");
    const { correlateCall } = await import("./chains/voice/correlate.mjs");

    // Lazy-import transcribe only if WhisperX is enabled
    let transcribeAudio;
    if (!noWhisperx) {
      ({ transcribeAudio } = await import("./chains/voice/transcribe.mjs"));
    }

    for (const r of results) {
      if (!r.analysis.audio.available) {
        console.log(`  ${r.analysis.meta.call_id_short}: no recording, skipping`);
        continue;
      }

      // 3a. Download audio
      console.log(`  ${r.analysis.meta.call_id_short}: downloading audio...`);
      const audioResult = await collectAudio(r.raw);
      if (!audioResult.wavPath) {
        console.log(`  ${r.analysis.meta.call_id_short}: download failed: ${audioResult.error}`);
        continue;
      }
      console.log(
        `  ${r.analysis.meta.call_id_short}: ${audioResult.cached ? "cached" : "downloaded"} (${audioResult.sizeMb}MB)`,
      );

      // 3b. Transcribe with WhisperX (unless --no-whisperx)
      let whisperWords = null;
      if (!noWhisperx && transcribeAudio) {
        console.log(`  ${r.analysis.meta.call_id_short}: running WhisperX (model=${whisperModel})...`);
        try {
          const txResult = await transcribeAudio(audioResult.wavPath, audioResult.callDir, {
            model: whisperModel,
          });
          console.log(
            `  ${r.analysis.meta.call_id_short}: WhisperX ${txResult.status === "cached" ? "(cached)" : "done"} — ${txResult.word_count} words, lang=${txResult.language}`,
          );

          // Load words for correlation
          const { readFileSync } = await import("fs");
          whisperWords = JSON.parse(readFileSync(txResult.words_path, "utf8"));
        } catch (err) {
          console.error(`  ${r.analysis.meta.call_id_short}: WhisperX failed: ${err.message}`);
        }
      }

      // 3c. Correlate (only if we have WhisperX words)
      if (whisperWords && whisperWords.length > 0) {
        console.log(`  ${r.analysis.meta.call_id_short}: correlating...`);
        const correlation = correlateCall(r.raw, whisperWords, audioResult.callDir);
        r.correlation = correlation;
        console.log(
          `  ${r.analysis.meta.call_id_short}: ${correlation.summary.triggers_found} triggers, ${correlation.summary.critical_count} critical`,
        );
      }

      // 3d. Cleanup audio if not keeping
      if (!keepAudio && audioResult.wavPath) {
        const { unlinkSync } = await import("fs");
        try {
          unlinkSync(audioResult.wavPath);
          console.log(`  ${r.analysis.meta.call_id_short}: audio cleaned up`);
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }

  // 4. Report
  console.log("[voice-chain] writing reports...");
  const { writeCallReport, writeSummary } = await import(
    "./chains/voice/report.mjs"
  );

  for (const r of results) {
    const extras = r.correlation ? { correlation: r.correlation } : {};
    const { mdPath, jsonPath } = writeCallReport(r.analysis, runId, extras);
    r.report = { mdPath, jsonPath };
    console.log(`  ${r.analysis.meta.call_id_short}: ${mdPath}`);
  }

  const summaryPath = writeSummary(results, runId);
  console.log(`\n[voice-chain] summary: ${summaryPath}`);

  // 5. Print verdict
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
  // Use process.exitCode instead of process.exit() to avoid UV_HANDLE_CLOSING on Windows
  process.exitCode = criticals > 0 ? 1 : 0;
}

runVoiceChain();
