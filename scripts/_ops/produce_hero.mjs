#!/usr/bin/env node
// produce_hero.mjs — Hero-Beweis-Seite Orchestrator (Stern 3), phasen-basiert.
//
// Baut auf den bestehenden Pipeline-Primitiven auf (kein Fork der take*-Skripte).
//   Phase "call"  : Hero-Call-Audio (Lisa + Herr Brunner) via ElevenLabs -> EIN Master-WAV.
//                   Lauffähig & testbar OHNE Founder-Gesichts-Footage.
//   Phase screens/montage/proof: brauchen Founder-Gesichts-Footage + Seed -> noch offen.
//
// Wortlaut gelockt: docs/gtm/pipeline/HERO_DEMO_SPEC.md (COLD 15–37.5). Founder-VO/Gesicht
// liegen bereits als Master auf Bunny (docs/gtm/pipeline/aufnahme/_takes/manifest.json).
//
// Usage:
//   node scripts/_ops/produce_hero.mjs --phase call [--gewerk waerme|sanitaer]
//        [--betrieb "Dörfler AG"] [--brunner-voice gunnar] [--upload] [--dry-run]
//
// Env: ELEVENLABS_API_KEY (Pflicht für call) · BUNNY_STORAGE_API_KEY (für --upload).
//   CI: aus GitHub Actions Secrets (produce-hero.yml). Lokal: aus src/web/.env.local.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tts, mp3ToWav48kMono } from "./audio/_lib/eleven.mjs";
import { concatWavs, loudnormTwoPass, ffprobeInfo, renderWaveformPng } from "./audio/_lib/ffmpeg.mjs";
import { gateLoudness, gateNoClipping } from "./audio/_lib/quality.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_DIR = path.join(REPO_ROOT, "docs/gtm/pipeline/06_video_production/_generated/hero_call");

const BUNNY_ZONE = "flowsight-stern3-backup";
const BUNNY_BASE = `https://storage.bunnycdn.com/${BUNNY_ZONE}`;

// --- args ---
const argv = process.argv.slice(2);
function flag(name, def = null) {
  const i = argv.indexOf(`--${name}`);
  if (i < 0) return def;
  const v = argv[i + 1];
  return !v || v.startsWith("--") ? true : v;
}
const PHASE = flag("phase", "call");
const GEWERK = flag("gewerk", "waerme");
const BETRIEB = flag("betrieb", "Dörfler AG");
const BRUNNER_VOICE = flag("brunner-voice", "gunnar");
const UPLOAD = argv.includes("--upload");
const DRY = argv.includes("--dry-run");

// --- Hero-Call-Zeilen (wortgenau, HERO_DEMO_SPEC.md COLD 15–37.5) ---
const ANLIEGEN = {
  waerme: "Hallo, hier ist Herr Brunner. Wir möchten auf eine Wärmepumpe umstellen, und holen grad Offerten ein.",
  sanitaer: "Hallo, hier ist Herr Brunner. Ich bräuchte jemanden für ein neues Bad, und es eilt ein bisschen.",
};
function heroCallLines() {
  const anliegen = ANLIEGEN[GEWERK] || ANLIEGEN.waerme;
  return [
    { id: "lisa_greeting",     role: "lisa",    voice: "ela",          text: `Guten Tag, hier ist Lisa, die digitale Assistentin von ${BETRIEB} — was kann ich für Sie tun?` },
    { id: "brunner_anliegen",  role: "brunner", voice: BRUNNER_VOICE,  text: anliegen },
    { id: "lisa_annahme",      role: "lisa",    voice: "ela",          text: "Sehr gerne, da sind Sie genau richtig. Ich nehme das gleich auf." },
    { id: "lisa_adresse_frage",role: "lisa",    voice: "ela",          text: "Herr Brunner, wie lautet Ihre Adresse?" },
    { id: "brunner_adresse",   role: "brunner", voice: BRUNNER_VOICE,  text: "Bahnhofstrasse 14, 8500 Frauenfeld." },
    { id: "lisa_abschluss",    role: "lisa",    voice: "ela",          text: "Alles aufgenommen, Herr Brunner — ich gebe das direkt an unseren Techniker weiter. Sie erhalten gleich eine SMS. Auf Wiederhören!" },
    { id: "brunner_ende",      role: "brunner", voice: BRUNNER_VOICE,  text: "Danke, auf Wiederhören." },
  ];
}

