#!/usr/bin/env node
// Phase-Library Generator (generic — works for any take, any industry).
//
// Reads phase definitions from
//   docs/gtm/pipeline/06_video_production/phase_library_defs/take{N}_{industry}.json
// and produces:
//   _generated/phase_library/{tenant}/take{N}/
//     phases/<phase_name>.mp4         ← preview clip (animated)
//     phases/<phase_name>.png         ← sample frame
//     phases.json                     ← machine-readable definitions
//     LIBRARY.html                    ← visual gallery for Founder
//     schedule.template.txt           ← starter schedule for Founder to fill
//
// Usage:
//   node scripts/_ops/audio/phase_library_extract.mjs --tenant doerfler-ag --take 2 --industry sanitaer
//   node scripts/_ops/audio/phase_library_extract.mjs --tenant doerfler-ag --take 3 --industry sanitaer
//   node scripts/_ops/audio/phase_library_extract.mjs --tenant elektriker-meier --take 2 --industry elektriker

import fs from "node:fs";
import path from "node:path";
import { loadEnv, GENERATED, PIPELINE_ROOT, REPO_ROOT } from "./_lib/env.mjs";
import { ffprobeInfo, run } from "./_lib/ffmpeg.mjs";
import { formatTime } from "./_lib/time_format.mjs";

loadEnv();

const argv = process.argv.slice(2);
function argVal(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
}
const tenant = argVal("--tenant");
const take = argVal("--take") || "2";
const industry = argVal("--industry") || "sanitaer";
if (!tenant) {
  console.error("usage: --tenant <slug> [--take 2|3|4] [--industry sanitaer|elektriker|...]");
  process.exit(1);
}

// Load phase library definition
const defPath = path.join(PIPELINE_ROOT, "phase_library_defs", `take${take}_${industry}.json`);
if (!fs.existsSync(defPath)) {
  console.error(`Phase library definition missing: ${defPath}`);
  console.error(`Available defs:`);
  const dir = path.join(PIPELINE_ROOT, "phase_library_defs");
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) console.error(`  ${f}`);
  }
  process.exit(1);
}
const def = JSON.parse(fs.readFileSync(defPath, "utf8"));
console.log(`Loaded def: ${def.title}`);
console.log(`  ${def.phases.length} phases, take=${def.take}, industry=${def.industry}`);

// Resolve source paths (with {tenant} substitution)
function resolveSourcePath(template) {
  return path.join(REPO_ROOT, "docs/gtm/pipeline/06_video_production", template.replace(/\{tenant\}/g, tenant));
}

