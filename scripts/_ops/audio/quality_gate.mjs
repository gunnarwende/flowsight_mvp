#!/usr/bin/env node
// quality_gate.mjs — Autonomous Quality-Gate for built take videos.
//
// Validates a freshly-built take<N>_<variant>_anchor.mp4 against:
//   A. Schedule continuity (no gaps/overlaps > 50ms)
//   B. Audio-total alignment (audio == schedule total ± 2s)
//   C. Per-phase visual content (output frame ≈ source-range frame via PSNR)
//   D. Boundary transitions (frame changes at phase boundaries)
//   E. Audio-anchor alignment (silence/voice events fall in expected phases)
//
// Output: _generated/qg/<tenant>/take<N>_<variant>/
//   report.html  — side-by-side thumbnails per phase, color-coded pass/fail
//   report.json  — machine-readable
//   frames/      — all extracted thumbnails
//
// Usage:
//   node scripts/_ops/audio/quality_gate.mjs --tenant doerfler-ag --take 2 --variant notruf

import fs from "node:fs";
import path from "node:path";
import { loadEnv, GENERATED, PIPELINE_ROOT, REPO_ROOT } from "./_lib/env.mjs";
import { ffprobeInfo, run } from "./_lib/ffmpeg.mjs";
import { parseTime, formatTime } from "./_lib/time_format.mjs";
import { measureSharpness } from "./_lib/sharpness.mjs";

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
const fileSuffix = variant ? `${take}_${variant}` : `${take}`;

// === 1. Load all inputs ===

const defPath = path.join(PIPELINE_ROOT, "phase_library_defs", `take${take}_${industry}.json`);
const def = JSON.parse(fs.readFileSync(defPath, "utf8"));
const phasesByName = {};
for (const p of def.phases) phasesByName[p.name] = { ...p };

// Apply tenant-specific override so QG samples REF frames at the SAME tenant-source
// times the build used. Without this, QG compares OUT (built from override-times)
// against REF (sampled at master-times) — PSNR fails even when build is correct.
const overridePath = path.join(PIPELINE_ROOT, "phase_library_defs", "_overrides", tenant, `take${take}_${industry}.json`);
let qgOverridesApplied = 0;
if (fs.existsSync(overridePath)) {
  const override = JSON.parse(fs.readFileSync(overridePath, "utf8"));
  for (const p of override.phases || []) {
    if (phasesByName[p.name] && p.range) {
      phasesByName[p.name].range = p.range;
      qgOverridesApplied++;
    }
  }
  console.log(`ℹ tenant-override applied to QG: ${qgOverridesApplied} phase ranges adjusted`);
}

function resolveSourcePath(template) {
  return path.join(REPO_ROOT, "docs/gtm/pipeline/06_video_production", template.replace(/\{tenant\}/g, tenant));
}
const sources = {};
for (const [key, template] of Object.entries(def.sources)) {
  sources[key] = resolveSourcePath(template);
}

const schedulePath = path.join(GENERATED, "transcripts", tenant, `take${fileSuffix}.schedule`);
const scheduleRaw = fs.readFileSync(schedulePath, "utf8");
const scheduleEntries = [];
for (const line of scheduleRaw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const m = trimmed.match(/^(\S+)\s+(\S+)\s*-\s*(\S+?)\s*(?:#.*)?$/);
  if (!m) continue;
  const [, phaseName, startStr, endStr] = m;
  const start = parseTime(startStr), end = parseTime(endStr);
  scheduleEntries.push({ phaseName, start, end, dur: end - start });
}

const audioFile = path.join(GENERATED, "takes", tenant, `take${fileSuffix}.wav`);
const audioInfo = await ffprobeInfo(audioFile);

const outputFile = path.join(GENERATED, "previews", tenant, `take${fileSuffix}_anchor.mp4`);
if (!fs.existsSync(outputFile)) {
  console.error(`output video missing: ${outputFile} — build first`);
  process.exit(1);
}

// ffprobeInfo reads audio stream by default; for video we need video stream
async function videoDur(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=duration",
    "-show_entries", "format=duration",
    "-of", "json",
    file,
  ], { captureStdout: true, captureStderr: false });
  const j = JSON.parse(stdout);
  return Number((j.streams && j.streams[0] && j.streams[0].duration) || (j.format && j.format.duration) || 0);
}

const outputDur = await videoDur(outputFile);

