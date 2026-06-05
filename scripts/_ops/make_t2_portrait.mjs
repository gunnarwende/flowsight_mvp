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
// Founder 05.06. (FB32): Handy LINKS bündig + grösstmöglich, Loom am Rahmen rechts
// oben anliegend (leichte Überlappung ok), nichts abgeschnitten, Mimik+Gestik sichtbar.
// WICHTIG: das volle Loom ist ~227px (nicht 176!) — zeigt Gesicht + Geste (Handy-hoch)
// + Mikro. Crop 227@802,42 erfasst den GANZEN Loom-Kreis; auf 160 skaliert platziert.
const PHONE = { w: 580, h: 900, x: 337, y: 0 };
// crop GERADE halten (228, nicht 227) — ungerade Dimensionen → yuv420p rundet → Mismatch.
const LOOM = { crop: 228, x: 801, y: 41, scale: 160, maskR: 113, margin: 10 };

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
  `[0:v]crop=${PHONE.w}:${PHONE.h}:${PHONE.x}:${PHONE.y}[ph];` +
  `[0:v]crop=${LOOM.crop}:${LOOM.crop}:${LOOM.x}:${LOOM.y}[lmsq];` +
  `[lmsq][1:v]alphamerge[lmc];` +
  `[lmc]scale=${LOOM.scale}:${LOOM.scale}[lm];` +
  `[ph][lm]overlay=${PHONE.w}-${LOOM.scale}-${LOOM.margin}:${LOOM.margin},format=yuv420p[v]`;

run("ffmpeg", ["-y", "-i", src, "-loop", "1", "-t", String(dur), "-i", mask,
  "-filter_complex", fc, "-map", "[v]", "-map", "0:a",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "20",
  "-c:a", "copy", "-movflags", "+faststart", out]);

console.log(`\n✓ ${out} (${PHONE.w}×${PHONE.h}, ${dur.toFixed(1)}s) — Handy-Hochformat, runder Loom`);
