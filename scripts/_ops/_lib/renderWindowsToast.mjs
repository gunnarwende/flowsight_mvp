/**
 * renderWindowsToast — Rastert eine Windows-11-Style Notification-Toast als PNG.
 * Wird in den letzten 2s von Take 4 rechts unten reingeschoben (A18).
 *
 * Dynamisch: reporter + snippet aus tenant_config / demo-seeds.
 */

import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

/** Escape HTML special chars so they render literally. */
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
}

export async function renderWindowsToast({
  outDir,
  tenantName = "Dörfler AG",            // C12: Firma statt flowsight.ch
  initials,                              // Zwei-Buchstaben-Monogramm (optional, sonst aus Name)
  title = "Bewertung erhalten",
  stars = 5,
  reporter = "Gunnar Wende",
  snippet = "Schnell & zuverlässig. Saubere Arbeit.",
  brandGold = "#d4a853",
  brandNavy = "#0b1220",
  width = 440,
  height = 128,
}) {
  const out = join(outDir, `_windows_toast.png`);
  const starStr = "★".repeat(stars);
  const initial = (initials || tenantName.split(/\s+/).map(w => w[0]).join("").slice(0, 2) || "DA").toUpperCase();
  const html = `<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${width}px;height:${height}px;background:transparent;font-family:'Segoe UI Variable','Segoe UI',system-ui,sans-serif;overflow:hidden}
    .toast{
      width:100%;height:100%;
      background:linear-gradient(180deg,#202020 0%,#1a1a1a 100%);
      border-radius:10px;
      border:1px solid rgba(255,255,255,0.08);
      box-shadow:0 10px 28px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35);
      padding:12px 16px;
      color:#fff;
      display:flex;flex-direction:column;gap:4px;
      position:relative;
    }
    .header{display:flex;align-items:center;gap:8px;margin-bottom:2px}
    /* C12: Favicon = kleines gold-navy "DA" Logo, nicht pure gold square */
    .favicon{
      width:16px;height:16px;border-radius:3px;
      background:${brandNavy};
      border:1px solid ${brandGold};
      display:flex;align-items:center;justify-content:center;
      font-size:9px;font-weight:700;color:${brandGold};letter-spacing:-0.3px;
    }
    .header .domain{font-size:12px;color:#cfcfcf;font-weight:500;flex:1}
    .header .more{font-size:16px;color:#8a8a8a;letter-spacing:2px}
    .header .close{font-size:13px;color:#8a8a8a;width:14px;text-align:right}
    .body-row{display:flex;gap:14px;align-items:flex-start}
    /* C12: App-Icon = große Navy-Rounded-Square mit Gold-Monogramm */
    .app-icon{
      width:48px;height:48px;flex-shrink:0;border-radius:10px;
      background:linear-gradient(135deg,${brandNavy} 0%, #1a2744 100%);
      display:flex;align-items:center;justify-content:center;
      border:1.5px solid ${brandGold};
      box-shadow:0 0 0 1px rgba(212,168,83,0.15), 0 4px 10px rgba(0,0,0,0.45);
      font-size:18px;font-weight:800;color:${brandGold};letter-spacing:-0.8px;
    }
    .content{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
    .title-line{font-size:14px;font-weight:600;color:#fff;letter-spacing:-0.1px}
    .title-line .stars{color:${brandGold};margin-left:6px;letter-spacing:1px;font-size:13px}
    .snippet{font-size:13px;color:#e4e4e4;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .footer{font-size:11px;color:#8a8a8a;margin-top:4px}
  </style></head><body>
    <div class="toast">
      <div class="header">
        <span class="favicon">${esc(initial)}</span>
        <span class="domain">${esc(tenantName)}</span>
        <span class="more">…</span>
        <span class="close">✕</span>
      </div>
      <div class="body-row">
        <div class="app-icon">${esc(initial)}</div>
        <div class="content">
          <div class="title-line">${esc(title)}:<span class="stars">${starStr}</span></div>
          <div class="snippet">${esc(reporter)}: ${esc(snippet)}</div>
          <div class="footer">über Microsoft Edge</div>
        </div>
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
    await page.waitForTimeout(200);
    await page.screenshot({ path: out, omitBackground: true, fullPage: false });
    await ctx.close();
  } finally {
    await browser.close();
  }
  return out;
}