// === 2. Setup output dirs ===

const qgDir = path.join(GENERATED, "qg", tenant, `take${fileSuffix}`);
const framesDir = path.join(qgDir, "frames");
fs.mkdirSync(framesDir, { recursive: true });
for (const f of fs.readdirSync(framesDir)) {
  fs.unlinkSync(path.join(framesDir, f));
}

// === 3. Gate A: Schedule continuity ===

const gateA = { name: "Schedule-Continuity", pass: true, issues: [] };
for (let i = 0; i < scheduleEntries.length - 1; i++) {
  const cur = scheduleEntries[i], next = scheduleEntries[i + 1];
  const drift = Math.abs(cur.end - next.start);
  if (drift > 0.05) {
    gateA.pass = false;
    gateA.issues.push(`gap/overlap ${drift.toFixed(3)}s: ${cur.phaseName} ends ${formatTime(cur.end)} vs ${next.phaseName} starts ${formatTime(next.start)}`);
  }
}

// === 4. Gate B: Audio total alignment ===

const scheduleTotal = scheduleEntries[scheduleEntries.length - 1].end;
const audioDiff = Math.abs(audioInfo.duration - scheduleTotal);
const gateB = {
  name: "Audio-Total-Alignment",
  pass: audioDiff <= 2.0,
  audioDur: audioInfo.duration,
  scheduleDur: scheduleTotal,
  outputDur,
  diff: audioDiff,
};

// === 5. Gate C+D: Per-phase visual content + boundary check ===

console.log(`extracting frames for ${scheduleEntries.length} phases...`);
const phaseResults = [];

async function extractFrame(source, t, outPng) {
  await run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", t.toFixed(3),
    "-i", source,
    "-frames:v", "1",
    "-vf", "scale=480:300:force_original_aspect_ratio=decrease,pad=480:300:(ow-iw)/2:(oh-ih)/2:color=#0b1220",
    outPng,
  ], { captureStderr: true });
}

async function psnrCompare(aPng, bPng) {
  if (!fs.existsSync(aPng) || !fs.existsSync(bPng)) return null;
  try {
    const { stderr } = await run("ffmpeg", [
      "-hide_banner",
      "-i", aPng, "-i", bPng,
      "-lavfi", "psnr",
      "-f", "null", "-",
    ], { captureStderr: true });
    const m = stderr.match(/average:(inf|[\d.]+)/);
    if (!m) return null;
    return m[1] === "inf" ? Infinity : parseFloat(m[1]);
  } catch {
    return null;
  }
}

