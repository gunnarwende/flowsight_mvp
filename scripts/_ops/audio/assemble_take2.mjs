#!/usr/bin/env node
// Assemble the full Take 2 audio per tenant × variant:
//   A (wrap before) → Call (notruf|preis) → C → D → E → F (wrap after)
//
// Inputs:
//   _clean/mini_takes/Take2/A.wav, C.wav, D.wav, E.wav, F.wav  (shared across tenants)
//   _generated/calls/<slug>/call_<variant>.wav                  (per tenant per variant)
//
// Output:
//   _generated/takes/<slug>/take2_<variant>.wav
//
// NOTE: Founder wraps A/C/D/E/F are currently GENERIC (no tenant-name mention).
// They may contain "heute fange ich mal an..." style narration that is cross-tenant.
// If a future wrap needs tenant-swap (e.g. "bei der Firma X gehört"), we add a tenant/
// override layer under _clean/mini_takes/Take2/_tenants/<slug>/<LETTER>.wav.
//
// Usage:
//   node scripts/_ops/audio/assemble_take2.mjs --tenant doerfler-ag --variant notruf
//   node scripts/_ops/audio/assemble_take2.mjs --tenant doerfler-ag --variant preis

import fs from "node:fs";
import path from "node:path";
import { loadEnv, PIPELINE_ROOT, CLEAN_ROOT, GENERATED } from "./_lib/env.mjs";
import { concatWavs, ffprobeInfo, loudnormTwoPass, renderWaveformPng } from "./_lib/ffmpeg.mjs";
import { gateLoudness, gateDuration, gateNoClipping, gateNoInternalSilence } from "./_lib/quality.mjs";

loadEnv();

const argv = process.argv.slice(2);
function argVal(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
}
const tenant = argVal("--tenant");
const variant = argVal("--variant");
if (!tenant || !["notruf", "preis"].includes(variant)) {
  console.error("usage: --tenant <slug> --variant <notruf|preis>");
  process.exit(1);
}

function wrapFile(letter) {
  const tenantOverride = path.join(CLEAN_ROOT, "mini_takes", "Take2", "_tenants", tenant, `${letter}.wav`);
  if (fs.existsSync(tenantOverride)) return tenantOverride;
  return path.join(CLEAN_ROOT, "mini_takes", "Take2", `${letter}.wav`);
}

const callFile = path.join(GENERATED, "calls", tenant, `call_${variant}.wav`);
if (!fs.existsSync(callFile)) {
  console.error(`missing call: ${callFile}`);
  process.exit(1);
}

const sequence = [
  { name: "A (wrap-before)", file: wrapFile("A") },
  { name: `Call (${variant})`, file: callFile },
  { name: "C", file: wrapFile("C") },
  { name: "D", file: wrapFile("D") },
  { name: "E", file: wrapFile("E") },
  { name: "F (wrap-after)", file: wrapFile("F") },
];

for (const s of sequence) {
  if (!fs.existsSync(s.file)) {
    console.error(`missing ${s.name}: ${s.file}`);
    process.exit(1);
  }
}

console.log(`sequence for ${tenant}/${variant}:`);
let totalInput = 0;
for (const s of sequence) {
  const info = await ffprobeInfo(s.file);
  totalInput += info.duration;
  console.log(`  ${s.name.padEnd(18)} ${info.duration.toFixed(2)}s  ${path.basename(s.file)}`);
}
console.log(`total: ${totalInput.toFixed(2)}s (${(totalInput / 60).toFixed(2)} min)`);

const outDir = path.join(GENERATED, "takes", tenant);
fs.mkdirSync(outDir, { recursive: true });
const rawOut = path.join(outDir, `_raw_take2_${variant}.wav`);
const finalOut = path.join(outDir, `take2_${variant}.wav`);

console.log(`concat ...`);
await concatWavs(sequence.map((s) => s.file), rawOut, { gapMs: 250 });
console.log(`final loudnorm ...`);
await loudnormTwoPass(rawOut, finalOut, { I: -14, TP: -1.5, LRA: 11 });
fs.unlinkSync(rawOut);

const info = await ffprobeInfo(finalOut);
const expected = totalInput + 0.25 * (sequence.length - 1);
const loudness = await gateLoudness(finalOut, { expectedI: -14, tolerance: 1.0, maxTP: -1.0 });
const clipping = await gateNoClipping(finalOut);
const dur = await gateDuration(finalOut, { expected, tolerance: 2.0 });
// 1800ms = natural speech-thinking pause threshold. Anything longer signals dead air.
const internalSilence = await gateNoInternalSilence(finalOut, { maxInternalMs: 1800 });

const pngPath = finalOut + ".png";
try {
  await renderWaveformPng(finalOut, pngPath, { width: 2400, height: 280 });
} catch {}

const results = {
  ts: new Date().toISOString(),
  tenant,
  variant,
  duration: info.duration,
  expectedDuration: expected,
  gates: { loudness, clipping, duration: dur, internalSilence },
  sequence,
};
const reportPath = path.join(outDir, `_report_take2_${variant}.json`);
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

console.log("");
console.log(`take2 ${variant}: ${info.duration.toFixed(2)}s (${(info.duration / 60).toFixed(2)} min)`);
console.log(`gates: loudness=${loudness.pass ? "PASS" : "FAIL"} clipping=${clipping.pass ? "PASS" : "FAIL"} duration=${dur.pass ? "PASS" : "FAIL"} internal_silence=${internalSilence.pass ? "PASS" : "FAIL"}`);
console.log(`out: ${finalOut}`);
console.log(`report: ${reportPath}`);

const failed = [loudness, clipping, dur, internalSilence].filter((g) => !g.pass);
if (failed.length) {
  console.log(`GATES FAILED: ${failed.length}`);
  for (const f of failed) console.log(`  - ${f.msg}`);
  // Don't exit non-zero — internal silence is a warning, not a blocker (might indicate thinking-pause)
}
