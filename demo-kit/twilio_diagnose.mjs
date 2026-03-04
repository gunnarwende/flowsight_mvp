#!/usr/bin/env node
/**
 * FlowSight Demo Kit — Twilio SIP Diagnose & Fix
 *
 * Diagnoses "Forbidden" errors on MicroSIP outbound calls and fixes common issues.
 *
 * Usage:
 *   node --env-file=src/web/.env.local demo-kit/twilio_diagnose.mjs
 *   node --env-file=src/web/.env.local demo-kit/twilio_diagnose.mjs --fix
 *   node --env-file=src/web/.env.local demo-kit/twilio_diagnose.mjs --fix --test-call
 *
 * Flags:
 *   --fix        Auto-fix issues (enable CH geo permissions)
 *   --test-call  Trigger a test call to Brunner Lisa after fixes
 *   --verbose    Show full API responses
 */

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const BRUNNER_NUMBER = "+41445054818";

const FIX = process.argv.includes("--fix");
const TEST_CALL = process.argv.includes("--test-call");
const VERBOSE = process.argv.includes("--verbose");

if (!SID || !TOKEN) {
  console.error("ERROR: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required.");
  console.error("Usage: node --env-file=src/web/.env.local demo-kit/twilio_diagnose.mjs");
  process.exit(1);
}

