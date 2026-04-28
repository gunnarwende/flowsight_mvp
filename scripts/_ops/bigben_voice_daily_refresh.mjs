#!/usr/bin/env node
// bigben_voice_daily_refresh.mjs
//
// Aktualisiert den BigBen-Voice-Agent-Prompt täglich:
//   1. Setzt heutiges + morgiges Datum prominent in den Prompt
//   2. Filtert Events-Liste auf zukünftige Events (heute + 14 Tage)
//   3. Generiert weekly recurring events automatisch (Quiz Mi, Karaoke Fr, Live Music Sa)
//   4. Pusht zu Retell API (publish)
//
// Workflow:
//   - Liest pub_events aus DB (für die nächsten 14 Tage)
//   - Liest aktuelles Prompt-Template
//   - Ersetzt zwei Sektionen: TODAY'S DATE + UPCOMING EVENTS
//   - Schreibt zurück nach retell/exports/bigben-pub_agent.json (+ _de.json)
//   - Ruft retell_sync.mjs auf zum Publishen
//
// Usage:
//   node --env-file=src/web/.env.local scripts/_ops/bigben_voice_daily_refresh.mjs
//   node --env-file=src/web/.env.local scripts/_ops/bigben_voice_daily_refresh.mjs --dry-run
//
// Cron (für GitHub Actions):
//   0 5 * * *  (täglich 05:00 UTC = 06:00 CH-Zeit)

import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const SLUG = "bigben-pub";
// scripts/_ops/<this file>  →  ../.. = repo root.
// Use fileURLToPath for cross-platform correctness (the regex hack to strip
// a leading slash from URL pathnames silently broke on Linux runners).
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const AGENT_PATHS = {
  en: path.join(REPO_ROOT, "retell", "exports", "bigben-pub_agent.json"),
};

const DAYS_AHEAD = 14;

