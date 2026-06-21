#!/usr/bin/env node
// Generic Anchor-Video Builder from Phase-Schedule.
//
// Reads:
//   - _generated/transcripts/<tenant>/take<N>_<variant>.schedule
//     (Founder-edited file; format: "<phase_name>  <start_sec>-<end_sec>")
//   - phase_library_defs/take<N>_<industry>.json
//     (phase definitions: which source range per phase name)
//   - _generated/takes/<tenant>/take<N>_<variant>.wav
//     (audio master)
//
// Builds: _generated/previews/<tenant>/take<N>_<variant>_anchor.mp4
//
// Usage:
//   node scripts/_ops/audio/build_from_phase_schedule.mjs \
//        --tenant doerfler-ag --take 2 --variant notruf [--industry sanitaer]

import fs from "node:fs";
import path from "node:path";
import { loadEnv, GENERATED, PIPELINE_ROOT, REPO_ROOT } from "./_lib/env.mjs";
import { ffprobeInfo, run } from "./_lib/ffmpeg.mjs";
import { parseTime, formatTime } from "./_lib/time_format.mjs";
import { pickFreezeAnchor, measureSharpness } from "./_lib/sharpness.mjs";

loadEnv();

const argv = process.argv.slice(2);
function argVal(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
}
const tenant = argVal("--tenant");
const take = argVal("--take") || "2";
const variant = argVal("--variant"); // optional — Take 2 hat notruf/preis, Take 3+4 sind variant-los
const industry = argVal("--industry") || "sanitaer";
if (!tenant) {
  console.error("usage: --tenant <slug> [--take 2|3|4] [--variant notruf|preis] [--industry sanitaer|...]");
  process.exit(1);
}
// Filename suffix: "<take>_<variant>" wenn variant gesetzt, sonst "<take>"
const fileSuffix = variant ? `${take}_${variant}` : `${take}`;

// Load phase library definition + tenant-override (skalability fix 27.04.):
// Per-Recording-Variance kann nicht 100% wegkonfiguriert werden (OS-Scheduling).
// Tenant-spezifische Source-Ranges via _overrides/<tenant>/take<N>_<industry>.json
// erlauben präzise Calibration pro Aufnahme.
const defPath = path.join(PIPELINE_ROOT, "phase_library_defs", `take${take}_${industry}.json`);
const overridePath = path.join(PIPELINE_ROOT, "phase_library_defs", "_overrides", tenant, `take${take}_${industry}.json`);
if (!fs.existsSync(defPath)) {
  console.error(`Phase library def missing: ${defPath}`);
  process.exit(1);
}
const def = JSON.parse(fs.readFileSync(defPath, "utf8"));
let overridesApplied = 0;
if (fs.existsSync(overridePath)) {
  const override = JSON.parse(fs.readFileSync(overridePath, "utf8"));
  const overrideByName = {};
  for (const p of override.phases || []) overrideByName[p.name] = p;
  for (const p of def.phases) {
    if (overrideByName[p.name]) {
      if (overrideByName[p.name].range) p.range = overrideByName[p.name].range;
      overridesApplied++;
    }
  }
  console.log(`ℹ tenant-override applied: ${overridesApplied} phases adjusted (${overridePath})`);
}
const phasesByName = {};
for (const p of def.phases) phasesByName[p.name] = p;

// Resolve sources
function resolveSourcePath(template) {
  return path.join(REPO_ROOT, "docs/gtm/pipeline/06_video_production", template.replace(/\{tenant\}/g, tenant));
}
const sources = {};
for (const [key, template] of Object.entries(def.sources)) {
  sources[key] = resolveSourcePath(template);
}