const AUTH = "Basic " + Buffer.from(`${SID}:${TOKEN}`).toString("base64");
const API = `https://api.twilio.com/2010-04-01/Accounts/${SID}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function get(url) {
  const res = await fetch(url, { headers: { Authorization: AUTH } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${url} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: typeof body === "string" ? body : new URLSearchParams(body).toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${url} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function ok(msg) { console.log(`  ✅ ${msg}`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); }
function fail(msg) { console.log(`  ❌ ${msg}`); }
function info(msg) { console.log(`  ℹ️  ${msg}`); }

let issues = 0;
let fixed = 0;

// ---------------------------------------------------------------------------
// Step 1: Account info
// ---------------------------------------------------------------------------
async function checkAccount() {
  console.log("\n[1/6] Twilio Account");
  const acct = await get(`${API}.json`);
  info(`Account: ${acct.friendly_name}`);
  info(`SID: ${SID.slice(0, 6)}...${SID.slice(-4)}`);
  info(`Status: ${acct.status}`);
  info(`Type: ${acct.type}`);

  if (acct.status !== "active") {
    fail(`Account status is "${acct.status}" — must be "active"`);
    issues++;
  } else {
    ok("Account active");
  }

  if (acct.type === "Trial") {
    warn("TRIAL account — outbound calls restricted to verified numbers only!");
    warn("→ Upgrade account OR verify Brunner number as Outgoing Caller ID.");
    issues++;
  }
}

// ---------------------------------------------------------------------------
// Step 2: Geo Permissions for Switzerland
// ---------------------------------------------------------------------------
async function checkGeoPermissions() {
  console.log("\n[2/6] Geographic Permissions (Switzerland)");
  try {
    const ch = await get("https://voice.twilio.com/v1/DialingPermissions/Countries/CH");
    if (VERBOSE) console.log("    ", JSON.stringify(ch, null, 2));

    if (ch.low_risk_numbers_enabled) {
      ok("CH low-risk numbers ENABLED");
    } else {
      fail("CH low-risk numbers DISABLED — this causes 'Forbidden' on outbound calls to +41");
      issues++;

      if (FIX) {
        info("Enabling CH geo permissions...");
        const body = new URLSearchParams();
        body.append("UpdateRequest", JSON.stringify([
          {
            iso_code: "CH",
            low_risk_numbers_enabled: true,
            high_risk_special_numbers_enabled: false,
            high_risk_tollfraud_numbers_enabled: false,
          },
        ]));
        await post("https://voice.twilio.com/v1/DialingPermissions/BulkCountryUpdates", body.toString());

        // Verify
        const verify = await get("https://voice.twilio.com/v1/DialingPermissions/Countries/CH");
        if (verify.low_risk_numbers_enabled) {
          ok("CH geo permissions ENABLED successfully");
          fixed++;
        } else {
          fail("Failed to enable CH permissions — check Twilio Console manually");
        }
      } else {
        info("Run with --fix to auto-enable CH permissions");
      }
    }

    if (ch.high_risk_special_numbers_enabled) {
      info("CH high-risk special numbers also enabled");
    }
  } catch (err) {
    fail(`Geo permissions check failed: ${err.message}`);
    issues++;
  }
}

// ---------------------------------------------------------------------------
// Step 3: SIP Domains
// ---------------------------------------------------------------------------
async function checkSipDomains() {
  console.log("\n[3/6] SIP Domains");

  // Try listing all SIP domains
  const data = await get(`${API}/SIP/Domains.json`);
  let domains = data.sip_domains || data.domains || [];

  // If the list is empty but we know a domain SID from alerts, try fetching directly
  if (domains.length === 0) {
    const knownSids = ["SD56d585ea32228a7e54acc79e3c89b922"]; // from Monitor alerts
    for (const sid of knownSids) {
      try {
        const d = await get(`${API}/SIP/Domains/${sid}.json`);
        if (d && d.sid) {
          info(`Found SIP domain via direct SID lookup: ${sid}`);
          domains.push(d);
        }
      } catch {
        // Domain doesn't exist under this SID
      }
    }
  }

  if (domains.length === 0) {
    fail("No SIP domains found — create one in Twilio Console");
    issues++;
    return null;
  }

  for (const d of domains) {
    console.log(`\n  Domain: ${d.domain_name}`);
    info(`SID: ${d.sid}`);
    info(`Voice URL: ${d.voice_url || "(none)"}`);
    info(`Voice Method: ${d.voice_method || "(none)"}`);
    info(`SIP Registration: ${d.sip_registration}`);
    info(`Auth Type: ${d.auth_type || "(none)"}`);
    info(`Secure: ${d.secure || false}`);

    if (!d.voice_url) {
      fail("No Voice URL — SIP calls have nowhere to go. Set TwiML Bin as Voice URL.");
      issues++;
    } else {
      ok(`Voice URL set: ${d.voice_url}`);
    }

    if (!d.sip_registration) {
      warn("SIP Registration is DISABLED — MicroSIP may not register");
      info("Note: Some setups work without registration (direct dialing).");
      info("If MicroSIP can't register: enable SIP Registration in Twilio Console.");
    } else {
      ok("SIP Registration enabled");
    }
  }

  // Return first domain for credential check
  return domains[0];
}

// ---------------------------------------------------------------------------
// Step 4: Credential Lists
// ---------------------------------------------------------------------------
async function checkCredentials(domain) {
  console.log("\n[4/6] SIP Credential Lists");

  // Check domain-level mappings if we have a domain
  if (domain) {
    console.log(`\n  Checking mappings for domain ${domain.domain_name}:`);

    // Registration Auth
    try {
      const regData = await get(`${API}/SIP/Domains/${domain.sid}/Auth/Registrations/CredentialListMappings.json`);
      const regMappings = regData.contents || [];
      if (regMappings.length > 0) {
        ok(`${regMappings.length} registration auth credential list(s)`);
        for (const m of regMappings) info(`  → ${m.friendly_name || m.sid}`);
      } else {
        warn("No registration auth credential lists mapped");
        info("MicroSIP registration may fail without this.");
      }
    } catch {
      info("Registration auth endpoint not available");
    }

    // Call Auth
    try {
      const callData = await get(`${API}/SIP/Domains/${domain.sid}/Auth/Calls/CredentialListMappings.json`);
      const callMappings = callData.contents || [];
      if (callMappings.length > 0) {
        ok(`${callMappings.length} call auth credential list(s)`);
        for (const m of callMappings) info(`  → ${m.friendly_name || m.sid}`);
      } else {
        warn("No call auth credential lists mapped");
        info("Outbound calls from MicroSIP may fail without this.");
      }
    } catch {
      info("Call auth endpoint not available");
    }

    // Legacy mappings
    try {
      const legacyData = await get(`${API}/SIP/Domains/${domain.sid}/CredentialListMappings.json`);
      const legacyMappings = legacyData.credential_list_mappings || [];
      if (legacyMappings.length > 0) {
        ok(`${legacyMappings.length} legacy credential list mapping(s)`);
        for (const m of legacyMappings) info(`  → ${m.friendly_name || m.sid}`);
      }
    } catch {
      // Legacy endpoint may not exist
    }
  } else {
    warn("No SIP domain available — checking credential lists at account level");
  }

  // List ALL credential lists on account (always useful)
  console.log("\n  All credential lists on account:");
  const allCreds = await get(`${API}/SIP/CredentialLists.json`);
  const lists = allCreds.credential_lists || [];

  if (lists.length === 0) {
    fail("No credential lists on account — MicroSIP has nothing to authenticate against");
    issues++;
    info("Create a credential list: Twilio Console > Voice > SIP > Credential Lists");
    return;
  }

  info(`Total credential lists: ${lists.length}`);

  for (const cl of lists) {
    const credsUrl = `${API}/SIP/CredentialLists/${cl.sid}/Credentials.json`;
    const credsData = await get(credsUrl);
    const creds = credsData.credentials || [];
    console.log(`\n  📋 ${cl.friendly_name} (${cl.sid})`);
    info(`Credentials: ${creds.length}`);
    for (const c of creds) {
      info(`  → Username: "${c.username}"`);
      info(`    (Ensure MicroSIP uses EXACTLY this username)`);
    }
  }

  console.log("\n  ⚠️  ERROR 32202 = 'bad user credentials'");
  console.log("  ─────────────────────────────────────────");
  console.log("  MicroSIP username/password MUST match a credential in the list above.");
  console.log("  Common mistakes:");
  console.log("    1. Username has extra spaces or wrong case");
  console.log("    2. Password was changed in Twilio but not in MicroSIP");
  console.log("    3. Credential list not mapped to SIP domain (check domain auth)");
  console.log("    4. MicroSIP 'Domain' field ≠ SIP domain name");
}

// ---------------------------------------------------------------------------
// Step 5: Recent failed calls
// ---------------------------------------------------------------------------
async function checkCallLogs() {
  console.log("\n[5/6] Recent Call Logs (failed)");

  const callsUrl = `${API}/Calls.json?Status=failed&PageSize=5`;
  const data = await get(callsUrl);
  const calls = data.calls || [];

  if (calls.length === 0) {
    info("No failed calls in recent history");
    return;
  }

  warn(`${calls.length} recent failed call(s):`);

  for (const call of calls.slice(0, 3)) {
    console.log(`\n  Call ${call.sid}`);
    info(`To: ${call.to}`);
    info(`From: ${call.from}`);
    info(`Direction: ${call.direction}`);
    info(`Date: ${call.date_created}`);

    // Get notifications for this call
    try {
      const notifUrl = `${API}/Calls/${call.sid}/Notifications.json`;
      const notifData = await get(notifUrl);
      const notifs = notifData.notifications || [];
      for (const n of notifs) {
        fail(`Error ${n.error_code}: ${n.message_text || n.more_info || "(no message)"}`);
      }
    } catch {
      // Notifications might not be available
    }
  }

  // Also check Monitor Alerts
  console.log("\n  Monitor Alerts (errors):");
  try {
    const today = new Date().toISOString().split("T")[0];
    const alertsUrl = `https://monitor.twilio.com/v1/Alerts?LogLevel=error&PageSize=5&StartDate=${today}`;
    const alertData = await get(alertsUrl);
    const alerts = alertData.alerts || [];

    if (alerts.length === 0) {
      info("No error alerts today");
    } else {
      for (const a of alerts) {
        fail(`Alert ${a.error_code}: ${a.alert_text || "(no text)"}`);
        if (a.resource_sid) info(`  Resource: ${a.resource_sid}`);
      }
    }
  } catch {
    info("Monitor API not accessible (may need additional permissions)");
  }
}

