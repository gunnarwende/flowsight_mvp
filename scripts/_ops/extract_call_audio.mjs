#!/usr/bin/env node
/**
 * Extract clean audio tracks from a Retell voice call.
 *
 * Downloads the multi-channel WAV, splits into agent + caller channels,
 * normalises the agent track, and exports segment timing from the transcript.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local scripts/_ops/extract_call_audio.mjs <call_id>
 *
 * Output → production/<call_id>/
 *   agent_clean.wav   – RIGHT channel, normalised, HP filtered
 *   caller_raw.wav    – LEFT channel, untouched
 *   segments.json     – [{role, start_ms, end_ms, text}, …]
 *   call_meta.json    – call metadata (duration, agent, analysis)
 *
 * Env:
 *   RETELL_API_KEY  (required)
 *
 * Requires: ffmpeg on PATH or at the well-known WinGet location.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/* ── helpers ─────────────────────────────────────────────────────── */

function findFfmpeg() {
  // Try PATH first
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return "ffmpeg";
  } catch { /* not on PATH */ }

  // WinGet default location
  const winget = path.join(
    process.env.HOME || process.env.USERPROFILE || "",
    "AppData/Local/Microsoft/WinGet/Packages",
    "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "ffmpeg-8.1-full_build/bin/ffmpeg"
  );
  if (fs.existsSync(winget)) return winget;
  if (fs.existsSync(winget + ".exe")) return winget + ".exe";

  // Try common paths
  for (const p of ["/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"]) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("ffmpeg not found. Install via: winget install Gyan.FFmpeg");
}

function run(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
}

/* ── main ────────────────────────────────────────────────────────── */

const callId = process.argv[2];
if (!callId) {
  console.error("Usage: node extract_call_audio.mjs <call_id>");
  process.exit(1);
}

const apiKey = process.env.RETELL_API_KEY?.replace(/^"|"$/g, "");
if (!apiKey) {
  console.error("RETELL_API_KEY not set");
  process.exit(1);
}

const ffmpeg = findFfmpeg();
console.log(`\n  ffmpeg: ${ffmpeg}`);

/* 1. Fetch call data from Retell API */
console.log(`\n━━━ Fetching call ${callId} ━━━\n`);

const resp = await fetch(`https://api.retellai.com/v2/get-call/${callId}`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});
if (!resp.ok) {
  console.error(`Retell API error: ${resp.status} ${await resp.text()}`);
  process.exit(1);
}
const call = await resp.json();

if (!call.recording_multi_channel_url) {
  console.error("No multi-channel recording available for this call.");
  console.error("data_storage_setting:", call.data_storage_setting);
  process.exit(1);
}

const durationS = ((call.end_timestamp - call.start_timestamp) / 1000).toFixed(1);
console.log(`  Agent:    ${call.agent_name || call.agent_id}`);
console.log(`  Duration: ${durationS}s`);
console.log(`  Status:   ${call.call_status} (${call.disconnection_reason})`);

/* 2. Create output directory */
const outDir = path.resolve("production", callId);
fs.mkdirSync(outDir, { recursive: true });

/* 3. Download multi-channel WAV */
console.log(`\n━━━ Downloading multi-channel WAV ━━━\n`);
const wavResp = await fetch(call.recording_multi_channel_url);
const wavBuf = Buffer.from(await wavResp.arrayBuffer());
const rawPath = path.join(outDir, "multichannel_raw.wav");
fs.writeFileSync(rawPath, wavBuf);
console.log(`  Saved: ${rawPath} (${(wavBuf.length / 1024 / 1024).toFixed(1)} MB)`);

/* 4. Split channels */
console.log(`\n━━━ Splitting channels ━━━\n`);

const callerPath = path.join(outDir, "caller_raw.wav");
const agentRawPath = path.join(outDir, "agent_raw.wav");

// LEFT = caller, RIGHT = agent (verified empirically)
run(`"${ffmpeg}" -y -i "${rawPath}" -filter_complex "[0:a]channelsplit=channel_layout=stereo[left][right]" -map "[left]" "${callerPath}" -map "[right]" "${agentRawPath}"`);

