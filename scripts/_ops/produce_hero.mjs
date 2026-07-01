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
import { concatWavs, loudnormTwoPass, ffprobeInfo, renderWaveformPng, run } from "./audio/_lib/ffmpeg.mjs";
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

// ── Phase "montage" — Screen-Section (13–49, OHNE Gesicht) auf die Audio-Master-Uhr ──
// Baut den mittleren, screen-getriebenen Abschnitt: Audio = Master-Uhr (VO HERO-05/06/07 +
// Call-Audio), Screen slavt darauf. Gesicht-Bookends (0–13 / 49–82) = Post-Layer (separat).
// Immunsystem: Gesicht NIE in der Source · pro Block EIN Encode (kein N-fach) · state/audio-
// getriebene Anker (Blockgrenzen aus echten Audiodauern) · Backup-first (nur _generated,
// Originale unangetastet) · Gates.
const MASTERS_DIR = path.join(REPO_ROOT, "docs/gtm/pipeline/aufnahme/_takes/_masters");
const LZ_FRAMES_DIR = path.join(REPO_ROOT, "production/screens/doerfler-ag");
const MONT_DIR = path.join(REPO_ROOT, "docs/gtm/pipeline/06_video_production/_generated/hero_montage");
const VP = { w: 392, h: 852 }; // Mobile-Viewport (gerade Maße für libx264/yuv420p; Webm ist 392×852)

// Spec-Pausen (HERO_DEMO_SPEC Screenflow 13–49). Anker sonst aus echten Audiodauern.
const GAP = { ring: 0.5, ended: 1.0, dash_detail: 0.3 };

