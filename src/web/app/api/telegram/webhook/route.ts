import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// ---------------------------------------------------------------------------
// Telegram → GitHub Issue Bot ("CoreBot")
//
// Single Vercel API route. Receives Telegram webhook updates, classifies
// the message, creates a GitHub Issue, and ACKs back to Telegram.
//
// Env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_SHARED_SECRET,
//           TELEGRAM_ALLOWED_USER_ID, GITHUB_ISSUES_TOKEN
// ---------------------------------------------------------------------------

const GITHUB_OWNER = "gunnarwende";
const GITHUB_REPO = "flowsight_mvp";

// ---------------------------------------------------------------------------
// Dedupe — module-level variable (persists within serverless instance)
// Telegram guarantees monotonically increasing update_ids.
// ---------------------------------------------------------------------------

let lastUpdateId = 0;

// ---------------------------------------------------------------------------
// Classification regex rules
// ---------------------------------------------------------------------------

function classifyType(text: string): string {
  if (/\b(decide|option|choose|should we|entweder|oder)\b/i.test(text)) return "type/decision";
  if (/\b(research|compare|look up|recherche|vergleich)\b/i.test(text)) return "type/research";
  return "type/ticket";
}

function classifyDomain(text: string): string {
  if (/\b(voice|retell|twilio|peoplefone|telefon|anruf|lisa)\b/i.test(text)) return "domain/telephony";
  if (/\b(secret|auth|billing|security|passwort|token)\b/i.test(text)) return "domain/security";
  if (/\b(demo|brunner|d[öo]rfler|doerfler|prospect|pitch)\b/i.test(text)) return "domain/sales";
  if (/\b(website|wizard|seo|page|seite)\b/i.test(text)) return "domain/website";
  return "domain/ops";
}

// ---------------------------------------------------------------------------
// Structured log (one line per invocation — Vercel Hobby limit)
// ---------------------------------------------------------------------------

function logDecision(fields: Record<string, unknown>) {
  console.log(JSON.stringify({ _tag: "telegram_webhook", ...fields }));
}

// ---------------------------------------------------------------------------
// GitHub API helpers (native fetch, no SDK)
// ---------------------------------------------------------------------------

interface GitHubIssue {
  number: number;
  html_url: string;
}

async function createGitHubIssue(
  token: string,
  title: string,
  body: string,
  labels: string[],
): Promise<{ ok: true; issue: GitHubIssue } | { ok: false; reason: string }> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ title, body, labels }),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, reason: `github_${res.status}: ${text.slice(0, 200)}` };
    }
    const data = (await res.json()) as GitHubIssue;
    return { ok: true, issue: data };
  } catch {
    return { ok: false, reason: "fetch_exception" };
  }
}

interface GitHubStatusInfo {
  openIssues: number;
  inProgressCount: number;
  lastShipped: string;
}

async function fetchGitHubStatus(token: string): Promise<GitHubStatusInfo> {
  const defaults: GitHubStatusInfo = { openIssues: 0, inProgressCount: 0, lastShipped: "n/a" };
  try {
    // Open issues count
    const issuesRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=open&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    // GitHub returns total in Link header or we parse the array
    // Simplest: read the total_count from search API
    const openCountHeader = issuesRes.headers.get("link");
    let openCount = 0;
    if (issuesRes.ok) {
      const openArr = (await issuesRes.json()) as unknown[];
      // If there's a "last" page in link header, parse it; otherwise count = array length
      if (openCountHeader) {
        const lastMatch = openCountHeader.match(/page=(\d+)>; rel="last"/);
        if (lastMatch) openCount = parseInt(lastMatch[1], 10);
        else openCount = openArr.length;
      } else {
        openCount = openArr.length;
      }
    }

    // Last merged PR
    const prsRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    let lastShipped = "n/a";
    if (prsRes.ok) {
      const prs = (await prsRes.json()) as Array<{ title?: string; number?: number; merged_at?: string }>;
      const merged = prs.find(pr => pr.merged_at);
      if (merged) {
        const ago = timeSince(merged.merged_at ?? "");
        lastShipped = `${merged.title} (#${merged.number}, ${ago})`;
      }
    }

    return { openIssues: openCount, inProgressCount: 0, lastShipped };
  } catch {
    return defaults;
  }
}

