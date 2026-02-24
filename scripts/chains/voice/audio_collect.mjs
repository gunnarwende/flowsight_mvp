// scripts/chains/voice/audio_collect.mjs
// Audio Collector: downloads call recordings from Retell → tmp/chains/voice/audio/<short_id>/
//
// Usage (module):
//   import { collectAudio } from "./audio_collect.mjs";
//   const result = await collectAudio(rawCallJson);

import { writeFileSync, mkdirSync, existsSync, statSync } from "fs";

const AUDIO_DIR = "tmp/chains/voice/audio";

/**
 * Download a call's recording WAV to local cache.
 * NEVER logs the recording URL (contains signed auth token).
 *
 * @param {object} raw - Full Retell get-call response
 * @param {{ force?: boolean }} opts
 * @returns {{ downloaded: boolean, cached: boolean, wavPath: string|null, callDir: string, sizeMb?: string, error?: string }}
 */
export async function collectAudio(raw, opts = {}) {
  const callId = raw.call_id ?? "unknown";
  const shortId = callId.slice(0, 12);
  const callDir = `${AUDIO_DIR}/${shortId}`;
  const wavPath = `${callDir}/input.wav`;

  // Cache hit — skip download unless forced
  if (existsSync(wavPath) && !opts.force) {
    const size = statSync(wavPath).size;
    return {
      downloaded: false,
      cached: true,
      wavPath,
      callDir,
      sizeMb: (size / 1024 / 1024).toFixed(2),
    };
  }

  // Get recording URL (NEVER log this — signed URL contains auth token)
  const url = raw.recording_url ?? raw.audio_url;
  if (!url) {
    return {
      downloaded: false,
      cached: false,
      wavPath: null,
      callDir,
      error: "no_recording_url",
    };
  }

  mkdirSync(callDir, { recursive: true });

  // Download via native fetch
  const res = await fetch(url);
  if (!res.ok) {
    return {
      downloaded: false,
      cached: false,
      wavPath: null,
      callDir,
      error: `http_${res.status}`,
    };
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(wavPath, buffer);

  const sizeMb = (buffer.length / 1024 / 1024).toFixed(2);
  return { downloaded: true, cached: false, wavPath, callDir, sizeMb };
}
