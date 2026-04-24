#!/usr/bin/env node
// Generate a single HTML report summarising the audio pipeline output.
// Shows: per-tenant, per-take → audio duration, video duration, gates, waveform, preview video link.
// Founder opens this in browser, watches previews + listens to mp3s, approves or sends feedback.

import fs from "node:fs";
import path from "node:path";
import { loadEnv, PIPELINE_ROOT, GENERATED } from "./_lib/env.mjs";
import { ffprobeInfo } from "./_lib/ffmpeg.mjs";

loadEnv();

const TENANTS = ["doerfler-ag", "leins-ag", "stark-haustechnik", "waelti-sohn-ag"];
const OUTPUT_HTML = path.join(GENERATED, "QUALITY_GATE_REPORT.html");

function gateBadge(ok, label) {
  return ok
    ? `<span class="g ok">${label}</span>`
    : `<span class="g fail">${label}</span>`;
}

function fmt(n, d = 2) {
  return typeof n === "number" ? n.toFixed(d) : "-";
}

function rel(to) {
  return path.relative(path.dirname(OUTPUT_HTML), to).replace(/\\/g, "/");
}

async function collectTenant(slug) {
  const takesDir = path.join(GENERATED, "takes", slug);
  const previewsDir = path.join(GENERATED, "previews", slug);
  const mp3Dir = path.join(GENERATED, "audio_mp3", slug);

  const variants = ["take1", "take2_notruf", "take2_preis", "take3", "take4"];
  const items = [];
  for (const v of variants) {
    const wav = path.join(takesDir, `${v.startsWith("take2_") ? "take2_" + v.split("_")[1] : v}.wav`);
    const mp3 = path.join(mp3Dir, `${v}.mp3`);
    const preview = path.join(previewsDir, `${v}_preview.mp4`);
    const waveform = wav + ".png";
    const reportJson = path.join(takesDir, `_report_${v}.json`);
    const data = { label: v };
    if (fs.existsSync(wav)) {
      try {
        const info = await ffprobeInfo(wav);
        data.audio_duration = info.duration;
      } catch {}
      data.wav = wav;
    }
    if (fs.existsSync(mp3)) data.mp3 = mp3;
    if (fs.existsSync(preview)) {
      try {
        const info = await ffprobeInfo(preview);
        data.preview_duration = info.duration;
      } catch {}
      data.preview = preview;
    }
    if (fs.existsSync(waveform)) data.waveform = waveform;
    if (fs.existsSync(reportJson)) {
      try {
        data.gates = JSON.parse(fs.readFileSync(reportJson, "utf8")).gates;
      } catch {}
    }
    items.push(data);
  }

  // Lisa TTS greeting
  const greeting = path.join(GENERATED, "lisa_tts", "tenants", slug, "agent_01.wav");
  let greetingDur = null;
  if (fs.existsSync(greeting)) {
    try {
      greetingDur = (await ffprobeInfo(greeting)).duration;
    } catch {}
  }
  return { slug, greeting, greetingDur, items };
}

const tenantsData = [];
for (const t of TENANTS) {
  tenantsData.push(await collectTenant(t));
}

