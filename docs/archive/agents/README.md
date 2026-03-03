# Agent Operating Model

## How Work Is Initiated
1. Head Ops reviews docs/STATUS.md and identifies the next wave.
2. Head Ops creates a task using the appropriate template from docs/agents/task_templates/.
3. The assigned agent reads the task, confirms inputs, then executes.
4. Head Ops reviews output against DoD before merge.

## Discovery vs Delivery
Every task has two phases:

### Discovery (before writing code/content)
- Read all listed SSOT inputs
- Confirm access to required services/env vars
- Check: are inputs complete? If not, escalate before proceeding.
- Output: "Discovery complete, proceeding" or "Blocked: [specific missing item]"

### Delivery (producing output)
- Work within allowed scope (paths listed in task)
- Produce all required outputs per DoD checklist
- Run verification commands (git diff --stat, git status -sb, build if applicable)
- Write status update (5–10 lines, date/owner/what/next)

## Required Outputs (Every Task)
1. `git diff --stat` — show what changed
2. `git status -sb` — confirm only intended files affected
3. DoD checklist — each item checked with evidence (filepath + note)
4. Status update — 5–10 lines summary

## Escalation Rule
If missing access, inputs, or unclear requirements:
- Ask a **single Yes/No question** or request a **specific artifact** (filepath, secret name, URL).
- Do NOT guess. Do NOT assume. Do NOT proceed without the missing piece.
- If blocked for >1 round, escalate to Head Ops with: what's missing, what's blocked, proposed resolution.

## Agents
- **Head Ops** — docs/agents/head_ops.md — orchestration, SSOT, review
- **Web Agent** — docs/agents/web_agent.md — website, wizard, API routes
- **Voice Agent** — docs/agents/voice_agent.md — Retell webhook, voice intake
- **Analytics Agent** — docs/agents/analytics_agent.md — dashboard, monitoring
