#!/usr/bin/env node
/**
 * generate_auth_link.mjs — Generate Playwright auth cookies via OTP injection
 *
 * Inserts a known OTP code into the otp_codes table, then runs headless
 * Playwright to log in via the normal OTP flow. Saves cookies to
 * production/.playwright_cookies.json for reuse by other scripts.
 *
 * Usage:
 *   node --env-file=.env.local scripts/_ops/generate_auth_link.mjs [--email=gunnar.wende@flowsight.ch]
 *
 * Output: production/.playwright_cookies.json (reusable auth cookies)
 */

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
const { chromium } = require("playwright");
import fs from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const idx = a.indexOf("=");
    if (idx === -1) return [a.replace(/^--/, ""), "true"];
    return [a.substring(0, idx).replace(/^--/, ""), a.substring(idx + 1)];
  })
);

const email = args.email || "gunnar.wende@flowsight.ch";
const outputPath = args.output || "production/.playwright_cookies.json";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n  Generating auth cookies for: ${email}`);

  // Step 1: Insert known OTP code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await supabase.from("otp_codes").delete().eq("email", email);
  const { error: insertErr } = await supabase.from("otp_codes").insert({
    email,
    code,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  if (insertErr) {
    console.error("  Failed to insert OTP:", insertErr.message);
    process.exit(1);
  }
  console.log(`  OTP code: ${code}`);

  // Step 2: Headless Playwright login
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  // Intercept send-code API → fake success (don't send real email)
  await page.route("**/api/ops/auth/send-code", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto("https://flowsight.ch/ops/login", {
    waitUntil: "networkidle",
    timeout: 20000,
  });

  // Enter email and submit
  await page.locator('input[type="email"]').fill(email);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(1500);

  // Enter OTP
  const inputs = page.locator('input[inputmode="numeric"], input[maxlength="1"]');
  for (let i = 0; i < 6; i++) {
    await inputs.nth(i).fill(code[i]);
  }

  // Wait for redirect
  await page.waitForTimeout(5000);

  if (page.url().includes("login")) {
    console.error("  ❌ Login failed. Check otp_codes table.");
    await browser.close();
    process.exit(1);
  }

  console.log("  ✅ Logged in successfully");

  // Save cookies
  fs.mkdirSync("production", { recursive: true });
  const cookies = await ctx.cookies();
  fs.writeFileSync(outputPath, JSON.stringify(cookies, null, 2));
  console.log(`  Cookies saved to: ${outputPath} (${cookies.length} cookies)`);

  await browser.close();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
