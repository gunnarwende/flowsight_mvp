#!/usr/bin/env node
/**
 * compose_take4_final.mjs — Take 4 Finalisierung (A10/A17/A18/A19).
 *
 * Inputs (7 parts, A19 close-circle entfernt):
 *   1. take4_01_akt1.webm       (Leitsystem D1→D2→Edit → Termin versenden A11)
 *   2. take4_02_cut.webm        (Brand-Cut)
 *   3. take4_03_phone_day1.webm (Handy 412×915 Reminder kommt rein)
 *   4. take4_04_akt2.webm       (Leitsystem Erledigt → Bewertung anfragen → D15 A12)
 *   5. take4_05_phone_day2.webm (Handy 412×915 alle 3 SMS)
 *   6. take4_06_review.webm     (LIVE /review Mobile 412×915 — padded für Status-Bar + Nav Overlay)
 *   7. take4_07_closing.webm    (Dashboard Gold-Case)
 *
 * Outputs: take4_complete.mp4
 *
 * Flow:
 *   [akt1 + tag chip] → [cut] → [akt1 last-frame + phone1 PiP + tag]
 *   → [akt2 + tag] → [akt2 last-frame + phone2 PiP + tag]
 *   → [akt2 last-frame + review-framed PiP + tag]
 *   → [closing + tag + Windows toast overlay in last 2s (A18)]
 *
 * Zeit-SSOT: demo_time.mjs → Tag-Labels, Status-Bar-Zeit für Review.
 *
 * Usage:
 *   node scripts/_ops/compose_take4_final.mjs --slug doerfler-ag
 */

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderPhoneBezel } from "./_lib/renderPhoneBezel.mjs";
import { ensureSamsungNav } from "./_lib/renderSamsungNav.mjs";
import { renderWindowsToast } from "./_lib/renderWindowsToast.mjs";
import { renderSidebarProfile } from "./_lib/renderSidebarProfile.mjs";
import { getDemoTimes, formatDayShort, formatTimeShort } from "./_lib/demo_time.mjs";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1] || "doerfler-ag";

const outBase = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));
const t = config.tenant;
const brandColor = t.brand_color || "#0b1220";

const files = {
  akt1: join(outBase, "take4_01_akt1.webm"),
  cut: join(outBase, "take4_02_cut.webm"),
  phone1: join(outBase, "take4_03_phone_day1.webm"),
  akt2: join(outBase, "take4_04_akt2.webm"),
  phone2: join(outBase, "take4_05_phone_day2.webm"),
  review: join(outBase, "take4_06_review.webm"),
  closing: join(outBase, "take4_07_closing.webm"),
};

for (const [k, p] of Object.entries(files)) {
  if (!existsSync(p)) {
    console.error(`❌ Missing: ${k} = ${p}`);
    process.exit(1);
  }
}

function run(args, { allowFail = false } = {}) {
  const r = spawnSync("ffmpeg", args, { stdio: "pipe" });
  if (r.status !== 0) {
    console.error("ffmpeg failed:", r.stderr?.toString().slice(-700));
    if (!allowFail) process.exit(1);
  }
}

function extractLastFrame(videoPath, outPng) {
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", videoPath]);
  const dur = parseFloat(probe.stdout.toString().trim());
  const t = Math.max(dur - 0.1, 0);
  run(["-y", "-ss", String(t), "-i", videoPath, "-vframes", "1", outPng]);
}

