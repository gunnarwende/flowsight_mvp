#!/usr/bin/env node
/**
 * record_leitsystem_screen.mjs — Hero-Leitzentrale Screen-Capture (Stern 3)
 *
 * Nimmt das Hero-Dashboard + Knoten-②-Flow am Mobile-Viewport auf:
 *   Dashboard (NEU=1) → NEU-Filter → Brunner-Fall → Fall-Detail → Scroll zum VERLAUF.
 * Alles ECHTE App-Interaktion gegen die Live-App. State-basierte Anker (waitForSelector),
 * NIE blinde Timeouts an kritischen Stellen (Anker-Disziplin, PIPELINE_BIBLE §4/§9).
 *
 * Auth: Cookies aus production/.playwright_cookies.json (generate_auth_link.mjs
 *       --email=admin@flowsight.ch VORHER laufen lassen). Tenant via fs_active_tenant.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/record_leitsystem_screen.mjs \
 *     --slug=doerfler-ag [--case-id=<uuid>] [--output-dir=production/screens/doerfler-ag]
 *   HEADLESS=1 … → headless (CI); Default: sichtbar (Laptop).
 *
 * Output: <output-dir>/{02_dashboard,03_neu_filter,04_fall_oben,05_fall_mitte,
 *         06_verlauf,07_overview_final}.png + screen_recording.webm
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const i = a.indexOf("="); if (i === -1) return [a.replace(/^--/, ""), "true"];
  return [a.substring(0, i).replace(/^--/, ""), a.substring(i + 1)];
}));
const slug = args.slug || "doerfler-ag";
const caseId = args["case-id"] || "";
const outputDir = args["output-dir"] || `production/screens/${slug}`;
const baseUrl = "https://flowsight.ch";
const headless = process.env.HEADLESS === "1";
const COOKIE_FILE = "production/.playwright_cookies.json";
const VIEWPORT = { width: 393, height: 852 };

fs.mkdirSync(outputDir, { recursive: true });

async function main() {
  console.log(`\n  Hero-Leitzentrale Capture · slug=${slug} · headless=${headless}`);
  if (!fs.existsSync(COOKIE_FILE)) {
    console.error(`  ❌ ${COOKIE_FILE} fehlt. Erst: node --env-file=src/web/.env.local scripts/_ops/generate_auth_link.mjs --email=admin@flowsight.ch`);
    process.exit(1);
  }
  const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE, "utf8"));

  const browser = await chromium.launch({ headless, slowMo: headless ? 0 : 250 });
  const context = await browser.newContext({
    viewport: VIEWPORT, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    recordVideo: { dir: outputDir, size: VIEWPORT }, // → screen_recording.webm (Montage-Input)
  });
  await context.addCookies(cookies);
  await context.addCookies([{ name: "fs_active_tenant", value: slug, domain: "flowsight.ch", path: "/" }]);
  const page = await context.newPage();
  const shot = async (n) => { await page.screenshot({ path: path.join(outputDir, n) }); console.log("  📸", n); };

  // ── 1. Dashboard laden + Login-Anker ──────────────────────────────
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "networkidle", timeout: 20000 });
  if (page.url().includes("login")) { console.error("  ❌ Nicht eingeloggt — Cookies abgelaufen? Neu generieren."); process.exit(1); }
  // Anker: KPI-Leiste da (NEU sichtbar) + Hero-Fall in der Liste.
  // "Frauenfeld" statt "Wärmepumpe" — letzteres matcht ein hidden <option> im
  // Kategorie-Filter; Frauenfeld ist nur dem Brunner-Fall eigen + sichtbar.
  await page.locator('button:has-text("NEU"):visible').first().waitFor({ state: "visible", timeout: 15000 });
  await page.locator(':text("Frauenfeld"):visible').first().waitFor({ state: "visible", timeout: 15000 });
  console.log("  ✅ Eingeloggt, Dashboard geladen (NEU + Brunner sichtbar)");

  // Push/Notif-Banner wegklicken (räumt das Bild)
  for (const label of ["Später", "Nicht jetzt", "Schliessen"]) {
    const el = page.locator(`button:has-text("${label}")`).first();
    if (await el.count() && await el.isVisible().catch(() => false)) { await el.click().catch(() => {}); break; }
  }
  await page.waitForLoadState("networkidle");
  await shot("02_dashboard.png");

  // ── 2. NEU-Filter tippen → nur der Brunner-Fall (blauer Ring) ─────
  await page.locator('button:has-text("NEU"):visible').first().click();
  // Anker (state, nicht Zeit): der Notfall "Claudia Roth" (In Arbeit) verschwindet
  // aus der Liste, der Brunner-Fall (Frauenfeld) bleibt.
  await page.locator(':text("Claudia Roth"):visible').first()
    .waitFor({ state: "hidden", timeout: 8000 })
    .catch(() => console.log("  ⚠️ NEU-Filter-Anker weich (prüfe Bild)"));
  await page.locator(':text("Frauenfeld"):visible').first().waitFor({ state: "visible", timeout: 5000 });
  await shot("03_neu_filter.png");

  // ── 3. Brunner-Fall tippen → Fall-Detail ──────────────────────────
  await page.locator(':text("Frauenfeld"):visible').first().click();
  await page.waitForURL(/\/ops\/cases\/[0-9a-f-]{8}/, { timeout: 10000 }).catch(() => {});
  // Anker: Detail-Kopf da (Adresse/Kunde des Falls)
  await page.locator(':text("Frauenfeld"):visible').first().waitFor({ state: "visible", timeout: 10000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot("04_fall_oben.png");
  await page.evaluate(() => window.scrollTo({ top: 320, behavior: "instant" }));
  await shot("05_fall_mitte.png");

  // ── 4. Sanfter Scroll zum VERLAUF (Timeline-Anker, state-basiert) ─
  let anchored = false;
  for (const key of ["Verlauf", "Team informiert", "Anruf eingegangen"]) {
    const el = page.getByText(key).first();
    if (await el.count()) {
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await el.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
      anchored = true; console.log(`  ⚓ Verlauf-Anker: "${key}"`); break;
    }
  }
  if (!anchored) { console.log("  ⚠️ Kein Verlauf-Anker gefunden — scrolle ans Ende"); await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); }
  await shot("06_verlauf.png");

  // ── 5. Zurück zur Übersicht ───────────────────────────────────────
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "networkidle", timeout: 15000 });
  await page.locator('button:has-text("NEU"):visible').first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
  await shot("07_overview_final.png");

  // ── Video sichern ─────────────────────────────────────────────────
  const vid = page.video();
  await context.close();               // finalisiert das Video
  if (vid) {
    const src = await vid.path();
    const dst = path.join(outputDir, "screen_recording.webm");
    fs.copyFileSync(src, dst); fs.rmSync(src, { force: true });
    console.log("  🎞️  screen_recording.webm gespeichert");
  }
  await browser.close();
  console.log(`\n  ✅ Fertig → ${outputDir}/`);
}
main().catch((e) => { console.error("Error:", e); process.exit(1); });
