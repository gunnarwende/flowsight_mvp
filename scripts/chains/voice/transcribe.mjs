// scripts/chains/voice/transcribe.mjs
// Transcription orchestrator: spawns WhisperX Python process
//
// Usage (module):
//   import { transcribeAudio } from "./transcribe.mjs";
//   const result = await transcribeAudio(wavPath, callDir, { model: "base" });

import { spawn } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { existsSync, readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PYTHON_SCRIPT = resolve(__dirname, "whisperx_transcribe.py");

/**
 * Locate Python 3.12 binary.
 * Priority: PYTHON_PATH env → known install path → generic "python".
 */
function findPython() {
  const candidates = [
    process.env.PYTHON_PATH,
    "C:\\Users\\wende\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
    "python",
  ].filter(Boolean);

  for (const p of candidates) {
    if (p.includes("\\") || p.includes("/")) {
      if (existsSync(p)) return p;
    } else {
      return p; // rely on PATH
    }
  }

  throw new Error(
    "Python not found. Install Python 3.12 or set PYTHON_PATH env var.",
  );
}

/**
 * Check if WhisperX output already exists (cache hit).
 */
function hasCache(callDir) {
  const wordsPath = resolve(callDir, "whisperx", "words.json");
  return existsSync(wordsPath);
}

/**
 * Run WhisperX transcription on a WAV file.
 *
 * @param {string} wavPath - Path to input WAV
 * @param {string} callDir - Output directory (whisperx/ subdir created inside)
 * @param {{ model?: string, language?: string, force?: boolean }} opts
 * @returns {Promise<{ status: string, language: string, word_count: number, segment_count: number, duration_s: number, words_path: string, segments_path: string, vtt_path: string }>}
 */
export async function transcribeAudio(wavPath, callDir, opts = {}) {
  // Cache check
  if (!opts.force && hasCache(callDir)) {
    // Read cached result
    const wordsPath = resolve(callDir, "whisperx", "words.json");
    const words = JSON.parse(readFileSync(wordsPath, "utf8"));
    return {
      status: "cached",
      language: "unknown",
      word_count: words.length,
      segment_count: -1,
      duration_s: words.length > 0 ? words[words.length - 1].end : 0,
      words_path: wordsPath,
      segments_path: resolve(callDir, "whisperx", "segments.json"),
      vtt_path: resolve(callDir, "whisperx", "transcript.vtt"),
    };
  }

  const pythonBin = findPython();
  const model = opts.model ?? "base";

  const args = [PYTHON_SCRIPT, wavPath, callDir, "--model", model];
  if (opts.language) {
    args.push("--language", opts.language);
  }

  return new Promise((resolveP, rejectP) => {
    const proc = spawn(pythonBin, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      // Forward [whisperx] progress lines to console
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("[whisperx]")) {
          console.log(`  ${trimmed}`);
        }
      }
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        rejectP(
          new Error(
            `WhisperX exited with code ${code}: ${stderr.slice(-500)}`,
          ),
        );
        return;
      }

      // Parse result JSON from the marker line
      const marker = "__WHISPERX_RESULT__:";
      const idx = stdout.indexOf(marker);
      if (idx === -1) {
        rejectP(
          new Error(
            "WhisperX did not produce result marker. Last output: " +
              stdout.slice(-300),
          ),
        );
        return;
      }

      try {
        const jsonStr = stdout
          .slice(idx + marker.length)
          .split("\n")[0]
          .trim();
        const result = JSON.parse(jsonStr);
        resolveP(result);
      } catch (err) {
        rejectP(new Error(`Failed to parse WhisperX result: ${err.message}`));
      }
    });

    proc.on("error", (err) => {
      rejectP(new Error(`Failed to spawn Python: ${err.message}`));
    });
  });
}
