#!/usr/bin/env node
// auto_calibrate_phase_library_v2.mjs
//
// SKALIERUNGS-MASCHINE — Auto-Calibration v2 (PIPELINE_BIBLE §43 Stage 3.5)
//
// Erkennt Key-Visual-Events im Tenant-Source-Recording via Scene-Cut +
// Pixel-Brightness-Detection. Baut piecewise-linear Timing-Map
// (master_t → tenant_t) aus Anchor-Paaren + Sentinels und projiziert
// die Master-Phase-Library auf die Tenant-Zeitachse.
//
// Im Gegensatz zu v1 (uniform ratio-scaling) korrigiert v2 NICHT-proportionale
// Drift, die typisch ist bei Recording-Variance über mehrere Sekunden hinweg.
//
// Pflicht-Schwellen (PIPELINE_BIBLE §44):
//   - Self-Test gegen Master: jeder Anchor muss innerhalb ±tolerance s wiedergefunden werden
//   - Override-Output ist drop-in kompatibel mit build_from_phase_schedule.mjs
//   - Confidence-Metadata pro Phase: detected | interpolated | fallback
//
// Usage:
//   node scripts/_ops/audio/auto_calibrate_phase_library_v2.mjs \
//        --tenant leins-ag --take 3 --industry sanitaer
//
//   --master doerfler-ag       — Master-Tenant (default: doerfler-ag)
//   --self-test                — Lauf gegen Master, prüft alle Anchors auf Match
//   --audit                    — Schreibt Audit-PNGs pro Anchor (Coord-Marker + Match)
//   --dry-run                  — kein Override schreiben

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { loadEnv, REPO_ROOT, PIPELINE_ROOT } from "./_lib/env.mjs";
import { run } from "./_lib/ffmpeg.mjs";

loadEnv();

// sharp is in src/web/node_modules (Next.js dep). createRequire so it
// resolves regardless of which cwd this script is run from.
const requireFromWeb = createRequire(path.join(REPO_ROOT, "src", "web", "package.json"));
const sharp = requireFromWeb("sharp");

const argv = process.argv.slice(2);
function arg(flag, def = null) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : def;
}
function flag(name) {
  return argv.includes(name);
}

const tenant = arg("--tenant");
const take = arg("--take");
const industry = arg("--industry", "sanitaer");
const masterTenant = arg("--master", "doerfler-ag");
const selfTest = flag("--self-test");
const audit = flag("--audit");
const dryRun = flag("--dry-run");

if (!take || (!tenant && !selfTest)) {
  console.error("usage: --tenant <slug> --take <N> [--industry sanitaer] [--master doerfler-ag] [--self-test] [--audit] [--dry-run]");
  process.exit(1);
}

const effectiveTenant = selfTest ? masterTenant : tenant;

console.log(`auto-calibrate-v2 (Pixel-State-Detection)`);
console.log(`  tenant:   ${effectiveTenant}${selfTest ? " (SELF-TEST)" : ""}`);
console.log(`  take:     ${take}`);
console.log(`  industry: ${industry}`);
console.log(`  master:   ${masterTenant}`);
if (audit) console.log(`  audit:    ON`);
if (dryRun) console.log(`  dry-run:  ON`);

// ─── Load spec + master library ──────────────────────────────────────────────
const specPath = path.join(PIPELINE_ROOT, "phase_library_defs", "_calibration_anchors", `take${take}_${industry}.json`);
if (!fs.existsSync(specPath)) {
  console.error(`KEY_EVENTS spec missing: ${specPath}`);
  process.exit(1);
}
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

const libPath = path.join(PIPELINE_ROOT, "phase_library_defs", `take${take}_${industry}.json`);
const lib = JSON.parse(fs.readFileSync(libPath, "utf8"));

const sourceTemplate = lib.sources?.original;
if (!sourceTemplate) {
  console.error(`master phase library has no 'sources.original' template`);
  process.exit(1);
}
function resolveSource(slug) {
  return path.join(PIPELINE_ROOT, sourceTemplate.replace(/\{tenant\}/g, slug));
}

