#!/usr/bin/env node
/**
 * compose_take1_hero.mjs — Produziert Take 1 als Placeholder.
 *
 * Take 1 = Hero-Intro mit Founder-Face (Kamera gross, kein Screen-Share).
 * Layout 1440×900:
 *   - Left 720px: Brand-Panel (Logo, Firmenname, Hook, Signatur)
 *   - Right 720px: Face-Kreis (720×720 flush top-right, bündig)
 *
 * Inputs:
 *   - scripts/_ops/screen_templates/sequences/take1_hero.html (Background)
 *   - docs/gtm/pipeline/06_video_production/video_example/Video_default.mp4 (Face)
 *
 * Output: docs/gtm/pipeline/06_video_production/screenflows/<slug>/take1_complete.mp4
 *
 * Usage:
 *   node scripts/_ops/compose_take1_hero.mjs --slug doerfler-ag
 */

import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ensureCircleMask, buildCircleLoomFilter } from "./_lib/renderLoomCircle.mjs";

const args = process.argv.slice(2);
const slug = args.find(a => a.startsWith("--slug"))?.split("=")[1] || "doerfler-ag";

const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));
const firma = config.tenant.name;
const brand = config.tenant.brand_color || "#1a2744";

const outBase = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
const htmlPath = join("scripts", "_ops", "screen_templates", "sequences", "take1_hero.html");
const loomSource = join("docs", "gtm", "pipeline", "06_video_production", "video_example", "Video_default.mp4");

console.log(`\n=== Take 1 Hero — ${firma} ===\n`);

// STEP 1: Render HTML to PNG (1440×900)
const bgPng = join(outBase, "_take1_bg.png");
console.log("── STEP 1: Render Brand-Panel to PNG ──");
{
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const url = "file:///" + htmlPath.replace(/\\/g, "/") +
    "?firma=" + encodeURIComponent(firma) +
    "&brand=" + encodeURIComponent(brand);
  await page.goto(url);
  await page.waitForTimeout(600);
  await page.screenshot({ path: bgPng, omitBackground: false, fullPage: false });
  await ctx.close();
  await browser.close();
  console.log(`  ✓ ${bgPng}`);
}

// STEP 2: Build circle mask for face (720×720)
const FACE_DIAMETER = 720;
const { circleMaskPng: mask } = ensureCircleMask({ outDir: outBase, diameter: FACE_DIAMETER });
console.log(`── STEP 2: Face circle mask ${FACE_DIAMETER}×${FACE_DIAMETER} ──`);
console.log(`  ✓ ${mask}`);

// STEP 3: FFmpeg compose — background + circle-masked face overlay top-right flush
const outPath = join(outBase, "take1_complete.mp4");
console.log("── STEP 3: FFmpeg Compose ──");

// Loom source duration
const loomDur = parseFloat(spawnSync("ffprobe", [
  "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", loomSource,
]).stdout.toString().trim()) || 80;

// Face position: flush top-right. Canvas 1440×900, face 720×720 → x=720, y=0.
// Loom source is 1280×720; scale to fit 720×720 (crop-square by center-crop first).
const loomFilter = buildCircleLoomFilter({
  loomIdx: 1,
  maskIdx: 2,
  diameter: FACE_DIAMETER,
  label: "facec",
});

const filterChain =
  `[0:v]loop=loop=-1:size=1:start=0,fps=30,scale=1440:900,setsar=1[bg];` +
  loomFilter + `;` +
  `[bg][facec]overlay=x=720:y=0:shortest=1:format=auto[out]`;

const ff = spawnSync("ffmpeg", [
  "-y",
  "-loop", "1", "-t", String(loomDur), "-i", bgPng,
  "-i", loomSource,
  "-i", mask,
  "-filter_complex", filterChain,
  "-map", "[out]",
  "-t", String(loomDur),
  "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
  outPath,
], { stdio: "inherit" });
if (ff.status !== 0) {
  console.error("❌ ffmpeg compose failed");
  process.exit(1);
}

const size = statSync(outPath).size;
console.log(`\n✓ ${outPath} (${(size / 1024 / 1024).toFixed(1)} MB, ${loomDur.toFixed(1)}s)`);
console.log(`  file:///${outPath.replace(/\\/g, "/")}`);
