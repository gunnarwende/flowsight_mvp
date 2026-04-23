/**
 * Playwright Capture Script — Video Production Screenshots
 *
 * Captures UI screenshots for Hero + Live-erleben videos.
 * Uses Weinberger-AG tenant with real seeded data.
 *
 * Usage: node docs/redesign/redesign_website/scripts/capture_screenshots.mjs
 * Requires: Playwright installed (npm ls playwright), dev server running on localhost:3000
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = process.env.BASE_URL || 'https://flowsight-mvp.vercel.app';
const OUTPUT_DIR = resolve('docs/redesign/redesign_website/production/captures');

// Weinberger tenant data
const WEINBERGER_SLUG = 'weinberger-ag';

mkdirSync(OUTPUT_DIR, { recursive: true });

async function capture(page, name, url, viewport, options = {}) {
  const { width, height } = viewport;
  await page.setViewportSize({ width, height });

  console.log(`📸 ${name} (${width}x${height})...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  if (options.waitFor) {
    await page.waitForSelector(options.waitFor, { timeout: 10000 }).catch(() => {
      console.log(`  ⚠️  Selector "${options.waitFor}" not found, proceeding anyway`);
    });
  }

  if (options.click) {
    await page.click(options.click).catch(() => {
      console.log(`  ⚠️  Click target "${options.click}" not found`);
    });
    await page.waitForTimeout(500);
  }

  if (options.delay) {
    await page.waitForTimeout(options.delay);
  }

  const path = `${OUTPUT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: options.fullPage || false });
  console.log(`  ✅ → ${path}`);
  return path;
}

async function main() {
  console.log('\n🎬 FlowSight Video Capture Session\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });

  // Context with 2x device scale for Retina quality
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    locale: 'de-CH',
  });

  const page = await context.newPage();

  try {
    // ─── PUBLIC PAGES (no auth needed) ───

    // C1: Customer Website Hero
    await capture(page, 'website_hero',
      `${BASE_URL}/kunden/${WEINBERGER_SLUG}`,
      { width: 1920, height: 1080 },
      { waitFor: 'main', delay: 1000 }
    );

    // C2: Wizard Step 1 (Kategorie)
    await capture(page, 'wizard_step1',
      `${BASE_URL}/kunden/${WEINBERGER_SLUG}/meldung`,
      { width: 1920, height: 1080 },
      { waitFor: 'form', delay: 500 }
    );

    // C3: Wizard Step 1 Mobile
    await capture(page, 'wizard_step1_mobile',
      `${BASE_URL}/kunden/${WEINBERGER_SLUG}/meldung`,
      { width: 390, height: 844 },
      { waitFor: 'form', delay: 500 }
    );

    // C4: SMS Verify Page (needs a real case with verify token)
    // We'll use WE-209 (latest) - need to get verify URL from case
    // Skip for now if no token available
    console.log('\n⏭️  SMS Verify + Review Surface need auth tokens — capturing public pages first.\n');

    // C5: Website Hero Mobile
    await capture(page, 'website_hero_mobile',
      `${BASE_URL}/kunden/${WEINBERGER_SLUG}`,
      { width: 390, height: 844 },
      { waitFor: 'main', delay: 1000 }
    );

    // ─── OPS PAGES (need OTP login) ───
    // For Leitzentrale, we need to be logged in.
    // Try navigating to /ops — it will redirect to login if not authenticated.

    console.log('\n🔐 Attempting OPS captures (may need auth)...\n');

    // C6: Leitzentrale Desktop (might show login page if not authed)
    await capture(page, 'leitzentrale_desktop',
      `${BASE_URL}/ops/cases`,
      { width: 1920, height: 1080 },
      { delay: 2000 }
    );

    // C7: Leitzentrale Mobile
    await capture(page, 'leitzentrale_mobile',
      `${BASE_URL}/ops/cases`,
      { width: 390, height: 844 },
      { delay: 1000 }
    );

    console.log('\n✅ Public captures done.');
    console.log('⚠️  OPS/Review captures may show login page — check output.');
    console.log('   For authenticated captures, we need to handle OTP login in the script.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
  }

  console.log(`\n📁 All captures in: ${OUTPUT_DIR}\n`);
}

main();
