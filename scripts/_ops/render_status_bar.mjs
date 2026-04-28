#!/usr/bin/env node
/**
 * render_status_bar.mjs — Render Samsung Status Bar als PNG (412x36)
 * für FFmpeg-Overlay über Leitsystem-Recording (FB59).
 *
 * FB1 (23.04.): Rendert ZWEI Varianten:
 *   - status_bar.png         = Fall-Übersicht-Phase (demoTime.phoneCaseSavedTime = 08:08)
 *   - status_bar_detail.png  = Fall-Detail-Phase   (+1 min = 08:09)
 *
 * compose-Step im pipeline_screenflow.mjs wechselt zwischen beiden PNGs am
 * Zeitpunkt des Case-Detail-Klicks (Metadata `_take2_detail_switch_sec`).
 *
 * Usage:
 *   node scripts/_ops/render_status_bar.mjs --slug doerfler-ag
 */
import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { chromium } from "playwright";
import { getDemoTimes, formatTimeShort } from "./_lib/demo_time.mjs";

const args = process.argv.slice(2);
const slug = args.find(a => a.startsWith("--slug"))?.split("=")[1] ||
  (() => { const i = args.indexOf("--slug"); return i >= 0 ? args[i+1] : null; })();

if (!slug) { console.error("Usage: --slug <slug>"); process.exit(1); }

const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));

// Zeit-SSoT: Fall-Übersicht = phoneCaseSavedTime (08:08), Fall-Detail = +1 min (08:09).
const demoTime = getDemoTimes({ skipGate: true });
const overviewTime = formatTimeShort(demoTime.phoneCaseSavedTime); // 08:08
const detailTime = formatTimeShort(demoTime.phoneLeitsystemDet);   // 08:09

const outDir = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
const overviewPath = join(outDir, "status_bar.png");
const detailPath = join(outDir, "status_bar_detail.png");

const htmlPath = resolve("scripts/_ops/screen_templates/sequences/status_bar.html");
const htmlUrl = (time) => "file:///" + htmlPath.split(sep).join("/") + "?time=" + encodeURIComponent(time);

const browser = await chromium.launch({ headless: true });
try {
  for (const [time, outPath, label] of [
    [overviewTime, overviewPath, "Fall-Übersicht"],
    [detailTime, detailPath, "Fall-Detail (+1 min)"],
  ]) {
    const context = await browser.newContext({ viewport: { width: 412, height: 36 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(htmlUrl(time), { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(200);
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 412, height: 36 } });
    await context.close();
    console.log(`✓ ${label}: ${outPath} (${time})`);
  }
} finally {
  await browser.close();
}