const masterSource = resolveSource(masterTenant);
const tenantSource = resolveSource(effectiveTenant);
for (const f of [masterSource, tenantSource]) {
  if (!fs.existsSync(f)) {
    console.error(`source missing: ${f}`);
    process.exit(1);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function videoDuration(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=duration", "-show_entries", "format=duration",
    "-of", "json", file,
  ], { captureStdout: true, captureStderr: false });
  const j = JSON.parse(stdout);
  return Number(j.streams?.[0]?.duration || j.format?.duration || 0);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `autocal_${effectiveTenant}_t${take}_`));
let tmpCounter = 0;
function tmpPng() {
  return path.join(tmpDir, `f_${++tmpCounter}.png`);
}

// Extract one frame at time t.
async function extractFrame(file, t, outPng) {
  await run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", String(t), "-i", file,
    "-frames:v", "1", "-q:v", "2", outPng,
  ]);
  return outPng;
}

// Sample mean RGB of a small NxN window centered at (x, y).
async function samplePixelMean(file, t, x, y, win = 5) {
  const png = await extractFrame(file, t, tmpPng());
  const img = sharp(png);
  const meta = await img.metadata();
  const half = Math.floor(win / 2);
  const left = Math.max(0, Math.min(meta.width - win, x - half));
  const top = Math.max(0, Math.min(meta.height - win, y - half));
  const buf = await img
    .extract({ left, top, width: win, height: win })
    .raw()
    .toBuffer();
  let r = 0, g = 0, b = 0;
  const px = win * win;
  const ch = buf.length / px;
  for (let i = 0; i < buf.length; i += ch) {
    r += buf[i]; g += buf[i + 1]; b += buf[i + 2];
  }
  return { r: r / px, g: g / px, b: b / px, brightness: (r + g + b) / (3 * px) };
}

// Run ffmpeg select='gt(scene,X)' over [t0, t1] and return a list of
// scene-cut times relative to file (seconds, 0.001s precision).
async function detectSceneCuts(file, t0, t1, minScore) {
  // Use showinfo + select to get pts_time for scene cuts
  const dur = t1 - t0;
  if (dur <= 0) return [];
  const args = [
    "-hide_banner", "-loglevel", "info", "-y",
    "-ss", String(t0), "-t", String(dur),
    "-i", file,
    "-vf", `select='gt(scene,${minScore})',showinfo`,
    "-an", "-vsync", "vfr",
    "-f", "null", "-",
  ];
  let stderr = "";
  try {
    const r = await run("ffmpeg", args, { captureStderr: true });
    stderr = r.stderr || "";
  } catch (e) {
    stderr = String(e.message || e);
  }
  const cuts = [];
  for (const m of stderr.matchAll(/pts_time:([0-9.]+)/g)) {
    const ptsTime = Number(m[1]);
    cuts.push(t0 + ptsTime);
  }
  return cuts;
}

// Sample brightness across [t0, t1] every step seconds.
async function sampleBrightness(file, t0, t1, x, y, step = 0.05) {
  const samples = [];
  for (let t = t0; t <= t1 + 1e-6; t += step) {
    const px = await samplePixelMean(file, t, x, y);
    samples.push({ t: Math.round(t * 1000) / 1000, brightness: px.brightness });
  }
  return samples;
}

// ─── Detection per anchor type ───────────────────────────────────────────────
async function detectAnchor(file, anchor) {
  const [t0, t1] = anchor.scan;
  const d = anchor.detect;
  if (d.type === "scene_cut") {
    const cuts = await detectSceneCuts(file, t0, t1, d.min_score ?? 0.2);
    if (!cuts.length) return { detected: false, reason: "no scene-cut in scan range" };
    // Earliest cut wins; ffmpeg sometimes reports cut at t0 itself (seek artifact),
    // ignore cuts within first 0.1s of scan window.
    const firstReal = cuts.find((t) => t > t0 + 0.1) ?? cuts[0];
    return { detected: true, t: firstReal, candidates: cuts.length, _all: cuts };
  }
  if (d.type === "pixel_brightness_drop" || d.type === "pixel_brightness_recovery") {
    const isDrop = d.type === "pixel_brightness_drop";
    const samples = await sampleBrightness(file, t0, t1, d.coords[0], d.coords[1], 0.05);
    if (samples.length < 4) return { detected: false, reason: "scan too short" };
    // Baseline = mean of first baseline_window seconds.
    const winN = Math.max(2, Math.round((d.baseline_window ?? 0.4) / 0.05));
    const baseline = samples.slice(0, winN).reduce((a, s) => a + s.brightness, 0) / winN;
    const threshold = d.drop_threshold ?? d.recovery_threshold ?? 25;
    let trigger = null;
    for (let i = winN; i < samples.length; i++) {
      const delta = isDrop ? baseline - samples[i].brightness : samples[i].brightness - baseline;
      if (delta >= threshold) { trigger = samples[i]; break; }
    }
    if (!trigger) return { detected: false, reason: `no ${isDrop ? "drop" : "recovery"} ≥${threshold} from baseline ${baseline.toFixed(1)}` };
    return { detected: true, t: trigger.t, baseline, triggerBrightness: trigger.brightness, samples };
  }
  return { detected: false, reason: `unknown detect.type ${d.type}` };
}

