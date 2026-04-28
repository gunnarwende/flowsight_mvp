#!/usr/bin/env node
/**
 * build_take2_screens.mjs — Generate ALL Take 2 screenshots for one tenant
 *
 * Combines:
 *   1. Samsung native screens (HTML templates → Playwright screenshots)
 *   2. Leitsystem screens (Playwright → live app navigation)
 *
 * One command, zero Founder effort, fully dynamic per business.
 *
 * Usage:
 *   node --env-file=.env.local scripts/_ops/build_take2_screens.mjs \
 *     --slug=doerfler-ag \
 *     --name="Dörfler AG Test" \
 *     --phone="+41 44 505 74 20" \
 *     --sms-sender="Doerfler AG" \
 *     --case-ref="DA-88" \
 *     --time="15:00" \
 *     --call-duration-sec=191
 *
 * Prerequisites:
 *   - Playwright installed (npx playwright install chromium)
 *   - production/.playwright_auth_link exists (magic link for auth)
 *   - Seed data for the tenant already seeded (seed_demo_data_v2.mjs)
 *
 * Output: production/screens/{slug}/S01-S14 (15 PNG files)
 */

import { chromium } from "playwright";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient: createSupabaseClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
import fs from "node:fs";
import path from "node:path";

// ── Args ──────────────────────────────────────────────────────────
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
const callDurationSec = parseInt(args["call-duration-sec"] || "191");
const clock = args.clock || "08:36";
const battery = args.battery || "95";
const baseUrl = args["base-url"] || "https://flowsight.ch";
const headless = args.headless !== "false"; // default true

const outDir = args["output-dir"] || `production/screens/${slug}`;
fs.mkdirSync(outDir, { recursive: true });

const tplDir = path.resolve("scripts/_ops/screen_templates").split(path.sep).join("/");

// Computed values
const callDurMin = Math.floor(callDurationSec / 60);
const callDurS = callDurationSec % 60;
const durationStr = String(callDurMin).padStart(2, "0") + ":" + String(callDurS).padStart(2, "0");
const initial = contactName.charAt(0);

// Day label for SMS (German weekday)
const DAYS_DE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const dayLabel = `${DAYS_DE[new Date().getDay()]} \u00B7 ${time}`;

