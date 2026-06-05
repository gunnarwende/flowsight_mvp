#!/usr/bin/env node
/**
 * compose_take1_faceonly.mjs — T1-Variante „Gesicht groß, kein Text".
 *
 * ERWEITERT die Pipeline (Founder 04.06.) — fasst `compose_take1_hero.mjs`
 * (approved) NICHT an. Großes rundes Gesicht aus der nativen 1080p-Aufnahme
 * (`take1_face.mp4`) auf FlowSight-Brand-Navy-Verlauf (navy-900 #1a2744 →
 * navy-950 #0f1a2e), KEIN Text, + locked T1-Audio.
 *
 * Output: screenflows/<slug>/take1_faceonly.mp4  (1440×900, ~63s)
 *
 * Usage: node scripts/_ops/compose_take1_faceonly.mjs --slug doerfler-ag
 */
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const si = args.indexOf("--slug");
const slug = si >= 0 ? args[si + 1] : null;
if (!slug) { console.error("ERROR: --slug required"); process.exit(1); }

const PIPE = "docs/gtm/pipeline/06_video_production";
const face = [
  join(PIPE, "_generated/takes", slug, "take1_face.mp4"),
  join(PIPE, "master_takes/take1/take1_face.mp4"),
].find(existsSync);
const audio = [
  join(PIPE, "_generated/takes", slug, "take1.wav"),
  join(PIPE, "master_takes/take1/take1.wav"),
].find(existsSync);
if (!face) { console.error("ERROR: no take1_face.mp4 source"); process.exit(2); }

const outDir = join(PIPE, "screenflows", slug);
mkdirSync(outDir, { recursive: true });
const bg = join(outDir, "_t1fo_bg.png");
const mask = join(outDir, "_t1fo_mask880.png");
const out = join(outDir, "take1_faceonly.mp4");

function run(cmd, a) {
  const r = spawnSync(cmd, a, { stdio: "inherit" });
  if (r.status !== 0) { console.error(`FAIL: ${cmd}`); process.exit(1); }
}
function probe(f) {
  return parseFloat(
    spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", f])
      .stdout.toString().trim()
  );
}

const dur = probe(face);
console.log(`T1 face-only: ${slug} | face ${dur.toFixed(1)}s | audio ${audio ? "yes" : "NONE"}`);

// 1) Brand-Navy-Verlauf (vertikal)
run("ffmpeg", ["-y", "-f", "lavfi",
  "-i", "gradients=s=1440x900:c0=0x1a2744:c1=0x0f1a2e:x0=720:y0=0:x1=720:y1=900",
  "-frames:v", "1", bg]);
// 2) Kreis-Maske 880 (weiß auf schwarz)
run("ffmpeg", ["-y", "-f", "lavfi", "-i", "color=black:s=880x880",
  "-vf", "geq=lum='if(lte(hypot(X-440,Y-440),438),255,0)':cb=128:cr=128",
  "-frames:v", "1", mask]);
// 3) Compose: rundes Gesicht zentriert auf Verlauf.
//    Original-Framing (1080er Center-Crop der 1920×1080-Quelle) = volle Höhe →
//    Hand-Gestik/Finger-Zählen bleibt sichtbar (Founder 05.06.: 820er-Crop war zu nah).
const fc =
  "[1:v]crop=1080:1080:420:0,scale=880:880,setsar=1[fc];" +
  "[fc][2:v]alphamerge[circ];" +
  "[0:v][circ]overlay=(W-w)/2:10:shortest=1,format=yuv420p[v]";
const a = ["-y", "-loop", "1", "-t", String(dur), "-i", bg, "-i", face, "-i", mask];
if (audio) a.push("-i", audio);
a.push("-filter_complex", fc, "-map", "[v]");
if (audio) a.push("-map", "3:a", "-c:a", "aac", "-b:a", "160k");
a.push("-t", String(dur), "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p",
  "-preset", "medium", "-crf", "18", "-movflags", "+faststart", out);
run("ffmpeg", a);

console.log(`\n✓ ${out} (${dur.toFixed(1)}s) — Gesicht groß, kein Text, Brand-Navy-Verlauf`);
