#!/usr/bin/env node
// Assemble Take 3 or Take 4 audio: just concat A+B+C+D+E wraps.
// Currently wraps are tenant-generic. If tenant override exists at
// _clean/mini_takes/Take{N}/_tenants/<slug>/<LETTER>.wav it is used instead.
//
// Also supports Take 1 (single Master.wav — just normalize + copy).
//
// Usage:
//   node scripts/_ops/audio/assemble_take_simple.mjs --tenant doerfler-ag --take 3
//   node scripts/_ops/audio/assemble_take_simple.mjs --tenant doerfler-ag --take 4
//   node scripts/_ops/audio/assemble_take_simple.mjs --tenant doerfler-ag --take 1

import fs from "node:fs";
import path from "node:path";
import { loadEnv, CLEAN_ROOT, GENERATED } from "./_lib/env.mjs";
import { concatWavs, ffprobeInfo, loudnormTwoPass, renderWaveformPng, run } from "./_lib/ffmpeg.mjs";
import { gateLoudness, gateDuration, gateNoClipping, gateNoInternalSilence } from "./_lib/quality.mjs";

loadEnv();

const argv = process.argv.slice(2);
function argVal(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
}
const tenant = argVal("--tenant");
const takeN = argVal("--take");
if (!tenant || !takeN) {
  console.error("usage: --tenant <slug> --take <1|3|4>");
  process.exit(1);
}

function wrapFile(N, letter) {
  const tenantOverride = path.join(CLEAN_ROOT, "mini_takes", `Take${N}`, "_tenants", tenant, `${letter}.wav`);
  if (fs.existsSync(tenantOverride)) return tenantOverride;
  return path.join(CLEAN_ROOT, "mini_takes", `Take${N}`, `${letter}.wav`);
}

let sequence = [];
if (takeN === "1") {
  const master = path.join(CLEAN_ROOT, "master_takes", "take1", "Master.wav");
  sequence = [{ name: "Master", file: master }];
} else {
  sequence = ["A", "B", "C", "D", "E"].map((L) => ({ name: L, file: wrapFile(takeN, L) }));
}

for (const s of sequence) {
  if (!fs.existsSync(s.file)) {
    console.error(`missing ${s.name}: ${s.file}`);
    process.exit(1);
  }
}

console.log(`sequence for ${tenant}/Take${takeN}:`);
let totalInput = 0;
for (const s of sequence) {
  const info = await ffprobeInfo(s.file);
  totalInput += info.duration;
  console.log(`  ${s.name.padEnd(8)} ${info.duration.toFixed(2)}s`);
}
console.log(`total: ${totalInput.toFixed(2)}s`);

const outDir = path.join(GENERATED, "takes", tenant);
fs.mkdirSync(outDir, { recursive: true });
const finalOut = path.join(outDir, `take${takeN}.wav`);

const gapMs = 250;
if (sequence.length === 1) {
  // Just pass Master.wav through two-pass loudnorm
  await loudnormTwoPass(sequence[0].file, finalOut, { I: -14, TP: -1.5, LRA: 11 });
} else {
  const rawOut = path.join(outDir, `_raw_take${takeN}.wav`);
  await concatWavs(sequence.map((s) => s.file), rawOut, { gapMs });
  await loudnormTwoPass(rawOut, finalOut, { I: -14, TP: -1.5, LRA: 11 });
  fs.unlinkSync(rawOut);
}

const info = await ffprobeInfo(finalOut);
const expected = sequence.length === 1 ? totalInput : totalInput + (gapMs / 1000) * (sequence.length - 1);
const loudness = await gateLoudness(finalOut, { expectedI: -14, tolerance: 1.0, maxTP: -1.0 });
const clipping = await gateNoClipping(finalOut);
const dur = await gateDuration(finalOut, { expected, tolerance: 1.5 });
const internalSilence = await gateNoInternalSilence(finalOut, { maxInternalMs: 1800 });

try {
  await renderWaveformPng(finalOut, finalOut + ".png", { width: 2000, height: 240 });
} catch {}

const results = {
  ts: new Date().toISOString(),
  tenant,
  take: takeN,
  duration: info.duration,
  expectedDuration: expected,
  gates: { loudness, clipping, duration: dur, internalSilence },
  sequence,
};
const reportPath = path.join(outDir, `_report_take${takeN}.json`);
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

console.log("");
console.log(`take${takeN}: ${info.duration.toFixed(2)}s`);
console.log(`gates: loudness=${loudness.pass ? "PASS" : "FAIL"} clipping=${clipping.pass ? "PASS" : "FAIL"} duration=${dur.pass ? "PASS" : "FAIL"} internal_silence=${internalSilence.pass ? "PASS" : "FAIL"}`);
console.log(`out: ${finalOut}`);
