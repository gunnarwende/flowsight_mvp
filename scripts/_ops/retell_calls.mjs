#!/usr/bin/env node
/**
 * retell_calls.mjs — READ-ONLY call inspector.
 *
 * Lists recent Retell calls to a given number and prints the post-call
 * analysis (call_type, category, urgency, description) + transcript, then
 * checks Supabase to see whether the latest call landed in the right basket:
 * tenant_callbacks (NACHRICHT) vs cases (FALL).
 *
 * Usage:  node scripts/_ops/retell_calls.mjs [to_number] [limit]
 * Env:    RETELL_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
const toNumber = process.argv[2] || "+41445057420"; // Doerfler DE
const limit = Number(process.argv[3] || 3);

const RETELL = "https://api.retellai.com";
const key = process.env.RETELL_API_KEY;
const SB = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SBKEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) { console.error("FATAL: RETELL_API_KEY not set"); process.exit(1); }

function ts(ms) { return ms ? new Date(ms).toISOString().replace("T", " ").slice(0, 19) : "?"; }

async function main() {
  // ── Retell: recent calls (no server filter — v3 filter format is brittle;
  //    fetch recent and filter by to_number client-side) ───────────────────
  const r = await fetch(`${RETELL}/v3/list-calls`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 50, sort_order: "descending" }),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) { console.error(`list-calls ${r.status}: ${JSON.stringify(data)}`); process.exit(1); }
  const all = data.items ?? data ?? [];
  const calls = all.filter((c) => c.to_number === toNumber).slice(0, limit);

  console.log(`═══════════ Retell calls → ${toNumber} (${calls.length}) ═══════════`);
  for (const c of calls) {
    const cad = c.call_analysis?.custom_analysis_data ?? {};
    const dur = c.duration_ms ?? (c.end_timestamp && c.start_timestamp ? c.end_timestamp - c.start_timestamp : null);
    console.log(`\n• ${ts(c.start_timestamp)}  from=${c.from_number ?? "?"}  ${dur ? Math.round(dur/1000)+"s" : "?"}  status=${c.call_status}  disconnect=${c.disconnection_reason ?? "?"}`);
    console.log(`  call_id: ${c.call_id}`);
    console.log(`  ► call_type=${JSON.stringify(cad.call_type)}  urgency=${JSON.stringify(cad.urgency)}  category=${JSON.stringify(cad.category)}`);
    console.log(`  description: ${JSON.stringify(cad.description ?? "")}`);
  }

  // full transcript of the latest call — the list endpoint strips it, so fetch
  // the call detail (get-call) which carries transcript + full analysis.
  if (calls[0]) {
    console.log(`\n─────────── transcript (latest call) ───────────`);
    let transcript = calls[0].transcript;
    if (!transcript) {
      const dr = await fetch(`${RETELL}/v2/get-call/${calls[0].call_id}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const det = await dr.json().catch(() => null);
      transcript = det?.transcript;
    }
    console.log(transcript ?? "(no transcript)");
  }

  // ── Supabase: where did it land? ────────────────────────────────────────
  if (SB && SBKEY) {
    const H = { apikey: SBKEY, Authorization: `Bearer ${SBKEY}` };
    console.log(`\n═══════════ Supabase landing (latest 5 each) ═══════════`);
    for (const [tbl, cols] of [
      ["tenant_callbacks", "created_at,reason,caller_name,caller_phone,topic,status,call_id"],
      ["cases", "created_at,category,urgency,source,reporter_name,description"],
    ]) {
      const q = `${SB}/rest/v1/${tbl}?order=created_at.desc&limit=5&select=${cols}`;
      const sr = await fetch(q, { headers: H });
      const rows = await sr.json().catch(() => null);
      console.log(`\n── ${tbl} → HTTP ${sr.status} ──`);
      if (Array.isArray(rows)) rows.forEach((row) => console.log("  " + JSON.stringify(row)));
      else console.log("  " + JSON.stringify(rows));
    }
  } else {
    console.log("\n(Supabase env not set — skipped landing check)");
  }
  console.log("\n(done — read-only, nothing mutated)");
}
main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
