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

// ── EN extractor: pulls the TODAY'S DATE + UPCOMING EVENTS blocks
//    from the local source-of-truth JSON (already patched by daily_refresh).
function extractLocalSection(prompt, header) {
  const startRe = new RegExp(`${SEP}\\s*\\n${header}.*?\\n${SEP}\\s*\\n`, "s");
  const m = prompt.match(startRe);
  if (!m) return null;
  const startIdx = m.index;
  const afterHeader = startIdx + m[0].length;
  const nextSep = prompt.indexOf(`\n${SEP}\n`, afterHeader);
  const endIdx = nextSep === -1 ? prompt.length : nextSep + 1;
  return prompt.slice(startIdx, endIdx);
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
NIEMALS ein Datum erfinden — nur die Eventliste unten oder relativ zu heute berechnen.`;

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

// ── Live patcher: surgically replace top-of-prompt "CRITICAL FACTS"
//    block + the existing UPCOMING EVENTS block, regardless of formatting.
function patchLivePrompt(livePrompt, todayBlock, eventsBlock, lang) {
  let p = livePrompt;

  // Replace top block: either "CRITICAL FACTS:" (EN) / "CRITICAL: HEUTE ist" (DE)
  //    The block runs from start of prompt up to (but not including) "IMPORTANT RULES".
  // We anchor on either marker, then everything before "IMPORTANT RULES" is replaced.
  const topAnchorEn = /^CRITICAL FACTS:[\s\S]*?(?=\nIMPORTANT RULES)/m;
  const topAnchorDe = /^CRITICAL: HEUTE[\s\S]*?(?=\nIMPORTANT RULES)/m;
  const newTop = todayBlock; // no trailing newline — caller will keep \nIMPORTANT RULES

  if (lang === "en" && topAnchorEn.test(p)) {
    p = p.replace(topAnchorEn, newTop);
  } else if (lang === "de" && topAnchorDe.test(p)) {
    p = p.replace(topAnchorDe, newTop);
  } else if (/^TODAY is /m.test(p)) {
    p = p.replace(/^[\s\S]*?(?=\nIMPORTANT RULES)/m, newTop);
  } else {
    console.warn(`  ⚠ ${lang.toUpperCase()}: top date block not found — prepending`);
    p = newTop + "\n\n" + p;
  }

  // Replace UPCOMING EVENTS section: from `═══` + UPCOMING EVENTS up to next `═══`
  const evRe = new RegExp(`${SEP}\\s*\\n(?:UPCOMING EVENTS|KOMMENDE EVENTS).*?\\n${SEP}\\s*\\n[\\s\\S]*?(?=${SEP}\\s*\\n(?:RESERVATIONS|RESERVIERUNGEN))`, "s");
  if (evRe.test(p)) {
    p = p.replace(evRe, eventsBlock + "\n\n");
  } else {
    console.warn(`  ⚠ ${lang.toUpperCase()}: UPCOMING EVENTS section not found — skipping events update`);
  }

  return p;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const local = JSON.parse(readFileSync("retell/exports/bigben-pub_agent.json", "utf-8"));
  const sourcePrompt = local.general_prompt;

  const todayBlockEn = extractLocalSection(sourcePrompt, "TODAY'S DATE");
  const eventsBlockEn = extractLocalSection(sourcePrompt, "UPCOMING EVENTS");
  if (!todayBlockEn || !eventsBlockEn) {
    console.error("FATAL: TODAY'S DATE / UPCOMING EVENTS missing in local JSON.");
    process.exit(2);
  }
  // Strip trailing blank line if present
  const todayEn = todayBlockEn.trimEnd();
  const eventsEn = eventsBlockEn.trimEnd();

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

    console.log(`━━━ ${lang.toUpperCase()} flow ${flowId} ━━━`);
    const flow = await get(`/get-conversation-flow/${flowId}`);
    const before = flow.global_prompt ?? "";
    const after = patchLivePrompt(before, today, events, lang);
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
      const phones = await get("/list-phone-numbers");
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
  }

  console.log(`✓ BigBen voice ${dryRun ? "(dry-run)" : "PUBLISHED LIVE"} at ${new Date().toISOString()}`);
}

main().catch((e) => {
  console.error(`\nFATAL: ${e.message}\n`);
  process.exit(1);
});
