#!/usr/bin/env node
// apply_loom_to_t3_master.mjs — Overlay continuous Loom on T3 149s master.
//
// Architectural fix for the freeze-frame bug: when Loom is baked into the 66s
// screenflow source, the phase-schedule builder's freeze-anchors freeze the
// Loom content too. This script applies the Loom AFTER phase-build, on the
// 149s output, so Loom plays continuously regardless of screenflow holds.
//
// Animation curve = identical to apply_loom_take3.mjs:
//   HOLD at WZ until t=W+1
//   400ms ease-out-cubic to 95% of way (INT)
//   600ms smoothstep INT→ML
// In MASTER time: W = wizard_end_in_master (104.4s for Dörfler T3 schedule).
//
// Usage:
//   node scripts/_ops/apply_loom_to_t3_master.mjs --slug doerfler-ag

import { spawnSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";

const args = process.argv.slice(2);
function arg(name, def) { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; }

const slug = arg("slug", "doerfler-ag");
const W = Number(arg("w", "104.4"));  // wizard_end in MASTER time

const WZ_x = 1060, WZ_y = 80;
const ML_x = 40,   ML_y = 350;
const LOOM_DIAMETER = 200;

const T_HOLD_END  = W + 1.0;   // 105.4
const T_MOVE1_END = W + 1.4;   // 105.8
const T_MOVE2_END = W + 2.0;   // 106.4

const INT_x = Math.round(WZ_x + 0.95 * (ML_x - WZ_x));
const INT_y = Math.round(WZ_y + 0.95 * (ML_y - WZ_y));

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

const masterIn = `docs/gtm/pipeline/06_video_production/_generated/previews/${slug}/take3_anchor.mp4`;
const masterOut = `docs/gtm/pipeline/06_video_production/master_takes/take3/${slug}.mp4`;
const SFLOW = "docs/gtm/pipeline/06_video_production/screenflows";
const maskPath = `${SFLOW}/_shared/_mask_circle_200.png`;

// Loom = Founder-Gesicht über dem Wizard, tenant-neutral (kein Betriebs-Bezug).
// 01.06.: Universal-Fallback wenn der Betrieb (noch) keinen eigenen Loom hat →
// Stresstest/NEUE Betriebe failten vorher hart (exit 2). Gleiche kanonische
// Quelle wie apply_loom_take3.mjs (_shared/loom_t3_final.mp4).
const UNIVERSAL_LOOM = `${SFLOW}/_shared/loom_t3_final.mp4`;
let loomPath = `${SFLOW}/${slug}/loom_t3.mp4`;
if (!existsSync(loomPath)) {
  if (existsSync(UNIVERSAL_LOOM)) {
    console.warn(`⚠ kein eigener Loom (${loomPath}) → Universal-Fallback: ${UNIVERSAL_LOOM}`);
    loomPath = UNIVERSAL_LOOM;
  } else {
    console.error(`✗ no loom (weder tenant noch universal): ${loomPath} / ${UNIVERSAL_LOOM}`);
    process.exit(2);
  }
}

if (!existsSync(masterIn)) { console.error(`✗ no master input: ${masterIn}`); process.exit(2); }

console.log(`apply_loom_to_t3_master:`);
console.log(`  master-in:  ${masterIn}`);
console.log(`  master-out: ${masterOut}`);
console.log(`  loom:       ${loomPath}`);
console.log(`  W=${W}s  HOLD→${T_HOLD_END}  MOVE1→${T_MOVE1_END}  MOVE2→${T_MOVE2_END}`);

const filter =
  `[1:v]scale=${LOOM_DIAMETER}:${LOOM_DIAMETER}:force_original_aspect_ratio=increase,` +
  `crop=${LOOM_DIAMETER}:${LOOM_DIAMETER},setsar=1,format=yuva420p[loomsq];` +
  `[loomsq][2:v]alphamerge[loomc];` +
  `[0:v][loomc]overlay=x='${xExpr}':y='${yExpr}':format=auto:shortest=1[out]`;

const r = spawnSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-i", masterIn,
  "-stream_loop", "-1", "-i", loomPath,
  "-loop", "1", "-i", maskPath,
  "-filter_complex", filter,
  "-map", "[out]", "-map", "0:a?",
  "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
  "-c:a", "copy", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
  masterOut,
], { stdio: "inherit" });
if (r.status !== 0) { console.error("✗ ffmpeg overlay failed"); process.exit(1); }
console.log(`✓ ${masterOut}`);
