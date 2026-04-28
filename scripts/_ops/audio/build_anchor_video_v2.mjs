#!/usr/bin/env node
// Anchor-Video v2: nutzt das echte freigegebene Original-Screenflow-Video
// (mit Loom-Avatar, Mimik, Animationen) und sliced/extended es pro Phase auf
// die durch die CSV-Anchors definierten Target-Längen.
//
// Source: docs/gtm/pipeline/06_video_production/screenflows/<tenant>/take2_complete.mp4 (~153s)
// CSV:    transcripts/<tenant>/take2_<variant>_full.csv
// Output: previews/<tenant>/take2_<variant>_anchor_v2.mp4 (Audio embedded)
//
// Strategy per phase:
//   - Slice source-video at SOURCE_RANGES[phase]
//   - target_duration > source: play once, then freeze last frame for the rest (tpad)
//   - target_duration < source: trim source to target (keep start, drop tail)
//
// Usage:
//   node scripts/_ops/audio/build_anchor_video_v2.mjs --tenant doerfler-ag --variant notruf

import fs from "node:fs";
import path from "node:path";
import { loadEnv, GENERATED, PIPELINE_ROOT } from "./_lib/env.mjs";
import { ffprobeInfo, run } from "./_lib/ffmpeg.mjs";

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

// SOURCE_RANGES — pro Phase-Screenshot ein Bereich [start_sec, end_sec] im Original-Video.
// Approximiert basierend auf produce_screenflow.mjs/record_leitsystem_take2.mjs Logik
// + visueller Frame-Verifikation. Founder kann Werte hier korrigieren wenn Mismatch.
const SOURCE_VIDEO = path.join(PIPELINE_ROOT, "screenflows", tenant, "take2_complete.mp4");
const SOURCE_RANGES = {
  "1":    [0.0,   2.0],   // Homescreen wallpaper
  "2":    [2.0,   4.5],   // Phone-Suche "Dörfler AG Test"
  "3":    [4.5,   9.0],   // "Wird angerufen..." (lila Phone-Display)
  "4":    [9.0,  23.0],   // "Anruf aktiv" (Konversation läuft)
  "5":    [23.0, 25.5],   // "Anruf beendet 03:11"
  "6":    [25.5, 28.5],   // Homescreen + SMS-Notif (banner)
  "7":    [28.5, 31.5],   // SMS Thread Dörfler AG
  "8":    [31.5, 33.5],   // Homescreen vor App-Open
  "9":    [33.5, 45.0],   // Leitsystem Dashboard "Guten Morgen Dörfler"
  "10":   [45.0, 49.0],   // Liste scroll-down
  "10.1": [49.0, 52.0],   // Liste weit unten
  "10.2": [52.0, 55.0],   // Scroll zurück nach oben
  "11":   [55.0, 57.0],   // KPI NEU klicken
  "12":   [57.0, 59.0],   // KPI BEI UNS klicken
  "13":   [59.0, 61.0],   // KPI ERLEDIGT klicken
  "14":   [61.0, 63.0],   // KPI BEWERTUNG klicken
  "15.1": [63.0, 64.5],   // Filter Reset (Übergang)
  "15.2": [64.5, 67.0],   // Filter normal Liste
  "16":   [67.0, 76.0],   // Case-Detail Rohrbruch (Übersicht)
  "16.1": [76.0, 84.0],   // Case-Detail scrolled (Verlauf+Anhänge)
  "16.2": [84.0, 87.0],   // Case-Detail back-top
  "17":   [87.0, 93.0],   // Dashboard zurück
};

const audioFile = path.join(GENERATED, "takes", tenant, `take2_${variant}.wav`);
const csvFile = path.join(GENERATED, "transcripts", tenant, `take2_${variant}_full.csv`);

if (!fs.existsSync(SOURCE_VIDEO)) {
  console.error(`source video missing: ${SOURCE_VIDEO}`);
  process.exit(1);
}
if (!fs.existsSync(audioFile)) {
  console.error(`audio missing: ${audioFile}`);
  process.exit(1);
}
if (!fs.existsSync(csvFile)) {
  console.error(`csv missing: ${csvFile}. Run derive_take2_transcript.mjs first.`);
  process.exit(1);
}

