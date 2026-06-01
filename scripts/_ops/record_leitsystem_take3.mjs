#!/usr/bin/env node
/**
 * record_leitsystem_take3.mjs — Desktop Leitsystem recording for Take 3.
 *
 * Shows the new Wizard-Case DA-0050 live in the list, clicks it to open
 * Case-Detail, scrolls through, back to list, click "+ Neuer Fall" modal
 * as demo (Cancel), back to list.
 *
 * Viewport: 1280×720 (Desktop, no Samsung status-bar).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/record_leitsystem_take3.mjs --slug doerfler-ag
 */

import { readFile, mkdir, copyFile, rm, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { createRequire } from "node:module";

// ── V2 DETERMINISTIC event log (T3 pipeline) ──
let _recordingStart = null;
const _events = [];
function pinRecordingStart() { _recordingStart = Date.now(); }
function logEvent(name) {
  if (_recordingStart === null) throw new Error("logEvent called before pinRecordingStart()");
  const recording_t = (Date.now() - _recordingStart) / 1000;
  _events.push({ name, recording_t: Number(recording_t.toFixed(3)) });
  console.log(`  [EVT ${name.padEnd(28)} @ ${recording_t.toFixed(2)}s]`);
}

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1] || "doerfler-ag";
const baseUrl = args.find((a) => a.startsWith("--base-url"))?.split("=")[1] || "http://localhost:3000";

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));
const t = config.tenant;
const caseLabel = config._wizard_case_label || "DA-0050";

console.log(`\n=== Take 3 Leitsystem Recording: ${t.name} (${slug}) ===\n`);
console.log(`  Target case: ${caseLabel}`);

