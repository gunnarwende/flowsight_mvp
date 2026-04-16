#!/usr/bin/env node
/**
 * Clean rebuild of BigBen Pub voice agents.
 * R1-compliant: is_transfer_cf=true, webhook_url in create-agent (not patched).
 */
import { readFileSync, writeFileSync } from "node:fs";

const API = "https://api.retellai.com";
const KEY = process.env.RETELL_API_KEY;
if (!KEY) { console.error("RETELL_API_KEY missing"); process.exit(1); }
const H = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const post = async (p, b) => { const r = await fetch(API+p, {method:"POST",headers:H,body:JSON.stringify(b)}); const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(`${p} ${r.status}: ${JSON.stringify(d)}`); return d; };
const patch = async (p, b) => { const r = await fetch(API+p, {method:"PATCH",headers:H,body:JSON.stringify(b)}); const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(`${p} ${r.status}: ${JSON.stringify(d)}`); return d; };
const del = async (p) => { await fetch(API+p, {method:"DELETE",headers:H}); };
const get = async (p) => { const r = await fetch(API+p, {headers:H}); return r.json(); };

const instr = (text) => ({ type: "prompt", text });

async function main() {
  // 1. Load EN prompt from file
  const enConfig = JSON.parse(readFileSync("retell/exports/bigben-pub_agent.json", "utf8"));
  const enPrompt = enConfig.general_prompt;

  // Build DE prompt
  const dePrompt = enPrompt
    .replace("You answer calls in English by default.", "Du beantwortest Anrufe auf Deutsch.")
    .replace("Your name is Lisa. You are the voice of Big Ben Pub.", "Dein Name ist Lisa. Du bist die Stimme des Big Ben Pub.")
    .replace("You are friendly, casual, warm", "Du bist freundlich, locker, warm")
    .replace("NEVER sound robotic or scripted.", "NIEMALS robotisch klingen.")
    .replace(/If someone speaks German:.*$/m, "Wenn Anrufer Englisch spricht: Sage 'Natuerlich, einen Moment bitte' und nutze swap_to_en_agent.");

  // 2. Get Doerfler webhook config as reference
  const doerfler = await get("/get-agent/agent_4cb307354a2a29d195f656b542");
  const webhookUrl = doerfler.webhook_url;
  const pca = doerfler.post_call_analysis_data;
  console.log("Webhook:", webhookUrl, "| PCA fields:", pca?.length);

  // 3. Delete old
  const old = JSON.parse(readFileSync("retell/agent_ids.json", "utf8"))["bigben-pub"] || {};
  if (old.en_agent_id) await del("/delete-agent/" + old.en_agent_id).catch(() => {});
  if (old.de_agent_id) await del("/delete-agent/" + old.de_agent_id).catch(() => {});
  if (old.en_flow_id) await del("/delete-conversation-flow/" + old.en_flow_id).catch(() => {});
  if (old.de_flow_id) await del("/delete-conversation-flow/" + old.de_flow_id).catch(() => {});
  console.log("Old cleaned up");

  // 4. Create EN flow
  const enFlow = await post("/create-conversation-flow", {
    global_prompt: enPrompt,
    nodes: [{ id: "start-node", type: "conversation",
      instruction: instr("If new call: Say 'Hi, Lisa here from Big Ben Pub, how can I help you?' If transferred back from German agent: Say 'Sure thing, continuing in English!'"),
      tools: [{ type: "end_call", name: "end_call", description: "End call" }],
    }],
    start_node_id: "start-node", start_speaker: "agent",
    model_choice: { type: "cascading", model: "gpt-4.1" },
    is_transfer_cf: true,
  });
  console.log("EN flow:", enFlow.conversation_flow_id);

  // 5. Create DE flow
  const deFlow = await post("/create-conversation-flow", {
    global_prompt: dePrompt,
    nodes: [{ id: "start-node", type: "conversation",
      instruction: instr("Sage: 'Hallo, hier ist Lisa vom Big Ben Pub, wie kann ich Ihnen helfen?' Bei Ruecktransfer: 'Alles klar, weiter auf Deutsch!'"),
      tools: [{ type: "end_call", name: "end_call", description: "Auflegen" }],
    }],
    start_node_id: "start-node", start_speaker: "agent",
    model_choice: { type: "cascading", model: "gpt-4.1" },
    is_transfer_cf: true,
  });
  console.log("DE flow:", deFlow.conversation_flow_id);

  // 6. Create EN agent (webhook_url IN create, not patched!)
  const enAgent = await post("/create-agent", {
    agent_name: "BigBen Pub EN",
    voice_id: "custom_voice_cf152ba48ccbac0370ecebcd88",
    language: "en-GB",
    response_engine: { type: "conversation-flow", conversation_flow_id: enFlow.conversation_flow_id },
    ambient_sound: "coffee-shop", ambient_sound_volume: 0.3,
    responsiveness: 0.8, interruption_sensitivity: 0.7, enable_backchannel: true,
    end_call_after_silence_ms: 15000, max_call_duration_ms: 300000,
    webhook_url: webhookUrl,
    post_call_analysis_data: pca,
    boosted_keywords: ["Big Ben", "Pub", "reservation", "book", "table", "quiz", "karaoke"],
  });
  console.log("EN agent:", enAgent.agent_id, "| webhook:", enAgent.webhook_url);

  // 7. Create DE agent
  const deAgent = await post("/create-agent", {
    agent_name: "BigBen Pub DE",
    voice_id: "custom_voice_3d93cf97532572d3980044468a",
    language: "de-DE",
    response_engine: { type: "conversation-flow", conversation_flow_id: deFlow.conversation_flow_id },
    ambient_sound: "coffee-shop", ambient_sound_volume: 0.3,
    responsiveness: 0.8, interruption_sensitivity: 0.7, enable_backchannel: true,
    end_call_after_silence_ms: 15000, max_call_duration_ms: 300000,
    webhook_url: webhookUrl,
    post_call_analysis_data: pca,
    boosted_keywords: ["Big Ben", "Pub", "Reservierung", "Tisch", "Quiz", "Karaoke"],
  });
  console.log("DE agent:", deAgent.agent_id, "| webhook:", deAgent.webhook_url);

  // 8. Cross-link swap tools (AFTER agents exist)
  await patch("/update-conversation-flow/" + enFlow.conversation_flow_id, { nodes: [{
    id: "start-node", type: "conversation",
    instruction: instr("If new call: Say 'Hi, Lisa here from Big Ben Pub, how can I help you?' If returned from DE agent: 'Sure, continuing in English!'"),
    tools: [
      { type: "end_call", name: "end_call", description: "End call" },
      { type: "agent_swap", name: "swap_to_de_agent",
        description: "Transfer to German agent. IMMEDIATELY when caller speaks German. Say 'Of course, one moment please' first.",
        agent_id: deAgent.agent_id, post_call_analysis_setting: "only_destination_agent", speak_after_execution: true },
    ],
  }]});
  console.log("EN->DE swap linked");

  await patch("/update-conversation-flow/" + deFlow.conversation_flow_id, { nodes: [{
    id: "start-node", type: "conversation",
    instruction: instr("Sage: 'Hallo, hier ist Lisa vom Big Ben Pub, wie kann ich Ihnen helfen?' Bei Ruecktransfer: 'Alles klar, weiter auf Deutsch!'"),
    tools: [
      { type: "end_call", name: "end_call", description: "Auflegen" },
      { type: "agent_swap", name: "swap_to_en_agent",
        description: "An englischen Agenten weiterleiten. SOFORT wenn Anrufer Englisch spricht. Sage zuerst: Natuerlich, einen Moment bitte.",
        agent_id: enAgent.agent_id, post_call_analysis_setting: "only_destination_agent", speak_after_execution: true },
    ],
  }]});
  console.log("DE->EN swap linked");

  // 9. Publish ONCE (version = 1, no patches after!)
  await post("/publish-agent/" + enAgent.agent_id, {});
  await post("/publish-agent/" + deAgent.agent_id, {});
  console.log("Published (once, no patches)");

  // 10. Phone
  await patch("/update-phone-number/+41445054818", { inbound_agent_id: enAgent.agent_id });

  // Verify all numbers
  const nums = await get("/list-phone-numbers");
  for (const n of nums) console.log(n.phone_number, "->", n.inbound_agent_id || "UNASSIGNED!");

  // Save
  const allIds = JSON.parse(readFileSync("retell/agent_ids.json", "utf8"));
  allIds["bigben-pub"] = {
    en_agent_id: enAgent.agent_id, en_flow_id: enFlow.conversation_flow_id,
    de_agent_id: deAgent.agent_id, de_flow_id: deFlow.conversation_flow_id,
    last_synced: new Date().toISOString(),
  };
  writeFileSync("retell/agent_ids.json", JSON.stringify(allIds, null, 2));

  console.log("\n=== DONE ===");
  console.log("EN:", enAgent.agent_id, "DE:", deAgent.agent_id);
  console.log("Phone: +41445054818 ->", enAgent.agent_id);
  console.log("Webhook:", webhookUrl);
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
