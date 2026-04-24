// ElevenLabs TTS wrapper — voice-locked for Lisa (Ela DE), Juniper (EN), Gunnar (Fallback).
// Returns mp3 (or wav via ffmpeg decode). Designed for idempotent cache: same text+voice+model = same file.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { run } from "./ffmpeg.mjs";

export const VOICES = {
  ela: {
    id: "NE7AIW5DoJ7lUosXV2KR",
    lang: "de",
    model: "eleven_multilingual_v2",
    name: "Ela (Lisa DE)",
  },
  juniper: {
    id: "aMSt68OGf4xUZAnLpTU8",
    lang: "en",
    model: "eleven_multilingual_v2",
    name: "Juniper (Lisa INTL/EN)",
  },
  gunnar: {
    id: "Yyo65tdqHVByAa8sywXw",
    lang: "de",
    model: "eleven_multilingual_v2",
    name: "Gunnar Clone (Fallback)",
  },
};

function hashKey(obj) {
  return crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex").slice(0, 16);
}

export async function tts({ text, voice, outFile, model, stability = 0.5, similarity = 0.75, style = 0.0, speakerBoost = true, cacheDir }) {
  const v = VOICES[voice];
  if (!v) throw new Error(`unknown voice: ${voice}`);
  const apiKey = process.env.ELEVENLABS_API_KEY?.replace(/^"|"$/g, "");
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  const cacheKey = hashKey({ text, voiceId: v.id, model: model || v.model, stability, similarity, style, speakerBoost });
  let mp3Out = outFile;
  if (!mp3Out) {
    if (!cacheDir) throw new Error("tts() needs outFile or cacheDir");
    fs.mkdirSync(cacheDir, { recursive: true });
    mp3Out = path.join(cacheDir, `${voice}_${cacheKey}.mp3`);
  }

  if (fs.existsSync(mp3Out) && fs.statSync(mp3Out).size > 1000) {
    return { file: mp3Out, cached: true, voice, text };
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${v.id}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: model || v.model,
      voice_settings: {
        stability,
        similarity_boost: similarity,
        style,
        use_speaker_boost: speakerBoost,
      },
    }),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`ElevenLabs HTTP ${resp.status}: ${body.slice(0, 300)}`);
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(mp3Out, buf);
  return { file: mp3Out, cached: false, voice, text };
}

// Convert mp3 → wav 48k mono pcm_s16le with mild loudnorm to -14 LUFS (single-pass is fine for TTS source).
export async function mp3ToWav48kMono(mp3In, wavOut, { applyLoudnorm = true } = {}) {
  const filter = applyLoudnorm ? "aresample=48000,aformat=sample_fmts=s16:channel_layouts=mono,loudnorm=I=-14:TP=-1.5:LRA=11" : "aresample=48000,aformat=sample_fmts=s16:channel_layouts=mono";
  await run(
    "ffmpeg",
    ["-hide_banner", "-y", "-i", mp3In, "-af", filter, "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", wavOut],
    { captureStderr: true }
  );
  return wavOut;
}