// ─── Loom-Source-Verification-Guard (28.04. Bug-Lehre) ───────────────────────
// Take 3 source MUSS Loom-Face enthalten. Falls Source-File durch eine Loom-
// lose Variante überschrieben wurde (passierte 27.04. zwischen 21:10 und 21:31),
// bricht der Build mit klarer Fehlermeldung statt still einen Loom-losen Build
// zu produzieren.
//
// Detection: Pixel-Brightness an Coord (1160, 180) im Source-Recording bei
// Source-Time 10s. Mit Loom (Founder-Face Center, neue FB7-Position): brightness
// ~140 (Hautfarbe). Ohne Loom (weisser Hintergrund): brightness ~249.
// Threshold 200 (robust).
if (take === "3" && !process.env.LOOM_GUARD_SKIP) {
  const sourceFile = sources.original;
  if (sourceFile && fs.existsSync(sourceFile)) {
    try {
      const tmpProbe = path.join(GENERATED, `_loom_probe_${tenant}_take${take}.png`);
      await run("ffmpeg", [
        "-hide_banner", "-loglevel", "error", "-y",
        "-ss", "10", "-i", sourceFile, "-frames:v", "1",
        "-vf", "crop=10:10:1156:176", tmpProbe,
      ]);
      const { createRequire } = await import("node:module");
      const requireFromWeb = createRequire(path.join(REPO_ROOT, "src", "web", "package.json"));
      const sharp = requireFromWeb("sharp");
      const buf = await sharp(tmpProbe).raw().toBuffer();
      let sum = 0;
      const channels = buf.length / (10 * 10);
      for (let i = 0; i < buf.length; i += channels) sum += (buf[i] + buf[i+1] + buf[i+2]) / 3;
      const meanBrightness = sum / 100;
      try { fs.unlinkSync(tmpProbe); } catch {}
      if (meanBrightness > 200) {
        console.error(`✗ LOOM-GUARD FAIL: ${sourceFile}`);
        console.error(`  Source @ 10s coord (1234,290) brightness = ${meanBrightness.toFixed(0)} (expected <200 wenn Loom-Face vorhanden).`);
        console.error(`  Diese Source enthält KEINEN Loom-Face-Overlay. Build abgebrochen.`);
        console.error(`  Fix: 'cp ${sourceFile.replace('.mp4', '_old.mp4')} ${sourceFile}' falls _old-Variante existiert.`);
        process.exit(7);
      }
      console.log(`✓ Loom-Guard: brightness ${meanBrightness.toFixed(0)} (<200) — Loom-Face im Source bestätigt`);
    } catch (e) {
      console.warn(`⚠ Loom-Guard skipped (probe error: ${e.message?.slice(0, 200)})`);
    }
  }
}

