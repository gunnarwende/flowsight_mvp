// scripts/chains/voice/report.mjs
// Reporter: analysis results → report.md + report.json per call + summary.md
//
// Usage (module):
//   import { writeCallReport, writeSummary } from "./report.mjs";

import { writeFileSync, mkdirSync } from "fs";

const REPORT_DIR = "tmp/chains/voice/reports";

// ── Verdict computation ──────────────────────────────────────────────────

function computeVerdict(findings) {
  const criticals = findings.filter((f) => f.severity === "critical");
  const warnings = findings.filter((f) => f.severity === "warning");
  const infos = findings.filter((f) => f.severity === "info");
  const passes = findings.filter((f) => f.severity === "pass");

  let score;
  if (criticals.length > 0) score = "fail";
  else if (warnings.length >= 3) score = "warn";
  else score = "pass";

  // Top fixes: critical first, then warnings
  const topFindings = [...criticals, ...warnings].slice(0, 3);
  const topFixes = topFindings.map((f) => f.title);

  return {
    score,
    critical_count: criticals.length,
    warning_count: warnings.length,
    info_count: infos.length,
    pass_count: passes.length,
    top_fixes: topFixes,
  };
}

// ── Severity badge ───────────────────────────────────────────────────────

function badge(severity) {
  switch (severity) {
    case "critical":
      return "[CRITICAL]";
    case "warning":
      return "[WARNING]";
    case "info":
      return "[INFO]";
    case "pass":
      return "[PASS]";
    default:
      return `[${severity}]`;
  }
}

function verdictBadge(score) {
  switch (score) {
    case "pass":
      return "PASS";
    case "warn":
      return "WARN";
    case "fail":
      return "FAIL";
    default:
      return score;
  }
}

// ── Timeline rendering (PII-safe: no content, only timing) ───────────────

function renderTimeline(turns) {
  if (turns.length === 0) return "_No transcript turns available._\n";

  const lines = ["| # | Role | Start | Duration | Words | Gap before |", "|----|------|-------|----------|-------|------------|"];

  for (let i = 0; i < turns.length; i++) {
    const t = turns[i];
    const start =
      t.startMs != null
        ? `${(t.startMs / 1000).toFixed(1)}s`
        : "?";
    const dur = t.durationMs != null ? `${(t.durationMs / 1000).toFixed(1)}s` : "?";
    let gap = "-";
    if (i > 0 && turns[i - 1].endMs != null && t.startMs != null) {
      const gapMs = t.startMs - turns[i - 1].endMs;
      gap = `${(gapMs / 1000).toFixed(1)}s`;
    }
    lines.push(
      `| ${i + 1} | ${t.role} | ${start} | ${dur} | ${t.wordCount} | ${gap} |`,
    );
  }

  return lines.join("\n") + "\n";
}

// ── Findings rendering ───────────────────────────────────────────────────

