// scripts/gen_retell_agents.mjs — Generate Retell agent JSON files
// Usage: node scripts/gen_retell_agents.mjs
// Output: retell/agent_template.json + retell/exports/doerfler_agent.json

import { writeFileSync, readFileSync } from "fs";

const globalPrompt = [
  "Du bist der virtuelle Assistent von {{business_name}} für Sanitär- und Heizungsanliegen. Du nimmst telefonische Schadensmeldungen effizient auf und stellst sicher, dass am Ende alle Pflichtinformationen vorliegen.",
  "",
  "REGELN",
  "- Maximal 7 Fragen stellen.",
  "- Nur Sanitär- und Heizungsthemen bearbeiten. Bei anderen Themen höflich ablehnen.",
  "- Sprache: Deutsch (Schweizerdeutsch verstehen, Hochdeutsch antworten).",
  "- Keine Aufnahme/Recording.",
  "- Keine persönlichen Daten in die Beschreibung aufnehmen (keine Namen, Telefonnummern, E-Mails, keine exakten Adressen).",
  "",
  "PFLICHTINFORMATIONEN (müssen am Ende vorliegen)",
  "1) Postleitzahl des Einsatzortes (Schweiz)",
  "2) Ort/Stadt des Einsatzortes",
  "3) Kategorie (genau eine):",
  "   Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein",
  "4) Dringlichkeit (genau eine, Kleinschreibung):",
  "   notfall | dringend | normal",
  "5) Kurzbeschreibung des Problems (1\u20133 Sätze, ohne PII)",
  "",
  "GESPRÄCHSABLAUF",
  "1) Begrüssung: \u201eGuten Tag, hier ist {{business_name}}. Wie kann ich Ihnen helfen?\u201c",
  "2) Problem erfassen: Was ist passiert?",
  "3) Einsatzort: \u201eWie lautet die Postleitzahl und der Ort des Einsatzortes?\u201c",
  "   - Falls unklar: zuerst Postleitzahl, dann Ort erfragen.",
  "4) Kategorie wählen:",
  "   - Wenn unklar: \u201eSanitär allgemein\u201c.",
  "5) Dringlichkeit:",
  "   \u201eIst das ein Notfall, ist es dringend oder kann es normal eingeplant werden?\u201c",
  "6) Kurz zusammenfassen und bestätigen lassen.",
  "7) Abschluss:",
  "   \u201e{{closing_text}}\u201c",
  "",
  "CUSTOM ANALYSIS DATA OUTPUT (am Ende ausfüllen)",
  "- plz: Postleitzahl (nur die Ziffern)",
  "- city: Ort/Stadt",
  "- category: exakt einer der 6 Werte (Verstopfung, Leck, Heizung, Boiler, Rohrbruch, Sanitär allgemein)",
  '- urgency: exakt "notfall" oder "dringend" oder "normal" (kleinschreibung)',
  "- description: 1\u20133 Sätze Problembeschreibung ohne PII",
].join("\n");

const intakePrompt =
  "Du nimmst eine Sanitär-/Heizungsmeldung auf. Maximal 7 Fragen. " +
  "Sammle zwingend: Postleitzahl, Ort, Kategorie (genau eine: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein), " +
  "Dringlichkeit (genau: notfall|dringend|normal), kurze Beschreibung (1\u20133 Sätze, ohne Namen/Telefon/E-Mail/Adresse). " +
  "Wenn es kein Sanitär/Heizung ist: setze out_of_scope=true. " +
  "Wenn alle Pflichtfelder vorhanden sind: setze intake_complete=true, sonst false. " +
  "Frage fehlende Felder gezielt nach. Am Ende fasse kurz zusammen und bestätige.";

