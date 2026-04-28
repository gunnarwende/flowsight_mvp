#!/usr/bin/env node
// Applies Loom-PiP overlay to existing take4_complete.mp4 → take4_with_loom.mp4.
// Skips record + compose (those have already run separately).
//
// Usage: node scripts/_ops/apply_loom_take4.mjs --slug doerfler-ag

import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ensureCircleMask, buildCircleLoomFilter } from "./_lib/renderLoomCircle.mjs";

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1] || "doerfler-ag";
const screenflowDir = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
const loomSource = join("docs", "gtm", "pipeline", "06_video_production", "video_example", "Video_default.mp4");
const LOOM_DIAMETER = 170;

const inputPath = join(screenflowDir, "take4_complete.mp4");
const outputPath = join(screenflowDir, "take4_with_loom.mp4");

if (!existsSync(inputPath)) { console.error(`missing: ${inputPath}`); process.exit(1); }
if (!existsSync(loomSource)) { console.error(`missing loom: ${loomSource}`); process.exit(1); }

const { circleMaskPng } = ensureCircleMask({ outDir: screenflowDir, diameter: LOOM_DIAMETER });
console.log(`mask: ${circleMaskPng}`);

const loomFilter = buildCircleLoomFilter({ loomIdx: 1, maskIdx: 2, diameter: LOOM_DIAMETER, label: "loomc" });

// Position: static {x: 40, y: 350} (matches pipeline_screenflow Take 4 setting)
const X = 40, Y = 350;

console.log(`\n── LOOM-PiP CIRCLE: ${inputPath} → ${outputPath}`);
const r = spawnSync("ffmpeg", [
  "-y",
  "-i", inputPath,
  "-stream_loop", "-1", "-i", loomSource,
  "-loop", "1", "-i", circleMaskPng,
  "-filter_complex",
  loomFilter + `;[0:v][loomc]overlay=x=${X}:y=${Y}:shortest=1:format=auto[out]`,
  "-map", "[out]",
  "-map", "0:a?",
  "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
  "-c:a", "copy",
  outputPath,
], { stdio: "inherit" });

if (r.status !== 0) {
  console.error("❌ Loom-PiP overlay failed");
  process.exit(1);
}
const size = statSync(outputPath).size;
console.log(`\n✓ Loom-PiP applied: ${outputPath} (${(size / 1024 / 1024).toFixed(1)} MB)`);
