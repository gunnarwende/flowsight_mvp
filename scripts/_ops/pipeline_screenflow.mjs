#!/usr/bin/env node
/**
 * pipeline_screenflow.mjs — Ein-Befehl-Runner für Take 2 + Take 3 Screenflow-Produktion.
 *
 * Läuft sequentiell:
 *   Seed → Status-Bar → Take 2 (Samsung + Leitsystem) → Splice Take 2
 *                    → Insert Wizard-Case (nur bei Take 3) → Take 3 (Wizard + Leitsystem) → Splice Take 3
 *
 * Produziert komplette Videos für einen Betrieb:
 *   --take 2    → nur Take 2 (~90s)
 *   --take 3    → nur Take 3 (benötigt bereits vorhandenes Take-2-Seed)
 *   --take all  → Take 2 + Take 3 gemeinsam (~3 min, durchgehende Chronologie)
 *
 * Usage:
 *   APP_URL=http://localhost:3000 node --env-file=src/web/.env.local \
 *     scripts/_ops/pipeline_screenflow.mjs --slug <slug> [--take 2|3|all]
 */

import { spawnSync } from "node:child_process";
import { existsSync, statSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { ensureCircleMask, buildCircleLoomFilter } from "./_lib/renderLoomCircle.mjs";

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1] ||
  (() => { const i = args.indexOf("--slug"); return i >= 0 ? args[i + 1] : null; })();
const take = args.find((a) => a.startsWith("--take"))?.split("=")[1] ||
  (() => { const i = args.indexOf("--take"); return i >= 0 ? args[i + 1] : null; })() || "2";

if (!slug) {
  console.error("Usage: pipeline_screenflow.mjs --slug <slug> [--take 2|3|all]");
  process.exit(1);
}

const envFile = "--env-file=src/web/.env.local";
const node = process.execPath;
const screenflowDir = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);

// Loom/Face source — hoisted so Take 2 compose can reference it inline.
const loomSource = join("docs", "gtm", "pipeline", "06_video_production",
  "video_example", "Video_default.mp4");

function runStep(name, cmd, args) {
  const start = Date.now();
  console.log(`\n═══ ${name} ═══`);
  const r = spawnSync(cmd, args, { stdio: "inherit", env: { ...process.env } });
  const secs = ((Date.now() - start) / 1000).toFixed(1);
  if (r.status !== 0) {
    console.error(`\n❌ ${name} failed (exit ${r.status}) after ${secs}s`);
    process.exit(r.status || 1);
  }
  console.log(`✅ ${name} done (${secs}s)`);
}

// Universeller scrcpy App-Open Clip (Dörfler-Master) — für Take 2 Splice.
const masterClip = join("docs", "gtm", "pipeline", "06_video_production",
  "screenflows", "doerfler-ag", "_app_open_clip.mp4");
const slugClip = join(screenflowDir, "_app_open_clip.mp4");

function ensureAppOpenClip() {
  if (!existsSync(slugClip)) {
    if (!existsSync(masterClip)) {
      console.error(`❌ Master App-Open Clip nicht gefunden: ${masterClip}`);
      process.exit(1);
    }
    copyFileSync(masterClip, slugClip);
    console.log(`✓ App-Open Clip von Master (Dörfler) kopiert nach ${slugClip}`);
  }
}

const runTake2 = take === "2" || take === "all";
const runTake3 = take === "3" || take === "all";
const runTake4 = take === "4" || take === "all";

// ══════════════════════════════════════════════════════════════════════════
// STEP 1: Seed — DB + _seed_time (nur bei Take 2 oder all)
// ══════════════════════════════════════════════════════════════════════════
if (runTake2) {
  runStep("STEP 1: Seed Screenflow DB", node, [
    envFile, "scripts/_ops/seed_screenflow_from_config.mjs", `--slug=${slug}`,
  ]);
} else {
  console.log("\n(Take 3-only: Seed wird übersprungen — Take-2-State muss bereits existieren)");
}

