#!/usr/bin/env node
/**
 * splice_audio.mjs — Chirurgischer Audio-Splice mit ElevenLabs TTS
 *
 * Ersetzt Wörter/Phrasen in einer WAV-Datei durch TTS-generierte
 * Replacement-Audio in der gleichen Stimme. Für Agent (Ela) und
 * Founder (Gunnar) Audio.
 *
 * Usage:
 *   node --env-file=.env.local scripts/_ops/splice_audio.mjs \
 *     --input <wav> --voice ela --output <wav> \
 *     --corrections '[{"start_s":107.5,"end_s":108.3,"text":"Oberrieden"}]'
 *
 *   For founder audio with pre-recorded replacement:
 *   node --env-file=.env.local scripts/_ops/splice_audio.mjs \
 *     --input <wav> --output <wav> \
 *     --file-corrections '[{"start_s":5.0,"end_s":7.0,"file":"replacement.wav"}]'
 *
 * Voice IDs:
 *   ela    → NE7AIW5DoJ7lUosXV2KR (Retell Agent Stimme)
 *   gunnar → Yyo65tdqHVByAa8sywXw (Founder Clone — nur für Notfälle)
 *
 * Requires: ELEVENLABS_API_KEY, ffmpeg
 */

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/* ── Helpers ─────────────────────────────────────────────────────── */

function findFfmpeg() {
  try { execSync("ffmpeg -version", { stdio: "ignore" }); return "ffmpeg"; } catch {}
  const winget = path.join(
    process.env.HOME || process.env.USERPROFILE || "",
    "AppData/Local/Microsoft/WinGet/Packages",
    "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "ffmpeg-8.1-full_build/bin/ffmpeg"
  );
  if (fs.existsSync(winget)) return winget;
  throw new Error("ffmpeg not found");
}

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
  } catch (e) {
    // ffmpeg writes info to stderr — combine stdout+stderr
    return (e.stdout?.toString() || "") + (e.stderr?.toString() || "");
  }
}

function getMeanVolume(file, startS, durationS) {
  const ss = startS != null ? `-ss ${startS}` : "";
  const t = durationS != null ? `-t ${durationS}` : "";
  // ffmpeg writes volumedetect to stderr. Use spawnSync to capture it regardless of exit code.
  const ffmpegBin = ffmpeg.includes(" ") ? ffmpeg : ffmpeg;
  const args = [];
  if (startS != null) args.push("-ss", String(startS));
  args.push("-i", file);
  if (durationS != null) args.push("-t", String(durationS));
  args.push("-af", "volumedetect", "-f", "null", "NUL");
  const result = spawnSync(ffmpegBin, args, { encoding: "utf8", timeout: 30000 });
  const stderr = result.stderr || "";
  const match = stderr.match(/mean_volume:\s*([-\d.]+)/);
  return match ? parseFloat(match[1]) : -91;
}

/* ── Args ────────────────────────────────────────────────────────── */

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const idx = a.indexOf("=");
    if (idx === -1) return [a.replace(/^--/, ""), "true"];
    return [a.substring(0, idx).replace(/^--/, ""), a.substring(idx + 1)];
  })
);

const inputPath = args.input;
const outputPath = args.output;
const voiceName = args.voice || "ela";

if (!inputPath || !outputPath) {
  console.error("Usage: --input <wav> --output <wav> --voice ela --corrections '[...]'");
  process.exit(1);
}

const VOICE_IDS = {
  ela: "NE7AIW5DoJ7lUosXV2KR",
  gunnar: "Yyo65tdqHVByAa8sywXw",
};

const VOICE_SETTINGS = {
  ela: { stability: 0.65, similarity_boost: 0.75, style: 0.15 },
  gunnar: { stability: 0.35, similarity_boost: 0.90, style: 0.55 },
};

const apiKey = process.env.ELEVENLABS_API_KEY?.replace(/^"|"$/g, "");
const ffmpeg = findFfmpeg();

// Parse corrections
const ttsCorrections = args.corrections ? JSON.parse(args.corrections) : [];
const fileCorrections = args["file-corrections"] ? JSON.parse(args["file-corrections"]) : [];
const allCorrections = [
  ...ttsCorrections.map(c => ({ ...c, type: "tts" })),
  ...fileCorrections.map(c => ({ ...c, type: "file" })),
].sort((a, b) => a.start_s - b.start_s);

if (allCorrections.length === 0) {
  console.error("No corrections specified. Use --corrections or --file-corrections.");
  process.exit(1);
}

/* ── Main ────────────────────────────────────────────────────────── */

