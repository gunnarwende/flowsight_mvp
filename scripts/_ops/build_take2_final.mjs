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

// ── Phone-Extended self-sufficiency (01.06.) ───────────────────────────────
// build_from_phase_schedule (STEP 2) braucht _generated/calls/<slug>/
// _phone_extended_<variant>.mp4 (Live-Telefon-Call, visuell gerendert). War vorher
// manuell pro Betrieb → NEUE Betriebe failten mit BLACK-Phone. Jetzt generate-if-
// missing via record_phone_call_visual (self-contained file://-Render, kein Live-Call).
// Dauer = kanonische Call-Active-Länge pro Variante (notruf ~165s / preis ~162s).
const phoneExtended = join(REPO_ROOT, PIPE, "_generated", "calls", slug, `_phone_extended_${variant}.mp4`);
if (!existsSync(phoneExtended)) {
  const callDur = variant === "notruf" ? "165" : "162";
  console.log(`──── STEP 0.5: Phone-Extended fehlt → generiere (${variant}, ${callDur}s) ────`);
  const r = spawnSync("node", ["--env-file=src/web/.env.local",
    "scripts/_ops/record_phone_call_visual.mjs", "--slug", slug, "--variant", variant, "--duration", callDur],
    { cwd: REPO_ROOT, stdio: "inherit" });
  if (r.status !== 0) { console.error("✗ STEP 0.5 FAILED: phone-extended generation"); process.exit(r.status || 1); }
}

// ── Greeting self-sufficiency (01.06.) — per-Tenant-Audio mit korrektem Lisa-Greeting ─
// build_from_phase_schedule (STEP 2) nutzt _generated/takes/<slug>/take2_<variant>.wav,
// sonst locked Fallback (= Varianten-Master-Greeting → FALSCHER Firmenname, z.B. Stark→
// "Dörfler"). Hier generate-if-missing: in-place-Greeting-Swap (locked Master + per-
// Tenant-Greeting im fixen Slot 44–51s) → korrekter Firmenname, Sync byte-genau erhalten.
// FIX 03.06.: IMMER regenerieren (war generate-if-missing). Wurzel Wälti-T2-Fail: ein
// STALE per-Tenant-Audio aus einem alten/kaputten Build (1.22s statt 8.55s Verbindungs-
// Pause) wurde durchgereicht, weil die Datei existierte → Swap übersprungen. Der Swap ist
// schnell + deterministisch (locked Master + per-Tenant-Greeting) → Always-Regenerate
// eliminiert das Altlast-Risiko bei jedem Re-Run (10/Tag-Maschine, Re-Builds).
const tenantAudio = join(REPO_ROOT, PIPE, "_generated", "takes", slug, `take2_${variant}.wav`);
{
  console.log(`──── STEP 0.6: Lisa-Greeting-Swap (${variant}, always-regenerate aus locked Master) ────`);
  const r = spawnSync("node", ["scripts/_ops/audio/swap_tenant_greeting.mjs", "--slug", slug, "--variant", variant],
    { cwd: REPO_ROOT, stdio: "inherit" });
  if (r.status !== 0) { console.error("✗ STEP 0.6 FAILED: greeting swap"); process.exit(r.status || 1); }
}

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

// ANCHOR (02.06.): dynamischer Samsung-Trim aus pipeline_screenflow-Sidecar
// (= detektierter Homescreen-Start). Fallback 0.3 für Alt-Recordings ohne Sidecar.
const samsungTrimPath = join(sfDir, "_samsung_trim.json");
let SAMSUNG_TRIM = 0.3;
if (existsSync(samsungTrimPath)) {
  try { SAMSUNG_TRIM = Number(JSON.parse(readFileSync(samsungTrimPath, "utf-8")).homescreen_start) || 0.3; } catch {}
}
console.log(`  → ANCHOR Samsung-Trim (homescreen_start): ${SAMSUNG_TRIM.toFixed(3)}s`);

