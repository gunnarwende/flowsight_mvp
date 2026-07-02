#!/usr/bin/env node
/**
 * build_hoerbar_masters.mjs — Hörbare Audio-Master pro Einheit (Founder-Abnahme).
 *
 * Baut aus den 42 Founder-Schnipseln (aufnahme/_takes/_masters/*.wav) je EINEN
 * durchgehenden Audio-Master zum Anhören (natürliche Pausen). Quelle bleiben die
 * Schnipsel — das hier ist die Hör-/Abnahme-Assembly.
 *   → MP3 (Storage-Backup, hero-audio/masters_hoerbar/) + MP4 (Waveform+Audio) auf
 *     Bunny STREAM → tappbare Play-URL (iframe, Handy).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/build_hoerbar_masters.mjs
 *     [--only HERO_COLD,KNOTEN2] [--no-upload]
 *
 * Env: BUNNY_STREAM_* (Play-URLs) · BUNNY_STORAGE_* (MP3-Backup).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { concatWavs, ffprobeInfo, renderWaveformPng, run } from "./audio/_lib/ffmpeg.mjs";
import { bunnyEnv, createAndUpload, getVideo, embedUrl } from "./_lib/bunny.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const M = path.join(REPO, "docs/gtm/pipeline/aufnahme/_takes/_masters");
const CALL = path.join(REPO, "docs/gtm/pipeline/06_video_production/_generated/hero_call/hero_call_waerme.wav");
const OUT = path.join(REPO, "docs/gtm/pipeline/06_video_production/_generated/hoerbar_masters");
const STORAGE_BASE = (process.env.BUNNY_STORAGE_HOST || "").replace(/\/$/, "");
const STORAGE_KEY = process.env.BUNNY_STORAGE_PASSWORD;
const GAP_MS = 550;

const argv = process.argv.slice(2);
const only = (argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : "").split(",").filter(Boolean);
const NO_UPLOAD = argv.includes("--no-upload");

const wav = (id) => path.join(M, `${id}.wav`);
const HERO_TAIL = ["HERO-06", "HERO-07", "HERO-08", "HERO-09", "HERO-10", "HERO-11", "HERO-12", "HERO-13", "HERO-14"];
// "CALL" = Platzhalter für hero_call_waerme.wav (Brunner-Stimme = Platzhalter gunnar, offen).
const UNITS = {
  HERO_COLD: { title: "Hero (COLD) — voll", ids: ["HERO-01", "HERO-02", "HERO-03", "HERO-04", "HERO-04B", "HERO-05", "CALL", ...HERO_TAIL] },
  // WARM: kein HERO-04/04B (Wunde "…Sie merken's nicht mal." + Turn "Ab jetzt nicht mehr." = COLD-only laut Spec). Ab HERO-05 identisch.
  HERO_WARM: { title: "Hero (WARM) — voll", ids: ["HERO-W1", "HERO-W2", "HERO-W3", "HERO-05", "CALL", ...HERO_TAIL] },
  KNOTEN2: { title: "Knoten 2 — Überblick", ids: ["K2-01", "K2-02", "K2-03", "K2-04", "K2-05"] },
  KNOTEN3: { title: "Knoten 3 — Haken", ids: ["K3-01", "K3-02", "K3-03", "K3-04", "K3-05", "K3-06", "K3-07", "K3-08", "K3-09", "K3-10"] },
  KNOTEN4: { title: "Knoten 4 — Kosten", ids: ["K4-01", "K4-02", "K4-03", "K4-04", "K4-05", "K4-06", "K4-07", "K4-08", "K4-09"] },
  KNOTEN1: { title: "Knoten 1 — VO-Schluss (Anrufe offen)", ids: ["K1-01"] },
};

async function storageUpload(localFile, remote) {
  if (!STORAGE_KEY || !STORAGE_BASE) { console.log("  ⚠️ Storage-Env fehlt — MP3-Backup übersprungen"); return null; }
  const url = `${STORAGE_BASE}/${remote}`;
  const res = await fetch(url, { method: "PUT", headers: { AccessKey: STORAGE_KEY, "Content-Type": "application/octet-stream" }, body: fs.readFileSync(localFile) });
  if (!res.ok) throw new Error(`Storage-Upload ${remote}: HTTP ${res.status}`);
  return url;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const units = Object.entries(UNITS).filter(([k]) => !only.length || only.includes(k));
  const env = NO_UPLOAD ? null : bunnyEnv();
  const results = [];

  for (const [key, u] of units) {
    console.log(`\n[hoerbar] ${key} — ${u.title}`);
    const inputs = u.ids.map((id) => (id === "CALL" ? CALL : wav(id)));
    const missing = inputs.filter((p) => !fs.existsSync(p));
    if (missing.length) { console.log(`  ⚠️ fehlt: ${missing.map((p) => path.basename(p)).join(", ")} — übersprungen`); continue; }

    const masterWav = path.join(OUT, `${key}.wav`);
    await concatWavs(inputs, masterWav, { gapMs: GAP_MS });
    const dur = (await ffprobeInfo(masterWav)).duration;

    const mp3 = path.join(OUT, `${key}.mp3`);
    await run("ffmpeg", ["-hide_banner", "-y", "-i", masterWav, "-c:a", "libmp3lame", "-b:a", "192k", mp3], { captureStderr: true });

    // MP4 fürs Stream-Playback: Waveform-Standbild + Audio (kein Font-Risiko).
    const wavePng = path.join(OUT, `${key}_wave.png`);
    await renderWaveformPng(masterWav, wavePng, { width: 1280, height: 720 });
    const mp4 = path.join(OUT, `${key}.mp4`);
    await run("ffmpeg", ["-hide_banner", "-y", "-loop", "1", "-i", wavePng, "-i", masterWav,
      "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-r", "2",
      "-c:a", "aac", "-b:a", "192k", "-shortest", mp4], { captureStderr: true });

    const rec = { key, title: u.title, dur_s: +dur.toFixed(1), n_snippets: u.ids.length, play_url: null, mp3_storage: null };

    if (!NO_UPLOAD) {
      // MP3 → Storage (Backup)
      rec.mp3_storage = await storageUpload(mp3, `hero-audio/masters_hoerbar/${key}.mp3`);
      console.log(`  ⬆️  Storage MP3: hero-audio/masters_hoerbar/${key}.mp3`);
      // MP4 → Stream (tappbare Play-URL)
      const guid = await createAndUpload(env, `HÖRBAR ${u.title} (Entwurf, Brunner=Platzhalter)`, mp4);
      // auf Encoding warten (status 4 = finished)
      let status = 0;
      for (let i = 0; i < 60; i++) {
        const v = await getVideo(env, guid).catch(() => ({}));
        status = v.status || 0;
        if (status >= 4) break;
        await new Promise((r) => setTimeout(r, 5000));
      }
      rec.play_url = embedUrl(env.libraryId, guid);
      rec.encode_status = status;
      console.log(`  🎧 Play: ${rec.play_url} (status ${status})`);
    }
    results.push(rec);
    console.log(`  ✅ ${key} · ${rec.dur_s}s · ${u.ids.length} Schnipsel`);
  }

  fs.writeFileSync(path.join(OUT, "hoerbar_masters.report.json"), JSON.stringify({ generated: "2026-07-02", results }, null, 2));
  console.log("\n=== HÖRBAR-MASTER ===");
  for (const r of results) console.log(`${r.key}\t${r.dur_s}s\t${r.play_url || "(kein Upload)"}`);
}
main().catch((e) => { console.error("[hoerbar] FEHLER:", e.message); process.exit(1); });