// ══════════════════════════════════════════════════════════════════════════
// STEP 2: Status-Bar PNG rendern (synchron zu _seed_time) — nur für Take 2
// ══════════════════════════════════════════════════════════════════════════
if (runTake2) {
  runStep("STEP 2: Render Samsung Status-Bar", node, [
    envFile, "scripts/_ops/render_status_bar.mjs", `--slug=${slug}`,
  ]);
}

// ══════════════════════════════════════════════════════════════════════════
// TAKE 2 PRODUCE + SPLICE
// ══════════════════════════════════════════════════════════════════════════
if (runTake2) {
  runStep("STEP 3 (Take 2): Produce Samsung + Leitsystem", node, [
    envFile, "scripts/_ops/produce_screenflow.mjs", `--slug=${slug}`, `--take=2`,
  ]);

  ensureAppOpenClip();

  const samsungPath = join(screenflowDir, "take2_samsung.webm");
  const leitPath = join(screenflowDir, "take2_leitsystem.webm");
  const statusBarPath = join(screenflowDir, "status_bar.png");
  const completePath = join(screenflowDir, "take2_complete.mp4");

  for (const p of [samsungPath, slugClip, leitPath, statusBarPath]) {
    if (!existsSync(p)) {
      console.error(`❌ Fehlende Datei für Take-2-Splice: ${p}`);
      process.exit(1);
    }
  }

  // A1/A2/A3/A4 Rebuild:
  //   - Phone bezel + content scaled up to 400×860 (fills 95% vertical)
  //   - Content clipped to rounded rect (320×712 rx=40) → kein Bezel-Eck-Bleed (A4)
  //   - Face fix rechts neben Phone, top-aligned (keine Animation)
  //   - Combined phone+face (400 + 30 gap + 300) = 730 wide, centered in 1440×900
  const bezelHelper = await import("./_lib/renderPhoneBezel.mjs");
  const bezelPath = await bezelHelper.renderPhoneBezel({ outDir: screenflowDir });
  const contentMaskPath = await bezelHelper.ensureContentMask({
    outDir: screenflowDir, width: 320, height: 712, radius: 40,
  });
  console.log(`── Phone bezel: ${bezelPath}`);
  console.log(`── Content mask (rounded): ${contentMaskPath}`);

  const tmpMobile = join(screenflowDir, "_take2_mobile_tmp.mp4");
  runStep("STEP 4a (Take 2): Concat 3 mobile parts", "ffmpeg", [
    "-y",
    "-ss", "0.3", "-i", samsungPath,
    "-i", slugClip,
    "-ss", "2.0", "-i", leitPath,
    "-loop", "1", "-t", "60", "-i", statusBarPath,
    "-filter_complex",
    "[0:v]fps=30,scale=412:914,setsar=1,setpts=PTS-STARTPTS[s];" +
    "[1:v]fps=30,scale=412:914,setsar=1,setpts=PTS-STARTPTS[c];" +
    "[2:v]fps=30,scale=412:878,setsar=1,setpts=PTS-STARTPTS[lscaled];" +
    "[3:v]fps=30,scale=412:36,setsar=1[bar];" +
    "[bar][lscaled]vstack[l];" +
    "[s][c][l]concat=n=3:v=1[out]",
    "-map", "[out]",
    "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p",
    tmpMobile,
  ]);

  // Stufe 2: Phone (bezel+content) vergrößert + Face fix overlay.
  const durProbe = spawnSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", tmpMobile,
  ]);
  const tmpDur = parseFloat(durProbe.stdout.toString().trim()) || 90;

  // B5: Face 15% kleiner (300→260) + korrekte Aspect-Ratio via buildCircleLoomFilter
  // (force_original_aspect_ratio=increase + crop → kein "Spargel/Banane"-Effekt).
  const FACE_DIAMETER = 260;
  const { circleMaskPng: faceMask } = ensureCircleMask({
    outDir: screenflowDir, diameter: FACE_DIAMETER,
  });
  const faceFilter = buildCircleLoomFilter({
    loomIdx: 4, maskIdx: 5, diameter: FACE_DIAMETER, label: "facec",
  });

  // Layout (1440×900 Canvas) — B5 rekalibiriert für 260px Face:
  //   Combined: Phone 400 + Gap 30 + Face 260 = 690 → margin (1440-690)/2 = 375
  //   Phone:  x=375, y=20  (400×860)
  //   Face:   x=805, y=20  (260×260, top-aligned mit Phone)
  runStep("STEP 4b (Take 2): Bezel+Face on 1440×900 Canvas (A1-A4/B5)", "ffmpeg", [
    "-y",
    "-i", tmpMobile,                                                // [0] content 412×914
    "-loop", "1", "-t", String(tmpDur), "-i", bezelPath,           // [1] bezel 340×730
    "-f", "lavfi", "-t", String(tmpDur), "-i", "color=c=#0b1220:size=1440x900:rate=30", // [2] navy bg
    "-loop", "1", "-t", String(tmpDur), "-i", contentMaskPath,     // [3] content mask 320×712
    "-stream_loop", "-1", "-i", loomSource,                         // [4] face source
    "-loop", "1", "-t", String(tmpDur), "-i", faceMask,            // [5] face mask
    "-filter_complex",
    // Content clip to rounded rect
    "[0:v]fps=30,scale=320:712,setsar=1,format=yuva420p[phraw];" +
    "[3:v]format=gray,scale=320:712[cmask];" +
    "[phraw][cmask]alphamerge[phclip];" +
    // Pad to 340×730 (bezel canvas), then scale up bezel+content to 400×860
    "[phclip]pad=340:730:10:9:color=black@0[phpad];" +
    "[phpad]scale=400:860,setsar=1[phup];" +
    "[1:v]scale=400:860,setsar=1[bezelup];" +
    "[phup][bezelup]overlay=0:0:format=auto[phfull];" +
    // Face circle
    faceFilter + ";" +
    // Compose on canvas (B5 Layout)
    "[2:v][phfull]overlay=x=375:y=20[bgp];" +
    "[bgp][facec]overlay=x=805:y=20:format=auto[out]",
    "-map", "[out]",
    "-t", String(tmpDur),
    "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p",
    completePath,
  ]);

  const size = statSync(completePath).size;
  console.log(`\n── Take 2 Complete: ${completePath} (${(size / 1024 / 1024).toFixed(1)} MB)`);
}

