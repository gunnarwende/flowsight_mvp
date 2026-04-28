#!/usr/bin/env node
// build_wizard_brand_overlay.mjs
//
// PIPELINE_BIBLE §43 (Single-Source + Brand-Overlay):
// Master Wizard-Recording (Industry-Master, z.B. Dörfler für Sanitär) wird mit
// tenant-spezifischem Brand-Overlay versehen. Output: byte-identische Source-
// Timing über alle Tenants → Phase-Library funktioniert universal.
//
// Was tenant-spezifisch ist im Wizard:
//   - Header-Logo "Dörfler AG" → tenant.firma_display
//   - Brand-Color (Buttons, Step-Indicators, Borders, Footer-Link)
//
// Was generic ist:
//   - Phone "044 505 74 21" — Demo-Default für ALLE Tenants
//   - Wizard-Demo-Daten (Bahnhofstrasse 15, 8942, Oberrieden, Gunnar Wende, ...)
//   - Form-Felder, Buttons, Step-Indicators (Layout)
//
// Usage:
//   node scripts/_ops/build_wizard_brand_overlay.mjs --slug leins-ag --industry sanitaer
//
// Output: docs/gtm/pipeline/06_video_production/screenflows/<slug>/take3_wizard_branded.mp4

import { spawnSync } from "node:child_process";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
function getArg(name) {
  const eqArg = args.find((a) => a.startsWith(`--${name}=`));
  if (eqArg) return eqArg.split("=")[1];
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith("--")) return args[idx + 1];
  return null;
}

const slug = getArg("slug");
const industry = getArg("industry") || "sanitaer";
if (!slug) {
  console.error("usage: --slug <tenant> [--industry sanitaer]");
  process.exit(1);
}

const repoRoot = resolve(".");
const cfgPath = join(repoRoot, "docs", "customers", slug, "tenant_config.json");
if (!existsSync(cfgPath)) {
  console.error(`tenant_config not found: ${cfgPath}`);
  process.exit(1);
}
const cfg = JSON.parse(await readFile(cfgPath, "utf8"));
const t = cfg.tenant || {};
const v = cfg.video || {};

// Brand-Color from tenant_config
const brandColor = t.brand_color || "#1e5f8c";
const tenantDisplayName = v.firma_display || t.name || slug;

// Master Source
const masterPath = join(
  repoRoot,
  "docs/gtm/pipeline/06_video_production/master_takes",
  industry,
  "take3_wizard_master.webm"
);
if (!existsSync(masterPath)) {
  console.error(`Master Wizard not found: ${masterPath}`);
  process.exit(1);
}

// Output
const outDir = join(
  repoRoot,
  "docs/gtm/pipeline/06_video_production/screenflows",
  slug
);
await mkdir(outDir, { recursive: true });
const outPath = join(outDir, "take3_wizard_branded.mp4");

// MASTER-CALIBRATION (gemessen an Dörfler take3_wizard_master.webm bei 1440x900):
// Logo-Position: x≈478, y≈11, Höhe 20px, Breite hängt von Text ab
// Phone-Position: x≈830, y≈12 — STATISCH (gleiche Nummer für alle), KEIN Overlay
//
// Brand-Color-Filter: Master ist Dörfler-Blau (#2b6cb0). Selectivecolor verschiebt
// alle "Dörfler-Blau"-Pixel zur tenant brand_color. Affects:
//   - Header-Logo-Text (auch wenn wir den überschreiben — Selectivecolor-Stage zuerst!)
//   - Step-Indicator-Circle (aktiver Schritt)
//   - "Weiter"-Button background
//   - Selected category card border + highlight
//   - Footer "flowsight.ch" link

// Convert hex to ffmpeg-compatible 0xRRGGBB
function hexToFfmpeg(hex) {
  return "0x" + hex.replace("#", "");
}
const tenantBrandFfmpeg = hexToFfmpeg(brandColor);
const dorflerBrandFfmpeg = "0x2b6cb0";

// Step 1: Brand-Color-Hue-Shift via colorchannelmixer (custom RGB matrix).
// Compute mixer coefficients to shift Dörfler-blue toward tenant-blue.
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
const dorfler = hexToRgb("#2b6cb0");
const tenant = hexToRgb(brandColor);
console.log(`brand color shift: Dörfler #2b6cb0 (RGB ${dorfler.r},${dorfler.g},${dorfler.b}) → ${brandColor} (RGB ${tenant.r},${tenant.g},${tenant.b})`);

// PRAGMATIC: Use selectivecolor on blue range to shift hue+saturation+lightness
// toward tenant brand. Selectivecolor params: hue-shift (degrees), saturation,
// lightness for each color range (R, Y, G, C, B, M).
// Compute deltas in HSL space (rough approximation):
function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}
const dHsl = rgbToHsl(dorfler);
const tHsl = rgbToHsl(tenant);
const hueShift = (tHsl.h - dHsl.h);    // degrees
const satDelta = (tHsl.s - dHsl.s);    // %
const lightDelta = (tHsl.l - dHsl.l);  // %
console.log(`HSL shift: hue ${hueShift.toFixed(1)}°, sat ${satDelta.toFixed(1)}%, light ${lightDelta.toFixed(1)}%`);