// ─── Detection-Strategy ──────────────────────────────────────────────────────
// Two-pass approach:
//   Pass A (preferred): Global scene-cut scan over union of all scan-ranges,
//     then ordinal assignment (n-th cut → n-th anchor in master-t-order).
//     This is robust against systematic drift (anchors shift by similar amounts).
//   Pass B (fallback per anchor): If global count doesn't match, fall back to
//     per-anchor closest-to-master-t with widened scan range.
// Pixel-brightness anchors always use per-anchor detection.

console.log(`\n=== Detection (${spec.anchors.length} anchors) ===`);
const detected = [];

// Validate spec
for (const a of spec.anchors) {
  if (typeof a.master_t !== "number") {
    console.error(`✗ spec error: anchor "${a.id}" missing master_t`);
    process.exit(1);
  }
}

const sceneCutAnchors = spec.anchors
  .filter((a) => a.detect.type === "scene_cut")
  .sort((x, y) => x.master_t - y.master_t);
const otherAnchors = spec.anchors.filter((a) => a.detect.type !== "scene_cut");

// Pass A: ordinal scene-cut detection
const ordinalAssigned = new Map();
if (sceneCutAnchors.length) {
  const scanT0 = Math.max(0, Math.min(...sceneCutAnchors.map((a) => a.scan[0])));
  const scanT1 = Math.max(...sceneCutAnchors.map((a) => a.scan[1]));
  const minScore = Math.min(...sceneCutAnchors.map((a) => a.detect.min_score ?? 0.05));
  const allCuts = await detectSceneCuts(tenantSource, scanT0, scanT1, minScore);
  if (allCuts.length === sceneCutAnchors.length) {
    for (let i = 0; i < allCuts.length; i++) {
      ordinalAssigned.set(sceneCutAnchors[i].id, allCuts[i]);
    }
    console.log(`  [global scan] ${allCuts.length} scene-cuts in [${scanT0}, ${scanT1}]s — ordinal-mapped to ${sceneCutAnchors.length} anchors`);
  } else {
    console.log(`  [global scan] ${allCuts.length} cuts ≠ ${sceneCutAnchors.length} anchors — falling back to per-anchor closest-match`);
  }
}

// Per-anchor detection (Pass B for scene-cuts when ordinal failed; always for pixel anchors)
for (const a of spec.anchors) {
  process.stdout.write(`  ${a.id.padEnd(30)} `);
  let r;
  if (a.detect.type === "scene_cut" && ordinalAssigned.has(a.id)) {
    r = { detected: true, t: ordinalAssigned.get(a.id), source: "ordinal" };
  } else if (a.detect.type === "scene_cut") {
    // Fallback: per-anchor closest-to-master-t
    const cuts = await detectSceneCuts(tenantSource, a.scan[0], a.scan[1], a.detect.min_score ?? 0.05);
    if (!cuts.length) {
      r = { detected: false, reason: "no scene-cut in scan range (fallback)" };
    } else {
      let best = cuts[0];
      let bestDist = Math.abs(cuts[0] - a.master_t);
      for (const t of cuts) {
        const dist = Math.abs(t - a.master_t);
        if (dist < bestDist) { best = t; bestDist = dist; }
      }
      r = { detected: true, t: best, source: "fallback_closest", candidates: cuts.length };
    }
  } else {
    r = await detectAnchor(tenantSource, a);
    r.source = "pixel";
  }
  if (r.detected) {
    const drift = r.t - a.master_t;
    detected.push({ anchor: a, masterT: a.master_t, tenantT: r.t, drift, info: r });
    const tag = r.source === "ordinal" ? "" : ` (${r.source})`;
    console.log(`✓ tenant=${r.t.toFixed(2)}s  master=${a.master_t.toFixed(2)}s  Δ=${drift >= 0 ? "+" : ""}${drift.toFixed(2)}s${tag}`);
  } else {
    console.log(`✗ ${r.reason}`);
    if (a.critical) {
      console.error(`\n✗ CRITICAL anchor "${a.id}" failed — Auto-Cal blocked. Inspect tenant source bei Zeitfenster ${a.scan.join("-")}s.`);
      if (!dryRun) process.exit(2);
    }
  }
}

