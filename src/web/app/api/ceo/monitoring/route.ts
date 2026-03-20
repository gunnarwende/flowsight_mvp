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

  // ── System info ─────────────────────────────────────────────────────
  const systemInfo = {
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    env: process.env.VERCEL_ENV ?? "development",
    nodeVersion: process.version,
  };

  return NextResponse.json({
    health,
    snapshots: snapshots ?? [],
    systemInfo,
    fetched_at: new Date().toISOString(),
  });
}
