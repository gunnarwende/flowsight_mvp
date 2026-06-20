#!/usr/bin/env node
/**
 * bigben_check.mjs — READ-ONLY health check for the BigBen Pub voice path.
 *
 * Answers one question: do phone calls to BigBen still turn into
 * reservations/callbacks on Paul's dashboard?
 *
 * It checks three things, all read-only:
 *   1. Reproduces the EXACT v3/list-calls fetch that
 *      app/api/bigben-pub/sync-calls/route.ts sends (array filter_criteria)
 *      and prints the HTTP status — if Retell now rejects that shape the
 *      route returns 502 and syncs nothing (silent voice outage).
 *   2. Lists recent calls to BigBen's number (unfiltered fetch + client-side
 *      filter, the shape that DOES work) with their post-call analysis.
 *   3. Reads pub_reservations (source=voice) + pub_callback_requests so we can
 *      see whether the latest calls actually landed.
 *
 * Usage:  node scripts/_ops/bigben_check.mjs [to_number] [fetchLimit]
 * Env:    RETELL_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
const toNumber = process.argv[2] || "+41445054818"; // BigBen Pub
const fetchLimit = Number(process.argv[3] || 50);   // widen for a deeper sweep
const RETELL = "https://api.retellai.com";
const key = process.env.RETELL_API_KEY;
const SB = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SBKEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) { console.error("FATAL: RETELL_API_KEY not set"); process.exit(1); }

function ts(ms) { return ms ? new Date(ms).toISOString().replace("T", " ").slice(0, 19) : "?"; }

async function main() {
  // ── 1. Reproduce the route's exact fetch (array filter_criteria) ─────────
  console.log("═══════════ 1. route fetch shape (array filter_criteria) ═══════════");
  const repro = await fetch(`${RETELL}/v3/list-calls`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filter_criteria: { to_number: [toNumber] }, limit: 20, sort_order: "descending" }),
  });
  const reproBody = await repro.json().catch(() => null);
  if (repro.ok) {
    console.log(`  ✅ HTTP ${repro.status} — array shape still ACCEPTED (route fetch works)`);
  } else {
    console.log(`  🔴 HTTP ${repro.status} — array shape REJECTED → sync-calls route returns 502 and syncs NOTHING`);
    console.log(`     body: ${JSON.stringify(reproBody)}`);
  }

  // ── 2. Recent calls (unfiltered + client filter — the shape that works) ──
  const r = await fetch(`${RETELL}/v3/list-calls`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ limit: fetchLimit, sort_order: "descending" }),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) { console.error(`list-calls ${r.status}: ${JSON.stringify(data)}`); process.exit(1); }
  const all = data.items ?? data ?? [];
  const bigbenCalls = all.filter((c) => c.to_number === toNumber);
  const calls = bigbenCalls.slice(0, 8);

  console.log(`\n═══════════ 2. recent Retell calls → ${toNumber} (${calls.length}) ═══════════`);
  for (const c of calls) {
    const cad = c.call_analysis?.custom_analysis_data ?? {};
    const dur = c.duration_ms ?? (c.end_timestamp && c.start_timestamp ? c.end_timestamp - c.start_timestamp : null);
    console.log(`\n• ${ts(c.start_timestamp)}  from=${c.from_number ?? "?"}  ${dur ? Math.round(dur/1000)+"s" : "?"}  status=${c.call_status}`);
    console.log(`  call_id: ${c.call_id}`);
    console.log(`  ► call_type=${JSON.stringify(cad.call_type)}  is_reservation=${JSON.stringify(cad.is_reservation)}  callback_requested=${JSON.stringify(cad.callback_requested)}`);
    console.log(`  ► guest_name=${JSON.stringify(cad.guest_name ?? cad.caller_name ?? cad.reporter_name)}  party_size=${JSON.stringify(cad.party_size)}  time=${JSON.stringify(cad.reservation_time)}`);
    // For booking/callback-flagged calls, print the full transcript so a lost
    // reservation can be reconstructed + the guest called back.
    const isActionable = cad.is_reservation === true || cad.callback_requested === true ||
      ["mixed", "reservation", "callback"].includes(cad.call_type);
    if (isActionable) {
      // The list endpoint strips transcript + some analysis fields. Fetch the
      // call detail to recover the full booking (esp. reservation_date) + transcript.
      const dr = await fetch(`${RETELL}/v2/get-call/${c.call_id}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const det = await dr.json().catch(() => null);
      const dcad = det?.call_analysis?.custom_analysis_data ?? {};
      console.log(`  ── full analysis (${c.call_id}) → HTTP ${dr.status} ──`);
      console.log(`    ${JSON.stringify(dcad)}`);
      console.log(`  ── transcript ──`);
      console.log(((det?.transcript ?? c.transcript) ?? "(no transcript)").split("\n").map((l) => "    " + l).join("\n"));
    }
  }

  // ── 3. Did they land? pub_reservations + pub_callback_requests ───────────
  if (SB && SBKEY) {
    const H = { apikey: SBKEY, Authorization: `Bearer ${SBKEY}` };
    console.log(`\n═══════════ 3. Supabase landing (latest 5 each) ═══════════`);
    for (const [tbl, cols] of [
      ["pub_reservations", "created_at,guest_name,guest_phone,reservation_date,reservation_time,party_size,source,status,note"],
      ["pub_callback_requests", "created_at,caller_name,caller_phone,topic,status,call_id"],
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

  // ── 4. Sweep: every reservation/callback call vs DB — landed or LOST? ─────
  if (SB && SBKEY) {
    const H = { apikey: SBKEY, Authorization: `Bearer ${SBKEY}` };
    const today = new Date().toISOString().slice(0, 10);
    const actionable = bigbenCalls.filter((c) => {
      const cad = c.call_analysis?.custom_analysis_data ?? {};
      return cad.is_reservation === true || cad.callback_requested === true ||
        ["mixed", "reservation", "callback"].includes(cad.call_type);
    });
    console.log(`\n═══════════ 4. sweep: ${actionable.length} reservation/callback calls across ${bigbenCalls.length} BigBen calls (window=${fetchLimit}) ═══════════`);
    console.log(`    (today=${today} — a LOST call with a future date is still recoverable)`);
    let lostFuture = 0;
    for (const c of actionable) {
      // pull detail for the real reservation_date
      const dr = await fetch(`${RETELL}/v2/get-call/${c.call_id}`, { headers: { Authorization: `Bearer ${key}` } });
      const det = await dr.json().catch(() => null);
      const cad = det?.call_analysis?.custom_analysis_data ?? c.call_analysis?.custom_analysis_data ?? {};
      // did it land? match by call_id in either table
      const resQ = `${SB}/rest/v1/pub_reservations?note=ilike.*${c.call_id}*&select=id,reservation_date,status`;
      const cbQ = `${SB}/rest/v1/pub_callback_requests?call_id=eq.${c.call_id}&select=id,status`;
      const [resR, cbR] = await Promise.all([fetch(resQ, { headers: H }), fetch(cbQ, { headers: H })]);
      const resRows = await resR.json().catch(() => []);
      const cbRows = await cbR.json().catch(() => []);
      const landed = (Array.isArray(resRows) && resRows.length > 0) || (Array.isArray(cbRows) && cbRows.length > 0);
      const date = cad.reservation_date ?? "?";
      const future = typeof date === "string" && date > today;
      const flag = landed ? "✅ landed" : (future ? "🔴 LOST · FUTURE (recoverable)" : "⚪ lost · past (moot)");
      if (!landed && future) lostFuture++;
      console.log(`\n• ${ts(c.start_timestamp)}  ${c.call_id}  type=${JSON.stringify(cad.call_type)}`);
      console.log(`    guest=${JSON.stringify(cad.guest_name ?? cad.caller_name)} party=${JSON.stringify(cad.party_size)} date=${JSON.stringify(date)} time=${JSON.stringify(cad.reservation_time)}  from=${c.from_number ?? "?"}`);
      console.log(`    → ${flag}`);
    }
    console.log(`\n  VERDICT: ${lostFuture === 0 ? "✅ no LOST future bookings in window" : `🔴 ${lostFuture} LOST future booking(s) — recover these`}`);
  }
  console.log("\n(done — read-only, nothing mutated)");
}
main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
