// scripts/chains/voice/correlate.mjs
// Correlator: merge WhisperX words + Retell events → correlation findings
//
// Usage (module):
//   import { correlateCall } from "./correlate.mjs";
//   const result = correlateCall(raw, whisperWords, callDir);

import { readFileSync, writeFileSync } from "fs";

// ── Trigger keywords for WhisperX-based detection ───────────────────────
// Broader than Retell-side: WhisperX transcribes actual speech, not ASR garble.
// Grouped by language for attribution.

const WHISPER_TRIGGERS = {
  en: [
    "english",
    "englisch",
    "hello",
    "hi there",
    "please",
    "sorry",
    "help",
    "water",
    "leak",
    "bathroom",
    "kitchen",
    "toilet",
    "emergency",
    "pipe",
    "broken",
    "i have",
    "can you",
    "do you",
    "speak english",
    "don't speak german",
    "excuse me",
  ],
  fr: [
    "français",
    "francais",
    "french",
    "bonjour",
    "bonsoir",
    "s'il vous plaît",
    "aide",
    "aidez",
    "j'ai",
    "fuite",
    "salle de bain",
    "cuisine",
    "toilettes",
    "urgence",
    "tuyau",
    "excusez",
    "je ne parle pas",
    "parlez-vous",
    "oui",
  ],
  it: [
    "italiano",
    "italian",
    "buongiorno",
    "buonasera",
    "aiuto",
    "ho un",
    "perdita",
    "bagno",
    "cucina",
    "emergenza",
    "tubo",
    "scusi",
    "non parlo tedesco",
  ],
};

