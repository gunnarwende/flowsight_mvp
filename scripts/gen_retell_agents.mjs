// scripts/gen_retell_agents.mjs — Generate Retell agent JSON files
// Usage: node scripts/gen_retell_agents.mjs
// Output: retell/agent_template.json + retell/exports/doerfler_agent.json

import { writeFileSync, readFileSync } from "fs";

const globalPrompt = [
  "Du bist der telefonische Assistent von {{business_name}}. Du nimmst Schadensmeldungen im Bereich Sanitär und Heizung auf.",
  "",
  "STIL",
  "- Sprich nat\u00fcrlich und ruhig \u2014 wie ein erfahrener Disponent, nicht wie ein Roboter.",
  "- Kurze S\u00e4tze. Keine Aufz\u00e4hlungen vorlesen. Nie mehrere Fragen in einem Satz.",
  "- Empathische Mikro-Reaktionen: \u201eVerstehe.\u201c, \u201eDas klingt unangenehm.\u201c, \u201eAlles klar.\u201c \u2014 bevor du die n\u00e4chste Frage stellst.",
  "- Verwende IMMER \u201ePostleitzahl\u201c, NIE \u201ePLZ\u201c.",
  "- Maximal 7 Fragen pro Gespr\u00e4ch.",
  "",
  "SPRACHE",
  "- Standard: Hochdeutsch. Schweizerdeutsch verstehen, auf Hochdeutsch antworten.",
  "- Verwende KEINE englischen W\u00f6rter oder Phrasen auf Deutsch (kein \u201eOkay\u201c, \u201esorry\u201c, \u201eChecklist\u201c).",
  "- Vollst\u00e4ndiger Sprachwechsel: Wenn der Anrufer auf Englisch oder Franz\u00f6sisch spricht, wechsle KOMPLETT in diese Sprache \u2014 Begr\u00fc\u00dfung, Fragen, Zusammenfassung, Abschluss. Die Post-Call-Analyse (plz, city, category, urgency, description) bleibt IMMER auf Deutsch.",
  "",
  "THEMA",
  "- Nur Sanit\u00e4r- und Heizungsthemen. Bei anderen Anliegen h\u00f6flich ablehnen.",
  "- Keine Aufnahme/Recording erw\u00e4hnen.",
  "",
  "DATENSCHUTZ",
  "- Keine pers\u00f6nlichen Daten in die Beschreibung (keine Namen, Telefonnummern, E-Mails, exakte Adressen).",
  "",
  "PFLICHTFELDER (m\u00fcssen am Ende vorliegen)",
  "1) Postleitzahl des Einsatzortes (Schweiz, 4 Ziffern)",
  "2) Ort/Stadt des Einsatzortes",
  "3) Kategorie \u2014 genau eine: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanit\u00e4r allgemein",
  "4) Dringlichkeit \u2014 genau eine (Kleinschreibung): notfall | dringend | normal",
  "5) Kurzbeschreibung (1\u20133 S\u00e4tze, ohne PII)",
  "",
  "CUSTOM ANALYSIS DATA OUTPUT",
  "Auch wenn das Gespr\u00e4ch auf Englisch oder Franz\u00f6sisch gef\u00fchrt wurde: Alle Werte IMMER auf Deutsch ausgeben.",
  "- plz: Postleitzahl (nur die 4 Ziffern)",
  "- city: Ort/Stadt",
  "- category: exakt einer der 6 Werte (Verstopfung, Leck, Heizung, Boiler, Rohrbruch, Sanit\u00e4r allgemein)",
  '- urgency: exakt "notfall" oder "dringend" oder "normal" (kleinschreibung)',
  "- description: 1\u20133 S\u00e4tze Problembeschreibung ohne PII (auf Deutsch)",
].join("\n");

