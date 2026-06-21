#!/usr/bin/env node
/**
 * qg_t4_compare.mjs — Quality Gate for Take 4: tenant vs Dörfler-Schablone.
 *
 * Vergleicht das aktuelle Take 4 eines Tenants gegen Dörfler AG (Schablone)
 * auf mehreren Achsen:
 *   1. Duration (Video + Audio)
 *   2. Frame-SSIM an 12 Schlüssel-Timestamps
 *   3. Phone-Region SSIM (28-35s — Phone-Slide-In)
 *   4. Audio-Silence-Map Overlap
 *   5. Loom-Region Frame-Sample (50s vs 120s)
 *
 * Output:
 *   - Console: PASS/FAIL pro Check + Summary
 *   - HTML-Report mit Side-by-Side + Verdict
 *
 * Usage:
 *   node scripts/_ops/qg_t4_compare.mjs --target=leins-ag [--reference=doerfler-ag]
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");

const args = process.argv.slice(2);
function arg(name, def) {
  const a = args.find((x) => x.startsWith(`--${name}=`))?.split("=")[1];
  return a ?? def;
}

const target = arg("target");
const reference = arg("reference", "doerfler-ag");
if (!target) { console.error("usage: --target=<slug> [--reference=<slug>]"); process.exit(2); }

const targetMp4 = join(REPO_ROOT, `docs/gtm/pipeline/06_video_production/master_takes/take4/${target}.mp4`);
const refMp4 = join(REPO_ROOT, `docs/gtm/pipeline/06_video_production/master_takes/take4/${reference}.mp4`);
const outDir = join(REPO_ROOT, `docs/gtm/pipeline/06_video_production/_generated/qg/${target}`);
mkdirSync(outDir, { recursive: true });

if (!existsSync(targetMp4)) { console.error(`✗ no target master: ${targetMp4}`); process.exit(2); }
if (!existsSync(refMp4)) { console.error(`✗ no reference master: ${refMp4}`); process.exit(2); }

console.log(`\n═══ Take 4 Quality Gate ═══`);
console.log(`  Target:    ${target}`);
console.log(`  Reference: ${reference} (Schablone)\n`);

const results = [];
function record(check, pass, detail) {
  results.push({ check, pass, detail });
  const icon = pass ? "✓" : "✗";
  console.log(`  ${icon} ${check.padEnd(40)} ${detail}`);
}

// ─── Check 1: Duration ───
function duration(mp4) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4]);
  return parseFloat(r.stdout.toString().trim());
}
const targetDur = duration(targetMp4);
const refDur = duration(refMp4);
const dDiff = Math.abs(targetDur - refDur);
record("DURATION", dDiff < 0.5, `target=${targetDur.toFixed(2)}s ref=${refDur.toFixed(2)}s diff=${dDiff.toFixed(2)}s (gate: ±0.5s)`);

// ─── Check 2-4: Frame extraction + SSIM at key timestamps ───
const PHONE_REGION = [28, 31, 35];   // when phone is in
const LOOM_REGION  = [50, 75, 95];   // small-Loom phase
const POST_IRIS    = [105, 130, 160]; // big-Loom phase
// 09.06.: 10/11/12s ergänzt — schloss den blinden Fleck am Fall-Reveal (CASE_REVEAL_T=11,0s),
// der zwischen den alten Samples 5 und 15 lag → frühe/späte Reveals blieben unentdeckt.
const TIMESTAMPS = Array.from(new Set([5, 10, 11, 12, 15, 22, ...PHONE_REGION, 38, ...LOOM_REGION, ...POST_IRIS])).sort((a, b) => a - b);

function extractFrame(mp4, t, out) {
  spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(t), "-i", mp4, "-vframes", "1", "-y", out]);
}

function ssim(a, b) {
  // Use ffmpeg ssim filter — single-pass over both static images
  const r = spawnSync("ffmpeg", [
    "-hide_banner", "-loglevel", "info",
    "-i", a, "-i", b,
    "-filter_complex", "[0:v][1:v]ssim",
    "-f", "null", "-"
  ]);
  const log = r.stderr.toString();
  // ffmpeg SSIM output: "SSIM R:... G:... B:... All:N.NNNN" (RGB for PNG) or "SSIM Y:... All:N.NNNN" (YUV)
  const m = log.match(/SSIM[^]*?All:([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

function ssimRegion(a, b, x, y, w, h) {
  // Crop region from both and compare
  const cropA = a + ".crop.png";
  const cropB = b + ".crop.png";
  spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", a, "-vf", `crop=${w}:${h}:${x}:${y}`, cropA]);
  spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", b, "-vf", `crop=${w}:${h}:${x}:${y}`, cropB]);
  return ssim(cropA, cropB);
}

const framesDir = join(outDir, "frames");
mkdirSync(framesDir, { recursive: true });

const ssimResults = [];
console.log(`\n  Frame-SSIM at ${TIMESTAMPS.length} timestamps:`);
for (const t of TIMESTAMPS) {
  const fT = join(framesDir, `target_t${t}.png`);
  const fR = join(framesDir, `ref_t${t}.png`);
  extractFrame(targetMp4, t, fT);
  extractFrame(refMp4, t, fR);
  const s = ssim(fT, fR);
  ssimResults.push({ t, ssim: s });
  console.log(`    t=${String(t).padStart(3)}s  SSIM=${s !== null ? s.toFixed(3) : "ERR"}`);
}

const ssimAvg = ssimResults.filter((r) => r.ssim !== null).reduce((a, r) => a + r.ssim, 0) / ssimResults.length;
const ssimMin = Math.min(...ssimResults.map((r) => r.ssim ?? 1));
const lowFrames = ssimResults.filter((r) => r.ssim !== null && r.ssim < 0.80);

record("FRAME-SSIM-AVG", ssimAvg >= 0.85, `avg=${ssimAvg.toFixed(3)} min=${ssimMin.toFixed(3)} (gate: avg≥0.85)`);
record("FRAME-SSIM-MIN", ssimMin >= 0.70, `min=${ssimMin.toFixed(3)} (gate: min≥0.70)`);
if (lowFrames.length > 0) {
  console.log(`    ⚠ Low-SSIM Timestamps (<0.80):`);
  for (const f of lowFrames) console.log(`      t=${f.t}s → SSIM ${f.ssim.toFixed(3)}`);
}

// ─── Check 5: Phone-Region SSIM (28-35s, x=720..1100, y=80..820) ───
console.log(`\n  Phone-Region SSIM (28-35s):`);
const phoneRegionResults = [];
for (const t of PHONE_REGION) {
  const fT = join(framesDir, `target_t${t}.png`);
  const fR = join(framesDir, `ref_t${t}.png`);
  const s = ssimRegion(fT, fR, 720, 80, 380, 740);
  phoneRegionResults.push({ t, ssim: s });
  console.log(`    t=${t}s  Phone-SSIM=${s !== null ? s.toFixed(3) : "ERR"}`);
}
const phoneAvg = phoneRegionResults.filter((r) => r.ssim !== null).reduce((a, r) => a + r.ssim, 0) / phoneRegionResults.length;
record("PHONE-REGION-SSIM", phoneAvg >= 0.80, `avg=${phoneAvg.toFixed(3)} (gate: ≥0.80)`);

// ─── Check 6: Audio Silence Map overlap ───
function silenceMap(mp4) {
  const r = spawnSync("ffmpeg", ["-i", mp4, "-af", "silencedetect=noise=-30dB:d=0.15", "-f", "null", "-"], { encoding: "utf8" });
  const log = r.stderr.toString();
  const silences = [];
  let start = null;
  for (const line of log.split("\n")) {
    const sm = line.match(/silence_start: ([\d.]+)/);
    if (sm) { start = parseFloat(sm[1]); continue; }
    const em = line.match(/silence_end: ([\d.]+)/);
    if (em && start !== null) { silences.push([start, parseFloat(em[1])]); start = null; }
  }
  return silences;
}
const sT = silenceMap(targetMp4);
const sR = silenceMap(refMp4);

// Compute overlap: for each ref silence, find overlapping target silence
let overlapTotal = 0, refTotal = 0;
for (const [rs, re] of sR) {
  refTotal += re - rs;
  for (const [ts, te] of sT) {
    const start = Math.max(rs, ts);
    const end = Math.min(re, te);
    if (end > start) overlapTotal += end - start;
  }
}
const overlapPct = refTotal > 0 ? overlapTotal / refTotal : 0;
record("AUDIO-SILENCE-OVERLAP", overlapPct >= 0.85, `${(overlapPct * 100).toFixed(1)}% overlap of ref-silences (gate: ≥85%)`);

// ─── Check 7: Loom-Region SSIM (small Loom at sidebar 40,350 dia 170) ───
console.log(`\n  Loom-Region SSIM (small Loom @ sidebar):`);
const loomRegionResults = [];
for (const t of LOOM_REGION) {
  const fT = join(framesDir, `target_t${t}.png`);
  const fR = join(framesDir, `ref_t${t}.png`);
  const s = ssimRegion(fT, fR, 40, 350, 170, 170);
  loomRegionResults.push({ t, ssim: s });
  console.log(`    t=${t}s  Loom-SSIM=${s !== null ? s.toFixed(3) : "ERR"}`);
}
const loomAvg = loomRegionResults.filter((r) => r.ssim !== null).reduce((a, r) => a + r.ssim, 0) / loomRegionResults.length;
record("LOOM-REGION-SSIM", loomAvg >= 0.75, `avg=${loomAvg.toFixed(3)} (gate: ≥0.75; checks hflip+position match)`);

// ─── Check 8: Big-Loom SSIM (post-iris 105+, full canvas center) ───
console.log(`\n  Big-Loom SSIM (post-iris, full canvas):`);
const bigLoomResults = [];
for (const t of POST_IRIS) {
  const fT = join(framesDir, `target_t${t}.png`);
  const fR = join(framesDir, `ref_t${t}.png`);
  const s = ssimRegion(fT, fR, 270, 0, 900, 900);
  bigLoomResults.push({ t, ssim: s });
  console.log(`    t=${t}s  Big-Loom-SSIM=${s !== null ? s.toFixed(3) : "ERR"}`);
}
const bigLoomAvg = bigLoomResults.filter((r) => r.ssim !== null).reduce((a, r) => a + r.ssim, 0) / bigLoomResults.length;
record("BIG-LOOM-SSIM", bigLoomAvg >= 0.85, `avg=${bigLoomAvg.toFixed(3)} (gate: ≥0.85)`);

// ─── HTML Report ───
const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>QG ${target} vs ${reference}</title>
<style>body{font-family:system-ui;max-width:1400px;margin:auto;padding:20px;background:#0b1220;color:#eee}
.check{padding:8px 16px;margin:4px 0;border-radius:6px;font-family:monospace;font-size:13px}
.pass{background:#0f3a23}.fail{background:#5c1a1a}
table{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
th,td{padding:8px;border:1px solid #2a3a52;text-align:left}
.frames{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:20px 0}
.frames img{width:100%;border:1px solid #2a3a52}
h2{margin-top:30px;color:#fbbf24}
h3{margin-top:20px;color:#a3e635}
.summary{font-size:18px;padding:20px;border-radius:8px;margin:20px 0}
.summary.pass{background:#0f3a23}.summary.fail{background:#5c1a1a}
</style></head><body>
<h1>Take 4 Quality Gate — ${target} vs ${reference}</h1>
<div class="summary ${results.every((r) => r.pass) ? "pass" : "fail"}">
  ${results.every((r) => r.pass) ? "✓ ALL GATES PASSED" : "✗ FAIL: " + results.filter((r) => !r.pass).length + " of " + results.length + " gates failed"}
</div>
<h2>Gate Results</h2>
${results.map((r) => `<div class="check ${r.pass ? "pass" : "fail"}">${r.pass ? "✓" : "✗"} <strong>${r.check}</strong> — ${r.detail}</div>`).join("\n")}
<h2>Frame-Vergleich (Target ↔ Reference)</h2>
${TIMESTAMPS.map((t) => `
<h3>t=${t}s — SSIM ${(ssimResults.find((r) => r.t === t)?.ssim ?? 0).toFixed(3)}</h3>
<div class="frames">
  <div><div style="color:#fbbf24;padding:4px">TARGET (${target})</div><img src="frames/target_t${t}.png"></div>
  <div><div style="color:#a3e635;padding:4px">REFERENCE (${reference})</div><img src="frames/ref_t${t}.png"></div>
</div>
`).join("\n")}
<p style="color:#888;margin-top:40px">Generated: ${new Date().toISOString()}</p>
</body></html>`;

const reportPath = join(outDir, "t4_compare_report.html");
writeFileSync(reportPath, html);

// ─── Summary ───
const allPass = results.every((r) => r.pass);
console.log(`\n═══ Summary ═══`);
console.log(`  ${allPass ? "✓ ALL GATES PASS" : "✗ FAIL: " + results.filter((r) => !r.pass).length + "/" + results.length + " gates failed"}`);
console.log(`  Report: ${reportPath}`);
process.exit(allPass ? 0 : 1);
