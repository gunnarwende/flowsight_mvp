#!/usr/bin/env node
// apply_loom_take3.mjs — Applies animated Loom-PiP to take3_complete.mp4 → take3_with_loom.mp4.
// Standalone overlay-pass: nimmt das geslicte Wizard+Leitsystem-Recording und
// overlayed den Founder-Face-Loom mit der definierten Animations-Kurve.
//
// Loom-Bewegung:
//   WZ (Wizard-Phase, Ausgangsposition): konfigurierbar via --wz-x / --wz-y
//   ML (Final mid-left nav nach Flight): (40, 350) — fix
//   Animation: 1s hold @ WZ → 400ms ease-out-cubic zu 95%-Position → 600ms smoothstep zu ML
//
// Usage:
//   node scripts/_ops/apply_loom_take3.mjs --slug doerfler-ag
//   node scripts/_ops/apply_loom_take3.mjs --slug doerfler-ag --wz-x=1060 --wz-y=80

import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ensureCircleMask, buildCircleLoomFilter } from "./_lib/renderLoomCircle.mjs";

const args = process.argv.slice(2);
function arg(name, def) {
  const a = args.find((x) => x.startsWith(`--${name}=`))?.split("=")[1];
  if (a !== undefined) return a;
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
}

const slug = arg("slug", "doerfler-ag");
const WZ_x = Number(arg("wz-x", "1060"));
const WZ_y = Number(arg("wz-y", "80"));
const ML_x = 40, ML_y = 350;
const LOOM_DIAMETER = 200;

const screenflowDir = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
// Loom-Source-Resolution (priorisiert):
//   1. screenflows/<slug>/loom_t3.mp4 — tenant-specific T3 Loom (founder-recorded)
//   2. screenflows/_shared/loom_t3_final.mp4 — universal T3 Loom from mini_takes
//   3. video_example/Video_default.mp4 — legacy fallback
const loomT3Tenant = join(screenflowDir, "loom_t3.mp4");
const loomT3Shared = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", "_shared", "loom_t3_final.mp4");
const loomT3Legacy = join("docs", "gtm", "pipeline", "06_video_production", "video_example", "Video_default.mp4");
const loomSource = existsSync(loomT3Tenant) ? loomT3Tenant : (existsSync(loomT3Shared) ? loomT3Shared : loomT3Legacy);
const inputPath = join(screenflowDir, "take3_complete.mp4");
const outputPath = join(screenflowDir, "take3_with_loom.mp4");

// PIPELINE_BIBLE §47 — Loom-Master-Identity:
// Vorher: wizFullDur kam aus take3_wizard.webm (TENANT-original, 34.56-40.2s
// per Tenant) → Loom-Animation startete versetzt pro Tenant → Master-Drift
// propagierte durch ganzen Take.
// Jetzt: wir lesen die MASTER-getimte Wizard-Dauer aus take3_wizard_branded.mp4
// (das ist das §43-Output: master-source mit tenant-brand-overlay, immer 40.2s).
// Loom-Animation ist damit Master-identisch über alle Tenants.
const wizardBranded = join(screenflowDir, "take3_wizard_branded.mp4");
const wizardWebmFallback = join(screenflowDir, "take3_wizard.webm");

if (!existsSync(inputPath)) { console.error(`missing: ${inputPath}`); process.exit(1); }
if (!existsSync(loomSource)) { console.error(`missing loom: ${loomSource}`); process.exit(1); }

let wizardForTiming;
if (existsSync(wizardBranded)) {
  wizardForTiming = wizardBranded;
  console.log(`  wizard-timing source: take3_wizard_branded.mp4 (§43 master-timed) ✓`);
} else if (existsSync(wizardWebmFallback)) {
  wizardForTiming = wizardWebmFallback;
  console.warn(`  ⚠ wizard_branded missing, falling back to tenant-original — Loom-Drift möglich!`);
} else {
  console.error(`✗ no wizard timing source found (need ${wizardBranded} OR ${wizardWebmFallback})`);
  process.exit(1);
}

// Wizard duration → splice timeline (matches pipeline_screenflow.mjs convention -ss 2.0)
const probe = spawnSync("ffprobe", [
  "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", wizardForTiming,
]);
const wizFullDur = parseFloat(probe.stdout.toString().trim()) || 40.2;

