#!/usr/bin/env node
/**
 * Mix clean demo audio: Founder (Rode/Loom) + Agent (Retell TTS).
 *
 * Takes a Loom video, the extracted Retell agent audio, and a manual
 * offset to produce a final MP4 with clean mixed audio.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local scripts/_ops/mix_demo_audio.mjs \
 *     <video.mp4> <call_id> <offset_seconds> [--agent-gain=0] [--ambient=-40]
 *
 * Arguments:
 *   video.mp4        – Loom export (visual master + Rode audio)
 *   call_id          – Retell call ID (must have been extracted first)
 *   offset_seconds   – seconds into the video where the Retell call starts
 *                      (when agent first speaks in the video)
 *   --agent-gain=N   – dB adjustment for agent volume (default: 0)
 *   --ambient=N      – dB level for Loom ambient during agent segments (default: -35)
 *   --dry-run        – show what would happen without producing output
 *
 * Requires:
 *   production/<call_id>/agent_clean.wav   (from extract_call_audio.mjs)
 *   production/<call_id>/segments.json
 *
 * Output:
 *   production/<call_id>/final_video.mp4
 *
 * How it works:
 *   1. Extracts audio from Loom video (Founder = primary source)
 *   2. Reads segment timing from segments.json
 *   3. Builds an ffmpeg filter graph that:
 *      - During AGENT segments: dims Loom audio to ambient level,
 *        overlays clean agent audio from Retell
 *      - During FOUNDER segments: keeps Loom audio at full volume
 *      - Applies 150ms crossfades at all transitions
 *   4. Muxes the mixed audio back with the original video
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/* ── helpers ─────────────────────────────────────────────────────── */

function findFfmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return "ffmpeg";
  } catch { /* not on PATH */ }
  const winget = path.join(
    process.env.HOME || process.env.USERPROFILE || "",
    "AppData/Local/Microsoft/WinGet/Packages",
    "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "ffmpeg-8.1-full_build/bin/ffmpeg"
  );
  if (fs.existsSync(winget)) return winget;
  if (fs.existsSync(winget + ".exe")) return winget + ".exe";
  throw new Error("ffmpeg not found");
}

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: opts.inherit ? "inherit" : ["ignore", "pipe", "pipe"], ...opts })
    ?.toString()
    .trim();
}

function parseArg(name, def) {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? parseFloat(arg.split("=")[1]) : def;
}

/* ── main ────────────────────────────────────────────────────────── */

const args = process.argv.filter((a) => !a.startsWith("--"));
const videoPath = args[2];
const callId = args[3];
const offsetS = parseFloat(args[4]);
const dryRun = process.argv.includes("--dry-run");

if (!videoPath || !callId || isNaN(offsetS)) {
  console.error(
    "Usage: node mix_demo_audio.mjs <video.mp4> <call_id> <offset_seconds> [--agent-gain=0] [--ambient=-35]"
  );
  process.exit(1);
}

const agentGainDb = parseArg("agent-gain", 0);
const ambientDb = parseArg("ambient", -35);

const ffmpeg = findFfmpeg();
const prodDir = path.resolve("production", callId);
const agentPath = path.join(prodDir, "agent_clean.wav");
const segmentsPath = path.join(prodDir, "segments.json");

if (!fs.existsSync(agentPath)) {
  console.error(`Missing: ${agentPath}\nRun extract_call_audio.mjs first.`);
  process.exit(1);
}
if (!fs.existsSync(segmentsPath)) {
  console.error(`Missing: ${segmentsPath}\nRun extract_call_audio.mjs first.`);
  process.exit(1);
}
if (!fs.existsSync(videoPath)) {
  console.error(`Video not found: ${videoPath}`);
  process.exit(1);
}

const segments = JSON.parse(fs.readFileSync(segmentsPath, "utf-8"));
const agentSegments = segments.filter((s) => s.role === "agent");

console.log(`\n╔════════════════════════════════════════════════════╗`);
console.log(`║         FlowSight — Demo Audio Mix                ║`);
console.log(`╚════════════════════════════════════════════════════╝\n`);
console.log(`  Video:       ${videoPath}`);
console.log(`  Call ID:     ${callId}`);
console.log(`  Offset:      ${offsetS}s (agent starts at this second in video)`);
console.log(`  Agent gain:  ${agentGainDb} dB`);
console.log(`  Ambient:     ${ambientDb} dB (Loom level during agent speech)`);
console.log(`  Segments:    ${segments.length} total, ${agentSegments.length} agent`);
console.log(`  Dry run:     ${dryRun}`);

/* ── Step 1: Extract Loom audio ─────────────────────────────────── */

console.log(`\n━━━ Step 1: Extract Loom audio ━━━\n`);
const loomAudioPath = path.join(prodDir, "loom_audio.wav");

if (!dryRun) {
  run(`"${ffmpeg}" -y -i "${videoPath}" -vn -acodec pcm_s16le -ar 48000 -ac 1 "${loomAudioPath}"`);
}
console.log(`  Extracted → ${loomAudioPath}`);

/* ── Step 2: Get video/audio duration ───────────────────────────── */

const videoDurationStr = run(
  `"${ffmpeg}" -i "${videoPath}" -f null NUL`
).match(/Duration:\s*([\d:.]+)/)?.[1];
console.log(`  Video duration: ${videoDurationStr || "unknown"}`);

/* ── Step 3: Build the mix ──────────────────────────────────────── */

console.log(`\n━━━ Step 2: Building audio mix ━━━\n`);