// Count total gates + pass
let totalGates = 0;
let passedGates = 0;
for (const t of tenantsData) {
  for (const i of t.items) {
    if (i.gates) {
      for (const key of Object.keys(i.gates)) {
        totalGates += 1;
        if (i.gates[key].pass) passedGates += 1;
      }
    }
  }
}

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Audio Pipeline — Quality Gate Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; background: #0f1419; color: #e5e9f0; }
  header { background: linear-gradient(135deg, #1a2332, #2b4464); padding: 24px 32px; border-bottom: 2px solid #3b82f6; }
  header h1 { margin: 0 0 8px 0; font-size: 22px; }
  header .meta { font-size: 13px; color: #9fb8e5; }
  header .score { float: right; background: #10b981; color: white; padding: 8px 18px; border-radius: 8px; font-weight: 600; font-size: 15px; }
  header .score.warn { background: #f59e0b; }
  header .score.fail { background: #ef4444; }
  main { padding: 24px 32px; max-width: 1600px; margin: 0 auto; }
  .tenant { background: #1a2332; border: 1px solid #2b4464; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
  .tenant h2 { margin: 0 0 4px 0; font-size: 18px; color: #60a5fa; }
  .tenant .sub { color: #9fb8e5; font-size: 13px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #233044; vertical-align: top; }
  th { color: #9fb8e5; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.3px; }
  td.label { font-weight: 600; color: #e5e9f0; }
  .g { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 4px; }
  .g.ok { background: #10b981; color: white; }
  .g.fail { background: #ef4444; color: white; }
  audio, video { width: 100%; margin-top: 4px; }
  video { max-width: 400px; max-height: 240px; background: black; border-radius: 4px; }
  .waveform { max-width: 100%; height: auto; display: block; margin-top: 4px; border-radius: 4px; }
  code { background: #0f1419; padding: 1px 6px; border-radius: 3px; font-size: 11px; color: #9fb8e5; }
  .delta { font-size: 11px; color: #9fb8e5; }
  .delta.warn { color: #f59e0b; }
  section h3 { margin-top: 30px; color: #3b82f6; border-bottom: 1px solid #2b4464; padding-bottom: 8px; }
  .row-takewise { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap: 12px; }
  .card { background: #0f1419; border: 1px solid #233044; border-radius: 8px; padding: 12px; }
  .card h4 { margin: 0 0 6px 0; font-size: 14px; color: #60a5fa; }
</style>
</head>
<body>
<header>
  <div class="score ${passedGates === totalGates ? "" : passedGates / totalGates > 0.9 ? "warn" : "fail"}">${passedGates}/${totalGates} Gates</div>
  <h1>Audio Pipeline — Quality Gate Report</h1>
  <div class="meta">Generated ${new Date().toISOString()} · Tenants: ${tenantsData.length} · Takes per Tenant: 5 · Cross-Tenant-Shared: 9 generic Lisa lines + 2 variant lines + 35 Founder wraps</div>
</header>

<main>

<section>
<h3>Summary: Was heute Nacht gebaut wurde</h3>
<ol style="font-size: 14px; line-height: 1.8;">
  <li><strong>Phase A-1 ✓</strong> — 36 Founder-Audios gecleaned (Maus-Klick weg, -14 LUFS normalisiert). Source bleibt intact.</li>
  <li><strong>Phase A-2 ✓</strong> — 15 Lisa-TTS-Files generiert: 9 generic (cross-tenant) + 2 variant (Notruf/Preis) + 4 Tenant-Greetings.</li>
  <li><strong>Phase A-3 ✓</strong> — 8 Call-Audios assembliert (4 Tenants × 2 Varianten).</li>
  <li><strong>Phase A-4 ✓</strong> — 20 Take-Audios assembliert (4 Tenants × 5 Takes).</li>
  <li><strong>Phase A-5 ✓</strong> — 20 Preview-Videos (Audio auf bestehendes Screenflow gemuxt). Wenn Audio länger als Video: letzter Frame freezed.</li>
</ol>
<div style="color: #f59e0b; background: #1a1410; padding: 12px; border-radius: 8px; margin-top: 12px; border-left: 3px solid #f59e0b; font-size: 13px;">
  <strong>⚠ Erwarteter Delta:</strong> Screenflow-Videos sind 1.4–3.6× kürzer als die Audio. In den Preview-Videos siehst/hörst du das als "letzter Frame freezed während Audio weiterläuft". Die Re-Aufnahme des Screenflow mit Audio-driven Timing ist <strong>Phase B</strong> und kommt in die nächste Session.
</div>
</section>

${tenantsData.map((t) => `
<section class="tenant">
  <h2>${t.slug}</h2>
  <div class="sub">Lisa Greeting: ${t.greetingDur ? `${fmt(t.greetingDur)}s` : "–"} · <code>${rel(t.greeting || "")}</code></div>
  <div class="row-takewise">
  ${t.items.map((i) => `
    <div class="card">
      <h4>${i.label}</h4>
      <div class="delta">audio ${fmt(i.audio_duration)}s · preview ${fmt(i.preview_duration)}s</div>
      ${i.gates ? `
      <div style="margin:6px 0;">
        ${gateBadge(i.gates.loudness?.pass, "loudness")}
        ${gateBadge(i.gates.clipping?.pass, "clip")}
        ${gateBadge(i.gates.duration?.pass, "dur")}
        ${i.gates.internalSilence ? gateBadge(i.gates.internalSilence.pass, "silence") : ""}
      </div>` : ""}
      ${i.waveform ? `<img class="waveform" src="${rel(i.waveform)}">` : ""}
      ${i.mp3 ? `<audio controls preload="none" src="${rel(i.mp3)}"></audio>` : ""}
      ${i.preview ? `<video controls preload="none" src="${rel(i.preview)}"></video>` : ""}
    </div>
  `).join("")}
  </div>
</section>
`).join("")}

<section>
<h3>Nächste Schritte (Phase B)</h3>
<ul style="font-size: 14px; line-height: 1.8;">
  <li><strong>Screenflow-Retiming:</strong> Playwright-Scripts anpassen, dass Take 2 ~340s (statt 93s), Take 3 ~170s (statt 61s), Take 4 ~152s (statt 106s) rendert. Audio-Anchor pro Satz.</li>
  <li><strong>Founder-Review:</strong> Audio-MP3s pro Take anhören. Falls eine Lisa-Zeile falsch klingt → nur DIESE Zeile re-generieren (cache-key-invalidierung durch Text-Edit).</li>
  <li><strong>Lip-Sync-Check:</strong> Tenant-Greetings variieren 5.76–6.59s. Face-PiP muss entweder per Tenant leicht getimet sein oder visuell neutral bleiben.</li>
  <li><strong>Take 1 Screenflow:</strong> Nur Dörfler hat bisher ein take1_complete.mp4. Für Leins/Stark/Wälti fehlt das Website-Video.</li>
</ul>
</section>

<section>
<h3>Asset-Pfade</h3>
<ul style="font-size: 12px; line-height: 1.6; font-family: monospace; color: #9fb8e5;">
  <li>Cleaned Founder audio: <code>docs/gtm/pipeline/06_video_production/_clean/</code></li>
  <li>Lisa TTS: <code>docs/gtm/pipeline/06_video_production/_generated/lisa_tts/</code></li>
  <li>Assembled calls: <code>docs/gtm/pipeline/06_video_production/_generated/calls/&lt;tenant&gt;/</code></li>
  <li>Assembled takes (WAV): <code>docs/gtm/pipeline/06_video_production/_generated/takes/&lt;tenant&gt;/</code></li>
  <li>MP3 exports: <code>docs/gtm/pipeline/06_video_production/_generated/audio_mp3/&lt;tenant&gt;/</code></li>
  <li>Preview videos: <code>docs/gtm/pipeline/06_video_production/_generated/previews/&lt;tenant&gt;/</code></li>
</ul>
</section>

</main>
</body>
</html>
`;

fs.writeFileSync(OUTPUT_HTML, html);
console.log(`report: ${OUTPUT_HTML}`);
console.log(`gates: ${passedGates}/${totalGates} passed`);
