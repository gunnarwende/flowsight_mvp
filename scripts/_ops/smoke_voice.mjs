#!/usr/bin/env node
/**
 * Voice Post-Deploy Smoke — fast regression catcher (~30s).
 *
 * Checks:
 *   1) GET /api/health → 200
 *   2) GET /api/retell/webhook → 200
 *   3) Supabase: active tenant_numbers count
 *   4) Supabase: newest voice case age (hours)
 *
 * Output: single JSON line, no PII, no secrets, no IDs.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/smoke_voice.mjs
 */

const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://flowsight-mvp.vercel.app";
const supaUrl = process.env.SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supaUrl || !supaKey) {
  console.log(JSON.stringify({ pass: false, error: "missing_env", detail: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }));
  process.exitCode = 1;
  throw new Error("env");
}

const headers = { apikey: supaKey, Authorization: `Bearer ${supaKey}` };
const result = { pass: true, health: "fail", webhook: "fail", numbers: 0, last_voice_case_age_h: -1 };

// 1) Health
try {
  const r = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(5000) });
  result.health = r.ok ? "ok" : `http_${r.status}`;
} catch { result.health = "timeout"; }

// 2) Webhook GET
try {
  const r = await fetch(`${baseUrl}/api/retell/webhook`, { signal: AbortSignal.timeout(5000) });
  result.webhook = r.ok ? "ok" : `http_${r.status}`;
} catch { result.webhook = "timeout"; }

// 3) Active tenant_numbers count
try {
  const r = await fetch(`${supaUrl}/rest/v1/tenant_numbers?active=eq.true&select=id`, {
    headers: { ...headers, Prefer: "count=exact" },
  });
  const range = r.headers.get("content-range");
  result.numbers = range ? parseInt(range.split("/")[1], 10) : 0;
} catch { result.numbers = -1; }

// 4) Newest voice case age
try {
  const r = await fetch(
    `${supaUrl}/rest/v1/cases?source=eq.voice&status=neq.archived&select=created_at&order=created_at.desc&limit=1`,
    { headers },
  );
  const data = await r.json();
  if (Array.isArray(data) && data.length > 0) {
    const ageMs = Date.now() - new Date(data[0].created_at).getTime();
    result.last_voice_case_age_h = Math.round(ageMs / (1000 * 60 * 60));
  }
} catch { result.last_voice_case_age_h = -1; }

// Pass/fail
result.pass = result.health === "ok" && result.webhook === "ok" && result.numbers > 0;

console.log(JSON.stringify(result));
if (!result.pass) process.exitCode = 1;
