#!/usr/bin/env node
/**
 * Twilio Debug Evidence — fetch recent calls + notifications for CH number.
 * Run: node scripts/_ops/twilio_debug_evidence.mjs
 *
 * Outputs ONLY: call_sid, direction, status, start/end, duration, error_code,
 * notification metadata. NO auth tokens, NO full payloads.
 */

import { readFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Parse .env.local (no dotenv dependency)
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = join(process.cwd(), "src", "web", ".env.local");
  const env = {};
  try {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const l = line.trim();
      if (!l || l.startsWith("#")) continue;
      const m = l.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      )
        v = v.slice(1, -1);
      env[m[1]] = v;
    }
  } catch (e) {
    console.error("Cannot read src/web/.env.local:", e.message);
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const SID = env.TWILIO_ACCOUNT_SID;
const TOKEN = env.TWILIO_AUTH_TOKEN;
const PHONE = env.TWILIO_PHONE_NUMBER;

if (!SID || !TOKEN || !PHONE) {
  console.error(
    "Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER in .env.local"
  );
  process.exit(1);
}

const BASE = `https://api.twilio.com/2010-04-01/Accounts/${SID}`;
const AUTH = "Basic " + Buffer.from(`${SID}:${TOKEN}`).toString("base64");

async function twilioGet(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: AUTH },
  });
  if (!res.ok) {
    console.error(`Twilio API ${res.status} for ${path}`);
    return null;
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Fetch calls
// ---------------------------------------------------------------------------
console.log(`\n=== Twilio Debug Evidence ===`);
console.log(`Phone: ${PHONE.slice(0, 6)}***${PHONE.slice(-2)} (redacted)`);
console.log(`Fetching last 20 calls...\n`);

const callsData = await twilioGet(
  `/Calls.json?PageSize=20&To=${encodeURIComponent(PHONE)}`
);
const callsFrom = await twilioGet(
  `/Calls.json?PageSize=20&From=${encodeURIComponent(PHONE)}`
);

const allCalls = [
  ...(callsData?.calls || []),
  ...(callsFrom?.calls || []),
];

// Dedupe by SID
const seen = new Set();
const calls = allCalls.filter((c) => {
  if (seen.has(c.sid)) return false;
  seen.add(c.sid);
  return true;
});

if (calls.length === 0) {
  console.log("No calls found involving this number.");
  process.exit(0);
}

console.log(`Found ${calls.length} call(s):\n`);
console.log(
  "SID | Direction | Status | Start | End | Duration(s) | ErrorCode"
);
console.log("-".repeat(100));

for (const c of calls) {
  console.log(
    [
      c.sid,
      c.direction || "—",
      c.status || "—",
      c.start_time || "—",
      c.end_time || "—",
      c.duration ?? "—",
      c.error_code ?? "—",
    ].join(" | ")
  );
}

// ---------------------------------------------------------------------------
// Fetch notifications for each call
// ---------------------------------------------------------------------------
console.log(`\n=== Notifications / Debugger ===\n`);

let foundNotifications = false;
for (const c of calls) {
  const nData = await twilioGet(
    `/Calls/${c.sid}/Notifications.json?PageSize=10`
  );
  const notifications = nData?.notifications || [];
  if (notifications.length === 0) continue;

  foundNotifications = true;
  for (const n of notifications) {
    const msg = (n.message_text || "").slice(0, 160);
    console.log(
      [
        `CallSid: ${c.sid}`,
        `NotifSid: ${n.sid}`,
        `ErrorCode: ${n.error_code ?? "—"}`,
        `Level: ${n.log ?? "—"}`,
        `Date: ${n.date_created ?? "—"}`,
        `Message: ${msg}`,
      ].join(" | ")
    );
  }
}

if (!foundNotifications) {
  console.log("No notifications found for any call.");
}

console.log("\n=== Done ===");
