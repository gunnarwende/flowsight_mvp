// scripts/gen_retell_agents.mjs — Generate Retell agent JSON files (DE + INTL)
// Usage: node scripts/gen_retell_agents.mjs
// Output: retell/agent_template_de.json   + retell/agent_template_intl.json
//         retell/exports/doerfler_agent.json (DE)
//         retell/exports/doerfler_agent_intl.json (INTL)

import { writeFileSync, readFileSync } from "fs";

// ── Shared post-call analysis data ──────────────────────────────────────────
const postCallAnalysisData = [
  {
    type: "string",
    name: "plz",
    description:
      'Swiss postal code (Postleitzahl). Return exactly 4 digits, e.g. "8001". Always return the numeric postal code regardless of call language.',
    required: true,
  },
  {
    type: "string",
    name: "city",
    description:
      'City/town of the service location in Switzerland, e.g. "Zürich". Always return the German city name.',
    required: true,
  },
  {
    type: "string",
    name: "street",
    description:
      'Street name of the service location, e.g. "Bahnhofstrasse". Return the street name only, without house number. If the caller did not provide a street, return empty string.',
    required: false,
  },
  {
    type: "string",
    name: "house_number",
    description:
      'House number of the service location, e.g. "12" or "3a". If the caller did not provide a house number, return empty string.',
    required: false,
  },
  {
    type: "string",
    name: "category",
    description:
      'Return exactly one of: "Verstopfung", "Leck", "Heizung", "Boiler", "Rohrbruch", "Sanitär allgemein". Always use the German value regardless of call language.',
    required: true,
  },
  {
    type: "string",
    name: "urgency",
    description:
      'Return exactly one of: "notfall", "dringend", "normal". Lowercase German only.',
    required: true,
  },
  {
    type: "string",
    name: "description",
    description:
      "1-3 sentence summary of the problem IN GERMAN. Include key symptoms and affected area. Never include personal data. Always write in German regardless of call language.",
    required: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DE AGENT — German only, with AgentSwapTool for non-DE callers
// ═══════════════════════════════════════════════════════════════════════════

const deGlobalPrompt = [
  "Du bist der telefonische Assistent von {{business_name}}. Du nimmst Schadensmeldungen im Bereich Sanitär und Heizung auf.",
  "",
  "STIL",
  "- Sprich natürlich und ruhig — wie ein erfahrener Disponent, nicht wie ein Roboter.",
  "- Kurze Sätze. Keine Aufzählungen vorlesen. Nie mehrere Fragen in einem Satz.",
  "- Empathische Mikro-Reaktionen: 'Verstehe.', 'Das klingt unangenehm.', 'Alles klar.' -- bevor du die n\u00e4chste Frage stellst.",
  "- Verwende IMMER 'Postleitzahl', NIE 'PLZ'.",
  "- Maximal 7 Fragen pro Gespräch.",
  "- Wenn der Anrufer spricht: HÖRE SOFORT AUF zu reden. Warte, bis er fertig ist.",
  "",
  "SPRACHERKENNUNG (PRIORITÄT 1 — VOR ALLEM ANDEREN)",
  "- Wenn der Anrufer eine dieser Sprachen spricht ODER eines dieser Wörter/Phrasen sagt: SOFORT das Tool 'swap_to_intl_agent' aufrufen.",
  "- Trigger-Wörter (case-insensitive): english, englisch, in english, speak english, do you speak english, I don't speak German, français, french, je ne parle pas allemand, parlez-vous français, italiano, italian, non parlo tedesco, parla italiano",
  "- Auch wenn nur der ERSTE Satz des Anrufers in einer Fremdsprache ist: SOFORT transferieren.",
  "- Kein Versuch, auf Deutsch weiterzumachen. Keine Rückfrage. Kein 'Moment bitte'. Einfach transferieren.",
  "",
  "SPRACHE",
  "- Du sprichst AUSSCHLIESSLICH Hochdeutsch. Schweizerdeutsch verstehen, auf Hochdeutsch antworten.",
  "- Verwende KEINE englischen W\u00f6rter oder Phrasen (kein 'Okay', 'sorry', 'Checklist').",
  "",
  "THEMA",
  "- Nur Sanitär- und Heizungsthemen. Bei anderen Anliegen höflich ablehnen.",
  "- Keine Aufnahme/Recording erwähnen.",
  "",
  "DATENSCHUTZ",
  "- Keine persönlichen Daten in die Beschreibung (keine Namen, Telefonnummern, E-Mails, exakte Adressen).",
  "",
  "PFLICHTFELDER (müssen am Ende vorliegen)",
  "1) Postleitzahl des Einsatzortes (Schweiz, 4 Ziffern)",
  "2) Ort/Stadt des Einsatzortes",
  "3) Strasse und Hausnummer des Einsatzortes (best-effort — falls der Anrufer sie nicht nennen will, trotzdem weitermachen)",
  "4) Kategorie — genau eine: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein",
  "5) Dringlichkeit — genau eine (Kleinschreibung): notfall | dringend | normal",
  "6) Kurzbeschreibung (1–3 Sätze, ohne PII)",
  "",
  "CUSTOM ANALYSIS DATA OUTPUT",
  "Alle Werte IMMER auf Deutsch ausgeben.",
  "- plz: Postleitzahl (nur die 4 Ziffern)",
  "- city: Ort/Stadt",
  "- street: Strassenname (ohne Hausnummer). Leer lassen wenn nicht angegeben.",
  "- house_number: Hausnummer. Leer lassen wenn nicht angegeben.",
  "- category: exakt einer der 6 Werte (Verstopfung, Leck, Heizung, Boiler, Rohrbruch, Sanitär allgemein)",
  '- urgency: exakt "notfall" oder "dringend" oder "normal" (kleinschreibung)',
  "- description: 1–3 Sätze Problembeschreibung ohne PII (auf Deutsch)",
].join("\n");

const deIntakePrompt = [
  "Du führst ein natürliches Gespräch, um eine Schadensmeldung aufzunehmen.",
  "",
  "SPRACHERKENNUNG (PRIORITÄT 1 — VOR ALLEM ANDEREN)",
  "- Prüfe den ALLERERSTEN Satz des Anrufers auf Fremdsprache.",
  "- Trigger-Wörter (case-insensitive): english, englisch, in english, speak english, do you speak english, I don't speak German, français, french, je ne parle pas allemand, parlez-vous français, italiano, italian, non parlo tedesco, parla italiano",
  "- Wenn der Anrufer eine Fremdsprache spricht ODER ein Trigger-Wort sagt: SOFORT das Tool 'swap_to_intl_agent' aufrufen.",
  "- Keine Rückfrage, keine Übersetzung, kein 'Moment bitte', kein Versuch auf Deutsch weiterzumachen.",
  "- Wenn du den Anrufer nicht verstehst oder die Sprache unklar ist: EINMAL auf Deutsch nachfragen. Wenn der Anrufer erneut nicht auf Deutsch antwortet: transferieren.",
  "",
  "ABLAUF (flexible Reihenfolge — passe dich dem Gespräch an)",
  "1. Lass den Anrufer zuerst erzählen, was passiert ist. Hör zu.",
  "2. Reagiere kurz empathisch ('Verstehe.' / 'Das klingt unangenehm.').",
  "3. Leite die Kategorie möglichst aus der Beschreibung ab. Nur wenn unklar: 'Handelt es sich eher um ein Leck, eine Verstopfung oder etwas anderes?' Nie alle 6 Kategorien vorlesen.",
  "4. Frage nach der Adresse: 'Wie lautet die Strasse und Hausnummer des Einsatzortes?' Wenn der Anrufer die Adresse nicht nennen will, akzeptiere es und gehe weiter.",
  "5. Frage nach Postleitzahl und Ort zusammen: 'Und die Postleitzahl und der Ort?' Bestätige als ganzes zurück (z.B. 'Ich habe 8942 Oberrieden, stimmt das?'). NICHT Ziffer für Ziffer bestätigen.",
  "6. Frage nach Dringlichkeit — NUR wenn noch nicht beantwortet: 'Ist das ein Notfall, dringend, oder kann es normal eingeplant werden?'",
  "7. GENAU EINE Zusammenfassung: Fasse alle gesammelten Daten kurz zusammen und frage 'Stimmt das so?' Nach Bestätigung: setze intake_complete=true. Keine weitere Zusammenfassung danach.",
  "",
  "KEIN-DOPPELT-FRAGEN-REGEL",
  "- Frage jedes Pflichtfeld GENAU EINMAL. Wenn der Anrufer es bereits beantwortet hat (auch beiläufig), frage es NICHT erneut.",
  "- Bei Stille oder unklarer Antwort: EINMAL nachfragen, dann weiter zum nächsten Feld.",
  "- Prüfe VOR jeder Frage, ob die Information schon vorliegt. Wenn ja: überspringe sie.",
  "",
  "WEITERE REGELN",
  "- Nie zwei Fragen in einem Satz.",
  "- Wenn der Anrufer genervt oder kurz angebunden ist: Sammle nur das Minimum und schliesse zügig ab.",
  "- Verwende IMMER 'Postleitzahl', NIE 'PLZ'.",
  "- Wenn das Anliegen kein Sanitär-/Heizungsthema ist: setze out_of_scope=true.",
  "- Wenn alle Pflichtfelder vorhanden sind (Postleitzahl, Ort, Kategorie, Dringlichkeit, Beschreibung): setze intake_complete=true, sonst false.",
  "- Strasse und Hausnummer sind wünschenswert aber KEIN Blocker für intake_complete.",
].join("\n");

// ═══════════════════════════════════════════════════════════════════════════
// INTL AGENT — EN/FR/IT, receives transferred calls from DE agent
// ═══════════════════════════════════════════════════════════════════════════

const intlGlobalPrompt = [
  "You are the phone assistant for {{business_name}}. You take damage reports for plumbing and heating services in Switzerland.",
  "",
  "CONTEXT",
  "- The caller was transferred from the German-speaking agent because they spoke English, French, or Italian.",
  "- The full conversation history carries over. Check what was already said before asking again.",
  "",
  "STYLE",
  '- Speak naturally and calmly — like an experienced dispatcher, not a robot.',
  "- Short sentences. No lists. Never ask multiple questions at once.",
  '- Empathetic micro-reactions: "I understand.", "That sounds unpleasant.", "Got it." — before your next question.',
  "- Maximum 7 questions per call.",
  "- When the caller speaks: STOP talking immediately. Wait until they finish.",
  "",
  "LANGUAGE (STICKY MODE)",
  "- Detect the caller's language from the conversation history or their first sentence.",
  "- Supported: English, French, Italian.",
  "- Once you identify the language, STAY in that language for the ENTIRE call — questions, summary, closing, everything.",
  "- NEVER switch to German during the conversation.",
  "- Post-call analysis values (category, urgency, description) must ALWAYS be in German — regardless of conversation language.",
  "",
  "TOPIC",
  "- Plumbing and heating only. Politely decline other requests.",
  "- Never mention recording.",
  "",
  "PRIVACY",
  "- No personal data in the description (no names, phone numbers, emails, exact addresses).",
  "",
  "REQUIRED FIELDS (must be collected by end of call)",
  "1) Postal code of the service location (Switzerland, 4 digits)",
  "2) City/town of the service location",
  "3) Street and house number of the service location (best-effort — if the caller refuses, continue without it)",
  "4) Category — exactly one: Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitär allgemein",
  "5) Urgency — exactly one (lowercase German): notfall | dringend | normal",
  "6) Short description (1–3 sentences, no PII)",
  "",
  "CUSTOM ANALYSIS DATA OUTPUT",
  "Even though the call is in English/French/Italian: ALL values must be in GERMAN.",
  "- plz: Postal code (4 digits only)",
  "- city: City/town (German name)",
  "- street: Street name (without house number). Leave empty if not provided.",
  "- house_number: House number. Leave empty if not provided.",
  "- category: exactly one of the 6 German values",
  '- urgency: exactly "notfall" or "dringend" or "normal" (lowercase)',
  "- description: 1–3 sentences in German summarizing the problem, no PII",
].join("\n");

const intlIntakePrompt = [
  "You are continuing an intake conversation. The caller was transferred from the German agent.",
  "",
  "CHECK CONVERSATION HISTORY FIRST",
  "- Review what the caller already said to the German agent before transfer.",
  "- Do NOT re-ask information that was already provided.",
  "- If the caller already described their problem, acknowledge it and continue with missing fields only.",
  "",
  "GREETING (only on your first turn after transfer)",
  "- Greet warmly in the detected language. Acknowledge what they already said.",
  '- English: "Hello! I\'ll be happy to help you. [Acknowledge what they said]. Let me just confirm a few details."',
  '- French: "Bonjour ! Je suis là pour vous aider. [Acknowledge]. Permettez-moi de confirmer quelques détails."',
  '- Italian: "Buongiorno! Sono qui per aiutarla. [Acknowledge]. Mi permetta di confermare alcuni dettagli."',
  "",
  "WORKFLOW (flexible order — adapt to conversation)",
  "1. Let the caller explain what happened. Listen.",
  "2. React briefly with empathy.",
  '3. Derive category from description if possible. Only if unclear: ask (never list all 6).',
  "4. Ask for the street address: 'What is the street and house number at the service location?' If the caller refuses, accept and move on.",
  "5. Ask for postal code and city together: 'And the postal code and city?' Confirm as a whole (e.g. '8942 Oberrieden, is that correct?'). Do NOT confirm digit by digit.",
  "6. Ask about urgency — ONLY if not yet answered.",
  '7. EXACTLY ONE summary: summarize all collected data and ask "Is that correct?" After confirmation: set intake_complete=true. No further summary.',
  "",
  "NO-DOUBLE-ASKING RULE",
  "- Ask each required field EXACTLY ONCE. If the caller already answered (even casually), do NOT ask again.",
  "- On silence or unclear answer: ask ONCE more, then move on.",
  "- Before each question: check if the information is already available. If yes: skip.",
  "",
  "ADDITIONAL RULES",
  "- Never ask two questions in one sentence.",
  "- If the caller is impatient: collect minimum and wrap up quickly.",
  "- If the request is not plumbing/heating: set out_of_scope=true.",
  "- When all required fields are collected (postal code, city, category, urgency, description): set intake_complete=true.",
  "- Street and house number are desirable but NOT a blocker for intake_complete.",
  "",
  "LANGUAGE (STICKY)",
  "- Stay in the caller's language for ALL turns — questions, summary, closing.",
  "- Post-call analysis values (category, urgency, description) always in German.",
].join("\n");

// ═══════════════════════════════════════════════════════════════════════════
// Builder functions
// ═══════════════════════════════════════════════════════════════════════════

function buildDeAgent(p) {
  const prompt = deGlobalPrompt.replaceAll("{{business_name}}", p.business_name);

  const agentSwapTool = {
    type: "agent_swap",
    agent_id: p.intl_agent_id || "REPLACE_WITH_INTL_AGENT_ID",
    name: "swap_to_intl_agent",
    description:
      "Transfer the caller to the multilingual agent. Trigger IMMEDIATELY when: (1) the caller speaks English, French, or Italian, OR (2) the caller says any of: english, englisch, speak english, I don't speak German, français, french, italiano, italian, OR (3) the caller does not respond in German after one clarification attempt. Do not ask — just transfer.",
    post_call_analysis_setting: "only_destination_agent",
  };

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
    post_call_analysis_data: postCallAnalysisData,
    version: 1,
    is_published: false,
    version_title: p.agent_name,
    post_call_analysis_model: "gpt-4.1-mini",
    pii_config: { mode: "post_call", categories: [] },
    analysis_successful_prompt:
      "Evaluate whether the agent had a successful call. A successful call means the agent completed the intake or correctly transferred to the multilingual agent.",
    analysis_summary_prompt:
      "Write a 1-3 sentence summary of the call. Note if the caller was transferred to the multilingual agent.",
    analysis_user_sentiment_prompt:
      "Evaluate user's sentiment, mood and satisfaction level.",
    voice_id: p.voice_id,
    max_call_duration_ms: 420000,
    interruption_sensitivity: 1.0,
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
          instruction: { type: "prompt", text: deIntakePrompt },
          name: "Intake Node",
          edges: [],
          id: "node-intake",
          type: "conversation",
          display_position: { x: 623, y: 310 },
          tools: [agentSwapTool],
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
                prompt:
                  "out_of_scope is true (the user's request is not about plumbing or heating)",
              },
            },
            {
              destination_node_id: "node-closing",
              id: "edge-intake-complete",
              transition_condition: {
                type: "prompt",
                prompt:
                  "intake_complete is true (all required fields have been collected: plz, city, category, urgency, description)",
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
          instruction: {
            type: "prompt",
            text:
              "Sage dem Anrufer auf Hochdeutsch sinngemäß: " +
              p.closing_text +
              " Keine erneute Zusammenfassung — nur der Abschluss.",
          },
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
            text: "Sage dem Anrufer auf Hochdeutsch: Danke. Dafür sind wir nicht zuständig. Bei Sanitär- oder Heizungsanliegen helfe ich gerne.",
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
          instruction: {
            type: "prompt",
            text: "Beende das Gespräch höflich auf Hochdeutsch. Auf Wiedersehen.",
          },
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

function buildIntlAgent(p) {
  const prompt = intlGlobalPrompt.replaceAll(
    "{{business_name}}",
    p.business_name,
  );

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
    language: "en-US",
    data_storage_setting: "everything",
    opt_in_signed_url: false,
    post_call_analysis_data: postCallAnalysisData,
    version: 1,
    is_published: false,
    version_title: p.agent_name,
    post_call_analysis_model: "gpt-4.1-mini",
    pii_config: { mode: "post_call", categories: [] },
    analysis_successful_prompt:
      "Evaluate whether the agent had a successful call. The caller was transferred from the German agent. A successful call means the agent completed the intake in the caller's language (EN/FR/IT).",
    analysis_summary_prompt:
      "Write a 1-3 sentence summary of the call. Note the language used and that this was a transferred call.",
    analysis_user_sentiment_prompt:
      "Evaluate user's sentiment, mood and satisfaction level.",
    voice_id: p.voice_id,
    max_call_duration_ms: 420000,
    interruption_sensitivity: 1.0,
    allow_user_dtmf: true,
    user_dtmf_options: {},
    conversationFlow: {
      conversation_flow_id: "",
      version: 1,
      global_prompt: prompt,
      nodes: [
        {
          instruction: {
            type: "prompt",
            text: "You were transferred from the German agent. Check the conversation history to understand what language the caller speaks and what they already said. Greet them warmly in their language (English, French, or Italian) and let them know you are here to help. If they already described their problem, acknowledge it briefly.",
          },
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
          instruction: { type: "prompt", text: intlIntakePrompt },
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
                prompt:
                  "out_of_scope is true (the user's request is not about plumbing or heating)",
              },
            },
            {
              destination_node_id: "node-closing",
              id: "edge-intake-complete",
              transition_condition: {
                type: "prompt",
                prompt:
                  "intake_complete is true (all required fields have been collected: plz, city, category, urgency, description)",
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
          instruction: {
            type: "prompt",
            text:
              "Tell the caller IN THEIR LANGUAGE: " +
              p.closing_text +
              " No summary — just the closing. Stay in the caller's language (English, French, or Italian).",
          },
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
            text: "Tell the caller IN THEIR LANGUAGE: Thank you, but this is not something we handle. We can help with plumbing and heating issues.",
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
          instruction: {
            type: "prompt",
            text: "End the call politely IN THE CALLER'S LANGUAGE. Goodbye / Au revoir / Arrivederci.",
          },
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
      is_transfer_cf: true,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Generate templates (with {{placeholders}})
// ═══════════════════════════════════════════════════════════════════════════

const deTemplateObj = buildDeAgent({
  agent_name: "{{agent_name}}",
  business_name: "{{business_name}}",
  greeting_text: "{{greeting_text}}",
  closing_text: "{{closing_text}}",
  voice_id: "{{voice_id}}",
  webhook_url: "{{webhook_url}}",
  intl_agent_id: "{{intl_agent_id}}",
});
deTemplateObj.conversationFlow.global_prompt = deGlobalPrompt;

const intlTemplateObj = buildIntlAgent({
  agent_name: "{{agent_name}}",
  business_name: "{{business_name}}",
  closing_text: "{{closing_text}}",
  voice_id: "{{voice_id}}",
  webhook_url: "{{webhook_url}}",
});
intlTemplateObj.conversationFlow.global_prompt = intlGlobalPrompt;

const deTemplatePath = "C:/flowsight_mvp/retell/agent_template_de.json";
const intlTemplatePath = "C:/flowsight_mvp/retell/agent_template_intl.json";
writeFileSync(deTemplatePath, JSON.stringify(deTemplateObj, null, 2) + "\n");
writeFileSync(
  intlTemplatePath,
  JSON.stringify(intlTemplateObj, null, 2) + "\n",
);
console.log("templates: DE + INTL written");

// ═══════════════════════════════════════════════════════════════════════════
// Dörfler AG instances
// ═══════════════════════════════════════════════════════════════════════════

const doerflerDeObj = buildDeAgent({
  agent_name: "Dörfler AG Intake (DE)",
  business_name: "Dörfler AG",
  greeting_text:
    "Guten Tag, hier ist der Sanitär- und Heizungsdienst der Dörfler AG. Wie kann ich Ihnen helfen?",
  closing_text:
    "Danke, ich habe alles aufgenommen. Die Dörfler AG meldet sich bei Ihnen, um das weitere Vorgehen zu besprechen.",
  voice_id: "v3V1d2rk6528UrLKRuy8",
  webhook_url: "https://flowsight-mvp.vercel.app/api/retell/webhook",
  // Founder: after importing INTL agent, paste its agent_id here and re-run
  intl_agent_id: "REPLACE_WITH_INTL_AGENT_ID",
});

const doerflerIntlObj = buildIntlAgent({
  agent_name: "Dörfler AG Intake (INTL)",
  business_name: "Dörfler AG",
  closing_text:
    "Thank you, I've recorded everything. Dörfler AG will contact you to discuss the next steps.",
  voice_id: "aMSt68OGf4xUZAnLpTU8",
  webhook_url: "https://flowsight-mvp.vercel.app/api/retell/webhook",
});

const doerflerDePath =
  "C:/flowsight_mvp/retell/exports/doerfler_agent.json";
const doerflerIntlPath =
  "C:/flowsight_mvp/retell/exports/doerfler_agent_intl.json";
writeFileSync(doerflerDePath, JSON.stringify(doerflerDeObj, null, 2) + "\n");
writeFileSync(
  doerflerIntlPath,
  JSON.stringify(doerflerIntlObj, null, 2) + "\n",
);
console.log("doerfler: DE + INTL written");

// ── Verify round-trip ────────────────────────────────────────────────────
JSON.parse(readFileSync(deTemplatePath, "utf8"));
JSON.parse(readFileSync(intlTemplatePath, "utf8"));
JSON.parse(readFileSync(doerflerDePath, "utf8"));
JSON.parse(readFileSync(doerflerIntlPath, "utf8"));
console.log("all 4 files: valid JSON (round-trip verified)");