const sources = {};
for (const [key, template] of Object.entries(def.sources)) {
  const fullPath = resolveSourcePath(template);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠ Source missing: [${key}] ${fullPath}`);
    sources[key] = null;
  } else {
    sources[key] = fullPath;
    const info = await ffprobeInfo(fullPath);
    console.log(`  ${key.padEnd(28)} ${fullPath} (${info.duration.toFixed(2)}s)`);
  }
}

const libDir = path.join(GENERATED, "phase_library", tenant, `take${take}`);
const phasesDir = path.join(libDir, "phases");
fs.mkdirSync(phasesDir, { recursive: true });

console.log("");
console.log(`extracting ${def.phases.length} phases...`);

for (const phase of def.phases) {
  // Resolve which source file this phase uses
  let sourceKey = phase.source;
  // 'extended_phone' is a category: prefer notruf variant for the gallery preview
  // (the actual builder picks the right variant per schedule)
  if (sourceKey === "extended_phone") {
    sourceKey = sources["extended_phone_notruf"] ? "extended_phone_notruf" : "extended_phone_preis";
  }
  const sourceFile = sources[sourceKey];
  if (!sourceFile) {
    console.log(`  ✗ ${phase.name.padEnd(32)} SKIP (source ${sourceKey} not available)`);
    continue;
  }
  const [start, end] = phase.range;
  const dur = end - start;

  const mp4Out = path.join(phasesDir, `${phase.name}.mp4`);
  const pngOut = path.join(phasesDir, `${phase.name}.png`);

  try {
    await run("ffmpeg", [
      "-hide_banner", "-y",
      "-ss", start.toFixed(3), "-i", sourceFile,
      "-t", dur.toFixed(3),
      "-vf", "scale=720:450:force_original_aspect_ratio=decrease,pad=720:450:(ow-iw)/2:(oh-ih)/2:color=#0b1220,fps=30",
      "-an",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "24",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      mp4Out,
    ], { captureStderr: true });

    const midpoint = start + dur / 2;
    await run("ffmpeg", [
      "-hide_banner", "-y",
      "-ss", midpoint.toFixed(3), "-i", sourceFile,
      "-frames:v", "1",
      "-vf", "scale=480:300:force_original_aspect_ratio=decrease,pad=480:300:(ow-iw)/2:(oh-ih)/2:color=#0b1220",
      "-q:v", "2",
      "-update", "1",
      pngOut,
    ], { captureStderr: true });

    console.log(`  ✓ ${phase.name.padEnd(32)} ${dur.toFixed(2)}s`);
  } catch (e) {
    console.log(`  ✗ ${phase.name.padEnd(32)} FAILED: ${e.message.slice(0, 80)}`);
  }
}

// Save phases.json (resolved with absolute paths)
const phasesJsonPath = path.join(libDir, "phases.json");
fs.writeFileSync(phasesJsonPath, JSON.stringify({
  ts: new Date().toISOString(),
  tenant, take, industry,
  def_path: defPath,
  sources,
  phases: def.phases,
}, null, 2));

// Build HTML gallery grouped by category
const groupedByCategory = {};
for (const p of def.phases) {
  if (!groupedByCategory[p.category]) groupedByCategory[p.category] = [];
  groupedByCategory[p.category].push(p);
}

// Determine the audio path for hint
const variantAudios = ["notruf", "preis"]
  .map((v) => path.join("_generated/takes", tenant, `take${take}_${v}.wav`))
  .filter((p) => fs.existsSync(path.join(REPO_ROOT, "docs/gtm/pipeline/06_video_production", p)));

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Phase-Library — ${tenant} / Take ${take}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; margin: 0; background: #0b1220; color: #e5e9f0; padding: 24px; }
  h1 { font-size: 24px; margin: 0 0 8px 0; }
  .meta { color: #9fb8e5; font-size: 13px; margin-bottom: 24px; }
  h2 { color: #60a5fa; border-bottom: 1px solid #2b4464; padding-bottom: 8px; margin-top: 32px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
  .card { background: #1a2332; border: 1px solid #2b4464; border-radius: 10px; padding: 14px; }
  .card .name { font-family: "SF Mono", "Consolas", monospace; font-size: 14px; color: #60a5fa; font-weight: 600; word-break: break-all; }
  .card .range { color: #9fb8e5; font-size: 11px; margin-top: 2px; }
  .card .desc { font-size: 13px; margin-top: 6px; line-height: 1.4; }
  .card video { width: 100%; height: auto; border-radius: 6px; margin-top: 8px; background: black; cursor: pointer; }
  .card .source-tag { display: inline-block; background: #2b4464; color: #9fb8e5; font-size: 10px; padding: 2px 6px; border-radius: 3px; margin-top: 4px; text-transform: uppercase; }
  .card .source-tag.extended { background: #5b21b6; color: #ddd6fe; }
  .copy-name { background: transparent; border: 1px solid #2b4464; color: #9fb8e5; cursor: pointer; padding: 3px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px; }
  .copy-name:hover { border-color: #60a5fa; color: #60a5fa; }
  .schedule-help { background: #1a2332; border: 1px solid #2b4464; border-radius: 10px; padding: 16px; margin-top: 24px; }
  .schedule-help pre { background: #0b1220; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 12px; color: #cdd6f4; }
  .schedule-help code { background: #0b1220; padding: 2px 6px; border-radius: 3px; font-size: 12px; color: #cdd6f4; }
</style>
</head>
<body>
<h1>Phase-Library — ${tenant} / Take ${take} (${industry})</h1>
<div class="meta">
  ${def.phases.length} Phasen · Definition: <code style="background:#0b1220;padding:2px 4px;border-radius:3px;">${path.basename(defPath)}</code>
</div>

<div class="schedule-help">
  <strong>So nutzt du es (Founder-Workflow):</strong>
  <ol style="line-height:1.8;">
    <li>Schau die Phasen unten an (jede hat ein Animation-Preview, klick = play/pause).</li>
    <li>Schreibe deinen Schedule in <code>_generated/transcripts/${tenant}/take${take}_notruf.schedule</code> bzw. <code>take${take}_preis.schedule</code>.
      <br>Beide Zeit-Formate sind erlaubt — empfohlen ist <strong>M:SS,T</strong> (matcht Video-Player-Anzeige):
      <pre>phone_homescreen           0:00,0-0:36,5
phone_search               0:36,5-0:39,0
phone_dialing              0:39,0-0:42,0
phone_call_active          0:42,0-3:27,0
phone_call_ended           3:27,0-3:30,0
phone_homescreen_sms_notif 3:30,0-3:37,5
…</pre>
      Auch erlaubt (decimal seconds): <code>phone_homescreen 0.0-36.5</code>
    </li>
    <li>Phase-Name (Spalte 1) ist der <code>name</code>-Wert aus den Cards unten ("copy"-Button rechts). Spalte 2 ist <code>von-bis</code>.</li>
    <li>Audio-Master: ${variantAudios.length > 0 ? variantAudios.map((a) => `<code>${a}</code>`).join(", ") : "(noch nicht generiert)"}.</li>
    <li>Build-Befehl: <code>node scripts/_ops/audio/build_from_phase_schedule.mjs --tenant ${tenant} --take ${take} --variant notruf</code></li>
  </ol>
</div>

${Object.keys(groupedByCategory).map((cat) => `
<h2>${cat}</h2>
<div class="grid">
${groupedByCategory[cat].map((p) => `
  <div class="card">
    <div>
      <span class="name">${p.name}</span>
      <button class="copy-name" onclick="navigator.clipboard.writeText('${p.name}')">copy</button>
    </div>
    <div class="range">Source ${p.source}: ${formatTime(p.range[0])}–${formatTime(p.range[1])} (${(p.range[1]-p.range[0]).toFixed(2)}s)</div>
    <div class="desc">${p.desc}</div>
    ${p.note ? `<div class="desc" style="color:#fbbf24;">⚠ ${p.note}</div>` : ""}
    <span class="source-tag ${p.source === "extended_phone" ? "extended" : ""}">${p.source}</span>
    <video src="phases/${p.name}.mp4" loop muted onclick="this.paused?this.play():this.pause()" preload="metadata"></video>
  </div>
`).join("")}
</div>
`).join("")}

</body>
</html>
`;

const htmlPath = path.join(libDir, "LIBRARY.html");
fs.writeFileSync(htmlPath, html);

// Generate a starter schedule template (so Founder doesn't start from scratch)
const templateLines = [
  `# Take ${take} ${industry} — Phase Schedule template`,
  `# Format: <phase_name>  <start_sec>-<end_sec>`,
  `# One phase per row. Time-ranges back-to-back (no gaps in CSV — visuals stay smooth).`,
  `# Phase names: see LIBRARY.html (one card per phase, click "copy" button).`,
  `#`,
  `# Audio-Master: take${take}_<variant>.wav (z.B. take${take}_notruf.wav)`,
  `# Final ranges müssen kontinuierlich sein und sich auf 0 → audio_duration aufaddieren.`,
  ``,
  `# Beispiel:`,
];
for (const p of def.phases) {
  const sample = `${p.name.padEnd(32)} 0.0-0.0   # ${p.desc.slice(0, 60)}`;
  templateLines.push(`# ${sample}`);
}
const transcriptDir = path.join(GENERATED, "transcripts", tenant);
fs.mkdirSync(transcriptDir, { recursive: true });
const templatePath = path.join(libDir, "schedule.template.txt");
fs.writeFileSync(templatePath, templateLines.join("\n"));

console.log("");
console.log(`✓ ${def.phases.length} phases extracted`);
console.log(`  HTML gallery:    ${htmlPath}`);
console.log(`  Phases JSON:     ${phasesJsonPath}`);
console.log(`  MP4 previews:    ${phasesDir}`);
console.log(`  Schedule tmpl:   ${templatePath}`);
console.log("");
console.log(`Open LIBRARY.html in browser, then create schedule files:`);
console.log(`  _generated/transcripts/${tenant}/take${take}_notruf.schedule`);
console.log(`  _generated/transcripts/${tenant}/take${take}_preis.schedule`);
