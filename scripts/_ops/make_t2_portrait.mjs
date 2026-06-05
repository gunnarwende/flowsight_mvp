#!/usr/bin/env node
/**
 * make_t2_portrait.mjs — Hochformat-Variante von T2 für die Handy-Ansicht.
 *
 * ERWEITERT die Pipeline (Founder 04.06.): verlustfreier Portrait-Crop der
 * ABGENOMMENEN Querformat-T2. Die approved T2 (build_take2_final) bleibt
 * unangetastet — sie ist nur Lesequelle. Layout „Variante A": das Handy füllt
 * das Hochformat (520×900), der Founder-Loom sitzt klein + RUND oben rechts.
 *
 * Serving: Desktop = Querformat-T2 (unverändert), Handy = diese Portrait-Version
 * (Geräteweiche auf der Beweis-Seite).
 *
 * Output: screenflows/<slug>/take2_portrait.mp4
 * Usage: node scripts/_ops/make_t2_portrait.mjs --slug doerfler-ag
 */
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const si = args.indexOf("--slug");
const slug = si >= 0 ? args[si + 1] : null;
if (!slug) { console.error("ERROR: --slug required"); process.exit(1); }

// Universelle Screenflow-Layout-Koordinaten (vermessen am Landscape-T2, 1440×900).
// Founder 05.06. (FB32/FB33): Handy LINKS bündig + gross, Loom am Rahmen rechts oben,
// Mimik+Gestik sichtbar, nichts abgeschnitten — UND nur EIN Gesicht.
//
// KRITISCH (FB33-Bug): Der Phone-Crop darf das im Landscape EINGEBACKENE Loom (ab x801)
// NICHT mit erfassen, sonst entsteht beim Drüberlegen des neuen Looms ein Doppel-Gesicht.
// Daher: Phone-Crop endet VOR x801 (330+465=795), wird auf Navy-Canvas (580) gepaddet,
// dann EIN frisch maskiertes Loom (voller 228er-Kreis) oben rechts überlagert.
const PHONE = { cropW: 465, x: 330, h: 900 }; // Phone-only, schliesst Original-Loom aus
const CANVAS = { w: 580, h: 900 };
const LOOM = { crop: 228, x: 801, y: 41, scale: 160, maskR: 113, margin: 10 };
const BG = "0x0b1220"; // T2-Canvas-Navy → nahtloses Padden

const PIPE = "docs/gtm/pipeline/06_video_production";
const ST = "docs/gtm/pipeline/07_stresstest";
function findT2() {
  for (const base of [join(ST, "abgenommen", slug), join(ST, slug)]) {
    for (const v of ["T2_anruf_notruf.mp4", "T2_anruf_preis.mp4"]) {
      const p = join(base, v);
      if (existsSync(p)) return p;
    }
  }
  return null;
}
const src = findT2();
if (!src) { console.error(`ERROR: keine abgenommene T2 für ${slug}`); process.exit(2); }

const outDir = join(PIPE, "screenflows", slug);
mkdirSync(outDir, { recursive: true });
const mask = join(outDir, "_t2p_loommask.png");
const out = join(outDir, "take2_portrait.mp4");

function run(cmd, a) {
  const r = spawnSync(cmd, a, { stdio: "inherit" });
  if (r.status !== 0) { console.error(`FAIL: ${cmd}`); process.exit(1); }
}
const dur = parseFloat(
  spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", src])
    .stdout.toString().trim()
);
console.log(`T2 portrait: ${slug} | src ${src} | ${dur.toFixed(1)}s`);

// Runde Loom-Maske (weiß auf schwarz), Größe = Loom-Crop
run("ffmpeg", ["-y", "-f", "lavfi", "-i", `color=black:s=${LOOM.crop}x${LOOM.crop}`,
  "-vf", `geq=lum='if(lte(hypot(X-${LOOM.crop / 2}\\,Y-${LOOM.crop / 2})\\,${LOOM.maskR}),255,0)':cb=128:cr=128`,
  "-frames:v", "1", mask]);

// Compose: Phone-Portrait + runder, verkleinerter Loom oben rechts
const fc =
  // Phone-only (ohne Original-Loom) → auf Navy-Canvas padden (Handy links bündig)
  `[0:v]crop=${PHONE.cropW}:${PHONE.h}:${PHONE.x}:0,pad=${CANVAS.w}:${CANVAS.h}:0:0:color=${BG}[base];` +
  // EIN frisches, rundes Loom aus dem vollen Loom-Kreis
  `[0:v]crop=${LOOM.crop}:${LOOM.crop}:${LOOM.x}:${LOOM.y}[lmsq];` +
  `[lmsq][1:v]alphamerge[lmc];` +
  `[lmc]scale=${LOOM.scale}:${LOOM.scale}[lm];` +
  `[base][lm]overlay=${CANVAS.w}-${LOOM.scale}-${LOOM.margin}:${LOOM.margin},format=yuv420p[v]`;

run("ffmpeg", ["-y", "-i", src, "-loop", "1", "-t", String(dur), "-i", mask,
  "-filter_complex", fc, "-map", "[v]", "-map", "0:a",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "20",
  "-c:a", "copy", "-movflags", "+faststart", out]);

console.log(`\n✓ ${out} (${CANVAS.w}×${CANVAS.h}, ${dur.toFixed(1)}s) — Handy-Hochformat, EIN runder Loom`);