console.log(`  caller_raw.wav  – LEFT channel (Founder/caller)`);
console.log(`  agent_raw.wav   – RIGHT channel (Agent/TTS)`);

/* 5. Normalise agent audio */
console.log(`\n━━━ Processing agent audio ━━━\n`);

const agentCleanPath = path.join(outDir, "agent_clean.wav");

// Step 1: Measure current loudness
const loudnessInfo = run(
  `"${ffmpeg}" -i "${agentRawPath}" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null NUL`
);

// Step 2: Apply normalisation + gentle high-pass (60Hz, conservative)
// Using single-pass loudnorm targeting -16 LUFS as starting point.
// The HP filter is at 60Hz (not 80Hz) to preserve warmth.
run(
  `"${ffmpeg}" -y -i "${agentRawPath}" -af "highpass=f=60:poles=2,loudnorm=I=-16:TP=-1.5:LRA=11" "${agentCleanPath}"`
);

// Measure final loudness for logging
const finalInfo = run(
  `"${ffmpeg}" -i "${agentCleanPath}" -af volumedetect -f null NUL`
);
const meanMatch = finalInfo.match(/mean_volume:\s*([-\d.]+)/);
const maxMatch = finalInfo.match(/max_volume:\s*([-\d.]+)/);
console.log(`  agent_clean.wav – normalised ~-16 LUFS, HP 60Hz`);
console.log(`  Mean: ${meanMatch?.[1] || "?"} dB, Max: ${maxMatch?.[1] || "?"} dB`);

/* 6. Extract segment timing from transcript */
console.log(`\n━━━ Extracting segments ━━━\n`);

const transcript = call.transcript_object || [];
const segments = transcript.map((item) => {
  const words = item.words || [];
  // Retell timestamps are in SECONDS (float), not milliseconds
  const startS = words[0]?.start ?? 0;
  const endS = words[words.length - 1]?.end ?? startS;
  return {
    role: item.role,          // "agent" or "user"
    start_s: parseFloat(startS.toFixed(3)),
    end_s: parseFloat(endS.toFixed(3)),
    text: item.content || "",
  };
});

fs.writeFileSync(
  path.join(outDir, "segments.json"),
  JSON.stringify(segments, null, 2)
);
console.log(`  segments.json – ${segments.length} segments`);
segments.forEach((s, i) => {
  const dur = (s.end_s - s.start_s).toFixed(1);
  console.log(`    ${i}: [${s.role}] ${s.start_s.toFixed(1)}s–${s.end_s.toFixed(1)}s (${dur}s) "${s.text.substring(0, 60)}..."`);
});

/* 7. Save call metadata */
const meta = {
  call_id: callId,
  agent_id: call.agent_id,
  agent_name: call.agent_name,
  duration_ms: call.duration_ms,
  disconnection_reason: call.disconnection_reason,
  call_successful: call.call_analysis?.call_successful,
  call_summary: call.call_analysis?.call_summary,
  custom_analysis: call.call_analysis?.custom_analysis_data,
  extracted_at: new Date().toISOString(),
};
fs.writeFileSync(
  path.join(outDir, "call_meta.json"),
  JSON.stringify(meta, null, 2)
);

/* 8. Cleanup raw files */
fs.unlinkSync(rawPath);
fs.unlinkSync(agentRawPath);

console.log(`\n━━━ Done ━━━\n`);
console.log(`  Output: ${outDir}/`);
console.log(`    agent_clean.wav  – processed agent audio (use this)`);
console.log(`    caller_raw.wav   – raw caller audio (reference)`);
console.log(`    segments.json    – timing for mix script`);
console.log(`    call_meta.json   – call metadata`);
console.log(`\n  Next: node --env-file=.env.local scripts/_ops/mix_demo_audio.mjs <video.mp4> ${callId} <offset_seconds>\n`);