function renderFindings(findings) {
  if (findings.length === 0) return "_No findings._\n";

  // Group by severity
  const groups = { critical: [], warning: [], info: [], pass: [] };
  for (const f of findings) {
    (groups[f.severity] ?? groups.info).push(f);
  }

  const lines = [];
  for (const sev of ["critical", "warning", "info", "pass"]) {
    const items = groups[sev];
    if (items.length === 0) continue;
    lines.push(`### ${badge(sev)} (${items.length})\n`);
    for (const f of items) {
      const ts = f.timestamp ? ` @ ${f.timestamp}` : "";
      lines.push(`- **${f.title}**${ts}`);
      lines.push(`  ${f.detail}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ── Write single call report ─────────────────────────────────────────────

/**
 * Write report.md + report.json for a single call analysis.
 * @param {object} analysis - Output of analyzeCall()
 * @param {string} runId - ISO timestamp of the chain run
 * @returns {{ mdPath: string, jsonPath: string }}
 */
export function writeCallReport(analysis, runId) {
  mkdirSync(REPORT_DIR, { recursive: true });

  const { meta, turns, findings, audio, timing } = analysis;
  const verdict = computeVerdict(findings);
  const dateSlug = runId.slice(0, 10);
  const fileBase = `${REPORT_DIR}/${dateSlug}_${meta.call_id_short}`;

  // ── JSON report ──
  const jsonReport = {
    chain: "voice",
    run_id: runId,
    call: meta,
    timing,
    audio_available: audio.available,
    findings: findings.map((f) => ({
      category: f.category,
      severity: f.severity,
      title: f.title,
      timestamp: f.timestamp,
      evidence: f.evidence,
    })),
    verdict,
  };

  writeFileSync(`${fileBase}.json`, JSON.stringify(jsonReport, null, 2) + "\n");

  // ── Markdown report ──
  const md = [
    `# Voice Call Report — ${meta.call_id_short}`,
    "",
    `**Verdict: ${verdictBadge(verdict.score)}** | Critical: ${verdict.critical_count} | Warning: ${verdict.warning_count} | Info: ${verdict.info_count} | Pass: ${verdict.pass_count}`,
    "",
    "## Meta",
    "",
    `| Key | Value |`,
    `|-----|-------|`,
    `| Call ID | ${meta.call_id_short}... |`,
    `| Agent | ${meta.agent_name} |`,
    `| Status | ${meta.call_status} |`,
    `| Disconnection | ${meta.disconnection_reason} |`,
    `| Duration | ${meta.duration_s != null ? `${meta.duration_s}s` : "?"} |`,
    `| Turns | ${meta.turn_count} (user: ${meta.user_turns}, agent: ${meta.agent_turns}) |`,
    `| Audio available | ${audio.available ? "yes" : "no"} |`,
    "",
    "## Timing",
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Agent talk | ${timing.agent_talk_s}s (${timing.agent_ratio ?? "?"}%) |`,
    `| User talk | ${timing.user_talk_s}s |`,
    `| Max gap | ${timing.max_gap_s}s |`,
    `| Total duration | ${timing.total_duration_s ?? "?"}s |`,
    "",
    "## Timeline (PII-safe: no content)",
    "",
    renderTimeline(turns),
    "## Findings",
    "",
    renderFindings(findings),
    verdict.top_fixes.length > 0
      ? "## Top Fixes\n\n" +
        verdict.top_fixes.map((f, i) => `${i + 1}. ${f}`).join("\n") +
        "\n"
      : "",
  ].join("\n");

  writeFileSync(`${fileBase}.md`, md);

  return { mdPath: `${fileBase}.md`, jsonPath: `${fileBase}.json` };
}

// ── Write summary across all calls ───────────────────────────────────────

/**
 * Write summary.md for a chain run.
 * @param {Array<{ analysis, report }>} results - Per-call results
 * @param {string} runId
 * @returns {string} summaryPath
 */
export function writeSummary(results, runId) {
  mkdirSync(REPORT_DIR, { recursive: true });

  const dateSlug = runId.slice(0, 10);
  const summaryPath = `${REPORT_DIR}/${dateSlug}_summary.md`;

  // Aggregate
  let totalCritical = 0;
  let totalWarning = 0;
  const allFindings = [];
  const callVerdicts = [];
  let audioAvailableCount = 0;

  for (const r of results) {
    const verdict = computeVerdict(r.analysis.findings);
    totalCritical += verdict.critical_count;
    totalWarning += verdict.warning_count;
    callVerdicts.push({
      call_id_short: r.analysis.meta.call_id_short,
      score: verdict.score,
      critical: verdict.critical_count,
      warning: verdict.warning_count,
    });
    allFindings.push(...r.analysis.findings);
    if (r.analysis.audio.available) audioAvailableCount++;
  }

  let overallScore;
  if (totalCritical > 0) overallScore = "fail";
  else if (totalWarning >= 3) overallScore = "warn";
  else overallScore = "pass";

  // Top 3 regressions (critical+warning, deduplicated by category)
  const seen = new Set();
  const topRegressions = [];
  for (const f of allFindings) {
    if ((f.severity === "critical" || f.severity === "warning") && !seen.has(f.category)) {
      seen.add(f.category);
      topRegressions.push(f.title);
      if (topRegressions.length >= 3) break;
    }
  }

  const md = [
    `# Voice Chain Summary — ${runId.slice(0, 19)}`,
    "",
    `**Overall: ${verdictBadge(overallScore)}** | Calls: ${results.length} | Critical: ${totalCritical} | Warning: ${totalWarning}`,
    "",
    "## Per-Call Verdicts",
    "",
    "| Call | Verdict | Critical | Warning |",
    "|------|---------|----------|---------|",
    ...callVerdicts.map(
      (v) => `| ${v.call_id_short}... | ${verdictBadge(v.score)} | ${v.critical} | ${v.warning} |`,
    ),
    "",
    "## Top Regressions",
    "",
    topRegressions.length > 0
      ? topRegressions.map((r, i) => `${i + 1}. ${r}`).join("\n")
      : "_None — all checks passed._",
    "",
    "## Audio Gate",
    "",
    `${audioAvailableCount}/${results.length} calls have recording URLs available.`,
    audioAvailableCount === 0
      ? "To enable audio analysis (P1), turn on Recording in Retell Dashboard for test agents."
      : "Audio analysis (P1) is possible for calls with recordings.",
    "",
    "---",
    `_Generated by Voice Chain P0 at ${runId}_`,
    "",
  ].join("\n");

  writeFileSync(summaryPath, md);
  return summaryPath;
}
