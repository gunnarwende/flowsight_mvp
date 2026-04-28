#!/usr/bin/env node
// Generate all Lisa agent TTS audios for Take 2 call.
//
// Layers:
//   - Generic (cross-tenant, cross-variant): agent turns 2,3,4,5,6,7,8,10,11 → 9 files
//   - Variant-specific (cross-tenant): agent turn 9 × {notruf,preis} → 2 files
//   - Tenant-specific: agent turn 1 × each tenant → 1 file per tenant
//
// Output (under docs/gtm/pipeline/06_video_production/_generated/lisa_tts/):
//   generic/agent_02.wav ... agent_11.wav
//   generic/agent_09_notruf.wav
//   generic/agent_09_preis.wav
//   tenants/<slug>/agent_01.wav
//
// Usage:
//   node scripts/_ops/audio/generate_lisa_tts.mjs                 # generic + all tenants in docs/customers/
//   node scripts/_ops/audio/generate_lisa_tts.mjs --tenant doerfler-ag
//   node scripts/_ops/audio/generate_lisa_tts.mjs --generic-only

import fs from "node:fs";
import path from "node:path";
import { loadEnv, PIPELINE_ROOT, GENERATED, TENANTS_ROOT } from "./_lib/env.mjs";
import { tts, mp3ToWav48kMono } from "./_lib/eleven.mjs";
import { ffprobeInfo, renderWaveformPng, loudnormTwoPass } from "./_lib/ffmpeg.mjs";
import { gateLoudness, gateNoClipping } from "./_lib/quality.mjs";
import { AGENT_LINES, TURN_ORDER, GENERIC_LINE_IDS, TENANT_LINE_IDS, VARIANT_LINE_IDS, resolveAgentTurn } from "./_lib/lisa_lines.mjs";

loadEnv();

if (!process.env.ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY missing in env");
  process.exit(1);
}

const argv = process.argv.slice(2);
const genericOnly = argv.includes("--generic-only");
const tenantArgIdx = argv.indexOf("--tenant");
const tenantArg = tenantArgIdx >= 0 ? argv[tenantArgIdx + 1] : null;

const TTS_CACHE = path.join(GENERATED, "lisa_tts", "_cache");
const GENERIC_OUT = path.join(GENERATED, "lisa_tts", "generic");
const TENANTS_OUT = path.join(GENERATED, "lisa_tts", "tenants");
fs.mkdirSync(TTS_CACHE, { recursive: true });
fs.mkdirSync(GENERIC_OUT, { recursive: true });
fs.mkdirSync(TENANTS_OUT, { recursive: true });

const results = [];

async function renderTurn(turn, outWav) {
  const fileTag = `turn_${String(turn.id).padStart(2, "0")}${turn.variant ? "_" + turn.variant : ""}_${turn.voice}`;
  // Cache must be content-addressed (hash of text) so per-tenant greetings don't collide.
  const crypto = await import("node:crypto");
  const textHash = crypto.createHash("sha1").update(turn.text).digest("hex").slice(0, 10);
  const cacheMp3 = path.join(TTS_CACHE, `${fileTag}_${textHash}.mp3`);
  let cached = false;
  if (fs.existsSync(cacheMp3) && fs.statSync(cacheMp3).size > 2000) {
    cached = true;
  } else {
    const r = await tts({
      text: turn.text,
      voice: turn.voice,
      outFile: cacheMp3,
      stability: 0.55,
      similarity: 0.8,
      style: 0.1,
      speakerBoost: true,
    });
    cached = r.cached;
  }
  // Single-pass loudnorm to get close, then two-pass to lock exactly on -14 LUFS.
  const tmpWav = outWav.replace(/\.wav$/, "._pass1.wav");
  await mp3ToWav48kMono(cacheMp3, tmpWav, { applyLoudnorm: true });
  await loudnormTwoPass(tmpWav, outWav, { I: -14, TP: -1.5, LRA: 11 });
  fs.unlinkSync(tmpWav);
  const info = await ffprobeInfo(outWav);
  const loudness = await gateLoudness(outWav, { expectedI: -14, tolerance: 1.5, maxTP: -1.0 });
  const clipping = await gateNoClipping(outWav);
  const pngPath = outWav + ".png";
  try {
    await renderWaveformPng(outWav, pngPath);
  } catch {}
  return { fileTag, outWav, cached, duration: info.duration, loudness, clipping };
}

