#!/usr/bin/env node
/**
 * apply_toast_overlay.mjs
 *
 * Adds the "Bewertung erhalten" toast notification (slide-in @ master 92.7-93.0s,
 * stays until ~99.0s) onto the master video.
 *
 * Spec: take4_master_spec.json TOAST_review_received
 *   - Position: bottom-right (x=980, y=750, 460×80)
 *   - Slide-in: 0.3s ease-out from-right
 *   - Visible: master 92.7s to 99.0s (then iris overrides)
 *
 * Implementation:
 *   1. Render toast HTML via Playwright → 1440×900 transparent PNG
 *   2. Overlay onto master with slide-in animation via ffmpeg
 *
 * Usage:
 *   node scripts/_ops/apply_toast_overlay.mjs --slug <slug>
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "../../src/web/node_modules/playwright/index.mjs";

const args = process.argv.slice(2);
const argVal = (f, def) => { const i = args.indexOf(f); return i >= 0 && i+1 < args.length ? args[i+1] : def; };
const slug = argVal("--slug");
if (!slug) { console.error("usage: --slug <slug>"); process.exit(1); }

const PIPE = "docs/gtm/pipeline/06_video_production";
const masterMp4 = join(PIPE, "master_takes", "take4", `${slug}_with_mouse.mp4`);
if (!existsSync(masterMp4)) {
  // Fallback to anchor before mouse
  const anchor = join(PIPE, "_generated", "previews", slug, "take4_anchor.mp4");
  if (!existsSync(anchor)) { console.error(`✗ missing master + anchor for ${slug}`); process.exit(2); }
}

// Tenant data for toast content (dynamic, betriebsspezifisch per FB29)
const configPath = join("docs", "customers", slug, "tenant_config.json");
const tenantConfig = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf-8")) : {};
const tenantName = tenantConfig?.tenant?.name || slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
// FB29 (31.05. PM): case_id_prefix = official 2-letter tenant code (DA, LN, SH, ...).
// Used in DB-IDs (DA-0050) and sidebar avatar — toast logo MUSS denselben Prefix
// zeigen damit der Betrieb sich wiedererkennt. Falls fehlt: erste 2 Buchstaben Firmenname.
const tenantInitials = (tenantConfig?.tenant?.case_id_prefix ||
                         tenantName.replace(/\s+(AG|GmbH|KG|SA)$/i, "").slice(0, 2)).toUpperCase();
const customerName = tenantConfig._review_customer || "Gunnar Wende";
const tags = tenantConfig._review_tags || "Schnell & zuverlässig. Saubere Arbeit.";
const brandNavy = tenantConfig?.tenant?.brand_color || "#0b1220";
const brandGold = tenantConfig?.tenant?.gold_color || "#d4a853";

const tmpDir = join(PIPE, "screenflows", slug, "_tmp_toast");
mkdirSync(tmpDir, { recursive: true });

// 1. Render Windows-11-Style notification toast (440×128 PNG, transparent).
// FB29 (31.05. PM): dunkler Toast mit "{Tenant} AG" Header + "DA" Logo + "über Microsoft Edge"
// Footer — windows-native style, betriebsspezifisch (tenantName + initials + brand colors).
const { renderWindowsToast } = await import("./_lib/renderWindowsToast.mjs");
const toastPng = await renderWindowsToast({
  outDir: tmpDir,
  tenantName,
  initials: tenantInitials,  // FB29: case_id_prefix → toast-logo (DA / LN / SH)
  title: "Bewertung erhalten",
  stars: 5,
  reporter: customerName,
  snippet: tags.endsWith(".") ? tags : tags + ".",
  brandNavy,
  brandGold,
  width: 440,
  height: 128,
});
console.log(`✓ Windows-style toast 440×128 rendered for ${tenantName} (${tenantInitials})`);

// 2. Determine input video — prefer the latest (with_mouse if exists, else anchor)
const input = existsSync(masterMp4) ? masterMp4 : join(PIPE, "_generated", "previews", slug, "take4_anchor.mp4");
const outPath = input.replace(/\.mp4$/, "_with_toast.mp4");

// Toast animation params (spec):
const T_IN_START = 92.7;
const T_IN_END = 93.0;
const T_FADE_OUT_START = 96.5;  // FB13 (31.05.): fade-out before iris
const T_FADE_OUT_DUR = 0.5;
const T_OUT = T_FADE_OUT_START + T_FADE_OUT_DUR;
const TOAST_FINAL_X = 980;  // CSS position in 1440-wide canvas (right: 24px puts container at right edge → toast width 440 → x = 1440-440-24 = 976)
const CANVAS_W = 1440;

// Slide-in expression: x slides from CANVAS_W to TOAST_FINAL_X over T_IN_START..T_IN_END
// ease-out sqrt: x(t) = CANVAS_W - (CANVAS_W - TOAST_FINAL_X) * sqrt((t - T_IN_START) / (T_IN_END - T_IN_START))
const slideX = `if(lt(t,${T_IN_START}),${CANVAS_W},if(gt(t,${T_IN_END}),${TOAST_FINAL_X},${CANVAS_W}-(${CANVAS_W}-${TOAST_FINAL_X})*sqrt((t-${T_IN_START})/${T_IN_END - T_IN_START})))`;

console.log(`\nOverlay toast on video (slide-in ${T_IN_START}-${T_IN_END}s, visible until ${T_OUT}s)...`);
console.log(`  Input:  ${input}`);
console.log(`  Output: ${outPath}`);

// Dev-Badge-Cover ENTKOPPELT (01.06.2026): War hier gebacken, aber der
// Mouse-Layer lief danach und überschrieb den Cover. Cover ist jetzt eigener
// allerletzter Schritt in `apply_devbadge_cover.mjs` (NACH Mouse-Layer + Toast).
// Dieses Script macht NUR noch den Toast.
const r = spawnSync("ffmpeg", [
  "-hide_banner","-loglevel","error","-y",
  "-i", input,
  "-i", toastPng,
  "-filter_complex",
  // FB13 (31.05.): Toast mit slide-in + fade-out animation.
  `[1:v]format=rgba,fade=t=out:st=${T_FADE_OUT_START}:d=${T_FADE_OUT_DUR}:alpha=1[toast];` +
  // 31.05. PM: Toast PNG ist 440×128, positioniert via ffmpeg overlay statt 1440×900 canvas.
  // Slide-in: x von 1440 (off-screen-right) → 980 (final, 20px right margin). y=750 (toast bottom @ y=878).
  `[0:v][toast]overlay=x='if(lt(t,${T_IN_START}),1440,if(gt(t,${T_IN_END}),${TOAST_FINAL_X},1440-(1440-${TOAST_FINAL_X})*sqrt((t-${T_IN_START})/${T_IN_END - T_IN_START})))':y=750:enable='between(t,${T_IN_START},${T_OUT})'[v]`,
  "-map","[v]","-map","0:a?",
  "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
  "-c:a","copy",
  outPath,
], { stdio: "inherit" });
if (r.status !== 0) { console.error("✗ ffmpeg toast overlay failed"); process.exit(r.status); }

// Replace original
const { copyFileSync } = await import("node:fs");
copyFileSync(outPath, input);
rmSync(outPath);
rmSync(tmpDir, { recursive: true, force: true });

console.log(`\n✓ Toast applied to ${input}`);
