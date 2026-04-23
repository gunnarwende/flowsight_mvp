#!/usr/bin/env node
/**
 * produce_screenflow.mjs — Produce high-end screenflow videos for Take 2, 3, 4.
 *
 * Generates pixel-perfect, animated screen recordings per business.
 * Two worlds:
 *   1. Samsung Native (HTML animated sequence → Playwright video)
 *   2. Leitsystem Web-App (Playwright navigates real app → video)
 *
 * Input: tenant_config.json (EINZIGER Input)
 * Output: docs/gtm/pipeline/06_video_production/screenflows/{slug}/*.webm
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/produce_screenflow.mjs \
 *     --slug stark-haustechnik --take 2
 */

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { chromium } from "playwright";
import { getDemoTimes } from "./_lib/demo_time.mjs";

const demoTime = getDemoTimes({ skipGate: true });

// ── CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const prefix = `--${name}=`;
  const arg = args.find((a) => a.startsWith(prefix));
  if (arg) return arg.slice(prefix.length);
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith("--") ? args[idx + 1] : null;
}

const slug = getArg("slug");
const take = getArg("take") || "2";

if (!slug) {
  console.error("Usage: node --env-file=src/web/.env.local scripts/_ops/produce_screenflow.mjs --slug <slug> --take 2|3|4|all");
  process.exit(1);
}

// ── Load config ──────────────────────────────────────────────────────────
const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));
const t = config.tenant;
const va = config.voice_agent;
const seed = config.seed;
const vid = config.video;

// Pipeline-Ordnerstruktur: Video-Outputs sind Pipeline-Assets (Blueprint für
// alle Betriebe), nicht Customer-Dokumente. Liegen ab in:
//   docs/gtm/pipeline/06_video_production/screenflows/<slug>/
// Skalierbar: Jeder Betrieb bekommt seinen Unterordner. Dörfler = Master.
const outputDir = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
await mkdir(outputDir, { recursive: true });

const APP_URL = process.env.APP_URL || "https://flowsight.ch";

// ── Shared Playwright setup ──────────────────────────────────────────────
const SAMSUNG_VIEWPORT = { width: 412, height: 915 };
const SCALE = 2;

async function createVideoContext(browser, dir, opts = {}) {
  const mobile = opts.mobile !== false;
  const vp = mobile ? SAMSUNG_VIEWPORT : (opts.viewport || { width: 1280, height: 800 });

  return browser.newContext({
    viewport: vp,
    deviceScaleFactor: 1, // KEIN Scaling — Video = Viewport 1:1
    isMobile: mobile,
    hasTouch: mobile,
    userAgent: mobile
      ? "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    recordVideo: {
      dir,
      size: vp, // Video = exakt Viewport, kein Scaling-Mismatch
    },
  });
}

// Datum deterministisch aus demoTime (heute, lokal Europe/Zurich via Intl).
function getTodayGerman() {
  const parts = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    weekday: "long", day: "numeric", month: "long",
  }).formatToParts(demoTime.phoneCallStartTime).reduce((a, p) => { a[p.type] = p.value; return a; }, {});
  return `${parts.weekday}, ${parts.day}. ${parts.month}`;
}

// Zeit-SSoT (23.04.): Samsung-Uhr IMMER aus demoTime.samsungClock, NICHT aus
// System-Zeit oder _seed_time. Take 2 Basis = take2_call_active = 08:04.
// Downstream-Logik (SMS nach +4min) ergibt 08:08 — konsistent mit
// demoTime.phoneCaseSavedTime und seed.phoneCase.created_at.
function getVideoBaseTime() {
  return demoTime.samsungClock.take2_call_active;
}

// ══════════════════════════════════════════════════════════════════════════
// TAKE 2: Samsung Sequence
// ══════════════════════════════════════════════════════════════════════════