const tmpDir = path.join(path.dirname(outputPath), "_splice_tmp_" + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

console.log(`\n  Input:       ${inputPath}`);
console.log(`  Output:      ${outputPath}`);
console.log(`  Voice:       ${voiceName}`);
console.log(`  Corrections: ${allCorrections.length}`);

// Get input duration via ffprobe (reliable)
function getDuration(file) {
  const out = run(`"${ffmpeg.replace('ffmpeg','ffprobe')}" -v error -show_entries format=duration -of csv=p=0 "${file}"`);
  return parseFloat(out) || 0;
}
const inputDuration = getDuration(inputPath);
console.log(`  Input dur:   ${inputDuration.toFixed(2)}s`);

// Process each correction
const segments = [];
let lastEnd = 0;

for (let i = 0; i < allCorrections.length; i++) {
  const c = allCorrections[i];
  console.log(`\n  Correction ${i + 1}: ${c.start_s}s–${c.end_s}s → "${c.text || c.file}"`);

  // Before segment
  if (c.start_s > lastEnd) {
    const beforeFile = path.join(tmpDir, `before_${i}.wav`);
    run(`"${ffmpeg}" -y -i "${inputPath}" -ss ${lastEnd} -to ${c.start_s} -acodec pcm_s16le -ar 48000 -ac 1 "${beforeFile}"`);
    segments.push(beforeFile);
  }

  // Generate replacement
  const replacementFile = path.join(tmpDir, `replacement_${i}.wav`);
  const originalDuration = c.end_s - c.start_s;

  if (c.type === "tts") {
    // Generate via ElevenLabs TTS
    const voiceId = VOICE_IDS[voiceName];
    const settings = VOICE_SETTINGS[voiceName];

    if (!apiKey) { console.error("ELEVENLABS_API_KEY not set"); process.exit(1); }

    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: c.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: settings,
      }),
    });

    if (!resp.ok) {
      console.error(`  TTS API error: ${resp.status}`);
      process.exit(1);
    }

    const mp3File = path.join(tmpDir, `tts_${i}.mp3`);
    fs.writeFileSync(mp3File, Buffer.from(await resp.arrayBuffer()));

    // Convert to WAV
    const rawWav = path.join(tmpDir, `tts_${i}_raw.wav`);
    run(`"${ffmpeg}" -y -i "${mp3File}" -acodec pcm_s16le -ar 48000 -ac 1 "${rawWav}"`);

    // Get TTS duration
    const ttsDuration = getDuration(rawWav) || originalDuration;

    console.log(`  TTS duration: ${ttsDuration.toFixed(2)}s (target: ${originalDuration.toFixed(2)}s)`);

    // Adjust tempo to match original duration
    const tempoRatio = ttsDuration / originalDuration;
    if (tempoRatio > 0.5 && tempoRatio < 2.0) {
      run(`"${ffmpeg}" -y -i "${rawWav}" -af "atempo=${tempoRatio.toFixed(4)},afade=t=in:d=0.03,afade=t=out:st=${(originalDuration - 0.05).toFixed(3)}:d=0.05" -t ${originalDuration.toFixed(3)} -acodec pcm_s16le -ar 48000 -ac 1 "${replacementFile}"`);
    } else {
      // Tempo ratio too extreme, just trim/pad
      run(`"${ffmpeg}" -y -i "${rawWav}" -af "afade=t=in:d=0.03,afade=t=out:d=0.05" -t ${originalDuration.toFixed(3)} -acodec pcm_s16le -ar 48000 -ac 1 "${replacementFile}"`);
    }
  } else {
    // Use pre-recorded file — pad with silence if shorter than target duration
    const fileDur = getDuration(c.file) || originalDuration;
    if (fileDur < originalDuration) {
      // Pad: audio + silence to fill the gap
      const padDuration = originalDuration - fileDur;
      console.log(`  Padding: ${fileDur.toFixed(2)}s audio + ${padDuration.toFixed(2)}s silence = ${originalDuration.toFixed(2)}s`);
      run(`"${ffmpeg}" -y -i "${c.file}" -f lavfi -i "anullsrc=r=48000:cl=mono" -filter_complex "[0:a]aformat=sample_rates=48000:channel_layouts=mono[a];[1:a]atrim=0:${padDuration.toFixed(3)}[s];[a][s]concat=n=2:v=0:a=1[out]" -map "[out]" -acodec pcm_s16le -ar 48000 -ac 1 "${replacementFile}"`);
    } else {
      run(`"${ffmpeg}" -y -i "${c.file}" -t ${originalDuration.toFixed(3)} -acodec pcm_s16le -ar 48000 -ac 1 "${replacementFile}"`);
    }
  }

  // Volume-match replacement to surrounding audio
  const surroundVol = getMeanVolume(inputPath, Math.max(0, c.start_s - 2), 2);
  const replVol = getMeanVolume(replacementFile, null, null);
  const volDiff = surroundVol - replVol;

  if (Math.abs(volDiff) > 1) {
    const adjustedFile = path.join(tmpDir, `replacement_${i}_adj.wav`);
    run(`"${ffmpeg}" -y -i "${replacementFile}" -af "volume=${volDiff.toFixed(1)}dB" -acodec pcm_s16le -ar 48000 -ac 1 "${adjustedFile}"`);
    fs.renameSync(adjustedFile, replacementFile);
    console.log(`  Volume adjusted: ${volDiff.toFixed(1)}dB (surround: ${surroundVol.toFixed(1)}dB, replacement: ${replVol.toFixed(1)}dB)`);
  }

  segments.push(replacementFile);
  lastEnd = c.end_s;
}

