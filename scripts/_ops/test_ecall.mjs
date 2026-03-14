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

const targetNumber = process.argv[2] || "0041764458942";
console.log("\nSending test SMS to:", targetNumber);

const payload = {
  channel: "sms",
  from: "FlowSight",
  to: targetNumber,
  content: {
    type: "Text",
    text: "eCall Test — FlowSight SMS Integration Check 14.03.2026",
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