// ─── Self-Test (if requested) ────────────────────────────────────────────────
if (selfTest) {
  console.log(`\n=== Self-Test (Master-Reproduktion, tolerance ±${spec.self_test?.tolerance_seconds ?? 0.25}s) ===`);
  const tol = spec.self_test?.tolerance_seconds ?? 0.25;
  let fails = 0;
  for (const d of detected) {
    const ok = Math.abs(d.drift) <= tol;
    console.log(`  ${ok ? "✓" : "✗"}  ${d.anchor.id.padEnd(30)} drift=${d.drift >= 0 ? "+" : ""}${d.drift.toFixed(2)}s`);
    if (!ok) fails++;
  }
  if (fails > 0) {
    console.error(`\n✗ self-test FAILED — ${fails}/${detected.length} anchors out of tolerance. Detection broken oder Master-Recording verschoben.`);
    process.exit(3);
  }
  console.log(`\n✓ self-test PASS — Detection-Engine reproduziert Master-Anchors innerhalb ±${tol}s.`);
  process.exit(0);
}

// ─── Virtual Anchor: wizard_end (BEFORE controlPoints) ──────────────────────
// 28.04. Lehre aus Stark-Pipeline: pre_anchor_identity erzeugte
// Source-Range-Overlaps weil identity-Phases (≤ 30.2 master) auf master-times
// mappen, anchored-Phases (> 30.2) auf piecewise-times — bei Tenants mit
// stark abweichendem Wizard-Ende (Stark: -6s) gehen die piecewise-Phases
// BACKWARDS und überlappen die identity-Phases.
//
// Lösung: Virtual Anchor "wizard_end" am visuellen Wizard-Ende. Berechnet
// aus success_to_dashboard.tenant_t minus konstantem Offset (5.45s = das
// success-page-hold-Intervall, das tenant-agnostic ist).
const SUCCESS_PAGE_HOLD_S = 5.45;
const VIRTUAL_WIZARD_END_MASTER_T = 32.75;
const successAnchor = detected.find((d) => d.anchor.id === "success_to_dashboard");
if (successAnchor) {
  detected.push({
    anchor: { id: "wizard_end_virtual", master_t: VIRTUAL_WIZARD_END_MASTER_T },
    masterT: VIRTUAL_WIZARD_END_MASTER_T,
    tenantT: successAnchor.tenantT - SUCCESS_PAGE_HOLD_S,
    drift: (successAnchor.tenantT - SUCCESS_PAGE_HOLD_S) - VIRTUAL_WIZARD_END_MASTER_T,
    info: { detected: true, source: "virtual_derived" },
  });
  detected.sort((a, b) => a.masterT - b.masterT);
  console.log(`  [virtual] wizard_end_virtual: master=${VIRTUAL_WIZARD_END_MASTER_T}s → tenant=${(successAnchor.tenantT - SUCCESS_PAGE_HOLD_S).toFixed(2)}s (success_to_dashboard - ${SUCCESS_PAGE_HOLD_S}s)`);
}

// ─── Build piecewise-linear timing map ───────────────────────────────────────
const masterDur = await videoDuration(masterSource);
const tenantDur = await videoDuration(tenantSource);

const controlPoints = [
  { masterT: 0, tenantT: 0, _source: "sentinel_start" },
  ...detected
    .filter((d) => d.info.detected)
    .map((d) => ({ masterT: d.masterT, tenantT: d.tenantT, _source: `anchor:${d.anchor.id}` })),
  { masterT: masterDur, tenantT: tenantDur, _source: "sentinel_end" },
];
controlPoints.sort((a, b) => a.masterT - b.masterT);

// Sanity: monotone tenantT
for (let i = 1; i < controlPoints.length; i++) {
  if (controlPoints[i].tenantT < controlPoints[i - 1].tenantT) {
    console.error(`✗ control points not monotone: ${controlPoints[i - 1]._source}→${controlPoints[i]._source} (tenant time goes backwards)`);
    process.exit(4);
  }
}

