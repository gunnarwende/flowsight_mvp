// Quality gates for audio artifacts. Each gate returns { pass: bool, metric: ..., expected: ..., msg }.
import { ffprobeInfo, run } from "./ffmpeg.mjs";

// Measure integrated loudness + true peak via ffmpeg ebur128.
// ebur128 integrated measurement gates out silence and needs ~3s of audio.
// For shorter clips (<3s) ebur128 returns -70 LUFS. Fall back to volumedetect mean_volume.
export async function measureLoudness(file) {
  const { stderr } = await run(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"],
    { captureStderr: true }
  );
  const tail = stderr.split(/\r?\n/).slice(-40).join("\n");
  const iMatch = tail.match(/I:\s*(-?[\d.]+)\s*LUFS/);
  const tpMatch = tail.match(/Peak:\s*(-?[\d.]+)\s*dBFS/);
  const lraMatch = tail.match(/LRA:\s*([\d.]+)\s*LU/);
  let I = iMatch ? Number(iMatch[1]) : null;
  const TP = tpMatch ? Number(tpMatch[1]) : null;
  const LRA = lraMatch ? Number(lraMatch[1]) : null;

  // Fallback for short clips: if I is unusably low (<-40) but TP is normal, use volumedetect.
  let fallback = null;
  if (I !== null && I < -40 && TP !== null && TP > -40) {
    const { stderr: vd } = await run(
      "ffmpeg",
      ["-hide_banner", "-nostats", "-i", file, "-af", "volumedetect", "-f", "null", "-"],
      { captureStderr: true }
    );
    const meanMatch = vd.match(/mean_volume:\s*(-?[\d.]+)\s*dB/);
    if (meanMatch) {
      fallback = Number(meanMatch[1]);
      I = fallback; // use mean volume as approximation for short clips
    }
  }
  return { I, TP, LRA, fallbackMeanVolume: fallback };
}

// Detect silence gaps inside the file (e.g. dead sections between turns).
export async function detectSilence(file, { noiseDb = -42, minMs = 400 } = {}) {
  const { stderr } = await run(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-af", `silencedetect=noise=${noiseDb}dB:d=${(minMs / 1000).toFixed(3)}`, "-f", "null", "-"],
    { captureStderr: true }
  );
  const segments = [];
  let curStart = null;
  for (const line of stderr.split(/\r?\n/)) {
    const s = line.match(/silence_start:\s*(-?[\d.]+)/);
    if (s) curStart = Number(s[1]);
    const e = line.match(/silence_end:\s*(-?[\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/);
    if (e && curStart !== null) {
      segments.push({ start: curStart, end: Number(e[1]), duration: Number(e[2]) });
      curStart = null;
    }
  }
  return segments;
}

export async function gateLoudness(file, { expectedI = -14, tolerance = 1.0, maxTP = -1.0 } = {}) {
  const m = await measureLoudness(file);
  const iOk = m.I !== null && Math.abs(m.I - expectedI) <= tolerance;
  const tpOk = m.TP !== null && m.TP <= maxTP;
  return {
    pass: iOk && tpOk,
    metric: m,
    expected: { I: `${expectedI}±${tolerance}`, TP: `≤${maxTP}` },
    msg: iOk && tpOk ? "loudness ok" : `loudness off: I=${m.I} TP=${m.TP}`,
  };
}

export async function gateDuration(file, { expected, tolerance = 2.0 } = {}) {
  const info = await ffprobeInfo(file);
  const delta = Math.abs(info.duration - expected);
  return {
    pass: delta <= tolerance,
    metric: { duration: info.duration },
    expected: { duration: `${expected}±${tolerance}s` },
    msg: delta <= tolerance ? `duration ok (${info.duration.toFixed(2)}s)` : `duration drift ${delta.toFixed(2)}s (got ${info.duration.toFixed(2)}s, want ${expected}s)`,
  };
}

export async function gateNoClipping(file) {
  const { TP } = await measureLoudness(file);
  return {
    pass: TP !== null && TP < 0,
    metric: { TP },
    expected: { TP: "<0 dBFS" },
    msg: TP !== null && TP < 0 ? "no clipping" : `clipping risk TP=${TP}`,
  };
}

export async function gateNoInternalSilence(file, { maxInternalMs = 900 } = {}) {
  const segs = await detectSilence(file, { noiseDb: -42, minMs: maxInternalMs });
  const info = await ffprobeInfo(file);
  const internal = segs.filter((s) => s.start > 0.5 && s.end < info.duration - 0.5);
  return {
    pass: internal.length === 0,
    metric: { internalSilenceSegments: internal },
    expected: { maxInternalSilenceMs: maxInternalMs },
    msg: internal.length === 0 ? "no internal dead air" : `${internal.length} internal silence segment(s) ≥${maxInternalMs}ms`,
  };
}

export function summarize(results) {
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  return {
    pass: passed === total,
    score: `${passed}/${total}`,
    results,
  };
}