// PIPELINE_BIBLE §57 (29.04. EOD — Founder-Findings T3 Loom-Drift):
// Loom-Move-Trigger MUSS tenant-spezifisches success_to_dashboard-Timing
// nutzen, nicht hardcoded "wizFullDur - 2.0". Hintergrund: Splice +
// auto_calibrate_phase_library_v2 produzieren tenant-spezifische
// scene-cut-Anchors. Bei master-Wizard (40.2s, all tenants) wäre Master-
// Position für success_to_dashboard 38.2s. Aber nach Splice mit tenant-
// spezifischem leitsystem.webm hat die Source unterschiedliche Timings
// (Leins 35.77, Wälti 38.47, Stark 35.43). Hardcoded W=38.2 würde Loom
// bei manchen Tenants zu spät bewegen.
//
// Lese override-File, suche success_to_dashboard tenantT. Falls override
// fehlt: Fallback auf master-Position (38.2s = wizFullDur - 2.0).
let W = Math.max(10, wizFullDur - 2.0);
const overridePath = `docs/gtm/pipeline/06_video_production/phase_library_defs/_overrides/${slug}/take3_sanitaer.json`;
if (existsSync(overridePath)) {
  try {
    const override = JSON.parse((await import("node:fs")).readFileSync(overridePath, "utf8"));
    const cps = override?._calibration?.controlPoints || [];
    const success = cps.find((cp) => cp.source === "anchor:success_to_dashboard");
    if (success && typeof success.tenantT === "number" && success.tenantT > 10) {
      W = success.tenantT;
      console.log(`  using tenant-specific success_to_dashboard from override: ${W.toFixed(2)}s (master: 38.20s)`);
    } else {
      console.log(`  override has no success_to_dashboard tenantT — using master fallback ${W.toFixed(2)}s`);
    }
  } catch (e) {
    console.warn(`  ⚠ override parse failed: ${e.message} — using master fallback ${W.toFixed(2)}s`);
  }
} else {
  console.log(`  no override file at ${overridePath} — using master fallback ${W.toFixed(2)}s`);
}
console.log(`Take 3 Loom apply (slug=${slug}):`);
console.log(`  WZ-Position: (${WZ_x}, ${WZ_y})  ML-Position: (${ML_x}, ${ML_y})`);
console.log(`  wizard-ende @ t=${W.toFixed(2)}s, hold 1s, move-1 400ms, move-2 600ms`);

// 95% intermediate
const INT_x = Math.round(WZ_x + 0.95 * (ML_x - WZ_x));
const INT_y = Math.round(WZ_y + 0.95 * (ML_y - WZ_y));

const T_HOLD_END  = W + 1.0;
const T_MOVE1_END = W + 1.4;
const T_MOVE2_END = W + 2.0;

const easeOutCubic = (p) => `(1-pow(1-(${p}),3))`;
const smoothstep   = (p) => `(${p})*(${p})*(3-2*(${p}))`;
const lerp = (a, b, e) => `(${a}+(${b}-${a})*${e})`;

const p1 = `(t-${T_HOLD_END.toFixed(2)})/0.4`;
const p2 = `(t-${T_MOVE1_END.toFixed(2)})/0.6`;

const xExpr =
  `if(lt(t,${T_HOLD_END.toFixed(2)}),${WZ_x},` +
  `if(lt(t,${T_MOVE1_END.toFixed(2)}),${lerp(WZ_x, INT_x, easeOutCubic(p1))},` +
  `if(lt(t,${T_MOVE2_END.toFixed(2)}),${lerp(INT_x, ML_x, smoothstep(p2))},${ML_x})))`;
const yExpr =
  `if(lt(t,${T_HOLD_END.toFixed(2)}),${WZ_y},` +
  `if(lt(t,${T_MOVE1_END.toFixed(2)}),${lerp(WZ_y, INT_y, easeOutCubic(p1))},` +
  `if(lt(t,${T_MOVE2_END.toFixed(2)}),${lerp(INT_y, ML_y, smoothstep(p2))},${ML_y})))`;

const { circleMaskPng } = ensureCircleMask({ outDir: screenflowDir, diameter: LOOM_DIAMETER });
const loomFilter = buildCircleLoomFilter({ loomIdx: 1, maskIdx: 2, diameter: LOOM_DIAMETER, label: "loomc" });

console.log(`\n── LOOM-PiP CIRCLE: ${inputPath} → ${outputPath}`);
const r = spawnSync("ffmpeg", [
  "-y",
  "-i", inputPath,
  "-stream_loop", "-1", "-i", loomSource,
  "-loop", "1", "-i", circleMaskPng,
  "-filter_complex",
  loomFilter + `;[0:v][loomc]overlay=x='${xExpr}':y='${yExpr}':shortest=1:format=auto[out]`,
  "-map", "[out]",
  "-map", "0:a?",
  "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
  "-c:a", "copy",
  outputPath,
], { stdio: "inherit" });

if (r.status !== 0) {
  console.error("❌ Loom-PiP overlay failed");
  process.exit(1);
}
const size = statSync(outputPath).size;
console.log(`\n✓ Loom-PiP applied: ${outputPath} (${(size / 1024 / 1024).toFixed(1)} MB)`);
