/**
 * shared_assets.mjs — S2 Global Asset-Cache.
 *
 * Assets die für ALLE Tenants identisch sind (bezel, masks, samsung-nav,
 * content-mask, sidebar-profile, review-status-bar) werden EINMAL in
 * `_shared/` generiert und pro Tenant referenziert. Keine Regeneration pro
 * Tenant → Skalierung auf 10/Tag ohne I/O-Overhead.
 *
 * Tenant-spezifisch bleiben:
 *   - windows_toast (Tenant-Name)
 *   - alle Recordings
 */

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { ensureCircleMask } from "./renderLoomCircle.mjs";
import { renderPhoneBezel, ensureContentMask } from "./renderPhoneBezel.mjs";
import { ensureSamsungNav } from "./renderSamsungNav.mjs";
import { renderSidebarProfile } from "./renderSidebarProfile.mjs";
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const SHARED_DIR = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", "_shared");

/** Erstellt _shared/ und gibt Pfad zurück. */
export async function ensureSharedDir() {
  await mkdir(SHARED_DIR, { recursive: true });
  return SHARED_DIR;
}

/**
 * Ensure all shared assets exist. Returns dict {name: path} für alle shared Assets.
 * Idempotent — bereits gecachte Dateien werden nicht neu generiert.
 */
export async function ensureAllSharedAssets() {
  await ensureSharedDir();

  // Phone Bezel (SVG-gerastert, tenant-agnostisch)
  const bezelPath = await renderPhoneBezel({ outDir: SHARED_DIR, width: 340, height: 730 });

  // Content Mask (Innere Bezel-Rundung für Phone-Content)
  const contentMaskPath = await ensureContentMask({
    outDir: SHARED_DIR, width: 320, height: 712, radius: 46,
  });

  // Circle Masks (Loom/Face diameters)
  const { circleMaskPng: circle170 } = ensureCircleMask({ outDir: SHARED_DIR, diameter: 170 });
  const { circleMaskPng: circle200 } = ensureCircleMask({ outDir: SHARED_DIR, diameter: 200 });
  const { circleMaskPng: circle260 } = ensureCircleMask({ outDir: SHARED_DIR, diameter: 260 });
  const { circleMaskPng: circle300 } = ensureCircleMask({ outDir: SHARED_DIR, diameter: 300 });

  // Samsung Bottom Nav (statisches 3-Button-Layout)
  const samsungNavPath = await ensureSamsungNav({ outDir: SHARED_DIR });

  // Sidebar Admin Profile (Admin + gunnar.wende@flowsight.ch — generic für alle)
  const profilePath = await renderSidebarProfile({
    outDir: SHARED_DIR,
    adminName: "Admin",
    adminEmail: "gunnar.wende@flowsight.ch",
    initial: "A",
  });

  // Review Status Bar — Zeit ist demo_time review_rated (10:32 oder 08:12 je demo_time)
  const statusBarReviewPath = await ensureStatusBarAt(SHARED_DIR, "08:12");

  return {
    bezelPath,
    contentMaskPath,
    circleMask170: circle170,
    circleMask200: circle200,
    circleMask260: circle260,
    circleMask300: circle300,
    samsungNavPath,
    profilePath,
    statusBarReviewPath,
    sharedDir: SHARED_DIR,
  };
}

/** Status-Bar für Review-Scene im selben Style wie take2_samsung.html. */
async function ensureStatusBarAt(outDir, timeLabel) {
  const out = join(outDir, `_status_bar_review_${timeLabel.replace(":", "")}.png`);
  if (existsSync(out)) return out;

  const html = `<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:412px;height:36px;background:#fff;font-family:'Segoe UI',Roboto,system-ui,sans-serif;overflow:hidden}
    .status-bar{display:flex;align-items:center;justify-content:space-between;height:100%;padding:0 38px;color:#1a1a1a;font-size:13px;font-weight:500}
    .status-right{display:flex;align-items:center;gap:6px}
    .status-right svg{display:block}
    .battery{background:#2a2a2a;color:#fff;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;display:inline-flex;align-items:center;gap:2px;}
    .battery svg{flex-shrink:0}
  </style></head><body>
    <div class="status-bar">
      <span>${timeLabel}</span>
      <div class="status-right">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a1a1a" opacity="0.9"><path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/></svg>
        <svg width="15" height="12" viewBox="0 0 24 20" fill="#1a1a1a"><path d="M12 3C7.5 3 3.4 4.8 0 7.4l12 15 12-15C20.6 4.8 16.5 3 12 3z"/></svg>
        <svg width="14" height="12" viewBox="0 0 24 18" fill="#1a1a1a"><rect x="1" y="12" width="3" height="5"/><rect x="6" y="8" width="3" height="9"/><rect x="11" y="4" width="3" height="13"/><rect x="16" y="0" width="3" height="17"/></svg>
        <span class="battery"><svg width="7" height="10" viewBox="0 0 24 24" fill="#22c55e"><path d="M7 2v11h3v9l7-12h-4l3-8z"/></svg>71</span>
      </div>
    </div>
  </body></html>`;
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 36 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(html);
    await page.waitForTimeout(150);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 412, height: 36 } });
    await ctx.close();
  } finally {
    await browser.close();
  }
  return out;
}