async function produceTake2Samsung() {
  console.log("\n── Take 2: Samsung Sequence ──────────────────────");

  const browser = await chromium.launch({ headless: true });
  const tmpDir = join(outputDir, "_tmp_samsung");
  await mkdir(tmpDir, { recursive: true });

  const context = await createVideoContext(browser, tmpDir);
  const page = await context.newPage();

  // Build URL with all dynamic params
  const htmlPath = resolve("scripts/_ops/screen_templates/sequences/take2_samsung.html");
  const fileUrl = "file:///" + htmlPath.split(sep).join("/");
  // FB30: Fiktive Telefonnummer (video.display_phone) statt echter va.phone.
  // Die echte Nummer ist live und darf NIE im Video erscheinen (Testviewer
  // würden beim echten Betrieb landen). video.display_phone ist fiktiv.
  const displayPhone = vid?.display_phone || vid?.telefon_display || va.phone || "";
  const params = new URLSearchParams({
    firma: (va.company_name || t.name) + " Test",
    telefon: displayPhone,
    sms_sender: t.name, // FB: Mit Umlauten statt ASCII sms_sender_name
    case_ref: t.case_id_prefix || "XX",
    uhrzeit: getVideoBaseTime(), // FB47/49: synchron zum Seed
    datum: getTodayGerman(),
    initial: (va.company_name || t.name).charAt(0),
    anruf_dauer: "191", // Will be controlled externally later
    brand_color: t.brand_color || "#003478",
    playwright: "true", // Prevents auto-advance
  });

  console.log(`  Firma: ${va.company_name}`);
  console.log(`  Telefon: ${va.phone}`);
  console.log(`  SMS Sender: ${t.sms_sender_name}`);
  console.log(`  Case-Ref: ${t.case_id_prefix}`);
  console.log(`  Datum: ${getTodayGerman()}`);
  console.log(`  Recording...`);

  await page.goto(`${fileUrl}?${params}`, { waitUntil: "domcontentloaded" });

  // Wait for sequence: homescreen → contact → dialing → call active
  // Homescreen (2s) + tap (0.4s) + contact (1.5s) + tap (0.4s) + dialing (3s) = ~7.3s
  await page.waitForTimeout(8000);

  // Call is now active with timer running.
  // Record 15 seconds of the call (pulsating gradient + timer counting)
  // In production, this will be the full call duration.
  // For now, record a representative sample.
  console.log("  Call active (recording timer + gradient pulse)...");
  await page.waitForTimeout(15000);

  // End call
  await page.evaluate(() => window.endCall());
  console.log("  Call ended");
  await page.waitForTimeout(3000);

  // FB31 + FB38: 1 Sekunde reiner Homescreen, aber mit AKTUELLER Uhrzeit (Call-Ende).
  // Ohne diesen updateAllClocks-Aufruf würde der Homescreen die Initial-Zeit zeigen
  // (z.B. 13:16 während Call bei 13:19 endete = Rückwärts-Sprung = No-Go).
  await page.evaluate(() => {
    window.updateAllClocks(window.getCallEndTime());
    window.showScreen("homescreen");
  });
  await page.waitForTimeout(1000);
  console.log("  Homescreen (1s pause before SMS, clock = Call-End time)");

  // Back to homescreen + SMS notification
  await page.evaluate(() => window.showSmsNotification());
  console.log("  SMS notification banner");
  await page.waitForTimeout(2500);

  // Open SMS thread
  await page.evaluate(() => window.openSmsThread());
  console.log("  SMS thread");
  await page.waitForTimeout(3000);

  // FB8: Back to homescreen briefly — kürzer (war 1800ms), weil Tap-Indicator den Moment füllt
  await page.evaluate(() => window.showScreen("homescreen"));
  await page.evaluate(() => {
    const nb = document.getElementById("notif-banner");
    if (nb) nb.classList.remove("visible");
  });
  await page.waitForTimeout(500);

  // FB-Remotion: Nur 500ms Tap-Feedback (kein CSS-Zoom mehr).
  // Der App-Open wird im Splice durch echtes scrcpy-Recording ersetzt.
  await page.evaluate(() => window.openApp());
  console.log("  Tap-Feedback (500ms) — App-Open-Zoom kommt per scrcpy splice");
  await page.waitForTimeout(700); // 500ms tap + 200ms buffer, endet mit Homescreen im Tapping-State

  // Stop recording
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  // Move video to output directory
  const finalPath = join(outputDir, "take2_samsung.webm");
  const { copyFileSync, rmSync } = await import("node:fs");
  copyFileSync(videoPath, finalPath);
  rmSync(tmpDir, { recursive: true, force: true });

  const size = statSync(finalPath).size;
  console.log(`  ✅ Saved: ${finalPath} (${Math.round(size / 1024)} KB)`);
  return finalPath;
}