function mapTime(masterT) {
  if (masterT <= controlPoints[0].masterT) return controlPoints[0].tenantT;
  const last = controlPoints[controlPoints.length - 1];
  if (masterT >= last.masterT) return last.tenantT;
  for (let i = 1; i < controlPoints.length; i++) {
    const a = controlPoints[i - 1];
    const b = controlPoints[i];
    if (masterT >= a.masterT && masterT <= b.masterT) {
      const span = b.masterT - a.masterT;
      if (span < 1e-6) return a.tenantT;
      const frac = (masterT - a.masterT) / span;
      return a.tenantT + frac * (b.tenantT - a.tenantT);
    }
  }
  return masterT;
}

console.log(`\n=== Timing-Map Control Points ===`);
for (const cp of controlPoints) {
  console.log(`  master=${cp.masterT.toFixed(2)}s → tenant=${cp.tenantT.toFixed(2)}s  (${cp._source})`);
}

// ─── Build Override ──────────────────────────────────────────────────────────
// SAFE_MARGIN_S: Phasen die deutlich VOR dem ersten Anchor liegen (mehr als
// SAFE_MARGIN_S Sekunden) behalten Master-Werte (identity). Wizard 1+2 Region
// ist meist tenant-identisch und benefits von identity. Phasen näher am
// ersten Anchor bekommen piecewise damit sie korrekt mit Anchor-Punkt verbinden.
//
// 28.04. Lehre: Stark/Wälti haben FUNDAMENTAL anderes Wizard-Recording-Timing
// als Master. Weder identity noch piecewise-linear stimmt — diese Tenants
// brauchen Master-Source-Architektur (§43) oder fresh deterministische Aufnahme.
const SAFE_MARGIN_S = 8.0;
const firstAnchorMaster = detected.length ? detected[0].masterT : 0;
const lastAnchorMaster = detected.length ? detected[detected.length - 1].masterT : 0;
const identityBoundary = Math.max(0, firstAnchorMaster - SAFE_MARGIN_S);

function classifyRange(masterStart, masterEnd) {
  if (masterEnd <= identityBoundary) return "pre_anchor_identity";
  if (masterStart > lastAnchorMaster) return "post_anchor_extrapolated";
  return "anchored_interpolated";
}

// Phase-Override-Generation mit zwei Schutz-Regeln:
//
// 1. SHORT_PHASE_IDENTITY: Phasen mit Dauer < SHORT_PHASE_THRESHOLD_S behalten
//    Master-Werte. Lehre 28.04.: 0.1s-Phasen wie success_screen sind ffmpeg-
//    seek-fragil — Verschieben der Source-Position auf nicht-keyframe-
//    aligned Stellen führt zu Concat-Boundary-Bleed (OUT@phase zeigt nächste
//    Phase). Da das Content bei kurzen Phasen ohnehin identisch ist (success_screen
//    bei master 34.0s wie auch tenant 31.5s = beide success-page), ist Master-
//    Werte robuster.
//
// 2. PRE_ANCHOR_IDENTITY: Phasen die deutlich (≥ SAFE_MARGIN_S) vor dem ersten
//    Anchor enden behalten Master-Werte. Verhindert Über-Kompression von
//    Wizard 1+2 (typisch tenant-identical) wenn der erste Anchor Dutzende
//    Sekunden später kommt.
const SHORT_PHASE_THRESHOLD_S = 0.2;

const overridePhases = lib.phases.map((p) => {
  const dur = p.range[1] - p.range[0];
  const cls = classifyRange(p.range[0], p.range[1]);
  const optOutShortIdentity = p.needs_anchored === true;
  if (dur < SHORT_PHASE_THRESHOLD_S && !optOutShortIdentity) {
    return { name: p.name, range: [p.range[0], p.range[1]], _source: "short_phase_identity" };
  }
  if (cls === "pre_anchor_identity") {
    return { name: p.name, range: [p.range[0], p.range[1]], _source: cls };
  }
  return {
    name: p.name,
    range: [
      Math.round(mapTime(p.range[0]) * 100) / 100,
      Math.round(mapTime(p.range[1]) * 100) / 100,
    ],
    _source: optOutShortIdentity ? "anchored_interpolated_forced" : cls,
  };
});