// ══════════════════════════════════════════════════════════════════════════
// TAKE 3: INSERT WIZARD-CASE + PRODUCE + SPLICE
// ══════════════════════════════════════════════════════════════════════════
if (runTake3) {
  // Step 3a: Insert Wizard-Case into existing Take-2-Seed-State (seq=50, +30min).
  runStep("STEP 5 (Take 3): Insert Wizard-Case (+30min)", node, [
    envFile, "scripts/_ops/insert_take3_wizard_case.mjs", `--slug=${slug}`,
  ]);

  // Step 3b: Produce Wizard recording (Desktop 1280×720 + mocked submit).
  runStep("STEP 6 (Take 3): Record Wizard Flow", node, [
    envFile, "scripts/_ops/record_wizard_take3.mjs", `--slug=${slug}`,
  ]);

  // Step 3c: Produce Leitsystem recording (Desktop 1280×720, shows new DA-0050).
  runStep("STEP 7 (Take 3): Record Leitsystem", node, [
    envFile, "scripts/_ops/record_leitsystem_take3.mjs", `--slug=${slug}`,
  ]);

  // Step 3d: FFmpeg splice Wizard + Leitsystem — Desktop, no status-bar overlay.
  const wizardPath = join(screenflowDir, "take3_wizard.webm");
  const leitPath3 = join(screenflowDir, "take3_leitsystem.webm");
  const complete3Path = join(screenflowDir, "take3_complete.mp4");

  for (const p of [wizardPath, leitPath3]) {
    if (!existsSync(p)) {
      console.error(`❌ Fehlende Datei für Take-3-Splice: ${p}`);
      process.exit(1);
    }
  }

  // C18+C26 Konsistenz zu Take 4: Nach der Leitsystem-Einblendung braucht Take 3
  // dieselben Sidebar-Fixes wie Take 4 — drawbox für Dev-Badge + Admin-Profil-Overlay.
  // Wir wenden beide via enable='gte(t,Wt)' nur auf den Leitsystem-Part an (ab t=Wt).
  // Wt = wizard-Dauer nach trim.
  const bezelHelper3 = await import("./_lib/renderPhoneBezel.mjs");
  const { renderSidebarProfile: renderProfile3 } = await import("./_lib/renderSidebarProfile.mjs");
  const profilePath3 = await renderProfile3({
    outDir: screenflowDir,
    adminName: "Admin",
    adminEmail: "gunnar.wende@flowsight.ch",
    initial: "A",
  });

  const probeWiz3 = spawnSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", wizardPath,
  ]);
  const wizFullDur3 = parseFloat(probeWiz3.stdout.toString().trim()) || 34.0;
  const Wt = Math.max(10, wizFullDur3 - 2.0); // Wizard-Ende im Splice

  runStep("STEP 8 (Take 3): FFmpeg Splice Wizard → Leitsystem + Sidebar-Fix", "ffmpeg", [
    "-y",
    "-ss", "2.0", "-i", wizardPath,
    "-ss", "2.0", "-i", leitPath3,
    "-loop", "1", "-i", profilePath3,
    "-filter_complex",
    "[0:v]fps=30,scale=1440:900,setsar=1,setpts=PTS-STARTPTS[w];" +
    "[1:v]fps=30,scale=1440:900,setsar=1,setpts=PTS-STARTPTS[l];" +
    "[w][l]concat=n=2:v=1[concat];" +
    // Drawbox + Profile-Overlay NUR ab t>=Wt (Leitsystem-Phase)
    `[concat]drawbox=x=0:y=780:w=155:h=120:color=#010610:t=fill:enable='gte(t,${Wt.toFixed(1)})'[boxed];` +
    `[boxed][2:v]overlay=x=5:y=700:shortest=1:format=auto:enable='gte(t,${Wt.toFixed(1)})'[out]`,
    "-map", "[out]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
    complete3Path,
  ]);

  const size3 = statSync(complete3Path).size;
  console.log(`\n── Take 3 Complete (Sidebar-Fix @ t>=${Wt.toFixed(1)}s): ${complete3Path} (${(size3 / 1024 / 1024).toFixed(1)} MB)`);
}

