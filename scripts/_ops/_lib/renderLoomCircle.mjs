/**
 * renderLoomCircle — Builds a circle-cropped loom PiP WebM with alpha channel.
 *
 * Approach:
 *   1. Generate a circle alpha-mask PNG once per diameter (cached).
 *   2. Overlay filter: scale loom → alphamerge with mask → VP9 webm.
 *
 * Usage:
 *   const { circleMaskPng } = await ensureCircleMask({ outDir, diameter: 200 });
 *   // In FFmpeg pipeline: -stream_loop -1 -i source.mp4 -i circleMaskPng ...
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Ensure a circle alpha-mask PNG exists at `<outDir>/_mask_circle_<d>.png`.
 * The mask is 255 (opaque) inside circle, 0 (transparent) outside.
 */
export function ensureCircleMask({ outDir, diameter = 200, border = 3 }) {
  const out = join(outDir, `_mask_circle_${diameter}.png`);
  if (existsSync(out)) return { circleMaskPng: out };

  const r = diameter / 2 - border;
  // Generate a pure grayscale mask: white inside circle (255), black outside (0).
  // FFmpeg alphamerge uses the 2nd input's luma as alpha → this is exactly what we need.
  const filter =
    `geq=lum='if(lt(sqrt((X-${diameter / 2})^2+(Y-${diameter / 2})^2),${r}),255,0)',format=gray`;

  const rr = spawnSync("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", `color=c=black:s=${diameter}x${diameter}:d=0.1`,
    "-vf", filter,
    "-frames:v", "1",
    out,
  ], { stdio: "pipe" });

  if (rr.status !== 0) {
    console.warn("ensureCircleMask failed:", rr.stderr?.toString().slice(-400));
    return { circleMaskPng: null };
  }
  return { circleMaskPng: out };
}

/**
 * Build the filter chain fragment that takes a loom video input + mask input
 * and outputs a circle-cropped stream with alpha.
 *
 * Usage pattern in ffmpeg pipeline:
 *   Inputs (order matters):
 *     [base] base video
 *     [1:v] loom video
 *     [2:v] mask png
 *
 *   buildCircleLoomFilter({ loomIdx: 1, maskIdx: 2, diameter: 200, label: "loomcirc" })
 *   returns: "[1:v]scale=200:200,setsar=1[loomsq];
 *             [loomsq][2:v]alphamerge[loomcirc]"
 *
 *   Then overlay with: [base][loomcirc]overlay=x:y
 */
export function buildCircleLoomFilter({ loomIdx = 1, maskIdx = 2, diameter = 200, label = "loomcirc" }) {
  return (
    `[${loomIdx}:v]scale=${diameter}:${diameter}:force_original_aspect_ratio=increase,` +
    `crop=${diameter}:${diameter},setsar=1[loomsq];` +
    `[loomsq][${maskIdx}:v]alphamerge[${label}]`
  );
}
