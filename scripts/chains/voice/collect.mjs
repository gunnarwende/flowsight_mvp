// scripts/chains/voice/collect.mjs
// Collector: pulls call data from Retell API → tmp/chains/voice/raw/
//
// Usage (module):
//   import { collectCalls } from "./collect.mjs";
//   const calls = await collectCalls({ last: 2 });
//   const calls = await collectCalls({ ids: ["call_abc", "call_def"] });

import { writeFileSync, mkdirSync } from "fs";

const RAW_DIR = "tmp/chains/voice/raw";
const BASE_URL = "https://api.retellai.com";

function getApiKey() {
  const key = process.env.RETELL_API_KEY;
  if (!key) {
    throw new Error(
      "RETELL_API_KEY not set. Run: $env:RETELL_API_KEY='rk_...' in PowerShell before running.",
    );
  }
  return key;
}

async function retellFetch(path, options = {}) {
  const key = getApiKey();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Retell API ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * List recent calls, newest first.
 * Retell POST /v2/list-calls with sort + limit.
 */
async function listCalls(limit) {
  const body = {
    sort_order: "descending",
    limit,
    filter_criteria: {},
  };
  const data = await retellFetch("/v2/list-calls", {
    method: "POST",
    body: JSON.stringify(body),
  });
  // Retell returns array directly or wrapped — handle both
  return Array.isArray(data) ? data : data.calls ?? data.data ?? [];
}

/**
 * Get full call detail including transcript_object + analysis.
 */
async function getCall(callId) {
  return retellFetch(`/v2/get-call/${callId}`);
}

/**
 * Main collector entry point.
 * @param {{ last?: number, ids?: string[] }} opts
 * @returns {Array<{ callId: string, raw: object, rawPath: string }>}
 */
export async function collectCalls(opts) {
  mkdirSync(RAW_DIR, { recursive: true });

  let callIds;

  if (opts.ids && opts.ids.length > 0) {
    callIds = opts.ids;
  } else {
    const limit = opts.last ?? 2;
    const listed = await listCalls(limit);
    callIds = listed.map((c) => c.call_id).filter(Boolean);
    if (callIds.length === 0) {
      throw new Error("No calls found in Retell call history.");
    }
  }

  const results = [];

  for (const callId of callIds) {
    const raw = await getCall(callId);
    const shortId = callId.slice(0, 12);
    const rawPath = `${RAW_DIR}/${shortId}.json`;
    writeFileSync(rawPath, JSON.stringify(raw, null, 2) + "\n");
    results.push({ callId, raw, rawPath });
  }

  return results;
}