// Build ffmpeg filter: hue+selectivecolor for blue range
// Hue filter: shifts ALL hues uniformly → too broad if used directly.
// Better: selectivecolor on cyans+blues+magentas range only.
// For now: use hue() filter for simplicity, then mask via colorkey to limit to blue range.
// Actually simplest: lutyuv or colorize is too aggressive.
//
// Best approach: use colorchannelmixer to selectively shift blues toward tenant.
// Or: use 2 chained filters: keep skin/face untouched, shift only blue regions.

// PROVISORISCH: hue filter with -filter_complex split (apply hue only on blue mask).
// Actually for first iteration, use "selectivecolor" if available, else simple "hue".
// ffmpeg "selectivecolor" filter syntax: r:y:g:c:b:m correction.
// b="cyan magenta yellow black" deltas, range -1.0..1.0.

// Simple Approach: hue=h=<degShift>:s=<satMultiplier>:b=<lightMultiplier> applied on full frame.
// This shifts ALL hues — but since master frame is mostly grayscale (white bg, dark text)
// + only specific brand-color regions, the shift mainly affects brand-color pixels visually.
// Side effects: avatar (skin) might shift slightly but minimal in wizard (no avatar).
const hueDeg = Math.round(hueShift);
const satMult = (tHsl.s / dHsl.s).toFixed(3);
// lightness: hue filter doesn't have lightness param; use eq filter for that
const lightAdjust = ((tHsl.l - dHsl.l) / 100).toFixed(3); // -1..1

// Use repo-local font (avoids Windows drive-letter escape pain in ffmpeg drawtext)
const fontFileFfmpeg = "docs/gtm/pipeline/06_video_production/_assets/fonts/arialbd.ttf";

// Logo-Overlay: white-box maskiert Dörfler AG, dann tenant Logo Text
// Position: x=478, y=11; box w=120, h=22 (deckt "Dörfler AG" ab)
// Tenant text gleiche Position, fontsize=18, brand color
const logoX = 478;
const logoY = 11;
const maskW = 130;
const maskH = 22;
const logoFontsize = 18;

// Footer text replacement (28.04.):
// Master step 3 zeigt "Dörfler AG meldet sich schnellstmöglich." als Footer
// am unteren Bildrand. Position visuell verifiziert per Crop-Inspect:
// "Dörfler AG meldet sich..." bei y≈830, zweite Zeile "Keine Aufzeichnung..."
// bei y≈848 — bleibt unverändert (generisch, nicht tenant-spezifisch).
const footerY = 830;
const footerMaskW = 320;
const footerFontsize = 11;
const footerText = `${tenantDisplayName.replace(/'/g, "\\'")} meldet sich schnellstmöglich.`;
const footerColor = "0x6b7280"; // master uses ~ #6b7280 gray

// Build complete filter chain
// 1. Hue+lightness shift for brand-color (entire frame, safe because mostly grayscale)
// 2. Mask + replace original logo with tenant logo
// 3. Mask + replace original footer text with tenant footer text
const filterChain = [
  // Brand-color hue shift
  `hue=h=${hueDeg}:s=${satMult}`,
  // Mask original logo
  `drawbox=x=${logoX}:y=${logoY - 3}:w=${maskW}:h=${maskH}:color=white@1.0:t=fill`,
  // Draw tenant logo
  `drawtext=fontfile=${fontFileFfmpeg}:text='${tenantDisplayName.replace(/'/g, "\\'")}':x=${logoX}:y=${logoY}:fontsize=${logoFontsize}:fontcolor=${hexToFfmpeg(brandColor)}`,
  // Mask original footer line "Dörfler AG meldet sich..."
  `drawbox=x=${720 - footerMaskW / 2}:y=${footerY - 4}:w=${footerMaskW}:h=18:color=#f9fafb:t=fill`,
  // Draw tenant footer (centered)
  `drawtext=fontfile=${fontFileFfmpeg}:text='${footerText}':x=(w-text_w)/2:y=${footerY}:fontsize=${footerFontsize}:fontcolor=${footerColor}`,
].join(",");

console.log(`\nMaster: ${masterPath}`);
console.log(`Output: ${outPath}`);
console.log(`Tenant: ${tenantDisplayName}`);
console.log(`Brand:  ${brandColor}`);
console.log(`\nfilter chain:\n  ${filterChain.replace(/,/g, ",\n  ")}`);
console.log(`\nrunning ffmpeg...`);

const ffmpegArgs = [
  "-hide_banner",
  "-y",
  "-i", masterPath,
  "-vf", filterChain,
  "-c:v", "libx264",
  "-preset", "veryfast",
  "-crf", "20",
  "-pix_fmt", "yuv420p",
  outPath,
];
const r = spawnSync("ffmpeg", ffmpegArgs, { stdio: "inherit" });
if (r.status !== 0) {
  console.error(`\n✗ ffmpeg failed (exit ${r.status})`);
  process.exit(1);
}
console.log(`\n✓ wrote: ${outPath}`);
