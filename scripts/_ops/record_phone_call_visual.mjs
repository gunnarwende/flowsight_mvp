#!/usr/bin/env node
/**
 * record_phone_call_visual.mjs — Records ONE phone-call visual phase with
 * EXACT custom call duration. Output is bezel+face-composit'd at 1440x900,
 * matching the look of the original take2_complete.mp4.
 *
 * Use case: replace Phase 4 (Anruf aktiv) + Phase 5 (Anruf beendet) in the
 * anchor-video assembly with a recording where the timer actually counts up
 * to the real call duration (not capped at 15s).
 *
 * Output:
 *   _generated/calls/<tenant>/_phone_extended_<variant>.mp4 (~165s + 3s = ~168s,
 *   1440x900, with bezel + loom-face overlay; no audio).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/record_phone_call_visual.mjs \
 *        --slug doerfler-ag --variant notruf --duration 165
 */
import { readFile, mkdir, copyFile, rm } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join, resolve, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { renderPhoneBezel, ensureContentMask } from "./_lib/renderPhoneBezel.mjs";
import { ensureCircleMask, buildCircleLoomFilter } from "./_lib/renderLoomCircle.mjs";
import { getDemoTimes } from "./_lib/demo_time.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
function getArg(name) {
  const prefix = `--${name}=`;
  const arg = args.find((a) => a.startsWith(prefix));
  if (arg) return arg.slice(prefix.length);
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith("--") ? args[idx + 1] : null;
}

const slug = getArg("slug");
const variant = getArg("variant");
const durationSec = Number(getArg("duration") || 165);
// FB38: anrufDauer (Display-Zielwert für Timer + "Anruf beendet · MM:SS") kann separat
// vom durationSec (Recording-Dauer) gesetzt werden. Erlaubt: "Anruf beendet 02:47" zeigen,
// obwohl die Recording-Phase nur 166s lang ist (für Master-Splice-Timing). Default = durationSec.
const displayDurationSec = Number(getArg("display-duration") || durationSec);
// PIPELINE_BIBLE §60 — Loom-Continuity-Fix (26.05.):
// Loom-Avatar wird über die GESAMTE Master-Timeline (0-380s) baked.
// Bei Splice via apply_loom_take2.mjs ist phone_extended bei output t=CALL_START
// → loom_avatar muss bei call-start ihren bereits-laufenden Zeitpunkt zeigen, nicht t=0.
// Default 45.1s matched CALL_START in apply_loom_take2.mjs. Tenant-Override via CLI.
const loomOffsetSec = Number(getArg("loom-offset") || 45.1);
if (!slug || !["notruf", "preis"].includes(variant)) {
  console.error("usage: --slug <tenant> --variant <notruf|preis> --duration <seconds> [--loom-offset 45.1]");
  process.exit(1);
}

const repoRoot = resolve(__dirname, "..", "..");
const cfgPath = join(repoRoot, "docs", "customers", slug, "tenant_config.json");
const cfg = JSON.parse(await readFile(cfgPath, "utf-8"));
const t = cfg.tenant;
const va = cfg.voice_agent || {};
const vid = cfg.video || {};

const outDir = join(repoRoot, "docs", "gtm", "pipeline", "06_video_production", "_generated", "calls", slug);
await mkdir(outDir, { recursive: true });
const tmpDir = join(outDir, `_tmp_phone_${variant}`);
await mkdir(tmpDir, { recursive: true });

// Determine display name + phone for the call screen
const displayName = (va.company_name || t.name || slug) + " Test";
const displayPhone = vid.display_phone || vid.telefon_display || va.phone || "+41 44 505 74 21";
const brandColor = t.brand_color || "#003478";
const initial = (va.company_name || t.name || "?").charAt(0).toUpperCase();
const demoTime = getDemoTimes({ skipGate: true });

// FB1/FB2/FB4/FB6 (26.05.) — Datum dynamisch aus demoTime, nicht hardcoded.
// Produziert "Dienstag, 26. Mai" pro Pipeline-Run-Tag.
function getTodayGerman() {
  const parts = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    weekday: "long", day: "numeric", month: "long",
  }).formatToParts(demoTime.phoneCallStartTime).reduce((a, p) => { a[p.type] = p.value; return a; }, {});
  return `${parts.weekday}, ${parts.day}. ${parts.month}`;
}