async function uploadBunny(localFile, remotePath) {
  const key = process.env.BUNNY_STORAGE_API_KEY;
  if (!key) { console.log("[hero] ⚠️ BUNNY_STORAGE_API_KEY fehlt — Upload übersprungen."); return; }
  const url = `${BUNNY_BASE}/${remotePath}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { AccessKey: key, "Content-Type": "application/octet-stream" },
    body: fs.readFileSync(localFile),
  });
  if (!res.ok) throw new Error(`Bunny-Upload ${remotePath} fehlgeschlagen: ${res.status} ${res.statusText}`);
  console.log(`[hero] ⬆️  Bunny: ${url}`);
}

async function phaseCall() {
  if (!process.env.ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY fehlt (Actions-Secret / src/web/.env.local).");
  const lines = heroCallLines();
  const nLisa = lines.filter((l) => l.role === "lisa").length;
  const nBrunner = lines.filter((l) => l.role === "brunner").length;
  console.log(`[hero] Phase call · Gewerk=${GEWERK} · Betrieb="${BETRIEB}" · Brunner-Voice=${BRUNNER_VOICE}`);
  console.log(`[hero] ${lines.length} Turns (Lisa=${nLisa}, Brunner=${nBrunner})`);
  if (BRUNNER_VOICE === "gunnar") {
    console.log("[hero] ⚠️ Brunner nutzt PLATZHALTER-Voice 'gunnar' (= Founder-Klon, klingt nach dir).");
    console.log("[hero]    Für die echte Demo eine eigene männliche Kunden-Stimme (ElevenLabs-Voice-ID) festlegen → --brunner-voice <id>.");
  }
  if (DRY) {
    for (const l of lines) console.log(`  · ${l.id} [${l.role}/${l.voice}] "${l.text}"`);
    console.log("[hero] DRY-RUN — nichts generiert, kein Upload.");
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const segWavs = [];
  const seq = [];
  for (const l of lines) {
    const mp3 = path.join(OUT_DIR, `seg_${l.id}.mp3`);
    const wav = path.join(OUT_DIR, `seg_${l.id}.wav`);
    console.log(`[hero] TTS ${l.id} (${l.voice}) …`);
    await tts({ text: l.text, voice: l.voice, outFile: mp3 });
    await mp3ToWav48kMono(mp3, wav, { applyLoudnorm: false });
    const info = await ffprobeInfo(wav);
    seq.push({ id: l.id, role: l.role, voice: l.voice, text: l.text, dur_s: Number(info.duration) });
    segWavs.push(wav);
  }

  const rawCall = path.join(OUT_DIR, `hero_call_${GEWERK}_raw.wav`);
  await concatWavs(segWavs, rawCall, { gapMs: 150 });
  const finalCall = path.join(OUT_DIR, `hero_call_${GEWERK}.wav`);
  await loudnormTwoPass(rawCall, finalCall, { I: -16, TP: -1, LRA: 11, sampleRate: 48000 });

  const gL = await gateLoudness(finalCall, { expectedI: -16, tolerance: 1.0, maxTP: -1.0 });
  const gC = await gateNoClipping(finalCall);
  await renderWaveformPng(finalCall, `${finalCall}.png`, { width: 1400, height: 240 });
  const info = await ffprobeInfo(finalCall);

  const report = {
    generated: new Date().toISOString().slice(0, 10),
    phase: "call",
    gewerk: GEWERK,
    betrieb: BETRIEB,
    brunner_voice: BRUNNER_VOICE,
    master_lufs: -16,
    total_dur_s: Number(info.duration),
    gates: { loudness: gL, clipping: gC },
    sequence: seq,
  };
  const reportFile = path.join(OUT_DIR, `hero_call_${GEWERK}.report.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  console.log(`[hero] ✅ ${finalCall} · ${report.total_dur_s.toFixed(1)}s · loudness ${gL.pass ? "PASS" : "FAIL"} · clipping ${gC.pass ? "PASS" : "FAIL"}`);
  if (!gL.pass || !gC.pass) console.log("[hero] ⚠️ Gate FAIL — Report prüfen:", reportFile);

  if (UPLOAD) {
    await uploadBunny(finalCall, `hero-audio/call/hero_call_${GEWERK}.wav`);
    await uploadBunny(reportFile, `hero-audio/call/hero_call_${GEWERK}.report.json`);
  }
}

async function main() {
  if (PHASE === "call") return phaseCall();
  if (["screens", "montage", "proof", "all"].includes(PHASE)) {
    console.log(`[hero] Phase '${PHASE}' noch nicht implementiert.`);
    console.log("[hero] Braucht: Founder-Gesichts-Footage (Bookend + Knoten ③/④) + Seed Brunner/Frauenfeld.");
    console.log("[hero] Siehe docs/gtm/pipeline/HERO_PIPELINE_BAUPLAN.md.");
    process.exit(2);
  }
  throw new Error(`Unbekannte --phase '${PHASE}' (call|screens|montage|proof).`);
}

main().catch((e) => { console.error("[hero] FEHLER:", e.message); process.exit(1); });