if (existsSync(samsungPathRec) && existsSync(slugClipPath)) {
  const samsungDur = probeDuration(samsungPathRec);
  const slugClipDur = probeDuration(slugClipPath);
  const samsungTrim = SAMSUNG_TRIM;
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
    ["scripts/_ops/audio/generate_take2_schedule.mjs", "--tenant", slug, "--variant", variant]);
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

// FIX 02.06. (Greeting-Leak, systemisch): Der Anchor (build_from_phase_schedule)
// nutzt bereits das per-Tenant-Audio mit korrektem Lisa-Greeting (swap_tenant_greeting,
// PR #533) — universeller Content + KORREKTER Firmenname + Sync-Proof. Die alte
// V103-Logik (28.05., ÄLTER als der Greeting-Swap) muxte hier stattdessen das
// universelle _locked/audio/take2_<variant>.aac (Dörfler-Master-Greeting) per
// `-map 1:a` rein → überschrieb den Swap → ALLE Betriebe hatten im Final den
// Dörfler-Greeting (per STT belegt: Walter+Stark = "Dörfler AG"). Zusätzlich hatte
// die locked .aac einen kaputten Dauer-Header (format=duration meldete 1637s statt
// echten 380.5s → 21 Min Standbild-Pad). Beides entfällt: Anchor IST die Base.
const newBaseTag = "base";
const newBasePath = join(PIPE, "_generated", "previews", slug, `take2_${variant}_FINAL_${newBaseTag}.mp4`);
step("STEP 2b: Anchor → base (Video + per-Tenant-Audio mit korrektem Greeting, stream-copy)", "ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-i", anchorPath,
  "-c", "copy",
  "-map", "0:v:0", "-map", "0:a:0",
  newBasePath,
]);
const baseTag = newBaseTag;
console.log(`  Base (anchor video + per-Tenant-Greeting-Audio): ${newBasePath}`);

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
// DETEKTION (03.06.): SMS-Thread deterministisch via Helligkeit finden statt fixem Offset.
// WURZEL Marti-Bug: `SAMSUNG_TRIM + 29.7` fiel bei Recording-Jitter auf die SMS-Notification
// (Homescreen+Banner, dunkles Wallpaper Y≈113) statt den Thread (weißer Screen Y≈232) →
// im Finale 3:33–3:44 falscher Frame. Der Thread ist die LETZTE anhaltende Weiß-Region der
// samsung.webm (kommt nach der Notification; Call-Ended-Screen ist auch weiß aber FRÜHER).
function detectSmsThreadTime(webm, fallbackT) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", webm,
    "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG", "-an", "-f", "null", "-"],
    { encoding: "utf8" });
  const samples = []; let t = null;
  for (const m of (r.stderr || "").matchAll(/pts_time:([\d.]+)|YAVG=([\d.]+)/g)) {
    if (m[1] !== undefined) t = parseFloat(m[1]);
    else if (t !== null) { samples.push({ t, y: parseFloat(m[2]) }); t = null; }
  }
  const regions = []; let start = null, last = null;
  for (const s of samples) {
    if (s.y > 200) { if (start === null) start = s.t; last = s.t; }
    else { if (start !== null && last - start >= 0.8) regions.push([start, last]); start = null; }
  }
  if (start !== null && last - start >= 0.8) regions.push([start, last]);
  if (!regions.length) { console.warn(`  ⚠ keine Weiß-Region erkannt → Fallback ${fallbackT}s`); return fallbackT; }
  const [a, b] = regions[regions.length - 1];
  const mid = ((a + b) / 2).toFixed(2);
  console.log(`  → SMS-Thread erkannt: ${regions.length} Weiß-Region(en), letzte [${a.toFixed(2)},${b.toFixed(2)}]s → extract @${mid}s`);
  return mid;
}
const smsExtractT = detectSmsThreadTime(samsungWebm, (SAMSUNG_TRIM + 29.7).toFixed(2));
step(`STEP 2c-4: Extract SMS thread frame from samsung.webm (t=${smsExtractT}, anchor-relative)`, "ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-ss", smsExtractT, "-i", samsungWebm, "-frames:v", "1",
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