// ══════════════════════════════════════════════════════════════════════════
// TAKE 4: LIFECYCLE PREP + RECORD ALL PARTS + SPLICE
// ══════════════════════════════════════════════════════════════════════════
if (runTake4) {
  // Step 4a: Lifecycle-Prep (reset case + HMAC token + timing metadata).
  runStep("STEP 9 (Take 4): Lifecycle-Prep", node, [
    envFile, "scripts/_ops/insert_take4_lifecycle.mjs", `--slug=${slug}`,
  ]);

  // Step 4b: Record 6 Parts (Take 4 v2 flow: Akt1, Cut, Phone Day+1, Akt2, Phone Day+2, Review).
  runStep("STEP 10 (Take 4): Record 6 Parts", node, [
    envFile, "scripts/_ops/record_take4.mjs", `--slug=${slug}`,
  ]);

  // Step 4c: Compose split-screen + concat (done by compose_take4_final.mjs)
  runStep("STEP 11 (Take 4): Compose Final (Split-Screen + Concat)", node, [
    "scripts/_ops/compose_take4_final.mjs", `--slug=${slug}`,
  ]);
}

// Skip the old 8-part splice block — replaced by compose_take4_final.mjs above.
if (false) {

  // Step 4c: FFmpeg splice all parts into take4_complete.mp4.
  // Flow:
  //   [Akt1 (1440×900)] → [Jump1 (1440×900)] → [SMS-Step (412×915, vstack status-bar)]
  //                     → [Jump2 (1440×900)] → [Akt2 (1440×900)] → [SMS-Final (412×915)]
  //                     → [Review (412×915)] → [Endscreen (1440×900)]
  //
  // Mobile-Parts (412×915) werden auf 1440×900-Viewport zentriert (schwarzer Hintergrund
  // oder ggf. Brand-Color Frame).
  const akt1 = join(screenflowDir, "take4_akt1.webm");
  const jump1 = join(screenflowDir, "take4_jump1.webm");
  const smsStep = join(screenflowDir, "take4_sms_step.webm");
  const jump2 = join(screenflowDir, "take4_jump2.webm");
  const akt2 = join(screenflowDir, "take4_akt2.webm");
  const smsFinal = join(screenflowDir, "take4_sms_final.webm");
  const review = join(screenflowDir, "take4_review.webm");
  const endscreen = join(screenflowDir, "take4_endscreen.webm");
  const statusBarPath = join(screenflowDir, "status_bar.png");
  const complete4Path = join(screenflowDir, "take4_complete.mp4");

  for (const p of [akt1, jump1, smsStep, jump2, akt2, smsFinal, review, endscreen]) {
    if (!existsSync(p)) {
      console.error(`❌ Fehlende Datei für Take-4-Splice: ${p}`);
      process.exit(1);
    }
  }

  // Mobile-to-Desktop-Frame-Filter:
  //   Samsung 412×915 → scale zu 412×900 (Höhe cap) → vstack status-bar (36px oben) → pad auf 1440×900 centered
  //   Status-Bar wird nur für SMS-Teile genutzt. Review = auch Samsung-Viewport mit Status-Bar.
  const mobileFilterFor = (inputIdx) =>
    `[${inputIdx}:v]fps=30,scale=412:864,setsar=1[m${inputIdx}raw];` +
    `[${inputIdx + 100}:v]fps=30,scale=412:36,setsar=1[m${inputIdx}bar];` +
    `[m${inputIdx}bar][m${inputIdx}raw]vstack[m${inputIdx}v];` +
    `[m${inputIdx}v]pad=1440:900:(ow-iw)/2:(oh-ih)/2:#0b1220,setpts=PTS-STARTPTS[p${inputIdx}]`;

  const desktopFilterFor = (inputIdx) =>
    `[${inputIdx}:v]fps=30,scale=1440:900,setsar=1,setpts=PTS-STARTPTS[p${inputIdx}]`;

  // Build filter_complex: 8 parts, each either mobile or desktop.
  // Order: 0=akt1(D), 1=jump1(D), 2=smsStep(M), 3=jump2(D), 4=akt2(D), 5=smsFinal(M), 6=review(M), 7=endscreen(D)
  // Mobile parts need status-bar (input index 8..10: one per mobile clip).
  // Alle Parts sind jetzt Desktop 1440×900 (SMS mit Phone-Mockup, Review auch).
  // Review ist aber noch Mobile 412×915 — wird mit vstack+pad auf 1440×900 gepadded.
  const parts = [
    { path: akt1, mobile: false },
    { path: jump1, mobile: false },
    { path: smsStep, mobile: false },        // Phone-Mockup in 1440×900 Frame
    { path: jump2, mobile: false },
    { path: akt2, mobile: false },
    { path: smsFinal, mobile: false },       // Phone-Mockup in 1440×900 Frame
    { path: review, mobile: false },         // Review nun auch Phone-Mockup 1440×900
    { path: endscreen, mobile: false },
  ];

  const ffInputs = [];
  for (const p of parts) ffInputs.push("-i", p.path);
  ffInputs.push("-loop", "1", "-t", "60", "-i", statusBarPath);
  const barIdx = parts.length;

  const filters = [];
  const concatLabels = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].mobile) {
      filters.push(
        `[${i}:v]fps=30,scale=412:864,setsar=1[m${i}c];` +
        `[${barIdx}:v]fps=30,scale=412:36,setsar=1[m${i}b];` +
        `[m${i}b][m${i}c]vstack[m${i}v];` +
        `[m${i}v]pad=1440:900:(ow-iw)/2:(oh-ih)/2:#0b1220,setsar=1,setpts=PTS-STARTPTS[p${i}]`
      );
    } else {
      filters.push(`[${i}:v]fps=30,scale=1440:900,setsar=1,setpts=PTS-STARTPTS[p${i}]`);
    }
    concatLabels.push(`[p${i}]`);
  }
  const concatExpr = concatLabels.join("") + `concat=n=${parts.length}:v=1[out]`;
  const fullFilter = filters.join(";") + ";" + concatExpr;

  runStep("STEP 11 (Take 4): FFmpeg Splice 8 Parts", "ffmpeg", [
    "-y", ...ffInputs,
    "-filter_complex", fullFilter,
    "-map", "[out]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
    complete4Path,
  ]);

  const size4 = statSync(complete4Path).size;
  console.log(`\n── Take 4 Complete: ${complete4Path} (${(size4 / 1024 / 1024).toFixed(1)} MB)`);
} // end if (false) — old 8-part splice disabled