// ── Helpers ───────────────────────────────────────────────────────
function log(msg) { console.log(`  ${msg}`); }
function logStep(n, total, msg) { console.log(`  [${n}/${total}] ${msg}`); }

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  Take 2 Screen Generator                     ║`);
  console.log(`╚══════════════════════════════════════════════╝`);
  console.log(`  Firma:    ${contactName}`);
  console.log(`  Slug:     ${slug}`);
  console.log(`  Phone:    ${phone}`);
  console.log(`  SMS:      ${smsSender}`);
  console.log(`  Case-Ref: ${caseRef}`);
  console.log(`  Time:     ${time}`);
  console.log(`  Duration: ${durationStr} (${callDurationSec}s)`);
  console.log(`  Output:   ${outDir}\n`);

  const TOTAL_STEPS = 15;
  const browser = await chromium.launch({ headless });

  // ═══════════════════════════════════════════════════════════════
  // PART 1: Samsung Native Screens (Overlay on real Samsung screenshots)
  // ═══════════════════════════════════════════════════════════════
  console.log("  ── Samsung Screens (Overlay) ─────────────────");

  const mastersDir = path.resolve("production/screen_masters").split(path.sep).join("/");

  /**
   * Render a Samsung screen by overlaying text on a real base screenshot.
   * @param {string} baseFile - Base image filename in production/screen_masters/
   * @param {Array} overlays - Array of {x, y, w, h, bgColor, text, color, fontSize, fontWeight, textAlign, offsetY}
   * @param {string} outputFile - Output filename
   */
  async function renderOverlay(baseFile, overlays, outputFile) {
    const basePath = path.join(mastersDir, baseFile);
    if (!fs.existsSync(basePath.split("/").join(path.sep))) {
      log(`⚠ Missing base: ${baseFile}`);
      return;
    }
    const imgBase64 = fs.readFileSync(basePath.split("/").join(path.sep)).toString("base64");
    const ctx = await browser.newContext({ viewport: { width: 1080, height: 2340 } });
    const page = await ctx.newPage();

    await page.setContent(`<html><body style="margin:0"><canvas id="c" width="1080" height="2340"></canvas>
    <script>
      const c = document.getElementById('c');
      const x = c.getContext('2d');
      const img = new Image();
      img.onload = () => {
        x.drawImage(img, 0, 0, 1080, 2340);
        const overlays = ${JSON.stringify(overlays)};
        for (const o of overlays) {
          x.fillStyle = o.bgColor || '#ffffff';
          x.fillRect(o.x, o.y, o.w, o.h);
          if (o.text) {
            x.fillStyle = o.color || '#000000';
            x.font = (o.fontWeight || '400') + ' ' + (o.fontSize || 40) + 'px ' + (o.fontFamily || "SamsungOne, -apple-system, Roboto, sans-serif");
            x.textBaseline = 'top';
            const align = o.textAlign || 'left';
            let tx = o.x;
            if (align === 'center') { x.textAlign = 'center'; tx = o.x + o.w / 2; }
            else { x.textAlign = 'left'; }
            x.fillText(o.text, tx, o.y + (o.offsetY || 0));
          }
        }
        window._done = true;
      };
      img.src = 'data:image/jpeg;base64,${imgBase64}';
    </script></body></html>`);

    await page.waitForFunction(() => window._done, { timeout: 10000 });
    const canvasEl = page.locator("canvas");
    await canvasEl.screenshot({ path: path.join(outDir, outputFile) });
    await ctx.close();
  }

  // Detect if this is the master business (base images already have correct text)
  const isMasterBusiness = contactName === "Dörfler AG Test";

  // S01 — Homescreen (static master)
  logStep(1, TOTAL_STEPS, "S01 Homescreen");
  const homescreenCandidates = ["production/screen_masters/S01_homescreen.jpg", "production/screen_masters/S01_homescreen.png"];
  const homescreenMaster = homescreenCandidates.find(f => fs.existsSync(f));
  if (homescreenMaster) {
    fs.copyFileSync(homescreenMaster, path.join(outDir, `S01_homescreen${path.extname(homescreenMaster)}`));
    log(`✓ Copied from master`);
  } else {
    log("⚠ No homescreen master");
  }

  if (isMasterBusiness) {
    // For the master business, use base images directly (pixel-perfect, no overlay needed)
    log("  Master business detected — using base images directly");

    logStep(2, TOTAL_STEPS, `S02 Kontakt (master)`);
    fs.copyFileSync("production/screen_masters/base_contact.jpg", path.join(outDir, "S02_kontakt.jpg"));
    log("✓ S02_kontakt.jpg");

    logStep(3, TOTAL_STEPS, `S03 Dialing + Connected (master)`);
    fs.copyFileSync("production/screen_masters/base_dialing.jpg", path.join(outDir, "S03_dialing.jpg"));
    fs.copyFileSync("production/screen_masters/base_call_connected.jpg", path.join(outDir, "S03_anruf.jpg"));
    log("✓ S03_dialing.jpg + S03_anruf.jpg");

    logStep(4, TOTAL_STEPS, `S04 Anruf beendet (master)`);
    fs.copyFileSync("production/screen_masters/base_call_ended.jpg", path.join(outDir, "S04_anruf_beendet.jpg"));
    log("✓ S04_anruf_beendet.jpg");

    logStep(5, TOTAL_STEPS, `S05 SMS (master)`);
    fs.copyFileSync("production/screen_masters/base_sms.jpg", path.join(outDir, "S05_sms.jpg"));
    log("✓ S05_sms.jpg");

  } else {
    // For other businesses: overlay approach — real Samsung base + dynamic text swap
    log("  Overlay mode — swapping text for: " + contactName);

    // S02 — Contact (expanded with 4 action buttons)
    logStep(2, TOTAL_STEPS, `S02 Kontakt "${contactName}"`);
    await renderOverlay("base_contact.jpg", [
      // Search bar — wipe old name, draw new
      { x: 105, y: 165, w: 730, h: 80, bgColor: "#f1f1f3", text: contactName, color: "#1a1a1a", fontSize: 48, fontWeight: "500", offsetY: 15 },
      // Contact card — wipe old name + phone, draw new
      { x: 195, y: 465, w: 650, h: 145, bgColor: "#f8fafe", text: "", color: "transparent" },
      { x: 195, y: 470, w: 650, h: 60, bgColor: "transparent", text: contactName, color: "#2e7d32", fontSize: 46, fontWeight: "500", offsetY: 5 },
      { x: 195, y: 535, w: 500, h: 50, bgColor: "transparent", text: phone, color: "#666666", fontSize: 36, offsetY: 5 },
      // "Mobil" detail row — wipe + redraw
      { x: 195, y: 680, w: 650, h: 65, bgColor: "#f8fafe", text: `Mobil ${phone}`, color: "#1a1a1a", fontSize: 42, offsetY: 12 },
    ], "S02_kontakt.png");
    log("✓ S02_kontakt.png");

    // S03a — Dialing ("Wird angerufen...")
    logStep(3, TOTAL_STEPS, `S03a Wählen "${contactName}"`);
    await renderOverlay("base_dialing.jpg", [
      // Wipe name area (wide, gradient-sampled bg)
      { x: 20, y: 360, w: 1040, h: 130, bgColor: "#1c1121" },
      { x: 20, y: 360, w: 1040, h: 130, bgColor: "transparent", text: contactName, color: "#ffffff", fontSize: 86, fontWeight: "700", textAlign: "center", offsetY: 15 },
      // Wipe phone line
      { x: 60, y: 500, w: 960, h: 65, bgColor: "#271728" },
      { x: 60, y: 500, w: 960, h: 65, bgColor: "transparent", text: `Mobil  ${phone}`, color: "#bbbbbb", fontSize: 42, textAlign: "center", offsetY: 12 },
    ], "S03_dialing.png");
    log("✓ S03_dialing.png");

    // S03b — Call connected
    logStep(3, TOTAL_STEPS, `S03b Verbunden`);
    await renderOverlay("base_call_connected.jpg", [
      { x: 20, y: 320, w: 1040, h: 130, bgColor: "#16101a" },
      { x: 20, y: 320, w: 1040, h: 130, bgColor: "transparent", text: contactName, color: "#ffffff", fontSize: 86, fontWeight: "700", textAlign: "center", offsetY: 15 },
    ], "S03_anruf.png");
    log("✓ S03_anruf.png");

    // S04 — Call ended (white bg — easy overlay)
    logStep(4, TOTAL_STEPS, `S04 Anruf beendet`);
    await renderOverlay("base_call_ended.jpg", [
      { x: 20, y: 290, w: 1040, h: 150, bgColor: "#f2f2f2" },
      { x: 20, y: 290, w: 1040, h: 150, bgColor: "transparent", text: contactName, color: "#1a1a1a", fontSize: 90, fontWeight: "700", textAlign: "center", offsetY: 20 },
      { x: 80, y: 460, w: 920, h: 65, bgColor: "#f2f2f2" },
      { x: 80, y: 460, w: 920, h: 65, bgColor: "transparent", text: `Mobil  ${phone}`, color: "#666666", fontSize: 42, textAlign: "center", offsetY: 12 },
    ], "S04_anruf_beendet.png");
    log("✓ S04_anruf_beendet.png");

    // S05 — SMS
    logStep(5, TOTAL_STEPS, `S05 SMS von "${smsSender}"`);
    const smsLink = `https://flowsight.ch/v/${caseRef}?t=638655f8414e58dc`;
    await renderOverlay("base_sms.jpg", [
      // Header sender name
      { x: 270, y: 150, w: 520, h: 70, bgColor: "#ebeef5" },
      { x: 270, y: 150, w: 520, h: 70, bgColor: "transparent", text: smsSender, color: "#1a1a1a", fontSize: 46, fontWeight: "500", offsetY: 12 },
      // Message body — wipe entire bubble area, redraw
      { x: 62, y: 1260, w: 850, h: 340, bgColor: "#ebeef5" },
      { x: 72, y: 1270, w: 830, h: 55, bgColor: "transparent", text: `${smsSender}: Ihre Meldung wurde`, color: "#1a1a1a", fontSize: 40, offsetY: 5 },
      { x: 72, y: 1325, w: 830, h: 55, bgColor: "transparent", text: "aufgenommen. Hier können Sie Ihre", color: "#1a1a1a", fontSize: 40, offsetY: 5 },
      { x: 72, y: 1380, w: 830, h: 55, bgColor: "transparent", text: "Angaben ergänzen oder Fotos anfügen:", color: "#1a1a1a", fontSize: 40, offsetY: 5 },
      { x: 72, y: 1440, w: 830, h: 55, bgColor: "transparent", text: smsLink, color: "#1565c0", fontSize: 36, offsetY: 5 },
    ], "S05_sms.png");
    log("✓ S05_sms.png");
  }

  // ═══════════════════════════════════════════════════════════════
  // PART 2: Leitsystem Screens (Playwright → live app)
  // ═══════════════════════════════════════════════════════════════
  console.log("\n  ── Leitsystem Screens ────────────────────────");

  // Phone viewport (Samsung S23 equivalent)
  const VIEWPORT = { width: 393, height: 852 };

  const lsCtx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  });
  const page = await lsCtx.newPage();

  // Auth via saved cookies (from generate_auth_link.mjs)
  const cookiePath = "production/.playwright_cookies.json";
  if (!fs.existsSync(cookiePath)) {
    console.error("\n  ❌ No auth cookies found. Generate them first:");
    console.error("  node --env-file=.env.local scripts/_ops/generate_auth_link.mjs");
    await browser.close();
    process.exit(1);
  }

  logStep(6, TOTAL_STEPS, "Authenticating via saved cookies...");
  const savedCookies = JSON.parse(fs.readFileSync(cookiePath, "utf8"));

  // Map auth cookies to target domain
  const domain = new URL(baseUrl).hostname;
  const authCookies = savedCookies
    .filter(c => c.name.startsWith("sb-"))
    .map(c => ({ ...c, domain }));
  await lsCtx.addCookies(authCookies);

  // Navigate via tenant-app endpoint (sets fs_active_tenant cookie with correct UUID)
  await page.goto(`${baseUrl}/api/ops/tenant-app/${slug}`, { waitUntil: "networkidle", timeout: 20000 });

  // Check auth
  if (page.url().includes("login")) {
    console.error("  ❌ Login failed. Cookies expired? Regenerate:");
    console.error("  node --env-file=.env.local scripts/_ops/generate_auth_link.mjs");
    await browser.close();
    process.exit(1);
  }
  log("✓ Logged in");
  await page.waitForTimeout(3000);

  // Dismiss push notification banner if visible
  try {
    const dismissBtn = page.locator('text="Später"').first();
    if (await dismissBtn.isVisible({ timeout: 1500 })) {
      await dismissBtn.click();
      await page.waitForTimeout(500);
      log("  Dismissed notification banner");
    }
  } catch { /* no banner */ }

  // Verify correct tenant by checking page content
  const bodyText = await page.textContent("body").catch(() => "");
  const slugFirstWord = slug.replace(/-/g, " ").split(" ")[0];
  if (bodyText && !bodyText.toLowerCase().includes(slugFirstWord.toLowerCase())) {
    log(`  ⚠ Tenant mismatch — "${slugFirstWord}" not found on page`);
  }

  // S06 — Leitsystem Overview
  logStep(6, TOTAL_STEPS, "S06 Leitsystem Overview");
  await page.screenshot({ path: path.join(outDir, "S06_leitsystem_overview.png") });
  log("✓ S06_leitsystem_overview.png");

  // S07-S10 — KPI Highlights
  const kpiSteps = [
    { label: "Neu", file: "S07_kpi_neu.png", step: 7 },
    { label: "Bei uns", file: "S08_kpi_bei_uns.png", step: 8 },
    { label: "Erledigt", file: "S09_kpi_erledigt.png", step: 9 },
    { label: "Bewertung", file: "S10_kpi_bewertung.png", step: 10 },
  ];

  // KPI buttons have labels embedded with numbers (e.g. "74213Neu").
  // Use JS to find and click them since Playwright locators struggle with tiny mobile text.
  for (const kpi of kpiSteps) {
    logStep(kpi.step, TOTAL_STEPS, `${kpi.file.replace(".png", "")}`);
    try {
      const clicked = await page.evaluate((label) => {
        const buttons = document.querySelectorAll("button");
        for (const btn of buttons) {
          if (btn.textContent && btn.textContent.includes(label)) {
            btn.click();
            return true;
          }
        }
        return false;
      }, kpi.label);
      if (!clicked) log(`  ⚠ "${kpi.label}" button not found in DOM`);
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(outDir, kpi.file) });
      log(`✓ ${kpi.file}${clicked ? "" : " (fallback)"}`);
    } catch (e) {
      log(`⚠ ${kpi.file} — failed: ${e.message.split("\n")[0]}`);
      await page.screenshot({ path: path.join(outDir, kpi.file) });
    }
  }

  // Reset filter (click active KPI again to deselect, or find reset button)
  try {
    const resetBtn = page.locator('text="Filter zurücksetzen"').first();
    if (await resetBtn.isVisible({ timeout: 1000 })) {
      await resetBtn.click();
      await page.waitForTimeout(500);
    }
  } catch { /* no filter active — fine */ }

  // S11 — Scrolled table view
  logStep(11, TOTAL_STEPS, "S11 Tabelle (scrolled)");
  await page.evaluate(() => window.scrollTo({ top: 350, behavior: "smooth" }));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "S11_tabelle.png") });
  log("✓ S11_tabelle.png");

  // S12-S14 — Case Detail (find the featured Rohrbruch case)
  logStep(12, TOTAL_STEPS, "S12-S14 Falldetail (Rohrbruch)");

  try {
    // Find the latest Rohrbruch case via Supabase and navigate directly by URL
    // (React onClick on table rows doesn't fire from DOM/Playwright clicks)
    const sbUrl = process.env.SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let navigated = false;
    if (sbUrl && sbKey) {
      const sb = createSupabaseClient(sbUrl, sbKey, { auth: { autoRefreshToken: false, persistSession: false } });
      const { data: tenant } = await sb.from("tenants").select("id").eq("slug", slug).single();
      if (tenant) {
        const { data: rohrCase } = await sb
          .from("cases").select("id").eq("tenant_id", tenant.id).eq("category", "Rohrbruch")
          .order("created_at", { ascending: false }).limit(1).single();
        if (rohrCase) {
          log(`  Case ID: ${rohrCase.id.substring(0, 8)}...`);
          await page.goto(`${baseUrl}/ops/cases/${rohrCase.id}`, { waitUntil: "networkidle", timeout: 20000 });
          navigated = true;
        }
      }
    }
    if (!navigated) log("  ⚠ Could not find Rohrbruch case via DB");
    await page.waitForTimeout(2500);

    // S12 — Case detail top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "S12_fall_oben.png") });
    log("✓ S12_fall_oben.png");

    // S13 — Case detail middle (description + contact)
    logStep(13, TOTAL_STEPS, "S13 Falldetail Mitte");
    await page.evaluate(() => window.scrollTo({ top: 250, behavior: "smooth" }));
    await page.waitForTimeout(1000);

    // Click "Alles anzeigen" if visible (to expand description)
    try {
      const expandBtn = page.locator('text="Alles anzeigen"').first();
      if (await expandBtn.isVisible({ timeout: 1000 })) {
        await expandBtn.click();
        await page.waitForTimeout(500);
      }
    } catch { /* no expand button — description is short enough */ }

    await page.screenshot({ path: path.join(outDir, "S13_fall_mitte.png") });
    log("✓ S13_fall_mitte.png");

    // S14 — Case detail bottom (timeline/Verlauf)
    logStep(14, TOTAL_STEPS, "S14 Falldetail Unten");
    await page.evaluate(() => window.scrollTo({ top: 550, behavior: "smooth" }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, "S14_fall_unten.png") });
    log("✓ S14_fall_unten.png");

    // Navigate back to overview for a clean final state
    await page.goBack();
    await page.waitForTimeout(2000);

  } catch (e) {
    log(`⚠ Case detail failed: ${e.message.split("\n")[0]}`);
    log("  Hint: Did you seed demo data? Run: node --env-file=.env.local scripts/_ops/seed_demo_data_v2.mjs --slug=" + slug);
  }

  // S15 — Final overview (optional, reuse S06 or take fresh)
  logStep(15, TOTAL_STEPS, "S15 Final Overview");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, "S15_overview_final.png") });
  log("✓ S15_overview_final.png");

  // ═══════════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════════
  await browser.close();

  // Report
  const files = fs.readdirSync(outDir).filter(f => f.endsWith(".png")).sort();
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  Done — ${files.length} screenshots generated              ║`);
  console.log(`╚══════════════════════════════════════════════╝`);
  console.log(`  Output: ${outDir}/`);
  for (const f of files) {
    const size = (fs.statSync(path.join(outDir, f)).size / 1024).toFixed(0);
    console.log(`    ${f.padEnd(32)} ${size} KB`);
  }

  // Validation summary
  const expected = [
    "S01_homescreen", "S02_kontakt", "S03_anruf", "S04_anruf_beendet", "S05_sms",
    "S06_leitsystem_overview", "S07_kpi_neu", "S08_kpi_bei_uns", "S09_kpi_erledigt",
    "S10_kpi_bewertung", "S11_tabelle", "S12_fall_oben", "S13_fall_mitte",
    "S14_fall_unten", "S15_overview_final",
  ];
  const missing = expected.filter(e => !files.some(f => f.startsWith(e)));
  if (missing.length > 0) {
    console.log(`\n  ⚠ Missing: ${missing.join(", ")}`);
  } else {
    console.log(`\n  ✅ All ${expected.length} screenshots present`);
  }

  console.log(`\n  Next steps:`);
  console.log(`    1. Visual QA: open ${outDir}/ and verify all screens`);
  console.log(`    2. Build video: scripts/_ops/assemble_take2_video.mjs --slug=${slug}`);
}

main().catch((err) => {
  console.error("\n  ❌ Error:", err.message);
  process.exit(1);
});
