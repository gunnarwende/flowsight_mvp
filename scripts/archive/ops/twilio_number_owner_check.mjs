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

const phone = process.env.TWILIO_PHONE_NUMBER;
const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;

if (!phone || !sid || !token) { console.error("Missing TWILIO_* env vars"); process.exit(1); }

const auth = Buffer.from(`${sid}:${token}`).toString("base64");

async function getJson(url) {
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, statusText: res.statusText, json };
}

function redact(e164) {
  if (!e164) return "***";
  if (e164.length < 6) return "***";
  return e164.slice(0, 5) + "***" + e164.slice(-2);
}

(async () => {
  const url = new URL(`https://api.twilio.com/2010-04-01/Accounts/${sid}/IncomingPhoneNumbers.json`);
  url.searchParams.set("PhoneNumber", phone);

  const r = await getJson(url);
  console.log(`IncomingPhoneNumbers lookup status: ${r.status} ${r.statusText}`);

  const list = r.json?.incoming_phone_numbers || [];
  console.log(`Matches for TWILIO_PHONE_NUMBER: ${list.length}`);

  if (list.length > 0) {
    console.log(JSON.stringify({ phone_redacted: redact(phone), incoming_phone_number_sid: list[0].sid }));
  } else {
    console.log("No match found. Likely: credentials belong to different (sub)account than the number owner.");
  }
})();
