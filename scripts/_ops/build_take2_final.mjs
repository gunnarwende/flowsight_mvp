#!/usr/bin/env node
/**
 * build_take2_final.mjs — One-Command Take-2-V102-Pipeline
 *
 * Reads tenant_config.json → video.call_proof_variante → picks variant
 *   C → notruf (60% of tenants, MIT Notdienst)
 *   B → preis (40% of tenants, OHNE Notdienst)
 *
 * Then runs the full V102 production-ready chain:
 *   1. pipeline_screenflow.mjs           → take2_complete.mp4 (samsung + leitsystem with today-relative DB)
 *   2. build_from_phase_schedule.mjs     → take2_<variant>_anchor.mp4 (= V50-equivalent base; audio+loom+screen composite)
 *   3. build_v26_dashboard_animation.mjs → take2_<variant>_FINAL_v102.mp4 (with mask r46 + bezel-FG corners + pre-rendered animation + scroll-to-top end-state)
 *
 * Output: take2_<variant>_FINAL_v102_<YYYYMMDD>.mp4 in _generated/previews/<slug>/
 *
 * Usage:
 *   APP_URL=http://localhost:3000 node --env-file=src/web/.env.local \
 *     scripts/_ops/build_take2_final.mjs --slug <slug>
 *
 * Time-dynamic: every run uses TODAY's date via demoTime (scripts/_ops/_lib/demo_time.mjs).
 * Skalierbarkeit: works for any new Sanitär tenant whose tenant_config.json is present.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, copyFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");

const args = process.argv.slice(2);
function argVal(flag, def) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : def;
}
const slug = argVal("--slug");
if (!slug) {
  console.error("usage: --slug <tenant-slug>");
  process.exit(1);
}

const SKIP_PIPELINE = args.includes("--skip-pipeline");
const SKIP_ANCHOR = args.includes("--skip-anchor");

const PIPE = "docs/gtm/pipeline/06_video_production";
const cfgPath = join(REPO_ROOT, "docs", "customers", slug, "tenant_config.json");
if (!existsSync(cfgPath)) {
  console.error(`✗ tenant_config.json fehlt: ${cfgPath}`);
  process.exit(2);
}
const cfg = JSON.parse(readFileSync(cfgPath, "utf-8"));
const proofVariante = cfg?.video?.call_proof_variante || "B";
const variant = proofVariante === "C" ? "notruf" : "preis";

console.log(`\n╔══════════════════════════════════════════════════╗`);
console.log(`║  Take 2 V102 Final Pipeline — ${slug.padEnd(20)} ║`);
console.log(`╚══════════════════════════════════════════════════╝`);
console.log(`  variant       : ${variant} (call_proof_variante=${proofVariante})`);
console.log(`  brand_color   : ${cfg?.brand_color || "N/A"}`);
console.log(`  short_name    : ${cfg?.short_name || cfg?.firma || "N/A"}`);
console.log(`  today         : ${new Date().toISOString().slice(0, 10)}`);
console.log(``);

function step(label, cmd, argv, env = {}) {
  console.log(`\n──── ${label} ────`);
  const r = spawnSync(cmd, argv, {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) {
    console.error(`✗ STEP FAILED: ${label}`);
    process.exit(r.status || 1);
  }
}

const node = process.execPath;
const envFile = "--env-file=src/web/.env.local";

// ── STEP 1: pipeline_screenflow (Samsung+Leitsystem with today's DB) ────────
if (!SKIP_PIPELINE) {
  step(
    "STEP 1: pipeline_screenflow (today-relative DB seed + recording)",
    node,
    [envFile, "scripts/_ops/pipeline_screenflow.mjs", `--slug=${slug}`, "--take=2"],
    { APP_URL: process.env.APP_URL || "http://localhost:3000" }
  );
}

// ── STEP 1.5: Regenerate _recording_offset.json + phase library override ───
// V104j (29.05): Fix in-app animation drift (KPI markers, scrolling, case detail).
// Each leitsystem.webm recording has variable event timestamps; without
// regenerating the override per build, source-ranges become stale → KPI markers
// off, scroll positions drift, case_top_hold mis-aligned. Solved by computing
// recording-specific offset + auto-generating phase-library override from
// take2_event_log.json BEFORE build_from_phase_schedule reads phase library.
const sfDir = join(PIPE, "screenflows", slug);
const samsungPathRec = join(sfDir, "take2_samsung.webm");
const slugClipPath = join(sfDir, "_app_open_clip.mp4");
const offsetPath = join(sfDir, "_recording_offset.json");
const eventLogPath = join(sfDir, "take2_event_log.json");

function probeDuration(p) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", p], { encoding: "utf-8" });
  return parseFloat(r.stdout.toString().trim()) || 0;
}

if (existsSync(samsungPathRec) && existsSync(slugClipPath)) {
  const samsungDur = probeDuration(samsungPathRec);
  const slugClipDur = probeDuration(slugClipPath);
  const samsungTrim = 0.3;
  const leitTrim = 2.0;
  const leitStartInTake2Complete = (samsungDur - samsungTrim) + slugClipDur;
  writeFileSync(offsetPath, JSON.stringify({
    leit_start_in_take2_complete: leitStartInTake2Complete,
    leit_trim: leitTrim,
    samsung_dur: samsungDur,
    samsung_trim: samsungTrim,
    slug_clip_dur: slugClipDur,
  }, null, 2));
  console.log(`  → _recording_offset.json regenerated: leit_start=${leitStartInTake2Complete.toFixed(3)}s`);
}

if (existsSync(eventLogPath) && existsSync(offsetPath)) {
  step(
    "STEP 1.5: Regenerate phase library override from event log (deterministic in-app timing)",
    node,
    ["scripts/_ops/_gen_t2_override.mjs", slug]
  );
} else {
  console.log(`  ⚠ event log or offset missing — skipping override regeneration (KPI markers may drift)`);
}

// ── STEP 1.6: Auto-generate take2 schedule wenn fehlend (self-sufficient) ───
// 01.06.2026: build_from_phase_schedule liest take2_<variant>.schedule. Die wurde
// vorher nur manuell pro Betrieb erzeugt → Stresstest-Fail für NEUE Betriebe
// (walter-leuthold/weinberger). Jetzt automatisch aus Master + Config abgeleitet.
const t2sched = join(PIPE, "_generated", "transcripts", slug, `take2_${variant}.schedule`);
if (!existsSync(t2sched)) {
  step("STEP 1.6: Generate take2 schedule (from master + config)", node,
    ["scripts/_ops/audio/generate_take2_schedule.mjs", "--tenant", slug]);
}

// ── STEP 2: build_from_phase_schedule (anchor = V50-equivalent base) ────────
const anchorPath = join(PIPE, "_generated", "previews", slug, `take2_${variant}_anchor.mp4`);
const v50Path = join(PIPE, "_generated", "previews", slug, `take2_${variant}_FINAL_v50.mp4`);

if (!SKIP_ANCHOR) {
  step(
    "STEP 2: build_from_phase_schedule (anchor with audio+loom+screen composite — uses fresh override)",
    node,
    ["scripts/_ops/audio/build_from_phase_schedule.mjs", "--tenant", slug, "--take", "2", "--variant", variant]
  );
}

// V103 architecture (28.05.): ALWAYS use fresh anchor + enforce universal audio +
// extend video to universal-audio-duration. V50 is no longer referenced.
// Universal audio = AAC stream-copy from V50 → bit-identical to V50's audio
// (no decode+encode cycle that would alter bits).
const lockedAudio = join(PIPE, "_locked", "audio", `take2_${variant}.aac`);
if (!existsSync(lockedAudio)) {
  console.error(`✗ universal locked audio missing: ${lockedAudio}`);
  process.exit(3);
}

// Probe durations
function probeDur(p) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], { encoding: "utf-8" });
  return parseFloat(r.stdout.trim());
}
const lockedAudioDur = probeDur(lockedAudio);
const anchorDur = probeDur(anchorPath);
console.log(`  locked audio dur : ${lockedAudioDur.toFixed(3)}s`);
console.log(`  anchor video dur : ${anchorDur.toFixed(3)}s`);
const padNeeded = Math.max(0, lockedAudioDur - anchorDur);

// Step 2b: anchor + universal audio + duration-pad to audio length
const newBaseTag = "base";
const baseUnpadded = join(PIPE, "_generated", "previews", slug, `take2_${variant}_FINAL_${newBaseTag}_raw.mp4`);
const newBasePath = join(PIPE, "_generated", "previews", slug, `take2_${variant}_FINAL_${newBaseTag}.mp4`);

if (padNeeded > 0.01) {
  console.log(`  → padding video +${padNeeded.toFixed(3)}s to match locked audio`);
  step("STEP 2b: Pad anchor video + mux locked universal AAC (stream-copy)", "ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", anchorPath, "-i", lockedAudio,
    "-filter_complex", `[0:v]tpad=stop_mode=clone:stop_duration=${padNeeded.toFixed(3)}[v]`,
    "-map", "[v]", "-map", "1:a",
    "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
    "-c:a", "copy", // stream-copy AAC → bit-identical to V50 audio
    "-shortest",
    newBasePath,
  ]);
} else {
  step("STEP 2b: Mux locked AAC stream-copy onto anchor", "ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", anchorPath, "-i", lockedAudio,
    "-c:v", "copy",
    "-c:a", "copy",
    "-map", "0:v:0", "-map", "1:a:0",
    "-shortest",
    newBasePath,
  ]);
}
const baseTag = newBaseTag;
console.log(`  Base (anchor + universal audio): ${newBasePath}`);

// ── STEP 2c: Generate dynamic homescreen + bridge-dashboard PNGs (per-run, today's date)
// Replaces the locked /c/tmp/v26/homescreen_mai.png which has 26.05 baked-in.
const samsungWebm = join(PIPE, "screenflows", slug, "take2_samsung.webm");
const leitWebm = join(PIPE, "screenflows", slug, "take2_leitsystem.webm");
const homescreenPng = join(PIPE, "screenflows", slug, "_today_lockscreen.png");
const bridgePng = join(PIPE, "screenflows", slug, "_stable_dashboard.png");

for (const p of [samsungWebm, leitWebm]) {
  if (!existsSync(p)) { console.error(`✗ missing: ${p}`); process.exit(3); }
}

// V104l (29.05): Dynamic extraction time = samsung_dur - 0.5s. Static t=32.5
// worked for Dörfler (samsung 33.6s → homescreen at 32.5) but FAILED for Leins
// (samsung 33.76s, SMS thread still visible at 32.5 due to different playwright
// orchestration timing). User reported "SMS visible until 4:15.2" on Leins. By
// extracting at last 0.5s before recording end, we land on post-SMS homescreen
// state regardless of per-tenant timing variance.
const samsungDur = probeDuration(samsungWebm);
const homescreenExtractTime = (samsungDur - 0.5).toFixed(2);
console.log(`  → homescreen extract: samsung_dur=${samsungDur.toFixed(2)}s → t=${homescreenExtractTime}s`);
step("STEP 2c-1: Extract today's lockscreen (post-SMS state, 08:08 clock) from samsung.webm", "ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-ss", homescreenExtractTime, "-i", samsungWebm, "-frames:v", "1",
  "-vf", "scale=320:712",
  homescreenPng,
]);
// V104g+ (29.05): Bridge PNG MUST match V25 base composite EXACTLY in
// proportions. V25 base in pipeline_screenflow STEP 4a uses:
//   - leitsystem scaled to 412:878
//   - status_bar overlay 412:36 at top (padded above leitsystem)
//   - Total 412:914 → STEP 4b downscales to 320:712 for phone interior
// Ratio: 36:878 = 1:24.4 status:content. Scaled to 320:712:
//   - status bar: 36/914 * 712 = 28.04 → 28px
//   - leitsystem: 878/914 * 712 = 683.96 → 684px
//   - Total 28+684 = 712 ✓
// V104h FIX: previous 32:680 ratio caused thicker status bar + "DA Dörfler AG"
// balken height mismatch + white corner artifacts at bridge→V25-base boundary.
const statusBar = `${PIPE}/screenflows/${slug}/status_bar.png`;
step("STEP 2c-2: Composite bridge PNG matching V25-base proportions 28:684", "ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-ss", "15", "-i", leitWebm,
  "-i", statusBar,
  "-filter_complex",
  "[0:v]scale=320:684,setsar=1[leit];" +
  "[1:v]scale=320:28,setsar=1[sb];" +
  "[sb][leit]vstack[out]",
  "-map", "[out]", "-frames:v", "1",
  bridgePng,
]);

// Copy fresh homescreen to /c/tmp/v26/ path that build_v26 reads.
// 01.06.2026: PER-TENANT statt geteiltem "homescreen_mai.png" — Stresstest zeigte
// Race bei Parallel-Läufen (2 Betriebe überschrieben dieselbe Datei). Inhalt ist
// ohnehin evergreen (frisch aus heutiger Aufnahme extrahiert, demo_time = heute).
const legacyHomescreen = `C:/tmp/v26/homescreen_${slug}.png`;
copyFileSync(homescreenPng, legacyHomescreen);
console.log(`  → fresh today-lockscreen written: ${homescreenPng}`);
console.log(`  → stable-dashboard bridge frame written: ${bridgePng}`);

// V104c (29.05): Regenerate zoom-animation PNG sequence using the fresh bridge
// dashboard frame as source. Without this, the zoom_anim PNGs from /c/tmp/v26/
// retain the previous day's state, causing visible flicker at the ANIM→bridge
// boundary (e.g. "Guten Tag" → "Guten Morgen" snap-change).
const maiDashboardSrc = `C:/tmp/v26/mai_dashboard_${slug}.png`;
copyFileSync(bridgePng, maiDashboardSrc);
step("STEP 2c-3: Regenerate zoom_anim PNG sequence (matches live dashboard state)",
  node, ["scripts/_ops/build_mai_zoom_anim.mjs", `--slug=${slug}`]);
console.log(`  → legacy path overridden: ${legacyHomescreen}`);

// V104g (29.05): Extract SMS thread PNG for V26 overlay. samsung.webm at t=30
// shows the SMS thread mid-state with today's date + "Ihre Meldung wurde
// aufgenommen" + 08:08 timestamp. Phase library's phone_sms_thread freeze on
// V25 base picks wrong frame (post-SMS homescreen) → user sees lockscreen
// instead of SMS thread during 3:37-3:48 canvas window. SMS PNG overlay
// fixes this analog to the HS overlay covering phone_homescreen_post_sms.
const smsPng = join(PIPE, "screenflows", slug, "_sms_thread.png");
step("STEP 2c-4: Extract SMS thread frame from samsung.webm (t=30)", "ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-ss", "30", "-i", samsungWebm, "-frames:v", "1",
  "-vf", "scale=320:712",
  smsPng,
]);
console.log(`  → SMS thread PNG: ${smsPng}`);

// ── STEP 3: build_v26_dashboard_animation (V102 overlays) ───────────────────
const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const outTag = `v102_${today}`;
step(
  "STEP 3: build_v26_dashboard_animation (mask r46 + bezel-FG + pre-rendered anim)",
  node,
  [
    "scripts/_ops/build_v26_dashboard_animation.mjs",
    `--slug=${slug}`,
    `--variant=${variant}`,
    `--base=${baseTag}`,
    `--out-tag=${outTag}`,
  ]
);

const rawV102Path = join(PIPE, "_generated", "previews", slug, `take2_${variant}_FINAL_${outTag}.mp4`);

// ── STEP 4: Overlay universal locked Loom (V50-canonical face) ───────────────
const lockedLoom = join(PIPE, "_locked", "loom", `take2_${variant}_loom.mp4`);
if (!existsSync(lockedLoom)) {
  console.error(`✗ universal locked loom missing: ${lockedLoom}`);
  process.exit(3);
}
const beforeLock = rawV102Path.replace(".mp4", "_preloom.mp4");
copyFileSync(rawV102Path, beforeLock);
step("STEP 4: Overlay universal locked loom (founder face)", "ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-i", beforeLock, "-i", lockedLoom,
  "-filter_complex",
  "[1:v]setpts=PTS-STARTPTS[loom];[0:v]setpts=PTS-STARTPTS[base];[base][loom]overlay=805:20:shortest=0:eof_action=pass[outv]",
  "-map", "[outv]", "-map", "0:a",
  "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
  "-c:a", "copy",
  rawV102Path,
]);

// ── STEP 5: Faststart remux for instant playback ─────────────────────────────
const finalPath = join(PIPE, "_generated", "previews", slug, `take2_${variant}_v102_final.mp4`);
step("STEP 5: Faststart remux", "ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-i", rawV102Path,
  "-c", "copy", "-movflags", "+faststart",
  finalPath,
]);

console.log(`\n══════════════════════════════════════════════════════`);
console.log(`✓ TAKE 2 V102 FINAL — ${slug} / ${variant}`);
console.log(`  ${finalPath}`);
console.log(`  base   : ${baseTag === "v50" ? "V50 (founder-approved gold)" : "fresh anchor + universal loom overlay"}`);
console.log(`══════════════════════════════════════════════════════\n`);
