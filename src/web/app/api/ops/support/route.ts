import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * POST /api/ops/support — Create support ticket from Leitsystem.
 *
 * Primary: GitHub Issue (if GITHUB_ISSUES_TOKEN set)
 * ALWAYS: Notification email to Founder (not just fallback)
 *
 * Body: { subject: string, message: string, attachments?: string[] }
 *       attachments = array of storage_path strings from /api/ops/support/upload
 */

const BUCKET = "case-attachments";
const DOWNLOAD_URL_TTL = 7 * 24 * 3600; // 7 days

export async function POST(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const subject = typeof body.subject === "string" ? body.subject : "Anfrage";
  const message = typeof body.message === "string" ? body.message : "";
  const attachments = Array.isArray(body.attachments) ? body.attachments.filter((a: unknown) => typeof a === "string") as string[] : [];

  if (!message.trim()) {
    return NextResponse.json({ error: "Nachricht fehlt" }, { status: 400 });
  }

  // Resolve context
  const authClient = await getAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  const userEmail = user?.email ?? "unbekannt";
  const identity = scope.tenantId ? await resolveTenantIdentityById(scope.tenantId) : null;
  const tenantName = identity?.displayName ?? "Unbekannt";

  // Generate signed download URLs for attachments
  const supabase = getServiceClient();
  const attachmentData: { name: string; url: string }[] = [];
  for (const path of attachments) {
    if (!path.startsWith("support/")) continue; // safety
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, DOWNLOAD_URL_TTL);
    if (data?.signedUrl) {
      const fileName = path.split("/").pop()?.replace(/^[a-f0-9]{8}-/, "") ?? path;
      attachmentData.push({ name: fileName, url: data.signedUrl });
    }
  }

  const issueTitle = `[Support] ${subject} — ${tenantName}`;
  const timestamp = new Date().toISOString();

  // GitHub Issue body (Markdown)
  const issueBody = [
    `## Kontext`,
    `- **Betrieb:** ${tenantName}`,
    `- **Gemeldet von:** ${userEmail}`,
    `- **Zeitpunkt:** ${timestamp}`,
    `- **Tenant-ID:** ${scope.tenantId ?? "—"}`,
    ``,
    `## Beschreibung`,
    message.trim(),
    ...(attachmentData.length > 0
      ? [``, `## Anhänge (${attachmentData.length})`, ...attachmentData.map((a) => `- [${a.name}](${a.url})`)]
      : []),
    ``,
    `---`,
    `*Erstellt aus dem Leitsystem via /ops/hilfe*`,
  ].join("\n");

  let ghSuccess = false;
  let issueNumber: number | undefined;

  // Primary: GitHub Issue
  const ghToken = process.env.GITHUB_ISSUES_TOKEN;
  if (ghToken) {
    try {
      const res = await fetch("https://api.github.com/repos/gunnarwende/flowsight_mvp/issues", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ghToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ["support", "from-leitstand"],
        }),
      });

      if (res.ok) {
        const issue = await res.json();
        issueNumber = issue.number;
        ghSuccess = true;
        Sentry.captureMessage("Support ticket created", {
          level: "info",
          tags: { area: "support", tenant_id: scope.tenantId ?? "", issue_number: issue.number },
        });
      } else {
        console.error("[support] GitHub Issue creation failed:", await res.text());
      }
    } catch (e) {
      console.error("[support] GitHub Issue error:", e);
    }
  }

  // ALWAYS send notification email (not just fallback)
  const resendKey = process.env.RESEND_API_KEY;
  const founderEmail = process.env.FOUNDER_EMAIL ?? process.env.MAIL_REPLY_TO;
  let emailSent = false;

  if (resendKey && founderEmail) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      const emailSubject = ghSuccess
        ? `${issueTitle} (#${issueNumber})`
        : issueTitle;

      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const attachmentHtml = attachmentData.length > 0
        ? `<h3>Anhänge (${attachmentData.length})</h3><ul>${attachmentData.map((a) =>
            `<li><a href="${esc(a.url)}" style="color:#2563eb">${esc(a.name)}</a></li>`
          ).join("")}</ul>`
        : "";

      const ghLink = ghSuccess
        ? `<p><a href="https://github.com/gunnarwende/flowsight_mvp/issues/${issueNumber}" style="color:#2563eb">GitHub Issue #${issueNumber}</a></p>`
        : "";

      const emailHtml = `
        <div style="font-family:sans-serif;max-width:600px;color:#1f2937">
          <h2 style="margin-bottom:4px">${esc(issueTitle)}</h2>
          <table style="font-size:14px;color:#6b7280;margin-bottom:16px">
            <tr><td style="padding-right:12px"><strong>Betrieb:</strong></td><td>${esc(tenantName)}</td></tr>
            <tr><td style="padding-right:12px"><strong>Von:</strong></td><td>${esc(userEmail)}</td></tr>
            <tr><td style="padding-right:12px"><strong>Zeitpunkt:</strong></td><td>${esc(timestamp)}</td></tr>
          </table>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;white-space:pre-wrap;font-size:14px">${esc(message.trim())}</div>
          ${attachmentHtml}
          ${ghLink}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
          <p style="font-size:12px;color:#9ca3af">Erstellt aus dem Leitsystem via /ops/hilfe</p>
        </div>
      `;

      await resend.emails.send({
        from: process.env.MAIL_FROM ?? "noreply@send.flowsight.ch",
        to: founderEmail,
        subject: emailSubject,
        html: emailHtml,
      });
      emailSent = true;
    } catch (e) {
      console.error("[support] Email send error:", e);
    }
  }

  if (!ghSuccess && !emailSent) {
    return NextResponse.json({ error: "Senden fehlgeschlagen" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    channel: ghSuccess ? "github" : "email",
    ...(issueNumber != null ? { issueNumber } : {}),
  });
}