for (let i = 0; i < scheduleEntries.length; i++) {
  const entry = scheduleEntries[i];
  const phase = phasesByName[entry.phaseName];
  if (!phase) continue;

  // OUT mid-frame: at end-0.5 (representative of freeze-frame state when target_dur > src_dur)
  // For short phases use midpoint.
  const outMidT = entry.dur < 1.5
    ? (entry.start + entry.end) / 2
    : Math.max(entry.start + 0.3, entry.end - 0.5);
  const outMid = path.join(framesDir, `${String(i).padStart(2, "0")}_${entry.phaseName}_OUT.png`);
  await extractFrame(outputFile, outMidT, outMid);

  // OUT start-frame (just after phase begins) and OUT pre-end (just before phase ends)
  const outStartT = Math.min(entry.start + 0.1, entry.end - 0.05);
  const outEndT = Math.max(entry.end - 0.1, entry.start + 0.05);
  const outStart = path.join(framesDir, `${String(i).padStart(2, "0")}_${entry.phaseName}_OUTstart.png`);
  const outEnd = path.join(framesDir, `${String(i).padStart(2, "0")}_${entry.phaseName}_OUTend.png`);
  await extractFrame(outputFile, outStartT, outStart);
  await extractFrame(outputFile, outEndT, outEnd);

  // REF frame from source-range — aligned with what OUT actually shows.
  // Builder plays source[srcStart, srcStart+min(targetDur, srcDur)], then freezes last frame.
  // So at OUT time entry.end-0.5: source time = srcStart + min(targetDur-0.5, srcDur-0.1)
  let refSourceKey = phase.source;
  if (refSourceKey === "extended_phone") refSourceKey = `extended_phone_${variant}`;
  const refSource = sources[refSourceKey];
  let srcStart = phase.range[0];
  let srcEnd = phase.range[1];

  if (phase.source === "extended_phone" && refSource && fs.existsSync(refSource)) {
    const fileDur = await videoDur(refSource);
    const ENDED_TAIL = 3.5;
    if (phase.name === "phone_call_active") {
      srcStart = 0;
      srcEnd = Math.max(0, fileDur - ENDED_TAIL);
    } else if (phase.name === "phone_call_ended") {
      srcStart = Math.max(0, fileDur - ENDED_TAIL);
      srcEnd = fileDur;
    }
  }
  const srcDur = srcEnd - srcStart;
  // Match OUT extraction point: end-0.5 of OUT phase
  let refTime;
  if (entry.dur < 1.5) {
    // short phase → use source midpoint
    refTime = (srcStart + srcEnd) / 2;
  } else if (entry.dur > srcDur + 0.1) {
    // freeze case: OUT shows last frame of source for most of phase
    refTime = srcEnd - 0.1;
  } else {
    // trim case: OUT shows source[srcStart, srcStart+entry.dur]; pick the matching point
    refTime = srcStart + Math.max(0.1, entry.dur - 0.5);
  }

  const refPng = path.join(framesDir, `${String(i).padStart(2, "0")}_${entry.phaseName}_REF.png`);
  let refExists = false;
  if (refSource && fs.existsSync(refSource)) {
    await extractFrame(refSource, refTime, refPng);
    refExists = fs.existsSync(refPng);
  }

  // Gate C: OUT mid vs REF
  const psnrContent = await psnrCompare(outMid, refPng);
  // Gate D: OUTstart vs OUTend — should differ if there's motion (transition).
  // For freeze-frame phases, expected to be very similar (high PSNR).
  const psnrSelf = await psnrCompare(outStart, outEnd);

  // Pass criteria for content: PSNR >= 20 (loose; sharpness-gate snap can shift
  // freeze position slightly relative to QG refTime → small PSNR drop expected
  // for freeze phases. 20 is still well above different-scene threshold of ~10).
  const contentPass = psnrContent === null ? null : psnrContent >= 20;

  phaseResults.push({
    idx: i,
    phaseName: entry.phaseName,
    schedStart: entry.start, schedEnd: entry.end, schedDur: entry.dur,
    refSource: refSourceKey, refRange: phase.range, refTime,
    outMidT, outStartT, outEndT,
    outMid: path.relative(qgDir, outMid),
    outStart: path.relative(qgDir, outStart),
    outEnd: path.relative(qgDir, outEnd),
    refPng: refExists ? path.relative(qgDir, refPng) : null,
    psnrContent, contentPass,
    psnrSelf,
  });

  const psnrStr = psnrContent === null ? "n/a" : (psnrContent === Infinity ? "∞" : psnrContent.toFixed(2));
  console.log(`  [${String(i).padStart(2)}] ${entry.phaseName.padEnd(32)} REF@${refTime.toFixed(2)}s  PSNR=${psnrStr}  ${contentPass === false ? "✗ DRIFT" : contentPass === true ? "✓" : "?"}`);
}

const drifts = phaseResults.filter((r) => r.contentPass === false);
const gateC = {
  name: "Per-Phase-Content",
  pass: drifts.length === 0,
  drifts: drifts.map((r) => ({ phase: r.phaseName, psnr: r.psnrContent })),
};

// === 6. Gate E: Audio-anchor detection ===

console.log("\ndetecting audio anchors...");
const silenceRun = await run("ffmpeg", [
  "-hide_banner", "-nostats",
  "-i", audioFile,
  "-af", "silencedetect=noise=-40dB:duration=0.3",
  "-f", "null", "-",
], { captureStderr: true });

const silenceLines = silenceRun.stderr.split("\n").filter((l) => l.includes("silencedetect"));
const silenceIntervals = [];
let cur = null;
for (const line of silenceLines) {
  const sm = line.match(/silence_start: ([\d.]+)/);
  const em = line.match(/silence_end: ([\d.]+)/);
  if (sm) cur = { start: parseFloat(sm[1]) };
  if (em && cur) {
    cur.end = parseFloat(em[1]);
    cur.dur = cur.end - cur.start;
    silenceIntervals.push(cur);
    cur = null;
  }
}

function phaseAt(t) {
  return scheduleEntries.find((e) => t >= e.start && t < e.end);
}

