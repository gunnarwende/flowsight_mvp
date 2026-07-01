#!/usr/bin/env node
/**
 * record_leitsystem_screen.mjs — Hero-Leitzentrale Screen-Capture (Stern 3)
 *
 * Zwei Flows (getrennte Captures, NICHT gemischt):
 *   --flow=hero    (Default) Hero 38.5–49: Dashboard(NEU=1) → NEU-Filter → Brunner-Fall
 *                  → Fall-Detail → Scroll VERLAUF.
 *   --flow=knoten2 Knoten ② "Behalt ich den Überblick?": Liste → Fall steht da → KPI-Zustände
 *                  → Fall öffnen → ZUSTÄNDIG setzen (antippen wer's macht) → ruhige Liste.
 * Alles ECHTE App-Interaktion. State-basierte Anker (waitForSelector), keine blinden Timeouts
 * an kritischen Stellen (PIPELINE_BIBLE §4/§9).
 *
 * Auth: Cookies aus production/.playwright_cookies.json (vorher: generate_auth_link.mjs
 *       --email=admin@flowsight.ch). Tenant via fs_active_tenant-Cookie.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/record_leitsystem_screen.mjs \
 *     --slug=doerfler-ag [--flow=hero|knoten2] [--output-dir=…]
 *   HEADLESS=1 → headless (CI); Default: sichtbar (Laptop).
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
const flow = args.flow || "hero";
const outputDir = args["output-dir"] ||
  (flow === "knoten2" ? `production/screens/${slug}/knoten2` : `production/screens/${slug}`);
const baseUrl = "https://flowsight.ch";
const headless = process.env.HEADLESS === "1";
const COOKIE_FILE = "production/.playwright_cookies.json";
const VIEWPORT = { width: 393, height: 852 };

fs.mkdirSync(outputDir, { recursive: true });

// Push/Notif-Banner wegklicken (taucht auf Dashboard UND Detail auf → nach jeder Nav rufen)
async function dismissBanner(page) {
  for (const label of ["Später", "Nicht jetzt", "Schliessen"]) {
    const el = page.locator(`button:has-text("${label}")`).first();
    if (await el.count() && await el.isVisible().catch(() => false)) { await el.click().catch(() => {}); return; }
  }
}

// ── HERO-FLOW (abgenommen) ───────────────────────────────────────────
async function heroFlow(page, shot) {
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "networkidle", timeout: 20000 });
  if (page.url().includes("login")) throw new Error("Nicht eingeloggt — Cookies abgelaufen?");
  await page.locator('button:has-text("NEU"):visible').first().waitFor({ state: "visible", timeout: 15000 });
  await page.locator(':text("Frauenfeld"):visible').first().waitFor({ state: "visible", timeout: 15000 });
  console.log("  ✅ Dashboard (NEU + Brunner sichtbar)");
  await dismissBanner(page);
  await page.waitForLoadState("networkidle");
  await shot("02_dashboard.png");

  await page.locator('button:has-text("NEU"):visible').first().click();
  await page.locator(':text("Claudia Roth"):visible').first()
    .waitFor({ state: "hidden", timeout: 8000 })
    .catch(() => console.log("  ⚠️ NEU-Filter-Anker weich (prüfe Bild)"));
  await page.locator(':text("Frauenfeld"):visible').first().waitFor({ state: "visible", timeout: 5000 });
  await shot("03_neu_filter.png");

  await page.locator(':text("Frauenfeld"):visible').first().click();
  await page.waitForURL(/\/ops\/cases\/[0-9a-f-]{8}/, { timeout: 10000 }).catch(() => {});
  await page.locator(':text("Frauenfeld"):visible').first().waitFor({ state: "visible", timeout: 10000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot("04_fall_oben.png");
  await page.evaluate(() => window.scrollTo({ top: 320, behavior: "instant" }));
  await shot("05_fall_mitte.png");

  let anchored = false;
  for (const key of ["Verlauf", "Team informiert", "Anruf eingegangen"]) {
    const el = page.getByText(key).first();
    if (await el.count()) { await el.scrollIntoViewIfNeeded().catch(() => {}); await el.waitFor({ state: "visible", timeout: 5000 }).catch(() => {}); anchored = true; console.log(`  ⚓ Verlauf: "${key}"`); break; }
  }
  if (!anchored) await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await shot("06_verlauf.png");

  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "networkidle", timeout: 15000 });
  await page.locator('button:has-text("NEU"):visible').first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
  await shot("07_overview_final.png");
}

// ── KNOTEN-②-FLOW ────────────────────────────────────────────────────
async function knoten2Flow(page, shot) {
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "networkidle", timeout: 20000 });
  if (page.url().includes("login")) throw new Error("Nicht eingeloggt — Cookies abgelaufen?");
  await page.locator('button:has-text("NEU"):visible').first().waitFor({ state: "visible", timeout: 15000 });
  await page.locator(':text("Frauenfeld"):visible').first().waitFor({ state: "visible", timeout: 15000 });
  await dismissBanner(page);
  await page.waitForLoadState("networkidle");

  // K2-01 "Das hier ist alles. Eine Liste, auf Ihrem Handy." → Listen-Übersicht
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot("k2_01_liste.png");

  // K2-02 "…steht von selbst drin — Sie tippen nichts ab." → Brunner-Fall steht schon da
  await page.locator(':text("Frauenfeld"):visible').first().scrollIntoViewIfNeeded().catch(() => {});
  await shot("k2_02_brunner_da.png");

  // K2-03 "Ein Blick: neu · läuft · erledigt." → KPI-Reihe (drei Zustände)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('button:has-text("BEI UNS"):visible').first().waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  await shot("k2_03_kpi_zustaende.png");

  // K2-04 "Antippen, wer's macht — fertig." → Fall öffnen → ZUSTÄNDIG setzen
  await page.locator(':text("Frauenfeld"):visible').first().click();
  await page.waitForURL(/\/ops\/cases\/[0-9a-f-]{8}/, { timeout: 10000 }).catch(() => {});
  await page.locator(':text("Frauenfeld"):visible').first().waitFor({ state: "visible", timeout: 10000 });
  await dismissBanner(page);
  // ÜBERSICHT bearbeiten (erster "Bearbeiten"-Button = ÜBERSICHT-Karte)
  await page.getByRole("button", { name: "Bearbeiten" }).first().click();
  const mitInput = page.locator('input[placeholder*="Mitarbeiter"]').first();
  await mitInput.waitFor({ state: "visible", timeout: 8000 });
  await mitInput.scrollIntoViewIfNeeded().catch(() => {});
  await shot("k2_04a_edit.png");
  // Picker öffnen → Mitarbeiter "M. Keller" wählen (Owner Dörfler delegiert an Team)
  const TEAMMATE = process.env.TEAMMATE || "M. Keller";
  await mitInput.click();
  const option = page.getByText(TEAMMATE, { exact: true }).first();
  await option.waitFor({ state: "visible", timeout: 6000 });
  await shot("k2_04b_picker.png");
  await option.click();
  // Anker: Zuständig-Chip "M. Keller ✕" gesetzt
  await page.locator(`:text("${TEAMMATE}"):visible`).first().waitFor({ state: "visible", timeout: 5000 });
  // Speichern — löst Benachrichtigungs-Warnung aus (Zuständiger würde per E-Mail
  // benachrichtigt). WICHTIG: NIE "Benachrichtigen" (echte Mail an Prospect-Adresse!),
  // sondern "Trotzdem speichern" → persistiert ohne Versand.
  await page.getByRole("button", { name: "Speichern" }).first().click();
  const trotzdem = page.getByRole("button", { name: /Trotzdem speichern/ }).first();
  if (await trotzdem.count().catch(() => 0)) {
    await trotzdem.waitFor({ state: "visible", timeout: 4000 }).catch(() => {});
    await trotzdem.click().catch(() => {});
    console.log("  ✅ ohne E-Mail gespeichert (Trotzdem speichern)");
  }
  // Anker: Edit-Modus GESCHLOSSEN → Status-Select weg + "Bearbeiten"-Stift zurück
  // (Display-Modus: ÜBERSICHT zeigt ZUSTÄNDIG = Dörfler).
  await page.locator("select").first().waitFor({ state: "hidden", timeout: 12000 }).catch(() => {});
  await page.getByRole("button", { name: "Bearbeiten" }).first().waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  await page.waitForLoadState("networkidle");
  await dismissBanner(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot("k2_04c_zustaendig_gesetzt.png");

  // K2-05 "…Weniger Arbeit, mehr Überblick." → zurück zur ruhigen Liste
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "networkidle", timeout: 15000 });
  await page.locator('button:has-text("NEU"):visible').first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
  await dismissBanner(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot("k2_05_liste_ruhig.png");
}

async function main() {
  console.log(`\n  Leitzentrale Capture · slug=${slug} · flow=${flow} · headless=${headless}`);
  if (!fs.existsSync(COOKIE_FILE)) {
    console.error(`  ❌ ${COOKIE_FILE} fehlt. Erst: node --env-file=src/web/.env.local scripts/_ops/generate_auth_link.mjs --email=admin@flowsight.ch`);
    process.exit(1);
  }
  const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE, "utf8"));
  const browser = await chromium.launch({ headless, slowMo: headless ? 0 : 250 });
  const context = await browser.newContext({
    viewport: VIEWPORT, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    recordVideo: { dir: outputDir, size: VIEWPORT },
  });
  await context.addCookies(cookies);
  await context.addCookies([{ name: "fs_active_tenant", value: slug, domain: "flowsight.ch", path: "/" }]);
  const page = await context.newPage();
  const shot = async (n) => { await page.screenshot({ path: path.join(outputDir, n) }); console.log("  📸", n); };

  if (flow === "knoten2") await knoten2Flow(page, shot);
  else await heroFlow(page, shot);

  const vid = page.video();
  await context.close();
  if (vid) {
    const src = await vid.path();
    const dst = path.join(outputDir, "screen_recording.webm");
    fs.copyFileSync(src, dst); fs.rmSync(src, { force: true });
    console.log("  🎞️  screen_recording.webm gespeichert");
  }
  await browser.close();
  console.log(`\n  ✅ Fertig (${flow}) → ${outputDir}/`);
}
main().catch((e) => { console.error("Error:", e); process.exit(1); });