// C11: Status-Bar für Review-Scene exakt wie take2_samsung.html (nur Zeit dynamisch).
async function renderStatusBarAt(outPath, timeLabel) {
  const html = `<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:412px;height:36px;background:#fff;font-family:'Segoe UI',Roboto,system-ui,sans-serif;overflow:hidden}
    .status-bar{display:flex;align-items:center;justify-content:space-between;height:100%;padding:0 26px;color:#1a1a1a;font-size:13px;font-weight:500}
    .status-right{display:flex;align-items:center;gap:6px}
    .status-right svg{display:block}
    .battery{background:#2a2a2a;color:#fff;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;display:inline-flex;align-items:center;gap:2px;}
    .battery svg{flex-shrink:0}
  </style></head><body>
    <div class="status-bar">
      <span>${timeLabel}</span>
      <div class="status-right">
        <!-- Mute-X -->
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a1a1a" opacity="0.9"><path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/></svg>
        <!-- WiFi -->
        <svg width="15" height="12" viewBox="0 0 24 20" fill="#1a1a1a"><path d="M12 3C7.5 3 3.4 4.8 0 7.4l12 15 12-15C20.6 4.8 16.5 3 12 3z"/></svg>
        <!-- Signal bars -->
        <svg width="14" height="12" viewBox="0 0 24 18" fill="#1a1a1a"><rect x="1" y="12" width="3" height="5"/><rect x="6" y="8" width="3" height="9"/><rect x="11" y="4" width="3" height="13"/><rect x="16" y="0" width="3" height="17"/></svg>
        <!-- Battery Pill with green bolt -->
        <span class="battery"><svg width="7" height="10" viewBox="0 0 24 24" fill="#22c55e"><path d="M7 2v11h3v9l7-12h-4l3-8z"/></svg>86</span>
      </div>
    </div>
  </body></html>`;
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 36 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(html);
    await page.waitForTimeout(150);
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 412, height: 36 } });
    await ctx.close();
  } finally {
    await browser.close();
  }
  return outPath;
}

// ── Phone-Composite (BG + Platter + Phone mit Bezel) ──
function buildCompositeWithPhone(bgVideoPath, phoneVideoPath, outPath, opts = {}) {
  const { slideIn = true, from = "topright", bezelPath, contentMaskPath, platterPath, holdSeconds } = opts;
  const lastFramePng = bgVideoPath + ".lastframe.png";
  extractLastFrame(bgVideoPath, lastFramePng);

  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", phoneVideoPath]);
  const phoneDur = parseFloat(probe.stdout.toString().trim());
  const totalDur = Math.max(phoneDur, holdSeconds || phoneDur);

  const X_target = 760;
  const Y_target = 90;
  const animLen = 1.0;
  const u = `min(max(t/${animLen},0),1)`;

  // C29: Phone-Platter 356×746 wird 8px ausserhalb des Phones platziert (Bezel 340×730 @ (8,8) in platter)
  const platterOffsetX = 8;
  const platterOffsetY = 8;

  let xExpr, yExpr, xExprPlatter, yExprPlatter;
  if (slideIn && from === "topright") {
    xExpr = `if(lt(t,${animLen}),1440-pow(${u},2)*(1440-${X_target}),${X_target})`;
    yExpr = `if(lt(t,${animLen}),-20*pow(1-${u},2)+2*${u}*(1-${u})*${Y_target}+pow(${u},2)*${Y_target},${Y_target})`;
    xExprPlatter = `if(lt(t,${animLen}),1440-pow(${u},2)*(1440-${X_target - platterOffsetX}),${X_target - platterOffsetX})`;
    yExprPlatter = `if(lt(t,${animLen}),-20*pow(1-${u},2)+2*${u}*(1-${u})*${Y_target - platterOffsetY}+pow(${u},2)*${Y_target - platterOffsetY},${Y_target - platterOffsetY})`;
  } else {
    xExpr = String(X_target);
    yExpr = String(Y_target);
    xExprPlatter = String(X_target - platterOffsetX);
    yExprPlatter = String(Y_target - platterOffsetY);
  }

  // Filter chain mit Platter-Backstop:
  // [0] BG → scale [bg]
  // [1] Phone content → rounded mask → padded [phpad]
  // [2] Bezel → [phfull]
  // [3] contentMask
  // [4] Platter → [platter]
  // [bg][platter]overlay → [bgpl]
  // [bgpl][phfull]overlay → [out]
  const filters = [];
  filters.push("[0:v]fps=30,scale=1440:900,setsar=1[bg]");
  if (contentMaskPath) {
    filters.push("[1:v]fps=30,scale=320:712,setsar=1,format=yuva420p[phraw]");
    filters.push("[3:v]format=gray,scale=320:712[cmask]");
    filters.push("[phraw][cmask]alphamerge[phclip]");
    filters.push("[phclip]pad=340:730:10:9:color=black@0[phpad]");
  } else {
    filters.push("[1:v]fps=30,scale=320:712,setsar=1,pad=340:730:10:9:color=black@0[phpad]");
  }
  if (bezelPath) {
    filters.push("[2:v]scale=340:730,setsar=1[bezel]");
    filters.push("[phpad][bezel]overlay=0:0[phfull]");
  } else {
    filters.push("[phpad]null[phfull]");
  }
  // Platter underneath (Index 4 wenn beides bezel+contentMask da)
  if (platterPath) {
    filters.push("[4:v]scale=356:746,setsar=1[platter]");
    filters.push(`[bg][platter]overlay=x='${xExprPlatter}':y='${yExprPlatter}':shortest=1[bgpl]`);
    filters.push(`[bgpl][phfull]overlay=x='${xExpr}':y='${yExpr}':shortest=1`);
  } else {
    filters.push(`[bg][phfull]overlay=x='${xExpr}':y='${yExpr}':shortest=1`);
  }

  const inputs = [
    "-y",
    "-loop", "1", "-t", String(totalDur), "-i", lastFramePng,
    "-i", phoneVideoPath,
  ];
  if (bezelPath) inputs.push("-loop", "1", "-i", bezelPath);
  if (contentMaskPath) inputs.push("-loop", "1", "-i", contentMaskPath);
  if (platterPath) inputs.push("-loop", "1", "-i", platterPath);
  inputs.push(
    "-filter_complex", filters.join(";"),
    "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p",
    "-t", String(totalDur),
    outPath,
  );
  run(inputs);
}

