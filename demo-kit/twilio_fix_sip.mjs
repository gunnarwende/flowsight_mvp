#!/usr/bin/env node
/**
 * FlowSight Demo Kit — Fix SIP Auth (one-shot)
 *
 * Creates a clean credential, maps it to BOTH Registration Auth
 * and Call Auth on the SIP domain. Outputs credentials for MicroSIP.
 *
 * Usage:
 *   node --env-file=src/web/.env.local demo-kit/twilio_fix_sip.mjs
 */

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const DOMAIN_SID = "SD56d585ea32228a7e54acc79e3c89b922"; // flowsight-demo.sip.twilio.com

if (!SID || !TOKEN) {
  console.error("ERROR: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required.");
  process.exit(1);
}

const AUTH = "Basic " + Buffer.from(`${SID}:${TOKEN}`).toString("base64");
const API = `https://api.twilio.com/2010-04-01/Accounts/${SID}`;

async function post(url, params) {
  const body = new URLSearchParams(params);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${url} → ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function get(url) {
  const res = await fetch(url, { headers: { Authorization: AUTH } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}

// Generate a random password
function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  for (const b of bytes) pw += chars[b % chars.length];
  return pw;
}

async function main() {
  console.log("═".repeat(60));
  console.log("  FlowSight — Fix SIP Authentication");
  console.log("═".repeat(60));

  // Step 1: Verify domain exists
  console.log("\n[1/5] Verifying SIP domain...");
  const domain = await get(`${API}/SIP/Domains/${DOMAIN_SID}.json`);
  console.log(`  ✅ Domain: ${domain.domain_name}`);

  // Step 2: Create credential list
  console.log("\n[2/5] Creating credential list 'flowsight-demo-ready'...");
  let clSid;
  try {
    const cl = await post(`${API}/SIP/CredentialLists.json`, {
      FriendlyName: "flowsight-demo-ready",
    });
    clSid = cl.sid;
    console.log(`  ✅ Created: ${cl.sid}`);
  } catch (err) {
    // May already exist, try to find it
    const lists = await get(`${API}/SIP/CredentialLists.json`);
    const existing = (lists.credential_lists || []).find(
      (l) => l.friendly_name === "flowsight-demo-ready"
    );
    if (existing) {
      clSid = existing.sid;
      console.log(`  ℹ️  Already exists: ${clSid}`);
    } else {
      throw err;
    }
  }

  // Step 3: Add credential (username + password)
  console.log("\n[3/5] Creating credential...");
  const USERNAME = "flowsight-demo";
  const PASSWORD = generatePassword();

  try {
    // Delete existing credentials in this list first
    const existingCreds = await get(
      `${API}/SIP/CredentialLists/${clSid}/Credentials.json`
    );
    for (const c of existingCreds.credentials || []) {
      const delUrl = `${API}/SIP/CredentialLists/${clSid}/Credentials/${c.sid}.json`;
      await fetch(delUrl, { method: "DELETE", headers: { Authorization: AUTH } });
      console.log(`  ℹ️  Deleted old credential: ${c.username}`);
    }
  } catch {
    // No existing credentials, fine
  }

  const cred = await post(`${API}/SIP/CredentialLists/${clSid}/Credentials.json`, {
    Username: USERNAME,
    Password: PASSWORD,
  });
  console.log(`  ✅ Credential created: username="${USERNAME}"`);

  // Step 4: Map to Registration Auth
  console.log("\n[4/5] Mapping to Registration Auth...");
  try {
    await post(
      `${API}/SIP/Domains/${DOMAIN_SID}/Auth/Registrations/CredentialListMappings.json`,
      { CredentialListSid: clSid }
    );
    console.log("  ✅ Mapped to Registration Auth");
  } catch (err) {
    if (err.message.includes("already mapped") || err.message.includes("409") || err.message.includes("20409")) {
      console.log("  ℹ️  Already mapped to Registration Auth");
    } else {
      console.log(`  ⚠️  ${err.message}`);
    }
  }

  // Step 5: Map to Call Auth
  console.log("\n[5/5] Mapping to Call Auth...");
  try {
    await post(
      `${API}/SIP/Domains/${DOMAIN_SID}/Auth/Calls/CredentialListMappings.json`,
      { CredentialListSid: clSid }
    );
    console.log("  ✅ Mapped to Call Auth");
  } catch (err) {
    if (err.message.includes("already mapped") || err.message.includes("409") || err.message.includes("20409")) {
      console.log("  ℹ️  Already mapped to Call Auth");
    } else {
      console.log(`  ⚠️  ${err.message}`);
    }
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("  ✅ SIP AUTH FIX COMPLETE");
  console.log("═".repeat(60));
  console.log("");
  console.log("  MicroSIP Konfiguration:");
  console.log("  ─────────────────────────────────────────");
  console.log(`  SIP Server:  flowsight-demo.sip.twilio.com`);
  console.log(`  Username:    ${USERNAME}`);
  console.log(`  Password:    ${PASSWORD}`);
  console.log(`  Domain:      flowsight-demo.sip.twilio.com`);
  console.log("  ─────────────────────────────────────────");
  console.log("");
  console.log("  Nächste Schritte:");
  console.log("  1. MicroSIP öffnen > Menu > Account bearbeiten");
  console.log("  2. Oben stehende Credentials eintragen");
  console.log("  3. Speichern → Status sollte 'Online/Registered' zeigen");
  console.log("  4. Dial +41445053019 → Lisa sollte antworten (Brunner Demo-Nummer)");
  console.log("");
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  process.exit(1);
});
