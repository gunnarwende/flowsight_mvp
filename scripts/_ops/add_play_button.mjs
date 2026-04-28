#!/usr/bin/env node
/**
 * add_play_button.mjs — Overlay a semi-transparent play button on a photo.
 *
 * Usage:
 *   node scripts/_ops/add_play_button.mjs <input> [output]
 *
 * Output defaults to <input>_play.png
 */

import { createRequire } from "module";
import { resolve, basename, dirname, extname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, "../../src/web/package.json"));
const sharp = require("sharp");

const input = process.argv[2];
if (!input) {
  console.error("Usage: node add_play_button.mjs <input.png> [output.png]");
  process.exit(1);
}

const inputPath = resolve(input);
const ext = extname(inputPath);
const outputPath = process.argv[3]
  ? resolve(process.argv[3])
  : resolve(dirname(inputPath), basename(inputPath, ext) + "_play.png");

// Get image dimensions
const meta = await sharp(inputPath).metadata();
const w = meta.width;
const h = meta.height;

// Play button sizing — circle is ~22% of smaller dimension
const size = Math.round(Math.min(w, h) * 0.22);
const cx = Math.round(size / 2);
const cy = Math.round(size / 2);
const r = Math.round(size * 0.45);

// Triangle (play arrow) — slightly right of center for optical balance
const triLeft = Math.round(cx - size * 0.12);
const triTop = Math.round(cy - size * 0.22);
const triBottom = Math.round(cy + size * 0.22);
const triRight = Math.round(cx + size * 0.22);

// Subtle dark vignette at bottom for contrast
const vignetteH = Math.round(h * 0.35);

const overlaySvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <!-- Subtle bottom gradient for contrast -->
  <defs>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${h - vignetteH}" width="${w}" height="${vignetteH}" fill="url(#vignette)"/>

  <!-- Play button — slightly below center to avoid face -->
  <g transform="translate(${Math.round(w / 2 - cx)}, ${Math.round(h * 0.55 - cy)})">
    <!-- Circle background -->
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(0,0,0,0.45)" />
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="${Math.max(2, Math.round(size * 0.03))}" />
    <!-- Play triangle -->
    <polygon points="${triLeft},${triTop} ${triLeft},${triBottom} ${triRight},${cy}" fill="rgba(255,255,255,0.9)" />
  </g>

  <!-- "Video ansehen" label below circle -->
  <text x="${Math.round(w / 2)}" y="${Math.round(h * 0.55 + size * 0.7)}"
        font-family="system-ui, -apple-system, 'Segoe UI', sans-serif"
        font-size="${Math.round(size * 0.18)}"
        font-weight="600"
        fill="white"
        text-anchor="middle"
        opacity="0.9"
        letter-spacing="0.5">Video ansehen</text>
</svg>`;

await sharp(inputPath)
  .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
  .png({ quality: 95 })
  .toFile(outputPath);

console.log(`Done: ${outputPath}`);