// ── Samsung-Chrome Overlay für Review-Scene (Status-Bar 36 top + Nav 56 bottom).
// 412×914 (yuv420p braucht gerade Höhe). Nav bei y=914-56=858. ──
function overlayPhoneChrome(inputVideo, outputVideo, statusBarPng, samsungNavPng) {
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", inputVideo]);
  const dur = parseFloat(probe.stdout.toString().trim());
  run([
    "-y",
    "-i", inputVideo,
    "-loop", "1", "-t", String(dur), "-i", statusBarPng,
    "-loop", "1", "-t", String(dur), "-i", samsungNavPng,
    "-filter_complex",
    "[0:v]fps=30,scale=412:914,setsar=1[base];" +
    "[base][1:v]overlay=0:0[s1];" +
    "[s1][2:v]overlay=0:858:format=auto[out]",
    "-map", "[out]",
    "-t", String(dur),
    "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p",
    outputVideo,
  ]);
}

// ── Render helpers ──
console.log(`\n== Take 4 Final Compose (${slug}) ==`);

const bezelPath = await renderPhoneBezel({ outDir: outBase });
console.log(`  ✓ Bezel: ${bezelPath}`);

const bezelHelper = await import("./_lib/renderPhoneBezel.mjs");
// C24: Content-Mask radius 46 (vorher 40) — matches bezel outer curve, kein Edge-Bleed
const contentMaskPath = await bezelHelper.ensureContentMask({
  outDir: outBase, width: 320, height: 712, radius: 46,
});
console.log(`  ✓ Content mask: ${contentMaskPath}`);

// C29: Phone-Platter als Backstop — deckt Leitsystem-Hintergrund an Bezel-Außenecken
const phonePlatterPath = await bezelHelper.ensurePhonePlatter({
  outDir: outBase, width: 356, height: 746, radius: 52, color: "#070a12",
});
console.log(`  ✓ Phone platter: ${phonePlatterPath}`);

const samsungNavPath = await ensureSamsungNav({ outDir: outBase });
console.log(`  ✓ Samsung nav: ${samsungNavPath}`);

// Windows Toast (A18 + C12: Dörfler AG + Navy/Gold)
const toastPath = await renderWindowsToast({
  outDir: outBase,
  tenantName: t.name,
  title: "Bewertung erhalten",
  stars: 5,
  reporter: "Gunnar Wende",
  snippet: "Schnell & zuverlässig. Saubere Arbeit.",
  brandNavy: t.brand_color || "#0b1220",
  brandGold: "#d4a853",
});
console.log(`  ✓ Windows toast: ${toastPath}`);

// C26: Synthetisches Admin-Profil — wird OBERHALB der drawbox überlagert
// damit Sidebar-Navbereich nicht nackt wirkt.
const profilePath = await renderSidebarProfile({
  outDir: outBase,
  adminName: "Admin",
  adminEmail: "gunnar.wende@flowsight.ch",
  initial: "A",
});
console.log(`  ✓ Sidebar profile overlay: ${profilePath}`);