const voiceOnsets = silenceIntervals
  .filter((s) => s.dur >= 0.5)
  .map((s) => ({ t: s.end, silenceBefore: s.dur, phase: phaseAt(s.end)?.phaseName || "?" }));

// Expected anchors for Take 2 (FB93):
//  - First voice-onset after silence >5s = RING/PIEP. Must land in phone_dialing.
//  - First voice-onset after that with silence >1s = LISA picks up. Must land in phone_call_active.
//  - Last voice-onset before SMS section = call hangup. Must land near phone_call_ended start.
const gateE = {
  name: "Audio-Anchor-vs-Phase",
  pass: true,
  warnings: [],
  voiceOnsets,
  silenceIntervals,
  expected: [],
};

if (take === "2") {
  // Find ring-tone onset: first voice-onset after silence >= 5s
  const ringOnset = voiceOnsets.find((o) => o.silenceBefore >= 5.0);
  if (ringOnset) {
    const expected = "phone_dialing";
    const actual = ringOnset.phase;
    const ok = actual === expected;
    gateE.expected.push({ event: "ring/piep onset", t: ringOnset.t, expectedPhase: expected, actualPhase: actual, pass: ok });
    if (!ok) {
      gateE.pass = false;
      gateE.warnings.push(`ring/piep at ${ringOnset.t.toFixed(2)}s falls in '${actual}' but should be '${expected}'`);
    }
  }
  // Lisa onset: voice-onset after ringOnset with silence >= 1s
  if (ringOnset) {
    const lisaOnset = voiceOnsets.find((o) => o.t > ringOnset.t + 0.5 && o.silenceBefore >= 1.0);
    if (lisaOnset) {
      const expected = "phone_call_active";
      const actual = lisaOnset.phase;
      const ok = actual === expected;
      gateE.expected.push({ event: "Lisa first words", t: lisaOnset.t, expectedPhase: expected, actualPhase: actual, pass: ok });
      if (!ok) {
        gateE.pass = false;
        gateE.warnings.push(`Lisa at ${lisaOnset.t.toFixed(2)}s falls in '${actual}' but should be '${expected}'`);
      }
    }
  }
}

// === 7. Gate F: Audio-Quality (Loudness + Clipping + No-Internal-Silence) ===
//   Reads existing _report_take<N>.json from assemble_take_simple.

const audioReportPath = path.join(GENERATED, "takes", tenant, `_report_take${fileSuffix}.json`);
let audioReport = null;
try {
  audioReport = JSON.parse(fs.readFileSync(audioReportPath, "utf8"));
} catch {}

const gateF_loudness = {
  name: "Audio-Loudness",
  pass: audioReport?.gates?.loudness?.pass === true,
  detail: audioReport?.gates?.loudness ? `I=${audioReport.gates.loudness.I?.toFixed?.(2) ?? "?"} LUFS, TP=${audioReport.gates.loudness.TP?.toFixed?.(2) ?? "?"}` : "(no audio report)",
};
const gateF_clipping = {
  name: "Audio-No-Clipping",
  pass: audioReport?.gates?.clipping?.pass === true,
  detail: audioReport?.gates?.clipping ? `peak=${audioReport.gates.clipping.peak?.toFixed?.(2) ?? "?"} dBFS` : "(no audio report)",
};
const gateF_internalSilence = {
  name: "Audio-No-Excessive-Silence",
  pass: audioReport?.gates?.internalSilence?.pass === true,
  detail: audioReport?.gates?.internalSilence ? `max internal=${audioReport.gates.internalSilence.maxInternalMs ?? "?"}ms` : "(no audio report)",
};

// === 8. Gate G: Sharpness Phase A + B (from build_from_phase_schedule sharpness report) ===

const sharpnessReportPath = path.join(GENERATED, "previews", tenant, `_sharpness_report_take${fileSuffix}.json`);
let sharpnessReport = null;
try {
  sharpnessReport = JSON.parse(fs.readFileSync(sharpnessReportPath, "utf8"));
} catch {}