// Read schedule
const schedulePath = path.join(GENERATED, "transcripts", tenant, `take${fileSuffix}.schedule`);
if (!fs.existsSync(schedulePath)) {
  console.error(`Schedule file missing: ${schedulePath}`);
  console.error(`Generate phase library first + create schedule:`);
  console.error(`  node scripts/_ops/audio/phase_library_extract.mjs --tenant ${tenant} --take ${take} --industry ${industry}`);
  process.exit(1);
}
const scheduleRaw = fs.readFileSync(schedulePath, "utf8");
const scheduleEntries = [];
for (const line of scheduleRaw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  // FB86 (26.04.): Format akzeptiert beide:
  //   - decimal seconds:    "phone_homescreen 0.0-36.5"
  //   - M:SS,T (Minuten:Sek,Zehntel): "phone_homescreen 0:00,0-0:36,5"
  // Regex matches anything that's not whitespace+dash for start/end.
  const m = trimmed.match(/^(\S+)\s+(\S+)\s*-\s*(\S+?)\s*(?:#.*)?$/);
  if (!m) {
    console.warn(`⚠ skipping unparseable line: ${trimmed}`);
    continue;
  }
  const [, phaseName, startStr, endStr] = m;
  let start, end;
  try {
    start = parseTime(startStr);
    end = parseTime(endStr);
  } catch (e) {
    console.warn(`⚠ time-parse error on line "${trimmed}": ${e.message}`);
    continue;
  }
  if (!phasesByName[phaseName]) {
    console.error(`✗ unknown phase: "${phaseName}". Valid: ${Object.keys(phasesByName).join(", ")}`);
    process.exit(1);
  }
  scheduleEntries.push({ phaseName, start, end, dur: end - start });
}

if (scheduleEntries.length === 0) {
  console.error(`Schedule is empty: ${schedulePath}`);
  process.exit(1);
}

// Continuity check: each entry's end must equal next entry's start (gaps caught later)
for (let i = 0; i < scheduleEntries.length - 1; i++) {
  const cur = scheduleEntries[i];
  const next = scheduleEntries[i + 1];
  if (Math.abs(cur.end - next.start) > 0.05) {
    console.warn(`⚠ gap/overlap between phases at ${cur.end.toFixed(2)}s vs ${next.start.toFixed(2)}s`);
  }
}

// Audio file check — V102 universal audio fallback (28.05.):
// Per-tenant audio at _generated/takes/<tenant>/take<N>_<variant>.wav is preferred.
// If missing (new tenant), fall back to universal locked audio at
// _locked/audio/take<N>_<variant>.wav (extracted from V50 once, used for all).
let audioFile = path.join(GENERATED, "takes", tenant, `take${fileSuffix}.wav`);
if (!fs.existsSync(audioFile)) {
  const universalAudio = path.join(PIPELINE_ROOT, "_locked", "audio", `take${fileSuffix}.wav`);
  if (fs.existsSync(universalAudio)) {
    console.log(`per-tenant audio missing → using universal locked: ${universalAudio}`);
    audioFile = universalAudio;
  } else {
    console.error(`audio missing: ${audioFile} (and universal fallback ${universalAudio} also missing)`);
    process.exit(1);
  }
}
const audioInfo = await ffprobeInfo(audioFile);
const totalScheduled = scheduleEntries[scheduleEntries.length - 1].end;
console.log(`audio: ${audioFile} (${formatTime(audioInfo.duration)} = ${audioInfo.duration.toFixed(2)}s)`);
console.log(`schedule total: ${formatTime(totalScheduled)} = ${totalScheduled.toFixed(2)}s (${scheduleEntries.length} entries)`);
let totalScheduledFinal = totalScheduled;
if (Math.abs(audioInfo.duration - totalScheduled) > 0.1) {
  const diff = audioInfo.duration - totalScheduled;
  if (diff > 0) {
    // FB88: Audio länger als Schedule → letzte Phase auto-extend.
    const last = scheduleEntries[scheduleEntries.length - 1];
    last.end = audioInfo.duration;
    last.dur = last.end - last.start;
    totalScheduledFinal = audioInfo.duration;
    console.log(`ℹ schedule auto-extended last phase to match audio: ${last.phaseName} → ${formatTime(last.end)} (+${diff.toFixed(2)}s)`);
  } else if (Math.abs(diff) < 5.0) {
    // §40: Audio kürzer als Schedule → letzte Phase auto-shrink (Skalierungs-Fix).
    // Tritt auf wenn Schedule von anderem Tenant kopiert wurde mit leicht anderem Audio.
    const last = scheduleEntries[scheduleEntries.length - 1];
    last.end = audioInfo.duration;
    last.dur = Math.max(0.1, last.end - last.start);
    totalScheduledFinal = audioInfo.duration;
    console.log(`ℹ schedule auto-shrunk last phase to match audio: ${last.phaseName} → ${formatTime(last.end)} (${diff.toFixed(2)}s)`);
  } else {
    console.warn(`⚠ schedule duration ${totalScheduled.toFixed(2)}s LONGER than audio ${audioInfo.duration.toFixed(2)}s by ${Math.abs(diff).toFixed(2)}s — too large, fix schedule manually`);
  }
}

// Determine output resolution from "original" source
const originalSource = sources["original"];
let frameW = 1440, frameH = 900;
if (fs.existsSync(originalSource)) {
  const probe = await run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "default=nw=1", originalSource], { captureStdout: true, captureStderr: false });
  frameW = Number((probe.stdout.match(/width=(\d+)/) || [])[1] || 1440);
  frameH = Number((probe.stdout.match(/height=(\d+)/) || [])[1] || 900);
}
console.log(`output resolution: ${frameW}×${frameH}`);

const tmpDir = path.join(GENERATED, "previews", tenant, `_schedule_${take}_${variant}`);
fs.mkdirSync(tmpDir, { recursive: true });
for (const f of fs.readdirSync(tmpDir)) {
  if (f.endsWith(".mp4") || f.endsWith(".txt")) fs.unlinkSync(path.join(tmpDir, f));
}