const sourceInfo = await ffprobeInfo(SOURCE_VIDEO);
const audioInfo = await ffprobeInfo(audioFile);
console.log(`source: ${SOURCE_VIDEO} (${sourceInfo.duration.toFixed(2)}s)`);
console.log(`audio:  ${audioFile} (${audioInfo.duration.toFixed(2)}s)`);

// Parse CSV
function parseCsvLine(line) {
  const fields = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (c === "," && !inQuote) {
      fields.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}
const csvText = fs.readFileSync(csvFile, "utf8").trim();
const csvLines = csvText.split(/\r?\n/);
csvLines.shift(); // header
const rows = csvLines.map((l) => {
  const f = parseCsvLine(l);
  return { sec: parseFloat(f[0]), screenshot: f[4] || "" };
});

// Collapse to phase-segments (start_sec, end_sec, screenshot)
const phaseSegments = [];
let curScreenshot = null;
let curStart = 0;
for (const row of rows) {
  if (row.screenshot !== curScreenshot) {
    if (curScreenshot !== null) {
      phaseSegments.push({ start: curStart, end: row.sec, screenshot: curScreenshot });
    }
    curScreenshot = row.screenshot;
    curStart = row.sec;
  }
}
phaseSegments.push({ start: curStart, end: audioInfo.duration, screenshot: curScreenshot });

console.log(`\nphase segments (target durations):`);
for (const s of phaseSegments) {
  const tdur = s.end - s.start;
  const sr = SOURCE_RANGES[s.screenshot];
  const sdur = sr ? sr[1] - sr[0] : null;
  const tag = sr ? `source ${sr[0].toFixed(1)}–${sr[1].toFixed(1)}s (${sdur.toFixed(2)}s)` : "BLACK FALLBACK";
  console.log(`  ${s.start.toFixed(1)}–${s.end.toFixed(1)}s (${tdur.toFixed(2)}s) → screenshot ${s.screenshot || "(empty)"} | ${tag}`);
}

// Determine source-video resolution (we'll match output to source)
const sourceVideoStream = await run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "default=nw=1", SOURCE_VIDEO], { captureStdout: true, captureStderr: false });
const srcW = Number((sourceVideoStream.stdout.match(/width=(\d+)/) || [])[1] || 1440);
const srcH = Number((sourceVideoStream.stdout.match(/height=(\d+)/) || [])[1] || 900);
console.log(`source video resolution: ${srcW}×${srcH}`);

const tmpDir = path.join(GENERATED, "previews", tenant, `_anchorv2_${variant}`);
fs.mkdirSync(tmpDir, { recursive: true });
for (const f of fs.readdirSync(tmpDir)) {
  if (f.endsWith(".mp4") || f.endsWith(".txt")) fs.unlinkSync(path.join(tmpDir, f));
}

// FB81 (26.04.): Phase 4 (Anruf aktiv) + Phase 5 (Anruf beendet) werden aus dem
// extended Phone-Recording mit korrekt laufendem Timer und korrekter Anrufdauer
// gezogen. Recorded by record_phone_call_visual.mjs.
const extendedPhoneVideo = path.join(GENERATED, "calls", tenant, `_phone_extended_${variant}.mp4`);
const hasExtendedPhone = fs.existsSync(extendedPhoneVideo);
let extendedPhoneInfo = null;
if (hasExtendedPhone) {
  extendedPhoneInfo = await ffprobeInfo(extendedPhoneVideo);
  console.log(`extended phone video: ${extendedPhoneVideo} (${extendedPhoneInfo.duration.toFixed(2)}s)`);
} else {
  console.warn(`⚠ extended phone video missing: ${extendedPhoneVideo}`);
  console.warn(`  → Phase 4 will fall back to source-loop+freeze. Run record_phone_call_visual.mjs first.`);
}