const intakePrompt = [
  "Du f\u00fchrst ein nat\u00fcrliches Gespr\u00e4ch, um eine Schadensmeldung aufzunehmen.",
  "",
  "ABLAUF",
  "1. Lass den Anrufer zuerst erz\u00e4hlen, was passiert ist. H\u00f6r zu.",
  "2. Reagiere kurz empathisch (\u201eVerstehe.\u201c / \u201eDas klingt unangenehm.\u201c).",
  "3. Leite die Kategorie m\u00f6glichst aus der Beschreibung ab. Nur wenn unklar: \u201eHandelt es sich eher um ein Leck, eine Verstopfung oder etwas anderes?\u201c. Nie alle 6 Kategorien vorlesen.",
  "4. Frage nach Postleitzahl und Ort: \u201eWo befindet sich der Einsatzort \u2014 k\u00f6nnen Sie mir die Postleitzahl und den Ort nennen?\u201c",
  "5. Frage nach Dringlichkeit: \u201eIst das ein Notfall, dringend, oder kann es normal eingeplant werden?\u201c",
  "6. Fasse kurz zusammen und bitte um Best\u00e4tigung.",
  "",
  "REGELN",
  "- Nie zwei Fragen in einem Satz. Immer nur eine Sache auf einmal fragen.",
  "- Wenn der Anrufer genervt oder kurz angebunden ist: Sammle nur das Minimum und schliesse z\u00fcgig ab.",
  "- Wenn eine Information schon aus dem Gespr\u00e4ch hervorgeht: NICHT nochmal fragen.",
  "- Verwende IMMER \u201ePostleitzahl\u201c, NIE \u201ePLZ\u201c.",
  "- Wenn das Anliegen kein Sanit\u00e4r-/Heizungsthema ist: setze out_of_scope=true.",
  "- Wenn alle Pflichtfelder vorhanden sind (Postleitzahl, Ort, Kategorie, Dringlichkeit, Beschreibung): setze intake_complete=true, sonst false.",
  "",
  "SPRACHE",
  "- Wenn der Anrufer Englisch spricht: f\u00fchre das ganze Gespr\u00e4ch auf Englisch.",
  "- Wenn der Anrufer Franz\u00f6sisch spricht: f\u00fchre das ganze Gespr\u00e4ch auf Franz\u00f6sisch.",
  "- Die Post-Call-Analyse-Werte (category, urgency, description) immer auf Deutsch ausgeben, unabh\u00e4ngig von der Gespr\u00e4chssprache.",
].join("\n");

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
          'Swiss postal code (Postleitzahl) of the service location. Return exactly 4 digits, e.g. "8001". Even if the call was in English or French, return the 4-digit Swiss postal code.',
        required: true,
      },
      {
        type: "string",
        name: "city",
        description:
          'City/town of the service location in Switzerland, e.g. "Z\u00fcrich". Always return the German city name.',
        required: true,
      },
      {
        type: "string",
        name: "category",
        description:
          'Return exactly one of: "Verstopfung", "Leck", "Heizung", "Boiler", "Rohrbruch", "Sanit\u00e4r allgemein". Always use the German value, even if the call was in English or French.',
        required: true,
      },
      {
        type: "string",
        name: "urgency",
        description:
          'Return exactly one of: "notfall", "dringend", "normal". Lowercase German only. Even if the caller said "emergency" or "urgent", map to the German equivalent.',
        required: true,
      },
      {
        type: "string",
        name: "description",
        description:
          "1-3 sentence summary of the problem IN GERMAN. Include key symptoms and affected area (Bad/K\u00fcche/Keller etc.). Never include personal data. Even if the call was in English or French, write the summary in German.",
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
          edges: [
            {
              destination_node_id: "node-out-of-scope",
              id: "edge-out-of-scope",
              transition_condition: {
                type: "prompt",
                prompt: "out_of_scope is true (the user's request is not about plumbing or heating)",
              },
            },
            {
              destination_node_id: "node-closing",
              id: "edge-intake-complete",
              transition_condition: {
                type: "prompt",
                prompt: "intake_complete is true (all required fields have been collected: plz, city, category, urgency, description)",
              },
            },
          ],
          id: "node-logic-split",
          else_edge: {
            destination_node_id: "node-intake",
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
            destination_node_id: "end-call-node",
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
            destination_node_id: "end-call-node",
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
    "Danke, ich habe alles aufgenommen. Die Dörfler AG meldet sich bei Ihnen, um das weitere Vorgehen zu besprechen.",
  voice_id: "minimax-Max",
  webhook_url: "https://flowsight-mvp.vercel.app/api/retell/webhook",
});

const doerflerPath = "C:/flowsight_mvp/retell/exports/doerfler_agent.json";
writeFileSync(doerflerPath, JSON.stringify(doerflerObj, null, 2) + "\n");
console.log("doerfler: written");

// ── Verify round-trip ──────────────────────────────────────────────────────
JSON.parse(readFileSync(templatePath, "utf8"));
JSON.parse(readFileSync(doerflerPath, "utf8"));
console.log("both: valid JSON (round-trip verified)");