// ─── Datum-Helpers ───────────────────────────────────────────────────────────
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// No leading zero on the day number — Retell's TTS reads "03 May" as
// "zero three may" instead of "May third" / "third of May". Plain "3 May"
// gets pronounced naturally.
function fmtFull(d) {
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtShort(d) {
  return `${DAY_NAMES[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = addDays(today, 1);
const weekEnd = addDays(today, 6);
const horizonEnd = addDays(today, DAYS_AHEAD);

console.log(`BigBen Voice Daily Refresh:`);
console.log(`  today: ${fmtFull(today)}`);
console.log(`  horizon: ${fmtFull(horizonEnd)}`);
console.log(`  dry-run: ${dryRun}\n`);

// ─── DB lesen ────────────────────────────────────────────────────────────────
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: tenant } = await sb.from("tenants").select("id").eq("slug", SLUG).single();
if (!tenant) { console.error("✗ tenant not found"); process.exit(2); }

const { data: dbEvents } = await sb
  .from("pub_events")
  .select("category, title, event_date, event_time, recurring, recurring_day")
  .eq("tenant_id", tenant.id)
  .eq("is_active", true)
  .gte("event_date", today.toISOString().split("T")[0])
  .lte("event_date", horizonEnd.toISOString().split("T")[0])
  .order("event_date")
  .order("event_time");

console.log(`DB events in horizon: ${dbEvents?.length || 0}`);

// ─── Weekly Recurring auto-generieren (immer aktiv) ─────────────────────────
// Quiz Mittwoch 20:00, Karaoke Freitag 20:00, Live Music Samstag (variable Zeit)
const RECURRING = [
  { dow: 3, time: "20:00", title: "Quiz Night", category: "event", note: "every Wednesday!" },
  { dow: 5, time: "20:00", title: "Karaoke Night", category: "event", note: "every Friday!" },
  { dow: 6, time: "21:00", title: "Live Music", category: "event", note: "every Saturday evening" },
];

const merged = [];
for (let d = new Date(today); d <= horizonEnd; d = addDays(d, 1)) {
  const dow = d.getDay();
  const dateStr = d.toISOString().split("T")[0];
  // DB events for this date
  const dbForDate = (dbEvents || []).filter((e) => e.event_date === dateStr);
  for (const e of dbForDate) {
    merged.push({
      date: new Date(d),
      time: e.event_time?.slice(0, 5) || "",
      title: e.title,
      category: e.category,
      source: "db",
    });
  }
  // Recurring auto-fill (skip if DB already has same category for date)
  for (const r of RECURRING) {
    if (r.dow !== dow) continue;
    const conflict = dbForDate.some((e) => e.category === r.category && e.title === r.title);
    if (conflict) continue;
    merged.push({
      date: new Date(d),
      time: r.time,
      title: r.title,
      category: r.category,
      note: r.note,
      source: "recurring",
    });
  }
}

merged.sort((a, b) => a.date - b.date || a.time.localeCompare(b.time));

// ─── Sektionen aufbauen ──────────────────────────────────────────────────────
const todaySection = `═══════════════════════════════════════
TODAY'S DATE — USE THIS, NEVER ASSUME
═══════════════════════════════════════

Today is ${fmtFull(today)}.
Tomorrow is ${fmtFull(tomorrow)}.
This week ends ${fmtFull(weekEnd)}.

When a caller says 'today' → ${fmtFull(today)}.
When a caller says 'tomorrow' → ${fmtFull(tomorrow)}.
When a caller says 'this weekend' → Saturday ${fmtFull(addDays(today, (6 - today.getDay() + 7) % 7 || 7))}.

NEVER reference dates before ${fmtFull(today)} — those are in the past.
NEVER invent a date — only use the events list below or compute relative to today.

PRONUNCIATION — say dates the way humans speak, not how they're written:
- "Sunday, the 3rd of May" or "Sunday, May 3rd" — NEVER "zero three may" or "03 May".
- "Wednesday, the 29th of April" or "April 29th" — NEVER "two nine April".
- For times: "seven PM" or "seven in the evening" — never "nineteen hundred".`;

// Tonight section
const tonightEvents = merged.filter((e) => e.date.getTime() === today.getTime());
const tonightStr = tonightEvents.length
  ? tonightEvents.map((e) => `${e.time} ${e.title}${e.note ? ` (${e.note})` : ""}`).join(", ")
  : "Regular pub night, no special events. Live Sport may be on — ask at the bar.";

// Future events
const thisWeek = merged.filter((e) => e.date > today && e.date <= weekEnd);
const nextWeek = merged.filter((e) => e.date > weekEnd && e.date <= horizonEnd);

const fmtEv = (e) => `- ${fmtShort(e.date)}, ${e.time}: ${e.title}${e.note ? ` (${e.note})` : ""}`;

const eventsSection = `═══════════════════════════════════════
UPCOMING EVENTS (${fmtShort(today)} — ${fmtShort(horizonEnd)})
═══════════════════════════════════════

TONIGHT (${fmtShort(today)}): ${tonightStr}

THIS WEEK:
${thisWeek.length ? thisWeek.map(fmtEv).join("\n") : "(no special events scheduled)"}

NEXT WEEK:
${nextWeek.length ? nextWeek.map(fmtEv).join("\n") : "(check back closer to date)"}

WEEKLY RECURRING (always-on):
- Every Wednesday 20:00: Quiz Night
- Every Friday 20:00: Karaoke Night
- Every Saturday: Live Sport + Live Music in the evening

`;

// ─── Prompt patchen ──────────────────────────────────────────────────────────
async function patchAgent(filePath) {
  const json = JSON.parse(await readFile(filePath, "utf-8"));
  let prompt = json.general_prompt;

  // Replace TODAY'S DATE block
  prompt = prompt.replace(
    /═══════════════════════════════════════\nTODAY'S DATE.*?(?=\n\nIMPORTANT RULES|\n\nPERSONA)/s,
    todaySection + "\n\n",
  );

  // Replace UPCOMING EVENTS block (matches header + content until next ═══ section)
  prompt = prompt.replace(
    /═══════════════════════════════════════\nUPCOMING EVENTS.*?(?=═══════════════════════════════════════\nRESERVATIONS)/s,
    eventsSection,
  );

  json.general_prompt = prompt;

  if (dryRun) {
    console.log(`[dry-run] would write: ${filePath}`);
    console.log(`\n--- updated TODAY's section ---\n${todaySection}\n`);
    console.log(`--- updated EVENTS section ---\n${eventsSection}\n`);
    return;
  }
  await writeFile(filePath, JSON.stringify(json, null, 2));
  console.log(`✓ patched: ${filePath}`);
}

await patchAgent(AGENT_PATHS.en);

// ─── Retell-Publish ──────────────────────────────────────────────────────────
// BigBen has no _intl.json (single EN agent + DE swap), so retell_sync.mjs
// does not apply. Use the dedicated bigben_publish.mjs which PATCHes both
// conversation flows and publishes both agents.
if (!dryRun) {
  console.log("\nrunning bigben_publish...");
  const r = spawnSync("node", ["scripts/_ops/bigben_publish.mjs"], { stdio: "inherit" });
  if (r.status !== 0) {
    console.error("✗ bigben_publish failed");
    process.exit(3);
  }
  console.log(`\n✓ Done. Voice-Agent published with date ${fmtFull(today)}.`);
}
