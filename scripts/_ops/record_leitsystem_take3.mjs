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

import { readFile, mkdir, copyFile, rm } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { createRequire } from "node:module";

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
await sb.from("otp_codes").delete().eq("email", email);
await sb.from("otp_codes").insert({
  email, code: "recording3",
  expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  used: false,
});

const authResp = await fetch(`${baseUrl}/api/ops/auth/verify-code`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, code: "recording3" }),
});
if (authResp.status !== 200) {
  console.error("Auth failed:", authResp.status);
  process.exit(1);
}
const setCookies = authResp.headers.getSetCookie() || [];
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
    [data-owner-only="tenant-switcher"] {
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

// FB62 + FB72 + FB68 persistent styles + Dev-Badge-Kill.
async function ensureSwitcherHidden() {
  await page.addStyleTag({
    content: `
      [data-owner-only="tenant-switcher"] { display: none !important; }
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
    document.querySelectorAll('[data-owner-only="tenant-switcher"]').forEach((el) => {
      el.style.display = "none";
    });
    // FB68 badge kill + persistent
    const kill = () => {
      document.querySelectorAll('nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button], [data-issues-collapsed]').forEach((el) => el.remove());
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
await page.waitForTimeout(5000); // Let full page load (skeleton, cards)

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
  // Primary: data attribute
  document.querySelectorAll('[data-owner-only="tenant-switcher"]').forEach((el) => {
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

await ensureSwitcherHidden();
await page.waitForTimeout(3500);

// ── C9 scroll choreography: Übersicht → Beschreibung+Kontakt → Verlauf → back up ──
console.log("  C9: Case-Detail Scroll...");
await page.evaluate(() => window.scrollTo({ top: 250, behavior: "smooth" }));
await page.waitForTimeout(3000);
await page.evaluate(() => window.scrollTo({ top: 500, behavior: "smooth" }));
await page.waitForTimeout(3000);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
await page.waitForTimeout(2000);

// ── Click Zurück button → C10: Liste wieder ──
try {
  await page.locator('a:has-text("Zurück"), button:has-text("Zurück")').first().click();
  console.log("  C10: Zurück zur Liste ✓");
} catch {
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "domcontentloaded" });
}
await ensureSwitcherHidden();
await page.waitForTimeout(3000);

// ── C11: Click "+ Neuer Fall" button → Modal ──
try {
  await page.locator('button:has-text("Neuer Fall"), a:has-text("Neuer Fall")').first().click();
  console.log("  C11: '+ Neuer Fall' Modal geöffnet");
  await page.waitForTimeout(3500); // show modal content

  // ── C12: Click Abbrechen → Modal schliesst ──
  await page.locator('button:has-text("Abbrechen")').first().click({ timeout: 3000 });
  console.log("  C12: Modal geschlossen");
  await page.waitForTimeout(2000);
} catch (e) {
  console.warn(`  Neuer-Fall Modal step skipped: ${e.message}`);
  await page.waitForTimeout(2000);
}

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

const kb = Math.round(statSync(finalPath).size / 1024);
console.log(`\n✅ Saved: ${finalPath} (${kb} KB)\n`);
