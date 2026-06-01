#!/usr/bin/env node
/**
 * BigBen Pub — Dedicated publisher for the EN+DE Retell agent pair.
 *
 * Why a dedicated script: BigBen is a Pub-Modul tenant with a single EN agent
 * (with DE swap), not the standard Sanitär DE+INTL pair. retell_sync.mjs
 * therefore does not apply.
 *
 * What it does:
 *   1. Reads the local source-of-truth prompt from retell/exports/bigben-pub_agent.json
 *      (general_prompt — pre-patched by bigben_voice_daily_refresh.mjs)
 *   2. Extracts TODAY'S DATE + UPCOMING EVENTS sections from local SoT
 *   3. Surgically patches the LIVE EN flow:
 *        - replaces the "CRITICAL FACTS" top block with a ═══ TODAY'S DATE ═══ block
 *        - replaces the existing UPCOMING EVENTS block
 *   4. Surgically patches the LIVE DE flow with a German variant
 *   5. Publishes both agents
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/bigben_publish.mjs
 *   node --env-file=src/web/.env.local scripts/_ops/bigben_publish.mjs --dry-run
 *
 * Env: RETELL_API_KEY (required)
 */

import { readFileSync } from "node:fs";

const API = "https://api.retellai.com";
const KEY = process.env.RETELL_API_KEY;
if (!KEY) {
  console.error("FATAL: RETELL_API_KEY not set. Run with: node --env-file=src/web/.env.local ...");
  process.exit(1);
}
const H = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const dryRun = process.argv.includes("--dry-run");

