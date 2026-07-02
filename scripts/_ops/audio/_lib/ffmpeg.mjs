// Thin wrappers around ffmpeg / ffprobe for audio pipeline.
import { spawn } from "node:child_process";
import fs from "node:fs";

function run(cmd, args, { captureStdout = false, captureStderr = true } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", captureStdout ? "pipe" : "inherit", captureStderr ? "pipe" : "inherit"] });
    let out = "";
    let err = "";
    p.stdout?.on("data", (d) => (out += d.toString()));
    p.stderr?.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => {
      if (code === 0) resolve({ stdout: out, stderr: err });
      else reject(new Error(`${cmd} failed (${code}): ${err.slice(-800)}`));
    });
  });
}

export async function ffprobeInfo(file) {
  if (!fs.existsSync(file)) throw new Error(`missing: ${file}`);
  const { stdout } = await run(
    "ffprobe",
    [
      "-v", "error",
      "-select_streams", "a:0",
      "-show_entries", "stream=duration,sample_rate,channels,codec_name,bit_rate",
      "-show_entries", "format=duration,size",
      "-of", "json",
      file,
    ],
    { captureStdout: true, captureStderr: false }
  );
  const j = JSON.parse(stdout);
  const s = (j.streams && j.streams[0]) || {};
  const f = j.format || {};
  return {
    path: file,
    codec: s.codec_name,
    sample_rate: Number(s.sample_rate || 0),
    channels: Number(s.channels || 0),
    duration: Number(s.duration || f.duration || 0),
    bit_rate: Number(s.bit_rate || 0),
    size: Number(f.size || 0),
  };
}

// Two-pass loudnorm to -14 LUFS (YouTube / podcast standard).
// Pass 1 measures, pass 2 applies.
export async function loudnormTwoPass(inFile, outFile, { I = -14, TP = -1.5, LRA = 11, sampleRate = 48000 } = {}) {
  const { stderr: pass1Err } = await run(
    "ffmpeg",
    [
      "-hide_banner", "-y",
      "-i", inFile,
      "-af", `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json`,
      "-f", "null", "-",
    ],
    { captureStderr: true }
  );
  const jsonMatch = pass1Err.match(/\{[\s\S]*"output_tp"[\s\S]*?\}/);
  if (!jsonMatch) throw new Error("loudnorm pass1: no JSON in stderr");
  const measured = JSON.parse(jsonMatch[0]);
  const filter = `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true:print_format=summary`;
  await run(
    "ffmpeg",
    [
      "-hide_banner", "-y",
      "-i", inFile,
      "-af", filter,
      "-ar", String(sampleRate),
      "-ac", "1",
      "-c:a", "pcm_s16le",
      outFile,
    ],
    { captureStderr: true }
  );
  return { measured, outFile };
}

// Clean a founder take's edges WITHOUT clipping the last sound.
// Tail-Bug-Fix: KEIN blindes N-ms-Abschneiden am Ende (das fraß Schluss-Konsonanten/
// Zischlaute: "heiß"→"hei"). Stattdessen nur sub-threshold-STILLE an den Kanten entfernen
// (schützt echten Laut) + winziges Edge-Fade gegen Klick/Stop-Geräusch.
// tailTrimMs bleibt als opt-in (Default 0) — nur setzen, wenn ein Take echt zu lang ist.
export async function cleanFounderSegment(inFile, outFile, { tailTrimMs = 0, edgeFadeMs = 25, silenceDb = -42 } = {}) {
  const parts = [];
  if (tailTrimMs > 0) {
    const info = await ffprobeInfo(inFile);
    const trimTo = Math.max(0.1, info.duration - tailTrimMs / 1000);
    parts.push(`atrim=end=${trimTo.toFixed(3)}`, "asetpts=N/SR/TB");
  }
  const fade = (edgeFadeMs / 1000).toFixed(3);
  parts.push(
    // führende Stille (nur unter Schwelle) weg
    `silenceremove=start_periods=1:start_duration=0.12:start_threshold=${silenceDb}dB:detection=peak`,
    "areverse",
    // nachlaufende Stille weg — Schluss-Laut bleibt, weil nur < silenceDb entfernt wird
    `silenceremove=start_periods=1:start_duration=0.12:start_threshold=${silenceDb}dB:detection=peak`,
    // winziges Fade auf das (reversed) Ende = echtes Take-Ende → killt Stop-Klick, ohne zu schneiden
    `afade=t=in:st=0:d=${fade}`,
    "areverse",
    // gleiches winziges Fade am echten Anfang
    `afade=t=in:st=0:d=${fade}`,
  );
  await run(
    "ffmpeg",
    [
      "-hide_banner", "-y",
      "-i", inFile,
      "-af", parts.join(","),
      "-ar", "48000",
      "-ac", "1",
      "-c:a", "pcm_s16le",
      outFile,
    ],
    { captureStderr: true }
  );
  return outFile;
}

