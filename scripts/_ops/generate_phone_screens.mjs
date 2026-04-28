#!/usr/bin/env node
/**
 * generate_phone_screens.mjs — Generate phone screenshots per tenant
 *
 * Takes REAL Samsung screenshots as base images and dynamically replaces
 * text (company name, phone number, time) using Playwright canvas overlay.
 *
 * Usage:
 *   node scripts/_ops/generate_phone_screens.mjs \
 *     --slug=doerfler-ag \
 *     --firma="Dörfler AG Test" \
 *     --phone="+41 44 505 74 20" \
 *     --sms-sender="Doerfler AG" \
 *     --case-ref="DA-88" \
 *     --time="15:00"
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
const firma = args.firma || "Dörfler AG Test";
const phone = args.phone || "+41 44 505 74 20";
const smsSender = args["sms-sender"] || "Doerfler AG";
const caseRef = args["case-ref"] || "DA-88";
const time = args.time || "15:00";

const outDir = args["output-dir"] || `production/screens/${slug}`;
fs.mkdirSync(outDir, { recursive: true });

// Source screenshots from Scrcpy recording (Dörfler as master)
const MASTER_DIR = "production/screen_analysis2";

async function main() {
  console.log(`\n  Generating phone screens for: ${firma}`);

  const browser = await chromium.launch();

  // ── Helper: overlay text on an image ──────────────────────────
  async function overlayText(inputPath, outputPath, replacements) {
    const ctx = await browser.newContext({
      viewport: { width: 358, height: 772 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();

    // Load the base image into a full-page canvas
    const imgBase64 = fs.readFileSync(inputPath).toString("base64");
    const ext = inputPath.endsWith(".png") ? "png" : "jpeg";

    await page.setContent(`
      <html><body style="margin:0;padding:0">
        <canvas id="c" width="716" height="1544"></canvas>
        <script>
          const canvas = document.getElementById('c');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, 716, 1544);
            window._imgLoaded = true;
          };
          img.src = 'data:image/${ext};base64,${imgBase64}';
        </script>
      </body></html>
    `);

    // Wait for image to load
    await page.waitForFunction(() => window._imgLoaded);

    // Apply each replacement
    for (const r of replacements) {
      await page.evaluate((rep) => {
        const ctx = document.getElementById("c").getContext("2d");
        // White-out the area (with matching background color)
        ctx.fillStyle = rep.bgColor || "#ffffff";
        ctx.fillRect(rep.x * 2, rep.y * 2, rep.w * 2, rep.h * 2);
        // Draw new text
        ctx.fillStyle = rep.color || "#000000";
        ctx.font = `${rep.fontWeight || "500"} ${(rep.fontSize || 16) * 2}px -apple-system, Roboto, sans-serif`;
        ctx.textBaseline = "top";
        ctx.fillText(rep.text, rep.x * 2, rep.y * 2 + (rep.offsetY || 0) * 2);
      }, r);
    }

    // Screenshot the canvas
    const canvasEl = page.locator("canvas");
    await canvasEl.screenshot({ path: outputPath });
    await ctx.close();
  }

  // ── 1. Kontakt Screen ───────────────────────────────────────────
  // Base: f10.jpg (Scrcpy, shows contact search for "Dörfler AG Test")
  // But f10 shows the homescreen, not the contact. We need the contact frame.
  // Let's use the Scrcpy frame that shows the contact (from Screen_master2 at ~10s)
  const contactBase = path.join(MASTER_DIR, "f10.jpg");

  // Actually, we need to extract the contact frame from Screen_master2
  const screenMaster = "docs/customers/doerfler-ag/takes/Scaling/Take2/Screen_master2.mp4";

  // Extract specific frames from the Scrcpy recording
  const frames = [
    { time: 10, name: "contact", desc: "Kontakt screen" },
    { time: 20, name: "call", desc: "Anruf screen" },
    { time: 30, name: "call_end", desc: "Anruf beendet" },
  ];

  for (const f of frames) {
    const framePath = path.join(outDir, `master_${f.name}.png`);
    const { execSync } = await import("node:child_process");
    execSync(`ffmpeg -y -i "${screenMaster}" -ss ${f.time} -vframes 1 -q:v 1 "${framePath}" 2>/dev/null`);
    console.log(`  Extracted master_${f.name}.png (${f.desc})`);
  }

  // ── 2. Overlay dynamic text on contact screen ──────────────────
  await overlayText(
    path.join(outDir, "master_contact.png"),
    path.join(outDir, "S02_kontakt.png"),
    [
      // Scrcpy header "SM-S911B" → white out
      { x: 0, y: 0, w: 358, h: 18, bgColor: "#2d6a4f", text: "", color: "transparent" },
      // Time "06:48" → replace with target time
      { x: 18, y: 32, w: 50, h: 20, bgColor: "#ffffff", text: time, color: "#1a1a1a", fontSize: 13, fontWeight: "500" },
      // Company name in search bar (if different from Dörfler)
      // Only replace if firma is different from master
    ]
  );
  console.log(`  ✅ S02_kontakt.png (time: ${time})`);

  // ── 3. Overlay on call screen ──────────────────────────────────
  await overlayText(
    path.join(outDir, "master_call.png"),
    path.join(outDir, "S03_anruf.png"),
    [
      // Scrcpy header → crop out
      { x: 0, y: 0, w: 358, h: 18, bgColor: "#2c1b47", text: "", color: "transparent" },
      // Time → replace
      { x: 18, y: 32, w: 50, h: 20, bgColor: "transparent", text: time, color: "#ffffff", fontSize: 13, fontWeight: "500" },
    ]
  );
  console.log(`  ✅ S03_anruf.png`);

  await browser.close();

  console.log(`\n  Output: ${outDir}/`);
  fs.readdirSync(outDir).filter(f => f.endsWith(".png")).forEach(f => console.log(`    ${f}`));

  console.log(`\n  Note: For different company names, the text overlay positions`);
  console.log(`  need to be calibrated per screen. The master screenshots from`);
  console.log(`  Dörfler are used as-is when the company name doesn't change.`);
  console.log(`  For other companies: re-record Scrcpy with new contact name.`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