// 1. Generic lines (non-variant, non-tenant)
console.log("generating GENERIC agent lines ...");
for (const id of GENERIC_LINE_IDS) {
  const turn = resolveAgentTurn(id, {});
  const outWav = path.join(GENERIC_OUT, `agent_${String(id).padStart(2, "0")}.wav`);
  try {
    const r = await renderTurn(turn, outWav);
    results.push({ scope: "generic", id, ...r });
    console.log(`  ✓ #${id} ${r.cached ? "[cached]" : "[new]"} ${r.duration.toFixed(2)}s loudness_pass=${r.loudness.pass}`);
  } catch (e) {
    console.log(`  ✗ #${id} FAILED: ${e.message}`);
    results.push({ scope: "generic", id, error: String(e.message || e) });
  }
}

// 2. Variant-specific (turn 9: Notruf / Preis)
console.log("generating VARIANT agent lines (Notruf + Preis) ...");
for (const variant of ["notruf", "preis"]) {
  const turn = resolveAgentTurn(9, { variant });
  turn.variant = variant;
  const outWav = path.join(GENERIC_OUT, `agent_09_${variant}.wav`);
  try {
    const r = await renderTurn(turn, outWav);
    results.push({ scope: "variant", id: 9, variant, ...r });
    console.log(`  ✓ #9 ${variant} ${r.cached ? "[cached]" : "[new]"} ${r.duration.toFixed(2)}s`);
  } catch (e) {
    console.log(`  ✗ #9 ${variant} FAILED: ${e.message}`);
    results.push({ scope: "variant", id: 9, variant, error: String(e.message || e) });
  }
}

// 3. Tenant-specific greeting (turn 1)
if (!genericOnly) {
  const tenants = [];
  if (tenantArg) {
    tenants.push(tenantArg);
  } else {
    for (const entry of fs.readdirSync(TENANTS_ROOT, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const cfgPath = path.join(TENANTS_ROOT, entry.name, "tenant_config.json");
      if (fs.existsSync(cfgPath)) tenants.push(entry.name);
    }
  }

  console.log(`generating TENANT greetings (${tenants.length} tenants) ...`);
  for (const slug of tenants) {
    const cfgPath = path.join(TENANTS_ROOT, slug, "tenant_config.json");
    if (!fs.existsSync(cfgPath)) {
      console.log(`  - ${slug}: no tenant_config.json, skipping`);
      continue;
    }
    const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    const displayName =
      cfg.display_name ||
      cfg.name ||
      cfg.short_name ||
      cfg?.tenant?.display_name ||
      cfg?.tenant?.name ||
      cfg?.voice_agent?.company_name;
    if (!displayName) {
      console.log(`  - ${slug}: no display_name, skipping`);
      continue;
    }
    const turn = resolveAgentTurn(1, { tenantDisplayName: displayName });
    const outDir = path.join(TENANTS_OUT, slug);
    fs.mkdirSync(outDir, { recursive: true });
    const outWav = path.join(outDir, "agent_01.wav");
    try {
      const r = await renderTurn(turn, outWav);
      results.push({ scope: "tenant", slug, displayName, id: 1, ...r });
      console.log(`  ✓ ${slug} (${displayName}) ${r.cached ? "[cached]" : "[new]"} ${r.duration.toFixed(2)}s`);
    } catch (e) {
      console.log(`  ✗ ${slug} FAILED: ${e.message}`);
      results.push({ scope: "tenant", slug, error: String(e.message || e) });
    }
  }
}

// Report
const reportPath = path.join(GENERATED, "lisa_tts", "_report.json");
fs.writeFileSync(reportPath, JSON.stringify({ ts: new Date().toISOString(), results }, null, 2));

const failed = results.filter((r) => r.error).length;
const loudnessFails = results.filter((r) => r.loudness && !r.loudness.pass).length;
console.log("");
console.log(`total=${results.length} failed=${failed} loudness_fail=${loudnessFails}`);
console.log(`report: ${reportPath}`);
if (failed > 0) process.exit(1);