// ---------------------------------------------------------------------------
// Step 6: Test call (optional)
// ---------------------------------------------------------------------------
async function testCall() {
  if (!TEST_CALL) {
    console.log("\n[6/6] Test Call — skipped (use --test-call to enable)");
    return;
  }

  console.log("\n[6/6] Test Call to Brunner Lisa");

  // Get a Twilio phone number to use as caller ID
  const numbersUrl = `${API}/IncomingPhoneNumbers.json?PageSize=5`;
  const numData = await get(numbersUrl);
  const numbers = numData.incoming_phone_numbers || [];

  if (numbers.length === 0) {
    fail("No Twilio phone numbers on account — cannot make test call");
    return;
  }

  const callerNumber = numbers[0].phone_number;
  info(`Using caller ID: ${callerNumber}`);
  info(`Calling: ${BRUNNER_NUMBER}`);

  try {
    const body = new URLSearchParams();
    body.append("To", BRUNNER_NUMBER);
    body.append("From", callerNumber);
    body.append("Url", "http://demo.twilio.com/docs/voice.xml"); // Simple TwiML
    body.append("Timeout", "15");

    const call = await post(`${API}/Calls.json`, body.toString());
    ok(`Call initiated: ${call.sid}`);
    info(`Status: ${call.status}`);
    info("Check Twilio Console > Monitor > Calls for result");
  } catch (err) {
    fail(`Test call failed: ${err.message}`);
    if (err.message.includes("403")) {
      fail("→ Still Forbidden — geo permissions may need more time to propagate");
      info("→ Wait 1-2 minutes and try again, or check Twilio Console manually");
    }
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
async function summary() {
  console.log("\n" + "═".repeat(60));
  console.log("  DIAGNOSE SUMMARY");
  console.log("═".repeat(60));

  if (issues === 0) {
    ok("No issues found — SIP should work");
  } else {
    warn(`${issues} issue(s) found, ${fixed} fixed`);
  }

  if (issues > fixed) {
    console.log("\n  Most likely fix order:");
    console.log("  1. Run with --fix to enable CH geo permissions");
    console.log("  2. Check SIP Registration is enabled on your domain");
    console.log("  3. Verify credential list is mapped to domain");
    console.log("  4. If Trial account: upgrade or verify Brunner number");
    console.log(`\n  Full fix command:`);
    console.log(`  node --env-file=src/web/.env.local demo-kit/twilio_diagnose.mjs --fix --test-call`);
  }

  if (fixed > 0) {
    console.log("\n  Next steps:");
    console.log("  1. Open MicroSIP → it should show 'Registered'");
    console.log("  2. Dial +41445053019 → Lisa should answer (Brunner demo number)");
    console.log("  3. Run Audio Proof: demo-kit/AUDIO_PROOF.md");
  }

  console.log("");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("═".repeat(60));
  console.log("  FlowSight Demo Kit — Twilio SIP Diagnose");
  console.log("═".repeat(60));
  console.log(`  Mode: ${FIX ? "DIAGNOSE + FIX" : "DIAGNOSE ONLY"}`);
  console.log(`  Target: ${BRUNNER_NUMBER} (Brunner Lisa)`);

  await checkAccount();
  await checkGeoPermissions();
  const domain = await checkSipDomains();
  await checkCredentials(domain);
  await checkCallLogs();
  await testCall();
  await summary();
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  process.exit(1);
});