// ══════════════════════════════════════════════════════════════════════════
// LOOM-PiP FINAL COMPOSE (Take 3 Transition + Take 4 static)
// Circle-masked Loom-PiP pro Take mit individueller Position + Animation.
// Take 2: Face ist bereits in Step 4b inline gebacken — kein separater Pass.
// ══════════════════════════════════════════════════════════════════════════

// B7: Face 15% kleiner (200→170) + korrekte Aspect via buildCircleLoomFilter.
const LOOM_DIAMETER = 170;

function getLoomMask() {
  if (!existsSync(loomSource)) return null;
  const { circleMaskPng } = ensureCircleMask({ outDir: screenflowDir, diameter: LOOM_DIAMETER });
  return circleMaskPng;
}

/**
 * applyLoomPiP(inputPath, outputPath, positionSpec)
 * positionSpec: { kind: 'static' | 'animated',
 *   static: { x, y },
 *   animated: { x: "expression", y: "expression" }  // using t for time
 * }
 */
function applyLoomPiP(inputPath, outputPath, positionSpec) {
  if (!existsSync(loomSource)) {
    console.warn(`⚠ Loom source missing: ${loomSource} — skipping PiP overlay`);
    return;
  }
  const mask = getLoomMask();
  if (!mask) {
    console.warn("⚠ Could not build circle-mask, falling back to no-overlay");
    copyFileSync(inputPath, outputPath);
    return;
  }
  console.log(`\n── LOOM-PiP CIRCLE: ${inputPath} → ${outputPath}`);

  const loomFilter = buildCircleLoomFilter({
    loomIdx: 1, maskIdx: 2, diameter: LOOM_DIAMETER, label: "loomc",
  });

  const overlayX = positionSpec.animated ? positionSpec.animated.x : String(positionSpec.static.x);
  const overlayY = positionSpec.animated ? positionSpec.animated.y : String(positionSpec.static.y);

  const r = spawnSync("ffmpeg", [
    "-y",
    "-i", inputPath,
    "-stream_loop", "-1", "-i", loomSource,
    "-loop", "1", "-i", mask,
    "-filter_complex",
    loomFilter + `;[0:v][loomc]overlay=x='${overlayX}':y='${overlayY}':shortest=1:format=auto[out]`,
    "-map", "[out]",
    "-map", "0:a?",
    "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
    "-c:a", "copy",
    outputPath,
  ], { stdio: "pipe" });
  if (r.status !== 0) {
    console.error("❌ Loom-PiP overlay failed:", r.stderr?.toString().slice(-500));
    return;
  }
  const size = statSync(outputPath).size;
  console.log(`✓ Loom-PiP applied: ${outputPath} (${(size / 1024 / 1024).toFixed(1)} MB)`);
}

