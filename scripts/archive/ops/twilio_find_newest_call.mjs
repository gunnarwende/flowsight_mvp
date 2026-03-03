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
if (!fs.existsSync(envPath)) { console.error("Missing src/web/.env.local"); process.exit(1); }
loadEnvFile(envPath);

const phone = process.env.TWILIO_PHONE_NUMBER;          // +4144...
const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;

if (!phone || !sid || !token) { console.error("Missing TWILIO_* env vars"); process.exit(1); }

const auth = Buffer.from(`${sid}:${token}`).toString("base64");

async function getJson(url) {
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) throw new Error(`Twilio API ${res.status} ${res.statusText}`);
  return await res.json();
}

function pick(c) {
  return {
    sid: c.sid,
    direction: c.direction,
    status: c.status,
    from: c.from,
    to: c.to,
    start_time: c.start_time,
    end_time: c.end_time,
    duration: c.duration,
    error_code: c.error_code ?? null,
  };
}

(async () => {
  const url = new URL(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`);
  url.searchParams.set("PageSize", "50");

  const data = await getJson(url);
  const calls = data.calls || [];

  console.log(`Fetched ${calls.length} calls (most recent first).`);

  const targetCaller = "+41764458942"; // from earlier evidence
  const candidates = calls.filter(c =>
    (c.to || "").includes(phone) ||
    (c.from || "").includes(phone) ||
    (c.from || "").includes(targetCaller) ||
    (c.to || "").includes(targetCaller)
  ).slice(0, 10);

  console.log(`Top candidates (up to 10):`);
  for (const c of candidates) console.log(JSON.stringify(pick(c)));

  // Also print the most recent 10 calls regardless, for manual eyeballing
  console.log(`Most recent 10 calls (raw):`);
  for (const c of calls.slice(0, 10)) console.log(JSON.stringify(pick(c)));
})();
