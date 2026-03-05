#!/usr/bin/env node
/**
 * Retell Phone Number Audit & Fix
 *
 * Lists all phone numbers + agents in Retell, shows current assignments,
 * and can reassign a phone number to a different agent.
 *
 * Usage:
 *   # Audit only (show current state):
 *   node --env-file=src/web/.env.local scripts/_ops/retell_phone_audit.mjs
 *
 *   # Fix: reassign a phone number to an agent:
 *   node --env-file=src/web/.env.local scripts/_ops/retell_phone_audit.mjs \
 *     --fix <phone_number_id> --agent <agent_id>
 */

const RETELL_BASE = "https://api.retellai.com";

const apiKey = process.env.RETELL_API_KEY;
if (!apiKey) {
  console.error("FATAL: RETELL_API_KEY not set.");
  console.error("Run with: node --env-file=src/web/.env.local scripts/_ops/retell_phone_audit.mjs");
  process.exit(1);
}

const hdrs = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};

async function retellGet(path) {
  const res = await fetch(`${RETELL_BASE}${path}`, { headers: hdrs });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function retellPatch(path, body) {
  const res = await fetch(`${RETELL_BASE}${path}`, {
    method: "PATCH",
    headers: hdrs,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// ── CLI args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : null;
}
const fixNumberId = getArg("--fix");
const fixAgentId = getArg("--agent");

try {
  // ── Fetch all data ──────────────────────────────────────────────────
  const [phones, agents] = await Promise.all([
    retellGet("/list-phone-numbers"),
    retellGet("/list-agents"),
  ]);

  // Build agent lookup
  const agentMap = {};
  for (const a of agents) {
    agentMap[a.agent_id] = a.agent_name;
  }

  // ── Display current state ───────────────────────────────────────────
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║           Retell Phone Number Audit                      ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("━━━ Phone Numbers ━━━\n");
  console.log("  ID                          | Number              | Agent Assigned");
  console.log("  ----------------------------|---------------------|----------------------------------");
  for (const p of phones) {
    const agentName = p.inbound_agent_id ? (agentMap[p.inbound_agent_id] || "UNKNOWN") : "(none)";
    const num = p.phone_number || p.phone_number_pretty || "?";
    console.log(`  ${(p.phone_number_id || "").padEnd(28)} | ${num.padEnd(19)} | ${agentName} [${p.inbound_agent_id || "none"}]`);
  }

  console.log("\n━━━ All Agents ━━━\n");
  for (const a of agents) {
    console.log(`  ${a.agent_id}  ${a.agent_name}`);
  }

  // ── Fix mode ────────────────────────────────────────────────────────
  if (fixNumberId && fixAgentId) {
    const targetPhone = phones.find(p => p.phone_number_id === fixNumberId || p.phone_number === fixNumberId);
    if (!targetPhone) {
      console.error(`\nERROR: Phone number '${fixNumberId}' not found. Use an ID or E.164 number from the list above.`);
      process.exit(1);
    }

    const agentName = agentMap[fixAgentId] || "UNKNOWN";
    const phoneId = targetPhone.phone_number_id;

    console.log(`\n━━━ Reassigning ━━━\n`);
    console.log(`  Phone: ${targetPhone.phone_number} (${phoneId})`);
    console.log(`  From:  ${agentMap[targetPhone.inbound_agent_id] || "none"} [${targetPhone.inbound_agent_id || "none"}]`);
    console.log(`  To:    ${agentName} [${fixAgentId}]`);

    await retellPatch(`/update-phone-number/${phoneId}`, {
      inbound_agent_id: fixAgentId,
    });

    console.log(`\n  ✓ DONE — ${targetPhone.phone_number} now routes to ${agentName}\n`);
  } else if (fixNumberId || fixAgentId) {
    console.error("\nERROR: Both --fix <phone_id> and --agent <agent_id> are required.");
    process.exit(1);
  } else {
    console.log("\n  To reassign: --fix <phone_number_id> --agent <agent_id>\n");
  }

} catch (err) {
  console.error(`\nFATAL: ${err.message}\n`);
  process.exit(1);
}
