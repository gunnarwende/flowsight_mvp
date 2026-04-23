#!/usr/bin/env node
/**
 * render_samsung_screens.mjs — Generate Samsung UI screenshots per tenant
 *
 * Renders contact, call, and SMS screens from HTML templates.
 * Pixel-accurate Samsung S23 look.
 *
 * Usage:
 *   node scripts/_ops/render_samsung_screens.mjs \
 *     --slug=doerfler-ag --name="Dörfler AG Test" --phone="+41 44 505 74 20" \
 *     --sms-sender="Doerfler AG" --case-ref="DA-88" --time="15:00"
 */

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const idx = a.indexOf("=");
    if (idx === -1) return [a.replace(/^--/, ""), "true"];
    return [a.substring(0, idx).replace(/^--/, ""), a.substring(idx + 1)];
  })
);

const slug = args.slug || "doerfler-ag";
const contactName = args.name || "Dörfler AG Test";
const phone = args.phone || "+41 44 505 74 20";
const smsSender = args["sms-sender"] || "Doerfler AG";
const caseRef = args["case-ref"] || "DA-88";
const time = args.time || "15:00";
const initial = contactName.charAt(0);

const outDir = args["output-dir"] || `production/screens/${slug}`;
fs.mkdirSync(outDir, { recursive: true });

const tplDir = path.resolve("scripts/_ops/screen_templates").split(path.sep).join("/");

async function main() {
  console.log(`\n  Rendering Samsung screens for ${contactName}`);

  const browser = await chromium.launch();

  // Helper: render a template at the correct Samsung viewport
  async function renderScreen(templateFile, queryParams, outputFile, viewportHeight = 772) {
    const ctx = await browser.newContext({
      viewport: { width: 358, height: viewportHeight },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    const qs = new URLSearchParams(queryParams).toString();
    await page.goto(`file:///${tplDir}/${templateFile}?${qs}`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, outputFile) });
    await ctx.close();
    console.log(`  ✅ ${outputFile}`);
  }

  // S02 — Contact / Dialing screen
  await renderScreen("contact_screen.html", {
    name: contactName, phone, initial,
  }, "S02_kontakt.png", 698);

  // S03 — Call connected (timer 00:00)
  await renderScreen("call_screen.html", {
    name: contactName, location: "Zürich", start_sec: "0",
  }, "S03_anruf_start.png", 698);

  // S03b — Call connected (timer at call duration, e.g. 03:11)
  const callDurSec = parseInt(args["call-duration-sec"] || "191");
  await renderScreen("call_screen.html", {
    name: contactName, location: "Zürich", start_sec: String(callDurSec),
  }, "S03_anruf_end.png", 698);

  // S04 — Call ended
  const callDurMin = Math.floor(callDurSec / 60);
  const callDurS = callDurSec % 60;
  const durationStr = String(callDurMin).padStart(2, "0") + ":" + String(callDurS).padStart(2, "0");
  await renderScreen("call_ended_screen.html", {
    name: contactName, phone, duration: durationStr,
  }, "S04_anruf_beendet.png", 698);

  // S05 — SMS (with Samsung frame: status bar + nav)
  await renderScreen("sms_screen.html", {
    sender: smsSender, time, clock: time, case_ref: caseRef,
    token: "638655f8414e58dc", battery: "95",
  }, "S05_sms.png");

  await browser.close();

  console.log(`\n  All Samsung screens → ${outDir}/`);
  console.log(`  Next: Render Leitsystem screens with record_leitsystem_screen.mjs`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
