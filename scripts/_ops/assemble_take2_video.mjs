#!/usr/bin/env node
/**
 * assemble_take2_video.mjs — Assemble Take 2 video from screenshots + audio + PiP
 *
 * Pipeline:
 *   1. Normalize all screenshots to uniform size (1080x2340)
 *   2. Build screen timeline (still images with exact durations from storyboard)
 *   3. Add call timer overlay during call phase
 *   4. Composite: black bg + phone screen (centered) + PiP circle (top-right corner)
 *   5. Sync audio track
 *   6. Export final MP4
 *
 * Usage:
 *   node scripts/_ops/assemble_take2_video.mjs --slug=doerfler-ag [--call-duration-sec=191]
 *
 * Prerequisites:
 *   - Screenshots in production/screens/{slug}/
 *   - Audio: {take-dir}/playback_take2_complete.wav
 *   - PiP: {take-dir}/PiP_master.mp4
 */

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// ── Args ──────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const idx = a.indexOf("=");
    if (idx === -1) return [a.replace(/^--/, ""), "true"];
    return [a.substring(0, idx).replace(/^--/, ""), a.substring(idx + 1)];
  })
);

const slug = args.slug || "doerfler-ag";
const callDurationSec = parseInt(args["call-duration-sec"] || "191");
const screenDir = args["screen-dir"] || `production/screens/${slug}`;
const takeDir = args["take-dir"] || `docs/customers/${slug}/takes/Scaling/Take2`;
const audioPath = args.audio || path.join(takeDir, "playback_take2_complete.wav");
const pipPath = args.pip || path.join(takeDir, "PiP_master.mp4");
const outDir = args["output-dir"] || `production/video/${slug}`;
const fps = 30;
const keepTmp = args["keep-tmp"] === "true";

// Uniform phone screen size (Samsung S23 native)
const PHONE_W = 1080;
const PHONE_H = 2340;

// Final output — wider than 9:16 to fit phone + PiP side by side
const OUT_W = 1280;
const OUT_H = 1920;

// PiP — top-right, BESIDE phone (zero overlap)
const PIP_DIAMETER = parseInt(args["pip-size"] || "390");
const PIP_OFFSET = parseFloat(args["pip-offset"] || "32.3");
const PIP_RIGHT_MARGIN = 15;
const PIP_PHONE_GAP = 30; // gap between phone right edge and PiP left edge

// Layout: [left margin] [phone] [gap] [pip] [right margin]
// Phone width = OUT_W - PIP_DIAMETER - PIP_RIGHT_MARGIN - PIP_PHONE_GAP - left_margin
const PHONE_LEFT_MARGIN = 30;
const PHONE_MAX_W = OUT_W - PIP_DIAMETER - PIP_RIGHT_MARGIN - PIP_PHONE_GAP - PHONE_LEFT_MARGIN;
const PHONE_TOP_MARGIN = 40;
const PHONE_BOTTOM_MARGIN = 40;
const PHONE_AVAILABLE_H = OUT_H - PHONE_TOP_MARGIN - PHONE_BOTTOM_MARGIN;
const PHONE_SCALE = Math.min(PHONE_AVAILABLE_H / PHONE_H, PHONE_MAX_W / PHONE_W);
const PHONE_RENDER_W = Math.round(PHONE_W * PHONE_SCALE);
const PHONE_RENDER_H = Math.round(PHONE_H * PHONE_SCALE);
const PHONE_X = PHONE_LEFT_MARGIN;
const PHONE_Y = Math.round((OUT_H - PHONE_RENDER_H) / 2);

// PiP: right of phone, top-aligned
const PIP_X = PHONE_X + PHONE_RENDER_W + PIP_PHONE_GAP;
const PIP_Y = PHONE_Y; // flush with phone top

const TOTAL_DURATION = 338.4;