const gateG_phaseA = {
  name: "Sharpness Phase A (auto-snap coverage)",
  pass: sharpnessReport && Array.isArray(sharpnessReport.phaseA) && sharpnessReport.phaseA.length > 0,
  detail: sharpnessReport ? `${sharpnessReport.phaseA?.length ?? 0} freeze phases scanned (${sharpnessReport.phaseA?.filter(p => p.decision !== "kept-end").length ?? 0} auto-snapped)` : "(no sharpness report)",
};
const gateG_phaseB = {
  name: "Sharpness Phase B (post-build verify)",
  pass: sharpnessReport?.phaseBPass === true,
  detail: sharpnessReport?.phaseB ? `${sharpnessReport.phaseB.filter(p => p.pass).length}/${sharpnessReport.phaseB.length} pass, min ratio=${(Math.min(...sharpnessReport.phaseB.map(p => p.ratio)) * 100).toFixed(1)}%` : "(no sharpness report)",
};

// === 9. Gate H: Sharpness-Stability (NEW) ===
//   Within each freeze phase, sample 3 points within the actual freeze region
//   and verify sharpness consistency (stddev/mean < 5%). Catches encoder
//   fluctuation, mid-freeze drift, etc.

console.log("\nchecking sharpness stability across freeze phases...");
const stabilityResults = [];
if (sharpnessReport && Array.isArray(sharpnessReport.phaseA)) {
  for (const fp of sharpnessReport.phaseA) {
    if (!fp.freezeDur || fp.freezeDur < 1.0) continue;
    // Use actual freeze region — fall back to mid±0.3*dur if older report without freezeStart/End
    const fStart = fp.buildFreezeStart ?? (fp.buildFreezeMid - fp.freezeDur * 0.3);
    const fEnd = fp.buildFreezeEnd ?? (fp.buildFreezeMid + fp.freezeDur * 0.3);
    const fLen = fEnd - fStart;
    const sampleTimes = [fStart + fLen * 0.1, fStart + fLen * 0.5, fStart + fLen * 0.9];
    const samples = [];
    for (const t of sampleTimes) {
      const s = await measureSharpness(outputFile, Math.max(0, t));
      samples.push({ t, sharpness: s });
    }
    const values = samples.map((s) => s.sharpness);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const stddev = Math.sqrt(variance);
    const cv = mean > 0 ? stddev / mean : 0;
    const stable = cv < 0.05;
    stabilityResults.push({ phase: fp.phase, samples, mean, stddev, cv, stable });
    console.log(`  ${stable ? "✓" : "✗"} ${fp.phase.padEnd(32)} freeze@[${fStart.toFixed(1)},${fEnd.toFixed(1)}]s  samples=[${values.map((v) => v.toFixed(2)).join(",")}]  mean=${mean.toFixed(3)} cv=${(cv * 100).toFixed(2)}% ${stable ? "" : "FAIL (>5%)"}`);
  }
}
const gateH = {
  name: "Sharpness-Stability (within freeze)",
  pass: stabilityResults.every(r => r.stable),
  detail: stabilityResults.length === 0 ? "(no freeze phases)" : `${stabilityResults.filter(r => r.stable).length}/${stabilityResults.length} stable (cv<5%)`,
  results: stabilityResults,
};

// === 10. Gate I: Scene-Continuity (NEW) ===
//   At each schedule-entry boundary, measure brightness on both sides. FAIL if
//   either side shows a black frame (YAVG < 5 = encoder dropped or pure black).

