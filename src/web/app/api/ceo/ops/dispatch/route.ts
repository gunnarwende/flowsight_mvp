import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

export const dynamic = "force-dynamic";

/**
 * POST /api/ceo/ops/dispatch
 * Body: { workflow: string, inputs?: Record<string, string> }
 *
 * Löst einen GitHub-Workflow (workflow_dispatch) aus — das Cockpit-Bedienpult
 * für Mobil-Parität: das Handy fasst keinen Key an, es triggert nur; der Lauf
 * hat in CI vollen Key-Zugriff. Selbes Muster wie api/cron/morning-report,
 * hier admin-gated + auf eine Whitelist erlaubter Workflows beschränkt.
 *
 * Braucht GH_DISPATCH_TOKEN (fine-grained PAT, Actions: read+write) im
 * Vercel-Runtime-Env.
 */
const ALLOWED = new Set(["crawl.yml", "purge.yml", "discover.yml", "enrich.yml"]);

export async function POST(req: Request) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.GH_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GH_DISPATCH_TOKEN not configured" }, { status: 500 });
  }

  let body: { workflow?: string; inputs?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const workflow = body.workflow ?? "";
  if (!ALLOWED.has(workflow)) {
    return NextResponse.json({ error: "workflow not allowed" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.github.com/repos/gunnarwende/flowsight_mvp/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main", inputs: body.inputs ?? {} }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, status: res.status, body: text.slice(0, 500) },
      { status: 502 }
    );
  }

  // GitHub dispatch returns 204 No Content on success.
  return NextResponse.json({ ok: true, dispatched: workflow, at: new Date().toISOString() });
}
