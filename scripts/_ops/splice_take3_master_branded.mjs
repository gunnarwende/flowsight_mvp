#!/usr/bin/env node
// splice_take3_master_branded.mjs
//
// PIPELINE_BIBLE §43 Master-Source-Architektur Step 2:
// Splices the master-timed brand-overlayed wizard (take3_wizard_branded.mp4)
// with the tenant-specific leitsystem (take3_leitsystem.webm) using the
// canonical -ss 2.0 trim convention from pipeline_screenflow.mjs Step 8.
//
// Input:
//   - screenflows/<slug>/take3_wizard_branded.mp4 (40.2s, master timing,
//     tenant brand-overlay applied via build_wizard_brand_overlay.mjs)
//   - screenflows/<slug>/take3_leitsystem.webm (tenant-specific leitsystem)
//
// Output:
//   - screenflows/<slug>/take3_complete.mp4 (spliced, sidebar profile fixed,
//     ready for apply_loom_take3.mjs)
//
// Convention: -ss 2.0 trim on both inputs; total = (wizard - 2) + (leit - 2).
// For master wizard 40.2s: effective wizard = 38.2s = master phase library
// timeline (success_to_dashboard at master 38.20).
//
// Usage:
//   node scripts/_ops/splice_take3_master_branded.mjs --slug stark-haustechnik

import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
function arg(name) {
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : null;
}
const slug = arg("slug");
if (!slug) { console.error("usage: --slug <tenant>"); process.exit(1); }

const screenflowDir = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
const wizardBranded = join(screenflowDir, "take3_wizard_branded.mp4");
const leitsystem = join(screenflowDir, "take3_leitsystem.webm");
const completeOut = join(screenflowDir, "take3_complete.mp4");

for (const p of [wizardBranded, leitsystem]) {
  if (!existsSync(p)) {
    console.error(`✗ missing: ${p}`);
    process.exit(1);
  }
}

// Probe wizard dur for Wt computation (matches pipeline_screenflow.mjs)
const probeWiz = spawnSync("ffprobe", [
  "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", wizardBranded,
]);
const wizFullDur = parseFloat(probeWiz.stdout.toString().trim()) || 40.2;
const Wt = Math.max(10, wizFullDur - 2.0);

// Sidebar profile overlay (drawbox + admin name) — render via existing helper
const { renderSidebarProfile } = await import("./_lib/renderSidebarProfile.mjs");
const profilePath = await renderSidebarProfile({
  outDir: screenflowDir,
  adminName: "Admin",
  adminEmail: "gunnar.wende@flowsight.ch",
  initial: "A",
});

console.log(`splice_take3_master_branded (${slug}):`);
console.log(`  wizard_branded: ${wizardBranded} (${wizFullDur.toFixed(1)}s, trim 2.0)`);
console.log(`  leitsystem: ${leitsystem} (trim 2.0)`);
console.log(`  Wt (wizard-end): ${Wt.toFixed(1)}s`);
console.log(`  output: ${completeOut}`);

const r = spawnSync("ffmpeg", [
  "-y",
  "-ss", "2.0", "-i", wizardBranded,
  "-ss", "2.0", "-i", leitsystem,
  "-loop", "1", "-i", profilePath,
  "-filter_complex",
  "[0:v]fps=30,scale=1440:900,setsar=1,setpts=PTS-STARTPTS[w];" +
    "[1:v]fps=30,scale=1440:900,setsar=1,setpts=PTS-STARTPTS[l];" +
    "[w][l]concat=n=2:v=1[concat];" +
    `[concat]drawbox=x=0:y=780:w=155:h=120:color=#010610:t=fill:enable='gte(t,${Wt.toFixed(1)})'[boxed];` +
    `[boxed][2:v]overlay=x=5:y=700:shortest=1:format=auto:enable='gte(t,${Wt.toFixed(1)})'[out]`,
  "-map", "[out]",
  "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
  completeOut,
], { stdio: "inherit" });

if (r.status !== 0) { console.error("✗ ffmpeg failed"); process.exit(1); }

const size = statSync(completeOut).size;
console.log(`\n✓ wrote: ${completeOut} (${(size / 1024 / 1024).toFixed(1)} MB)`);
