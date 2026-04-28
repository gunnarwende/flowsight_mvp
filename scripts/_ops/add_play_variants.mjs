#!/usr/bin/env node
/**
 * add_play_variants.mjs — Generate 3 play button variants.
 *
 * Usage: node scripts/_ops/add_play_variants.mjs <input.png>
 */

import { createRequire } from "module";
import { resolve, basename, dirname, extname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, "../../src/web/package.json"));
const sharp = require("sharp");

const input = process.argv[2];
if (!input) { console.error("Usage: node add_play_variants.mjs <input.png>"); process.exit(1); }

const inputPath = resolve(input);
const ext = extname(inputPath);
const base = basename(inputPath, ext);
const dir = dirname(inputPath);

const meta = await sharp(inputPath).metadata();
const w = meta.width;
const h = meta.height;

// ── Variant A: Small button bottom-right corner ─────────────────────
{
  const size = Math.round(Math.min(w, h) * 0.15);
  const r = Math.round(size * 0.45);
  const cx = size / 2;
  const cy = size / 2;
  const triL = Math.round(cx - size * 0.10);
  const triT = Math.round(cy - size * 0.18);
  const triB = Math.round(cy + size * 0.18);
  const triR = Math.round(cx + size * 0.18);
  const posX = Math.round(w * 0.72);
  const posY = Math.round(h * 0.72);

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.4"/>
    </linearGradient></defs>
    <rect x="0" y="${Math.round(h * 0.6)}" width="${w}" height="${Math.round(h * 0.4)}" fill="url(#v)"/>
    <g transform="translate(${posX}, ${posY})">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(0,0,0,0.5)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="white" stroke-width="2" opacity="0.8"/>
      <polygon points="${triL},${triT} ${triL},${triB} ${triR},${Math.round(cy)}" fill="white" opacity="0.9"/>
    </g>
    <text x="${posX + cx}" y="${posY + size + Math.round(size * 0.25)}"
          font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(size * 0.2)}"
          font-weight="600" fill="white" text-anchor="middle" opacity="0.9">Video ansehen</text>
  </svg>`;

  const out = resolve(dir, `${base}_A.png`);
  await sharp(inputPath).composite([{ input: Buffer.from(svg) }]).png().toFile(out);
  console.log(`A (small, bottom-right): ${out}`);
}

// ── Variant B: Bottom bar with play icon + text ─────────────────────
{
  const barH = Math.round(h * 0.12);
  const iconSize = Math.round(barH * 0.5);
  const iconX = Math.round(w * 0.35);
  const iconY = Math.round(h - barH / 2);
  const triS = Math.round(iconSize * 0.35);

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <!-- Semi-transparent bottom bar -->
    <rect x="0" y="${h - barH}" width="${w}" height="${barH}" rx="0" fill="rgba(0,0,0,0.55)"/>
    <!-- Play icon -->
    <circle cx="${iconX}" cy="${iconY}" r="${Math.round(iconSize * 0.5)}" fill="none" stroke="white" stroke-width="2" opacity="0.85"/>
    <polygon points="${iconX - triS + 3},${iconY - triS} ${iconX - triS + 3},${iconY + triS} ${iconX + triS + 3},${iconY}" fill="white" opacity="0.9"/>
    <!-- Text -->
    <text x="${iconX + iconSize}" y="${iconY + Math.round(iconSize * 0.12)}"
          font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(barH * 0.28)}"
          font-weight="600" fill="white" opacity="0.95">Video ansehen</text>
  </svg>`;

  const out = resolve(dir, `${base}_B.png`);
  await sharp(inputPath).composite([{ input: Buffer.from(svg) }]).png().toFile(out);
  console.log(`B (bottom bar): ${out}`);
}

// ── Variant C: Centered but smaller + rounded corners frame ─────────
{
  const size = Math.round(Math.min(w, h) * 0.14);
  const r = Math.round(size * 0.45);
  const cx = size / 2;
  const cy = size / 2;
  const triL = Math.round(cx - size * 0.10);
  const triT = Math.round(cy - size * 0.18);
  const triB = Math.round(cy + size * 0.18);
  const triR = Math.round(cx + size * 0.18);
  // Position: center-bottom of image (below face, on shirt)
  const posX = Math.round(w / 2 - cx);
  const posY = Math.round(h * 0.68);

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.3"/>
    </linearGradient></defs>
    <rect x="0" y="${Math.round(h * 0.55)}" width="${w}" height="${Math.round(h * 0.45)}" fill="url(#vg)"/>
    <!-- Thin top border accent -->
    <rect x="0" y="0" width="${w}" height="3" fill="rgba(255,255,255,0.15)"/>
    <rect x="0" y="${h - 3}" width="${w}" height="3" fill="rgba(255,255,255,0.15)"/>
    <g transform="translate(${posX}, ${posY})">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,0.2)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="white" stroke-width="2.5" opacity="0.85"/>
      <polygon points="${triL},${triT} ${triL},${triB} ${triR},${Math.round(cy)}" fill="white" opacity="0.9"/>
    </g>
    <text x="${Math.round(w / 2)}" y="${posY + size + Math.round(size * 0.3)}"
          font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(size * 0.22)}"
          font-weight="500" fill="white" text-anchor="middle" opacity="0.85"
          letter-spacing="1">VIDEO ANSEHEN</text>
  </svg>`;

  const out = resolve(dir, `${base}_C.png`);
  await sharp(inputPath).composite([{ input: Buffer.from(svg) }]).png().toFile(out);
  console.log(`C (small centered, low): ${out}`);
}