async function get(p) {
  const r = await fetch(API + p, { headers: H });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`GET ${p} ${r.status}: ${JSON.stringify(d)}`);
  return d;
}
async function patch(p, b) {
  const r = await fetch(API + p, { method: "PATCH", headers: H, body: JSON.stringify(b) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`PATCH ${p} ${r.status}: ${JSON.stringify(d)}`);
  return d;
}
async function post(p, b) {
  const r = await fetch(API + p, { method: "POST", headers: H, body: JSON.stringify(b) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`POST ${p} ${r.status}: ${JSON.stringify(d)}`);
  return d;
}

const SEP = "═══════════════════════════════════════";

// ── Extract a delimited block from the local SoT JSON.
//
// Block ends at the first of: next ═══ section, or "IMPORTANT RULES"
// (which is a non-═══ section header in the local prompt structure).
// Without the IMPORTANT RULES boundary the today block silently captures
// IMPORTANT RULES + PERSONA, which then get duplicated on every publish.
function extractLocalSection(prompt, header) {
  const startRe = new RegExp(`${SEP}\\s*\\n${header}.*?\\n${SEP}\\s*\\n`, "s");
  const m = prompt.match(startRe);
  if (!m) return null;
  const startIdx = m.index;
  const afterHeader = startIdx + m[0].length;

  const candidates = [
    prompt.indexOf(`\n${SEP}\n`, afterHeader),
    prompt.indexOf("\nIMPORTANT RULES", afterHeader),
    prompt.indexOf("\nPERSONA", afterHeader),
  ].filter((i) => i !== -1);

  const endIdx = candidates.length === 0 ? prompt.length : Math.min(...candidates);
  return prompt.slice(startIdx, endIdx).trimEnd();
}

// ── DE renderer: builds German versions of the date + events block
//    from the same data. We mirror the structure but localize the labels.
function buildDeBlocks(localPrompt) {
  // Extract dates from local TODAY'S DATE block
  // Format: "Today is Tuesday, 28 April 2026."  /  "Tomorrow is ..."
  const todayMatch = localPrompt.match(/Today is ([^.]+)\./);
  const tomorrowMatch = localPrompt.match(/Tomorrow is ([^.]+)\./);
  const weekendMatch = localPrompt.match(/'this weekend'.*?Saturday ([^.\n]+)/);
  const weekEndMatch = localPrompt.match(/This week ends ([^.]+)\./);

  const today = todayMatch?.[1]?.trim() ?? "";
  const tomorrow = tomorrowMatch?.[1]?.trim() ?? "";
  const weekEnd = weekEndMatch?.[1]?.trim() ?? "";
  const weekend = weekendMatch?.[1]?.trim() ?? "";

  // Translate weekday names if present
  const dayMap = { Monday: "Montag", Tuesday: "Dienstag", Wednesday: "Mittwoch", Thursday: "Donnerstag", Friday: "Freitag", Saturday: "Samstag", Sunday: "Sonntag" };
  const monthMap = { January: "Januar", February: "Februar", March: "März", April: "April", May: "Mai", June: "Juni", July: "Juli", August: "August", September: "September", October: "Oktober", November: "November", December: "Dezember" };
  function toDe(s) {
    if (!s) return s;
    let out = s;
    for (const [en, de] of Object.entries(dayMap)) out = out.replaceAll(en, de);
    for (const [en, de] of Object.entries(monthMap)) out = out.replaceAll(en, de);
    return out;
  }

  const todayDe = toDe(today);
  const tomorrowDe = toDe(tomorrow);
  const weekEndDe = toDe(weekEnd);
  const weekendDe = toDe(weekend);

  const todayBlock = `${SEP}
HEUTIGES DATUM — IMMER NUTZEN, NIE RATEN
${SEP}

Heute ist ${todayDe}.
Morgen ist ${tomorrowDe}.
Diese Woche endet am ${weekEndDe}.

Wenn ein Anrufer "heute" sagt → ${todayDe}.
Wenn ein Anrufer "morgen" sagt → ${tomorrowDe}.
Wenn ein Anrufer "dieses Wochenende" sagt → Samstag ${weekendDe}.

NIEMALS Daten vor heute referenzieren — die liegen in der Vergangenheit.
NIEMALS ein Datum erfinden — nur die Eventliste unten oder relativ zu heute berechnen.

AUSSPRACHE — Daten so sagen wie Menschen sprechen, nicht wie geschrieben:
- "Sonntag, der 3. Mai" oder "Sonntag, 3. Mai" — NIEMALS "null drei Mai" oder "0 3 Mai".
- "Mittwoch, der 29. April" oder "29. April" — NIEMALS "zwei neun April".
- Uhrzeiten: "neunzehn Uhr" oder "sieben Uhr abends" — natürlich aussprechen.`;

  // Extract the UPCOMING EVENTS section verbatim (English content is fine — Lisa-DE
  // can read English event titles; the surrounding header is German).
  const eventsEn = extractLocalSection(localPrompt, "UPCOMING EVENTS");
  const eventsBody = eventsEn
    ? eventsEn.split(`${SEP}\n`).slice(2).join(`${SEP}\n`).trim()
    : "";
  const eventsBlock = `${SEP}
KOMMENDE EVENTS
${SEP}

${eventsBody}`;

  return { todayBlock, eventsBlock };
}

// ── Deep-clean live patcher.
//
// Strategy: anchor on the FIRST ═══ section header that we know is canonical
// (PUB INFORMATION / RESERVATIONS / WHAT WE OFFER). Everything before that
// anchor — duplicates, corrupted blocks, garbage from earlier buggy runs —
// gets wiped and rebuilt from local SoT. Then insert/replace events block
// in front of RESERVATIONS.
//
// Result is fully idempotent: no matter what state the live prompt is in,
// the output is exactly one today block + one rules+persona block + the
// canonical sections + one events block + RESERVATIONS onward.
function patchLivePrompt(livePrompt, todayBlock, rulesBlock, eventsBlock, lang) {
  let p = livePrompt;

  // Step 1 — find the canonical anchor: first ═══ followed by PUB INFORMATION.
  // This is the boundary between "header content" (today, rules, persona —
  // which we rebuild) and "stable body" (pub info, what we offer, etc.).
  const anchorRe = new RegExp(`\\n${SEP}\\s*\\nPUB INFORMATION`);
  const anchorMatch = p.match(anchorRe);
  if (!anchorMatch || anchorMatch.index == null) {
    console.warn(`  ⚠ ${lang.toUpperCase()}: PUB INFORMATION anchor not found — falling back to bare prepend`);
    return todayBlock + "\n\n" + rulesBlock + "\n\n" + p;
  }

  // Step 2 — wipe everything before the anchor, rebuild from local blocks.
  // Live prompt's first line (intro: "You are the digital assistant...") is
  // kept by re-extracting it from the local SoT prompt (always line 0).
  const intro = "You are the digital assistant for Big Ben Pub in Oberrieden, Switzerland.";
  const introLine = lang === "en"
    ? `${intro} You answer calls in English by default.`
    : `${intro} Du beantwortest Anrufe auf Deutsch.`;

  const rebuilt = [
    introLine,
    "",
    todayBlock,
    "",
    rulesBlock,
    "",
  ].join("\n");

  p = rebuilt + p.slice(anchorMatch.index + 1); // +1 to keep the leading newline

  // Step 2b — G11 Voice-Purist: scrub hardcoded event/sport claims from
  // STATIC sections (Opening Hours, WHAT WE OFFER, NO-GO's). Without this
  // the live prompt advertises "Quiz Night every Wednesday" / "Karaoke
  // every Friday" etc. even though those events aren't in pub_events.
  // Caller asks → Lisa promises → Paul can't deliver → trust broken. G11.
  // Idempotent — re-running this is a no-op once already clean.
  p = p.replace(/Wednesday: 16:00–23:00 \(Quiz Night!\)/g, "Wednesday: 16:00–23:00");
  p = p.replace(/Friday: 16:00–00:00 \(Karaoke Night!\)/g, "Friday: 16:00–00:00");
  p = p.replace(/Saturday: 16:00–00:00 \(Live Sport \+ Live Music!\)/g, "Saturday: 16:00–00:00");
  p = p.replace(/Sunday: 16:00–22:00 \(Relaxed Sunday\)/g, "Sunday: 16:00–22:00");
  p = p.replace(
    /- Live Sport on big screens: Premier League, Champions League, Rugby, F1\n/g,
    "- Live Sport on big screens (check what's on with Paul or in the upcoming events list)\n",
  );
  p = p.replace(
    /- Events: Quiz Night \(Wed\), Karaoke \(Fri\), Live Music \(Sat\)\n/g,
    "- Events: changing programme — see the upcoming events list below for what's actually scheduled\n",
  );
  p = p.replace(
    "- NEVER invent events or matches that aren't in the events list",
    "- NEVER invent events, matches or theme nights that aren't in the upcoming events list. NEVER claim weekly recurrings (e.g. 'every Wednesday') unless that exact event is currently scheduled. If asked about something not in the list, say it's not currently scheduled and offer to take a callback for Paul.",
  );

  // Step 3 — strip ALL existing UPCOMING/KOMMENDE EVENTS blocks
  const stripEventsRe = new RegExp(
    `${SEP}\\s*\\n(?:UPCOMING EVENTS|KOMMENDE EVENTS)[^\\n]*\\n${SEP}\\s*\\n[\\s\\S]*?(?=${SEP}\\s*\\n[A-ZÄÖÜ])`,
    "g",
  );
  let stripped = 0;
  p = p.replace(stripEventsRe, () => {
    stripped += 1;
    return "";
  });
  if (stripped > 0) {
    console.log(`  · ${lang.toUpperCase()}: stripped ${stripped} existing events block(s)`);
  }

  // Step 4 — insert clean events block before RESERVATIONS / RESERVIERUNGEN
  const reservationsRe = new RegExp(`${SEP}\\s*\\n(?:RESERVATIONS|RESERVIERUNGEN)`);
  const resMatch = p.match(reservationsRe);
  if (resMatch && resMatch.index != null) {
    p = p.slice(0, resMatch.index) + eventsBlock + "\n\n" + p.slice(resMatch.index);
  } else {
    console.warn(`  ⚠ ${lang.toUpperCase()}: RESERVATIONS section not found — appending events at end`);
    p = p + "\n\n" + eventsBlock;
  }

  return p;
}

// ── Ensure a body section is present in the live prompt.
//
// The publish flow preserves the LIVE body verbatim (PUB INFORMATION onward).
// When we add a new structural section to local SoT — e.g. CALLBACK REQUESTS —
// it only reaches LIVE on the first run after the section was added. After
// that the section is already present and we leave it untouched (idempotent).
//
// Lang-aware: insert the canonical EN section into both EN and DE flows. The
// LLM follows English instructions in either language because of the agent's
// language setting; this matches how the existing reservation flow works.
function ensureBodySection(prompt, sectionHeader, sectionBody, anchorBefore) {
  const present = new RegExp(`${SEP}\\s*\\n${sectionHeader}`).test(prompt);
  if (present) return prompt;

  const anchorRe = new RegExp(`${SEP}\\s*\\n${anchorBefore}`);
  const m = prompt.match(anchorRe);
  if (!m || m.index == null) {
    // Anchor missing — append at end as a last resort. Better than silent loss.
    return prompt + "\n\n" + sectionBody.trim() + "\n";
  }
  return prompt.slice(0, m.index) + sectionBody.trim() + "\n\n" + prompt.slice(m.index);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const local = JSON.parse(readFileSync("retell/exports/bigben-pub_agent.json", "utf-8"));
  const sourcePrompt = local.general_prompt;

  const todayBlockEn = extractLocalSection(sourcePrompt, "TODAY'S DATE");
  const eventsBlockEn = extractLocalSection(sourcePrompt, "UPCOMING EVENTS");
  const callbackBlock = extractLocalSection(sourcePrompt, "CALLBACK REQUESTS");
  if (!todayBlockEn || !eventsBlockEn) {
    console.error("FATAL: TODAY'S DATE / UPCOMING EVENTS missing in local JSON.");
    process.exit(2);
  }
  if (!callbackBlock) {
    console.warn("  ⚠ CALLBACK REQUESTS missing in local JSON — feature will not be active");
  }
  // Strip trailing blank line if present
  const todayEn = todayBlockEn.trimEnd();
  const eventsEn = eventsBlockEn.trimEnd();

  // Extract the canonical IMPORTANT RULES + PERSONA block from local SoT.
  // We use this as the authoritative source when reconstructing live prompts —
  // older live prompts may have duplicated copies from buggy earlier runs.
  const rulesIdx = sourcePrompt.indexOf("\nIMPORTANT RULES");
  const firstSepAfterRules = sourcePrompt.indexOf(`\n${SEP}`, rulesIdx);
  if (rulesIdx === -1 || firstSepAfterRules === -1) {
    console.error("FATAL: IMPORTANT RULES section missing in local JSON.");
    process.exit(2);
  }
  const rulesBlockEn = sourcePrompt.slice(rulesIdx + 1, firstSepAfterRules).trimEnd();

  const { todayBlock: todayDe, eventsBlock: eventsDe } = buildDeBlocks(sourcePrompt);

  console.log(`Local blocks ready: today_en=${todayEn.length}c, events_en=${eventsEn.length}c, today_de=${todayDe.length}c, events_de=${eventsDe.length}c`);

  const ids = JSON.parse(readFileSync("retell/agent_ids.json", "utf-8"))["bigben-pub"];
  if (!ids?.en_flow_id || !ids?.de_flow_id || !ids?.en_agent_id || !ids?.de_agent_id) {
    console.error("FATAL: bigben-pub IDs missing in retell/agent_ids.json");
    process.exit(2);
  }
  console.log(`Agents: EN=${ids.en_agent_id}  DE=${ids.de_agent_id}`);
  console.log(`Flows : EN=${ids.en_flow_id}  DE=${ids.de_flow_id}\n`);

  for (const lang of ["en", "de"]) {
    const flowId = ids[`${lang}_flow_id`];
    const agentId = ids[`${lang}_agent_id`];
    const today = lang === "en" ? todayEn : todayDe;
    const events = lang === "en" ? eventsEn : eventsDe;
    // For DE we use the same canonical EN rules block — it contains LLM
    // instructions which Lisa-DE follows the same way; the agent's language
    // setting handles the actual response language.
    const rules = rulesBlockEn;

    console.log(`━━━ ${lang.toUpperCase()} flow ${flowId} ━━━`);
    const flow = await get(`/get-conversation-flow/${flowId}`);
    const before = flow.global_prompt ?? "";
    let after = patchLivePrompt(before, today, rules, events, lang);
    // Ensure the new structural CALLBACK section is in the live prompt.
    // First publish after add → injection. Every following run → no-op.
    if (callbackBlock) {
      after = ensureBodySection(after, "CALLBACK REQUESTS", callbackBlock, "PRICES");
    }
    console.log(`  prompt: ${before.length}c → ${after.length}c (Δ${after.length - before.length})`);

    if (dryRun) {
      console.log(`  [dry-run] would PATCH /update-conversation-flow/${flowId}`);
      // Print first 300 chars of patched prompt for visual check
      console.log(`  preview: ${after.slice(0, 300).replace(/\n/g, " | ")}`);
    } else {
      await patch(`/update-conversation-flow/${flowId}`, { global_prompt: after });
      console.log(`  ✓ flow patched`);
      await post(`/publish-agent/${agentId}`, {});
      console.log(`  ✓ agent published`);
    }
    console.log("");
  }

  if (!dryRun) {
    console.log("━━━ Unpin phone numbers ━━━");
    try {
      const _pn = await get("/v2/list-phone-numbers");  // v2: { items, ... }
      const phones = _pn.items ?? _pn;
      for (const p of phones) {
        if ((p.inbound_agent_id === ids.en_agent_id || p.inbound_agent_id === ids.de_agent_id) && p.inbound_agent_version != null) {
          await patch(`/update-phone-number/${encodeURIComponent(p.phone_number)}`, {
            inbound_agent_id: p.inbound_agent_id,
          });
          console.log(`  ✓ ${p.phone_number} unpinned (was v${p.inbound_agent_version})`);
        }
      }
    } catch (e) {
      console.log(`  ⚠ Could not unpin phone numbers: ${e.message}`);
    }
    console.log("");

    // ── Post-publish verification ──────────────────────────────────────
    // Re-fetch both flows and assert today's date string is in each prompt.
    // Without this we'd never notice if a publish silently kept yesterday's
    // copy (Retell caching / partial updates / etc.).
    console.log("━━━ Post-publish verification ━━━");
    const todayStr = todayEn.match(/Today is ([^.]+)\./)?.[1]?.trim() ?? "";
    const todayDeStr = todayDe.match(/Heute ist ([^.]+)\./)?.[1]?.trim() ?? "";
    if (!todayStr || !todayDeStr) {
      console.error(`  ✗ Could not derive today's date string for verification`);
      process.exit(4);
    }
    for (const lang of ["en", "de"]) {
      const flowId = ids[`${lang}_flow_id`];
      const expected = lang === "en" ? todayStr : todayDeStr;
      const live = await get(`/get-conversation-flow/${flowId}`);
      const livePrompt = live.global_prompt ?? "";
      if (!livePrompt.includes(expected)) {
        console.error(`  ✗ ${lang.toUpperCase()} flow does NOT contain "${expected}" — publish FAILED to take effect`);
        console.error(`    live prompt head: ${livePrompt.slice(0, 200)}`);
        process.exit(5);
      }
      console.log(`  ✓ ${lang.toUpperCase()} flow verified contains "${expected}"`);
    }
    console.log("");
  }

  console.log(`✓ BigBen voice ${dryRun ? "(dry-run)" : "PUBLISHED LIVE + VERIFIED"} at ${new Date().toISOString()}`);
}

main().catch((e) => {
  console.error(`\nFATAL: ${e.message}\n`);
  process.exit(1);
});
