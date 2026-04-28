// OpenAI Whisper API wrapper — word-level timestamps from audio files.
// Uses /v1/audio/transcriptions with response_format="verbose_json" and
// timestamp_granularities=["word"]. Returns array of { word, start, end }.
import fs from "node:fs";
import path from "node:path";

export async function transcribeWithWordTimestamps(audioFile, { language = "de", model = "whisper-1", prompt = "" } = {}) {
  const apiKey = process.env.OPENAI_API_KEY?.replace(/^"|"$/g, "");
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  if (!fs.existsSync(audioFile)) throw new Error(`audio file not found: ${audioFile}`);

  const buffer = fs.readFileSync(audioFile);
  const filename = path.basename(audioFile);
  const boundary = "----whisperboundary" + Math.random().toString(36).slice(2);

  // Build multipart body
  const parts = [];
  const append = (name, value, opts = {}) => {
    parts.push(Buffer.from(`--${boundary}\r\n`));
    if (opts.filename) {
      parts.push(Buffer.from(`Content-Disposition: form-data; name="${name}"; filename="${opts.filename}"\r\n`));
      parts.push(Buffer.from(`Content-Type: ${opts.contentType || "application/octet-stream"}\r\n\r\n`));
      parts.push(value);
      parts.push(Buffer.from("\r\n"));
    } else {
      parts.push(Buffer.from(`Content-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
    }
  };
  append("file", buffer, { filename, contentType: "audio/wav" });
  append("model", model);
  append("response_format", "verbose_json");
  append("timestamp_granularities[]", "word");
  if (language) append("language", language);
  if (prompt) append("prompt", prompt);
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  const body = Buffer.concat(parts);

  // Retry with exponential backoff (3 attempts) for transient network/5xx errors
  let resp;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
        body,
      });
      if (resp.ok) break;
      // Retry on 5xx, abort on 4xx
      if (resp.status >= 500 && attempt < 3) {
        lastErr = `HTTP ${resp.status}`;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      const errBody = await resp.text().catch(() => "");
      throw new Error(`Whisper API ${resp.status}: ${errBody.slice(0, 400)}`);
    } catch (e) {
      lastErr = e.message;
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw new Error(`Whisper API failed after ${attempt} attempts: ${lastErr}`);
    }
  }
  if (!resp || !resp.ok) {
    throw new Error(`Whisper API never succeeded: ${lastErr}`);
  }
  const json = await resp.json();
  return {
    text: json.text || "",
    words: (json.words || []).map((w) => ({ word: w.word, start: w.start, end: w.end })),
    duration: json.duration || null,
    language: json.language || null,
  };
}