// After segment (rest of the file)
if (lastEnd < inputDuration) {
  const afterFile = path.join(tmpDir, `after_final.wav`);
  run(`"${ffmpeg}" -y -i "${inputPath}" -ss ${lastEnd} -acodec pcm_s16le -ar 48000 -ac 1 "${afterFile}"`);
  segments.push(afterFile);
}

// Build concat list
const listFile = path.join(tmpDir, "concat.txt");
// Use relative paths from the concat list file's directory for Windows compatibility
fs.writeFileSync(listFile, segments.map(f => `file '${path.basename(f)}'`).join("\n"));

// Concatenate
run(`"${ffmpeg}" -y -f concat -safe 0 -i "${listFile}" -acodec pcm_s16le -ar 48000 -ac 1 "${outputPath}"`);

/* ── QA Check ────────────────────────────────────────────────────── */

console.log("\n  ━━━ QA CHECK ━━━");

const outputDuration = getDuration(outputPath);

let qaPass = true;

// 1. Duration check
const durationDiff = Math.abs(outputDuration - inputDuration);
if (durationDiff > 0.5) {
  console.log(`  ❌ Duration mismatch: ${outputDuration.toFixed(2)}s vs ${inputDuration.toFixed(2)}s (diff: ${durationDiff.toFixed(2)}s)`);
  qaPass = false;
} else {
  console.log(`  ✅ Duration: ${outputDuration.toFixed(2)}s (diff: ${durationDiff.toFixed(3)}s)`);
}

// 2. Splice point silence check
for (const c of allCorrections) {
  const spliceVol = getMeanVolume(outputPath, c.start_s - 0.2, 0.5);
  if (spliceVol < -50) {
    console.log(`  ❌ Silence at splice ${c.start_s}s: ${spliceVol.toFixed(1)}dB`);
    qaPass = false;
  } else {
    console.log(`  ✅ Splice ${c.start_s}s: ${spliceVol.toFixed(1)}dB (no silence)`);
  }
}

// 3. Overall volume consistency (5s windows)
let prevVol = null;
for (let s = 0; s < outputDuration - 5; s += 5) {
  const vol = getMeanVolume(outputPath, s, 5);
  if (vol < -50) {
    console.log(`  ❌ Silent window at ${s}s: ${vol.toFixed(1)}dB`);
    qaPass = false;
  }
  if (prevVol !== null && Math.abs(vol - prevVol) > 8) {
    console.log(`  ⚠️  Volume jump at ${s}s: ${prevVol.toFixed(1)}→${vol.toFixed(1)}dB (${Math.abs(vol - prevVol).toFixed(1)}dB)`);
  }
  prevVol = vol;
}

// 4. Clipping check
const maxVol = parseFloat(
  run(`"${ffmpeg}" -i "${outputPath}" -af volumedetect -f null NUL`)
    .match(/max_volume:\s*([-\d.]+)/)?.[1] || "0"
);
if (maxVol > -0.5) {
  console.log(`  ⚠️  Near clipping: max ${maxVol.toFixed(1)}dB`);
} else {
  console.log(`  ✅ No clipping: max ${maxVol.toFixed(1)}dB`);
}

console.log(`\n  ${qaPass ? "✅ QA PASSED" : "❌ QA FAILED"}`);
console.log(`  Output: ${outputPath}`);

// Cleanup
fs.rmSync(tmpDir, { recursive: true, force: true });

if (!qaPass) {
  console.log("\n  ⚠️  QA issues detected. Review the output before using.");
}
