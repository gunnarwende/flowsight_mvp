#!/usr/bin/env node
// auto_calibrate_phase_library.mjs
//
// SKALIERUNGS-FIX (PIPELINE_BIBLE §42 Stage 3.5):
// Pre-Recording-Variance kann nicht 100% wegcoded werden (OS-Scheduling, Browser-
// Hydration). Pro Tenant erzeugt diese Recording-Session leicht andere Source-
// Timings. Phase-Library kalibriert auf Master-Tenant funktioniert nicht 1:1
// für Folge-Tenants.
//
// Lösung: Auto-Calibration-Skript erkennt Tenant-Source-Recording-Timings,
// generiert per-Tenant Phase-Library-Override automatisch.
//
// v1 (pragmatic): Duration-Ratio-Scaling. Misst Tenant-Source-Dauer vs Master,
// berechnet Scale-Factor, wendet auf alle Phase-Ranges an. Schreibt Override.
// Funktioniert wenn Recording-Variance proportional ist (typisch bei kleiner
// Drift).
//
// v2 (geplant): Pixel-State-Detection für Key-Events (Leck-Card-blue-border,
// Step-2-active, Strasse-typed, etc.) → präzise per-Phase-Calibration auch
// bei nicht-proportionaler Drift.
//
// Usage:
//   node scripts/_ops/audio/auto_calibrate_phase_library.mjs \
//        --tenant leins-ag --take 3 --industry sanitaer [--master doerfler-ag]

import fs from "node:fs";
import path from "node:path";
import { loadEnv, REPO_ROOT, PIPELINE_ROOT } from "./_lib/env.mjs";
import { ffprobeInfo, run } from "./_lib/ffmpeg.mjs";

loadEnv();

const argv = process.argv.slice(2);
function argVal(flag, defVal = null) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : defVal;
}
const tenant = argVal("--tenant");
const take = argVal("--take");
const industry = argVal("--industry", "sanitaer");
const masterTenant = argVal("--master", "doerfler-ag");
if (!tenant || !take) {
  console.error("usage: --tenant <slug> --take <N> [--industry sanitaer] [--master doerfler-ag]");
  process.exit(1);
}

console.log(`auto-calibrate Phase-Library`);
console.log(`  tenant: ${tenant}`);
console.log(`  take: ${take}`);
console.log(`  industry: ${industry}`);
console.log(`  master: ${masterTenant}`);

// Load master phase library
const libPath = path.join(PIPELINE_ROOT, "phase_library_defs", `take${take}_${industry}.json`);
if (!fs.existsSync(libPath)) {
  console.error(`Phase library missing: ${libPath}`);
  process.exit(1);
}
const lib = JSON.parse(fs.readFileSync(libPath, "utf8"));

// Resolve source paths
function resolveSourcePath(tenantSlug) {
  const original = lib.sources?.original;
  if (!original) {
    console.error(`Phase library has no 'original' source mapping`);
    process.exit(1);
  }
  return path.join(REPO_ROOT, "docs/gtm/pipeline/06_video_production", original.replace(/\{tenant\}/g, tenantSlug));
}

const masterSource = resolveSourcePath(masterTenant);
const tenantSource = resolveSourcePath(tenant);

if (!fs.existsSync(masterSource)) {
  console.error(`master source missing: ${masterSource}`);
  process.exit(1);
}
if (!fs.existsSync(tenantSource)) {
  console.error(`tenant source missing: ${tenantSource}`);
  process.exit(1);
}

// Get durations via ffprobe (video stream — uses run+ffprobe directly since
// ffprobeInfo defaults to audio stream).
async function videoDuration(file) {
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

const masterDur = await videoDuration(masterSource);
const tenantDur = await videoDuration(tenantSource);
const ratio = tenantDur / masterDur;

console.log(`\nDuration analysis:`);
console.log(`  master (${masterTenant}): ${masterDur.toFixed(3)}s`);
console.log(`  tenant (${tenant}):       ${tenantDur.toFixed(3)}s`);
console.log(`  ratio:                     ${ratio.toFixed(4)}`);
console.log(`  drift:                     ${(tenantDur - masterDur).toFixed(3)}s`);

if (Math.abs(ratio - 1.0) < 0.005) {
  console.log(`\n✓ Drift <0.5% — kein Override nötig, Phase-Library funktioniert direkt`);
  process.exit(0);
}

// Generate per-tenant override via ratio-scaling
const override = {
  take: lib.take,
  industry: lib.industry,
  tenant,
  description: `Auto-generated ${new Date().toISOString().split("T")[0]} via auto_calibrate_phase_library.mjs (v1 ratio-scaling)`,
  master: masterTenant,
  masterDuration: masterDur,
  tenantDuration: tenantDur,
  scaleRatio: ratio,
  phases: lib.phases.map((p) => ({
    name: p.name,
    range: [
      Math.round(p.range[0] * ratio * 100) / 100,
      Math.round(p.range[1] * ratio * 100) / 100,
    ],
  })),
};

const outDir = path.join(PIPELINE_ROOT, "phase_library_defs", "_overrides", tenant);
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `take${take}_${industry}.json`);
fs.writeFileSync(outPath, JSON.stringify(override, null, 2));

console.log(`\n✓ wrote per-tenant override: ${outPath}`);
console.log(`  ${override.phases.length} phases scaled by ${ratio.toFixed(4)}`);
console.log(`\nNext: run build_from_phase_schedule + quality_gate to verify 10/10:`);
console.log(`  node scripts/_ops/audio/build_from_phase_schedule.mjs --tenant ${tenant} --take ${take}`);
console.log(`  node scripts/_ops/audio/quality_gate.mjs --tenant ${tenant} --take ${take}`);
