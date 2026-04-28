// Sharpness gate for video freeze-frames.
//
// Problem: Builder freezt am Ende einer Phase (target > source range) den
// letzten Frame. Wenn dieser Frame während Animation/Hover/Subpixel-Drift liegt,
// wird der gesamte Freeze blurry (FB6: "Website-Formular ...", "+6 weitere
// Schritte", Anhänge-Hinweis verschwommen).
//
// Lösung: Source-Range scannen, schärfsten Frame als Freeze-Anker wählen.
// Skaliert für alle Tenants — kein Founder-Tuning nötig.
//
// Sharpness-Proxy: YAVG nach edgedetect=wires (Edge-density). Höher = mehr
// scharfe Edges = schärferes Bild. Subpixel-Antialiasing in Text reduziert YAVG.

import { run } from "./ffmpeg.mjs";

// Single-frame sharpness measurement. Returns YAVG (0..255) of edge-detected frame.
// Higher = sharper (more crisp edges in the image).
export async function measureSharpness(file, atSec) {
  const { stderr } = await run(
    "ffmpeg",
    [
      "-hide_banner",
      "-ss", atSec.toFixed(3),
      "-i", file,
      "-frames:v", "1",
      "-vf", "edgedetect=mode=wires:low=0.1:high=0.4,signalstats,metadata=mode=print",
      "-f", "null", "-",
    ],
    { captureStderr: true }
  );
  const m = stderr.match(/signalstats\.YAVG=([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

// Scan a source range, return position with highest sharpness score.
// stepSec: granularity of scan (0.1s = 10 samples/s).
// Returns: { sec, score, samples: [{sec, score}, ...] }
export async function findSharpestFrame(file, startSec, endSec, { stepSec = 0.1 } = {}) {
  const samples = [];
  const tStart = Math.max(0, startSec);
  const tEnd = Math.max(tStart + stepSec, endSec);
  for (let t = tStart; t <= tEnd + 0.001; t += stepSec) {
    const score = await measureSharpness(file, t);
    samples.push({ sec: parseFloat(t.toFixed(3)), score });
  }
  if (samples.length === 0) return { sec: tStart, score: 0, samples };
  let best = samples[0];
  for (const s of samples) if (s.score > best.score) best = s;
  return { sec: best.sec, score: best.score, samples };
}

// Smart freeze-anchor picker. Used by build_from_phase_schedule for phases
// where target_dur > source_dur (freeze phase).
//
// Strategy:
//   - If sourceDur < minPlayDur (e.g. 0.5s): scan full range for sharpest frame,
//     return it as anchor (no play, pure freeze of static image).
//   - If sourceDur >= minPlayDur AND freezeDur >= 1.0: scan last 30% of source
//     range for sharpest frame, snap srcEnd there. Avoids landing on a
//     mid-animation frame at the boundary.
//   - Else: return original srcEnd (no change).
//
// Returns: { srcStart, srcEnd, anchor, sharpness, decision, samples }
//   decision: "auto-snap" | "kept-end" | "static-anchor"
export async function pickFreezeAnchor(file, srcStart, srcEnd, freezeDur, opts = {}) {
  const minPlayDur = opts.minPlayDur ?? 0.5;
  const scanTailFrac = opts.scanTailFrac ?? 0.3;
  const stepSec = opts.stepSec ?? 0.1;
  const sourceDur = srcEnd - srcStart;

  if (freezeDur < 1.0) {
    return {
      srcStart,
      srcEnd,
      anchor: srcEnd,
      sharpness: await measureSharpness(file, srcEnd),
      decision: "kept-end",
      samples: [],
    };
  }

  if (sourceDur < minPlayDur) {
    const scan = await findSharpestFrame(file, srcStart, srcEnd, { stepSec });
    return {
      srcStart: scan.sec,
      srcEnd: scan.sec + 0.001,
      anchor: scan.sec,
      sharpness: scan.score,
      decision: "static-anchor",
      samples: scan.samples,
    };
  }

  const tailStart = srcEnd - sourceDur * scanTailFrac;
  const scan = await findSharpestFrame(file, tailStart, srcEnd, { stepSec });
  return {
    srcStart,
    srcEnd: scan.sec,
    anchor: scan.sec,
    sharpness: scan.score,
    decision: "auto-snap",
    samples: scan.samples,
  };
}

// Post-build verification: measure freeze-frame sharpness in output and compare
// to source mean. Returns gate pass/fail.
export async function gateFreezeSharpness(outFile, freezePoints, opts = {}) {
  const tolerance = opts.tolerance ?? 0.15; // 15% drop max vs source mean
  const measurements = [];
  for (const fp of freezePoints) {
    const score = await measureSharpness(outFile, fp.atSec);
    measurements.push({ ...fp, outputSharpness: score });
  }
  const failures = measurements.filter((m) => {
    if (!m.sourceSharpness) return false;
    return m.outputSharpness < m.sourceSharpness * (1 - tolerance);
  });
  return {
    pass: failures.length === 0,
    measurements,
    failures,
  };
}
