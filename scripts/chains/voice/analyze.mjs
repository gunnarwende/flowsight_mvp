// scripts/chains/voice/analyze.mjs
// Analyzer: raw Retell call JSON → findings[]
//
// Usage (module):
//   import { analyzeCall } from "./analyze.mjs";
//   const result = analyzeCall(rawCallJson);

// ── Trigger keywords (must match gen_retell_agents.mjs) ──────────────────
export const TRIGGER_KEYWORDS = [
  "english",
  "englisch",
  "in english",
  "speak english",
  "can you speak english",
  "do you speak english",
  "i don't speak german",
  "français",
  "francais",
  "french",
  "en français",
  "je ne parle pas allemand",
  "parlez-vous français",
  "italiano",
  "in italiano",
  "italian",
  "parli italiano",
  "non parlo tedesco",
];

// ── Valid extraction values ──────────────────────────────────────────────
const VALID_URGENCIES = ["notfall", "dringend", "normal"];
const VALID_CATEGORIES = [
  "Verstopfung",
  "Leck",
  "Heizung",
  "Boiler",
  "Rohrbruch",
  "Sanitär allgemein",
];

// ── Helpers ──────────────────────────────────────────────────────────────

function fmtTime(ms) {
  if (ms == null) return "??:??";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function fmtMs(ms) {
  if (ms == null) return "?";
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Check if text contains any trigger keyword (case-insensitive).
 * Returns the matched keyword or null.
 */
function findTrigger(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const kw of TRIGGER_KEYWORDS) {
    if (lower.includes(kw)) return kw;
  }
  return null;
}

/**
 * Gibberish heuristic score (0.0 = clean, 1.0 = full gibberish).
 * Token-pattern based — NOT dictionary lookup.
 *
 * Signals that raise the score:
 * - Very short tokens (1-2 chars) in high proportion
 * - Tokens with unusual char patterns (no vowels, triple consonants)
 * - Sentence has no recognizable structure (no common function words)
 * - High proportion of capitalized mid-sentence words (ASR artifact)
 */
function gibberishScore(text) {
  if (!text || text.trim().length === 0) return 0;

  const tokens = text
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return 0;
  if (tokens.length <= 2) return 0; // too short to judge

  let signals = 0;
  let maxSignals = 0;

  // Signal 1: proportion of very short tokens (1-2 chars)
  const shortCount = tokens.filter((t) => t.replace(/[.,!?]/g, "").length <= 2).length;
  const shortRatio = shortCount / tokens.length;
  if (shortRatio > 0.5) signals += 2;
  else if (shortRatio > 0.3) signals += 1;
  maxSignals += 2;

  // Signal 2: tokens with no vowels (excluding short words and numbers)
  const vowelPattern = /[aeiouyäöü]/i;
  const longTokens = tokens.filter((t) => t.replace(/[.,!?]/g, "").length > 2);
  if (longTokens.length > 0) {
    const noVowelCount = longTokens.filter((t) => !vowelPattern.test(t)).length;
    const noVowelRatio = noVowelCount / longTokens.length;
    if (noVowelRatio > 0.3) signals += 2;
    else if (noVowelRatio > 0.15) signals += 1;
  }
  maxSignals += 2;

  // Signal 3: triple+ consecutive consonants within tokens
  const tripleConsonant = /[bcdfghjklmnpqrstvwxyz]{4,}/i;
  const tripleCount = tokens.filter((t) => tripleConsonant.test(t)).length;
  if (tripleCount > 0) signals += 1;
  maxSignals += 1;

  // Signal 4: repeated fragments (ASR stutter: "ja ja ja", "hm hm hm")
  const uniqueTokens = new Set(tokens.map((t) => t.toLowerCase().replace(/[.,!?]/g, "")));
  if (tokens.length >= 4 && uniqueTokens.size <= tokens.length * 0.4) signals += 1;
  maxSignals += 1;

  // Signal 5: unusual capitalization mid-sentence (>50% of non-first tokens capitalized)
  if (tokens.length > 2) {
    const midTokens = tokens.slice(1);
    const capCount = midTokens.filter((t) => /^[A-ZÄÖÜ]/.test(t) && !/^(Ich|Sie|Herr|Frau|PLZ|AG)/.test(t)).length;
    if (capCount / midTokens.length > 0.5) signals += 1;
  }
  maxSignals += 1;

  return maxSignals > 0 ? Math.min(1.0, signals / maxSignals) : 0;
}

// ── Turn extraction from transcript_object ───────────────────────────────

/**
 * Normalize Retell transcript_object into uniform turns.
 * Retell may deliver turns as objects with role+content+words,
 * or as flat word arrays. Handle both.
 */
function extractTurns(raw) {
  const transcript = raw.transcript_object ?? raw.transcript_with_tool_call ?? [];

  if (!Array.isArray(transcript) || transcript.length === 0) {
    return [];
  }

  const turns = [];

  for (const segment of transcript) {
    const role = segment.role ?? segment.speaker ?? "unknown";
    const content = segment.content ?? segment.text ?? "";
    const words = segment.words ?? [];

    // Timestamps: try words first, then segment-level
    let startMs = segment.start_timestamp ?? segment.start ?? null;
    let endMs = segment.end_timestamp ?? segment.end ?? null;

    if (words.length > 0) {
      if (startMs == null) startMs = words[0].start ?? words[0].start_timestamp ?? null;
      if (endMs == null) {
        const lastWord = words[words.length - 1];
        endMs = lastWord.end ?? lastWord.end_timestamp ?? null;
      }
    }

    // Convert seconds to ms if values look like seconds (< 10000)
    if (startMs != null && startMs < 10000) startMs = startMs * 1000;
    if (endMs != null && endMs < 10000) endMs = endMs * 1000;

    turns.push({
      role: role === "agent" ? "agent" : "user",
      content,
      wordCount: words.length || content.split(/\s+/).filter(Boolean).length,
      startMs,
      endMs,
      durationMs: startMs != null && endMs != null ? endMs - startMs : null,
    });
  }

  return turns;
}

// ── Finding builders ─────────────────────────────────────────────────────

function finding(category, severity, title, detail, timestamp, evidence) {
  return { category, severity, title, detail, timestamp, evidence };
}

// ── Analyzer categories ──────────────────────────────────────────────────

function auditTriggers(turns, raw) {
  const findings = [];
  const hasTransfer =
    raw.call_type === "agent_transfer" ||
    raw.disconnection_reason === "agent_transfer" ||
    (raw.call_analysis?.call_summary ?? "").toLowerCase().includes("transfer");

  for (let i = 0; i < turns.length; i++) {
    const t = turns[i];
    if (t.role !== "user") continue;

    const kw = findTrigger(t.content);
    if (kw) {
      if (!hasTransfer) {
        findings.push(
          finding(
            "trigger_missed",
            "critical",
            `Trigger keyword '${kw}' in user turn ${i + 1} but no transfer detected`,
            `User turn ${i + 1} contains language trigger. Expected agent_transfer event but none found in call metadata.`,
            fmtTime(t.startMs),
            { turn: i + 1, keyword: kw, transfer_event: false },
          ),
        );
      } else {
        findings.push(
          finding(
            "trigger_matched",
            "pass",
            `Trigger '${kw}' in turn ${i + 1} → transfer occurred`,
            `Language trigger detected and transfer confirmed.`,
            fmtTime(t.startMs),
            { turn: i + 1, keyword: kw, transfer_event: true },
          ),
        );
      }
    }
  }

  return findings;
}

function auditTransfer(raw) {
  const findings = [];
  const hasTransfer =
    raw.disconnection_reason === "agent_transfer" ||
    raw.call_type === "agent_transfer";

  // Check if call has transfer metadata but no actual completion
  if (hasTransfer && raw.call_status === "error") {
    findings.push(
      finding(
        "transfer_failed",
        "critical",
        "Transfer event exists but call ended in error",
        "agent_transfer was initiated but call_status=error. The transfer may not have completed.",
        null,
        { call_status: raw.call_status, disconnection_reason: raw.disconnection_reason },
      ),
    );
  }

  return findings;
}

function auditGibberish(turns) {
  const findings = [];

  for (let i = 0; i < turns.length; i++) {
    const t = turns[i];
    if (t.role !== "user") continue;

    const score = gibberishScore(t.content);
    if (score >= 0.6) {
      findings.push(
        finding(
          "gibberish_detected",
          "critical",
          `High gibberish score (${score.toFixed(2)}) in user turn ${i + 1}`,
          `User turn ${i + 1} (${t.wordCount} words) scored ${score.toFixed(2)} on gibberish heuristic. Possible ASR drift from foreign language.`,
          fmtTime(t.startMs),
          { turn: i + 1, score: +score.toFixed(2), word_count: t.wordCount },
        ),
      );
    } else if (score >= 0.4) {
      findings.push(
        finding(
          "gibberish_suspected",
          "warning",
          `Moderate gibberish score (${score.toFixed(2)}) in user turn ${i + 1}`,
          `User turn ${i + 1} (${t.wordCount} words) scored ${score.toFixed(2)}. May be accented speech or ASR artifact.`,
          fmtTime(t.startMs),
          { turn: i + 1, score: +score.toFixed(2), word_count: t.wordCount },
        ),
      );
    }
  }

  return findings;
}

function auditFlow(turns) {
  const findings = [];

  // Detect double-questioning: agent asks something user already answered.
  // Heuristic: if agent mentions "Postleitzahl" / "Kategorie" / "Dringlichkeit"
  // and user previously mentioned a plausible value, flag it.
  const fieldKeywords = [
    { field: "plz", agentPatterns: ["postleitzahl", "plz"], userPattern: /\b\d{4}\b/ },
    {
      field: "urgency",
      agentPatterns: ["dringlichkeit", "notfall", "dringend", "normal eingeplant"],
      userPattern: /\b(notfall|dringend|normal|emergency|urgent)\b/i,
    },
    {
      field: "category",
      agentPatterns: ["handelt es sich", "verstopfung", "leck oder"],
      userPattern:
        /\b(verstopf|leck|heizung|boiler|rohrbruch|sanitär|water|leak|heat|blockage|clog)\b/i,
    },
  ];

  for (const fk of fieldKeywords) {
    let userAnsweredAt = -1;
    let agentAskedAfterAt = -1;

    for (let i = 0; i < turns.length; i++) {
      const t = turns[i];
      if (t.role === "user" && fk.userPattern.test(t.content) && userAnsweredAt === -1) {
        userAnsweredAt = i;
      }
      if (
        t.role === "agent" &&
        userAnsweredAt >= 0 &&
        i > userAnsweredAt &&
        fk.agentPatterns.some((p) => t.content.toLowerCase().includes(p))
      ) {
        agentAskedAfterAt = i;
        break;
      }
    }

    if (agentAskedAfterAt > 0) {
      findings.push(
        finding(
          "double_question",
          "warning",
          `Agent re-asked '${fk.field}' in turn ${agentAskedAfterAt + 1} (user answered in turn ${userAnsweredAt + 1})`,
          `User provided ${fk.field}-related info in turn ${userAnsweredAt + 1}, but agent asked again in turn ${agentAskedAfterAt + 1}.`,
          fmtTime(turns[agentAskedAfterAt].startMs),
          {
            field: fk.field,
            user_turn: userAnsweredAt + 1,
            agent_turn: agentAskedAfterAt + 1,
          },
        ),
      );
    }
  }

  // Express check: did user provide 3+ field signals in turn 1 and agent still asked individually?
  const userTurn1 = turns.find((t) => t.role === "user");
  if (userTurn1) {
    let fieldsInTurn1 = 0;
    if (/\b\d{4}\b/.test(userTurn1.content)) fieldsInTurn1++; // PLZ
    if (
      /\b(verstopf|leck|heizung|boiler|rohrbruch|sanitär|water|leak|heat)\b/i.test(
        userTurn1.content,
      )
    )
      fieldsInTurn1++; // category
    if (/\b(notfall|dringend|normal|emergency|urgent)\b/i.test(userTurn1.content))
      fieldsInTurn1++; // urgency
    if (/\b(strasse|gasse|weg|platz|str\.)\b/i.test(userTurn1.content)) fieldsInTurn1++; // street

    if (fieldsInTurn1 >= 3) {
      // Count how many agent questions follow
      const agentQuestions = turns.filter(
        (t) => t.role === "agent" && t.content.includes("?"),
      ).length;
      if (agentQuestions > 3) {
        findings.push(
          finding(
            "express_ignored",
            "warning",
            `User provided ${fieldsInTurn1} fields in first turn but agent asked ${agentQuestions} questions`,
            `Caller gave substantial info upfront. Agent could have confirmed + filled gaps instead of full questionnaire.`,
            fmtTime(userTurn1.startMs),
            {
              fields_in_first_turn: fieldsInTurn1,
              agent_questions: agentQuestions,
            },
          ),
        );
      }
    }
  }

  return findings;
}

function auditExtraction(raw) {
  const findings = [];
  const analysis = raw.call_analysis?.custom_analysis_data ?? {};

  const required = ["plz", "city", "category", "urgency", "description"];
  const optional = ["street", "house_number"];

  for (const field of required) {
    const val = analysis[field];
    if (!val || (typeof val === "string" && val.trim().length === 0)) {
      findings.push(
        finding(
          "extraction_missing",
          "warning",
          `Required field '${field}' missing from extraction`,
          `custom_analysis_data.${field} is empty or absent.`,
          null,
          { field, present: false },
        ),
      );
    }
  }

  // Validate plz format (4 digits)
  const plz = analysis.plz;
  if (plz && !/^\d{4}$/.test(plz.trim())) {
    findings.push(
      finding(
        "extraction_invalid",
        "warning",
        `PLZ value is not 4 digits`,
        `Extracted PLZ does not match expected Swiss format (4 digits).`,
        null,
        { field: "plz", valid: false },
      ),
    );
  }

  // Validate urgency
  const urgency = analysis.urgency;
  if (urgency && !VALID_URGENCIES.includes(urgency.trim().toLowerCase())) {
    findings.push(
      finding(
        "extraction_invalid",
        "warning",
        `Urgency value not in allowlist`,
        `Extracted urgency is not one of: ${VALID_URGENCIES.join(", ")}.`,
        null,
        { field: "urgency", valid: false },
      ),
    );
  }

  // Validate category
  const cat = analysis.category;
  if (cat && !VALID_CATEGORIES.includes(cat.trim())) {
    findings.push(
      finding(
        "extraction_invalid",
        "warning",
        `Category value not in allowlist`,
        `Extracted category is not one of the 6 valid values.`,
        null,
        { field: "category", valid: false },
      ),
    );
  }

  // Report field presence for optional fields
  for (const field of optional) {
    const val = analysis[field];
    findings.push(
      finding(
        "extraction_info",
        "info",
        `Optional field '${field}': ${val && val.trim().length > 0 ? "present" : "absent"}`,
        `Optional extraction field status.`,
        null,
        { field, present: !!(val && val.trim().length > 0) },
      ),
    );
  }

  return findings;
}

function auditTiming(turns, raw) {
  const findings = [];

  const callDurationMs = raw.duration_ms
    ?? (raw.end_timestamp && raw.start_timestamp
      ? raw.end_timestamp - raw.start_timestamp
      : null);

  // Calculate talk time per role
  let agentTalkMs = 0;
  let userTalkMs = 0;
  for (const t of turns) {
    if (t.durationMs != null) {
      if (t.role === "agent") agentTalkMs += t.durationMs;
      else userTalkMs += t.durationMs;
    }
  }

  const totalTalkMs = agentTalkMs + userTalkMs;
  const agentRatio = totalTalkMs > 0 ? agentTalkMs / totalTalkMs : 0;

  if (agentRatio > 0.65) {
    findings.push(
      finding(
        "high_agent_ratio",
        "info",
        `Agent spoke ${(agentRatio * 100).toFixed(0)}% of total talk time`,
        `Agent dominated conversation. May indicate too many questions or long explanations.`,
        null,
        { agent_ratio: +agentRatio.toFixed(2), agent_talk_s: +(agentTalkMs / 1000).toFixed(1), user_talk_s: +(userTalkMs / 1000).toFixed(1) },
      ),
    );
  }

  // Transcript gaps: pauses > 5s between consecutive turns
  for (let i = 1; i < turns.length; i++) {
    const prev = turns[i - 1];
    const curr = turns[i];
    if (prev.endMs != null && curr.startMs != null) {
      const gapMs = curr.startMs - prev.endMs;
      if (gapMs > 5000) {
        findings.push(
          finding(
            "transcript_gap",
            "info",
            `${fmtMs(gapMs)} gap between turns ${i} and ${i + 1}`,
            `Transcript gap of ${fmtMs(gapMs)} between ${prev.role} turn ${i} and ${curr.role} turn ${i + 1}. May be silence, processing delay, or unrecognized speech.`,
            fmtTime(prev.endMs),
            { gap_ms: Math.round(gapMs), after_turn: i, before_turn: i + 1 },
          ),
        );
      }
    }
  }

  // Call too long
  if (callDurationMs != null && callDurationMs > 240000) {
    findings.push(
      finding(
        "call_too_long",
        "info",
        `Call duration ${fmtMs(callDurationMs)} exceeds 4min threshold`,
        `Standard intake should complete within 3-4 minutes.`,
        null,
        { duration_s: +(callDurationMs / 1000).toFixed(1) },
      ),
    );
  }

  return findings;
}

function checkAudioAvailability(raw) {
  const url = raw.recording_url ?? raw.audio_url ?? null;
  return {
    available: url != null && url.length > 0,
    // NEVER log the URL itself (signed URL contains auth token)
  };
}

// ── Main analyzer ────────────────────────────────────────────────────────

/**
 * Analyze a single call.
 * @param {object} raw - Full Retell get-call response
 * @returns {{ meta, turns, findings, audio, timing }}
 */
export function analyzeCall(raw) {
  const callId = raw.call_id ?? "unknown";
  const turns = extractTurns(raw);
  const audio = checkAudioAvailability(raw);

  const allFindings = [
    ...auditTriggers(turns, raw),
    ...auditTransfer(raw),
    ...auditGibberish(turns),
    ...auditFlow(turns),
    ...auditExtraction(raw),
    ...auditTiming(turns, raw),
  ];

  // Compute timing KPIs
  let agentTalkMs = 0;
  let userTalkMs = 0;
  let maxGapMs = 0;
  for (const t of turns) {
    if (t.durationMs != null) {
      if (t.role === "agent") agentTalkMs += t.durationMs;
      else userTalkMs += t.durationMs;
    }
  }
  for (let i = 1; i < turns.length; i++) {
    if (turns[i - 1].endMs != null && turns[i].startMs != null) {
      maxGapMs = Math.max(maxGapMs, turns[i].startMs - turns[i - 1].endMs);
    }
  }

  const callDurationMs = raw.duration_ms
    ?? (raw.end_timestamp && raw.start_timestamp
      ? raw.end_timestamp - raw.start_timestamp
      : null);

  const meta = {
    call_id_short: callId.slice(0, 12),
    agent_name: raw.agent_id ? `agent_${raw.agent_id.slice(0, 8)}` : "unknown",
    call_status: raw.call_status ?? "unknown",
    disconnection_reason: raw.disconnection_reason ?? "unknown",
    duration_s: callDurationMs != null ? +(callDurationMs / 1000).toFixed(1) : null,
    turn_count: turns.length,
    user_turns: turns.filter((t) => t.role === "user").length,
    agent_turns: turns.filter((t) => t.role === "agent").length,
  };

  const timing = {
    agent_talk_s: +(agentTalkMs / 1000).toFixed(1),
    user_talk_s: +(userTalkMs / 1000).toFixed(1),
    agent_ratio: agentTalkMs + userTalkMs > 0
      ? +((agentTalkMs / (agentTalkMs + userTalkMs)) * 100).toFixed(0)
      : null,
    max_gap_s: +(maxGapMs / 1000).toFixed(1),
    total_duration_s: meta.duration_s,
  };

  return { meta, turns, findings: allFindings, audio, timing };
}
