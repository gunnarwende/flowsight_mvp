#!/usr/bin/env node
/**
 * render_status_bar.mjs — Render Samsung Status Bar als PNG (412x36)
 * für FFmpeg-Overlay über Leitsystem-Recording (FB59).
 *
 * Nimmt aus tenant_config._seed_time die SMS-Zeit (seed + 4min) und rendert
 * die Bar mit Uhrzeit, Mute, WiFi, Signal, Battery-Pill grün.
 *
 * Usage:
 *   node scripts/_ops/render_status_bar.mjs --slug doerfler-ag
 */
import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const slug = args.find(a => a.startsWith("--slug"))?.split("=")[1] ||
  (() => { const i = args.indexOf("--slug"); return i >= 0 ? args[i+1] : null; })();

if (!slug) { console.error("Usage: --slug <slug>"); process.exit(1); }

const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));

// SMS-Zeit aus _seed_time
const seedTimeIso = config._seed_time;
const anrufDauerSec = 191;
let smsTime = "17:56";
if (seedTimeIso) {
  const d = new Date(new Date(seedTimeIso).getTime() + (anrufDauerSec + 60) * 1000);
  smsTime = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

const htmlPath = resolve("scripts/_ops/screen_templates/sequences/status_bar.html");
const fileUrl = "file:///" + htmlPath.split(sep).join("/") + "?time=" + encodeURIComponent(smsTime);

const outPath = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug, "status_bar.png");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 412, height: 36 }, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(200);
await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 412, height: 36 } });
await browser.close();

console.log(`✓ Status-Bar gerendert: ${outPath} (${smsTime})`);
