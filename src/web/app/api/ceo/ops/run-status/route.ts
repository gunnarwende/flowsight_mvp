import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

export const dynamic = "force-dynamic";

/**
 * GET /api/ceo/ops/run-status
 *
 * Liefert den Status des jüngsten „Go"-Laufs (discover.yml) — Discovery +
 * Anreicherung (Inhaber/Mail/Größe). Damit zeigt das Cockpit oben ein kleines
 * Rädchen „läuft…" bzw. ein grünes ✓ „fertig", ohne dass das Handy einen Key
 * anfasst. Admin-gated, read-only; nutzt denselben GH_DISPATCH_TOKEN wie der
 * Dispatch (Actions: read genügt).
 */
export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.GH_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GH_DISPATCH_TOKEN not configured" }, { status: 500 });
  }

  const res = await fetch(
    "https://api.github.com/repos/gunnarwende/flowsight_mvp/actions/workflows/discover.yml/runs?per_page=1",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ ok: false, status: res.status, body: text.slice(0, 300) }, { status: 502 });
  }

  const data = await res.json();
  const run = data.workflow_runs?.[0];
  if (!run) return NextResponse.json({ ok: true, state: "none" });

  return NextResponse.json({
    ok: true,
    id: run.id ?? null,
    state: run.status, // queued | in_progress | completed
    conclusion: run.conclusion ?? null, // success | failure | … (nur wenn completed)
    started_at: run.run_started_at ?? run.created_at ?? null,
    url: run.html_url ?? null,
  });
}

/**
 * POST /api/ceo/ops/run-status  Body: { run_id: number }
 * Bricht den laufenden „Go"-Lauf ab (Stopp-Symbol im Cockpit). Admin-gated.
 */
export async function POST(req: Request) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = process.env.GH_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GH_DISPATCH_TOKEN not configured" }, { status: 500 });
  }

  let body: { run_id?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }
  const runId = Number(body.run_id);
  if (!Number.isInteger(runId) || runId <= 0) {
    return NextResponse.json({ error: "run_id fehlt/ungültig" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.github.com/repos/gunnarwende/flowsight_mvp/actions/runs/${runId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  // GitHub: 202 Accepted bei Erfolg; 409 wenn der Lauf schon fertig/abbrechend ist.
  if (!res.ok && res.status !== 409) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ ok: false, status: res.status, body: text.slice(0, 300) }, { status: 502 });
  }
  return NextResponse.json({ ok: true, cancelled: runId, already: res.status === 409 });
}