// ── Auth: admin@flowsight.ch OTP ──
const email = "admin@flowsight.ch";
// Parallel-safe OTP (01.06.): eindeutiger Code pro Slug + Delete NUR auf den
// eigenen Code (sonst killen sich parallele Tenant-Runs gegenseitig → 500).
const otpCode = `leit3_${slug}`;
// Root-Fix Parallel-Auth (01.06.): verify-code macht generateLink+verifyOtp für
// DENSELBEN GoTrue-User → gleichzeitige Lanes kollidieren (eine 500). Retry-with-
// backoff+jitter de-synct die Lanes → robust für N parallele Betriebe.
async function getAdminCookies() {
  const MAX = 8;
  for (let attempt = 1; attempt <= MAX; attempt++) {
    await sb.from("otp_codes").delete().eq("email", email).eq("code", otpCode);
    await sb.from("otp_codes").insert({
      email, code: otpCode,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      used: false,
    });
    const resp = await fetch(`${baseUrl}/api/ops/auth/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otpCode }),
    });
    if (resp.status === 200) return resp.headers.getSetCookie() || [];
    if (attempt === MAX) { console.error(`Auth failed after ${MAX} attempts (status ${resp.status})`); process.exit(1); }
    const backoff = 400 * attempt + Math.floor(Math.random() * 600);
    console.warn(`  ⚠ auth contention (status ${resp.status}), retry ${attempt}/${MAX} in ${backoff}ms`);
    await new Promise((r) => setTimeout(r, backoff));
  }
}
const setCookies = await getAdminCookies();
console.log(`  Auth OK, ${setCookies.length} cookies`);

// ── Setup Playwright ──
const outBase = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
const outDir = join(outBase, "_tmp_leit3");
await mkdir(outDir, { recursive: true });

// FB75: Viewport 1440×900 (16:10 Monitor-Aspect). Mit 12 Fällen statt 15
// passt alles rein ohne Scroll, wirkt wie echter Laptop-Screen (nicht mehr
// wie Quader/4:3).
const VIEWPORT = { width: 1440, height: 900 };
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 1,
  recordVideo: { dir: outDir, size: VIEWPORT },
});

// ── Set auth + tenant cookies ──
const cookieDomain = new URL(baseUrl).hostname;
for (const raw of setCookies) {
  const eqIdx = raw.indexOf("=");
  const scIdx = raw.indexOf(";");
  const name = raw.slice(0, eqIdx);
  const value = raw.slice(eqIdx + 1, scIdx > 0 ? scIdx : undefined);
  await context.addCookies([{ name, value, domain: cookieDomain, path: "/", sameSite: "Lax" }]);
}

const { data: targetTenant } = await sb.from("tenants").select("id").eq("slug", slug).single();
if (targetTenant) {
  await context.addCookies([{
    name: "fs_active_tenant",
    value: targetTenant.id,
    domain: cookieDomain,
    path: "/",
    sameSite: "Lax",
  }]);
}

// ── Hide dev overlays + push banner + tenant-switcher (FB62) ──
// CSS mit !important + MutationObserver-Guard. Persistent über navigations.
await context.addInitScript(() => {
  try { localStorage.setItem("ops-push-onboarding-dismissed", Date.now().toString()); } catch {}
  const style = document.createElement("style");
  style.textContent = `
    nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast],
    [class*="nextjs"], [id*="nextjs"], [class*="__next-build"],
    div[style*="position: fixed"][style*="z-index: 9"] {
      display: none !important; visibility: hidden !important; opacity: 0 !important;
    }
    /* FB62: Tenant-Switcher ist Founder-only. In Video-Recordings verbergen. */
    [data-owner-only="tenant-switcher"],
    [data-owner-only="admin-back"] {
      display: none !important;
    }
    /* Dev-Badge unten links "1 issue" */
    button[data-nextjs-toast], div[data-nextjs-toast], [data-nextjs-dev-tools-button] {
      display: none !important;
    }
  `;
  style.id = "fb62-style";
  const inject = () => {
    if (document.getElementById("fb62-style")) return;
    (document.head || document.documentElement).appendChild(style.cloneNode(true));
  };
  inject();
  const guard = setInterval(inject, 80);
  setTimeout(() => clearInterval(guard), 5000);
  const observer = new MutationObserver((ms) => {
    for (const m of ms) for (const n of m.addedNodes) {
      if (n.tagName === "NEXTJS-PORTAL" || n.getAttribute?.("data-nextjs-dialog") !== null) n.remove();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
});

const page = await context.newPage();
// V2 pin: from this moment playwright recordVideo records.
pinRecordingStart();
logEvent("recording_start");

// FB62 + FB72 + FB68 persistent styles + Dev-Badge-Kill.
async function ensureSwitcherHidden() {
  await page.addStyleTag({
    content: `
      [data-owner-only="tenant-switcher"],
      [data-owner-only="admin-back"] { display: none !important; }
      /* FB75: Content etwas mehr Atemluft links+rechts — 48px statt 32px. */
      main.md\\:ml-64 > *:not(.full-bleed) {
        max-width: 1080px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }
      main.md\\:ml-64 {
        padding-left: 48px !important;
        padding-right: 48px !important;
      }
      /* FB68: Next.js Dev-Badges aggressiv unterdrücken. */
      nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast], [data-nextjs-toast-wrapper],
      [class*="nextjs"], [id*="nextjs"], [class*="__next"],
      button[data-nextjs-dev-tools-button], [data-issues-collapsed], [data-issues],
      [aria-label*="issue" i], [aria-label*="Dev Tools" i] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `,
  }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('[data-owner-only="tenant-switcher"],[data-owner-only="admin-back"]').forEach((el) => {
      el.style.display = "none";
    });
    // FB68 badge kill + admin-back persistent removal
    const kill = () => {
      document.querySelectorAll('nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button], [data-issues-collapsed]').forEach((el) => el.remove());
      // V2c-fix: persistent admin-back removal (React re-renders after navigation)
      document.querySelectorAll('[data-owner-only="admin-back"],[data-owner-only="tenant-switcher"]').forEach((el) => el.remove());
      document.querySelectorAll("body > div, body > button").forEach((el) => {
        const s = getComputedStyle(el);
        if (s.position === "fixed" && parseInt(s.bottom) < 50 && parseInt(s.left) < 50 &&
            (el.textContent || "").match(/issue/i)) {
          el.remove();
        }
      });
    };
    kill();
    if (!window.__fb68_killer) window.__fb68_killer = setInterval(kill, 150);
  }).catch(() => {});
}

// FB4 (23.04.): Reveal-Overlay mit length > Content-Load-Zeit.
// Vorher: weißer Flash beim Wizard→Leitsystem-Übergang weil Content noch lud.
// Jetzt: brand_color-Overlay bleibt 1500ms opaque → fadet 500ms → Content stabil.
const brandColorT3 = t.brand_color || "#003478";
await context.addInitScript(`
  document.documentElement.style.background = '${brandColorT3}';
  const styleTag = document.createElement('style');
  styleTag.textContent = 'html,body{background:${brandColorT3} !important;}';
  document.documentElement.appendChild(styleTag);
  const overlay = document.createElement('div');
  overlay.id = 'app-reveal-overlay-t3';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:${brandColorT3};opacity:1;pointer-events:none;transition:opacity 500ms ease-out;';
  document.documentElement.appendChild(overlay);
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 600);
  }, 1500);