async function silence(sec, out) {
  await run("ffmpeg", ["-hide_banner", "-y", "-f", "lavfi", "-t", sec.toFixed(3),
    "-i", "anullsrc=r=48000:cl=mono", "-c:a", "pcm_s16le", out], { captureStderr: true });
  return out;
}
async function phaseMontage() {
  fs.mkdirSync(MONT_DIR, { recursive: true });
  const need = (p, hint) => { if (!fs.existsSync(p)) throw new Error(`fehlt: ${p}${hint ? ` (${hint})` : ""}`); };
  const callWav = path.join(OUT_DIR, `hero_call_${GEWERK}.wav`);
  need(callWav, "erst: produce_hero --phase call");
  const h05 = path.join(MASTERS_DIR, "HERO-05.wav"); // "Ein neuer Kunde ruft an."
  const h06 = path.join(MASTERS_DIR, "HERO-06.wav"); // "Ein vollständiger Auftrag …"
  const h07 = path.join(MASTERS_DIR, "HERO-07.wav"); // "Eingegangen, erfasst …"
  [h05, h06, h07].forEach((p) => need(p, "Phase-1 Master (aufnahme/_takes/_masters)"));

  // ── 1) AUDIO MASTER-UHR (screen section) ────────────────────────────────
  const d05 = (await ffprobeInfo(h05)).duration;
  const dCall = (await ffprobeInfo(callWav)).duration;
  const d06 = (await ffprobeInfo(h06)).duration;
  const d07 = (await ffprobeInfo(h07)).duration;
  const silRing = await silence(GAP.ring, path.join(MONT_DIR, "_sil_ring.wav"));
  const silEnded = await silence(GAP.ended, path.join(MONT_DIR, "_sil_ended.wav"));
  const silDd = await silence(GAP.dash_detail, path.join(MONT_DIR, "_sil_dd.wav"));
  const rawAudio = path.join(MONT_DIR, "hero_screen_audio_raw.wav");
  // Reihenfolge = Spec: HERO-05 · [ring] · CALL · [ended-still] · HERO-06 · [gap] · HERO-07
  await concatWavs([h05, silRing, callWav, silEnded, h06, silDd, h07], rawAudio, { gapMs: 0 });
  const screenAudio = path.join(MONT_DIR, "hero_screen_audio.wav");
  await loudnormTwoPass(rawAudio, screenAudio, { I: -16, TP: -1, LRA: 11, sampleRate: 48000 });
  const aGL = await gateLoudness(screenAudio, { expectedI: -16, tolerance: 1.0, maxTP: -1.0 });
  const aGC = await gateNoClipping(screenAudio);

  // Master-Uhr-Anker (absolute Sekunden ab Screen-Section-Start t=0)
  const tRingStart = 0;
  const tCallStart = d05 + GAP.ring;
  const tCallEnd = tCallStart + dCall;
  const tPhoneEnd = tCallEnd + GAP.ended;        // Ende Telefon-Block ("Anruf beendet")
  const tDashStart = tPhoneEnd;                    // Leitzentrale beginnt (HERO-06)
  const tDetailStart = tDashStart + d06 + GAP.dash_detail;
  const tEnd = tDetailStart + d07;
  const lzDur = tEnd - tDashStart;                 // Leitzentrale-Blockdauer (HERO-06+gap+HERO-07)

  // ── 2) LEITZENTRALE-BLOCK (Screen slavt auf HERO-06+HERO-07) ────────────
  // v1 = frame-basiert aus den echten Capture-PNGs, präzise auf die VO-Beats getaktet:
  //   HERO-06 (dashboard→NEU-Filter) · HERO-07 (Fall-Detail→VERLAUF), endet auf VERLAUF.
  // (Motion-Webm-Sync = v2: der Hero-Webm startet mit Lade-Weiss + endet auf Übersicht,
  //  darum für präzisen Block-Sync die verifizierten Standbilder — echtes System, harte Cuts.)
  const lzAudio = path.join(MONT_DIR, "_lz_audio.wav");
  await concatWavs([h06, silDd, h07], lzAudio, { gapMs: 0 });
  const frames = ["02_dashboard.png", "03_neu_filter.png", "04_fall_oben.png", "06_verlauf.png"]
    .map((f) => path.join(LZ_FRAMES_DIR, f));
  let lzBlock = null, lzMode = "none";
  if (frames.every((f) => fs.existsSync(f))) {
    lzMode = "frames";
    lzBlock = path.join(MONT_DIR, "block_leitzentrale.mp4");
    // Beat-Takt: HERO-06 → dashboard + NEU-Filter; HERO-07 → Fall-Detail + VERLAUF (bis Ende).
    const half06 = d06 / 2, half07 = (d07 + GAP.dash_detail) / 2;
    const holds = [half06, d06 - half06 + GAP.dash_detail / 2, half07, lzDur - (half06 + (d06 - half06 + GAP.dash_detail / 2) + half07)];
    const args = ["-hide_banner", "-y"];
    frames.forEach((f, i) => args.push("-loop", "1", "-t", holds[i].toFixed(3), "-i", f));
    args.push("-i", lzAudio);
    const parts = frames.map((_, i) => `[${i}:v]scale=${VP.w}:${VP.h}:force_original_aspect_ratio=decrease,pad=${VP.w}:${VP.h}:(ow-iw)/2:(oh-ih)/2:white,setsar=1,fps=30[v${i}]`);
    const vlabels = frames.map((_, i) => `[v${i}]`).join("");
    const filter = parts.join(";") + ";" + vlabels + `concat=n=${frames.length}:v=1:a=0[v]`;
    args.push("-filter_complex", filter, "-map", "[v]", "-map", `${frames.length}:a`,
      "-t", lzDur.toFixed(3),
      "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "192k", lzBlock);
    await run("ffmpeg", args, { captureStderr: true });
  } else {
    console.log(`[hero] ⚠️ Leitzentrale-Frames fehlen (${LZ_FRAMES_DIR}) — Block übersprungen. Erst: record_leitsystem_screen.mjs --flow=hero`);
  }

  // ── 3) Timeline + Report ────────────────────────────────────────────────
  const timeline = {
    generated: new Date().toISOString().slice(0, 10),
    phase: "montage", section: "screen 13–49 (ohne Gesicht)",
    gewerk: GEWERK, betrieb: BETRIEB,
    master_clock: "audio", brunner_voice: BRUNNER_VOICE,
    anchors_s: {
      ring_start: +tRingStart.toFixed(3), call_start: +tCallStart.toFixed(3),
      call_end: +tCallEnd.toFixed(3), phone_end: +tPhoneEnd.toFixed(3),
      dash_start: +tDashStart.toFixed(3), detail_start: +tDetailStart.toFixed(3),
      end: +tEnd.toFixed(3),
    },
    durations_s: { HERO05: +d05.toFixed(3), call: +dCall.toFixed(3), HERO06: +d06.toFixed(3),
      HERO07: +d07.toFixed(3), leitzentrale_block: +lzDur.toFixed(3) },
    blocks: {
      phone: { built: false, note: "Phone-Visual (ring→call→ended) = eigener Render, s. Rest-Blocker" },
      leitzentrale: { built: !!lzBlock, mode: lzMode,
        file: lzBlock ? path.relative(REPO_ROOT, lzBlock) : null,
        sync: "beat-getaktet: HERO-06=dashboard+NEU, HERO-07=detail+VERLAUF (frame-basiert v1; Motion-Webm=v2)" },
    },
    audio_master: { file: path.relative(REPO_ROOT, screenAudio),
      total_dur_s: +tEnd.toFixed(3), gates: { loudness: aGL, clipping: aGC } },
    open: ["Phone-Visual-Block (Samsung ring→call→ended, ohne Gesicht)",
           "Gesicht-Bookends 0–13 / 49–82 (Post-Layer)", "Brunner-FINAL-Stimme (Platzhalter gunnar)"],
  };
  fs.writeFileSync(path.join(MONT_DIR, "hero_montage.timeline.json"), JSON.stringify(timeline, null, 2));

  console.log(`[hero] ✅ Montage (screen section):`);
  console.log(`[hero]   Audio-Master ${timeline.audio_master.total_dur_s}s · loudness ${aGL.pass ? "PASS" : "FAIL"} · clipping ${aGC.pass ? "PASS" : "FAIL"}`);
  console.log(`[hero]   Anker: ring@${tRingStart.toFixed(1)} call@${tCallStart.toFixed(1)}–${tCallEnd.toFixed(1)} dash@${tDashStart.toFixed(1)} detail@${tDetailStart.toFixed(1)} end@${tEnd.toFixed(1)}`);
  if (lzBlock) console.log(`[hero]   Leitzentrale-Block ${lzDur.toFixed(1)}s (${lzMode}, beat-getaktet HERO-06/07) → ${path.relative(REPO_ROOT, lzBlock)}`);
  if (!aGL.pass || !aGC.pass) { console.log("[hero] ⚠️ Audio-Gate FAIL"); process.exitCode = 3; }
}

async function main() {
  if (PHASE === "call") return phaseCall();
  if (PHASE === "montage") return phaseMontage();
  if (["screens", "proof", "all"].includes(PHASE)) {
    console.log(`[hero] Phase '${PHASE}' noch nicht implementiert.`);
    console.log("[hero] montage baut die Screen-Section (ohne Gesicht); screens/proof/all folgen.");
    console.log("[hero] Siehe docs/gtm/pipeline/HERO_PIPELINE_BAUPLAN.md.");
    process.exit(2);
  }
  throw new Error(`Unbekannte --phase '${PHASE}' (call|montage|screens|proof).`);
}

main().catch((e) => { console.error("[hero] FEHLER:", e.message); process.exit(1); });
