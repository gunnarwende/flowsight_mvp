import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // ── Live health check ───────────────────────────────────────────────
  let health: Record<string, unknown> = { ok: false, db: "?", email: "?" };
  try {
    const baseUrl =
      process.env.APP_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://flowsight.ch";
    const res = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      health = await res.json();
    }
  } catch {
    /* health check failed */
  }

  // ── Recent pulse snapshots (last 7) ─────────────────────────────────
  const supabase = getServiceClient();
  const { data: snapshots } = await supabase
    .from("ceo_pulse_snapshots")
    .select("id, severity, snapshot_at, cases_24h, backlog_new, stuck_48h")
    .order("snapshot_at", { ascending: false })
    .limit(7);

  // ── Sentry Digest (last 24h unresolved issues) ─────────────────────
  let sentryIssues: { title: string; culprit: string; count: string; lastSeen: string; level: string }[] = [];
  const sentryToken = process.env.SENTRY_API_TOKEN;
  const sentryOrg = process.env.SENTRY_ORG;
  const sentryProject = process.env.SENTRY_PROJECT;

  if (sentryToken && sentryOrg && sentryProject) {
    try {
      const sentryRes = await fetch(
        `https://sentry.io/api/0/projects/${sentryOrg}/${sentryProject}/issues/?query=is:unresolved&limit=25&sort=freq`,
        {
          headers: { Authorization: `Bearer ${sentryToken}` },
          signal: AbortSignal.timeout(8000),
        },
      );
      if (sentryRes.ok) {
        const issues = await sentryRes.json();
        sentryIssues = (issues as Array<Record<string, unknown>>).map((i) => ({
          title: String(i.title ?? ""),
          culprit: String(i.culprit ?? ""),
          count: String(i.count ?? "0"),
          lastSeen: String(i.lastSeen ?? ""),
          level: String(i.level ?? "error"),
        }));
      }
    } catch {
      /* Sentry API not reachable — graceful */
    }
  }

  // ── System info ─────────────────────────────────────────────────────
  const systemInfo = {
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    env: process.env.VERCEL_ENV ?? "development",
    nodeVersion: process.version,
  };

  return NextResponse.json({
    health,
    snapshots: snapshots ?? [],
    sentryIssues,
    sentryConfigured: !!(sentryToken && sentryOrg && sentryProject),
    systemInfo,
    fetched_at: new Date().toISOString(),
  });
}