// ─── Step 1: Record Samsung HTML with custom call duration ─────────────────
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
  recordVideo: { dir: tmpDir, size: { width: 412, height: 915 } },
});
const page = await context.newPage();

const htmlPath = join(repoRoot, "scripts", "_ops", "screen_templates", "sequences", "take2_samsung.html");
const fileUrl = "file:///" + htmlPath.split(sep).join("/");

// Build URL with anruf_dauer = the actual call duration
const params = new URLSearchParams({
  firma: displayName,
  telefon: displayPhone,
  sms_sender: t.name,
  case_ref: t.case_id_prefix || "XX",
  uhrzeit: "08:04",
  datum: getTodayGerman(),
  initial,
  anruf_dauer: String(Math.round(displayDurationSec)),
  brand_color: brandColor,
  battery: "86",  // FIX 01.06.: take2_samsung.html liest Param "battery" (NICHT "batt") → sonst Default 71. T2=86.
  playwright: "true",
});
console.log(`recording phone call visual (${variant}, ${durationSec}s call duration)...`);
await page.goto(`${fileUrl}?${params}`, { waitUntil: "domcontentloaded" });

// FB85 (26.04.): Pre-call sequence Wartezeit auf 12s erhöht (statt 8s) — manchmal
// braucht startTimer() bis ~10s nach DOMContentLoaded (homescreen→tap→contact→tap→
// ringDuration). Mit 12s-Wait sind wir SICHER im aktiven Timer-State bevor recording-
// Phase 2 (durationSec) beginnt.
await page.waitForTimeout(12000);
console.log(`  → Call active (recording timer + gradient pulse for ${durationSec}s)`);

// Record call-active for the full target duration
await page.waitForTimeout(durationSec * 1000);

// End the call
await page.evaluate(() => window.endCall());
// FB38: 5.8s wait (statt 3.5) → ended-screen sichtbar lange genug, dass nach Splice in
// Master die User-spec 3.5s Display-Dauer eingehalten wird. Recording-Offset zwischen
// HTML-startTimer und tatsächlichem call-active-Start kostet ~2.3s.
const endedScreenWaitMs = 5800;
console.log(`  → Call ended, holding "Anruf beendet" screen ${endedScreenWaitMs/1000}s`);
await page.waitForTimeout(endedScreenWaitMs);

const videoPath = await page.video().path();
await context.close();
await browser.close();

const samsungWebm = join(tmpDir, "samsung_extended.webm");
await copyFile(videoPath, samsungWebm);
console.log(`  raw recording: ${samsungWebm}`);

// ─── Step 2: Composite with bezel + face overlay (1440x900) ───────────────
console.log("compositing bezel + face overlay...");
const bezelPath = await renderPhoneBezel({ outDir: tmpDir, shadowColor: "#0b1220" });
const contentMaskPath = await ensureContentMask({ outDir: tmpDir, width: 320, height: 712, radius: 40 });

// Loom/face placeholder — use existing screenflow loom source if present
const loomSource = join(
  repoRoot, "docs", "gtm", "pipeline", "06_video_production",
  "screenflows", slug, "loom_avatar.mp4",
);
const loomFallback = join(
  repoRoot, "docs", "gtm", "pipeline", "06_video_production",
  "screenflows", "_shared", "_loom_fallback.mp4",
);
const loomFile = existsSync(loomSource) ? loomSource : (existsSync(loomFallback) ? loomFallback : null);

// Probe duration of samsung recording
const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", samsungWebm]);
const samsungDur = parseFloat(probe.stdout.toString().trim()) || (durationSec + 12);

// FB85 (26.04.): trim_start auf 11.0s erhöht (war 7.3 → dialing-flicker am Anfang).
// Bei sec 11.0 raw ist der startTimer() längst aufgerufen und Timer zeigt schon 00:01+.
// Recording: 12s wait + durationSec call-active + 3.5s ended → keep from 11s to (11+durationSec+3.5).
// Note: extended_phone sec 0 wird "Anruf aktiv 00:01" zeigen. Phase phone_dialing aus
// take2_complete.mp4 (range 4.5-9.0) zeigt das Wird-angerufen davor.
const trimStart = 11.0;
const trimDur = durationSec + 5.8;
const trimmedWebm = join(tmpDir, "samsung_trimmed.webm");
const trim = spawnSync("ffmpeg", [
  "-hide_banner", "-y",
  "-ss", String(trimStart),
  "-i", samsungWebm,
  "-t", String(trimDur),
  "-c:v", "copy",
  trimmedWebm,
], { stdio: "inherit" });
if (trim.status !== 0) {
  console.error("trim failed");
  process.exit(1);
}

