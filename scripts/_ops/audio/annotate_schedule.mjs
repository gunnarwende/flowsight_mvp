#!/usr/bin/env node
// Re-fill column C ("speak-hint") in take<N>.schedule by mapping word-timestamps
// from take<N>_words.json onto the time-ranges of each phase.
//
// Workflow:
//   1. Parse schedule (phase_name + start-end)
//   2. Load take<N>_words.json (Whisper output)
//   3. For each phase: collect words whose midpoint falls inside [start, end]
//   4. Take first up to MAX_WORDS as the speak-hint (or "(–)" if silent)
//   5. Rewrite schedule with updated trailing comments — preserves header,
//      Wrap-section dividers, and existing time-ranges.
//
// Usage: node scripts/_ops/audio/annotate_schedule.mjs --tenant doerfler-ag --take 4

import fs from "node:fs";
import path from "node:path";
import { GENERATED } from "./_lib/env.mjs";

const argv = process.argv.slice(2);
const argVal = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
};
const tenant = argVal("--tenant");
const take = argVal("--take");
const MAX_WORDS = parseInt(argVal("--max-words") || "4", 10);
if (!tenant || !take) {
  console.error("usage: --tenant <slug> --take <N> [--max-words 4]");
  process.exit(1);
}

const schedulePath = path.join(GENERATED, "transcripts", tenant, `take${take}.schedule`);
const wordsPath = path.join(GENERATED, "transcripts", tenant, `take${take}_words.json`);
if (!fs.existsSync(schedulePath)) {
  console.error(`schedule not found: ${schedulePath}`);
  process.exit(1);
}
if (!fs.existsSync(wordsPath)) {
  console.error(`words file not found: ${wordsPath}. Run transcribe_take.mjs first.`);
  process.exit(1);
}

const words = JSON.parse(fs.readFileSync(wordsPath, "utf8")).words;
console.log(`loaded ${words.length} words`);

// M:SS,T → seconds
function parseTime(s) {
  if (!s.includes(":")) return parseFloat(s);
  const [mm, rest] = s.split(":");
  const [ss, tenths] = rest.replace(",", ".").split(".");
  return parseInt(mm) * 60 + parseFloat(`${ss}.${tenths || 0}`);
}

const lines = fs.readFileSync(schedulePath, "utf8").split(/\r?\n/);
const out = [];
let updated = 0;

for (const line of lines) {
  const trimmed = line.trim();
  // Match a real schedule line: phase_name <ws> start-end [optional trailing comment]
  const m = line.match(/^(\s*)(\S+)(\s+)(\S+)\s*-\s*(\S+?)(\s*#.*)?$/);
  if (!trimmed || trimmed.startsWith("#") || !m) {
    out.push(line);
    continue;
  }
  const [, leadingWS, phaseName, midWS, startStr, endStr] = m;
  let start, end;
  try {
    start = parseTime(startStr);
    end = parseTime(endStr);
  } catch {
    out.push(line);
    continue;
  }

  // Collect words whose midpoint is in [start, end]
  const inRange = words.filter((w) => {
    const mid = (w.start + w.end) / 2;
    return mid >= start && mid < end;
  });
  const hint = inRange.length === 0
    ? "(–)"
    : `"${inRange.slice(0, MAX_WORDS).map((w) => w.word).join(" ")}${inRange.length > MAX_WORDS ? " …" : ""}"`;

  // Reconstruct line with aligned columns:
  //   <phase_name>  <PADDED ws>  <start-end>  <PADDED ws>  # <hint>
  const phaseCol = phaseName.padEnd(26, " ");
  const timeCol = `${startStr}-${endStr}`.padEnd(15, " ");
  const newLine = `${leadingWS}${phaseCol} ${timeCol}  # ${hint}`;
  out.push(newLine);
  updated++;
}

fs.writeFileSync(schedulePath, out.join("\n"));
console.log(`✓ updated ${updated} phase lines in ${schedulePath}`);