// Zeit-SSOT aus demo_time (skip gate hier — insert_take4_lifecycle hat schon geprüft)
const dt = getDemoTimes({ skipGate: true });
const TAG_AKT1    = `${formatDayShort(dt.demoNow)} ${formatTimeShort(dt.demoNow)}`;
const TAG_PHONE1  = `${formatDayShort(dt.reminderSent)} ${formatTimeShort(dt.reminderSent)}`;
const TAG_AKT2    = `${formatDayShort(dt.completionTime)} ${formatTimeShort(dt.completionTime)}`;
const TAG_PHONE2  = `${formatDayShort(dt.reviewSentTime)} ${formatTimeShort(dt.reviewSentTime)}`;
const TAG_REVIEW  = `${formatDayShort(dt.reviewRatedTime)} ${formatTimeShort(dt.reviewRatedTime)}`;
const TAG_CLOSING = `${formatDayShort(dt.reviewRatedTime)} ${formatTimeShort(dt.reviewRatedTime)}`;
console.log(`  Demo-Tag Labels: Akt1=${TAG_AKT1} · Phone1=${TAG_PHONE1} · Akt2=${TAG_AKT2} · Phone2=${TAG_PHONE2} · Review=${TAG_REVIEW}`);

// Status-Bar für Review (Review-Rated-Zeit)
const statusBarReviewPath = join(outBase, "_status_bar_review.png");
await renderStatusBarAt(statusBarReviewPath, formatTimeShort(dt.reviewRatedTime));
console.log(`  ✓ Review status bar @ ${formatTimeShort(dt.reviewRatedTime)}`);

// Review-Scene mit Samsung-Chrome wrappen (Status-Bar oben + Nav unten)
const reviewFramed = join(outBase, "_review_framed.mp4");
overlayPhoneChrome(files.review, reviewFramed, statusBarReviewPath, samsungNavPath);
console.log(`  ✓ Review framed: ${reviewFramed}`);

// Composite 1: Akt1 last-frame + phone1 (Bogen von oben rechts)
const scenePhone1 = join(outBase, "_scene_phone1.mp4");
console.log("\n── Composite 1: Phone Day+1 (Bogen) ──");
buildCompositeWithPhone(files.akt1, files.phone1, scenePhone1, {
  from: "topright", slideIn: true, bezelPath, contentMaskPath,
});

// Composite 2: Akt2 last-frame + phone2 (instant pop)
const scenePhone2 = join(outBase, "_scene_phone2.mp4");
console.log("\n── Composite 2: Phone Day+2 (instant) ──");
buildCompositeWithPhone(files.akt2, files.phone2, scenePhone2, {
  slideIn: false, bezelPath, contentMaskPath,
});

// Composite 3: Akt2 last-frame + review-framed (A12 D15 → Handy rein)
const sceneReview = join(outBase, "_scene_review.mp4");
console.log("\n── Composite 3: Review (aus live /review, Samsung-Chrome overlay) ──");
buildCompositeWithPhone(files.akt2, reviewFramed, sceneReview, {
  slideIn: false, bezelPath, contentMaskPath,
});

// C2 + C5: KEINE Tag-Chip-Overlays (Zeit muss aus Leitsystem-UI konsistent sein).
// Brand-Cut (C5) komplett aus Parts-Array — direkter Übergang akt1 → phone1.
const parts = [
  { path: files.akt1,    tagLabel: "" },
  { path: scenePhone1,   tagLabel: "" },
  { path: files.akt2,    tagLabel: "" },
  { path: scenePhone2,   tagLabel: "" },
  { path: sceneReview,   tagLabel: "" },
  { path: files.closing, tagLabel: "", withToast: true },
];

const complete = join(outBase, "take4_complete.mp4");

console.log("\n── Final Concat (7 Parts) ──");

const ffInputs = [];
for (const p of parts) ffInputs.push("-i", p.path);

// Toast input (vorletzter Input) — mit -t an Closing-Dauer binden, damit overlay nicht endlos läuft
const probeClose = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", files.closing]);
const closeDur = parseFloat(probeClose.stdout.toString().trim()) || 15.0;
ffInputs.push("-loop", "1", "-t", String(closeDur), "-i", toastPath);
const toastIdx = parts.length;

// C26: Sidebar-Profile PNG als Input für alle Scenes
ffInputs.push("-loop", "1", "-i", profilePath);
const profileIdx = toastIdx + 1;

// Colon-Escape für drawtext
const escapeTag = (s) => s.replace(/:/g, "\\:");

