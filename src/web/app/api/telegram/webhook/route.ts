import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// Telegram → GitHub Issue Bot ("CoreBot")
//
// Single Vercel API route. Receives Telegram webhook updates, classifies
// the message, creates a GitHub Issue, and ACKs back to Telegram.
//
// Env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_SHARED_SECRET,
//           TELEGRAM_ALLOWED_USER_ID, GITHUB_ISSUES_TOKEN,
//           OPENAI_API_KEY (optional — required for voice transcription)
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

interface TelegramVoice {
  file_id: string;
  file_unique_id: string;
  duration: number;
  file_size?: number;
}

interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

interface TelegramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat?: { id: number };
  text?: string;
  caption?: string;
  voice?: TelegramVoice;
  photo?: TelegramPhotoSize[];
  document?: TelegramDocument;
  date?: number;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// ---------------------------------------------------------------------------
// Voice message handling — download from Telegram + transcribe via Whisper
// ---------------------------------------------------------------------------

const MAX_VOICE_DURATION_SEC = 120;
const MAX_VOICE_SIZE_BYTES = 10 * 1024 * 1024;

async function downloadTelegramFile(
  botToken: string,
  fileId: string,
): Promise<ArrayBuffer | null> {
  try {
    const getFileRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`,
    );
    if (!getFileRes.ok) return null;
    const fileData = (await getFileRes.json()) as {
      ok: boolean;
      result?: { file_path?: string };
    };
    if (!fileData.ok || !fileData.result?.file_path) return null;

    const downloadRes = await fetch(
      `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`,
    );
    if (!downloadRes.ok) return null;
    return downloadRes.arrayBuffer();
  } catch (err) {
    log({ step: "tg_download", ok: false, error: err instanceof Error ? err.message : "unknown" });
    return null;
  }
}

async function transcribeAudio(
  audioBuffer: ArrayBuffer,
  apiKey: string,
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([audioBuffer], { type: "audio/ogg" }),
      "voice.ogg",
    );
    formData.append("model", "whisper-1");
    formData.append("language", "de");

    const res = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      },
    );
    if (!res.ok) {
      log({ step: "whisper", ok: false, status: res.status });
      return null;
    }
    const data = (await res.json()) as { text?: string };
    return data.text?.trim() || null;
  } catch (err) {
    log({ step: "whisper", ok: false, error: err instanceof Error ? err.message : "unknown" });
    return null;
  }
}

function extractVoiceTitle(transcript: string | null): string {
  if (transcript) {
    const firstSentence = transcript.split(/[.!?\n]/)[0]?.trim();
    if (firstSentence && firstSentence.length > 0) {
      return firstSentence.length > 80
        ? firstSentence.slice(0, 77) + "..."
        : firstSentence;
    }
  }
  const now = new Date();
  return `Voice Ticket ${now.toISOString().slice(0, 16).replace("T", " ")}`;
}

// ---------------------------------------------------------------------------
// Ticket sessions — voice / /ticket opens a 120s window for attachments
// Persistence: L1 = in-memory Map, L2 = Supabase Storage (cross-instance)
// ---------------------------------------------------------------------------

interface TicketSession {
  issueNumber: number;
  issueUrl: string;
  title: string;
  attachmentCount: number;
  totalBytes: number;
  expiresAt: number;
}

// L1 cache — fast path when same serverless instance handles both requests
const ticketSessions = new Map<number, TicketSession>();

const SESSION_TTL_MS = 120_000;
const MAX_ATTACHMENTS = 5;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const COREBOT_BUCKET = "corebot-files";

async function getActiveSession(chatId: number): Promise<TicketSession | null> {
  // L1: in-memory (same serverless instance)
  const cached = ticketSessions.get(chatId);
  if (cached) {
    if (Date.now() <= cached.expiresAt) return cached;
    ticketSessions.delete(chatId);
  }

  // L2: Supabase Storage (cross-instance persistence)
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.storage
      .from(COREBOT_BUCKET)
      .download(`_sessions/${chatId}.json`);
    if (error || !data) return null;
    const session = JSON.parse(await data.text()) as TicketSession;
    if (Date.now() > session.expiresAt) return null;
    ticketSessions.set(chatId, session); // warm L1
    return session;
  } catch {
    return null;
  }
}

async function persistSession(chatId: number, session: TicketSession): Promise<void> {
  ticketSessions.set(chatId, session);
  try {
    const supabase = getServiceClient();
    await supabase.storage
      .from(COREBOT_BUCKET)
      .upload(`_sessions/${chatId}.json`, JSON.stringify(session), {
        contentType: "application/json",
        upsert: true,
      });
  } catch (err) {
    log({ step: "session_persist", ok: false, chatId, error: err instanceof Error ? err.message : "unknown" });
  }
}

async function startSession(
  chatId: number,
  issueNumber: number,
  issueUrl: string,
  title: string,
): Promise<void> {
  await persistSession(chatId, {
    issueNumber,
    issueUrl,
    title,
    attachmentCount: 0,
    totalBytes: 0,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

function guessContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", heic: "image/heic",
    pdf: "application/pdf", mp4: "video/mp4", mov: "video/quicktime",
  };
  return map[ext] ?? "application/octet-stream";
}

async function addGitHubComment(
  token: string,
  issueNumber: number,
  body: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ body }),
      },
    );
    log({ step: "github_comment", ok: res.ok, issue: issueNumber, status: res.status });
    return res.ok;
  } catch (err) {
    log({ step: "github_comment", ok: false, issue: issueNumber, error: err instanceof Error ? err.message : "unknown" });
    return false;
  }
}

async function uploadToCoreBotStorage(
  botToken: string,
  fileId: string,
  fileName: string,
): Promise<{ url: string } | { error: string }> {
  // Step 1: Download from Telegram
  const buffer = await downloadTelegramFile(botToken, fileId);
  if (!buffer) return { error: "telegram_download_failed" };

  // Step 2: Upload to Supabase Storage
  try {
    const supabase = getServiceClient();
    const uid = crypto.randomUUID().slice(0, 8);
    const safeName = sanitizeFileName(fileName);
    const storagePath = `corebot/${uid}-${safeName}`;
    const contentType = guessContentType(safeName);

    const { error } = await supabase.storage
      .from(COREBOT_BUCKET)
      .upload(storagePath, new Uint8Array(buffer), {
        contentType,
        upsert: false,
      });

    if (error) {
      return { error: `storage_upload: ${error.message}` };
    }

    // Step 3: Get public URL
    const { data: urlData } = supabase.storage
      .from(COREBOT_BUCKET)
      .getPublicUrl(storagePath);

    return { url: urlData.publicUrl };
  } catch (err) {
    return { error: `storage_exception: ${err instanceof Error ? err.message : "unknown"}` };
  }
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
  const text = (message?.text ?? message?.caption)?.trim();
  const voice = message?.voice;
  const photo = message?.photo;
  const document = message?.document;
  const fromId = message?.from?.id;
  const chatId = message?.chat?.id;

  // Log every incoming update for debugging
  log({
    step: "incoming",
    update_id: update.update_id,
    from_id: fromId,
    chat_id: chatId,
    text: text?.slice(0, 80),
    has_voice: !!voice,
    has_photo: !!photo,
    has_document: !!document,
    has_message: !!message,
  });

  // Skip updates that have no actionable content
  if (!message || (!text && !voice && !photo && !document)) {
    log({ step: "filter", decision: "no_actionable_content" });
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

  // ── Voice message handling ──────────────────────────────────────────
  if (voice) {
    const duration = voice.duration;
    const fileSize = voice.file_size ?? 0;

    // Size / duration guard
    if (duration > MAX_VOICE_DURATION_SEC) {
      await sendTelegramMessage(botToken, replyTo, `Voice zu lang (${duration}s). Max ${MAX_VOICE_DURATION_SEC}s.`);
      return new NextResponse("ok", { status: 200 });
    }
    if (fileSize > MAX_VOICE_SIZE_BYTES) {
      await sendTelegramMessage(botToken, replyTo, `Voice zu gross (${Math.round(fileSize / 1024 / 1024)}MB). Max 10MB.`);
      return new NextResponse("ok", { status: 200 });
    }

    if (!githubToken) {
      await sendTelegramMessage(botToken, replyTo, "GITHUB_ISSUES_TOKEN not configured.");
      return new NextResponse("ok", { status: 200 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    let transcript: string | null = null;
    let transcriptionFailed = false;

    if (openaiKey) {
      const audioData = await downloadTelegramFile(botToken, voice.file_id);
      if (audioData) {
        transcript = await transcribeAudio(audioData, openaiKey);
        if (!transcript) transcriptionFailed = true;
      } else {
        transcriptionFailed = true;
      }
    } else {
      transcriptionFailed = true;
      log({ step: "voice", decision: "no_openai_key" });
    }

    const title = extractVoiceTitle(transcript);
    const classText = transcript ?? "";
    const typeLabel = classifyType(classText);
    const domainLabel = classifyDomain(classText);

    const createdAt = new Date().toISOString();
    const bodyParts = [
      "<!-- corebot:voice -->",
      `source: telegram`,
      `telegram_message_id: ${message.message_id}`,
      `telegram_voice_file_id: ${voice.file_id}`,
      `voice_duration_sec: ${duration}`,
      `type: ${typeLabel.replace("type/", "")}`,
      `domain: ${domainLabel.replace("domain/", "")}`,
      `created_at: ${createdAt}`,
      transcriptionFailed ? `transcription: failed` : "",
      "",
      "---",
      "",
    ];

    if (transcript) {
      bodyParts.push(
        ...transcript.split("\n").map((line) => `> ${line}`),
        "",
        `_Voice message (${duration}s)_`,
      );
    } else {
      bodyParts.push(
        `_transcription_failed — Voice message (${duration}s, file_id: ${voice.file_id})_`,
        `_Please listen to the original voice message in Telegram._`,
      );
    }

    const labels = [typeLabel, domainLabel, "source/voice"];
    const ghResult = await createGitHubIssue(githubToken, title, bodyParts.filter(Boolean).join("\n"), labels);

    if (!ghResult.ok) {
      Sentry.captureMessage("CoreBot voice issue creation failed", {
        level: "error",
        tags: { stage: "github", decision: "voice_issue_failed" },
        extra: { reason: ghResult.reason },
      });
      await sendTelegramMessage(botToken, replyTo, `Issue creation failed: ${ghResult.reason.slice(0, 100)}`);
      return new NextResponse("ok", { status: 200 });
    }

    await startSession(replyTo, ghResult.issue.number, ghResult.issue.html_url, title);
    const ackText = `ACK #${ghResult.issue.number} ${title}\n${ghResult.issue.html_url}\n(120s Fenster fuer Fotos/Dateien)`;
    await sendTelegramMessage(botToken, replyTo, ackText);

    log({
      step: "done_voice",
      issue: ghResult.issue.number,
      transcript_ok: !!transcript,
      duration,
    });

    return new NextResponse("ok", { status: 200 });
  }

  // ── Photo / Document attachment handling ─────────────────────────────
  if (photo || document) {
    try {
      const session = await getActiveSession(replyTo);
      if (!session) {
        await sendTelegramMessage(
          botToken,
          replyTo,
          "Kein aktives Ticket. Zuerst Voice oder /ticket senden.",
        );
        return new NextResponse("ok", { status: 200 });
      }

      if (!githubToken) {
        await sendTelegramMessage(botToken, replyTo, "attachment_failed: no GITHUB_ISSUES_TOKEN");
        return new NextResponse("ok", { status: 200 });
      }

      if (session.attachmentCount >= MAX_ATTACHMENTS) {
        await sendTelegramMessage(
          botToken,
          replyTo,
          `Max ${MAX_ATTACHMENTS} Anhaenge pro Ticket erreicht.`,
        );
        return new NextResponse("ok", { status: 200 });
      }

      let fileId: string;
      let fileName: string;
      let fileSize: number;
      let isImage = false;

      if (photo && photo.length > 0) {
        // Telegram sends multiple sizes — pick the largest
        const largest = photo[photo.length - 1];
        fileId = largest.file_id;
        fileSize = largest.file_size ?? 0;
        fileName = `photo_${message.message_id}.jpg`;
        isImage = true;
      } else if (document) {
        fileId = document.file_id;
        fileSize = document.file_size ?? 0;
        fileName = document.file_name ?? `doc_${message.message_id}`;
        isImage = document.mime_type?.startsWith("image/") ?? false;
      } else {
        return new NextResponse("ok", { status: 200 });
      }

      if (session.totalBytes + fileSize > MAX_TOTAL_BYTES) {
        await sendTelegramMessage(
          botToken,
          replyTo,
          `Max ${MAX_TOTAL_BYTES / 1024 / 1024}MB pro Ticket erreicht.`,
        );
        return new NextResponse("ok", { status: 200 });
      }

      const uploadResult = await uploadToCoreBotStorage(botToken, fileId, fileName);
      if ("error" in uploadResult) {
        log({ step: "attachment_failed", issue: session.issueNumber, error: uploadResult.error });
        await sendTelegramMessage(botToken, replyTo, `attachment_failed: ${uploadResult.error}`);
        return new NextResponse("ok", { status: 200 });
      }

      // Build comment — inline preview for images, link for docs
      const caption = text ? `\n\n${text}` : "";
      const commentBody = isImage
        ? `![${fileName}](${uploadResult.url})${caption}`
        : `[${fileName}](${uploadResult.url})${caption}`;

      const commented = await addGitHubComment(githubToken, session.issueNumber, commentBody);

      session.attachmentCount++;
      session.totalBytes += fileSize;
      session.expiresAt = Date.now() + SESSION_TTL_MS;
      await persistSession(replyTo, session);

      const remaining = MAX_ATTACHMENTS - session.attachmentCount;
      const ack = commented
        ? `Anhang #${session.attachmentCount} -> #${session.issueNumber} (noch ${remaining})`
        : `Upload OK, GitHub-Kommentar fehlgeschlagen.`;
      await sendTelegramMessage(botToken, replyTo, ack);

      log({
        step: "attachment",
        issue: session.issueNumber,
        fileName,
        isImage,
        count: session.attachmentCount,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      log({ step: "attachment_exception", error: msg });
      Sentry.captureException(err);
      await sendTelegramMessage(
        botToken,
        replyTo,
        `attachment_failed: exception: ${msg.slice(0, 100)}`,
      ).catch(() => {});
    }

    return new NextResponse("ok", { status: 200 });
  }

  // ── Text message handling below ─────────────────────────────────────

  // text is guaranteed non-empty here (voice + media paths returned above)
  if (!text) {
    return new NextResponse("ok", { status: 200 });
  }

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

  // ── /ticket command — create issue + open attachment window ────────
  if (text.startsWith("/ticket")) {
    if (!githubToken) {
      await sendTelegramMessage(botToken, replyTo, "GITHUB_ISSUES_TOKEN not configured.");
      return new NextResponse("ok", { status: 200 });
    }

    const ticketText = text.replace(/^\/ticket\s*/, "").trim();
    const title = ticketText
      ? ticketText.length > 80 ? ticketText.slice(0, 77) + "..." : ticketText
      : `Ticket ${new Date().toISOString().slice(0, 16).replace("T", " ")}`;

    const typeLabel = classifyType(ticketText);
    const domainLabel = classifyDomain(ticketText);
    const createdAt = new Date().toISOString();

    const body = [
      "<!-- corebot:ticket -->",
      `source: telegram`,
      `telegram_message_id: ${message.message_id}`,
      `type: ${typeLabel.replace("type/", "")}`,
      `domain: ${domainLabel.replace("domain/", "")}`,
      `created_at: ${createdAt}`,
      "",
      "---",
      "",
      ticketText || "_Ticket mit Anhaengen (siehe Kommentare)_",
    ].join("\n");

    const labels = [typeLabel, domainLabel, "source/ticket"];
    const ghResult = await createGitHubIssue(githubToken, title, body, labels);

    if (!ghResult.ok) {
      Sentry.captureMessage("CoreBot /ticket issue creation failed", {
        level: "error",
        tags: { stage: "github", decision: "ticket_cmd_failed" },
        extra: { reason: ghResult.reason },
      });
      await sendTelegramMessage(botToken, replyTo, `Issue creation failed: ${ghResult.reason.slice(0, 100)}`);
      return new NextResponse("ok", { status: 200 });
    }

    await startSession(replyTo, ghResult.issue.number, ghResult.issue.html_url, title);
    const ackText = `#${ghResult.issue.number} ${title}\n${ghResult.issue.html_url}\n(120s Fenster fuer Fotos/Dateien)`;
    await sendTelegramMessage(botToken, replyTo, ackText);

    log({ step: "done_ticket_cmd", issue: ghResult.issue.number });
    return new NextResponse("ok", { status: 200 });
  }

  // ── In-session text → comment on existing issue ──────────────────
  {
    const session = await getActiveSession(replyTo);
    if (session && githubToken) {
      await addGitHubComment(githubToken, session.issueNumber, text);
      session.expiresAt = Date.now() + SESSION_TTL_MS;
      await persistSession(replyTo, session);
      await sendTelegramMessage(botToken, replyTo, `Kommentar -> #${session.issueNumber}`);
      log({ step: "session_text", issue: session.issueNumber });
      return new NextResponse("ok", { status: 200 });
    }
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
