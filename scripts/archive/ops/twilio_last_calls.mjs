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
    // strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const envPath = path.resolve(process.cwd(), "src", "web", ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Missing src/web/.env.local");
  process.exit(1);
}
loadEnvFile(envPath);

const toE164 = process.env.TWILIO_PHONE_NUMBER;
const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;

if (!toE164 || !sid || !token) {
  console.error("Missing TWILIO_* env vars after loading .env.local");
  process.exit(1);
}

const url = new URL(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`);
url.searchParams.set("PageSize", "20");
const auth = Buffer.from(`${sid}:${token}`).toString("base64");

async function run() {
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) {
    console.error(`Twilio API error: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const data = await res.json();

  const calls = (data.calls || [])
    .filter(c => (c.from || "").replace(/\s+/g, "") === toE164 || (c.to || "").replace(/\s+/g, "") === toE164)
    .slice(0, 10);

  console.log(`Found ${calls.length} calls involving TWILIO_PHONE_NUMBER (showing up to 10).`);
  for (const c of calls) {
    console.log(JSON.stringify({
      sid: c.sid,
      direction: c.direction,
      status: c.status,
      from: c.from,
      to: c.to,
      start_time: c.start_time,
      end_time: c.end_time,
      duration: c.duration,
      error_code: c.error_code,
    }));
  }
}

run().catch(err => {
  console.error("Twilio script failed:", err?.message || err);
  process.exit(1);
});
