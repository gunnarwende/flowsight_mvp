import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
  const txt = fs.readFileSync(filePath, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}

const envPath = path.resolve(process.cwd(), "src", "web", ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Missing src/web/.env.local");
  process.exit(1);
}
loadEnvFile(envPath);

const phone = process.env.TWILIO_PHONE_NUMBER;
const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;

if (!phone || !sid || !token) {
  console.error("Missing TWILIO_* env vars after loading .env.local");
  process.exit(1);
}

const auth = Buffer.from(`${sid}:${token}`).toString("base64");

async function twilioGet(url) {
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) throw new Error(`Twilio API ${res.status} ${res.statusText}`);
  return await res.json();
}

function redactE164(e164) {
  if (!e164) return e164;
  if (e164.length < 6) return "***";
  return e164.slice(0, 5) + "***" + e164.slice(-2);
}

async function run() {
  console.log("=== Twilio Debug Evidence ===");
  console.log(`Phone: ${redactE164(phone)} (redacted)`);

  // Query inbound calls TO this number (most relevant for PSTN inbound)
  const callsUrl = new URL(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`);
  callsUrl.searchParams.set("To", phone);
  callsUrl.searchParams.set("PageSize", "100");

  console.log("Fetching last 100 calls with To=TWILIO_PHONE_NUMBER ...");
  const callsData = await twilioGet(callsUrl);

  const calls = (callsData.calls || []).slice(0, 10);
  console.log(`\nFound ${calls.length} call(s) (showing up to 10):\n`);
  console.log("SID | Direction | Status | Start | End | Duration(s) | ErrorCode");
  console.log("-".repeat(100));
  for (const c of calls) {
    console.log(`${c.sid} | ${c.direction} | ${c.status} | ${c.start_time} | ${c.end_time} | ${c.duration} | ${c.error_code || "—"}`);
  }

  // Pull recent Notifications (last 50) and correlate by CallSid
  console.log("\n=== Notifications / Debugger (last 50) ===\n");
  const notifUrl = new URL(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Notifications.json`);
  notifUrl.searchParams.set("PageSize", "50");
  const notifData = await twilioGet(notifUrl);

  const byCall = new Map();
  for (const n of (notifData.notifications || [])) {
    const callSid = n?.message_text?.match(/CallSid:\s*(CA[a-zA-Z0-9]+)/)?.[1] || n?.call_sid;
    if (!callSid) continue;
    if (!byCall.has(callSid)) byCall.set(callSid, []);
    byCall.get(callSid).push(n);
  }

  for (const c of calls) {
    const list = byCall.get(c.sid) || [];
    for (const n of list) {
      const msg = (n.message_text || "").replace(/\s+/g, " ").slice(0, 160);
      console.log(`CallSid: ${c.sid} | NotifSid: ${n.sid} | ErrorCode: ${n.error_code || "—"} | Level: ${n.log_level} | Date: ${n.date_created} | Message: ${msg}`);
    }
  }

  console.log("\n=== Done ===");
}

run().catch(err => {
  console.error(err?.message || err);
  process.exit(1);
});
