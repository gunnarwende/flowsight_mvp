/**
 * Quick eCall API test — sends a test SMS to Founder phone.
 * Usage: node --env-file=src/web/.env.local scripts/_ops/test_ecall.mjs
 */

const url = process.env.ECALL_API_URL;
const user = process.env.ECALL_API_USERNAME;
const pass = process.env.ECALL_API_PASSWORD;

console.log("ECALL_API_URL:", url);
console.log("ECALL_API_USERNAME:", user);
console.log("ECALL_API_PASSWORD:", pass ? "***set***" : "MISSING");

if (!url || !user || !pass) {
  console.error("ERROR: Missing env vars");
  process.exit(1);
}

const auth = Buffer.from(`${user}:${pass}`).toString("base64");

const rawTarget = process.argv[2] || "+41764458942";
const senderArg = process.argv[3] || undefined; // optional: --from <sender>
const fromIdx = process.argv.indexOf("--from");
const senderOverride = fromIdx >= 0 ? process.argv[fromIdx + 1] : undefined;

// Convert E.164 to eCall format (0041...)
function toEcall(num) { return num.startsWith("+") ? "00" + num.slice(1) : num; }

const targetNumber = toEcall(rawTarget);
const fallbackNumber = process.env.ECALL_SENDER_NUMBER;
const sender = senderOverride || fallbackNumber || "FlowSight";

console.log("\nSending test SMS to:", targetNumber, "(raw:", rawTarget, ")");
console.log("Sender:", sender);
if (fallbackNumber) console.log("ECALL_SENDER_NUMBER:", fallbackNumber);

const payload = {
  channel: "sms",
  from: sender,
  to: targetNumber,
  content: {
    type: "Text",
    text: `eCall Test — FlowSight SMS via sender "${sender}" — ${new Date().toISOString()}`,
  },
};

console.log("Request:", JSON.stringify(payload, null, 2));

try {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("\nResponse Status:", res.status, res.statusText);
  const text = await res.text();
  console.log("Response Body:", text);

  if (!res.ok) {
    console.error("\nFAILED — check credentials and API URL");
  } else {
    console.log("\nSUCCESS — SMS sent via eCall");
  }
} catch (e) {
  console.error("Fetch error:", e.message);
}
