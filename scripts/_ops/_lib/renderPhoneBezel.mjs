/**
 * renderPhoneBezel — Generates phone bezel PNG from phone_bezel.html
 * (340×730 with transparent cutout in middle for content overlay).
 *
 * Cached per outDir. Returns path.
 */

import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * FB10 (23.04.): `shadowColor` (Hex) erlaubt brand_color-farbigen Drop-Shadow
 * damit die Bezel-Ecken-Ausstrahlung mit dem Leitsystem-BG verschmilzt statt
 * als schwarze Aura auf blauem BG zu stechen. Default bleibt #000 (Backward-Compat).
 * Cache-Key enthält Farbe damit verschiedene Tenants getrennte PNGs bekommen.
 */
export async function renderPhoneBezel({ outDir, width = 340, height = 730, shadowColor = "#000" }) {
  const tag = shadowColor === "#000" ? "" : `_sh${shadowColor.replace("#", "")}`;
  const out = join(outDir, `_phone_bezel_${width}x${height}${tag}.png`);
  if (existsSync(out)) return out;

  const htmlPath = join("scripts", "_ops", "screen_templates", "sequences", "phone_bezel.html");
  let html = await readFile(htmlPath, "utf-8");
  // Inject shadow color override — replaces the hardcoded flood-color in phone_bezel.html.
  if (shadowColor && shadowColor !== "#000") {
    html = html.replace('flood-color="#000"', `flood-color="${shadowColor}"`);
  }
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.setContent(html);
    await page.waitForTimeout(400);
    await page.screenshot({ path: out, omitBackground: true, fullPage: false });
    await ctx.close();
  } finally {
    await browser.close();
  }
  return out;
}

/**
 * ensurePhonePlatter — C29: Solid dark rounded-rect PNG als Backstop HINTER
 * dem Phone-Bezel, damit Leitsystem-Hintergrund nicht durch die transparenten
 * Bezel-Außenecken durchleuchtet.
 *
 * Platter ist etwas grösser als Bezel (z.B. 356×746) und etwas mehr gerundet,
 * deckt damit die feinen Eck-Ausfransungen ab.
 */
export async function ensurePhonePlatter({ outDir, width = 356, height = 746, radius = 52, color = "#070a12" }) {
  const out = join(outDir, `_phone_platter_${width}x${height}.png`);
  if (existsSync(out)) return out;

  const html = `<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0}
    html,body{background:transparent;width:${width}px;height:${height}px;overflow:hidden}
  </style></head><body>
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="${color}"/>
    </svg>
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

/**
 * ensureContentMask — Generates a rounded-rect alpha mask PNG used in FFmpeg
 * alphamerge to clip Samsung/Leit content to the bezel's inner rounded shape.
 *
 * Produces a grayscale PNG where WHITE = visible (inside rounded rect),
 * BLACK = transparent (outside the rounded corners). Used with alphamerge.
 *
 * Defaults 320×712 rx=40 to match phone_bezel.html inner cutout.
 */
export async function ensureContentMask({ outDir, width = 320, height = 712, radius = 40 }) {
  const out = join(outDir, `_content_mask_${width}x${height}_r${radius}.png`);
  if (existsSync(out)) return out;

  const html = `<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0}
    html,body{background:#000;width:${width}px;height:${height}px;overflow:hidden}
    svg{display:block}
  </style></head><body>
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#ffffff"/>
  </svg>
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
