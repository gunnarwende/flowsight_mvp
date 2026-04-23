#!/usr/bin/env node
/**
 * Debug: Was rendert Case-Detail wirklich?
 */
import { chromium } from "playwright";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = "info@doerflerag.ch";
await sb.from("otp_codes").delete().eq("email", email);
await sb.from("otp_codes").insert({
  email, code: "dbg1", expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), used: false,
});
const authResp = await fetch(`http://localhost:3000/api/ops/auth/verify-code`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, code: "dbg1" }),
});
const setCookies = authResp.headers.getSetCookie() || [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true });
for (const raw of setCookies) {
  const eqIdx = raw.indexOf("=");
  const scIdx = raw.indexOf(";");
  await context.addCookies([{
    name: raw.slice(0, eqIdx),
    value: raw.slice(eqIdx + 1, scIdx > 0 ? scIdx : undefined),
    domain: "localhost", path: "/", sameSite: "Lax",
  }]);
}
const page = await context.newPage();

// Get case 49 ID
const { data: tenant } = await sb.from("tenants").select("id").eq("slug", "doerfler-ag").single();
const { data: phoneCase } = await sb.from("cases").select("id, seq_number").eq("tenant_id", tenant.id).eq("seq_number", 49).single();
console.log("Case 49 ID:", phoneCase.id);

await page.goto(`http://localhost:3000/ops/cases/${phoneCase.id}`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(8000);

const structure = await page.evaluate(() => {
  const body = document.body;
  const mainText = body.innerText.slice(0, 2000);
  const allH3 = [...document.querySelectorAll("h3")].map((el) => el.outerHTML.slice(0, 200));
  const allSpecific = [...document.querySelectorAll("[class*='rounded-xl']")].slice(0, 10).map((el) => ({
    text: el.textContent.slice(0, 100),
    className: el.className.slice(0, 100),
  }));
  return {
    bodyHeight: body.scrollHeight,
    docHeight: document.documentElement.scrollHeight,
    visibleHeight: window.innerHeight,
    h3Count: allH3.length,
    h3List: allH3,
    mainTextFirst2000: mainText,
    firstCards: allSpecific,
    url: location.href,
  };
});

console.log("\n=== PAGE STRUCTURE ===");
console.log("URL:", structure.url);
console.log("docHeight:", structure.docHeight, "| bodyHeight:", structure.bodyHeight);
console.log("h3 count:", structure.h3Count);
console.log("\n--- TEXT (first 2000 chars) ---");
console.log(structure.mainTextFirst2000);
console.log("\n--- FIRST 10 rounded-xl cards ---");
structure.firstCards.forEach((c, i) => console.log(`[${i}]`, c.text.slice(0, 80)));

await browser.close();