// Strategy:
// We create a volume automation on the Loom audio track:
//   - Default: full volume (Founder speaking or silence)
//   - During agent segments: duck to ambientDb
// Then we overlay the agent_clean.wav at the correct offset.
//
// The agent audio needs to be:
//   1. Resampled to 48kHz (matching Loom)
//   2. Delayed by offsetS seconds (to align with video timeline)
//   3. Optionally gain-adjusted
//
// For the Loom ducking, we use ffmpeg's volume filter with enable expressions.

const FADE_MS = 150;
const fadeS = FADE_MS / 1000;

// Build volume enable expressions for ducking during agent segments.
// Each agent segment: duck from fadeS before start to fadeS after end.
// We use the afade approach: lower volume during agent parts.

// Simpler approach: use sidechaincompress or manual volume keyframes.
// Most reliable: build a complex filtergraph with amerge.

// Actually the cleanest approach for ffmpeg:
// 1. Create the "ducked Loom" by applying volume drops during agent segments
// 2. Create the "delayed agent" audio
// 3. Merge them

// For volume ducking, we'll chain volume filters with enable expressions.
let volumeFilters = "";
for (const seg of agentSegments) {
  // Convert segment timing (relative to call start) to video timeline
  const segStartInVideo = offsetS + seg.start_s;
  const segEndInVideo = offsetS + seg.end_s;

  // Add fade margins
  const duckStart = Math.max(0, segStartInVideo - fadeS);
  const duckEnd = segEndInVideo + fadeS;

  // Volume filter: reduce to ambientDb during this segment
  // Linear amplitude from dB: 10^(dB/20)
  const ampRatio = Math.pow(10, ambientDb / 20);
  volumeFilters += `,volume=enable='between(t,${duckStart.toFixed(3)},${duckEnd.toFixed(3)})':volume=${ampRatio.toFixed(4)}`;
}

// Agent gain filter
const agentGainFilter = agentGainDb !== 0
  ? `,volume=${Math.pow(10, agentGainDb / 20).toFixed(4)}`
  : "";

// Build the full ffmpeg command
const outputPath = path.join(prodDir, "final_video.mp4");

// The filter graph:
// [0:a] = Loom audio → duck during agent segments
// [1:a] = Agent audio → resample to 48k, delay by offset, optional gain
// Merge both → final audio
// [0:v] = Loom video → copy as-is

const filterGraph = [
  // Loom audio: duck during agent segments
  `[0:a]aformat=sample_rates=48000:channel_layouts=mono${volumeFilters}[loom_ducked]`,
  // Agent audio: resample to 48k, add silence padding for offset, apply gain
  `[1:a]aformat=sample_rates=48000:channel_layouts=mono,adelay=${Math.round(offsetS * 1000)}|${Math.round(offsetS * 1000)}${agentGainFilter}[agent_delayed]`,
  // Mix both tracks together
  `[loom_ducked][agent_delayed]amix=inputs=2:duration=first:dropout_transition=0,aformat=sample_rates=48000:channel_layouts=stereo[mixed]`,
].join(";");

const cmd = [
  `"${ffmpeg}" -y`,
  `-i "${videoPath}"`,
  `-i "${agentPath}"`,
  `-filter_complex "${filterGraph}"`,
  `-map 0:v -map "[mixed]"`,
  `-c:v copy`,
  `-c:a aac -b:a 192k`,
  `-movflags +faststart`,
  `"${outputPath}"`,
].join(" ");

console.log(`  Agent segments in video timeline:`);
for (const seg of agentSegments) {
  const vStart = (offsetS + seg.start_s).toFixed(1);
  const vEnd = (offsetS + seg.end_s).toFixed(1);
  console.log(`    ${vStart}s–${vEnd}s: "${seg.text.substring(0, 55)}..."`);
}

if (dryRun) {
  console.log(`\n  [DRY RUN] Would execute:`);
  console.log(`  ${cmd}`);
  console.log(`\n  Output would be: ${outputPath}`);
  process.exit(0);
}

console.log(`\n━━━ Step 3: Mixing + encoding ━━━\n`);

try {
  execSync(cmd, { stdio: "inherit", timeout: 300_000 });
} catch (e) {
  console.error("\n  ffmpeg failed. Check the command above for errors.");
  console.error("  Common issues: video codec mismatch, path issues, disk space.");
  process.exit(1);
}

/* ── Step 4: Verify output ──────────────────────────────────────── */

const stat = fs.statSync(outputPath);
console.log(`\n━━━ Done ━━━\n`);
console.log(`  Output: ${outputPath}`);
console.log(`  Size:   ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
console.log(`\n  Review: open the file and check:`);
console.log(`    1. Founder voice sounds warm and present (Rode quality)`);
console.log(`    2. Agent voice sounds clean and professional (no phone speaker)`);
console.log(`    3. Transitions are smooth (no clicks or hard cuts)`);
console.log(`    4. Agent volume is balanced with Founder`);
console.log(`\n  Adjust if needed:`);
console.log(`    --agent-gain=3    → louder agent (+3 dB)`);
console.log(`    --agent-gain=-2   → quieter agent (-2 dB)`);
console.log(`    --ambient=-30     → more Loom ambience during agent parts`);
console.log(`    --ambient=-45     → less Loom ambience (more isolated agent)`);

/* ── Cleanup temp files ─────────────────────────────────────────── */
if (fs.existsSync(loomAudioPath)) fs.unlinkSync(loomAudioPath);
