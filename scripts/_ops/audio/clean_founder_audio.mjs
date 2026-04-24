#!/usr/bin/env node
// Clean all Founder-recorded audios: remove tail mouse-click, trim start/end silence,
// normalize to -14 LUFS. Writes to _clean/ mirror tree — never replaces originals.
//
// Usage:
//   node scripts/_ops/audio/clean_founder_audio.mjs         # clean everything
//   node scripts/_ops/audio/clean_founder_audio.mjs --only Take2/A.wav
//   node scripts/_ops/audio/clean_founder_audio.mjs --report-only  (skip writing, QG only)
//
// Output layout (under docs/gtm/pipeline/06_video_production/_clean/):
//   master_takes/take1/Master.wav
//   mini_takes/Take2/A.wav, C.wav, D.wav, E.wav, F.wav
//   mini_takes/Take2/call/Notruf/Audio/1..10.wav
//   mini_takes/Take2/call/Preis/Audio/1..10.wav
//   mini_takes/Take3/A..E.wav
//   mini_takes/Take4/A..E.wav

import fs from "node:fs";
import path from "node:path";
import { loadEnv, PIPELINE_ROOT, CLEAN_ROOT, MINI_TAKES, MASTER_TAKES } from "./_lib/env.mjs";
import { ffprobeInfo, cleanFounderSegment, loudnormTwoPass, renderWaveformPng } from "./_lib/ffmpeg.mjs";
import { gateLoudness, gateDuration, gateNoClipping } from "./_lib/quality.mjs";

loadEnv();

const argv = process.argv.slice(2);
const onlyFlag = argv.indexOf("--only");
const only = onlyFlag >= 0 ? argv[onlyFlag + 1] : null;
const reportOnly = argv.includes("--report-only");

const TARGETS = [
  { src: path.join(MASTER_TAKES, "take1", "Master.wav"), rel: "master_takes/take1/Master.wav" },

  // Take 2 wraps
  ...["A", "C", "D", "E", "F"].map((L) => ({
    src: path.join(MINI_TAKES, "Take2", `${L}.wav`),
    rel: `mini_takes/Take2/${L}.wav`,
  })),

  // Take 2 call user turns — Notruf
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return {
      src: path.join(MINI_TAKES, "Take2", "call", "Notruf", "Audio", `${n}.wav`),
      rel: `mini_takes/Take2/call/Notruf/Audio/${n}.wav`,
    };
  }),

  // Take 2 call user turns — Preis
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return {
      src: path.join(MINI_TAKES, "Take2", "call", "Preis", "Audio", `${n}.wav`),
      rel: `mini_takes/Take2/call/Preis/Audio/${n}.wav`,
    };
  }),

  // Take 3 & 4 wraps
  ...["A", "B", "C", "D", "E"].map((L) => ({
    src: path.join(MINI_TAKES, "Take3", `${L}.wav`),
    rel: `mini_takes/Take3/${L}.wav`,
  })),
  ...["A", "B", "C", "D", "E"].map((L) => ({
    src: path.join(MINI_TAKES, "Take4", `${L}.wav`),
    rel: `mini_takes/Take4/${L}.wav`,
  })),
];

function relOk(t) {
  if (!only) return true;
  return t.rel.includes(only);
}

const TMP = path.join(PIPELINE_ROOT, "_clean", "_tmp");
fs.mkdirSync(TMP, { recursive: true });

const results = [];
let processed = 0;
let skipped = 0;
let missing = 0;

for (const t of TARGETS.filter(relOk)) {
  const srcExists = fs.existsSync(t.src);
  if (!srcExists) {
    missing += 1;
    results.push({ file: t.rel, status: "missing" });
    continue;
  }
  const outPath = path.join(CLEAN_ROOT, t.rel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  if (fs.existsSync(outPath) && !reportOnly) {
    const srcMtime = fs.statSync(t.src).mtime.getTime();
    const dstMtime = fs.statSync(outPath).mtime.getTime();
    if (dstMtime > srcMtime) {
      skipped += 1;
      // still run QG
      const qgResults = await runGates(outPath, t);
      results.push({ file: t.rel, status: "cached", ...qgResults });
      continue;
    }
  }

  if (reportOnly) {
    const qgResults = await runGates(t.src, t);
    results.push({ file: t.rel, status: "source-only", ...qgResults });
    continue;
  }

  console.log(`cleaning: ${t.rel}`);
  const tmpFile = path.join(TMP, `tmp_${Date.now()}_${path.basename(t.rel)}`);
  try {
    await cleanFounderSegment(t.src, tmpFile, { tailTrimMs: 280, fadeOutMs: 60, silenceDb: -42 });
    await loudnormTwoPass(tmpFile, outPath, { I: -14, TP: -1.5, LRA: 11 });
    fs.unlinkSync(tmpFile);
    processed += 1;
    const qgResults = await runGates(outPath, t);
    results.push({ file: t.rel, status: "cleaned", ...qgResults });
  } catch (e) {
    results.push({ file: t.rel, status: "failed", error: String(e.message || e) });
  }
}

async function runGates(file, t) {
  const srcInfo = await ffprobeInfo(t.src).catch(() => null);
  const dstInfo = await ffprobeInfo(file).catch(() => null);
  // Individual-turn tolerance is ±1.5 LUFS. Final concat audio is loudnormed again with ±1.0.
  const loudness = await gateLoudness(file, { expectedI: -14, tolerance: 1.5, maxTP: -1.0 });
  const clipping = await gateNoClipping(file);
  const duration = srcInfo && dstInfo ? { srcDur: srcInfo.duration, dstDur: dstInfo.duration } : null;
  return {
    loudness,
    clipping,
    duration,
  };
}

// Render waveforms for the report
const waveDir = path.join(PIPELINE_ROOT, "_clean", "_waveforms");
fs.mkdirSync(waveDir, { recursive: true });
for (const r of results) {
  if (r.status === "cleaned" || r.status === "cached") {
    const wavPath = path.join(CLEAN_ROOT, r.file);
    const pngPath = path.join(waveDir, r.file.replace(/\//g, "_") + ".png");
    try {
      await renderWaveformPng(wavPath, pngPath);
      r.waveform = pngPath;
    } catch {}
  }
}

// Report
const reportPath = path.join(PIPELINE_ROOT, "_clean", "_report.json");
fs.writeFileSync(reportPath, JSON.stringify({ ts: new Date().toISOString(), processed, skipped, missing, results }, null, 2));

console.log("");
console.log(`processed=${processed} cached=${skipped} missing=${missing}`);
const failed = results.filter((r) => r.status === "failed").length;
const loudnessFails = results.filter((r) => r.loudness && !r.loudness.pass).length;
console.log(`failed=${failed} loudness_fail=${loudnessFails}`);
console.log(`report: ${reportPath}`);

if (failed > 0) process.exit(1);