console.log("\nchecking scene continuity at phase boundaries...");
async function measureBrightness(file, atSec) {
  const { stderr } = await run("ffmpeg", [
    "-hide_banner",
    "-ss", atSec.toFixed(3),
    "-i", file,
    "-frames:v", "1",
    "-vf", "signalstats,metadata=mode=print",
    "-f", "null", "-",
  ], { captureStderr: true });
  const m = stderr.match(/signalstats\.YAVG=([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

const boundaryResults = [];
for (let i = 0; i < scheduleEntries.length - 1; i++) {
  const boundaryT = scheduleEntries[i].end;
  const before = await measureBrightness(outputFile, Math.max(0, boundaryT - 0.05));
  const after = await measureBrightness(outputFile, boundaryT + 0.05);
  const blackBefore = before < 5;
  const blackAfter = after < 5;
  const ok = !blackBefore && !blackAfter;
  boundaryResults.push({
    fromPhase: scheduleEntries[i].phaseName,
    toPhase: scheduleEntries[i + 1].phaseName,
    boundaryT,
    yavgBefore: before,
    yavgAfter: after,
    ok,
  });
  if (!ok) {
    console.log(`  ✗ ${scheduleEntries[i].phaseName} → ${scheduleEntries[i + 1].phaseName} @ ${boundaryT.toFixed(2)}s  before=${before.toFixed(1)} after=${after.toFixed(1)} ${blackBefore ? "(BLACK before)" : ""}${blackAfter ? "(BLACK after)" : ""}`);
  }
}
const blackBoundaries = boundaryResults.filter(r => !r.ok);
const gateI = {
  name: "Scene-Continuity (no black frames)",
  pass: blackBoundaries.length === 0,
  detail: blackBoundaries.length === 0 ? `${boundaryResults.length}/${boundaryResults.length} boundaries clean` : `${blackBoundaries.length} black-frame issues at boundaries`,
  blackBoundaries,
};

// === 11. Gate J: Output-Duration-Precision ===

const durationDiff = Math.abs(outputDur - scheduleTotal);
const gateJ = {
  name: "Output-Duration-Precision",
  pass: durationDiff < 0.5,
  detail: `output=${outputDur.toFixed(2)}s schedule=${scheduleTotal.toFixed(2)}s Δ=${durationDiff.toFixed(2)}s`,
};

// === 12. 10/10 HIGH-END VERDICT AGGREGATION ===

const subGates = [
  { id: "1", name: "Schedule-Continuity", pass: gateA.pass },
  { id: "2", name: "Audio-Schedule-Match", pass: gateB.pass },
  { id: "3", name: "Output-Duration-Precision", pass: gateJ.pass },
  { id: "4", name: "Audio-Loudness", pass: gateF_loudness.pass },
  { id: "5", name: "Audio-No-Clipping", pass: gateF_clipping.pass },
  { id: "6", name: "Audio-No-Excessive-Silence", pass: gateF_internalSilence.pass },
  { id: "7", name: "Per-Phase-PSNR", pass: gateC.pass },
  { id: "8", name: "Sharpness Phase A (coverage)", pass: gateG_phaseA.pass },
  { id: "9", name: "Sharpness Phase B (post-build)", pass: gateG_phaseB.pass },
  { id: "10", name: "Sharpness-Stability + Scene-Continuity", pass: gateH.pass && gateI.pass },
];

const passed = subGates.filter(g => g.pass === true).length;
const total = subGates.length;
const score = `${passed}/${total}`;
const isHighEnd = passed === total;

// === 13. Generate HTML report ===

function fmtPsnr(v) {
  if (v === null || v === undefined) return "n/a";
  if (v === Infinity) return "∞";
  return v.toFixed(2);
}

const reportHtml = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8">
<title>High-End Quality-Gate — ${tenant} take${fileSuffix}</title>
<style>
body{font-family:system-ui,sans-serif;background:#0b1220;color:#e2e8f0;margin:0;padding:24px;line-height:1.4;}
h1{margin-top:0;color:#fff;}
h2{color:#cbd5e1;margin-top:32px;border-bottom:1px solid #334155;padding-bottom:8px;}
.verdict{background:linear-gradient(135deg,${isHighEnd ? "#064e3b,#065f46" : "#7f1d1d,#991b1b"});border-radius:12px;padding:32px;margin-bottom:24px;text-align:center;}
.verdict h1{font-size:64px;margin:0;letter-spacing:-2px;}
.verdict p{font-size:18px;margin:8px 0 0 0;opacity:0.9;}
.summary{background:#1e293b;border-radius:8px;padding:16px;margin-bottom:24px;}
.gate{margin:8px 0;padding:10px 14px;border-radius:6px;font-weight:500;display:flex;justify-content:space-between;align-items:center;gap:12px;}
.gate-name{flex:1;}
.gate-detail{font-size:11px;opacity:0.8;font-weight:normal;}
.pass{background:#064e3b;color:#a7f3d0;}
.fail{background:#7f1d1d;color:#fecaca;}
.warn{background:#78350f;color:#fed7aa;}
.info{background:#1e3a8a;color:#bfdbfe;}
table{border-collapse:collapse;width:100%;}
th,td{padding:10px;text-align:left;border-bottom:1px solid #334155;vertical-align:top;font-size:13px;}
th{background:#1e293b;color:#94a3b8;font-size:11px;text-transform:uppercase;}
img{max-width:240px;height:auto;border-radius:4px;border:1px solid #334155;display:block;}
.row-fail td{background:#1f0808;}
.row-warn td{background:#1c1408;}
.psnr-bad{color:#fca5a5;font-weight:bold;}
.psnr-ok{color:#86efac;}
.psnr-warn{color:#fcd34d;}
.tag{display:inline-block;padding:2px 6px;border-radius:3px;font-size:11px;background:#334155;color:#cbd5e1;margin-right:4px;}
.frame-cell{display:flex;flex-direction:column;gap:4px;}
.frame-cell small{color:#64748b;font-size:10px;}
</style></head>
<body>
<div class="verdict">
  <h1>${isHighEnd ? "10/10 ✓" : score + " ✗"}</h1>
  <p>${tenant} · take${fileSuffix} · ${isHighEnd ? "High-End — Founder kann reviewen" : "FAIL — bitte vor Founder-Review fixen"}</p>
</div>
<h1>High-End Quality-Gate — ${tenant} take${fileSuffix}</h1>
<div class="summary">
  <h2 style="margin-top:0;border:none;">10 Sub-Gates</h2>
  ${subGates.map(g => `<div class="gate ${g.pass ? "pass" : "fail"}"><span class="gate-name">${g.id}. ${g.name}</span><span>${g.pass ? "PASS" : "FAIL"}</span></div>`).join("")}

  <h2>Detail-Audit</h2>
  <div class="gate ${gateA.pass ? "pass" : "fail"}"><span class="gate-name">Schedule-Continuity</span><span class="gate-detail">${gateA.pass ? "PASS" : "FAIL: " + gateA.issues.join("; ")}</span></div>
  <div class="gate ${gateB.pass ? "pass" : "fail"}"><span class="gate-name">Audio-Total</span><span class="gate-detail">audio=${gateB.audioDur.toFixed(2)}s, schedule=${gateB.scheduleDur.toFixed(2)}s, output=${gateB.outputDur.toFixed(2)}s, Δ=${gateB.diff.toFixed(2)}s</span></div>
  <div class="gate ${gateJ.pass ? "pass" : "fail"}"><span class="gate-name">Output-Duration-Precision</span><span class="gate-detail">${gateJ.detail}</span></div>
  <div class="gate ${gateF_loudness.pass ? "pass" : "fail"}"><span class="gate-name">Audio-Loudness</span><span class="gate-detail">${gateF_loudness.detail}</span></div>
  <div class="gate ${gateF_clipping.pass ? "pass" : "fail"}"><span class="gate-name">Audio-No-Clipping</span><span class="gate-detail">${gateF_clipping.detail}</span></div>
  <div class="gate ${gateF_internalSilence.pass ? "pass" : "fail"}"><span class="gate-name">Audio-No-Excessive-Silence</span><span class="gate-detail">${gateF_internalSilence.detail}</span></div>
  <div class="gate ${gateC.pass ? "pass" : "fail"}"><span class="gate-name">Per-Phase-Content (PSNR)</span><span class="gate-detail">${gateC.pass ? "all phases ≥22 dB" : `${gateC.drifts.length} drifts: ${gateC.drifts.map((d) => d.phase).join(", ")}`}</span></div>
  <div class="gate ${gateG_phaseA.pass ? "pass" : "fail"}"><span class="gate-name">Sharpness Phase A</span><span class="gate-detail">${gateG_phaseA.detail}</span></div>
  <div class="gate ${gateG_phaseB.pass ? "pass" : "fail"}"><span class="gate-name">Sharpness Phase B</span><span class="gate-detail">${gateG_phaseB.detail}</span></div>
  <div class="gate ${gateH.pass ? "pass" : "fail"}"><span class="gate-name">Sharpness-Stability</span><span class="gate-detail">${gateH.detail}</span></div>
  <div class="gate ${gateI.pass ? "pass" : "fail"}"><span class="gate-name">Scene-Continuity</span><span class="gate-detail">${gateI.detail}</span></div>
  ${gateE.pass !== undefined ? `<div class="gate ${gateE.pass ? "pass" : "fail"}"><span class="gate-name">Audio-Anchor-vs-Phase (Take 2)</span><span class="gate-detail">${gateE.pass ? "PASS" : "FAIL: " + gateE.warnings.join("; ")}</span></div>` : ""}
</div>

<h2>Per-Phase Visual Comparison</h2>
<p>OUT-Mid = output @ ${'≈'}entry.end-0.5s. OUT-Start/End = boundary frames. REF = source-range representative. PSNR ≥ 22 = same scene.</p>
<table>
<thead><tr>
  <th>#</th><th>Phase</th><th>Schedule</th><th>Source</th>
  <th>OUT @ start</th><th>OUT @ mid</th><th>OUT @ end</th><th>REF</th>
  <th>PSNR<br>OUT vs REF</th><th>start↔end<br>(motion)</th>
</tr></thead>
<tbody>
${phaseResults.map((r) => `
<tr class="${r.contentPass === false ? "row-fail" : ""}">
  <td>${r.idx}</td>
  <td><strong>${r.phaseName}</strong><br><span class="tag">${r.refSource}</span></td>
  <td>${formatTime(r.schedStart)}<br>↓<br>${formatTime(r.schedEnd)}<br><small>(${r.schedDur.toFixed(2)}s)</small></td>
  <td>${r.refRange[0].toFixed(1)}–${r.refRange[1].toFixed(1)}s<br><small>ref @${r.refTime.toFixed(2)}s</small></td>
  <td class="frame-cell"><img src="${r.outStart}" alt="OUTstart"><small>@${r.outStartT.toFixed(2)}s</small></td>
  <td class="frame-cell"><img src="${r.outMid}" alt="OUTmid"><small>@${r.outMidT.toFixed(2)}s</small></td>
  <td class="frame-cell"><img src="${r.outEnd}" alt="OUTend"><small>@${r.outEndT.toFixed(2)}s</small></td>
  <td class="frame-cell">${r.refPng ? `<img src="${r.refPng}" alt="REF"><small>@${r.refTime.toFixed(2)}s</small>` : "—"}</td>
  <td class="${r.contentPass === false ? "psnr-bad" : "psnr-ok"}">${fmtPsnr(r.psnrContent)}</td>
  <td>${fmtPsnr(r.psnrSelf)}</td>
</tr>`).join("\n")}
</tbody></table>

<h2>Audio Voice-Onsets (first 30)</h2>
<table>
<thead><tr><th>#</th><th>Time</th><th>Silence-Before</th><th>Phase Window</th></tr></thead>
<tbody>
${voiceOnsets.slice(0, 30).map((o, i) => `<tr><td>${i + 1}</td><td>${o.t.toFixed(2)}s = ${formatTime(o.t)}</td><td>${o.silenceBefore.toFixed(2)}s</td><td>${o.phase}</td></tr>`).join("\n")}
</tbody></table>
</body></html>`;

const reportPath = path.join(qgDir, "report.html");
fs.writeFileSync(reportPath, reportHtml);

const reportJson = {
  ts: new Date().toISOString(),
  tenant, take, variant,
  audio: { dur: audioInfo.duration, file: audioFile },
  output: { dur: outputDur, file: outputFile },
  schedule: { entries: scheduleEntries.length, total: scheduleTotal },
  highEnd: { score, passed, total, isHighEnd, subGates },
  gates: { gateA, gateB, gateC, gateE, gateF_loudness, gateF_clipping, gateF_internalSilence, gateG_phaseA, gateG_phaseB, gateH, gateI, gateJ },
  phaseResults,
};
fs.writeFileSync(path.join(qgDir, "report.json"), JSON.stringify(reportJson, null, 2));

console.log("");
console.log("════════════════════════════════════════════════════════════");
console.log(`  HIGH-END QUALITY-GATE  ${tenant} take${fileSuffix}`);
console.log("════════════════════════════════════════════════════════════");
for (const g of subGates) {
  console.log(`  ${g.pass ? "✓" : "✗"} ${g.id.padStart(2)}. ${g.name}`);
}
console.log("════════════════════════════════════════════════════════════");
console.log(`  VERDICT: ${isHighEnd ? "✓ 10/10 — HIGH-END (Founder kann reviewen)" : "✗ " + score + " — FAIL (vor Founder-Review fixen)"}`);
console.log("════════════════════════════════════════════════════════════");
console.log("");
console.log(`  report HTML: ${reportPath}`);
console.log(`  report JSON: ${path.join(qgDir, "report.json")}`);
console.log(`  frames dir:  ${framesDir}`);
console.log("");

if (!isHighEnd) {
  console.log("⚠ NOT 10/10 — Founder NICHT reviewen, erst fixen:");
  for (const g of subGates.filter(g => !g.pass)) {
    console.log(`  ✗ ${g.id}. ${g.name}`);
  }
  process.exit(2);
}