// Concat list of wav files into one. All inputs must share sr/channels.
export async function concatWavs(inputs, outFile, { gapMs = 0 } = {}) {
  if (!inputs.length) throw new Error("concatWavs: empty input list");
  const filterParts = [];
  const labels = [];
  inputs.forEach((_, i) => {
    filterParts.push(`[${i}:a]aresample=48000,aformat=sample_fmts=s16:channel_layouts=mono[a${i}]`);
    labels.push(`[a${i}]`);
    if (gapMs > 0 && i < inputs.length - 1) {
      filterParts.push(`anullsrc=r=48000:cl=mono:d=${(gapMs / 1000).toFixed(3)}[g${i}]`);
      labels.push(`[g${i}]`);
    }
  });
  const filter = filterParts.join(";") + ";" + labels.join("") + `concat=n=${labels.length}:v=0:a=1[out]`;
  const args = ["-hide_banner", "-y"];
  inputs.forEach((f) => args.push("-i", f));
  args.push("-filter_complex", filter, "-map", "[out]", "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", outFile);
  await run("ffmpeg", args, { captureStderr: true });
  return outFile;
}

// Mix two audio streams (e.g. call stereo: caller left, agent right — but keep it mono-duet here).
// Useful for reverse sanity-listen.
export async function mixMono(a, b, outFile, { aGainDb = 0, bGainDb = 0 } = {}) {
  const filter = `[0:a]aresample=48000,aformat=sample_fmts=s16:channel_layouts=mono,volume=${aGainDb}dB[a];[1:a]aresample=48000,aformat=sample_fmts=s16:channel_layouts=mono,volume=${bGainDb}dB[b];[a][b]amix=inputs=2:duration=longest:dropout_transition=0[out]`;
  await run(
    "ffmpeg",
    ["-hide_banner", "-y", "-i", a, "-i", b, "-filter_complex", filter, "-map", "[out]", "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", outFile],
    { captureStderr: true }
  );
  return outFile;
}

// Render waveform PNG for QG reports.
export async function renderWaveformPng(inFile, outPng, { width = 1400, height = 240 } = {}) {
  await run(
    "ffmpeg",
    [
      "-hide_banner", "-y",
      "-i", inFile,
      "-filter_complex", `aformat=channel_layouts=mono,showwavespic=s=${width}x${height}:colors=0x4ab3ff`,
      "-frames:v", "1",
      outPng,
    ],
    { captureStderr: true }
  );
  return outPng;
}

// Mux audio onto a video (re-encodes video copy when possible, audio always replaced).
export async function muxAudioOntoVideo(videoFile, audioFile, outFile, { audioDelayMs = 0, fitMode = "shortest" } = {}) {
  const args = ["-hide_banner", "-y", "-i", videoFile, "-itsoffset", (audioDelayMs / 1000).toFixed(3), "-i", audioFile];
  args.push("-map", "0:v:0", "-map", "1:a:0");
  args.push("-c:v", "copy", "-c:a", "aac", "-b:a", "192k");
  if (fitMode === "shortest") args.push("-shortest");
  args.push(outFile);
  await run("ffmpeg", args, { captureStderr: true });
  return outFile;
}

export { run };
