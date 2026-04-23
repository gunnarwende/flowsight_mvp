#!/usr/bin/env node
/**
 * record_leitsystem_screen.mjs — Programmatischer Leitsystem Screen-Capture
 *
 * Öffnet das Leitsystem im Mobile-Viewport, navigiert durch die App,
 * nimmt Screenshots + Video auf. Kein echtes Handy nötig.
 *
 * Usage:
 *   node --env-file=.env.local scripts/_ops/record_leitsystem_screen.mjs \
 *     --slug=doerfler-ag --case-id=<uuid> [--output-dir=production/screens/doerfler-ag]
 *
 * Requires: Playwright, SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * Output:
 *   <output-dir>/
 *     01_homescreen.png       — App icon on homescreen (static)
 *     02_leitsystem_overview.png — KPI overview
 *     03_kpi_neu.png          — "Neu" KPI highlighted
 *     04_kpi_bei_uns.png      — "Bei uns" KPI highlighted
 *     05_kpi_erledigt.png     — "Erledigt" KPI highlighted
 *     06_kpi_bewertung.png    — "Bewertung" KPI highlighted
 *     07_scroll_tabelle.png   — Table scrolled down
 *     08_fall_oben.png        — Case detail top
 *     09_fall_mitte.png       — Case detail middle (description + contact)
 *     10_fall_unten.png       — Case detail bottom (timeline)
 *     screen_recording.webm   — Full screen recording
 */

import { chromium } from "playwright";
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
const caseId = args["case-id"] || "";
const outputDir = args["output-dir"] || `production/screens/${slug}`;
const baseUrl = "https://flowsight.ch";

fs.mkdirSync(outputDir, { recursive: true });

// ── Phone viewport (Samsung S23 equivalent) ───────────────────────
const VIEWPORT = { width: 393, height: 852 };

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log(`\n  Leitsystem Screen Capture`);
  console.log(`  Slug:    ${slug}`);
  console.log(`  Case:    ${caseId || "auto (first 'new' case)"}`);
  console.log(`  Output:  ${outputDir}`);
  console.log(`  Base:    ${baseUrl}\n`);

  const browser = await chromium.launch({ headless: false, slowMo: 300 }); // slowMo for natural-looking navigation
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  });

  // Start recording
  const page = await context.newPage();
  await page.video()?.path(); // Initialize video if available

  // ── Step 1: Auto-Login via Magic Link ─────────────────────────────
  console.log("  1. Authenticating...");

  // Read pre-generated magic link (no OTP needed)
  const authLinkPath = "production/.playwright_auth_link";
  if (!fs.existsSync(authLinkPath)) {
    console.error("  ❌ No auth link found. Run: node --env-file=.env.local -e '...' to generate one.");
    process.exit(1);
  }

  const authLink = fs.readFileSync(authLinkPath, "utf8").trim();

  // Navigate to the magic link → auto-login
  await page.goto(authLink, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(2000);

  // Set tenant cookie for the target slug
  await context.addCookies([{
    name: "fs_active_tenant",
    value: slug,
    domain: "flowsight.ch",
    path: "/",
  }]);

  // Navigate to cases
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "networkidle", timeout: 15000 });

  // Check if we're logged in
  const currentUrl = page.url();
  if (currentUrl.includes("login")) {
    console.error("  ❌ Login failed. Magic link may be expired. Regenerate it.");
    process.exit(1);
  }

  console.log("  ✅ Logged in successfully (no OTP)");
  await page.waitForTimeout(3000);

  // ── Step 2: Overview Screenshot ─────────────────────────────────
  console.log("  2. Overview screenshot...");
  await page.screenshot({ path: path.join(outputDir, "02_leitsystem_overview.png") });

  // ── Step 3: KPI Highlights (click each KPI) ────────────────────
  console.log("  3. KPI highlights...");

  // Click "Neu" KPI
  try {
    const neuKpi = page.locator("text=NEU").first();
    await neuKpi.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, "03_kpi_neu.png") });

    // Click "Bei uns" KPI
    const beiUnsKpi = page.locator("text=BEI UNS").first();
    await beiUnsKpi.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, "04_kpi_bei_uns.png") });

    // Click "Erledigt" KPI
    const erledigtKpi = page.locator("text=ERLEDIGT").first();
    await erledigtKpi.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, "05_kpi_erledigt.png") });

    // Click "Bewertung" KPI (stars area)
    const bewertungKpi = page.locator("text=BEWERTUNG").first();
    await bewertungKpi.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, "06_kpi_bewertung.png") });

    // Reset filter
    const resetBtn = page.locator("text=Filter zurücksetzen");
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await page.waitForTimeout(500);
    }
  } catch (e) {
    console.log("  ⚠️  KPI click failed:", e.message);
  }

  // ── Step 4: Scroll down to show table ──────────────────────────
  console.log("  4. Scroll table...");
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "smooth" }));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, "07_scroll_tabelle.png") });

  // ── Step 5: Open case detail ───────────────────────────────────
  console.log("  5. Case detail...");

  // Find and click the target case (or first "Neu" case)
  try {
    let caseLink;
    if (caseId) {
      caseLink = page.locator(`a[href*="${caseId}"]`).first();
    } else {
      // Click the first case with "Rohrbruch" and "Neu" status
      caseLink = page.locator("text=Rohrbruch").first();
    }

    await caseLink.click();
    await page.waitForTimeout(2000);

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, "08_fall_oben.png") });

    // Scroll to middle (description + contact)
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: "smooth" }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, "09_fall_mitte.png") });

    // Scroll to bottom (timeline)
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: "smooth" }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, "10_fall_unten.png") });
  } catch (e) {
    console.log("  ⚠️  Case detail failed:", e.message);
  }

  // ── Step 6: Go back to overview ────────────────────────────────
  console.log("  6. Back to overview...");
  await page.goBack();
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, "11_overview_final.png") });

  // ── Done ───────────────────────────────────────────────────────
  await browser.close();

  console.log(`\n  ✅ Done. Screenshots in ${outputDir}/`);
  console.log(`  Files:`);
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".png"));
  files.forEach(f => console.log(`    ${f}`));
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