fs.mkdirSync(outDir, { recursive: true });
const tmpDir = path.join(outDir, "_tmp");
fs.mkdirSync(tmpDir, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────
function log(msg) { console.log(`  ${msg}`); }

function ffmpeg(ffArgs, label) {
  log(`${label}...`);
  const cmd = `ffmpeg -y ${ffArgs} 2>/dev/null`;
  const r = spawnSync("bash", ["-c", cmd], {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 600000,
    maxBuffer: 50 * 1024 * 1024,
  });
  if (r.status !== 0) {
    const err = r.stderr?.toString().slice(-300) || "";
    log(`  FAILED: ${err}`);
    return false;
  }
  return true;
}

function probeDuration(file) {
  const p = path.resolve(file).split(path.sep).join("/");
  return parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${p}"`).toString().trim());
}

// ── Find screenshots or pre-rendered transition videos ────────────
function findScreen(prefix) {
  // Transition clips (pre-rendered .mp4 in _transitions dir)
  if (prefix.startsWith("_T")) {
    const transDir = path.join(outDir, "_transitions");
    const mp4 = path.join(transDir, prefix.substring(1) + ".mp4");
    if (fs.existsSync(mp4)) return mp4;
  }
  // Try jpg first (master business), then png (overlay/playwright)
  for (const ext of [".jpg", ".png"]) {
    const p = path.join(screenDir, prefix + ext);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// ── Screen timeline (storyboard-aligned) ──────────────────────────
// Each entry: { file, start, end }
// Times match audio segments from take2_storyboard.md
const CALL_START = 33.0;
const CALL_END = 33.0 + callDurationSec; // ~224s

// Call timing derived from audio:
// - First "tuuut" ring starts at ~35.8s in the audio
// - Lisa answers at ~36.9s
const RING_START = parseFloat(args["ring-start"] || "35.8");
const LISA_ANSWERS = parseFloat(args["lisa-answers"] || "36.9");

// Lisa's first "Hallo" timestamp — fine-tune via --lisa-answers
// "Wird angerufen..." shows until 0.1s before this, timer starts here
const CONTACT_DURATION = 1.4;  // user: "darf 0,3s länger stehen" → 1.4s
const CONTACT_START = 33.8;
const DIALING_START = CONTACT_START + CONTACT_DURATION; // 35.2s
const CONNECTED_START = LISA_ANSWERS - 0.0; // timer starts when Lisa says "Hallo"
const DIALING_END = LISA_ANSWERS - 0.1; // "Wird angerufen..." until 0.1s before Lisa

const timeline = [
  // Phase 1: Homescreen — Founder talks to camera
  { screen: "S01_homescreen",       start: 0.0,    end: CONTACT_START },
  // Contact screen — "Dörfler AG Test" with phone number
  { screen: "S02_kontakt",          start: CONTACT_START, end: DIALING_START },
  // "Wird angerufen..." — ringing, stays until Lisa answers
  { screen: "S03_dialing",          start: DIALING_START, end: DIALING_END },
  // Call connected — LIVE TIMER counts from 00:00
  { screen: "S03_anruf_notimer",    start: DIALING_END, end: CALL_END },
  { screen: "S04_anruf_beendet",    start: CALL_END, end: CALL_END + 2.0 },
  // Phase 2b: Back to homescreen briefly
  { screen: "S01_homescreen",       start: CALL_END + 2.0, end: 227.0 },
  // Phase 3: SMS
  { screen: "S05_sms",              start: 227.0,  end: 252.9 },
  // Phase 3b: Homescreen → App opens
  { screen: "S01_homescreen",       start: 252.9,  end: 255.0 },
  // Phase 4: Leitsystem overview
  { screen: "S06_leitsystem_overview", start: 255.0, end: 271.0 },
  // Phase 5: KPI highlights
  { screen: "S07_kpi_neu",          start: 271.0,  end: 273.0 },
  { screen: "S08_kpi_bei_uns",      start: 273.0,  end: 275.0 },
  { screen: "S09_kpi_erledigt",     start: 275.0,  end: 277.0 },
  { screen: "S10_kpi_bewertung",    start: 277.0,  end: 284.0 },
  // Phase 5b: Table scroll
  { screen: "S11_tabelle",          start: 284.0,  end: 296.0 },
  // Phase 6: Case detail
  { screen: "S12_fall_oben",        start: 296.0,  end: 302.0 },
  { screen: "S13_fall_mitte",       start: 302.0,  end: 310.0 },
  { screen: "S14_fall_unten",       start: 310.0,  end: 320.0 },
  { screen: "S12_fall_oben",        start: 320.0,  end: 322.0 },  // scroll back up
  // Phase 7: Final overview
  { screen: "S15_overview_final",   start: 322.0,  end: TOTAL_DURATION },
];

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  Take 2 Video Assembly                       ║`);
  console.log(`╚══════════════════════════════════════════════╝`);
  console.log(`  Slug:       ${slug}`);
  console.log(`  Screens:    ${screenDir}`);
  console.log(`  Audio:      ${audioPath} (${TOTAL_DURATION}s)`);
  console.log(`  PiP:        ${pipPath}`);
  console.log(`  Output:     ${outDir}`);
  console.log(`  Phone:      ${PHONE_W}x${PHONE_H} → ${PHONE_RENDER_W}x${PHONE_RENDER_H} in ${OUT_W}x${OUT_H}`);
  console.log(`  PiP:        ${PIP_DIAMETER}px circle, offset ${PIP_OFFSET}s, pos (${PIP_X},${PIP_Y})`);
  console.log(`  Call:       ${CALL_START}s → ${CALL_END}s (${callDurationSec}s)\n`);

  // ── Validate ────────────────────────────────────────────────────
  const missingScreens = [];
  const usedScreens = [...new Set(timeline.map(t => t.screen))];
  for (const s of usedScreens) {
    if (!findScreen(s)) missingScreens.push(s);
  }
  if (missingScreens.length > 0) {
    console.error(`  ❌ Missing: ${missingScreens.join(", ")}`);
    process.exit(1);
  }
  if (!fs.existsSync(audioPath)) { console.error(`  ❌ Audio not found: ${audioPath}`); process.exit(1); }
  log(`✓ ${usedScreens.length} unique screenshots found`);
  log(`✓ Audio found (${probeDuration(audioPath).toFixed(1)}s)`);
  const hasPiP = fs.existsSync(pipPath);
  log(hasPiP ? `✓ PiP found (${probeDuration(pipPath).toFixed(1)}s)` : "⚠ No PiP — screen-only mode");

  // ── Step 1: Normalize all screenshots to PHONE_W x PHONE_H ─────
  log("\n── Step 1: Normalize screenshots ──────────────");
  const normDir = path.join(tmpDir, "norm");
  fs.mkdirSync(normDir, { recursive: true });

  for (const s of usedScreens) {
    const src = path.resolve(findScreen(s)).split(path.sep).join("/");
    const dst = path.resolve(normDir, `${s}.png`).split(path.sep).join("/");
    ffmpeg(
      `-i "${src}" -vf "scale=${PHONE_W}:${PHONE_H}:force_original_aspect_ratio=decrease,pad=${PHONE_W}:${PHONE_H}:(ow-iw)/2:(oh-ih)/2:black" -frames:v 1 "${dst}"`,
      `  ${s}`
    );
  }

  // ── Step 2: Build segment clips ─────────────────────────────────
  log("\n── Step 2: Build segment clips ────────────────");
  const segDir = path.join(tmpDir, "segs");
  fs.mkdirSync(segDir, { recursive: true });

  for (let i = 0; i < timeline.length; i++) {
    const t = timeline[i];
    const dur = t.end - t.start;
    const seg = path.resolve(segDir, `seg_${String(i).padStart(2, "0")}.mp4`).split(path.sep).join("/");

    if (t.isTransition) {
      // Pre-rendered transition video — trim to exact duration
      const transFile = path.resolve(findScreen(t.screen)).split(path.sep).join("/");
      ffmpeg(
        `-i "${transFile}" -t ${dur.toFixed(3)} -c:v libx264 -pix_fmt yuv420p -r ${fps} "${seg}"`,
        `  seg${String(i).padStart(2, "0")}: ${t.screen} (${dur.toFixed(1)}s transition)`
      );
    } else {
      // Still image → video segment
      const img = path.resolve(normDir, `${t.screen}.png`).split(path.sep).join("/");
      ffmpeg(
        `-loop 1 -i "${img}" -c:v libx264 -t ${dur.toFixed(3)} -pix_fmt yuv420p -r ${fps} "${seg}"`,
        `  seg${String(i).padStart(2, "0")}: ${t.screen} (${dur.toFixed(1)}s)`
      );
    }
  }

  // ── Step 3: Concat all segments ─────────────────────────────────
  log("\n── Step 3: Concat → screen_raw.mp4 ────────────");
  const concatFile = path.join(tmpDir, "concat.txt");
  const concatLines = timeline.map((_, i) =>
    `file '${path.resolve(segDir, `seg_${String(i).padStart(2, "0")}.mp4`).split(path.sep).join("/")}'`
  ).join("\n");
  fs.writeFileSync(concatFile, concatLines, "utf8");

  const concatFileAbs = path.resolve(concatFile).split(path.sep).join("/");
  const screenRaw = path.resolve(tmpDir, "screen_raw.mp4").split(path.sep).join("/");
  ffmpeg(
    `-f concat -safe 0 -i "${concatFileAbs}" -c:v libx264 -pix_fmt yuv420p "${screenRaw}"`,
    "  Concatenating"
  );

  const rawDur = probeDuration(screenRaw);
  log(`  Duration: ${rawDur.toFixed(1)}s (target: ${TOTAL_DURATION}s, diff: ${Math.abs(rawDur - TOTAL_DURATION).toFixed(1)}s)`);

  // ── Step 3b: Add call timer overlay ────────────────────────────
  log("\n── Step 3b: Call timer overlay ─────────────────");
  // Live timer: counts from 00:00 upward during call-connected phase.
  // Positioned where "00:02" was on the original Samsung call screen.
  // In 1080x2340 coords: centered at ~x=520, y=165, white text ~42px
  const timerFontSize = 42;
  const timerY = 162;
  const screenWithTimer = path.resolve(tmpDir, "screen_timer.mp4").split(path.sep).join("/");

  const timerOk = ffmpeg(
    `-i "${screenRaw}" -vf "` +
      `drawtext=text='%{eif\\:trunc((t-${DIALING_END})/60)\\:d\\:2}\\:%{eif\\:mod(trunc(t-${DIALING_END})\\,60)\\:d\\:2}':` +
      `fontsize=${timerFontSize}:fontcolor=white:` +
      `x=(w/2)-45:y=${timerY}:` +
      `enable='between(t,${DIALING_END},${CALL_END})'` +
    `" -c:v libx264 -pix_fmt yuv420p -r ${fps} "${screenWithTimer}"`,
    "  Adding live timer 00:00→${Math.floor((CALL_END-LISA_ANSWERS)/60)}:${String(Math.floor((CALL_END-LISA_ANSWERS)%60)).padStart(2,'0')}"
  );

  const screenFinal = timerOk ? screenWithTimer : screenRaw;
  if (!timerOk) log("  ⚠ Timer overlay failed — using screen without timer");

  // ── Step 4: Final composition ───────────────────────────────────
  log("\n── Step 4: Compose final video ─────────────────");

  // ── Step 3c: Loudness normalization (-14 LUFS, YouTube/Mobile standard) ──
  log("\n── Step 3c: Loudness normalization ─────────────");
  const audioSrc = path.resolve(audioPath).split(path.sep).join("/");
  const audioLoud = path.resolve(tmpDir, "audio_loud.wav").split(path.sep).join("/");

  // Two-step: 1) loudnorm to -14 LUFS + compress LRA + limit TP
  //           2) Fine-tune if needed
  // Target: -14 LUFS (YouTube/Instagram standard) — comfortable at 50-60% phone volume
  const loudOk = ffmpeg(
    `-i "${audioSrc}" -af "loudnorm=I=-14:TP=-1.5:LRA=11" "${audioLoud}"`,
    "  Normalizing to -14 LUFS (TP -1.5 dB, LRA ~11)"
  );
  const audioAbs = loudOk ? audioLoud : audioSrc;
  if (!loudOk) log("  ⚠ Loudnorm failed — using original audio");
  const screenAbs = screenFinal; // with timer overlay if available
  const finalPath = path.resolve(outDir, "take2_final.mp4").split(path.sep).join("/");

  if (hasPiP) {
    const pipAbs = path.resolve(pipPath).split(path.sep).join("/");
    const R = PIP_DIAMETER / 2;

    // Full composition:
    // [0] black background
    // [1] phone screen video → scale to fit output
    // [2] PiP video (offset by PIP_OFFSET) → circular crop via alphamerge
    // [3] circular alpha mask (white circle on black)
    // [4] audio
    //
    // PiP uses alphamerge (NOT geq on video channels) to preserve natural colors.
    ffmpeg(
      `-f lavfi -i "color=c=black:s=${OUT_W}x${OUT_H}:r=${fps}:d=${TOTAL_DURATION}" ` +
      `-i "${screenAbs}" ` +
      `-ss ${PIP_OFFSET} -i "${pipAbs}" ` +
      `-f lavfi -i "color=c=white:s=${PIP_DIAMETER}x${PIP_DIAMETER}:r=${fps}:d=${TOTAL_DURATION},format=gray,geq=lum='if(lt(pow(X-${R}\\,2)+pow(Y-${R}\\,2)\\,pow(${R}\\,2))\\,255\\,0)'" ` +
      `-i "${audioAbs}" ` +
      `-filter_complex "` +
        `[1:v]scale=${PHONE_RENDER_W}:${PHONE_RENDER_H}[phone];` +
        `[2:v]crop=ih:ih,scale=${PIP_DIAMETER}:${PIP_DIAMETER},format=yuva420p[pip_raw];` +
        `[3:v]format=gray[mask];` +
        `[pip_raw][mask]alphamerge[pip];` +
        `[0:v][phone]overlay=${PHONE_X}:${PHONE_Y}:shortest=1[bg_phone];` +
        `[bg_phone][pip]overlay=${PIP_X}:${PIP_Y}:shortest=1[out]` +
      `" ` +
      `-map "[out]" -map 4:a ` +
      `-c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k ` +
      `-t ${TOTAL_DURATION} -pix_fmt yuv420p ` +
      `"${finalPath}"`,
      "  Compositing (screen + PiP @${PIP_OFFSET}s + audio)"
    );

    if (!fs.existsSync(finalPath)) {
      log("  ⚠ Full compose failed — trying without PiP");
      ffmpeg(
        `-f lavfi -i "color=c=black:s=${OUT_W}x${OUT_H}:r=${fps}:d=${TOTAL_DURATION}" ` +
        `-i "${screenAbs}" -i "${audioAbs}" ` +
        `-filter_complex "[1:v]scale=${PHONE_RENDER_W}:${PHONE_RENDER_H}[phone];` +
          `[0:v][phone]overlay=${PHONE_X}:${PHONE_Y}:shortest=1[out]" ` +
        `-map "[out]" -map 2:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k ` +
        `-t ${TOTAL_DURATION} -pix_fmt yuv420p "${finalPath}"`,
        "  Fallback (screen + audio, no PiP)"
      );
    }
  } else {
    // No PiP: phone screen + audio on black background
    ffmpeg(
      `-f lavfi -i "color=c=black:s=${OUT_W}x${OUT_H}:r=${fps}:d=${TOTAL_DURATION}" ` +
      `-i "${screenAbs}" -i "${audioAbs}" ` +
      `-filter_complex "[1:v]scale=${PHONE_RENDER_W}:${PHONE_RENDER_H}[phone];` +
        `[0:v][phone]overlay=${PHONE_X}:${PHONE_Y}:shortest=1[out]" ` +
      `-map "[out]" -map 2:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k ` +
      `-t ${TOTAL_DURATION} -pix_fmt yuv420p "${finalPath}"`,
      "  Compositing (screen + audio)"
    );
  }

  // ── Step 5: QA ──────────────────────────────────────────────────
  log("\n── Step 5: QA ─────────────────────────────────");

  if (fs.existsSync(finalPath)) {
    const sizeMB = (fs.statSync(finalPath).size / 1024 / 1024).toFixed(1);
    const durOut = probeDuration(finalPath);
    const mm = Math.floor(durOut / 60);
    const ss = Math.floor(durOut % 60);
    const durDiff = Math.abs(durOut - TOTAL_DURATION);

    log(`✓ Output:   ${finalPath}`);
    log(`  Size:     ${sizeMB} MB`);
    log(`  Duration: ${mm}:${String(ss).padStart(2, "0")} (${durOut.toFixed(1)}s)`);
    log(`  Target:   ${Math.floor(TOTAL_DURATION / 60)}:${String(Math.floor(TOTAL_DURATION % 60)).padStart(2, "0")} (${TOTAL_DURATION}s)`);
    log(durDiff < 2 ? `  ✓ Duration OK (±${durDiff.toFixed(1)}s)` : `  ⚠ Duration off by ${durDiff.toFixed(1)}s`);
  } else {
    log("❌ Final video not created");
  }

  // Cleanup
  if (!keepTmp) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    log("  Temp files cleaned");
  } else {
    log(`  Temp kept: ${tmpDir}`);
  }

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  Done                                        ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);
}

main().catch((err) => {
  console.error("\n  ❌ Error:", err.message);
  process.exit(1);
});
