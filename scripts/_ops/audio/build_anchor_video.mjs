#!/usr/bin/env node
// Build slideshow-style video from CSV anchor-track:
//   - Audio = take2_<variant>.wav (master)
//   - Per CSV row (0.5s): show the screenshot specified in column "Screenshot"
//   - Output MP4 with audio embedded, frame-aligned to anchor times
//
// Usage:
//   node scripts/_ops/audio/build_anchor_video.mjs --tenant doerfler-ag --variant notruf

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

const variantCap = variant === "notruf" ? "Notruf" : "Preis";
const audioFile = path.join(GENERATED, "takes", tenant, `take2_${variant}.wav`);
const csvFile = path.join(GENERATED, "transcripts", tenant, `take2_${variant}_full.csv`);
const screenshotDir = path.join(PIPELINE_ROOT, "master_takes", "pictureflow", "take2");

if (!fs.existsSync(audioFile)) {
  console.error(`audio missing: ${audioFile}`);
  process.exit(1);
}
if (!fs.existsSync(csvFile)) {
  console.error(`csv missing: ${csvFile}. Run derive_take2_transcript.mjs first.`);
  process.exit(1);
}

const audioInfo = await ffprobeInfo(audioFile);
console.log(`audio: ${audioFile} (${audioInfo.duration.toFixed(2)}s)`);

// Parse CSV (very simple parser; CSV has only quoted strings)
const csvText = fs.readFileSync(csvFile, "utf8").trim();
const csvLines = csvText.split(/\r?\n/);
const header = csvLines.shift();
console.log(`header: ${header}`);
const rows = [];
for (const line of csvLines) {
  // simple split on comma but respecting quoted strings
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
  rows.push({
    sec: parseFloat(fields[0]),
    speaker: fields[1] || "",
    content: fields[2] || "",
    phase: fields[3] || "",
    screenshot: fields[4] || "",
  });
}
console.log(`rows parsed: ${rows.length}`);

// Build a list of (start_sec, screenshot) where screenshot changes — collapsing consecutive identical screenshots
const segments = [];
let curScreenshot = null;
let curStart = 0;
for (const row of rows) {
  if (row.screenshot !== curScreenshot) {
    if (curScreenshot !== null) {
      segments.push({ start: curStart, end: row.sec, screenshot: curScreenshot });
    }
    curScreenshot = row.screenshot;
    curStart = row.sec;
  }
}
if (curScreenshot !== null) {
  segments.push({ start: curStart, end: audioInfo.duration, screenshot: curScreenshot });
}
console.log(`screenshot segments (collapsed): ${segments.length}`);
for (const s of segments) {
  console.log(`  ${s.start.toFixed(1)}–${s.end.toFixed(1)}s  →  ${s.screenshot || "(empty)"}`);
}

// Resolve screenshot files. If "" → use a black frame (handled by missing input)
function resolveScreenshot(name) {
  if (!name) return null;
  const p = path.join(screenshotDir, `${name}.png`);
  if (fs.existsSync(p)) return p;
  console.warn(`⚠ screenshot not found: ${p}`);
  return null;
}

// Build ffmpeg concat-style approach: create one tiny per-segment video, then concat all + mux audio.
// Each segment is a still image with given duration. Using filter_complex concat is simpler than
// many file passes but with 200+ segments it gets unwieldy. Strategy: render each segment to a
// per-segment short MP4, then ffmpeg concat-demuxer to glue.
const tmpDir = path.join(GENERATED, "previews", tenant, `_anchorvid_${variant}`);
fs.mkdirSync(tmpDir, { recursive: true });
// Clean any leftovers
for (const f of fs.readdirSync(tmpDir)) {
  if (f.endsWith(".mp4") || f.endsWith(".txt")) fs.unlinkSync(path.join(tmpDir, f));
}

// Determine target frame size from first available screenshot
let frameW = 1280;
let frameH = 720;
for (const seg of segments) {
  const f = resolveScreenshot(seg.screenshot);
  if (f) {
    try {
      const fInfo = await run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "default=nw=1", f], { captureStdout: true, captureStderr: false });
      const w = (fInfo.stdout.match(/width=(\d+)/) || [])[1];
      const h = (fInfo.stdout.match(/height=(\d+)/) || [])[1];
      if (w && h) { frameW = Number(w); frameH = Number(h); }
    } catch {}
    break;
  }
}
// Ensure even dimensions for libx264
if (frameW % 2) frameW -= 1;
if (frameH % 2) frameH -= 1;
console.log(`frame size: ${frameW}×${frameH}`);

// Generate per-segment short videos
const segVideos = [];
let segIdx = 0;
for (const seg of segments) {
  const dur = Math.max(0.05, seg.end - seg.start);
  const segVid = path.join(tmpDir, `seg_${String(segIdx).padStart(4, "0")}.mp4`);
  const screenshotPath = resolveScreenshot(seg.screenshot);
  if (screenshotPath) {
    await run("ffmpeg", [
      "-hide_banner", "-y",
      "-loop", "1", "-t", dur.toFixed(3), "-i", screenshotPath,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
      "-pix_fmt", "yuv420p",
      "-vf", `scale=${frameW}:${frameH}:force_original_aspect_ratio=decrease,pad=${frameW}:${frameH}:(ow-iw)/2:(oh-ih)/2:color=black`,
      "-r", "30",
      segVid,
    ], { captureStderr: true });
  } else {
    // Fall back to black frame
    await run("ffmpeg", [
      "-hide_banner", "-y",
      "-f", "lavfi", "-i", `color=c=black:s=${frameW}x${frameH}:r=30:d=${dur.toFixed(3)}`,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
      "-pix_fmt", "yuv420p",
      segVid,
    ], { captureStderr: true });
  }
  segVideos.push(segVid);
  segIdx++;
}

// Concat all per-segment videos via demuxer
const concatList = path.join(tmpDir, "concat.txt");
fs.writeFileSync(concatList, segVideos.map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n"));

const slideshowPath = path.join(tmpDir, "_slideshow.mp4");
await run("ffmpeg", [
  "-hide_banner", "-y",
  "-f", "concat", "-safe", "0", "-i", concatList,
  "-c", "copy",
  slideshowPath,
], { captureStderr: true });

// Mux audio onto slideshow
const previewDir = path.join(GENERATED, "previews", tenant);
fs.mkdirSync(previewDir, { recursive: true });
const finalPath = path.join(previewDir, `take2_${variant}_anchor_v1.mp4`);
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
console.log(`✓ Slideshow video: ${finalPath}`);
console.log(`  duration: ${finalInfo.duration.toFixed(2)}s (audio=${audioInfo.duration.toFixed(2)}s)`);
console.log(`  segments: ${segments.length} (collapsed from ${rows.length} rows)`);

// Clean up per-segment temp files
for (const f of fs.readdirSync(tmpDir)) {
  fs.unlinkSync(path.join(tmpDir, f));
}
fs.rmdirSync(tmpDir);
