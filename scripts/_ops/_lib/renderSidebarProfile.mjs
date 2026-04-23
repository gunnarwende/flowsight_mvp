/**
 * renderSidebarProfile — C26/C28: High-end Admin-Profil-Overlay.
 * 220×140 PNG mit vollständiger E-Mail, besserem Abmelden-Icon, etwas mehr
 * zentrierter Position (nicht mehr links "hingeknallt").
 */

import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
}

export async function renderSidebarProfile({
  outDir,
  adminName = "Admin",
  adminEmail = "gunnar.wende@flowsight.ch",
  initial = "A",
  width = 240,
  height = 140,
}) {
  const out = join(outDir, `_sidebar_profile_${width}x${height}.png`);
  if (existsSync(out)) return out;

  const html = `<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${width}px;height:${height}px;background:transparent;font-family:'Inter','Segoe UI',system-ui,sans-serif;color:#e5e7eb;overflow:hidden;-webkit-font-smoothing:antialiased}
    .wrap{padding:14px 16px;display:flex;flex-direction:column;gap:14px;height:100%}
    .row{display:flex;align-items:center;gap:12px}
    .avatar{
      width:36px;height:36px;border-radius:50%;
      background:linear-gradient(135deg,#3b82f6,#1d4ed8);
      display:flex;align-items:center;justify-content:center;
      font-size:15px;font-weight:600;color:#fff;flex-shrink:0;
      box-shadow:0 1px 3px rgba(0,0,0,0.4);
    }
    .info{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}
    .name{font-size:14px;font-weight:600;color:#f9fafb;line-height:1.2;letter-spacing:-0.1px}
    .email{font-size:10px;color:#9ca3af;line-height:1.3;white-space:nowrap;overflow:visible;font-weight:400;letter-spacing:0}
    .logout{
      display:flex;align-items:center;gap:10px;
      font-size:13px;color:#d1d5db;cursor:default;font-weight:500;
      padding-left:2px;
    }
    .logout-icon{
      width:18px;height:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
    }
    .logout svg{display:block}
  </style></head><body>
    <div class="wrap">
      <div class="row">
        <div class="avatar">${esc(initial)}</div>
        <div class="info">
          <div class="name">${esc(adminName)}</div>
          <div class="email">${esc(adminEmail)}</div>
        </div>
      </div>
      <div class="logout">
        <span class="logout-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </span>
        <span>Abmelden</span>
      </div>
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
    await page.waitForTimeout(250);
    await page.screenshot({ path: out, omitBackground: true, fullPage: false });
    await ctx.close();
  } finally {
    await browser.close();
  }
  return out;
}
