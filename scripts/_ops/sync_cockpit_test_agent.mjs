#!/usr/bin/env node
/**
 * sync_cockpit_test_agent.mjs — der geteilte Cockpit-Test-Agent (OC6, CC-2).
 *
 * Legt EINEN Retell-Agenten an (+ published), gegen den der „Lisa jetzt anrufen"-
 * Beweis-Loop im Cockpit läuft. Der Prompt behält die `{{Platzhalter}}` (NICHT
 * pro Betrieb gefüllt) — die Draft-Config wird pro Web-Call als
 * `retell_llm_dynamic_variables` injiziert (siehe app/api/aufbau/[token]/testcall).
 * So braucht es keinen Per-Session-Agent + kein Publish vor dem Founder-Review.
 *
 * Single-Prompt-LLM-Agent (kein Conversation-Flow): dynamische Variablen füllen
 * darin zuverlässig; für den Test-Eindruck (Lisa grüsst mit Firmenname + nimmt
 * ein Anliegen auf) ist das genau richtig.
 *
 * Idempotent: speichert llm_id/agent_id in retell/cockpit_test_agent.json →
 * Re-Run updated statt zu duplizieren.
 *
 * Usage (Repo-Root):
 *   node --env-file=src/web/.env.local scripts/_ops/sync_cockpit_test_agent.mjs [--dry-run]
 *
 * Danach: die ausgegebene agent_id als RETELL_COCKPIT_TEST_AGENT_ID setzen
 * (Vercel Production + lokal).  Env: RETELL_API_KEY.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const RetellMod = require(require.resolve("retell-sdk", { paths: ["./src/web"] }));
const Retell = RetellMod.default ?? RetellMod.Retell ?? RetellMod;

const dryRun = process.argv.includes("--dry-run");
const apiKey = process.env.RETELL_API_KEY;
if (!apiKey) { console.error("ERROR: RETELL_API_KEY fehlt (--env-file=src/web/.env.local?)"); process.exit(1); }

// Ela (DE) — gleiche Stimme wie die Live-Agents (CLAUDE.md / Memory).
const VOICE_ID = "custom_voice_3d93cf97532572d3980044468a";
const AGENT_NAME = "FlowSight Cockpit Test (DE)";
const PROMPT_PATH = join("retell", "templates", "global_prompt_de.txt");
const IDS_PATH = join("retell", "cockpit_test_agent.json");

if (!existsSync(PROMPT_PATH)) { console.error(`ERROR: Prompt-Template fehlt: ${PROMPT_PATH}`); process.exit(1); }
const generalPrompt = readFileSync(PROMPT_PATH, "utf8");

// Begrüssung = der ECHTE T2-Wortlaut (Founder 07.06.). {{company_name}} dynamisch gefüllt.
const beginMessage =
  "Hallo, hier ist Lisa — die digitale Assistentin der {{company_name}}. Wie kann ich Ihnen helfen?";

const existing = existsSync(IDS_PATH) ? JSON.parse(readFileSync(IDS_PATH, "utf8")) : {};

if (dryRun) {
  console.log("DRY-RUN — würde anlegen/updaten:");
  console.log("  agent_name:", AGENT_NAME, "| voice:", VOICE_ID, "| language: de-DE | model: gpt-4.1-mini");
  console.log("  begin_message:", beginMessage);
  console.log("  general_prompt: aus", PROMPT_PATH, `(${generalPrompt.length} Zeichen, {{Platzhalter}} intakt)`);
  console.log("  bestehende IDs:", JSON.stringify(existing));
  process.exit(0);
}

const client = new Retell({ apiKey });

async function main() {
  // 1) LLM anlegen/updaten (Prompt mit {{Platzhaltern}} intakt)
  let llmId = existing.llm_id;
  const llmPayload = { model: "gpt-4.1", general_prompt: generalPrompt, begin_message: beginMessage };
  if (llmId) {
    await client.llm.update(llmId, llmPayload);
    console.log("✓ LLM aktualisiert:", llmId);
  } else {
    const llm = await client.llm.create(llmPayload);
    llmId = llm.llm_id;
    console.log("✓ LLM angelegt:", llmId);
  }

  // 2) Agent anlegen/updaten
  let agentId = existing.agent_id;
  const agentPayload = {
    response_engine: { type: "retell-llm", llm_id: llmId },
    voice_id: VOICE_ID,
    language: "de-DE",
    agent_name: AGENT_NAME,
  };
  if (agentId) {
    await client.agent.update(agentId, agentPayload);
    console.log("✓ Agent aktualisiert:", agentId);
  } else {
    const agent = await client.agent.create(agentPayload);
    agentId = agent.agent_id;
    console.log("✓ Agent angelegt:", agentId);
  }

  // 3) Publishen — NEUE API (Retell-Deprecation 2026-07-20): NICHT client.agent.publish()
  //    aus retell-sdk@5.2.0 verwenden — das trifft den deprecateten `POST /publish-agent/`.
  //    Stattdessen `/publish-agent-version/{agent_id}` mit konkreter Version (wie
  //    retell_sync.mjs / bigben_publish.mjs). Reiner fetch mit demselben API-Key.
  try {
    const agRes = await fetch(`https://api.retellai.com/get-agent/${agentId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const ag = await agRes.json();
    const version = ag.version ?? ag.agent_version;
    const pubRes = await fetch(`https://api.retellai.com/publish-agent-version/${agentId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ version }),
    });
    if (!pubRes.ok) throw new Error(`publish-agent-version HTTP ${pubRes.status}: ${(await pubRes.text()).slice(0, 200)}`);
    console.log(`✓ Agent published (v${version})`);
  } catch (e) {
    console.log("⚠ publish-Schritt:", e?.message ?? e, "(ggf. bereits published — prüfen)");
  }

  writeFileSync(IDS_PATH, JSON.stringify({ llm_id: llmId, agent_id: agentId }, null, 2) + "\n");
  console.log(`\n✅ Cockpit-Test-Agent bereit.`);
  console.log(`   RETELL_COCKPIT_TEST_AGENT_ID=${agentId}`);
  console.log(`   → in Vercel (Production) + lokal setzen, dann greift „Lisa jetzt anrufen".`);
}

main().catch((e) => { console.error("FEHLER:", e?.message ?? e); process.exit(1); });
