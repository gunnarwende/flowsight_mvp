#!/usr/bin/env node
// REPLACE the natural pause directly before a target word with an exact silence length.
// Uses silencedetect to find the true pause boundaries (so words are never sliced).
// Output: _clean/mini_takes/Take<N>/_tenants/<slug>/<LETTER>.wav (tenant-override path,
// auto-picked up by assemble_take_simple.mjs).
//
// Usage:
//   node scripts/_ops/audio/apply_internal_breaks.mjs \
//     --tenant doerfler-ag --take 4 --wrap A \
//     --breaks "before:Dadurch:3.0,before:So:1.0"
//
// Break syntax: <position>:<word-prefix>:<seconds>
//   position = "before" → the natural pause before the matching word is REPLACED
//              with <seconds> of synthetic silence (target-pause-length).
//   word-prefix matches first word starting with this prefix (case-insensitive).
//
// Pause-detection: silencedetect with -40dB threshold, 0.2s minimum duration.

import fs from "node:fs";
import path from "node:path";
import { loadEnv, CLEAN_ROOT } from "./_lib/env.mjs";
import { run } from "./_lib/ffmpeg.mjs";
import { transcribeWithWordTimestamps } from "./_lib/whisper.mjs";

loadEnv();

const argv = process.argv.slice(2);
const argVal = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
};
const tenant = argVal("--tenant");
const takeN = argVal("--take");
const wrap = argVal("--wrap");
const breaksArg = argVal("--breaks");
if (!tenant || !takeN || !wrap || !breaksArg) {
  console.error('usage: --tenant <slug> --take <N> --wrap <A|B|...> --breaks "before:Wort:3.0,..."');
  process.exit(1);
}

// Break-Spec: "<position>:<word>[#<occurrence>]:<sec>"
//   position    = "before" (only supported value)
//   word        = word prefix (case-insensitive). Use #N suffix to target Nth match (1-indexed).
//                 Example: "before:das#4:3.0" picks the 4th word starting with "das".
//                 Default: 1st match.
//   sec         = target pause length in seconds.
const breaks = breaksArg.split(",").map((s) => {
  const [position, wordSpec, secStr] = s.trim().split(":");
  let word = wordSpec;
  let occurrence = 1;
  const hashIdx = wordSpec.indexOf("#");
  if (hashIdx !== -1) {
    word = wordSpec.slice(0, hashIdx);
    occurrence = parseInt(wordSpec.slice(hashIdx + 1), 10) || 1;
  }
  return { position, word, occurrence, sec: parseFloat(secStr) };
});

const sourceWrap = path.join(CLEAN_ROOT, "mini_takes", `Take${takeN}`, `${wrap}.wav`);
if (!fs.existsSync(sourceWrap)) {
  console.error(`source wrap not found: ${sourceWrap}`);
  process.exit(1);
}

const overrideDir = path.join(CLEAN_ROOT, "mini_takes", `Take${takeN}`, "_tenants", tenant);
fs.mkdirSync(overrideDir, { recursive: true });
const outWrap = path.join(overrideDir, `${wrap}.wav`);

const tmpDir = path.join(overrideDir, `_tmp_breaks_${wrap}`);
if (fs.existsSync(tmpDir)) {
  for (const f of fs.readdirSync(tmpDir)) try { fs.unlinkSync(path.join(tmpDir, f)); } catch {}
} else {
  fs.mkdirSync(tmpDir, { recursive: true });
}

console.log(`source: ${sourceWrap}`);
console.log("transcribing (Whisper) for word positions...");
const trans = await transcribeWithWordTimestamps(sourceWrap, { language: "de" });
console.log(`  ${trans.words.length} words`);

async function detectSilences(file, minDur) {
  const probe = await run("ffmpeg", [
    "-i", file,
    "-af", `silencedetect=noise=-40dB:duration=${minDur}`,
    "-f", "null", "-",
  ], { captureStderr: true });
  const list = [];
  let pendingStart = null;
  for (const line of probe.stderr.split(/\r?\n/)) {
    const ms = line.match(/silence_start:\s*([\d.]+)/);
    const me = line.match(/silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/);
    if (ms) pendingStart = parseFloat(ms[1]);
    else if (me && pendingStart !== null) {
      list.push({ start: pendingStart, end: parseFloat(me[1]), duration: parseFloat(me[2]) });
      pendingStart = null;
    }
  }
  return list;
}

console.log("detecting silences (two passes: 0.2s for prosodic pauses, 0.05s as fallback for word-boundaries)...");
const longSilences = await detectSilences(sourceWrap, 0.2);
const shortSilences = await detectSilences(sourceWrap, 0.05);
console.log(`  long pauses: ${longSilences.length} | short pauses: ${shortSilences.length}`);