// Build per-phase video segments
console.log(`\nbuilding ${scheduleEntries.length} segments...`);
const segVideos = [];
// §40 Sharpness-Gate: collected auto-snap decisions for post-build report.
const sharpnessReport = [];
for (let i = 0; i < scheduleEntries.length; i++) {
  const entry = scheduleEntries[i];
  const phase = phasesByName[entry.phaseName];
  const targetDur = entry.dur;

  // Resolve source for this phase. extended_phone → variant-specific.
  let sourceKey = phase.source;
  if (sourceKey === "extended_phone") {
    sourceKey = `extended_phone_${variant}`;
  }
  const sourceFile = sources[sourceKey];
  const segOut = path.join(tmpDir, `seg_${String(i).padStart(4, "0")}.mp4`);

  if (!sourceFile || !fs.existsSync(sourceFile)) {
    console.log(`  ✗ ${entry.phaseName.padEnd(32)} BLACK (source ${sourceKey} missing)`);
    await run("ffmpeg", [
      "-hide_banner", "-y",
      "-f", "lavfi", "-i", `color=c=black:s=${frameW}x${frameH}:r=30:d=${targetDur.toFixed(3)}`,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
      "-pix_fmt", "yuv420p", segOut,
    ], { captureStderr: true });
    segVideos.push(segOut);
    continue;
  }

  // FB84-bug fix: extended_phone duration variiert per variant (Notruf 168.5s, Preis 164.5s).
  // Statt hartcodierter range im JSON dynamisch aus Datei-Dauer ableiten.
  let [srcStart, srcEnd] = phase.range;
  if (phase.source === "extended_phone") {
    const fileDur = (await ffprobeInfo(sourceFile)).duration;
    // Convention: extended_phone has [call_active_dur seconds] + 3.5s "Anruf beendet"
    const ENDED_TAIL_S = 3.5;
    if (phase.name === "phone_call_active") {
      srcStart = 0;
      srcEnd = Math.max(0, fileDur - ENDED_TAIL_S);
    } else if (phase.name === "phone_call_ended") {
      srcStart = Math.max(0, fileDur - ENDED_TAIL_S);
      srcEnd = fileDur;
    }
  }
  const rawSourceDur = srcEnd - srcStart;
  // FB95: optional speed factor per phase (e.g. 0.5 = play 2x slower). Stretches input
  // time via setpts so a 6s source range plays for 12s in output at speed=0.5.
  const speed = phase.speed && phase.speed > 0 ? phase.speed : 1.0;
  const speedFilter = speed !== 1.0 ? `setpts=${(1 / speed).toFixed(4)}*PTS,` : "";
  const sourceDur = rawSourceDur / speed;

  if (targetDur >= sourceDur - 0.05) {
    // Source range fits (after speed) → play range, freeze last frame for the rest.
    // §40 Sharpness-Gate: if freezeDur >= 1.0s, scan tail for sharpest frame and snap
    // srcEnd there. Avoids landing freeze on a mid-animation/blurry frame
    // (FB-Sharpness: "Website-Formular...", "+6 weitere Schritte" verschwommen).
    let effectiveSrcStart = srcStart;
    let effectiveSrcEnd = srcEnd;
    let freezeDur = Math.max(0, targetDur - sourceDur);
    if (speed === 1.0 && freezeDur >= 1.0) {
      const pick = await pickFreezeAnchor(sourceFile, srcStart, srcEnd, freezeDur, { stepSec: 0.1 });
      const oldEnd = effectiveSrcEnd;
      if (pick.decision !== "kept-end") {
        effectiveSrcStart = pick.srcStart;
        effectiveSrcEnd = pick.srcEnd;
        const newSourceDur = effectiveSrcEnd - effectiveSrcStart;
        freezeDur = Math.max(0, targetDur - newSourceDur);
      }
      // §40 Phase B: track ALL freeze decisions (including kept-end) for post-build verification.
      const sourceDurEffective = effectiveSrcEnd - effectiveSrcStart;
      const buildFreezeStart = entry.start + sourceDurEffective;
      const buildFreezeEnd = entry.end;
      const buildFreezeMid = buildFreezeStart + Math.min(freezeDur * 0.5, 1.5);
      sharpnessReport.push({
        phase: entry.phaseName,
        decision: pick.decision,
        oldRange: [srcStart, oldEnd],
        newRange: [effectiveSrcStart, effectiveSrcEnd],
        anchor: pick.anchor,
        sourceSharpness: pick.sharpness,
        buildFreezeStart,
        buildFreezeEnd,
        buildFreezeMid,
        freezeDur,
      });
    }
    await run("ffmpeg", [
      "-hide_banner", "-y",
      "-ss", effectiveSrcStart.toFixed(3), "-to", effectiveSrcEnd.toFixed(3), "-i", sourceFile,
      "-vf", `${speedFilter}tpad=stop_mode=clone:stop_duration=${freezeDur.toFixed(3)},fps=30,scale=${frameW}:${frameH}:force_original_aspect_ratio=decrease,pad=${frameW}:${frameH}:(ow-iw)/2:(oh-ih)/2:color=#0b1220`,
      "-an",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
      "-pix_fmt", "yuv420p",
      "-t", targetDur.toFixed(3),
      segOut,
    ], { captureStderr: true });
  } else {
    // Trim (speed-adjusted) source to target_length
    await run("ffmpeg", [
      "-hide_banner", "-y",
      "-ss", srcStart.toFixed(3), "-to", srcEnd.toFixed(3), "-i", sourceFile,
      "-vf", `${speedFilter}fps=30,scale=${frameW}:${frameH}:force_original_aspect_ratio=decrease,pad=${frameW}:${frameH}:(ow-iw)/2:(oh-ih)/2:color=#0b1220`,
      "-an",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
      "-pix_fmt", "yuv420p",
      "-t", targetDur.toFixed(3),
      segOut,
    ], { captureStderr: true });
  }
  console.log(`  ✓ ${entry.phaseName.padEnd(32)} ${formatTime(entry.start)}–${formatTime(entry.end)} (${targetDur.toFixed(2)}s)`);
  segVideos.push(segOut);
}

