#!/usr/bin/env node
// _gen_t2_override.mjs — auto-generate phase_library override JSON from
// take2_event_log.json + _recording_offset.json. Eliminates the
// "guess source-time from frame-sampling" iteration loop.
// usage: node scripts/_ops/_gen_t2_override.mjs <slug>
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const slug = process.argv[2];
if (!slug) { console.error("usage: <slug>"); process.exit(1); }

const PIPE = "docs/gtm/pipeline/06_video_production";
const screenflowDir = join(PIPE, "screenflows", slug);
const eventLogPath = join(screenflowDir, "take2_event_log.json");
const offsetPath = join(screenflowDir, "_recording_offset.json");
const overridePath = join(PIPE, "phase_library_defs", "_overrides", slug, "take2_sanitaer.json");

for (const p of [eventLogPath, offsetPath]) {
  if (!existsSync(p)) { console.error(`✗ missing: ${p}`); process.exit(2); }
}

const log = JSON.parse(readFileSync(eventLogPath, "utf-8"));
const offset = JSON.parse(readFileSync(offsetPath, "utf-8"));
const events = Object.fromEntries(log.events.map((e) => [e.name, e.recording_t]));

// Map recording_t → take2_complete_t.
const toSrc = (rt) => offset.leit_start_in_take2_complete + (rt - offset.leit_trim);

// Helper to build a phase range with optional padding.
const range = (startEvent, endEvent, { startOffset = 0, endOffset = 0 } = {}) => {
  if (events[startEvent] === undefined) throw new Error(`missing event: ${startEvent}`);
  if (events[endEvent] === undefined) throw new Error(`missing event: ${endEvent}`);
  return [
    Number((toSrc(events[startEvent]) + startOffset).toFixed(2)),
    Number((toSrc(events[endEvent]) + endOffset).toFixed(2)),
  ];
};

// Phase mappings (event landmarks → schedule phases).
// Padding rationale:
//   - KPI phases start +0.2s after click (KPI-active state, not click transition).
//   - leit_filter_reset starts a bit before bewertung_dwell_end to include the click.
//   - dashboard_back starts at list_visible to skip Zurück transition.
const phases = [
  { name: "leit_dashboard_initial",     range: range("top_dwell_start", "top_dwell_end", { startOffset: 0.5, endOffset: -0.1 }) },
  { name: "leit_dashboard_scroll",      range: range("top_dwell_end", "scroll_down_start", { startOffset: -0.05, endOffset: 0.05 }) },
  { name: "leit_list_scroll_down",      range: range("scroll_down_start", "scroll_down_end") },
  { name: "leit_list_bottom",           range: range("scroll_down_end", "bottom_hold_end") },
  { name: "leit_list_scroll_up",        range: range("scroll_up_start", "pre_neu_hold_end") },
  { name: "leit_kpi_neu",               range: range("kpi_neu_click", "kpi_neu_dwell_end", { startOffset: 0.7 }) },
  { name: "leit_kpi_bei_uns",           range: range("kpi_bei_uns_click", "kpi_bei_uns_dwell_end", { startOffset: 0.7 }) },
  { name: "leit_kpi_erledigt",          range: range("kpi_erledigt_click", "kpi_erledigt_dwell_end", { startOffset: 0.7 }) },
  { name: "leit_kpi_bewertung",         range: range("kpi_bewertung_click", "kpi_bewertung_dwell_end", { startOffset: 0.7, endOffset: -0.2 }) },
  { name: "leit_filter_reset",          range: range("kpi_bewertung_dwell_end", "filter_reset_done") },
  { name: "leit_list_normal",           range: range("pre_scroll_hold_end", "post_scroll_hold_end", { startOffset: -0.3 }) },
  { name: "leit_case_open_uebersicht",  range: range("case_loaded", "case_top_hold_end", { startOffset: 0.7, endOffset: -0.2 }) },
  { name: "leit_case_scroll_verlauf",   range: range("case_scroll_down_start", "case_bottom_hold_end") },
  { name: "leit_case_scroll_top",       range: range("case_scroll_up_start", "case_top_hold_final_end", { endOffset: -0.5 }) },
  { name: "leit_dashboard_back",        range: range("list_visible", "recording_end", { endOffset: -0.5 }) },
];

const out = {
  take: 2,
  industry: "sanitaer",
  tenant: slug,
  description: `Auto-generated from take2_event_log.json (${log.events.length} events). All source ranges derived from recorder event landmarks — no manual frame sampling needed.`,
  generated_at: new Date().toISOString(),
  leit_start_in_take2_complete: Number(offset.leit_start_in_take2_complete.toFixed(2)),
  phases,
};

// 01.06.2026: mkdir — _overrides/<slug>/ existiert bei NEUEN Betrieben nicht
// (Stresstest-Fund: ENOENT → T2 schlug für walter-leuthold/stark/weinberger fehl).
mkdirSync(dirname(overridePath), { recursive: true });
writeFileSync(overridePath, JSON.stringify(out, null, 2) + "\n");
console.log(`✓ ${overridePath}`);
for (const p of phases) console.log(`  ${p.name.padEnd(35)} [${p.range[0]}, ${p.range[1]}] (${(p.range[1]-p.range[0]).toFixed(2)}s)`);
