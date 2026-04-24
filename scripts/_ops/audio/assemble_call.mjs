#!/usr/bin/env node
// Assemble a full Take 2 call audio (Notruf or Preis) for one tenant.
// Sequence: agent1(tenant) → user1 → agent2 → user2 → ... → agent11
//
// Inputs:
//   Tenant greeting:     _generated/lisa_tts/tenants/<slug>/agent_01.wav
//   Generic agents:      _generated/lisa_tts/generic/agent_02..08,10,11.wav
//   Variant agent 9:     _generated/lisa_tts/generic/agent_09_<variant>.wav
//   User turns:          _clean/mini_takes/Take2/call/<Variant>/Audio/1..10.wav
//
// Output:
//   _generated/calls/<slug>/call_<variant>.wav
//
// Usage:
//   node scripts/_ops/audio/assemble_call.mjs --tenant doerfler-ag --variant notruf
//   node scripts/_ops/audio/assemble_call.mjs --tenant doerfler-ag --variant preis

import fs from "node:fs";
import path from "node:path";
import { loadEnv, PIPELINE_ROOT, CLEAN_ROOT, GENERATED } from "./_lib/env.mjs";
import { concatWavs, ffprobeInfo, loudnormTwoPass, renderWaveformPng } from "./_lib/ffmpeg.mjs";
import { gateLoudness, gateDuration, gateNoClipping } from "./_lib/quality.mjs";
import { TURN_ORDER } from "./_lib/lisa_lines.mjs";

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

const variantCap = variant === "notruf" ? "Notruf" : "Preis";

// Resolve files for the sequence
const tenantGreeting = path.join(GENERATED, "lisa_tts", "tenants", tenant, "agent_01.wav");
if (!fs.existsSync(tenantGreeting)) {
  console.error(`missing tenant greeting: ${tenantGreeting}`);
  process.exit(1);
}

const genericDir = path.join(GENERATED, "lisa_tts", "generic");
const userDir = path.join(CLEAN_ROOT, "mini_takes", "Take2", "call", variantCap, "Audio");

const sequence = [];
// Turn 1: agent (tenant greeting)
sequence.push({ role: "agent", id: 1, file: tenantGreeting });
// Turns 2-10 alternate user i → agent (i+1) but script has: a1,u1,a2,u2,...,a11
// After agent1 → user1, then agent2, user2, ... , user10, agent11
for (let i = 1; i <= 10; i++) {
  const userFile = path.join(userDir, `${i}.wav`);
  if (!fs.existsSync(userFile)) {
    console.error(`missing user audio: ${userFile}`);
    process.exit(1);
  }
  sequence.push({ role: "user", id: i, file: userFile });

  const nextAgentId = i + 1; // after user i comes agent i+1
  let agentFile;
  if (nextAgentId === 9) {
    agentFile = path.join(genericDir, `agent_09_${variant}.wav`);
  } else {
    agentFile = path.join(genericDir, `agent_${String(nextAgentId).padStart(2, "0")}.wav`);
  }
  if (!fs.existsSync(agentFile)) {
    console.error(`missing agent audio: ${agentFile}`);
    process.exit(1);
  }
  sequence.push({ role: "agent", id: nextAgentId, file: agentFile });
}

console.log(`sequence (${sequence.length} turns) for ${tenant}/${variant}:`);
let totalInput = 0;
for (const t of sequence) {
  const info = await ffprobeInfo(t.file);
  totalInput += info.duration;
  console.log(`  ${t.role.padEnd(5)} #${String(t.id).padStart(2)} ${info.duration.toFixed(2)}s  ${path.basename(t.file)}`);
}
console.log(`total input duration: ${totalInput.toFixed(2)}s`);

// Assemble with small inter-turn gap (150ms — feels natural, not rushed)
const outDir = path.join(GENERATED, "calls", tenant);
fs.mkdirSync(outDir, { recursive: true });
const rawOut = path.join(outDir, `_raw_call_${variant}.wav`);
const finalOut = path.join(outDir, `call_${variant}.wav`);

console.log(`concat into ${rawOut} ...`);
await concatWavs(sequence.map((t) => t.file), rawOut, { gapMs: 150 });

console.log(`final loudnorm → ${finalOut} ...`);
await loudnormTwoPass(rawOut, finalOut, { I: -14, TP: -1.5, LRA: 11 });
fs.unlinkSync(rawOut);

// Quality Gates
const info = await ffprobeInfo(finalOut);
const expected = totalInput + 0.15 * (sequence.length - 1);
const loudness = await gateLoudness(finalOut, { expectedI: -14, tolerance: 1.0, maxTP: -1.0 });
const clipping = await gateNoClipping(finalOut);
const dur = await gateDuration(finalOut, { expected, tolerance: 1.5 });

const pngPath = finalOut + ".png";
try {
  await renderWaveformPng(finalOut, pngPath, { width: 2000, height: 240 });
} catch {}

const results = {
  ts: new Date().toISOString(),
  tenant,
  variant,
  turns: sequence.length,
  duration: info.duration,
  expectedDuration: expected,
  gates: { loudness, clipping, duration: dur },
  sequence: await Promise.all(sequence.map(async (t) => ({ ...t, duration: (await ffprobeInfo(t.file)).duration }))),
};
const reportPath = path.join(outDir, `_report_${variant}.json`);
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

console.log("");
console.log(`call ${variant}: ${info.duration.toFixed(2)}s (expected ${expected.toFixed(2)}s)`);
console.log(`loudness: ${loudness.pass ? "PASS" : "FAIL"}  clipping: ${clipping.pass ? "PASS" : "FAIL"}  duration: ${dur.pass ? "PASS" : "FAIL"}`);
console.log(`out: ${finalOut}`);
console.log(`report: ${reportPath}`);

const failed = [loudness, clipping, dur].filter((g) => !g.pass);
if (failed.length) {
  console.log(`GATES FAILED: ${failed.length}`);
  for (const f of failed) console.log(`  - ${f.msg}`);
  process.exit(1);
}
