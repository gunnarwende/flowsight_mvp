#!/usr/bin/env node
/**
 * build_hero_schablone.mjs — Hero-Audio-REFERENZ-Schablone (Temp-Track).
 *
 * Setzt docs/gtm/pipeline/HERO_AUDIO_SCHABLONE_REGIE.md um: EINE sauber getaktete
 * Referenz aus den bestehenden Schnipseln (HERO-01…14 + Klingeln + CALL) — COLD + WARM.
 * NICHT der finale Master (Founder performt später dagegen).
 *
 * Regeln (Regie): dynamische Pausen aus der Tabelle (davor/danach je Segment, unten als
 * Konstanten — leicht justierbar); Klingel-Beat vor dem CALL; Schluss = eine Bewegung mit
 * heiliger 1,5s vor HERO-13 + 2,0s Stille am Ende; Loudness über den GANZEN Track (−16/−1).
 * Quelle = die bereits kanten-sauberen Phase-1-Master (letzter Laut geschützt).
 *
 * Usage: node --env-file=src/web/.env.local scripts/_ops/build_hero_schablone.mjs [--no-upload]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { concatWavs, loudnormTwoPass, ffprobeInfo, renderWaveformPng, run } from "./audio/_lib/ffmpeg.mjs";
import { gateLoudness, gateNoClipping } from "./audio/_lib/quality.mjs";
import { bunnyEnv, createAndUpload, getVideo, embedUrl } from "./_lib/bunny.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const M = path.join(REPO, "docs/gtm/pipeline/aufnahme/_takes/_masters");
const CALL = path.join(REPO, "docs/gtm/pipeline/06_video_production/_generated/hero_call/hero_call_waerme.wav");
const RING = path.join(REPO, "docs/gtm/pipeline/06_video_production/_assets/ring_tone_swiss.wav");
const OUT = path.join(REPO, "docs/gtm/pipeline/06_video_production/_generated/hero_schablone");
const STORAGE_BASE = (process.env.BUNNY_STORAGE_HOST || "").replace(/\/$/, "");
const STORAGE_KEY = process.env.BUNNY_STORAGE_PASSWORD;
const NO_UPLOAD = process.argv.includes("--no-upload");

// ── Regie-Tabelle als Konstanten (Sekunden). davor/danach je Segment; der Gap ZWISCHEN
// zwei Stücken = max(danach_prev, davor_cur) → ehrt die stärkere Absicht (⭐ heilig bleibt). ──
const KLINGEL_GAP_MS = 900; // Stille zwischen den 2 Ring-Tönen (~3s Klingel-Beat total)
const COLD = [
  { id: "HERO-01", davor: 0.0, danach: 1.0 },
  { id: "HERO-02", davor: 0.4, danach: 0.6 },
  { id: "HERO-03", davor: 0.5, danach: 1.2 },
  { id: "HERO-04", davor: 1.0, danach: 0.5 }, // COLD-only
  { id: "HERO-05", davor: 0.4, danach: 0.3 }, // danach: kurz bis Klingeln
  { id: "__KLINGEL__", davor: 0.0, danach: 0.2 }, // ~3s, dann "abnehmen"
  { id: "__CALL__", davor: 0.0, danach: 1.0 }, // Lisa+Brunner, dann "Anruf beendet"
  { id: "HERO-06", davor: 0.0, danach: 0.4 },
  { id: "HERO-07", davor: 0.4, danach: 1.5 },
  { id: "HERO-08", davor: 1.2, danach: 0.3 },
  { id: "HERO-09", davor: 0.3, danach: 0.5 },
  { id: "HERO-10", davor: 0.5, danach: 0.35 },
  { id: "HERO-11", davor: 0.35, danach: 0.4 },
  { id: "HERO-12", davor: 0.5, danach: 1.5 },
  { id: "HERO-13", davor: 1.5, danach: 1.0 }, // ⭐ heilige Pause davor
  { id: "HERO-14", davor: 1.0, danach: 2.0 }, // 2,0s Stille am Ende
];
const WARM_HEAD = [
  { id: "HERO-W1", davor: 0.0, danach: 0.5 },
  { id: "HERO-W2", davor: 0.4, danach: 0.5 },
  { id: "HERO-W3", davor: 0.4, danach: 0.3 }, // "Fangen wir an." leicht → Klingeln
];
// WARM = Kopf (W1–W3) + geteilter Körper ab HERO-05 (COLD ohne HERO-01…04). Kein HERO-04.
const WARM = [...WARM_HEAD, ...COLD.slice(4)]; // COLD[4] = HERO-05

async function silence(sec, out) {
  await run("ffmpeg", ["-hide_banner", "-y", "-f", "lavfi", "-t", sec.toFixed(3),
    "-i", "anullsrc=r=48000:cl=mono", "-c:a", "pcm_s16le", out], { captureStderr: true });
  return out;
}
async function buildKlingel() {
  // 2 Ring-Töne mit KLINGEL_GAP dazwischen (~3s Klingel-Beat)
  const gap = path.join(OUT, "_ring_gap.wav");
  await silence(KLINGEL_GAP_MS / 1000, gap);
  const out = path.join(OUT, "_klingel.wav");
  await concatWavs([RING, gap, RING], out, { gapMs: 0 });
  return out;
}
function resolvePiece(p, klingelWav) {
  if (p.id === "__KLINGEL__") return klingelWav;
  if (p.id === "__CALL__") return CALL;
  return path.join(M, `${p.id}.wav`);
}

async function assemble(name, pieces, klingelWav) {
  const files = [];
  for (let i = 0; i < pieces.length; i++) {
    if (i > 0) {
      const gap = Math.max(pieces[i - 1].danach || 0, pieces[i].davor || 0);
      if (gap > 0) files.push(await silence(gap, path.join(OUT, `_gap_${name}_${i}.wav`)));
    }
    files.push(resolvePiece(pieces[i], klingelWav));
  }
  // Schluss-Stille = danach des letzten Segments
  const endSil = pieces[pieces.length - 1].danach || 0;
  if (endSil > 0) files.push(await silence(endSil, path.join(OUT, `_gap_${name}_end.wav`)));

  const raw = path.join(OUT, `hero_schablone_${name}_raw.wav`);
  await concatWavs(files, raw, { gapMs: 0 });
  const finalWav = path.join(OUT, `hero_schablone_${name}.wav`);
  await loudnormTwoPass(raw, finalWav, { I: -16, TP: -1, LRA: 11, sampleRate: 48000 });
  const mp3 = path.join(OUT, `hero_schablone_${name}.mp3`);
  await run("ffmpeg", ["-hide_banner", "-y", "-i", finalWav, "-c:a", "libmp3lame", "-b:a", "192k", mp3], { captureStderr: true });
  const dur = (await ffprobeInfo(finalWav)).duration;
  const gL = await gateLoudness(finalWav, { expectedI: -16, tolerance: 1.0, maxTP: -1.0 });
  const gC = await gateNoClipping(finalWav);
  return { name, mp3, finalWav, dur, gL, gC };
}

async function streamUpload(mp3, finalWav, title, env) {
  const wavePng = mp3.replace(/\.mp3$/, "_wave.png");
  await renderWaveformPng(finalWav, wavePng, { width: 1280, height: 720 });
  const mp4 = mp3.replace(/\.mp3$/, ".mp4");
  await run("ffmpeg", ["-hide_banner", "-y", "-loop", "1", "-i", wavePng, "-i", finalWav,
    "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-r", "2",
    "-c:a", "aac", "-b:a", "192k", "-shortest", mp4], { captureStderr: true });
  const guid = await createAndUpload(env, title, mp4);
  let status = 0;
  for (let i = 0; i < 60; i++) { const v = await getVideo(env, guid).catch(() => ({})); status = v.status || 0; if (status >= 4) break; await new Promise((r) => setTimeout(r, 5000)); }
  return { url: embedUrl(env.libraryId, guid), status };
}
async function storageUpload(localFile, remote) {
  if (!STORAGE_KEY || !STORAGE_BASE) return null;
  const url = `${STORAGE_BASE}/${remote}`;
  const res = await fetch(url, { method: "PUT", headers: { AccessKey: STORAGE_KEY, "Content-Type": "application/octet-stream" }, body: fs.readFileSync(localFile) });
  if (!res.ok) throw new Error(`Storage ${remote}: HTTP ${res.status}`);
  return url;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const p of [...COLD, ...WARM_HEAD]) {
    if (p.id.startsWith("__")) continue;
    const f = path.join(M, `${p.id}.wav`);
    if (!fs.existsSync(f)) throw new Error(`Master fehlt: ${f}`);
  }
  if (!fs.existsSync(CALL)) throw new Error(`Call-Audio fehlt: ${CALL} (erst produce_hero --phase call)`);
  if (!fs.existsSync(RING)) throw new Error(`Ring-Ton fehlt: ${RING}`);

  const klingel = await buildKlingel();
  const results = [];
  results.push(await assemble("cold", COLD, klingel));
  results.push(await assemble("warm", WARM, klingel));

  const env = NO_UPLOAD ? null : bunnyEnv();
  const out = [];
  for (const r of results) {
    let url = null, status = null, storage = null;
    if (!NO_UPLOAD) {
      storage = await storageUpload(r.mp3, `hero-audio/schablone/hero_schablone_${r.name}.mp3`);
      const up = await streamUpload(r.mp3, r.finalWav, `Hero Audio-SCHABLONE ${r.name.toUpperCase()} (Referenz, Brunner=Platzhalter)`, env);
      url = up.url; status = up.status;
    }
    out.push({ name: r.name, dur_s: +r.dur.toFixed(1), loudness: r.gL.pass, clipping: r.gC.pass, play_url: url, encode_status: status, mp3_storage: storage });
    console.log(`[schablone] ${r.name.toUpperCase()} · ${r.dur.toFixed(1)}s · loudness ${r.gL.pass ? "PASS" : "FAIL"} · clipping ${r.gC.pass ? "PASS" : "FAIL"}${url ? ` · ${url}` : ""}`);
  }
  fs.writeFileSync(path.join(OUT, "hero_schablone.report.json"), JSON.stringify({ generated: "2026-07-02", results: out }, null, 2));
}
main().catch((e) => { console.error("[schablone] FEHLER:", e.message); process.exit(1); });
