import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { getAuthClient } from "@/src/lib/supabase/server-auth";

/**
 * POST /api/ops/support — Create support ticket from Leitsystem.
 *
 * Primary: GitHub Issue (if GITHUB_ISSUES_TOKEN set)
 * Fallback: Resend email to Founder
 *
 * Body: { subject: string, message: string }
 */
export async function POST(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, message } = await request.json().catch(() => ({} as Record<string, string>));
  if (!message?.trim()) {
    return NextResponse.json({ error: "Nachricht fehlt" }, { status: 400 });
  }

  // Resolve context for structured issue
  const authClient = await getAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  const userEmail = user?.email ?? "unbekannt";
  const identity = scope.tenantId ? await resolveTenantIdentityById(scope.tenantId) : null;
  const tenantName = identity?.displayName ?? "Unbekannt";
  const tenantSlug = identity?.tenantId ?? scope.tenantId;

  const issueTitle = `[Support] ${subject ?? "Anfrage"} — ${tenantName}`;
  const issueBody = [
    `## Kontext`,
    `- **Betrieb:** ${tenantName}`,
    `- **Gemeldet von:** ${userEmail}`,
    `- **Zeitpunkt:** ${new Date().toISOString()}`,
    `- **Tenant-ID:** ${scope.tenantId ?? "—"}`,
    ``,
    `## Beschreibung`,
    message.trim(),
    ``,
    `---`,
    `*Erstellt aus dem Leitsystem via /ops/hilfe*`,
  ].join("\n");

  const ghToken = process.env.GITHUB_ISSUES_TOKEN;

  if (ghToken) {
    // Primary: GitHub Issue
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

      if (!res.ok) {
        const err = await res.text();
        console.error("[support] GitHub Issue creation failed:", err);
        throw new Error("GitHub API error");
      }

      const issue = await res.json();
      Sentry.captureMessage("Support ticket created", {
        level: "info",
        tags: { area: "support", tenant_id: scope.tenantId ?? "", issue_number: issue.number },
      });

      return NextResponse.json({ ok: true, channel: "github", issueNumber: issue.number });
    } catch {
      // Fall through to email fallback
    }
  }

  // Fallback: Email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const founderEmail = process.env.FOUNDER_EMAIL ?? process.env.MAIL_REPLY_TO;

  if (resendKey && founderEmail) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.MAIL_FROM ?? "noreply@send.flowsight.ch",
        to: founderEmail,
        subject: issueTitle,
        text: issueBody,
      });

      return NextResponse.json({ ok: true, channel: "email" });
    } catch {
      return NextResponse.json({ error: "Senden fehlgeschlagen" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Kein Support-Kanal konfiguriert" }, { status: 500 });
}
