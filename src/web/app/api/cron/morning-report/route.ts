import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/morning-report  (MR4)
 *
 * Punktueller Auslöser für den Tagesüberblick. GitHub-SCHEDULE-Crons laufen bei
 * diesem Repo chronisch 3–5 h zu spät ("best effort"). workflow_dispatch dagegen
 * startet in Sekunden. Diese Route stösst den Dispatch an — getriggert von einem
 * minutengenauen Scheduler:
 *   - Vercel Cron (vercel.json) wenn Pro, ODER
 *   - ein externer Free-Cron (cron-job.org) auf Hobby — beide treffen dieselbe URL.
 *
 * Sicherheit: wenn CRON_SECRET gesetzt ist, muss der Aufruf
 * `Authorization: Bearer <CRON_SECRET>` mitsenden (Vercel Cron setzt das automatisch).
 * Braucht ausserdem GH_DISPATCH_TOKEN (fine-grained PAT, Actions: read+write auf dem Repo).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const token = process.env.GH_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "GH_DISPATCH_TOKEN not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(
    "https://api.github.com/repos/gunnarwende/flowsight_mvp/actions/workflows/morning-report.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, status: res.status, body: body.slice(0, 500) },
      { status: 502 }
    );
  }

  // GitHub dispatch returns 204 No Content on success.
  return NextResponse.json({ ok: true, dispatched: true, at: new Date().toISOString() });
}