// Flatten all triggers for quick scanning
const ALL_TRIGGERS = [];
for (const [lang, keywords] of Object.entries(WHISPER_TRIGGERS)) {
  for (const kw of keywords) {
    ALL_TRIGGERS.push({ keyword: kw, lang });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Build agent speech windows from Retell transcript_object.
 * Single-channel audio mixes agent+user — we need these to filter
 * out triggers spoken BY the agent (false positives).
 */
function buildAgentWindows(retellTurns) {
  const windows = [];
  for (const t of retellTurns) {
    if (t.role !== "agent") continue;
    const ws = t.words ?? [];
    if (ws.length === 0) continue;
    const start = ws[0].start ?? ws[0].start_timestamp ?? null;
    const last = ws[ws.length - 1];
    const end = last.end ?? last.end_timestamp ?? null;
    if (start != null && end != null) {
      windows.push({ start, end });
    }
  }
  return windows;
}

/**
 * Check if a timestamp falls within any agent speech window.
 */
function isInAgentWindow(timeSec, agentWindows, bufferS = 0.5) {
  for (const w of agentWindows) {
    if (timeSec >= w.start - bufferS && timeSec <= w.end + bufferS) {
      return true;
    }
  }
  return false;
}

/**
 * Scan WhisperX words for trigger keywords.
 * Returns detections with timestamps.
 * Marks triggers as agent_spoken if they fall within agent speech windows.
 */
function findTriggerWords(words, agentWindows = []) {
  const detections = [];
  const fullText = words.map((w) => w.word).join(" ").toLowerCase();

  for (const { keyword, lang } of ALL_TRIGGERS) {
    let searchFrom = 0;
    while (true) {
      const idx = fullText.indexOf(keyword, searchFrom);
      if (idx === -1) break;
      searchFrom = idx + 1;

      // Find the word(s) that contain this match by character position
      let charPos = 0;
      let matchStart = null;
      let matchEnd = null;

      for (const w of words) {
        const wordLen = w.word.length + 1; // +1 for space
        if (charPos + wordLen > idx && matchStart === null) {
          matchStart = w.start;
        }
        if (charPos >= idx + keyword.length && matchEnd === null) {
          matchEnd = w.end ?? w.start;
          break;
        }
        charPos += wordLen;
      }

      // Fallback: use word closest to match position
      if (matchStart === null && words.length > 0) {
        const ratio = idx / Math.max(fullText.length, 1);
        const wordIdx = Math.min(
          Math.floor(ratio * words.length),
          words.length - 1,
        );
        matchStart = words[wordIdx].start;
        matchEnd = words[wordIdx].end;
      }

      detections.push({
        keyword,
        lang,
        start_s: matchStart,
        end_s: matchEnd,
        confidence: words.find(
          (w) =>
            w.start === matchStart &&
            w.word.toLowerCase().includes(keyword.split(" ")[0]),
        )?.score ?? null,
        agent_spoken: isInAgentWindow(matchStart, agentWindows),
      });
    }
  }

  // Deduplicate: same keyword within 1s window
  const deduped = [];
  for (const d of detections) {
    const isDupe = deduped.some(
      (prev) =>
        prev.keyword === d.keyword &&
        Math.abs((prev.start_s ?? 0) - (d.start_s ?? 0)) < 1.0,
    );
    if (!isDupe) deduped.push(d);
  }

  return deduped;
}

/**
 * Extract Retell transfer events from tool_calls.
 */
function getTransferEvents(raw) {
  const toolCalls = raw.tool_calls ?? [];
  const events = [];

  for (const tc of toolCalls) {
    if (
      tc.name === "swap_to_intl_agent" ||
      tc.type === "transfer_call" ||
      tc.name === "end_call"
    ) {
      events.push({
        name: tc.name,
        type: tc.type ?? tc.name,
        time_s: tc.start_time_sec ?? null,
      });
    }
  }

  // Also check disconnection reason
  if (raw.disconnection_reason === "agent_transfer") {
    events.push({
      name: "agent_transfer",
      type: "disconnection",
      time_s: raw.duration_ms ? raw.duration_ms / 1000 : null,
    });
  }

  return events;
}

/**
 * Find regions where WhisperX has words but Retell transcript is empty/inaudible.
 */
function findSpeechGaps(whisperWords, retellTurns) {
  const gaps = [];

  for (const turn of retellTurns) {
    if (turn.role !== "user") continue;

    const content = turn.content ?? "";
    const isEmpty =
      content.trim().length === 0 ||
      content.includes("(inaudible") ||
      content.includes("(unhörbar");

    if (!isEmpty) continue;

    // Find WhisperX words in this turn's time window
    const turnStartS =
      turn.words?.[0]?.start ?? (turn.startMs ? turn.startMs / 1000 : null);
    const turnEndS =
      turn.words?.[turn.words.length - 1]?.end ??
      (turn.endMs ? turn.endMs / 1000 : null);

    if (turnStartS == null || turnEndS == null) continue;

    // Allow 2s buffer around the turn
    const whisperInWindow = whisperWords.filter(
      (w) => w.start >= turnStartS - 2 && w.end <= turnEndS + 2,
    );

    if (whisperInWindow.length > 0) {
      gaps.push({
        retell_turn_start_s: turnStartS,
        retell_turn_end_s: turnEndS,
        retell_content: content,
        whisper_words: whisperInWindow.map((w) => w.word).join(" "),
        whisper_word_count: whisperInWindow.length,
      });
    }
  }

  return gaps;
}

// ── Main correlator ─────────────────────────────────────────────────────

/**
 * Correlate WhisperX transcription with Retell call data.
 *
 * @param {object} raw - Full Retell get-call response
 * @param {Array<{word, start, end, score}>} whisperWords - WhisperX words.json
 * @param {string} callDir - Output directory for correlation.json
 * @returns {{ findings: Array, triggerDetections: Array, transferEvents: Array, speechGaps: Array }}
 */
export function correlateCall(raw, whisperWords, callDir) {
  const findings = [];
  const callId = (raw.call_id ?? "unknown").slice(0, 12);

  // 1. Build agent speech windows for false-positive filtering
  const retellTurns = raw.transcript_object ?? [];
  const agentWindows = buildAgentWindows(retellTurns);

  // 2. Detect triggers in WhisperX output (with agent-speech tagging)
  const triggerDetections = findTriggerWords(whisperWords, agentWindows);

  // 3. Get Retell transfer events
  const transferEvents = getTransferEvents(raw);
  const hasTransfer =
    raw.disconnection_reason === "agent_transfer" ||
    transferEvents.some(
      (e) => e.name === "swap_to_intl_agent" || e.type === "transfer_call",
    );

  // 4. Correlate triggers with transfers
  const TRANSFER_WINDOW_S = 5.0; // transfer should happen within 5s of trigger

  for (const det of triggerDetections) {
    // Skip agent-spoken triggers (false positives from single-channel audio)
    if (det.agent_spoken) {
      findings.push({
        category: "trigger_agent_spoken",
        severity: "info",
        title: `'${det.keyword}' [${det.lang}] @ ${det.start_s?.toFixed(1)}s — agent speech (filtered)`,
        detail: `Trigger keyword detected in agent speech window. Not a caller trigger — filtered out.`,
        timestamp_s: det.start_s,
        evidence: {
          keyword: det.keyword,
          lang: det.lang,
          trigger_time_s: det.start_s,
          agent_spoken: true,
        },
      });
      continue;
    }

    const triggerTime = det.start_s ?? 0;

    // Find closest transfer event after trigger
    const matchingTransfer = transferEvents.find(
      (e) =>
        (e.name === "swap_to_intl_agent" || e.type === "transfer_call") &&
        e.time_s != null &&
        e.time_s >= triggerTime &&
        e.time_s - triggerTime <= TRANSFER_WINDOW_S,
    );

    if (matchingTransfer) {
      findings.push({
        category: "trigger_heard_transfer_ok",
        severity: "pass",
        title: `WhisperX heard '${det.keyword}' [${det.lang}] @ ${det.start_s?.toFixed(1)}s → transfer @ ${matchingTransfer.time_s?.toFixed(1)}s`,
        detail: `Trigger detected by WhisperX and transfer occurred within ${TRANSFER_WINDOW_S}s window.`,
        timestamp_s: det.start_s,
        evidence: {
          keyword: det.keyword,
          lang: det.lang,
          trigger_time_s: det.start_s,
          transfer_time_s: matchingTransfer.time_s,
          latency_s: matchingTransfer.time_s - triggerTime,
        },
      });
    } else if (!hasTransfer) {
      findings.push({
        category: "trigger_heard_no_transfer",
        severity: "critical",
        title: `WhisperX heard '${det.keyword}' [${det.lang}] @ ${det.start_s?.toFixed(1)}s — NO transfer`,
        detail: `Trigger keyword detected in caller audio but no agent_transfer event found.`,
        timestamp_s: det.start_s,
        evidence: {
          keyword: det.keyword,
          lang: det.lang,
          trigger_time_s: det.start_s,
          transfer_event: false,
        },
      });
    }
  }

  // 5. Speech gaps: WhisperX heard words where Retell had nothing
  const speechGaps = findSpeechGaps(whisperWords, retellTurns);

  for (const gap of speechGaps) {
    findings.push({
      category: "speech_no_transcript",
      severity: "warning",
      title: `WhisperX heard "${gap.whisper_words.slice(0, 50)}" where Retell had "${gap.retell_content}"`,
      detail: `${gap.whisper_word_count} words detected by WhisperX in a region where Retell's transcript was empty or inaudible.`,
      timestamp_s: gap.retell_turn_start_s,
      evidence: {
        whisper_text: gap.whisper_words,
        retell_content: gap.retell_content,
        window_start_s: gap.retell_turn_start_s,
        window_end_s: gap.retell_turn_end_s,
      },
    });
  }

  // 6. Inaudible start: first 3s of audio
  const earlyWords = whisperWords.filter((w) => w.start <= 3.0);
  const earlyLowConf = earlyWords.filter((w) => w.score < 0.3);
  if (earlyWords.length === 0 || earlyLowConf.length === earlyWords.length) {
    findings.push({
      category: "inaudible_start",
      severity: "info",
      title: `First 3s: ${earlyWords.length === 0 ? "no words detected" : "all words low confidence"}`,
      detail: `Audio start may have connection noise or silence.`,
      timestamp_s: 0,
      evidence: {
        early_word_count: earlyWords.length,
        early_low_conf_count: earlyLowConf.length,
      },
    });
  }

  // 7. Overlap hint: user words during agent turn windows
  const agentWindowsForOverlap = retellTurns
    .filter((t) => t.role === "agent" && t.words?.length > 0)
    .map((t) => ({
      start: t.words[0].start,
      end: t.words[t.words.length - 1].end,
    }));

  let overlapCount = 0;
  for (const w of whisperWords) {
    for (const aw of agentWindowsForOverlap) {
      if (w.start >= aw.start && w.start <= aw.end) {
        overlapCount++;
        break;
      }
    }
  }

  if (overlapCount > 2) {
    findings.push({
      category: "overlap_hint",
      severity: "info",
      title: `${overlapCount} WhisperX words overlap with agent speech windows`,
      detail: `Possible crosstalk or barge-in detected.`,
      timestamp_s: null,
      evidence: { overlap_word_count: overlapCount },
    });
  }

  // Write correlation.json
  const correlation = {
    call_id_short: callId,
    whisper_word_count: whisperWords.length,
    trigger_detections: triggerDetections,
    transfer_events: transferEvents,
    speech_gaps: speechGaps,
    findings,
    summary: {
      triggers_found: triggerDetections.length,
      transfers_found: transferEvents.filter(
        (e) => e.name === "swap_to_intl_agent" || e.type === "transfer_call",
      ).length,
      speech_gaps_found: speechGaps.length,
      critical_count: findings.filter((f) => f.severity === "critical").length,
      warning_count: findings.filter((f) => f.severity === "warning").length,
    },
  };

  writeFileSync(
    `${callDir}/correlation.json`,
    JSON.stringify(correlation, null, 2) + "\n",
  );

  return correlation;
}