function buildAgent(p) {
  const prompt = globalPrompt
    .replaceAll("{{business_name}}", p.business_name)
    .replaceAll("{{closing_text}}", p.closing_text);

  return {
    agent_id: "",
    channel: "voice",
    agent_name: p.agent_name,
    response_engine: {
      type: "conversation-flow",
      version: 1,
      conversation_flow_id: "",
    },
    webhook_url: p.webhook_url,
    language: "de-DE",
    data_storage_setting: "everything",
    opt_in_signed_url: false,
    post_call_analysis_data: [
      {
        type: "string",
        name: "plz",
        description:
          'Swiss postal code (PLZ) of the service location. Return exactly 4 digits, e.g. "8001". If unknown, ask during the call.',
        required: true,
      },
      {
        type: "string",
        name: "city",
        description:
          'City/town of the service location in Switzerland, e.g. "Zürich". If unknown, ask during the call.',
        required: true,
      },
      {
        type: "string",
        name: "category",
        description:
          'Return exactly one of: "Verstopfung", "Leck", "Heizung", "Boiler", "Rohrbruch", "Sanitär allgemein". Choose the closest match.',
        required: true,
      },
      {
        type: "string",
        name: "urgency",
        description:
          'Return exactly one of: "notfall", "dringend", "normal". Lowercase only. Never return empty.',
        required: true,
      },
      {
        type: "string",
        name: "description",
        description:
          "1-3 sentence summary of the problem. Include key symptoms and affected area (bathroom/kitchen/basement/etc.). Never include personal data (names, phone numbers, emails, addresses).",
        required: true,
      },
    ],
    version: 1,
    is_published: false,
    version_title: p.agent_name,
    post_call_analysis_model: "gpt-4.1-mini",
    pii_config: { mode: "post_call", categories: [] },
    analysis_successful_prompt:
      "Evaluate whether the agent had a successful call with the user. For a successful call, the agent should have a complete conversation with user, finished the task, and have not ran into technical issues, or caused user frustration. Besides, the agent was not blocked by a call screen or encountered voicemail.",
    analysis_summary_prompt:
      "Write a 1-3 sentence summary of the call based on the call transcript. Should capture the important information and actions taken during the call.",
    analysis_user_sentiment_prompt:
      "Evaluate user's sentiment, mood and satisfaction level.",
    voice_id: p.voice_id,
    max_call_duration_ms: 420000,
    interruption_sensitivity: 0.9,
    allow_user_dtmf: true,
    user_dtmf_options: {},
    conversationFlow: {
      conversation_flow_id: "",
      version: 1,
      global_prompt: prompt,
      nodes: [
        {
          instruction: { type: "static_text", text: p.greeting_text },
          always_edge: {
            destination_node_id: "node-intake",
            id: "always-edge-welcome",
            transition_condition: { type: "prompt", prompt: "Always" },
          },
          name: "Welcome Node",
          edges: [],
          start_speaker: "agent",
          id: "start-node",
          type: "conversation",
          display_position: { x: 232, y: 24 },
        },
        {
          instruction: { type: "prompt", text: intakePrompt },
          name: "Intake Node",
          edges: [],
          id: "node-intake",
          type: "conversation",
          display_position: { x: 623, y: 310 },
          skip_response_edge: {
            destination_node_id: "node-logic-split",
            id: "skip-response-edge-intake",
            transition_condition: { type: "prompt", prompt: "Skip response" },
          },
        },
        {
          name: "Logic Split Node",
          edges: [],
          id: "node-logic-split",
          else_edge: {
            destination_node_id: "node-closing",
            id: "edge-logic-else",
            transition_condition: { type: "prompt", prompt: "Else" },
          },
          type: "branch",
          display_position: { x: 989, y: 704 },
        },
        {
          instruction: { type: "static_text", text: p.closing_text },
          name: "Closing Node",
          edges: [],
          id: "node-closing",
          type: "conversation",
          display_position: { x: 1363, y: 796 },
          skip_response_edge: {
            id: "skip-response-edge-closing",
            transition_condition: { type: "prompt", prompt: "Skip response" },
          },
        },
        {
          instruction: {
            type: "prompt",
            text: "Danke. Dafür sind wir nicht zuständig. Bei Sanitär- oder Heizungsanliegen helfe ich gerne.",
          },
          name: "Out-of-scope Closing",
          edges: [],
          id: "node-out-of-scope",
          type: "conversation",
          display_position: { x: 943, y: 944 },
          skip_response_edge: {
            id: "skip-response-edge-oos",
            transition_condition: { type: "prompt", prompt: "Skip response" },
          },
        },
        {
          name: "End Call",
          id: "end-call-node",
          type: "end",
          display_position: { x: 1766, y: 1116 },
          instruction: { type: "prompt", text: "Politely end the call" },
        },
      ],
      start_node_id: "start-node",
      start_speaker: "agent",
      model_choice: { type: "cascading", model: "gpt-4.1" },
      tool_call_strict_mode: true,
      knowledge_base_ids: [],
      kb_config: { top_k: 3, filter_score: 0.6 },
      begin_tag_display_position: { x: 46, y: -43 },
      is_published: false,
      flex_mode: true,
      is_transfer_cf: false,
    },
  };
}

// ── Template (keep placeholders in global_prompt) ──────────────────────────
const templateObj = buildAgent({
  agent_name: "{{agent_name}}",
  business_name: "{{business_name}}",
  greeting_text: "{{greeting_text}}",
  closing_text: "{{closing_text}}",
  voice_id: "{{voice_id}}",
  webhook_url: "{{webhook_url}}",
});
// Restore raw template prompt (with {{placeholders}} intact)
templateObj.conversationFlow.global_prompt = globalPrompt;

const templatePath = "C:/flowsight_mvp/retell/agent_template.json";
writeFileSync(templatePath, JSON.stringify(templateObj, null, 2) + "\n");
console.log("template: written");

// ── Dörfler AG instance ────────────────────────────────────────────────────
const doerflerObj = buildAgent({
  agent_name: "Dörfler AG Intake",
  business_name: "Dörfler AG",
  greeting_text:
    "Guten Tag, hier ist der Sanitär- und Heizungsdienst der Dörfler AG. Wie kann ich Ihnen helfen?",
  closing_text:
    "Vielen Dank. Die Dörfler AG hat Ihre Meldung aufgenommen und meldet sich schnellstmöglich.",
  voice_id: "minimax-Cimo",
  webhook_url: "https://flowsight-mvp.vercel.app/api/retell/webhook",
});

const doerflerPath = "C:/flowsight_mvp/retell/exports/doerfler_agent.json";
writeFileSync(doerflerPath, JSON.stringify(doerflerObj, null, 2) + "\n");
console.log("doerfler: written");

// ── Verify round-trip ──────────────────────────────────────────────────────
JSON.parse(readFileSync(templatePath, "utf8"));
JSON.parse(readFileSync(doerflerPath, "utf8"));
console.log("both: valid JSON (round-trip verified)");