const FONT_PATH = "C\\:/Windows/Fonts/arialbd.ttf";
const tagDraw = (label) =>
  `drawtext=fontfile='${FONT_PATH}':text='${escapeTag(label)}':x=W-tw-30:y=30:fontsize=20:` +
  `fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=10`;

// A18 Windows Toast: slide-in from right, hold, slide-out. Last 2s of closing scene.
// Toast size 420×120, target position bottom-right (x=1000, y=760).
// Closing-Scene-Dauer wird probed, toast overlays in Frist [dur-2, dur]
function buildClosingFilter(inputIdx, tagLabel) {
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", files.closing]);
  const closingDur = parseFloat(probe.stdout.toString().trim()) || 7.0;
  const T_IN_START = Math.max(0, closingDur - 3.0);  // slide-in begins 3s before end
  const T_IN_END = T_IN_START + 0.4;                 // slide-in completes in 400ms
  const T_OUT_START = closingDur - 0.6;              // slide-out 600ms before end
  const T_OUT_END = closingDur;                      // off-screen at end

  // x-position: off-screen (1440) → visible (1000) → off-screen (1440)
  const p_in = `((t-${T_IN_START.toFixed(2)})/0.4)`;
  const p_out = `((t-${T_OUT_START.toFixed(2)})/0.6)`;
  const xExpr =
    `if(lt(t,${T_IN_START.toFixed(2)}),1440,` +
    `if(lt(t,${T_IN_END.toFixed(2)}),1440-440*${p_in},` +
    `if(lt(t,${T_OUT_START.toFixed(2)}),1000,` +
    `if(lt(t,${T_OUT_END.toFixed(2)}),1000+440*${p_out},1440))))`;

  const trimPart = "trim=start=1.5,setpts=PTS-STARTPTS,";
  const tagSuffix = tagLabel ? `,${tagDraw(tagLabel)}` : "";
  const hidePart = "drawbox=x=0:y=780:w=155:h=120:color=#010610:t=fill";
  // C26: Profile-Overlay auch im Closing
  return {
    closingBase: `[${inputIdx}:v]fps=30,scale=1440:900,setsar=1,${trimPart}${hidePart}[cl_dbx];` +
                 `[cl_dbx][${profileIdx}:v]overlay=x=5:y=700:shortest=1:format=auto${tagSuffix}[cl_tagged]`,
    closingComposite: `[cl_tagged][${toastIdx}:v]overlay=x='${xExpr}':y=760:shortest=1:format=auto[p${inputIdx}]`,
  };
}

// C18/C20/C21: Drawbox PERMANENT auf ALLEN Scenes (auch Phone-Composite) damit
// Admin/Abmelden/Issue-Badge nie sichtbar. Exakte Sidebar-Farbe + 155×120.
const hideDevBadge = "drawbox=x=0:y=780:w=155:h=120:color=#010610:t=fill";

const filters = [];
for (let i = 0; i < parts.length; i++) {
  const p = parts[i];
  const isLeitsystem = p.path === files.akt1 || p.path === files.akt2;
  const trimStart = p.path === files.akt1 ? "3.0" : "1.5";
  const trim = isLeitsystem ? `trim=start=${trimStart},setpts=PTS-STARTPTS,` : "";
  if (p.withToast) {
    const { closingBase, closingComposite } = buildClosingFilter(i, p.tagLabel);
    filters.push(closingBase);
    filters.push(closingComposite);
  } else {
    const tagSuffix = p.tagLabel ? `,${tagDraw(p.tagLabel)}` : "";
    // C21+C26: Drawbox PERMANENT + Admin-Profile-Overlay (x=5, y=700, over drawbox)
    filters.push(
      `[${i}:v]fps=30,scale=1440:900,setsar=1,${trim}${hideDevBadge}[p${i}_dbx];` +
      `[p${i}_dbx][${profileIdx}:v]overlay=x=5:y=700:shortest=1:format=auto${tagSuffix}[p${i}]`
    );
  }
}

const labels = parts.map((_, i) => `[p${i}]`).join("");
const concatFilter = filters.join(";") + ";" + labels + `concat=n=${parts.length}:v=1[out]`;

run([
  "-y", ...ffInputs,
  "-filter_complex", concatFilter,
  "-map", "[out]",
  "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
  complete,
]);

const size = statSync(complete).size;
console.log(`\n✓ ${complete} (${(size / 1024 / 1024).toFixed(1)} MB)`);
console.log(`  file:///${complete.replace(/\\/g, "/")}`);