const override = {
  take: lib.take,
  industry: lib.industry,
  tenant: effectiveTenant,
  description: `Auto-generated ${new Date().toISOString().slice(0, 10)} via auto_calibrate_phase_library_v2.mjs (pixel-state-detection)`,
  master: masterTenant,
  masterDuration: Math.round(masterDur * 1000) / 1000,
  tenantDuration: Math.round(tenantDur * 1000) / 1000,
  _calibration: {
    method: "v2_piecewise_linear",
    anchorsTotal: spec.anchors.length,
    anchorsDetected: detected.length,
    controlPoints: controlPoints.map((cp) => ({
      masterT: Math.round(cp.masterT * 100) / 100,
      tenantT: Math.round(cp.tenantT * 100) / 100,
      source: cp._source,
    })),
    detectedAnchors: detected.map((d) => ({
      id: d.anchor.id,
      phase: d.anchor.phase,
      boundary: d.anchor.boundary,
      masterT: Math.round(d.masterT * 100) / 100,
      tenantT: Math.round(d.tenantT * 100) / 100,
      drift: Math.round(d.drift * 100) / 100,
    })),
  },
  phases: overridePhases,
};

// ─── Write override ──────────────────────────────────────────────────────────
const outDir = path.join(PIPELINE_ROOT, "phase_library_defs", "_overrides", effectiveTenant);
const outPath = path.join(outDir, `take${take}_${industry}.json`);
if (dryRun) {
  console.log(`\n[dry-run] would write: ${outPath}`);
  console.log(`[dry-run] phase classification:`);
  const counts = {};
  for (const p of overridePhases) counts[p._source] = (counts[p._source] || 0) + 1;
  console.log(`  ${JSON.stringify(counts)}`);
} else {
  fs.mkdirSync(outDir, { recursive: true });
  // Backup existing v1 override if present
  if (fs.existsSync(outPath)) {
    const bak = `${outPath}.bak_v1_${Date.now()}`;
    fs.renameSync(outPath, bak);
    console.log(`\nℹ existing override backed up: ${path.basename(bak)}`);
  }
  fs.writeFileSync(outPath, JSON.stringify(override, null, 2));
  console.log(`\n✓ wrote per-tenant override: ${outPath}`);
  console.log(`  ${detected.length}/${spec.anchors.length} anchors detected, ${overridePhases.length} phases mapped`);
  const counts = {};
  for (const p of overridePhases) counts[p._source] = (counts[p._source] || 0) + 1;
  console.log(`  classification: ${Object.entries(counts).map(([k,v]) => `${v} ${k}`).join(" · ")}`);
}

// ─── Audit-Modus (optional) ──────────────────────────────────────────────────
if (audit) {
  const auditDir = path.join(PIPELINE_ROOT, "_generated", "autocal_v2", effectiveTenant, `take${take}`);
  fs.mkdirSync(auditDir, { recursive: true });
  console.log(`\n=== Audit (writing PNGs to ${auditDir}) ===`);
  for (const d of detected) {
    if (!d.info.detected) continue;
    const png = path.join(auditDir, `${d.anchor.id}.png`);
    await extractFrame(tenantSource, d.tenantT, png);
    // Coord-Overlay nur bei pixel-typ — scene-cuts haben keine Coords
    if (d.anchor.detect.coords) {
      const [x, y] = d.anchor.detect.coords;
      const svg = `<svg width="${1440}" height="${900}"><circle cx="${x}" cy="${y}" r="14" stroke="#ff00ff" stroke-width="3" fill="none"/><circle cx="${x}" cy="${y}" r="2" fill="#ff00ff"/></svg>`;
      const composed = path.join(auditDir, `${d.anchor.id}_marked.png`);
      await sharp(png)
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .toFile(composed);
      fs.unlinkSync(png);
      console.log(`  ${d.anchor.id} → ${path.basename(composed)}`);
    } else {
      console.log(`  ${d.anchor.id} → ${path.basename(png)}`);
    }
  }
}

// Cleanup tmp
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`\nNext: build + quality-gate to verify`);
console.log(`  node scripts/_ops/audio/build_from_phase_schedule.mjs --tenant ${effectiveTenant} --take ${take}`);
console.log(`  node scripts/_ops/audio/quality_gate.mjs --tenant ${effectiveTenant} --take ${take}`);
