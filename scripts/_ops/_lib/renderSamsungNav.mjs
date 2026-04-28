/**
 * renderSamsungNav — Rastert die Samsung-Bottom-Nav (3 Navigations-Ikons) als PNG.
 * Identisch zum Bottom-Nav in take2_samsung.html → konsistenter Look auf allen
 * Take-4-Mobile-Szenen (Phone1, Phone2, Review).
 */

import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

export async function ensureSamsungNav({ outDir, width = 412, height = 56 }) {
  const out = join(outDir, `_samsung_nav_${width}x${height}.png`);
  if (existsSync(out)) return out;

  // C10: Samsung Android 3-Button-Nav authentisch (Recent-Square, Home-Circle, Back-Triangle).
  // Größer + dicker damit high-end aussieht.
  const html = `<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${width}px;height:${height}px;background:#fff;overflow:hidden;font-family:'Segoe UI',Roboto,system-ui,sans-serif}
    .nav{display:flex;justify-content:space-around;align-items:center;height:100%;border-top:1px solid #e8eaed}
    .icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:#1a1a1a}
    svg{display:block}
  </style></head><body>
    <div class="nav">
      <!-- Recent (left): square outline -->
      <span class="icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="1"/>
        </svg>
      </span>
      <!-- Home (center): filled circle -->
      <span class="icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
          <circle cx="12" cy="12" r="8"/>
        </svg>
      </span>
      <!-- Back (right): triangle pointing left -->
      <span class="icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 5 L8 12 L15 19 Z"/>
        </svg>
      </span>
    </div>
  </body></html>`;

  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.setContent(html);
    await page.waitForTimeout(200);
    await page.screenshot({ path: out, omitBackground: false, fullPage: false });
    await ctx.close();
  } finally {
    await browser.close();
  }
  return out;
}