// ══════════════════════════════════════════════════════════════════════════
// TAKE 2: Leitsystem Sequence
// ══════════════════════════════════════════════════════════════════════════

async function produceTake2Leitsystem() {
  console.log("\n── Take 2: Leitsystem Sequence ──────────────────");

  const browser = await chromium.launch({ headless: true });
  const tmpDir = join(outputDir, "_tmp_leitsystem");
  await mkdir(tmpDir, { recursive: true });

  const context = await createVideoContext(browser, tmpDir);
  const page = await context.newPage();

  // Auth: Set Supabase cookies + tenant cookie
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sbUrl || !sbKey) {
    console.error("  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    await browser.close();
    return null;
  }

  // Get tenant ID from Supabase
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
  const supabase = createClient(sbUrl, sbKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", slug).single();
  if (!tenant) {
    console.error(`  Tenant ${slug} not found in Supabase`);
    await browser.close();
    return null;
  }
  console.log(`  Tenant ID: ${tenant.id}`);

  // Login via OTP injection (same approach as build_take2_screens.mjs)
  // Generate a magic link for a test admin user
  const adminEmail = "admin@flowsight.ch";
  const { data: linkData } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: adminEmail,
    options: { redirectTo: `${APP_URL}/ops/cases` },
  });

  if (!linkData?.properties?.hashed_token) {
    console.error("  Failed to generate admin magic link");
    await browser.close();
    return null;
  }

  // Navigate to magic link to establish session
  const verifyUrl = `${sbUrl}/auth/v1/verify?token=${linkData.properties.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(APP_URL + "/ops/cases")}`;
  console.log("  Authenticating...");

  try {
    await page.goto(verifyUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(3000);
  } catch {
    console.log("  Auth redirect completed");
  }

  // Switch to the target tenant
  console.log("  Switching to tenant...");
  await page.goto(`${APP_URL}/api/ops/tenant-app/${slug}`, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Navigate to ops dashboard
  console.log("  Loading Leitsystem...");
  await page.goto(`${APP_URL}/ops/cases`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(4000);

  // Start recording the interaction sequence
  console.log("  Recording Leitsystem sequence...");

  // 1. Overview — show FlowBar + cases
  await page.waitForTimeout(3000);
  console.log("    Overview shown");

  // 2. Scroll down to show more cases
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: "smooth" }));
  await page.waitForTimeout(2000);
  console.log("    Scrolled down");

  // 3. Scroll back up
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(2000);
  console.log("    Scrolled back up");

  // 4. Try to click a case (find featured Rohrbruch case)
  const { data: featuredCase } = await supabase
    .from("cases")
    .select("id, seq_number")
    .eq("tenant_id", tenant.id)
    .eq("category", "Rohrbruch")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (featuredCase) {
    console.log(`    Opening case #${featuredCase.seq_number}...`);
    await page.goto(`${APP_URL}/ops/cases/${featuredCase.id}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(3000);

    // Scroll through case detail
    await page.evaluate(() => window.scrollTo({ top: 200, behavior: "smooth" }));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: "smooth" }));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await page.waitForTimeout(2000);
    console.log("    Case detail scrolled");

    // Go back to overview
    await page.goBack();
    await page.waitForTimeout(3000);
    console.log("    Back to overview");
  }

  // Stop recording
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  // Move video
  const finalPath = join(outputDir, "take2_leitsystem.webm");
  const { copyFileSync, rmSync } = await import("node:fs");
  copyFileSync(videoPath, finalPath);
  rmSync(tmpDir, { recursive: true, force: true });

  const size = statSync(finalPath).size;
  console.log(`  ✅ Saved: ${finalPath} (${Math.round(size / 1024)} KB)`);
  return finalPath;
}

// ══════════════════════════════════════════════════════════════════════════
// TAKE 3: Wizard Sequence
// ══════════════════════════════════════════════════════════════════════════

async function produceTake3Wizard() {
  console.log("\n── Take 3: Wizard Sequence ──────────────────────");

  const browser = await chromium.launch({ headless: true });
  const tmpDir = join(outputDir, "_tmp_wizard");
  await mkdir(tmpDir, { recursive: true });

  // Wizard = LAPTOP-Format (nicht Handy!)
  const context = await createVideoContext(browser, tmpDir, { mobile: false, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Build wizard URL with tenant-specific params
  const htmlPath = resolve("scripts/_ops/screen_templates/sequences/take3_wizard.html");
  const fileUrl = "file:///" + htmlPath.split(sep).join("/");

  const wizCats = (config.wizard.categories || []).filter((c) => !c.fixed);
  const cat1 = wizCats[0] || { value: "Verstopfung", hint: "Abfluss, WC" };
  const cat2 = wizCats[1] || { value: "Leck", hint: "Wasserschaden" };
  const cat3 = wizCats[2] || { value: "Heizung", hint: "Heizung, Wärme" };

  const wizCase = seed.wizard_demo_case || {};
  const iconMap = { Verstopfung: "🚽", Leck: "💧", Heizung: "🔥", Boiler: "♨️", Rohrbruch: "🔧", "Umbau/Sanierung": "🏗️" };

  const wizParams = new URLSearchParams({
    firma: va.company_name || t.name,
    accent: t.brand_color || "#003478",
    cat1: cat1.value, cat1_hint: cat1.hint || "", cat1_icon: iconMap[cat1.value] || "🔧",
    cat2: cat2.value, cat2_hint: cat2.hint || "", cat2_icon: iconMap[cat2.value] || "💧",
    cat3: cat3.value, cat3_hint: cat3.hint || "", cat3_icon: iconMap[cat3.value] || "🔥",
    street: wizCase.stadt ? "Gartenweg" : "Seestrasse",
    house: "8",
    plz: wizCase.plz || (seed.service_area_plz?.[1] || "8810"),
    city: wizCase.stadt || "Horgen",
    name: "Max Muster",
    phone: "+41 79 123 45 67",
    desc: wizCase.beschreibung || "Dachrinne undicht, bei Regen tropft es an der Fassade.",
    clock: getCurrentTime(),
  });

  console.log(`  Firma: ${va.company_name}`);
  console.log(`  Brand Color: ${t.brand_color}`);
  console.log(`  Kategorien: ${cat1.value}, ${cat2.value}, ${cat3.value}`);
  console.log(`  Wizard-Fall: ${wizCase.kategorie} (${wizCase.dringlichkeit})`);
  console.log("  Recording...");

  await page.goto(`${fileUrl}?${wizParams}`, { waitUntil: "domcontentloaded" });

  // Wait for full wizard sequence (~30-35 seconds with typing)
  await page.waitForTimeout(36000);

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  const finalPath = join(outputDir, "take3_wizard.webm");
  const { copyFileSync, rmSync } = await import("node:fs");
  copyFileSync(videoPath, finalPath);
  rmSync(tmpDir, { recursive: true, force: true });

  const size = statSync(finalPath).size;
  console.log(`  ✅ Saved: ${finalPath} (${Math.round(size / 1024)} KB)`);
  return finalPath;
}

// ══════════════════════════════════════════════════════════════════════════
// TAKE 4: Review + FAKE-ENDSCREEN
// ══════════════════════════════════════════════════════════════════════════

async function produceTake4Review() {
  console.log("\n── Take 4: Review + FAKE-ENDSCREEN ──────────────");

  // For Take 4, we need:
  // 1. SMS Reminder (Samsung HTML) — reuse Samsung template approach
  // 2. SMS Review-Link (Samsung HTML)
  // 3. Review Surface (HTML sequence with star animation)
  // 4. FAKE-ENDSCREEN

  // Build a combined Take 4 HTML sequence
  const browser = await chromium.launch({ headless: true });
  const tmpDir = join(outputDir, "_tmp_review");
  await mkdir(tmpDir, { recursive: true });

  const context = await createVideoContext(browser, tmpDir);
  const page = await context.newPage();

  // For now: generate the review surface + FAKE-ENDSCREEN as a simple animated page
  const reviewHtml = buildTake4ReviewHtml();
  const tmpHtmlPath = join(tmpDir, "take4_review.html");
  const { writeFileSync } = await import("node:fs");
  writeFileSync(tmpHtmlPath, reviewHtml);

  const fileUrl = "file:///" + tmpHtmlPath.split(sep).join("/");

  console.log(`  Firma: ${va.company_name}`);
  console.log(`  Brand Color: ${t.brand_color}`);
  console.log(`  Case-Ref: ${t.case_id_prefix}-0088`);
  console.log("  Recording...");

  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(25000); // ~25s for review sequence

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  const finalPath = join(outputDir, "take4_review.webm");
  const { copyFileSync, rmSync } = await import("node:fs");
  copyFileSync(videoPath, finalPath);
  rmSync(tmpDir, { recursive: true, force: true });

  const size = statSync(finalPath).size;
  console.log(`  ✅ Saved: ${finalPath} (${Math.round(size / 1024)} KB)`);
  return finalPath;
}

function buildTake4ReviewHtml() {
  const accent = t.brand_color || "#003478";
  const firma = va.company_name || t.name;
  const caseRef = `${t.case_id_prefix}-0088`;
  const phoneCase = seed.phone_demo_case || {};

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 412px; height: 915px; font-family: -apple-system, 'Roboto', sans-serif; background: #f8fafc; overflow: hidden; }

  .status-bar { height: 36px; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; background: #fff; }

  .screen { display: none; animation: fadeIn 400ms ease-out; }
  .screen.active { display: block; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  /* Review Surface */
  .review-header { background: ${accent}; color: #fff; padding: 24px 20px; text-align: center; }
  .review-header h1 { font-size: 18px; font-weight: 600; }
  .review-header .ref { font-size: 13px; opacity: 0.8; margin-top: 4px; }

  .stars { display: flex; justify-content: center; gap: 8px; padding: 32px 20px; }
  .star { font-size: 48px; color: #d1d5db; cursor: pointer; transition: all 200ms; }
  .star.gold { color: #f59e0b; transform: scale(1.1); }
  .star.animating { animation: starPop 300ms cubic-bezier(0.34, 1.56, 0.64, 1); }
  @keyframes starPop { 0% { transform: scale(0.5); } 50% { transform: scale(1.3); } 100% { transform: scale(1.1); } }

  .chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 20px; justify-content: center; opacity: 0; transition: opacity 400ms; }
  .chips.visible { opacity: 1; }
  .chip { padding: 10px 16px; border-radius: 20px; background: ${accent}15; color: ${accent}; font-size: 13px; font-weight: 500; border: 1px solid ${accent}30; cursor: pointer; transition: all 200ms; }
  .chip.selected { background: ${accent}; color: #fff; }

  .review-cta { margin: 24px 20px; padding: 16px; border-radius: 12px; background: ${accent}; color: #fff; text-align: center; font-size: 15px; font-weight: 600; }

  /* FAKE-ENDSCREEN */
  .endscreen { background: ${accent}; color: #fff; width: 412px; height: 915px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .endscreen .big-check { width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 52px; margin-bottom: 24px; animation: scaleIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1); }
  @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
  .endscreen h2 { font-size: 24px; font-weight: 600; margin-bottom: 12px; }
  .endscreen p { font-size: 15px; opacity: 0.8; }
  .endscreen .firma { font-size: 13px; opacity: 0.6; margin-top: 32px; }
</style>
</head>
<body>

<div class="status-bar"><span>${getCurrentTime()}</span><span>🔋 93%</span></div>

<!-- Review Surface -->
<div class="screen active" id="review-screen">
  <div class="review-header">
    <h1>${firma}</h1>
    <div class="ref">${caseRef} · ${phoneCase.kategorie || "Rohrbruch"} in ${phoneCase.stadt || "Zürich"}</div>
  </div>

  <div class="stars" id="stars">
    <span class="star" data-n="1">★</span>
    <span class="star" data-n="2">★</span>
    <span class="star" data-n="3">★</span>
    <span class="star" data-n="4">★</span>
    <span class="star" data-n="5">★</span>
  </div>

  <div class="chips" id="chips">
    <span class="chip">Schnell & zuverlässig</span>
    <span class="chip">Saubere Arbeit</span>
    <span class="chip">Kompetente Beratung</span>
    <span class="chip">Jederzeit wieder</span>
  </div>

  <div class="review-cta" id="review-cta" style="opacity: 0">Auf Google bewerten →</div>
</div>

<!-- FAKE-ENDSCREEN -->
<div class="screen" id="endscreen">
  <div class="endscreen">
    <div class="big-check">✓</div>
    <h2>Vielen Dank für Ihre Bewertung</h2>
    <p>Ihr Feedback hilft uns, noch besser zu werden.</p>
    <div class="firma">${firma}</div>
  </div>
</div>

<script>
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runSequence() {
  await sleep(2000);

  // Animate stars 1 by 1
  const stars = document.querySelectorAll('.star');
  for (let i = 0; i < 5; i++) {
    stars[i].classList.add('gold', 'animating');
    await sleep(200);
  }
  await sleep(800);

  // Show chips
  document.getElementById('chips').classList.add('visible');
  await sleep(600);

  // Select first 2 chips
  const chips = document.querySelectorAll('.chip');
  chips[0].classList.add('selected');
  await sleep(400);
  chips[3].classList.add('selected');
  await sleep(800);

  // Show CTA
  document.getElementById('review-cta').style.opacity = '1';
  document.getElementById('review-cta').style.transition = 'opacity 400ms';
  await sleep(2000);

  // Transition to FAKE-ENDSCREEN
  document.getElementById('review-screen').classList.remove('active');
  document.getElementById('endscreen').classList.add('active');
  await sleep(5000);
}

window.addEventListener('DOMContentLoaded', () => setTimeout(runSequence, 500));
</script>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(`\n═══ Screenflow Production: ${t.name} (${slug}) ═══`);
  console.log(`Take: ${take}`);
  console.log(`Output: ${outputDir}\n`);

  if (take === "2" || take === "all") {
    await produceTake2Samsung();
    // Leitsystem-Recording: Dedizierte Script mit allen FB-Fixes (push dismiss,
    // nextjs overlay suppress, brand-color body init, KPI clicks, scroll-to-case,
    // case-detail scroll). Wird als Subprocess aufgerufen damit die Playwright-
    // Browser-Instanzen nicht kollidieren.
    const { spawnSync } = await import("node:child_process");
    console.log("\n── Take 2: Leitsystem (via record_leitsystem_take2.mjs) ──");
    const r = spawnSync(process.execPath, [
      "--env-file=src/web/.env.local",
      "scripts/_ops/record_leitsystem_take2.mjs",
      `--slug=${slug}`,
      `--base-url=${APP_URL}`,
    ], { stdio: "inherit" });
    if (r.status !== 0) {
      console.error("  ⚠️ Leitsystem recording failed");
    }
  }

  if (take === "3" || take === "all") {
    await produceTake3Wizard();
  }

  if (take === "4" || take === "all") {
    await produceTake4Review();
  }

  console.log(`\n═══ Screenflow Production Complete ═══\n`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