// Final composit recipe (matches pipeline_screenflow.mjs Step 4b for Take 2)
const FACE_DIAMETER = 260;
const finalOut = join(outDir, `_phone_extended_${variant}.mp4`);
const canvasBg = "#0b1220";

// Build composit: phone content (412x914 from webm) → mask → scale to 400x860 → bezel overlay → on canvas + face
const composeArgs = [
  "-hide_banner", "-y",
  "-i", trimmedWebm,                                      // [0] phone content
  "-loop", "1", "-t", String(trimDur), "-i", bezelPath,  // [1] bezel
  "-f", "lavfi", "-t", String(trimDur),
    "-i", `color=c=${canvasBg}:size=1440x900:rate=30`,    // [2] canvas bg
  "-loop", "1", "-t", String(trimDur), "-i", contentMaskPath, // [3] content mask
];
// Match pipeline_screenflow.mjs Step 4b: scale 412×914 → 320×712 (no crop —
// crop entfernt sonst die obere Status-Bar mit Timer "Anruf aktiv 02:45"!)
let filterComplex =
  "[0:v]fps=30,scale=320:712,setsar=1,format=yuva420p[phraw];" +
  "[3:v]format=gray,scale=320:712[cmask];" +
  "[phraw][cmask]alphamerge[phclip];" +
  "[phclip]pad=340:730:10:9:color=black@0[phpad];" +
  "[phpad]scale=400:860,setsar=1[phup];" +
  "[1:v]scale=400:860,setsar=1[bezelup];" +
  "[phup][bezelup]overlay=0:0:format=auto[phfull];" +
  // Position phone on canvas at x=375, y=20
  "[2:v][phfull]overlay=375:20[withphone]";

let outLabel = "[withphone]";
if (loomFile) {
  // Circle-Mask Pattern (renderLoomCircle.mjs) statt inline-geq —
  // letzteres warf bei manchen ffmpeg-builds "Missing ')' or too many args"
  // wegen verschachtelter if/hypot-Auswertung. Pattern ist gleich wie in
  // apply_loom_take3.mjs erprobt.
  const { circleMaskPng } = ensureCircleMask({ outDir: tmpDir, diameter: FACE_DIAMETER });
  if (circleMaskPng) {
    // PIPELINE_BIBLE §60 — Loom-Continuity: -ss seekt loom_avatar zur Master-Splice-Position.
    composeArgs.push("-ss", String(loomOffsetSec), "-stream_loop", "-1", "-i", loomFile); // [4] loom video at offset
    composeArgs.push("-loop", "1", "-t", String(trimDur), "-i", circleMaskPng);    // [5] circle mask
    filterComplex +=
      `;` + buildCircleLoomFilter({ loomIdx: 4, maskIdx: 5, diameter: FACE_DIAMETER, label: "facec" }) +
      `;[withphone][facec]overlay=805:20:format=auto:shortest=0[final]`;
    outLabel = "[final]";
  }
}
composeArgs.push("-filter_complex", filterComplex);
composeArgs.push("-map", outLabel);
composeArgs.push("-c:v", "libx264", "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p");
composeArgs.push("-an");
composeArgs.push("-t", String(trimDur));
composeArgs.push(finalOut);

const compose = spawnSync("ffmpeg", composeArgs, { stdio: "inherit" });
if (compose.status !== 0) {
  console.error("composit failed");
  process.exit(1);
}

// Cleanup
await rm(tmpDir, { recursive: true, force: true });

const outProbe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", finalOut]);
const outDur = parseFloat(outProbe.stdout.toString().trim()) || -1;
console.log("");
console.log(`✓ Output: ${finalOut}`);
console.log(`  duration: ${outDur.toFixed(2)}s`);
console.log(`  call_active duration: ${durationSec}s + 3.5s ended-screen`);
