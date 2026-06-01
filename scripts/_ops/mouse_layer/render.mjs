#!/usr/bin/env node
// render.mjs — Renders mouse layer from recorded JSON onto master video.
//
// Reads: _generated/mouse_recordings/<slug>/take{N}.json
// Output: _generated/mouse_recordings/<slug>/take{N}_overlay.webm (transparent)
//         master_takes/take{N}/<slug>_with_mouse.mp4 (final composite)
//
// Usage:
//   node scripts/_ops/mouse_layer/render.mjs --slug doerfler-ag --take 3

import { spawnSync, spawn } from "node:child_process";
import { readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load @napi-rs/canvas from local mouse_layer/node_modules regardless of cwd.
const localRequire = createRequire(import.meta.url);
const { createCanvas } = localRequire("@napi-rs/canvas");
const REPO_ROOT = resolve(__dirname, "..", "..", "..");

const args = process.argv.slice(2);
function arg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
}

const slug = arg("slug", "doerfler-ag");
const take = arg("take", "3");
const fps = Number(arg("fps", "30"));

const candidates = [
  `docs/gtm/pipeline/06_video_production/master_takes/take${take}/${slug}.mp4`,
  `docs/gtm/pipeline/06_video_production/master_takes/take${take}/${slug}_notruf.mp4`,
];
const masterPath = candidates.find((p) => existsSync(resolve(REPO_ROOT, p)));
if (!masterPath) { console.error(`✗ no master`); process.exit(2); }
const absMaster = resolve(REPO_ROOT, masterPath);

const recDir = resolve(REPO_ROOT, `docs/gtm/pipeline/06_video_production/_generated/mouse_recordings/${slug}`);
const jsonPath = join(recDir, `take${take}.json`);
if (!existsSync(jsonPath)) { console.error(`✗ no recording: ${jsonPath}`); process.exit(2); }

const data = JSON.parse(await readFile(jsonPath, "utf8"));
const events = data.events;
const W = data.videoWidth || 1440;
const H = data.videoHeight || 900;
const masterDur = data.duration;

console.log(`Mouse Layer Render:`);
console.log(`  master:  ${masterPath} (${W}x${H}, ${masterDur.toFixed(1)}s)`);
console.log(`  events:  ${events.length} (${(events.length / masterDur).toFixed(1)}/s avg)`);
console.log(`  fps:     ${fps}`);

const tmpDir = join(recDir, `_tmp_take${take}`);
if (existsSync(tmpDir)) await rm(tmpDir, { recursive: true });
await mkdir(tmpDir, { recursive: true });

const totalFrames = Math.floor(masterDur * fps);
// Nur Mausbewegungen (Founder-Entscheidung — keine Klicks).
const moves = events.filter((e) => e.type === "move");

function posAt(t) {
  if (moves.length === 0) return null;
  if (t <= moves[0].t) return { x: moves[0].x, y: moves[0].y };
  if (t >= moves[moves.length - 1].t) return { x: moves[moves.length - 1].x, y: moves[moves.length - 1].y };
  let lo = 0, hi = moves.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (moves[mid].t <= t) lo = mid; else hi = mid;
  }
  const a = moves[lo], b = moves[hi];
  const k = (t - a.t) / (b.t - a.t || 1);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

function drawCursor(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.455, 0.455);  // 31.05. PM: 30% smaller per Founder (0.65 → 0.455)
  // Cursor arrow path (white fill, dark outline, drop shadow) — smaller variant
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1.5;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#0b1220";
  ctx.lineWidth = 1.8;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 24);
  ctx.lineTo(6, 18);
  ctx.lineTo(10, 26);
  ctx.lineTo(14, 24);
  ctx.lineTo(10, 16);
  ctx.lineTo(18, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

console.log(`\nRendering ${totalFrames} frames...`);
const t0 = Date.now();
// Cursor-Hide ist TAKE-spezifisch (01.06.2026 FB): NUR T4 hat ab 97.0s den
// iris→big-loom-Fullscreen — danach füllt das Loom-Face die Canvas, kein UI mehr
// → Cursor weg. T3 (und alle anderen) zeigen UI bis zum Ende → Cursor bis Schluss.
const CURSOR_HIDE_AFTER = take === "4" ? 97.0 : masterDur;
for (let f = 0; f < totalFrames; f++) {
  const t = f / fps;
  ctx.clearRect(0, 0, W, H);
  const p = posAt(t);
  if (p && t < CURSOR_HIDE_AFTER) drawCursor(ctx, p.x, p.y);
  const buf = canvas.toBuffer("image/png");
  await writeFile(join(tmpDir, `f_${f.toString().padStart(6, "0")}.png`), buf);
  if (f % 300 === 0) {
    const pct = ((f / totalFrames) * 100).toFixed(0);
    process.stdout.write(`\r  ${pct}% (${f}/${totalFrames})`);
  }
}
console.log(`\r  ✓ frames done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// Composite over master via ffmpeg
const finalDir = resolve(REPO_ROOT, `docs/gtm/pipeline/06_video_production/master_takes/take${take}`);
const finalPath = join(finalDir, `${slug}_with_mouse.mp4`);
console.log(`\nComposite onto master → ${finalPath}`);
const r = spawnSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-i", absMaster,
  "-framerate", String(fps), "-i", join(tmpDir, "f_%06d.png"),
  "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto:shortest=1[out]",
  "-map", "[out]", "-map", "0:a?",
  "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
  "-c:a", "copy", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
  "-t", String(masterDur),
  finalPath,
], { stdio: "inherit" });
if (r.status !== 0) { console.error("✗ ffmpeg composite failed"); process.exit(1); }

await rm(tmpDir, { recursive: true, force: true });
const outStat = await stat(finalPath);
console.log(`✓ ${finalPath} (${(outStat.size / 1024 / 1024).toFixed(1)} MB)`);
