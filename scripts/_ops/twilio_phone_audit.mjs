#!/usr/bin/env node
/**
 * Twilio Phone Number Audit — check Voice URL config for all numbers.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/twilio_phone_audit.mjs
 */

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;

if (!SID || !TOKEN) {
  console.error("FATAL: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required.");
  process.exit(1);
}

const AUTH = "Basic " + Buffer.from(`${SID}:${TOKEN}`).toString("base64");
const API = `https://api.twilio.com/2010-04-01/Accounts/${SID}`;

async function get(url) {
  const res = await fetch(url, { headers: { Authorization: AUTH } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}

try {
  const data = await get(`${API}/IncomingPhoneNumbers.json?PageSize=50`);
  const numbers = data.incoming_phone_numbers || [];

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║           Twilio Phone Number Audit                      ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  for (const n of numbers) {
    console.log(`  ── ${n.phone_number} (${n.friendly_name}) ──`);
    console.log(`     SID:           ${n.sid}`);
    console.log(`     Voice URL:     ${n.voice_url || "(none)"}`);
    console.log(`     Voice Method:  ${n.voice_method || "(none)"}`);
    console.log(`     Voice App SID: ${n.voice_application_sid || "(none)"}`);
    console.log(`     SMS URL:       ${n.sms_url || "(none)"}`);
    console.log(`     Status CB:     ${n.status_callback || "(none)"}`);
    console.log(`     Trunk SID:     ${n.trunk_sid || "(none)"}`);
    console.log("");
  }

  // Also check SIP domains
  console.log("━━━ SIP Domains ━━━\n");
  const sipData = await get(`${API}/SIP/Domains.json`);
  for (const d of sipData.sip_domains || []) {
    console.log(`  ── ${d.domain_name} ──`);
    console.log(`     SID:        ${d.sid}`);
    console.log(`     Voice URL:  ${d.voice_url || "(none)"}`);
    console.log(`     Voice Method: ${d.voice_method || "(none)"}`);
    console.log("");
  }

} catch (err) {
  console.error(`\nFATAL: ${err.message}\n`);
  process.exit(1);
}