// Concat. Re-encode (NOT -c copy) because per-segment timestamps may not align
// cleanly enough for stream-copy concat (FB84-bug found: Preis was truncated to 227s).
const concatList = path.join(tmpDir, "concat.txt");
fs.writeFileSync(concatList, segVideos.map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n"));
const slideshowPath = path.join(tmpDir, "_concat_video.mp4");
await run("ffmpeg", [
  "-hide_banner", "-y",
  "-f", "concat", "-safe", "0", "-i", concatList,
  "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
  "-pix_fmt", "yuv420p",
  "-r", "30",
  slideshowPath,
], { captureStderr: true });

// Mux audio
const previewDir = path.join(GENERATED, "previews", tenant);
fs.mkdirSync(previewDir, { recursive: true });
const finalPath = path.join(previewDir, `take${fileSuffix}_anchor.mp4`);
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
console.log(`  duration: ${finalInfo.duration.toFixed(2)}s (audio=${audioInfo.duration.toFixed(2)}s, schedule=${totalScheduledFinal.toFixed(2)}s)`);
console.log(`  segments: ${scheduleEntries.length}`);

// §40 Sharpness-Gate Phase A — auto-snap report
if (sharpnessReport.length > 0) {
  const snapped = sharpnessReport.filter((r) => r.decision !== "kept-end");
  console.log(`\n§40 Sharpness-Gate Phase A: ${snapped.length} auto-snaps + ${sharpnessReport.length - snapped.length} kept-end (${sharpnessReport.length} freeze phases total):`);
  for (const r of sharpnessReport) {
    const [s0, e0] = r.oldRange;
    const [s1, e1] = r.newRange;
    console.log(`  ${r.phase.padEnd(32)} ${r.decision.padEnd(15)} src [${s0.toFixed(2)}, ${e0.toFixed(2)}] → [${s1.toFixed(2)}, ${e1.toFixed(2)}]  anchor=${r.anchor.toFixed(2)}s src-sharpness=${r.sourceSharpness.toFixed(3)}`);
  }
} else {
  console.log(`\n§40 Sharpness-Gate Phase A: 0 freeze phases ≥1.0s — nothing to scan`);
}

// §40 Sharpness-Gate Phase B — post-build output verification
// Measures sharpness of final video at mid-freeze position, compares to source
// anchor sharpness. FAILs if any freeze phase dropped >15% (= encoder destroyed
// detail OR concat dropped frame OR source recording itself was unusable).
// Override via env SKIP_SHARPNESS_GATE=1 only for emergency builds.
const phaseBResults = [];
if (sharpnessReport.length > 0) {
  console.log(`\n§40 Sharpness-Gate Phase B: post-build output verification (${sharpnessReport.length} freeze phases)...`);
  const tolerance = 0.15;
  for (const r of sharpnessReport) {
    const outputSharpness = await measureSharpness(finalPath, r.buildFreezeMid);
    const ratio = r.sourceSharpness > 0 ? outputSharpness / r.sourceSharpness : 1;
    const minRatio = 1 - tolerance;
    const pass = ratio >= minRatio;
    phaseBResults.push({
      phase: r.phase,
      atSec: r.buildFreezeMid,
      sourceSharpness: r.sourceSharpness,
      outputSharpness,
      ratio,
      pass,
    });
    const mark = pass ? "✓" : "✗";
    console.log(`  ${mark} ${r.phase.padEnd(32)} build@${r.buildFreezeMid.toFixed(2)}s  src=${r.sourceSharpness.toFixed(3)} out=${outputSharpness.toFixed(3)} ratio=${(ratio * 100).toFixed(1)}%${pass ? "" : "  FAIL (<" + (minRatio * 100).toFixed(0) + "%)"}`);
  }
  const failures = phaseBResults.filter((r) => !r.pass);
  const reportPath = path.join(previewDir, `_sharpness_report_take${fileSuffix}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    ts: new Date().toISOString(),
    tenant,
    take: fileSuffix,
    phaseA: sharpnessReport,
    phaseB: phaseBResults,
    phaseBPass: failures.length === 0,
    tolerance,
  }, null, 2));
  console.log(`  report: ${reportPath}`);
  if (failures.length > 0) {
    console.error(`\n✗ §40 Sharpness-Gate Phase B FAIL: ${failures.length} freeze phases dropped >15% sharpness vs source.`);
    console.error(`  Likely causes:`);
    console.error(`    1. Source recording defekt (Browser-Zoom, fps-Drop, render glitch) — re-record affected phase`);
    console.error(`    2. Concat dropped frame at segment boundary — inspect tmp/seg_*.mp4`);
    console.error(`    3. H.264 encoder lost detail — try -crf 18 or -preset slow`);
    console.error(`  Failed phases:`);
    for (const f of failures) {
      console.error(`    • ${f.phase} @ build ${f.atSec.toFixed(2)}s: src=${f.sourceSharpness.toFixed(3)} out=${f.outputSharpness.toFixed(3)} (${(f.ratio * 100).toFixed(1)}% < 85%)`);
    }
    if (!process.env.SKIP_SHARPNESS_GATE) {
      console.error(`\n  Build BLOCKED. Override with SKIP_SHARPNESS_GATE=1 only for emergency.`);
      process.exit(1);
    } else {
      console.warn(`\n  ⚠ SKIP_SHARPNESS_GATE=1 set — proceeding despite failures. Output is unreliable.`);
    }
  } else {
    console.log(`\n✓ §40 Sharpness-Gate Phase B PASS — all ${phaseBResults.length} freeze phases preserved sharpness within 15% tolerance.`);
  }
}

// Verify final duration matches schedule (catch concat truncation bugs)
if (Math.abs(finalInfo.duration - totalScheduledFinal) > 1.0) {
  console.warn(`⚠ FINAL DURATION MISMATCH: video=${finalInfo.duration.toFixed(2)}s vs schedule=${totalScheduled.toFixed(2)}s`);
  console.warn(`  Tmp segments preserved at: ${tmpDir}`);
  console.warn(`  Inspect each seg_*.mp4 for duration / corruption.`);
} else {
  // Clean up only on success
  for (const f of fs.readdirSync(tmpDir)) {
    fs.unlinkSync(path.join(tmpDir, f));
  }
  fs.rmdirSync(tmpDir);
}
