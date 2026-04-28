#!/usr/bin/env node
// Transcribe take<N>.wav with word-level timestamps.
// Output: _generated/transcripts/<tenant>/take<N>_words.json
//
// Usage: node scripts/_ops/audio/transcribe_take.mjs --tenant doerfler-ag --take 4

import fs from "node:fs";
import path from "node:path";
import { loadEnv, GENERATED } from "./_lib/env.mjs";
import { transcribeWithWordTimestamps } from "./_lib/whisper.mjs";

loadEnv();

const argv = process.argv.slice(2);
const argVal = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
};
const tenant = argVal("--tenant");
const take = argVal("--take");
if (!tenant || !take) {
  console.error("usage: --tenant <slug> --take <N>");
  process.exit(1);
}

const wavFile = path.join(GENERATED, "takes", tenant, `take${take}.wav`);
if (!fs.existsSync(wavFile)) {
  console.error(`audio not found: ${wavFile}`);
  process.exit(1);
}

console.log(`transcribing: ${wavFile}`);
const result = await transcribeWithWordTimestamps(wavFile, { language: "de" });
console.log(`got ${result.words.length} words, duration=${result.duration}s`);

const outDir = path.join(GENERATED, "transcripts", tenant);
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `take${take}_words.json`);
fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
console.log(`✓ wrote ${outFile}`);
