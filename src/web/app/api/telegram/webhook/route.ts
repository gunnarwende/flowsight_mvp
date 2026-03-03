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
// Structured log — multiple lines OK for debugging, consolidate later
// ---------------------------------------------------------------------------

function log(fields: Record<string, unknown>) {
  console.log(JSON.stringify({ _tag: "corebot", ...fields }));
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
      const errBody = await res.text().catch(() => "");
      const reason = `github_${res.status}: ${errBody.slice(0, 300)}`;
      log({ step: "github_create", ok: false, status: res.status, body: errBody.slice(0, 300) });
      return { ok: false, reason };
    }
    const data = (await res.json()) as GitHubIssue;
    log({ step: "github_create", ok: true, issue_number: data.number });
    return { ok: true, issue: data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    log({ step: "github_create", ok: false, error: msg });
    return { ok: false, reason: `fetch_exception: ${msg}` };
  }
}

interface GitHubStatusInfo {
  openIssues: number;
  lastShipped: string;
}

async function fetchGitHubStatus(token: string | undefined): Promise<GitHubStatusInfo> {
  const defaults: GitHubStatusInfo = { openIssues: 0, lastShipped: "n/a" };
  if (!token) return defaults;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // Open issues count
    const issuesRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=open&per_page=1`,
      { headers },
    );
    let openCount = 0;
    if (issuesRes.ok) {
      const openArr = (await issuesRes.json()) as unknown[];
      const linkHeader = issuesRes.headers.get("link");
      if (linkHeader) {
        const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (lastMatch) openCount = parseInt(lastMatch[1], 10);
        else openCount = openArr.length;
      } else {
        openCount = openArr.length;
      }
    }

    // Last merged PR
    const prsRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=1`,
      { headers },
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

    return { openIssues: openCount, lastShipped };
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
// Telegram API helper (native fetch, NO parse_mode — plain text only)
// MarkdownV1 silently rejects messages with unescaped special chars.
// ---------------------------------------------------------------------------

interface TgSendResult {
  ok: boolean;
  status: number;
  body: string;
}

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
): Promise<TgSendResult> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      },
    );
    const resBody = await res.text().catch(() => "");
    log({ step: "sendMessage", ok: res.ok, status: res.status, chat_id: chatId, body: resBody.slice(0, 300) });
    return { ok: res.ok, status: res.status, body: resBody.slice(0, 300) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    log({ step: "sendMessage", ok: false, status: 0, chat_id: chatId, error: msg });
    return { ok: false, status: 0, body: msg };
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

  // ── Env var validation ─────────────────────────────────────────────
  // botToken + sharedSecret + allowedUserId are required for all paths.
  // githubToken is only required for issue creation (not /status fallback).
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const sharedSecret = process.env.TELEGRAM_SHARED_SECRET;
  const allowedUserId = process.env.TELEGRAM_ALLOWED_USER_ID;
  const githubToken = process.env.GITHUB_ISSUES_TOKEN;

  const envPresent = {
    botToken: !!botToken,
    sharedSecret: !!sharedSecret,
    allowedUserId: !!allowedUserId,
    githubToken: !!githubToken,
  };

  if (!botToken || !sharedSecret || !allowedUserId) {
    log({ step: "env_check", decision: "misconfigured", envPresent });
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  // ── Verify shared secret ──────────────────────────────────────────
  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  const secretMatch = secretHeader === sharedSecret;
  if (!secretMatch) {
    log({
      step: "secret_check",
      decision: "unauthorized",
      header_present: !!secretHeader,
      header_len: secretHeader?.length ?? 0,
      expected_len: sharedSecret.length,
      header_prefix: secretHeader?.slice(0, 4) ?? "",
      expected_prefix: sharedSecret.slice(0, 4),
    });
    return new NextResponse("ok", { status: 200 });
  }

  // ── Parse payload ─────────────────────────────────────────────────
  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    log({ step: "parse", decision: "invalid_json" });
    return new NextResponse("ok", { status: 200 });
  }

  const message = update.message;
  const text = message?.text?.trim();
  const fromId = message?.from?.id;
  const chatId = message?.chat?.id;

  // Log every incoming update for debugging
  log({
    step: "incoming",
    update_id: update.update_id,
    from_id: fromId,
    chat_id: chatId,
    text: text?.slice(0, 80),
    has_message: !!message,
  });

  // Skip non-text updates (photos, stickers, edits, etc.)
  if (!message || !text) {
    log({ step: "filter", decision: "no_text_message" });
    return new NextResponse("ok", { status: 200 });
  }

  // ── Auth: user whitelist ──────────────────────────────────────────
  const userMatch = !!fromId && String(fromId) === allowedUserId;
  if (!userMatch) {
    log({
      step: "auth",
      decision: "wrong_user",
      from_id: fromId,
      allowed: allowedUserId,
    });
    return new NextResponse("ok", { status: 200 });
  }

  // ── Dedupe: update_id monotonically increases ─────────────────────
  if (update.update_id <= lastUpdateId) {
    log({ step: "dedupe", decision: "skip", update_id: update.update_id, last: lastUpdateId });
    return new NextResponse("ok", { status: 200 });
  }
  lastUpdateId = update.update_id;

  const replyTo = chatId ?? fromId;

  // ── /status command (works even without GITHUB_ISSUES_TOKEN) ──────
  if (text.startsWith("/status")) {
    try {
      const status = await fetchGitHubStatus(githubToken);
      const lines = [
        "FlowSight Status",
        `Open: ${status.openIssues}`,
        `Last shipped: ${status.lastShipped}`,
        !githubToken ? "(GitHub token missing — counts may be 0)" : "",
        `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
      ].filter(Boolean);
      const result = await sendTelegramMessage(botToken, replyTo, lines.join("\n"));
      log({ step: "status_cmd", ack_ok: result.ok, ack_status: result.status });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      log({ step: "status_cmd", error: msg });
      Sentry.captureException(err);
    }
    return new NextResponse("ok", { status: 200 });
  }

  // ── Issue creation requires GITHUB_ISSUES_TOKEN ───────────────────
  if (!githubToken) {
    const result = await sendTelegramMessage(botToken, replyTo, "GITHUB_ISSUES_TOKEN not configured — cannot create issues.");
    log({ step: "issue_create", decision: "no_github_token", ack_ok: result.ok });
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
  const ghResult = await createGitHubIssue(githubToken, title, body, labels);

  if (!ghResult.ok) {
    Sentry.captureMessage("CoreBot GitHub issue creation failed", {
      level: "error",
      tags: { stage: "github", decision: "issue_create_failed" },
      extra: { reason: ghResult.reason },
    });
    await sendTelegramMessage(botToken, replyTo, `Issue creation failed: ${ghResult.reason.slice(0, 100)}`);
    return new NextResponse("ok", { status: 200 });
  }

  // ── ACK back to Telegram ──────────────────────────────────────────
  const ackText = `#${ghResult.issue.number} [${typeLabel}/${domainLabel.replace("domain/", "")}]\n${ghResult.issue.html_url}`;
  const ack = await sendTelegramMessage(botToken, replyTo, ackText);

  log({
    step: "done",
    issue: ghResult.issue.number,
    type: typeLabel,
    domain: domainLabel,
    ack_ok: ack.ok,
  });

  return new NextResponse("ok", { status: 200 });
}