// Build per-segment videos by slicing source + tpad/trim
const segVideos = [];
let segIdx = 0;
for (let phaseI = 0; phaseI < phaseSegments.length; phaseI++) {
  const phase = phaseSegments[phaseI];
  const targetDur = phase.end - phase.start;
  const sr = SOURCE_RANGES[phase.screenshot];
  const segOut = path.join(tmpDir, `seg_${String(segIdx).padStart(4, "0")}.mp4`);

  // Special handling: Phase 4 (call_active) — use extended recording (timer running correctly)
  if (phase.screenshot === "4" && hasExtendedPhone) {
    const phase5 = phaseSegments[phaseI + 1];
    const phase5IsCallEnded = phase5 && phase5.screenshot === "5";
    const phase5Dur = phase5IsCallEnded ? (phase5.end - phase5.start) : 0;
    const combinedDur = targetDur + phase5Dur;
    // Take the first `combinedDur` seconds of the extended recording
    // (it has 165s call-active + 3.5s call-ended, so this fits both Phase 4 and 5)
    const takeFromStart = Math.min(combinedDur, extendedPhoneInfo.duration);
    await run("ffmpeg", [
      "-hide_banner", "-y",
      "-i", extendedPhoneVideo,
      "-t", takeFromStart.toFixed(3),
      "-vf", `fps=30,scale=${srcW}:${srcH}:force_original_aspect_ratio=decrease,pad=${srcW}:${srcH}:(ow-iw)/2:(oh-ih)/2:color=#0b1220`,
      "-an",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
      "-pix_fmt", "yuv420p",
      segOut,
    ], { captureStderr: true });
    segVideos.push(segOut);
    segIdx++;
    // Skip the next phase if it's Phase 5 (already covered)
    if (phase5IsCallEnded) {
      phaseI++;
      continue;
    }
    continue;
  }

  if (!sr) {
    await run("ffmpeg", [
      "-hide_banner", "-y",
      "-f", "lavfi", "-i", `color=c=black:s=${srcW}x${srcH}:r=30:d=${targetDur.toFixed(3)}`,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
      "-pix_fmt", "yuv420p", segOut,
    ], { captureStderr: true });
  } else {
    const [srcStart, srcEnd] = sr;
    const sourceDur = srcEnd - srcStart;
    if (targetDur >= sourceDur - 0.05) {
      const freezeDur = Math.max(0, targetDur - sourceDur);
      await run("ffmpeg", [
        "-hide_banner", "-y",
        "-ss", srcStart.toFixed(3), "-to", srcEnd.toFixed(3), "-i", SOURCE_VIDEO,
        "-vf", `tpad=stop_mode=clone:stop_duration=${freezeDur.toFixed(3)},fps=30`,
        "-an",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-t", targetDur.toFixed(3),
        segOut,
      ], { captureStderr: true });
    } else {
      await run("ffmpeg", [
        "-hide_banner", "-y",
        "-ss", srcStart.toFixed(3), "-i", SOURCE_VIDEO,
        "-t", targetDur.toFixed(3),
        "-vf", "fps=30",
        "-an",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        "-pix_fmt", "yuv420p",
        segOut,
      ], { captureStderr: true });
    }
  }
  segVideos.push(segOut);
  segIdx++;
}

console.log(`built ${segVideos.length} segment videos`);

// Concat
const concatList = path.join(tmpDir, "concat.txt");
fs.writeFileSync(concatList, segVideos.map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n"));

const slideshowPath = path.join(tmpDir, "_concat_video.mp4");
await run("ffmpeg", [
  "-hide_banner", "-y",
  "-f", "concat", "-safe", "0", "-i", concatList,
  "-c", "copy", slideshowPath,
], { captureStderr: true });

// Mux audio
const previewDir = path.join(GENERATED, "previews", tenant);
fs.mkdirSync(previewDir, { recursive: true });
const finalPath = path.join(previewDir, `take2_${variant}_anchor_v2.mp4`);
await run("ffmpeg", [
  "-hide_banner", "-y",
  "-i", slideshowPath,
  "-i", audioFile,
  "-c:v", "copy",
  "-c:a", "aac", "-b:a", "192k",
  "-shortest",
  "-movflags", "+faststart",
  finalPath,
], { captureStderr: true });

const finalInfo = await ffprobeInfo(finalPath);
console.log("");
console.log(`✓ Final video: ${finalPath}`);
console.log(`  duration: ${finalInfo.duration.toFixed(2)}s (audio=${audioInfo.duration.toFixed(2)}s)`);
console.log(`  segments: ${phaseSegments.length}`);

// Cleanup
for (const f of fs.readdirSync(tmpDir)) {
  fs.unlinkSync(path.join(tmpDir, f));
}
fs.rmdirSync(tmpDir);
