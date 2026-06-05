/**
 * Bunny Stream helper for CLI scripts.
 *
 * Hosts the Gold-Contact proof videos (4 Takes per Betrieb). Bunny gives us an
 * adaptive mobile-fullscreen player + per-video watch/device analytics for free
 * (EU/Frankfurt region) — see project_email_phase_kickoff.
 *
 * Env (src/web/.env.local, mirrored on Vercel):
 *   BUNNY_STREAM_API_KEY        — Stream library API key (NEVER log this)
 *   BUNNY_STREAM_LIBRARY_ID     — numeric library id (e.g. 676117)
 *   BUNNY_STREAM_CDN_HOSTNAME   — pull-zone host (e.g. vz-xxxx.b-cdn.net)
 *
 * Usage:
 *   import { bunnyEnv, createVideo, uploadVideo } from "./_lib/bunny.mjs";
 */

import fs from "node:fs";

const API_BASE = "https://video.bunnycdn.com";

/**
 * Canonical T1 (Founder-Intro, face-only, KEIN Text) — betriebsübergreifend IDENTISCH.
 * Bewiesen via md5 (Founder 05.06.): take1.wav + take1_face.mp4 sind über ALLE Tenants
 * bit-gleich → T1 ist tenant-agnostisch. Darum EIN Bunny-Video für ALLE Beweis-Seiten:
 * keine T1-Generierung, kein Upload, kein Speicher-Duplikat pro Betrieb. Vom per-page-
 * Cleanup AUSGENOMMEN (geteiltes Asset — siehe expire_proof_pages.mjs).
 * Neu erzeugen via scripts/_ops/upload_canonical_t1.mjs (dann GUID hier ersetzen).
 */
export const CANONICAL_T1_GUID = "249aa579-e0f9-4622-b34b-6e716dd0a0d2";

/** Read + validate Bunny env. Throws with a clear message if missing. */
export function bunnyEnv() {
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;
  const missing = [];
  if (!apiKey) missing.push("BUNNY_STREAM_API_KEY");
  if (!libraryId) missing.push("BUNNY_STREAM_LIBRARY_ID");
  if (!cdnHostname) missing.push("BUNNY_STREAM_CDN_HOSTNAME");
  if (missing.length) {
    throw new Error(
      `Missing Bunny env: ${missing.join(", ")}. Check src/web/.env.local ` +
        `(run scripts with --env-file=src/web/.env.local).`
    );
  }
  return { apiKey, libraryId, cdnHostname };
}

function headers(apiKey, extra = {}) {
  return { AccessKey: apiKey, accept: "application/json", ...extra };
}

/**
 * Create a video object (metadata) in the library.
 * @returns {Promise<string>} the new video GUID
 */
export async function createVideo({ apiKey, libraryId }, title) {
  const res = await fetch(`${API_BASE}/library/${libraryId}/videos`, {
    method: "POST",
    headers: headers(apiKey, { "content-type": "application/json" }),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    throw new Error(`Bunny createVideo failed: HTTP ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  if (!data.guid) throw new Error(`Bunny createVideo: no guid in response`);
  return data.guid;
}

/**
 * Upload the raw mp4 bytes for an existing video GUID.
 */
export async function uploadVideo({ apiKey, libraryId }, guid, filePath) {
  const buf = fs.readFileSync(filePath);
  const res = await fetch(`${API_BASE}/library/${libraryId}/videos/${guid}`, {
    method: "PUT",
    headers: headers(apiKey, { "content-type": "application/octet-stream" }),
    body: buf,
  });
  if (!res.ok) {
    throw new Error(`Bunny uploadVideo failed: HTTP ${res.status} ${await res.text()}`);
  }
  return true;
}

/** Convenience: create + upload in one call. Returns the GUID. */
export async function createAndUpload(env, title, filePath) {
  const guid = await createVideo(env, title);
  await uploadVideo(env, guid, filePath);
  return guid;
}

/** Get a video's encoding status (status 4 = finished, 3 = processing). */
export async function getVideo({ apiKey, libraryId }, guid) {
  const res = await fetch(`${API_BASE}/library/${libraryId}/videos/${guid}`, {
    headers: headers(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Bunny getVideo failed: HTTP ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Delete a video (used by the 14-day lifecycle cleanup). */
export async function deleteVideo({ apiKey, libraryId }, guid) {
  const res = await fetch(`${API_BASE}/library/${libraryId}/videos/${guid}`, {
    method: "DELETE",
    headers: headers(apiKey),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Bunny deleteVideo failed: HTTP ${res.status} ${await res.text()}`);
  }
  return true;
}

/**
 * Watch-Statistik für die Library oder ein einzelnes Video (Stream-Key genügt).
 * Liefert viewsChart, watchTimeChart (Sek/Tag), engagementScore, countryViewCounts.
 */
export async function getStatistics({ apiKey, libraryId }, { guid, dateFrom, dateTo } = {}) {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  if (guid) params.set("videoGuid", guid);
  const res = await fetch(`${API_BASE}/library/${libraryId}/statistics?${params}`, {
    headers: headers(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Bunny getStatistics failed: HTTP ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Sum all daily values of a Bunny chart object ({iso: number}). */
export function sumChart(chart) {
  return Object.values(chart || {}).reduce((a, b) => a + (Number(b) || 0), 0);
}

/** Public iframe embed URL for a video (adaptive, mobile-fullscreen-capable). */
export function embedUrl(libraryId, guid, opts = {}) {
  const params = new URLSearchParams({
    autoplay: opts.autoplay ? "true" : "false",
    preload: opts.preload ? "true" : "false",
    responsive: "true",
  });
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}?${params}`;
}