const cuts = [];
for (const br of breaks) {
  if (br.position !== "before") {
    console.error(`unsupported position: ${br.position}`);
    process.exit(1);
  }
  const matches = trans.words.filter((w) => new RegExp(`^${br.word}`, "i").test(w.word));
  const word = matches[br.occurrence - 1];
  if (!word) {
    console.error(`word "${br.word}" occurrence #${br.occurrence} not found (got ${matches.length} matches at: ${matches.map(m => m.start.toFixed(2) + "s").join(", ")})`);
    process.exit(1);
  }
  if (br.occurrence > 1) {
    console.log(`  → "${br.word}" occurrence #${br.occurrence} = ${word.word} @ ${word.start.toFixed(2)}s (of ${matches.length} total matches)`);
  }
  // Whisper word.start drifts forward (later) into long pauses; the true word
  // onset is at the silence_end of the silence whose end is closest to (but not
  // significantly after) word.start. Prefer LONG silences (real prosodic
  // pauses), fall back to SHORT silences (word-boundary micro-pauses).
  const inRange = (list) => list
    .filter((s) => s.end >= word.start - 0.8 && s.end <= word.start + 0.4)
    .sort((a, b) => Math.abs(a.end - word.start) - Math.abs(b.end - word.start));
  let candidate = inRange(longSilences)[0] || inRange(shortSilences)[0];
  if (!candidate) {
    console.error(`no silence found near word "${br.word}" at ${word.start.toFixed(2)}s`);
    process.exit(1);
  }
  cuts.push({ silence: candidate, target: br.sec, word: word.word, wordStart: word.start });
}
cuts.sort((a, b) => a.silence.start - b.silence.start);

console.log("\ncut plan:");
for (const c of cuts) {
  const natural = c.silence.duration.toFixed(3);
  const sign = c.target >= c.silence.duration ? "+" : "−";
  const diff = Math.abs(c.target - c.silence.duration).toFixed(3);
  console.log(`  natural pause [${c.silence.start.toFixed(2)}-${c.silence.end.toFixed(2)}] = ${natural}s  →  REPLACE with ${c.target}s synthetic  (${sign}${diff}s)  before "${c.word}" @ ${c.wordStart.toFixed(2)}s`);
}

const segments = [];
let prev = 0;
let segIdx = 0;
for (const c of cuts) {
  if (c.silence.start > prev) {
    const segFile = path.join(tmpDir, `seg${segIdx++}.wav`);
    await run("ffmpeg", [
      "-y", "-i", sourceWrap,
      "-ss", prev.toFixed(3),
      "-to", c.silence.start.toFixed(3),
      "-c", "copy", segFile,
    ]);
    segments.push(segFile);
  }
  const silenceFile = path.join(tmpDir, `silence${segIdx++}.wav`);
  await run("ffmpeg", [
    "-y", "-f", "lavfi",
    "-i", "anullsrc=channel_layout=mono:sample_rate=48000",
    "-t", c.target.toFixed(3),
    "-c:a", "pcm_s16le", silenceFile,
  ]);
  segments.push(silenceFile);
  prev = c.silence.end;
}
const finalSeg = path.join(tmpDir, `seg${segIdx++}.wav`);
await run("ffmpeg", ["-y", "-i", sourceWrap, "-ss", prev.toFixed(3), "-c", "copy", finalSeg]);
segments.push(finalSeg);

const listFile = path.join(tmpDir, "concat.txt");
fs.writeFileSync(listFile, segments.map((s) => `file '${s.replace(/\\/g, "/")}'`).join("\n"));
await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", outWrap]);

for (const f of segments) try { fs.unlinkSync(f); } catch {}
try { fs.unlinkSync(listFile); fs.rmdirSync(tmpDir); } catch {}

const netDelta = cuts.reduce((s, c) => s + (c.target - c.silence.duration), 0);
console.log(`\n✓ wrote tenant-override: ${outWrap}`);
console.log(`  net duration delta vs source: ${netDelta >= 0 ? "+" : ""}${netDelta.toFixed(3)}s`);
console.log(`  cut deltas (relative to source positions, for schedule-shift):`);
let cumulative = 0;
for (const c of cuts) {
  const delta = c.target - c.silence.duration;
  cumulative += delta;
  console.log(`    after ${c.silence.start.toFixed(2)}s (silence_start before "${c.word}"): cumulative shift = ${cumulative >= 0 ? "+" : ""}${cumulative.toFixed(3)}s`);
}