function timeSince(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return "<1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Telegram API helper (native fetch)
// ---------------------------------------------------------------------------

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Telegram webhook types (subset)
// ---------------------------------------------------------------------------

interface TelegramUser {
  id: number;
  first_name?: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat?: { id: number };
  text?: string;
  date?: number;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// ---------------------------------------------------------------------------
// GET /api/telegram/webhook — health check
// ---------------------------------------------------------------------------

export function GET() {
  return new NextResponse("ok", { status: 200 });
}

// ---------------------------------------------------------------------------
// POST /api/telegram/webhook
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  Sentry.setTag("area", "corebot");
  Sentry.setTag("_tag", "telegram_webhook");
  Sentry.setTag("endpoint", "/api/telegram/webhook");

  // ── Env var validation ─────────────────────────────────────────────
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const sharedSecret = process.env.TELEGRAM_SHARED_SECRET;
  const allowedUserId = process.env.TELEGRAM_ALLOWED_USER_ID;
  const githubToken = process.env.GITHUB_ISSUES_TOKEN;

  if (!botToken || !sharedSecret || !allowedUserId || !githubToken) {
    Sentry.captureMessage("CoreBot missing env vars", {
      level: "error",
      tags: { stage: "init", decision: "misconfigured", error_code: "MISSING_ENV" },
    });
    logDecision({ decision: "misconfigured", reason: "missing_env" });
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  // ── Verify shared secret ──────────────────────────────────────────
  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  if (secretHeader !== sharedSecret) {
    Sentry.captureMessage("CoreBot invalid secret header", {
      level: "warning",
      tags: { stage: "verify", decision: "unauthorized", error_code: "INVALID_SECRET" },
    });
    logDecision({ decision: "unauthorized", reason: "invalid_secret" });
    // Return 200 to prevent Telegram retries
    return new NextResponse("ok", { status: 200 });
  }

  // ── Parse payload ─────────────────────────────────────────────────
  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    logDecision({ decision: "ignored", reason: "invalid_json" });
    return new NextResponse("ok", { status: 200 });
  }

  const message = update.message;
  const text = message?.text?.trim();

  // Skip non-text updates (photos, stickers, edits, etc.)
  if (!message || !text) {
    logDecision({ decision: "ignored", reason: "no_text_message" });
    return new NextResponse("ok", { status: 200 });
  }

  // ── Auth: user whitelist ──────────────────────────────────────────
  const fromId = message.from?.id;
  if (!fromId || String(fromId) !== allowedUserId) {
    Sentry.addBreadcrumb({
      category: "corebot",
      level: "info",
      message: "unauthorized_user",
      data: { from_id: fromId },
    });
    logDecision({ decision: "unauthorized", reason: "wrong_user", from_id: fromId });
    return new NextResponse("ok", { status: 200 });
  }

  // ── Dedupe: update_id monotonically increases ─────────────────────
  if (update.update_id <= lastUpdateId) {
    logDecision({ decision: "dedupe", update_id: update.update_id });
    return new NextResponse("ok", { status: 200 });
  }
  lastUpdateId = update.update_id;

  const chatId = message.chat?.id ?? fromId;

  // ── /status command ───────────────────────────────────────────────
  if (text.startsWith("/status")) {
    Sentry.setTag("decision", "status_command");
    try {
      const status = await fetchGitHubStatus(githubToken);
      const statusText = [
        "📊 *FlowSight Status*",
        `Open: ${status.openIssues}`,
        `Last shipped: ${status.lastShipped}`,
        `→ [Issues](https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues)`,
      ].join("\n");
      await sendTelegramMessage(botToken, chatId, statusText);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { stage: "status_cmd", decision: "error", error_code: "STATUS_FAILED" },
      });
    }
    logDecision({ decision: "status_command" });
    return new NextResponse("ok", { status: 200 });
  }

  // ── Classify message ──────────────────────────────────────────────
  const typeLabel = classifyType(text);
  const domainLabel = classifyDomain(text);

  // ── Build GitHub Issue ────────────────────────────────────────────
  const title = text.length > 80 ? text.slice(0, 77) + "..." : text;
  const createdAt = new Date().toISOString();
  const body = [
    "<!-- corebot -->",
    `source: telegram`,
    `telegram_message_id: ${message.message_id}`,
    `type: ${typeLabel.replace("type/", "")}`,
    `domain: ${domainLabel.replace("domain/", "")}`,
    `created_at: ${createdAt}`,
    "",
    "---",
    "",
    text,
  ].join("\n");

  const labels = [typeLabel, domainLabel];

  // ── Create Issue ──────────────────────────────────────────────────
  const result = await createGitHubIssue(githubToken, title, body, labels);

  if (!result.ok) {
    Sentry.captureMessage("CoreBot GitHub issue creation failed", {
      level: "error",
      tags: {
        stage: "github",
        decision: "issue_create_failed",
        error_code: "GITHUB_CREATE_FAILED",
      },
      extra: { reason: result.reason },
    });
    await sendTelegramMessage(botToken, chatId, `❌ Issue creation failed: ${result.reason.slice(0, 100)}`);
    logDecision({ decision: "issue_create_failed", reason: result.reason.slice(0, 200) });
    return new NextResponse("ok", { status: 200 });
  }

  // ── ACK back to Telegram ──────────────────────────────────────────
  const ackText = `✅ #${result.issue.number} [${typeLabel}/${domainLabel.replace("domain/", "")}] — [View](${result.issue.html_url})`;
  const ackSent = await sendTelegramMessage(botToken, chatId, ackText);

  logDecision({
    decision: "issue_created",
    issue_number: result.issue.number,
    type: typeLabel,
    domain: domainLabel,
    ack_sent: ackSent,
    message_id: message.message_id,
  });

  return new NextResponse("ok", { status: 200 });
}
