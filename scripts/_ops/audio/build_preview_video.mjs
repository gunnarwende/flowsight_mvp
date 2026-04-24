#!/usr/bin/env node
// Build a preview video per take by muxing the assembled audio onto the existing
// screenflow. Strategy:
//   - If video_dur >= audio_dur: trim video to audio_dur (clean, both end together).
//   - If audio_dur > video_dur: freeze last frame of video to cover the tail.
//
// This is a REVIEW artifact — it lets Founder judge the audio flow while we know
// that Take 2/3/4 screenflows need re-rendering in Phase B to match audio length.
//
// Output:
//   _generated/previews/<tenant>/take1_preview.mp4
//   _generated/previews/<tenant>/take2_notruf_preview.mp4
//   _generated/previews/<tenant>/take2_preis_preview.mp4
//   _generated/previews/<tenant>/take3_preview.mp4
//   _generated/previews/<tenant>/take4_preview.mp4
//
// Also writes audio-only .mp3 exports (easy to listen in email).

import fs from "node:fs";
import path from "node:path";
import { loadEnv, PIPELINE_ROOT, GENERATED } from "./_lib/env.mjs";
import { ffprobeInfo, run } from "./_lib/ffmpeg.mjs";

loadEnv();

const argv = process.argv.slice(2);
function argVal(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
}
const tenant = argVal("--tenant");
if (!tenant) {
  console.error("usage: --tenant <slug>");
  process.exit(1);
}

const SCREENFLOW_DIR = path.join(PIPELINE_ROOT, "screenflows", tenant);
const TAKES_DIR = path.join(GENERATED, "takes", tenant);
const PREVIEWS_DIR = path.join(GENERATED, "previews", tenant);
const MP3_DIR = path.join(GENERATED, "audio_mp3", tenant);
fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
fs.mkdirSync(MP3_DIR, { recursive: true });

// Each "take" entry: audio file + preferred screenflow source (with_loom preferred over complete).
function screenflowFor(takeLabel) {
  const withLoom = path.join(SCREENFLOW_DIR, `${takeLabel}_with_loom.mp4`);
  const complete = path.join(SCREENFLOW_DIR, `${takeLabel}_complete.mp4`);
  if (fs.existsSync(withLoom)) return withLoom;
  if (fs.existsSync(complete)) return complete;
  return null;
}

const takes = [
  { label: "take1", audio: path.join(TAKES_DIR, "take1.wav"), out: path.join(PREVIEWS_DIR, "take1_preview.mp4"), mp3: path.join(MP3_DIR, "take1.mp3"), video: screenflowFor("take1") },
  { label: "take2_notruf", audio: path.join(TAKES_DIR, "take2_notruf.wav"), out: path.join(PREVIEWS_DIR, "take2_notruf_preview.mp4"), mp3: path.join(MP3_DIR, "take2_notruf.mp3"), video: screenflowFor("take2") },
  { label: "take2_preis", audio: path.join(TAKES_DIR, "take2_preis.wav"), out: path.join(PREVIEWS_DIR, "take2_preis_preview.mp4"), mp3: path.join(MP3_DIR, "take2_preis.mp3"), video: screenflowFor("take2") },
  { label: "take3", audio: path.join(TAKES_DIR, "take3.wav"), out: path.join(PREVIEWS_DIR, "take3_preview.mp4"), mp3: path.join(MP3_DIR, "take3.mp3"), video: screenflowFor("take3") },
  { label: "take4", audio: path.join(TAKES_DIR, "take4.wav"), out: path.join(PREVIEWS_DIR, "take4_preview.mp4"), mp3: path.join(MP3_DIR, "take4.mp3"), video: screenflowFor("take4") },
];

const results = [];

for (const t of takes) {
  if (!fs.existsSync(t.audio)) {
    console.log(`[${t.label}] SKIP: audio missing at ${t.audio}`);
    continue;
  }

  // MP3 export (review-listen friendly)
  const audioInfo = await ffprobeInfo(t.audio);
  await run(
    "ffmpeg",
    ["-hide_banner", "-y", "-i", t.audio, "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "48000", "-ac", "1", t.mp3],
    { captureStderr: true }
  );

  if (!t.video) {
    console.log(`[${t.label}] audio-only (no screenflow found)  ${audioInfo.duration.toFixed(2)}s → ${t.mp3}`);
    results.push({ label: t.label, audio_dur: audioInfo.duration, mp3: t.mp3, video_dur: null, preview: null });
    continue;
  }

  const videoInfo = await ffprobeInfo(t.video);
  const audioDur = audioInfo.duration;
  const videoDur = videoInfo.duration;

  // Strategy: if video >= audio, just trim video to audio length.
  // Otherwise, freeze last frame for remainder.
  if (videoDur >= audioDur - 0.1) {
    // Trim video to audio length + mux
    await run(
      "ffmpeg",
      ["-hide_banner", "-y", "-i", t.video, "-i", t.audio, "-t", audioDur.toFixed(3), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", t.out],
      { captureStderr: true }
    );
    results.push({ label: t.label, audio_dur: audioDur, video_dur: videoDur, strategy: "trim_video", preview: t.out, mp3: t.mp3 });
    console.log(`[${t.label}] TRIM video ${videoDur.toFixed(2)}s → ${audioDur.toFixed(2)}s`);
  } else {
    // Extend video with tpad=clone at the end to hold last frame, then mux audio.
    const tpadDur = audioDur - videoDur;
    await run(
      "ffmpeg",
      [
        "-hide_banner", "-y",
        "-i", t.video,
        "-i", t.audio,
        "-filter_complex", `[0:v]tpad=stop_mode=clone:stop_duration=${tpadDur.toFixed(3)}[v]`,
        "-map", "[v]", "-map", "1:a:0",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        "-t", audioDur.toFixed(3),
        t.out,
      ],
      { captureStderr: true }
    );
    results.push({ label: t.label, audio_dur: audioDur, video_dur: videoDur, strategy: "freeze_last_frame", extend_dur: tpadDur, preview: t.out, mp3: t.mp3 });
    console.log(`[${t.label}] FREEZE last frame: ${videoDur.toFixed(2)}s video → ${audioDur.toFixed(2)}s audio (+${tpadDur.toFixed(2)}s freeze)`);
  }

  // Verify final output
  const outInfo = await ffprobeInfo(t.out);
  const drift = Math.abs(outInfo.duration - audioDur);
  if (drift > 0.2) {
    console.log(`[${t.label}] ⚠ output duration drift ${drift.toFixed(2)}s`);
  }
  const last = results[results.length - 1];
  last.output_dur = outInfo.duration;
  last.drift = drift;
}

const reportPath = path.join(PREVIEWS_DIR, "_preview_report.json");
fs.writeFileSync(reportPath, JSON.stringify({ ts: new Date().toISOString(), tenant, results }, null, 2));

console.log("");
console.log("--- Preview Summary ---");
for (const r of results) {
  if (!r.preview) {
    console.log(`${r.label.padEnd(16)} audio_only ${r.audio_dur.toFixed(2)}s`);
  } else {
    console.log(`${r.label.padEnd(16)} a=${r.audio_dur.toFixed(2)}s v=${r.video_dur.toFixed(2)}s strat=${r.strategy} out=${r.output_dur.toFixed(2)}s`);
  }
}
console.log(`report: ${reportPath}`);
