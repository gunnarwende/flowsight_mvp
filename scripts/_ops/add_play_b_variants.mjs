#!/usr/bin/env node
/**
 * add_play_b_variants.mjs — Two high-end bottom bar variants.
 *
 * Usage: node scripts/_ops/add_play_b_variants.mjs <input.png>
 */

import { createRequire } from "module";
import { resolve, basename, dirname, extname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, "../../src/web/package.json"));
const sharp = require("sharp");

const input = process.argv[2];
if (!input) { console.error("Usage: node add_play_b_variants.mjs <input.png>"); process.exit(1); }

const inputPath = resolve(input);
const ext = extname(inputPath);
const base = basename(inputPath, ext);
const dir = dirname(inputPath);

const meta = await sharp(inputPath).metadata();
const w = meta.width;
const h = meta.height;

// ── B1: Frosted glass bar + refined play icon with glow ─────────────
{
  const barH = Math.round(h * 0.11);
  const barY = h - barH;
  const iconR = Math.round(barH * 0.28);
  const iconCx = Math.round(w * 0.38);
  const iconCy = Math.round(barY + barH / 2);
  // Equilateral-ish triangle, optically centered (shifted right ~15%)
  const triH = Math.round(iconR * 0.9);
  const triW = Math.round(triH * 0.85);
  const triLeft = Math.round(iconCx - triW * 0.35);
  const triRight = triLeft + triW;
  const triTop = iconCy - Math.round(triH / 2);
  const triBottom = iconCy + Math.round(triH / 2);
  const fontSize = Math.round(barH * 0.26);

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradient fade into bar -->
    <linearGradient id="barFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.6"/>
    </linearGradient>
    <!-- Subtle glow behind play circle -->
    <radialGradient id="glow">
      <stop offset="0%" stop-color="white" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Gradient fade zone above bar -->
  <rect x="0" y="${barY - Math.round(barH * 0.8)}" width="${w}" height="${Math.round(barH * 0.8)}" fill="url(#barFade)" opacity="0.5"/>

  <!-- Dark glass bar -->
  <rect x="0" y="${barY}" width="${w}" height="${barH}" fill="rgba(8,15,30,0.65)"/>

  <!-- Glow behind icon -->
  <circle cx="${iconCx}" cy="${iconCy}" r="${iconR * 2}" fill="url(#glow)"/>

  <!-- Play circle — thin white ring -->
  <circle cx="${iconCx}" cy="${iconCy}" r="${iconR}" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/>

  <!-- Play triangle — clean, sharp -->
  <polygon points="${triLeft},${triTop} ${triLeft},${triBottom} ${triRight},${iconCy}" fill="white" opacity="0.92"/>

  <!-- Text -->
  <text x="${iconCx + iconR + Math.round(iconR * 0.6)}" y="${iconCy + Math.round(fontSize * 0.35)}"
        font-family="'SF Pro Display', 'Segoe UI', system-ui, sans-serif"
        font-size="${fontSize}" font-weight="500" fill="white" opacity="0.92"
        letter-spacing="0.3">Video ansehen</text>
</svg>`;

  const out = resolve(dir, `${base}_B1.png`);
  await sharp(inputPath).composite([{ input: Buffer.from(svg) }]).png().toFile(out);
  console.log(`B1 (frosted glass + glow): ${out}`);
}

// ── B2: Minimal pill button centered in bar ─────────────────────────
{
  const barH = Math.round(h * 0.10);
  const barY = h - barH;

  const pillW = Math.round(w * 0.48);
  const pillH = Math.round(barH * 0.58);
  const pillX = Math.round((w - pillW) / 2);
  const pillY = Math.round(barY + (barH - pillH) / 2);
  const pillR = Math.round(pillH / 2);

  // Small play triangle inside pill
  const triSize = Math.round(pillH * 0.28);
  const triCx = Math.round(pillX + pillW * 0.32);
  const triCy = Math.round(pillY + pillH / 2);
  const triLeft = triCx - Math.round(triSize * 0.35);
  const triRight = triCx + Math.round(triSize * 0.55);
  const triTop = triCy - triSize;
  const triBottom = triCy + triSize;

  const fontSize = Math.round(pillH * 0.42);
  const textX = Math.round(triRight + pillH * 0.3);
  const textY = Math.round(pillY + pillH / 2 + fontSize * 0.35);

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bf2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </linearGradient>
  </defs>

  <!-- Gradient fade -->
  <rect x="0" y="${barY - Math.round(barH * 1.2)}" width="${w}" height="${Math.round(barH * 1.2)}" fill="url(#bf2)" opacity="0.6"/>

  <!-- Dark bar -->
  <rect x="0" y="${barY}" width="${w}" height="${barH}" fill="rgba(8,15,30,0.6)"/>

  <!-- Pill button -->
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillR}" ry="${pillR}"
        fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>

  <!-- Play triangle in pill -->
  <polygon points="${triLeft},${triTop} ${triLeft},${triBottom} ${triRight},${triCy}" fill="white" opacity="0.9"/>

  <!-- Text in pill -->
  <text x="${textX}" y="${textY}"
        font-family="'SF Pro Display', 'Segoe UI', system-ui, sans-serif"
        font-size="${fontSize}" font-weight="500" fill="white" opacity="0.92"
        letter-spacing="0.5">Video ansehen</text>
</svg>`;

  const out = resolve(dir, `${base}_B2.png`);
  await sharp(inputPath).composite([{ input: Buffer.from(svg) }]).png().toFile(out);
  console.log(`B2 (pill button): ${out}`);
}
