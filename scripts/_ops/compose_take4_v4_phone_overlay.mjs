#!/usr/bin/env node
/**
 * compose_take4_v4_phone_overlay.mjs
 *
 * Spec-aligned compose: phone-PiP wird als Overlay über Leitsystem-Hintergrund composited,
 * NICHT mehr fullscreen gestretched. Spec take4_master_spec.json.
 *
 * Architektur:
 *   - Segment A (0-29.0s):    Part 1 Leit, offset-trimmed
 *   - Segment B (29-35.5s):   Background = freeze last-frame of Part 1 + Phone overlay (Part 3)
 *                              with slide-in animation 28.5-29.0s
 *   - Segment C (35.5-67.0s): Part 4 Leit, offset-trimmed
 *   - Segment D (67-85.0s):   Background = freeze last-frame of Part 4 + Phone overlay
 *                              (Part 5+6 concat) with slide-in animation 66.5-67.0s
 *   - Segment E (85-176.9s):  Part 7 Closing (or freeze last-frame Part 4 + Loom takeover later)
 *
 * Phone-Position (per Spec): x=380, y=30, 330x440px
 *
 * Usage:
 *   node scripts/_ops/compose_take4_v4_phone_overlay.mjs --slug <slug>
 *
 * Output:
 *   docs/.../screenflows/<slug>/take4_complete.mp4 (überschreibt v3-Output)
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
// 31.05. PM: Take 2 Phone-Quality-Pattern (renderPhoneBezel + platter + content-mask R=46).
// Ersetzt eigene qg26/bezel.png — Founder GB19/FB20: schwarze Eck-Winkel + zu nahe Status-Bar.
const bezelHelper = await import("./_lib/renderPhoneBezel.mjs");

const args = process.argv.slice(2);
const argVal = (f, def) => {
  const a = args.find(x => x.startsWith(`${f}=`))?.split("=")[1];
  if (a !== undefined) return a;
  const i = args.indexOf(f); if (i >= 0) return args[i + 1];
  return def;
};
const slug = argVal("--slug");
if (!slug) { console.error("usage: --slug <slug>"); process.exit(1); }

const PIPE = "docs/gtm/pipeline/06_video_production";
const sfDir = join(PIPE, "screenflows", slug);
const logPath = join(sfDir, "take4_event_log.json");
const outPath = join(sfDir, "take4_complete.mp4");
const tmpDir = join(sfDir, "_tmp_v4");
mkdirSync(tmpDir, { recursive: true });

if (!existsSync(logPath)) { console.error(`✗ missing event log: ${logPath}`); process.exit(2); }
const log = JSON.parse(readFileSync(logPath, "utf-8"));
const offsets = log.part_webm_offsets || {};

// ── T4 Stern/Maus-Sync (02.06.): Timing-Determinismus NICHT hier ───────────
// Der Stern-Fill-Zeitpunkt der per-Tenant-Live-Aufnahme jittert (recordVideo-Latenz) und
// ist über compose-Trim/Anker nicht sauber/skalierbar zu fixen (mehrfach probiert). Gelöst
// wird er deterministisch im FINALEN Schritt: apply_canonical_stars.mjs legt die farb-
// neutrale Stern-Innenregion von Stark (Gold-Referenz) im fixen Fenster über den Master.
// offset[6] bleibt daher der Event-Log-Wert (Part 6 wie gehabt platziert).

const parts = {
  1: join(sfDir, "take4_01_akt1.webm"),
  3: join(sfDir, "take4_03_phone_day1.webm"),
  4: join(sfDir, "take4_04_akt2.webm"),
  5: join(sfDir, "take4_05_phone_day2.webm"),
  6: join(sfDir, "take4_06_review.webm"),
  7: join(sfDir, "take4_07_closing.webm"),
};

for (const [k, f] of Object.entries(parts)) {
  if (!existsSync(f)) { console.error(`✗ missing part ${k}: ${f}`); process.exit(3); }
}

// Spec phase ranges (master_t):
// Phone-Slide-In Animation happens during 0.5s BEFORE official Phone-IN time per Spec.
// So Phone segments include 0.5s pre-slide-in time → phone is in position EXACTLY at spec slide-in-end time.
const PHONE_SLIDE_IN_DUR = 0.5;
const SEG_A_END = 28.5;    // Part 1 leit ends 0.5s before phone-day-1 official IN
const SEG_B_START = 28.5;  // Phone Day 1 segment starts (with slide-in)
const SEG_B_END = 35.5;    // Phone Day 1 ends
const SEG_C_END = 66.5;    // Part 4 leit ends 0.5s before phone-day-2 official IN
const SEG_D_START = 66.5;  // Phone Day 2 segment starts (with slide-in)
const SEG_D_END = 85.0;    // Phone Day 2 ends
const SEG_E_END = 176.9;   // Total
// REF Apr-30 PIXEL-MEASURED via measure_phone_bezel.mjs (30.05.):
// dark-pixel-bezel boundaries: x=760, y=90, 340×730
const PHONE_X = 760, PHONE_Y = 90, PHONE_W = 340, PHONE_H = 730;
// Phone-content gets clipped to 320×712 (rounded R=46), padded 10/9 inside bezel 340×730.
// Same architecture as Take 2 (pipeline_screenflow.mjs). Bezel + platter rendered via
// renderPhoneBezel helpers — guarantees clean rounded outer corners + no bg-bleed.
const CONTENT_W = 320, CONTENT_H = 712, CONTENT_R = 46;
const CONTENT_PAD_X = 10, CONTENT_PAD_Y = 9;  // (340-320)/2 = 10, (730-712)/2 = 9
const CANVAS_W = 1440, CANVAS_H = 900;

// Segment durations
const segA_dur = SEG_A_END - 0.0;        // 29.0s
const segB_dur = SEG_B_END - SEG_B_START; // 6.5s
const segC_dur = SEG_C_END - SEG_B_END;   // 31.5s
const segD_dur = SEG_D_END - SEG_D_START; // 18.0s
const segE_dur = SEG_E_END - SEG_D_END;   // 91.9s

console.log(`\n╔═══════════════════════════════════════════╗`);
console.log(`║  compose_take4_v4 (Phone-Overlay)         ║`);
console.log(`║  ${slug.padEnd(40)} ║`);
console.log(`╚═══════════════════════════════════════════╝\n`);
console.log(`Segments:`);
console.log(`  A (Leit-Akt1):  0   -  29.0s  (29.0s)`);
console.log(`  B (Phone-Day1): 29.0- 35.5s  ( 6.5s) — bg = freeze P1-last + Phone overlay`);
console.log(`  C (Leit-Akt2):  35.5- 67.0s  (31.5s)`);
console.log(`  D (Phone-Day2): 67.0- 85.0s  (18.0s) — bg = freeze P4-last + Phone overlay (P5+P6)`);
console.log(`  E (Closing):    85.0-176.9s  (91.9s)`);
console.log(``);

// Generate phone assets — Founder FB22/FB23 (31.05. PM):
// - shadowColor = white (#ffffff) → bezel-bbox-corner-pixels blenden mit leitsystem-bg (mostly white)
// - KEIN platter mehr — war Quelle der grauen Halo da R=52 die phone-bbox-corners NICHT abdeckte
//   (Math: D=8 offset benötigt R≤27, R=52 erzeugt Halo). Bezel-shadow ersetzt platter-funktion.
const PHONE_BEZEL_PNG = await bezelHelper.renderPhoneBezel({ outDir: tmpDir, shadowColor: "#ffffff" });
const PHONE_MASK_PNG = await bezelHelper.ensureContentMask({
  outDir: tmpDir, width: CONTENT_W, height: CONTENT_H, radius: CONTENT_R,
});
console.log(`Phone assets:`);
console.log(`  bezel (white shadow): ${PHONE_BEZEL_PNG}`);
console.log(`  mask:                 ${PHONE_MASK_PNG}\n`);

function run(cmd, argv, label) {
  console.log(`  $ ${label || cmd}`);
  const r = spawnSync(cmd, argv, { stdio: "inherit" });
  if (r.status !== 0) { console.error(`✗ failed: ${label}`); process.exit(r.status || 1); }
}

// ── SEGMENT A: Part 1 leit, trimmed by offset, padded to exact dur ──
const probeP1 = spawnSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0", parts[1]]);
const part1EffDur = parseFloat(probeP1.stdout.toString().trim()) - (offsets[1] || 0);
const segAPad = Math.max(0, segA_dur - part1EffDur + 0.3);
const segA = join(tmpDir, "seg_a.mp4");
console.log(`[A] Leit-Akt1 (P1 effective ${part1EffDur.toFixed(2)}s, need ${segA_dur}s, tpad +${segAPad.toFixed(2)}s) → ${segA}`);
run("ffmpeg", [
  "-hide_banner","-loglevel","error","-y",
  "-ss", String(offsets[1] || 0),
  "-i", parts[1],
  "-vf", `fps=30,scale=${CANVAS_W}:${CANVAS_H}:force_original_aspect_ratio=decrease,pad=${CANVAS_W}:${CANVAS_H}:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1,tpad=stop_mode=clone:stop_duration=${segAPad.toFixed(3)}`,
  "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
  "-t", String(segA_dur),
  segA,
], "Segment A render (padded)");

// ── Helper: extract last frame of a segment as PNG ──
function extractLastFrame(srcMp4, outPng) {
  // Get duration first
  const probe = spawnSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0", srcMp4]);
  const dur = parseFloat(probe.stdout.toString().trim());
  // Seek to dur-0.1 to get last visible frame
  spawnSync("ffmpeg", [
    "-hide_banner","-loglevel","error","-y",
    "-ss", String(Math.max(0, dur - 0.1)),
    "-i", srcMp4,
    "-frames:v","1",
    outPng,
  ], { stdio: "inherit" });
}

// ── SEGMENT B: Phone Day-1 overlay ──
// 1. Background = last meaningful frame of Part 1 webm (M09 "Termin versendet ✓" state).
//    NOT segA's last frame because segA boundary may cut Part 1 before M09 confirmation appears.
const bgB = join(tmpDir, "bg_b.png");
extractLastFrame(parts[1], bgB);

// 2. Compose: loop bgB for 6.5s + overlay Part 3 phone at PHONE_X, PHONE_Y
//    Phone slide-in animation: x goes from CANVAS_W (off-right) to PHONE_X over 0.5s (ease-out)
const segB = join(tmpDir, "seg_b.mp4");
console.log(`[B] Phone-Day1 overlay → ${segB}`);
// Ease-out cubic: x(t) = PHONE_X + (CANVAS_W - PHONE_X) * (1 - t)^3 for t in [0,1]
// Simplified linear ease-out approximation: x(t) = CANVAS_W - (CANVAS_W - PHONE_X) * (t / 0.5)
// For t > 0.5: x = PHONE_X (rest position)
// In ffmpeg expressions: x = if(lt(t, 0.5), CANVAS_W - (CANVAS_W - PHONE_X) * pow(t/0.5, 0.5), PHONE_X)
// pow(t/0.5, 0.5) = sqrt(t/0.5) for ease-out feel
const slideInX = `if(lt(t,${PHONE_SLIDE_IN_DUR}),${CANVAS_W}-(${CANVAS_W}-${PHONE_X})*sqrt(t/${PHONE_SLIDE_IN_DUR}),${PHONE_X})`;
// Take 2 pattern (31.05. PM): platter (Backstop) → phone-content clipped (320×712 R=46)
// → padded to bezel-frame (340×730) → bezel overlay. Phone-bbox-position als ganzes
// per slideInX animated. Platter is shifted same as phone.
run("ffmpeg", [
  "-hide_banner","-loglevel","error","-y",
  // Input 0: background loop
  "-loop","1","-t",String(segB_dur),"-i", bgB,
  // Input 1: phone day 1 webm, trimmed at offset
  "-ss", String(offsets[3] || 0), "-t", String(segB_dur),
  "-i", parts[3],
  // Input 2: phone bezel PNG (renderPhoneBezel with white shadow → bbox-corners blend with white leitsystem-bg)
  "-loop","1","-t",String(segB_dur),"-i", PHONE_BEZEL_PNG,
  // Input 3: content-mask (rounded R=46)
  "-loop","1","-t",String(segB_dur),"-i", PHONE_MASK_PNG,
  "-filter_complex",
  // BG
  `[0:v]fps=30,scale=${CANVAS_W}:${CANVAS_H},setsar=1[bg];` +
  // Phone content: scale to 320×712 → alphamerge with content-mask R=46 → pad to 340×730 (transparent)
  `[1:v]fps=30,scale=${CONTENT_W}:${CONTENT_H},setsar=1,format=yuva420p[phraw];` +
  `[3:v]format=gray,scale=${CONTENT_W}:${CONTENT_H}[cmask];` +
  `[phraw][cmask]alphamerge[phclip];` +
  `[phclip]pad=${PHONE_W}:${PHONE_H}:${CONTENT_PAD_X}:${CONTENT_PAD_Y}:color=black@0[phpad];` +
  `[2:v]fps=30,scale=${PHONE_W}:${PHONE_H},setsar=1,format=rgba[bezel];` +
  // No platter — bezel's white-shadow handles bbox-corner-blend
  `[bg][phpad]overlay=x='${slideInX}':y=${PHONE_Y}:eof_action=pass[bgp];` +
  `[bgp][bezel]overlay=x='${slideInX}':y=${PHONE_Y}:eof_action=pass[out]`,
  "-map","[out]",
  "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
  "-t", String(segB_dur),
  segB,
], "Segment B render");

// ── SEGMENT C: Part 4 leit, trimmed by offset, padded to 31.5s ──
// Part 4 actual dur often < segC_dur after offset — tpad-extend last frame to fill.
const probeP4 = spawnSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0", parts[4]]);
const part4EffDur = parseFloat(probeP4.stdout.toString().trim()) - (offsets[4] || 0);
const segCPad = Math.max(0, segC_dur - part4EffDur + 0.2);
const segC = join(tmpDir, "seg_c.mp4");
console.log(`[C] Leit-Akt2 (P4 effective ${part4EffDur.toFixed(2)}s, need ${segC_dur}s, tpad +${segCPad.toFixed(2)}s) → ${segC}`);
run("ffmpeg", [
  "-hide_banner","-loglevel","error","-y",
  "-ss", String(offsets[4] || 0),
  "-i", parts[4],
  "-vf", `fps=30,scale=${CANVAS_W}:${CANVAS_H}:force_original_aspect_ratio=decrease,pad=${CANVAS_W}:${CANVAS_H}:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1,tpad=stop_mode=clone:stop_duration=${segCPad.toFixed(3)}`,
  "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
  "-t", String(segC_dur),
  segC,
], "Segment C render (padded)");

// ── SEGMENT D: Phone Day-2 overlay ──
// Background: last meaningful frame of Part 4 webm (M17 "Bewertung angefragt" state).
const bgD = join(tmpDir, "bg_d.png");
extractLastFrame(parts[4], bgD);

// Phone content for D: Part 5 (SMS thread, 5s) + Part 6 (Rating page, 13s) concatenated
const phoneD = join(tmpDir, "phone_d.mp4");
console.log(`[D-prep] Concat Part5+Part6 phone content...`);
run("ffmpeg", [
  "-hide_banner","-loglevel","error","-y",
  "-ss", String(offsets[5] || 0), "-t", String(SEG_D_START === SEG_D_END ? segD_dur : 5.0),
  "-i", parts[5],
  "-ss", String(offsets[6] || 0), "-t", String(13.0),
  "-i", parts[6],
  "-filter_complex",
  `[0:v]fps=30,scale=${PHONE_W}:${PHONE_H},setsar=1[p5];` +
  `[1:v]fps=30,scale=${PHONE_W}:${PHONE_H},setsar=1[p6];` +
  `[p5][p6]concat=n=2:v=1[out]`,
  "-map","[out]",
  "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
  phoneD,
], "Phone-D concat");

const segD = join(tmpDir, "seg_d.mp4");
// FB10 (31.05.): Phone-Day-2 FADE-IN (nicht slide) per Founder-Spec. fade=t=in alpha.
const fadeInDur = 0.3;
console.log(`[D] Phone-Day2 overlay (fade-in + bezel) → ${segD}`);
run("ffmpeg", [
  "-hide_banner","-loglevel","error","-y",
  "-loop","1","-t",String(segD_dur),"-i", bgD,
  "-i", phoneD,
  "-loop","1","-t",String(segD_dur),"-i", PHONE_BEZEL_PNG,
  // Input 3: content-mask R=46
  "-loop","1","-t",String(segD_dur),"-i", PHONE_MASK_PNG,
  "-filter_complex",
  `[0:v]fps=30,scale=${CANVAS_W}:${CANVAS_H},setsar=1[bg];` +
  `[1:v]fps=30,scale=${CONTENT_W}:${CONTENT_H},setsar=1,format=yuva420p[phraw];` +
  `[3:v]format=gray,scale=${CONTENT_W}:${CONTENT_H}[cmask];` +
  `[phraw][cmask]alphamerge[phclip];` +
  `[phclip]pad=${PHONE_W}:${PHONE_H}:${CONTENT_PAD_X}:${CONTENT_PAD_Y}:color=black@0,fade=t=in:st=0:d=${fadeInDur}:alpha=1[phone];` +
  `[2:v]fps=30,scale=${PHONE_W}:${PHONE_H},setsar=1,format=rgba,fade=t=in:st=0:d=${fadeInDur}:alpha=1[bezel];` +
  `[bg][phone]overlay=x=${PHONE_X}:y=${PHONE_Y}:eof_action=pass[bgp];` +
  `[bgp][bezel]overlay=x=${PHONE_X}:y=${PHONE_Y}:eof_action=pass[out]`,
  "-map","[out]",
  "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
  "-t", String(segD_dur),
  segD,
], "Segment D render (fade-in + bezel)");

// ── SEGMENT E: Closing (Part 7) ──
// Probe Part 7 dur — if shorter than segE_dur, freeze last frame of P4 + tpad to fill
const probeE = spawnSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0", parts[7]]);
const part7Dur = parseFloat(probeE.stdout.toString().trim());
const segE = join(tmpDir, "seg_e.mp4");
console.log(`[E] Closing (Part 7 ${part7Dur.toFixed(1)}s, segE need ${segE_dur.toFixed(1)}s) → ${segE}`);

// FB27 (31.05. PM): Skip KPI loading flicker frames.
// KPI loading-animation continues for ~1-1.5s AFTER dashboard_final_visible event.
// Strategy: read event_log → Part A ends 0.3s before page.goto(dashboard) (= case-hold-end),
// Part B starts 1.5s AFTER dashboard_final_visible event (= KPIs definitely settled).
const eventLogPath = join(PIPE, "screenflows", slug, "take4_event_log.json");
const eventLog = JSON.parse(readFileSync(eventLogPath, "utf-8"));
const p7Events = eventLog.events.filter(e => e.part === 7);
const caseViewEvent = p7Events.find(e => e.name === "case_review_done_visible");
const dashFinalEvent = p7Events.find(e => e.name === "dashboard_final_visible");
const p7offset = offsets[7] || 0;
// Part A: from offsets[7] (case_review_done_visible) until 2.4s after = case-hold-end (matches 2.7s recording wait minus buffer)
const partAStart = p7offset;
const partAEnd = (caseViewEvent ? caseViewEvent.recording_t : p7offset) + 2.4;
// Part B: from dashboard_final_visible + 1.5s buffer onwards (KPIs settled)
const partBStart = dashFinalEvent ? dashFinalEvent.recording_t + 1.5 : p7offset + 5.0;
const KPI_FLICKER_DROP_START = partAEnd - p7offset;   // for log compat
const KPI_DROP = partBStart - partAEnd;
const part7EffDur = (part7Dur - p7offset) - KPI_DROP;  // total source minus skipped flicker
const padDur = Math.max(0, segE_dur - part7EffDur);
const segE_A = join(tmpDir, "seg_e_A.mp4");
const segE_B = join(tmpDir, "seg_e_B.mp4");

console.log(`  KPI-flicker-skip: part7 ${partAStart.toFixed(2)}-${partAEnd.toFixed(2)} → cut → ${partBStart.toFixed(2)}+`);
console.log(`  Part 7 effective ${part7EffDur.toFixed(2)}s — freeze-extending +${padDur.toFixed(2)}s`);

// Part A: case-detail stable (offset → flicker_start)
run("ffmpeg", [
  "-hide_banner","-loglevel","error","-y",
  "-ss", String(partAStart), "-t", String(KPI_FLICKER_DROP_START),
  "-i", parts[7],
  "-vf", `fps=30,scale=${CANVAS_W}:${CANVAS_H}:force_original_aspect_ratio=decrease,pad=${CANVAS_W}:${CANVAS_H}:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1`,
  "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
  segE_A,
], "Segment E.A (case-detail pre-flicker)");

// Part B: stable dashboard onwards + freeze-extend if needed
run("ffmpeg", [
  "-hide_banner","-loglevel","error","-y",
  "-ss", String(partBStart),
  "-i", parts[7],
  "-vf", `fps=30,scale=${CANVAS_W}:${CANVAS_H}:force_original_aspect_ratio=decrease,pad=${CANVAS_W}:${CANVAS_H}:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1,tpad=stop_mode=clone:stop_duration=${padDur.toFixed(3)}`,
  "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
  "-t", String(segE_dur - KPI_FLICKER_DROP_START),
  segE_B,
], "Segment E.B (stable dashboard + freeze-extend)");

// Concat A + B
const segEConcatList = join(tmpDir, "seg_e_concat.txt");
const { writeFileSync: wfsE } = await import("node:fs");
wfsE(segEConcatList, [segE_A, segE_B].map(p => `file '${resolve(p).replace(/\\/g,"/")}'`).join("\n"));
run("ffmpeg", [
  "-hide_banner","-loglevel","error","-y",
  "-f","concat","-safe","0","-i", segEConcatList,
  "-c","copy",
  segE,
], "Segment E concat A+B");

// ── FINAL CONCAT: A + B + C + D + E ──
console.log(`\n[CONCAT] A+B+C+D+E → ${outPath}`);
const concatList = join(tmpDir, "concat.txt");
const { writeFileSync } = await import("node:fs");
writeFileSync(concatList, [segA, segB, segC, segD, segE].map(p => `file '${resolve(p).replace(/\\/g,"/")}'`).join("\n"));
run("ffmpeg", [
  "-hide_banner","-loglevel","error","-y",
  "-f","concat","-safe","0","-i", concatList,
  "-c","copy",
  outPath,
], "Final concat");

// Verify
const probeFinal = spawnSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0", outPath]);
const finalDur = parseFloat(probeFinal.stdout.toString().trim());
const TARGET = 176.90;
const drift = Math.abs(finalDur - TARGET);
console.log(`\n✓ ${outPath} (${finalDur.toFixed(2)}s)`);
if (drift < 0.3) {
  console.log(`✓ Spec match: ${finalDur.toFixed(2)}s vs ${TARGET}s (drift ${drift.toFixed(2)}s)`);
} else {
  console.log(`⚠ Spec drift: ${finalDur.toFixed(2)}s vs ${TARGET}s (Δ${drift.toFixed(2)}s)`);
}

// Probe each segment duration for diagnostics
console.log(`\nSegment durations:`);
for (const [name, p] of [["A", segA], ["B", segB], ["C", segC], ["D", segD], ["E", segE]]) {
  const pr = spawnSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0", p]);
  const d = parseFloat(pr.stdout.toString().trim());
  console.log(`  ${name}: ${d.toFixed(3)}s`);
}

// Cleanup tmp
try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