`);

// ── C8: Navigate to /ops/cases, show list with new DA-0050 ──
await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "domcontentloaded", timeout: 20000 });
await ensureSwitcherHidden();
logEvent("cases_list_loaded");
await page.waitForTimeout(5000); // Let full page load (skeleton, cards)
logEvent("cases_list_ready");

// Dismiss push banner if still visible
try {
  const laterBtn = page.locator('button:has-text("Später")');
  if (await laterBtn.count() > 0) {
    await laterBtn.first().click();
    await page.waitForTimeout(500);
  }
} catch {}

console.log("  C8: Case-Liste geladen");

// FB62: Tenant-Switcher explizit ausblenden. Versucht primären data-attr
// selector + Fallback: Heuristisch Element mit grünem Status-Dot + Dropdown-Pfeil
// im Sidebar (das einzige das dazu passt ist der TenantSwitcher).
const hiddenCount = await page.evaluate(() => {
  let count = 0;
  // Primary: data attributes (tenant-switcher + admin-back)
  document.querySelectorAll('[data-owner-only="tenant-switcher"],[data-owner-only="admin-back"]').forEach((el) => {
    el.style.display = "none";
    count++;
  });
  // Fallback: Sidebar Button mit svg-dropdown-arrow & tenant-name als Label.
  // Struktur: <div ref> > <button onClick=setOpen> ...<svg>
  // Wir suchen den <button> im Sidebar (md:ml-64 aside) der ein SVG chevron enthält.
  if (count === 0) {
    const sidebar = document.querySelector('aside, nav, [class*="sidebar"]') || document.body;
    const buttons = sidebar.querySelectorAll('button');
    buttons.forEach((btn) => {
      const hasChevron = btn.querySelector('svg path[d*="M19"]') ||
                         btn.querySelector('svg[viewBox*="20"]');
      const text = btn.textContent?.trim() || '';
      // Matches Buttons mit "Dörfler AG" oder ähnlich (Tenant name)
      if (hasChevron && text.length > 0 && text.length < 50 && btn.closest('.relative')) {
        const container = btn.closest('.relative') || btn;
        container.style.display = "none";
        count++;
      }
    });
  }
  return count;
});
console.log(`  FB62: Tenant-Switcher hidden (${hiddenCount} elements)`);

await page.waitForTimeout(3500);

// ── C9: Click DA-0050 row (find by reporter_name "Gunnar Wende" + category "Leck") ──
// More robust: use the case-id label if visible in the row.
let clicked = false;
try {
  // Try clicking the row that contains the case ID (DA-0050)
  const idLocator = page.locator(`a:has-text("${caseLabel}"), tr:has-text("${caseLabel}")`).first();
  if (await idLocator.count() > 0) {
    await idLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await idLocator.click({ force: true });
    clicked = true;
    console.log(`  C9: Click auf ${caseLabel} ✓`);
  }
} catch (e) {
  console.warn(`  Click by label failed: ${e.message}`);
}

if (!clicked) {
  // Fallback: navigate directly via URL
  const caseUuid = config._wizard_case_id;
  if (caseUuid) {
    console.log(`  Fallback: direct navigation to case detail`);
    await page.goto(`${baseUrl}/ops/cases/${caseUuid}`, { waitUntil: "domcontentloaded" });
  } else {
    console.error("  Cannot find DA-0050 in list AND no _wizard_case_id — aborting");
    await context.close(); await browser.close();
    process.exit(1);
  }
}
logEvent("case_opened");

await ensureSwitcherHidden();
await page.waitForTimeout(3500);
logEvent("case_top_dwell_end");

// ── C9 scroll choreography: Übersicht → Beschreibung+Kontakt → Verlauf → back up ──
console.log("  C9: Case-Detail Scroll...");
await page.evaluate(() => window.scrollTo({ top: 250, behavior: "smooth" }));
logEvent("case_scroll_mid_start");
await page.waitForTimeout(3000);
await page.evaluate(() => window.scrollTo({ top: 500, behavior: "smooth" }));
logEvent("case_scroll_bottom_start");
await page.waitForTimeout(3000);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
logEvent("case_scroll_up_start");
await page.waitForTimeout(2000);
logEvent("case_scroll_up_end");

// ── Click Zurück button → C10: Liste wieder ──
try {
  await page.locator('a:has-text("Zurück"), button:has-text("Zurück")').first().click();
  console.log("  C10: Zurück zur Liste ✓");
} catch {
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "domcontentloaded" });
}
logEvent("back_to_list");
await ensureSwitcherHidden();
await page.waitForTimeout(3000);
logEvent("list_visible");

// ── C11: Click "+ Neuer Fall" button → Modal ──
try {
  await page.locator('button:has-text("Neuer Fall"), a:has-text("Neuer Fall")').first().click();
  logEvent("neuer_fall_clicked");
  console.log("  C11: '+ Neuer Fall' Modal geöffnet");
  await page.waitForTimeout(3500); // show modal content

  // ── C12: Click Abbrechen → Modal schliesst ──
  await page.locator('button:has-text("Abbrechen")').first().click({ timeout: 3000 });
  logEvent("abbrechen_clicked");
  console.log("  C12: Modal geschlossen");
  // Apr-30 calibration: dashboard_final phase needs source[63.06-64.07]. With
  // current splice + Apr-30 canonical 42-phase override, leit recording needs
  // ~33s total to cover override's last source-range. V2c was too long, V2d
  // needs final hold ~5s to extend to 33s+.
  await page.waitForTimeout(5000);
} catch (e) {
  console.warn(`  Neuer-Fall Modal step skipped: ${e.message}`);
  await page.waitForTimeout(5000);
}
logEvent("leit_recording_end");

await context.close();
await browser.close();

// ── Find generated .webm ──
const { readdir } = await import("node:fs/promises");
const files = await readdir(outDir);
const webmFile = files.find((f) => f.endsWith(".webm"));
if (!webmFile) {
  console.error("No webm file in", outDir);
  process.exit(1);
}

const finalPath = join(outBase, "take3_leitsystem.webm");
if (existsSync(finalPath)) await rm(finalPath);
await copyFile(join(outDir, webmFile), finalPath);
await rm(outDir, { recursive: true, force: true });

// ── V2 DETERMINISTIC: write event log ──
const eventLogPath = join(outBase, "take3_leit_event_log.json");
await writeFile(eventLogPath, JSON.stringify({
  slug,
  recorder: "leitsystem_take3",
  version: "v2_deterministic",
  generated_at: new Date().toISOString(),
  events: _events,
}, null, 2));
console.log(`  ✓ Event log: ${eventLogPath} (${_events.length} events)`);

const kb = Math.round(statSync(finalPath).size / 1024);
console.log(`\n✅ Saved: ${finalPath} (${kb} KB)\n`);
