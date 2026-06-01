#!/usr/bin/env node
/**
 * build_v26_dashboard_animation.mjs
 *
 * Layers onto V25 base:
 *  - Homescreen extension 257.80-258.20 (covers V25 fade-out + extends)
 *  - App-open animation  258.20-258.43 (native Samsung zoom from icon center)
 *  - Mai dashboard       258.40-340    (1-frame overlap with animation end)
 *  - Mai case-detail     345-365
 *  - Mai dashboard2      365-378
 *
 * Variant offset for preis: -3.5s.
 *
 * Phone region in 1440x900 canvas: (387,31) size 376x838, content mask r46 source 320x712.
 *
 * Usage:
 *   node scripts/_ops/build_v26_dashboard_animation.mjs --slug doerfler-ag --variant notruf --base v25
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const arg = (n) => args.find(a => a.startsWith(`--${n}=`))?.split("=")[1] ?? (args.indexOf(`--${n}`) >= 0 ? args[args.indexOf(`--${n}`)+1] : null);

const slug = arg("slug") || "doerfler-ag";
const variant = arg("variant") || "notruf";
const baseTag = arg("base") || "v25";
const outTag = arg("out-tag") || "v26";

const variantOffset = variant === "preis" ? -3.5 : 0;

// Time markers (with variant offset)
// V104d (29.05): HS_START pushed back to cover full phone_homescreen_post_sms
// phase (~30s). Without this, V25 base shows wrong freeze-anchor content
// (sharpness gate picks app_open_animation frame instead of clean homescreen),
// causing visible "frozen old animation" from 3:45 to 4:14.
// Schedule values (canonical):
//   Notruf phone_homescreen_post_sms: 3:48,3-4:18,5 (228.30-258.43)
//   Preis  phone_homescreen_post_sms: 3:44,8-4:15,0 (224.80-254.93)
// Compute HS_START from DASH_START so variant-offset auto-applies.
const HS_END     = 258.43 + variantOffset;  // homescreen visible throughout animation
const HS_START   = HS_END - 30.13;  // covers full phone_homescreen_post_sms phase
// V104g (29.05): SMS thread overlay covers phone_sms_thread phase (11s).
// V25 base freeze on phase_sms_thread captures wrong content (post-SMS homescreen
// instead of SMS thread). SMS PNG overlay forces correct visual during 3:37-3:48.
const SMS_END   = HS_START;          // SMS ends where homescreen extension begins
const SMS_START = SMS_END - 11.0;    // 11s SMS thread duration from schedule
// V104h (29.05): Late-bridge overlay forces dashboard return at EXACT canvas time
// regardless of leitsystem recording variance (±3s observed). Bridge PNG composite
// (samsung status bar + leitsystem dashboard) shown from RETURN_START to end of
// video. Founder spec: dashboard returns at 6:01.5 (Notruf). Preis with -3.5s
// variant offset = 5:58.0.
const RETURN_START = 361.5 + variantOffset;  // Notruf 361.5, Preis 358.0
const ANIM_START = 258.20 + variantOffset;
const ANIM_END   = 258.43 + variantOffset;  // 0.23s native Samsung zoom duration
const DASH_START = 258.43 + variantOffset;
const DASH_FULL_END = 380.50 + variantOffset;  // extend to end of V25 to prevent April data visible in last 2s
const DASH_END   = DASH_FULL_END;  // single 120s window covers entire dashboard/case-detail/return
// CD/DASH2 overlays no longer needed — recording includes them inline with Apr-30 timing
const CD_START   = DASH_FULL_END;
const CD_END     = DASH_FULL_END;
const DASH2_START = DASH_FULL_END;
const DASH2_END   = DASH_FULL_END;

const PIPE = "docs/gtm/pipeline/06_video_production";
const v25 = `${PIPE}/_generated/previews/${slug}/take2_${variant}_FINAL_${baseTag}.mp4`;
const leit = `${PIPE}/screenflows/${slug}/take2_leitsystem.webm`;
const appOpen = `C:/tmp/v26/zoom_anim_${slug}/frame_%02d.png`;  // Mai-data zoom PNG sequence (alpha-preserving)
const homescreen = `C:/tmp/v26/homescreen_${slug}.png`;  // per-tenant (war shared homescreen_mai.png → Race bei Parallel)
const maiDashFrame = `C:/tmp/v26/mai_dashboard_${slug}.png`;  // Mai dashboard initial state per tenant
const mask = `${PIPE}/screenflows/${slug}/_content_mask_320x712_r46.png`;
const statusBar = `${PIPE}/screenflows/${slug}/status_bar.png`;
// V104: Bridge-Dashboard PNG (extracted from fresh leitsystem.webm at t=8 by build_take2_final)
const bridgePng = `${PIPE}/screenflows/${slug}/_stable_dashboard.png`;
// V104g (29.05): SMS thread PNG for SMS phase overlay (analog to HS overlay).
const smsPng = `${PIPE}/screenflows/${slug}/_sms_thread.png`;
// FB66/FB68 (28.05): Use DEFAULT bezel PNG (no shadow color variant). Brand-
// color shadow caused light-colored wing pixels extending below the phone
// bezel curve (anti-aliased drop-shadow halo). Default bezel has tighter,
// fully-opaque alpha at the curves matching master video's rendering.
const bezelDir = `${PIPE}/screenflows/${slug}`;
const bezelFg = `${bezelDir}/_phone_bezel_340x730.png`;
const out = `${PIPE}/_generated/previews/${slug}/take2_${variant}_FINAL_${outTag}.mp4`;

for (const p of [v25, leit, homescreen, mask, maiDashFrame, statusBar, bezelFg, bridgePng, smsPng]) {
  if (!existsSync(p)) { console.error(`✗ missing: ${p}`); process.exit(2); }
}
console.log(`  bezelFg: ${bezelFg}`);
console.log(`  bridge:  ${bridgePng}`);

const HS_DUR    = (HS_END - HS_START).toFixed(3);
const SMS_DUR   = (SMS_END - SMS_START).toFixed(3);
const RETURN_DUR = (DASH_FULL_END - RETURN_START).toFixed(3);  // V104h: covers 6:01.5 to end
const ANIM_DUR  = (ANIM_END - ANIM_START).toFixed(3);
const DASH_DUR  = (DASH_END - DASH_START).toFixed(3);
const CD_DUR    = (CD_END - CD_START).toFixed(3);
const DASH2_DUR = (DASH2_END - DASH2_START).toFixed(3);

// Phone region constants
const PX = 387, PY = 31, PW = 376, PH = 838;

const filter = [
  // FB-Ecken (28.05): Mask split 4-way — dashboard + dashboard2 also get rounded-
  // corner mask, otherwise rectangular overlay leaves dark crescents at bezel's
  // bottom-rx=46 cutout whenever dashboard has white background (post-filter
  // states with sparse case list).
  `[5:v]format=gray,scale=320:712[mask_src]`,
  `[mask_src]split=4[m1][m2][m5][m6]`,

  // [1] Homescreen extension: PNG → scale 320x712 → mask → scale 376x838
  `[1:v]scale=320:712,setsar=1,format=yuva420p,fps=30[hs_raw]`,
  `[hs_raw][m1]alphamerge[hs_a]`,
  `[hs_a]scale=${PW}:${PH},setsar=1,trim=duration=${HS_DUR},setpts=PTS-STARTPTS+${HS_START}/TB[hs_ovl]`,

  // [2] App-open animation: Mai-zoom PNG sequence with native alpha (no alphamerge — preserves transparent padding)
  `[2:v]format=rgba,scale=320:712,setsar=1[ao_a]`,
  `[ao_a]scale=${PW}:${PH},setsar=1,trim=duration=${ANIM_DUR},setpts=PTS-STARTPTS+${ANIM_START}/TB[ao_ovl]`,

  // V104j: db_ovl + cd_ovl + db2_ovl filters REMOVED — V25 base + bridge + return overlays sufficient.

  // [4] Case-detail (own banner — full overlay with mask) — V104j: cd_ovl filter removed since CD_DUR=0.

  // V102: Bezel-FG restored (V99-style). 408x868 oversized at (371,16) to
  // cover mask anti-alias edges.
  `[7:v]scale=408:868,setsar=1,format=yuva420p,setpts=PTS-STARTPTS+${DASH_START}/TB,trim=duration=${DASH_DUR}[bz_fg]`,

  // V104c (29.05): Bridge-Dashboard PNG covers full phone area for the 3.07s
  // window during which V25 base still shows samsung app_open_animation content
  // in top 79px (status bar + header region). db_ovl only covers lower part
  // (PY+79+); without long bridge, samsung clock 08:04 + samsung status bar are
  // visible in upper section of phone until V25 catches up to leitsystem source
  // at canvas DASH_START + 3.07s. Bridge PNG (extracted at -ss 15 = same start as
  // live leitsystem stream) is pixel-identical to live state → no visible jump.
  // V104i (29.05): Apply rounded-corner mask to bridge — without it, rectangular
  // bridge PNG corners overhang V25-base's r46 rounded screen interior. User
  // reports "weisse Ecken" at 4:20 vs clean V25-base at 4:23.
  `[8:v]scale=320:712,setsar=1,format=yuva420p[bridge_raw]`,
  `[bridge_raw][m5]alphamerge[bridge_a]`,
  `[bridge_a]scale=${PW}:${PH},setsar=1,setpts=PTS-STARTPTS+${DASH_START}/TB,trim=duration=3.1[bridge_ovl]`,
  // V104h (29.05): RETURN bridge overlay — same composite as bridge but active
  // from canvas RETURN_START to DASH_FULL_END. Forces dashboard visible at
  // EXACT 6:01.5 (Notruf) / 5:58 (Preis) regardless of leitsystem timing.
  // V104i: Same mask treatment as bridge_ovl to prevent corner overhang.
  `[10:v]scale=320:712,setsar=1,format=yuva420p[return_raw]`,
  `[return_raw][m6]alphamerge[return_a]`,
  `[return_a]scale=${PW}:${PH},setsar=1,setpts=PTS-STARTPTS+${RETURN_START}/TB,trim=duration=${RETURN_DUR}[return_ovl]`,

  // V104g (29.05): SMS thread overlay covers V25 base wrong freeze during
  // phone_sms_thread phase (canvas SMS_START to SMS_END = 11s). Forces user
  // to see actual SMS thread content with today's date + 08:08 timestamp.
  `[9:v]scale=320:712,setsar=1,format=yuva420p[sms_raw]`,
  `[sms_raw][m2]alphamerge[sms_a]`,
  `[sms_a]scale=${PW}:${PH},setsar=1,trim=duration=${SMS_DUR},setpts=PTS-STARTPTS+${SMS_START}/TB[sms_ovl]`,

  // V104j (29.05): db_ovl REMOVED from overlay chain. V25 base now uses fresh
  // phase library override (auto-regenerated from event log per build), so all
  // in-app phases (KPI markers, scrolling, case-detail) align deterministically
  // to schedule canvas times. db_ovl was a static live-stream overlay ignoring
  // phase mapping → caused KPI drift visible at canvas 277-286.
  `[0:v][sms_ovl]overlay=${PX}:${PY}:eof_action=pass[v0a]`,
  `[v0a][hs_ovl]overlay=${PX}:${PY}:eof_action=pass[v1]`,
  `[v1][bridge_ovl]overlay=${PX}:${PY}:eof_action=pass[v1b]`,
  `[v1b][ao_ovl]overlay=${PX}:${PY}:eof_action=pass[v3]`,
  `[v3][return_ovl]overlay=${PX}:${PY}:eof_action=pass[v5r]`,
  `[v5r][bz_fg]overlay=371:16:eof_action=pass[vout]`,
].join(";");

console.log(`Building V26: ${slug} ${variant}`);
console.log(`  base: ${v25}`);
console.log(`  out:  ${out}`);
console.log(`  HS:   ${HS_START.toFixed(3)}-${HS_END.toFixed(3)} (${HS_DUR}s)`);
console.log(`  ANIM: ${ANIM_START.toFixed(3)}-${ANIM_END.toFixed(3)} (${ANIM_DUR}s)`);
console.log(`  DASH: ${DASH_START.toFixed(3)}-${DASH_END.toFixed(3)} (${DASH_DUR}s)`);
console.log(`  CD:   ${CD_START.toFixed(3)}-${CD_END.toFixed(3)} (${CD_DUR}s)`);
console.log(`  DASH2: ${DASH2_START.toFixed(3)}-${DASH2_END.toFixed(3)} (${DASH2_DUR}s)`);

const r = spawnSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-i", v25,
  "-loop", "1", "-t", HS_DUR, "-i", homescreen,
  "-framerate", "30", "-i", appOpen,
  "-ss", "15", "-t", DASH_DUR, "-i", leit,
  "-ss", "15", "-t", "0.1", "-i", leit,
  "-loop", "1", "-i", mask,
  "-ss", "5", "-t", DASH2_DUR, "-i", leit,
  "-loop", "1", "-t", DASH_DUR, "-i", bezelFg,    // [7] FB66 bezel foreground
  "-loop", "1", "-t", "3.2", "-i", bridgePng,     // [8] V104c bridge dashboard (extended 0.4→3.2s)
  "-loop", "1", "-t", SMS_DUR, "-i", smsPng,      // [9] V104g SMS thread overlay
  "-loop", "1", "-t", RETURN_DUR, "-i", bridgePng, // [10] V104h late-bridge for deterministic 6:01.5 return
  "-filter_complex", filter,
  "-map", "[vout]", "-map", "0:a",
  "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
  "-c:a", "copy", "-movflags", "+faststart",
  out,
], { stdio: "inherit" });

if (r.status !== 0) { console.error("✗ build failed"); process.exit(1); }

const probe = spawnSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1", out]);
const dur = parseFloat(probe.stdout.toString().trim());
console.log(`\n✓ V26: ${out}  ${dur.toFixed(2)}s`);