// Take 2: Face wurde bereits in Step 4b inline gebacken — kein separater Loom-PiP-Pass nötig.
if (runTake3) {
  // A5 + A8 Rebuild: Face fix an Wizard-Position (rechts oben, bündig unter Hero)
  // während gesamter Wizard-Phase. Nach Wizard-Ende: 1s Hold, dann 2 Moves:
  //   Move 1 = 95% Distance, fast (400ms, ease-out cubic)
  //   Move 2 =  5% Feinjustierung (600ms, smoothstep)
  // Dynamisches Timing basierend auf tatsächlicher Wizard-Länge (-ss 2.0 trim).
  const base = join(screenflowDir, "take3_complete.mp4");
  const out = join(screenflowDir, "take3_with_loom.mp4");

  // Wizard-Dauer ermitteln (webm Länge - 2.0s Trim-Offset).
  const wizardWebm = join(screenflowDir, "take3_wizard.webm");
  const probeWiz = spawnSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", wizardWebm,
  ]);
  const wizFullDur = parseFloat(probeWiz.stdout.toString().trim()) || 34.0;
  const W = Math.max(10, wizFullDur - 2.0);  // wizard-end im Splice-Timeline
  console.log(`── Take 3 Loom: wizard-ende @ t=${W.toFixed(1)}s (dynamisch)`);

  // Positions (1440×900, Loom 200×200)
  //   WZ (Wizard): oben-rechts aber unterhalb Hero, etwas weiter links als reine TR.
  //   INT (95% Moved): lerp(WZ, ML, 0.95)
  //   ML (final mid-left nav): (40, 350)
  const WZ_x = 1150, WZ_y = 180;
  const ML_x = 40,   ML_y = 350;
  const INT_x = Math.round(WZ_x + 0.95 * (ML_x - WZ_x));  // 95 → 95.5
  const INT_y = Math.round(WZ_y + 0.95 * (ML_y - WZ_y));  // 341.5

  // Timing
  const T_HOLD_END  = W + 1.0;   // 1s hold nach Wizard
  const T_MOVE1_END = W + 1.4;   // Move 1 dauert 400ms
  const T_MOVE2_END = W + 2.0;   // Move 2 dauert 600ms

  // Easing
  const easeOutCubic = (p) => `(1-pow(1-(${p}),3))`;    // Move 1: fast start, slow finish
  const smoothstep   = (p) => `(${p})*(${p})*(3-2*(${p}))`; // Move 2: smooth
  const lerp = (a, b, e) => `(${a}+(${b}-${a})*${e})`;

  const p1 = `(t-${T_HOLD_END.toFixed(2)})/0.4`;
  const p2 = `(t-${T_MOVE1_END.toFixed(2)})/0.6`;

  const xExpr =
    `if(lt(t,${T_HOLD_END.toFixed(2)}),${WZ_x},` +
    `if(lt(t,${T_MOVE1_END.toFixed(2)}),${lerp(WZ_x, INT_x, easeOutCubic(p1))},` +
    `if(lt(t,${T_MOVE2_END.toFixed(2)}),${lerp(INT_x, ML_x, smoothstep(p2))},${ML_x})))`;
  const yExpr =
    `if(lt(t,${T_HOLD_END.toFixed(2)}),${WZ_y},` +
    `if(lt(t,${T_MOVE1_END.toFixed(2)}),${lerp(WZ_y, INT_y, easeOutCubic(p1))},` +
    `if(lt(t,${T_MOVE2_END.toFixed(2)}),${lerp(INT_y, ML_y, smoothstep(p2))},${ML_y})))`;

  applyLoomPiP(base, out, { animated: { x: xExpr, y: yExpr } });
}
if (runTake4) {
  // FB99 Übergangs-Zustand: Take 4 startet Loom mitte-links (gleiche Position
  // wie Take 3 Ende). Statisch.
  const base = join(screenflowDir, "take4_complete.mp4");
  const out = join(screenflowDir, "take4_with_loom.mp4");
  applyLoomPiP(base, out, { static: { x: 40, y: 350 } });
}

// ══════════════════════════════════════════════════════════════════════════
// FINAL: Summary
// ══════════════════════════════════════════════════════════════════════════
console.log(`\n═══ PIPELINE COMPLETE ═══`);
if (runTake2) {
  const p = join(screenflowDir, "take2_complete.mp4");
  console.log(`Take 2: ${p}`);
  console.log(`        file:///${p.replace(/\\/g, "/")}`);
}
if (runTake3) {
  const p = join(screenflowDir, "take3_with_loom.mp4");
  const p0 = join(screenflowDir, "take3_complete.mp4");
  console.log(`Take 3 (with Loom): ${existsSync(p) ? p : p0}`);
  console.log(`        file:///${(existsSync(p) ? p : p0).replace(/\\/g, "/")}`);
}
if (runTake4) {
  const p = join(screenflowDir, "take4_with_loom.mp4");
  const p0 = join(screenflowDir, "take4_complete.mp4");
  console.log(`Take 4 (with Loom): ${existsSync(p) ? p : p0}`);
  console.log(`        file:///${(existsSync(p) ? p : p0).replace(/\\/g, "/")}`);
}
