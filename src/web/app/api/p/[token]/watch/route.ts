import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

const TAKES = new Set(["t1", "t2", "t2_portrait", "t3", "t4"]);

/**
 * POST /api/p/[token]/watch  (MR2)
 *
 * Records per-take watch DEPTH on a proof page: the max % watched per
 * (token, take, session). This is the honest heat signal (esp. T2 = the call
 * demo = buy signal) — unlike proof_pages.view_count (page-open only) and unlike
 * Bunny's polluted 14-day aggregate. Founder's own views arrive with preview=true
 * (page opened via ?preview=1) and are excluded from the heat signal downstream.
 *
 * Fire-and-forget from the client; always 200, never blocks the page.
 * Body: { take, pct, seconds, sessionId, preview }
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;

  if (!/^[0-9a-f]{16,64}$/i.test(token)) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const take = String(body.take ?? "");
    const sessionId = String(body.sessionId ?? "").slice(0, 64);
    const pct = Math.max(0, Math.min(100, Math.round(Number(body.pct) || 0)));
    const seconds = Math.max(0, Math.round(Number(body.seconds) || 0));
    const preview = body.preview === true;

    if (!TAKES.has(take) || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const supabase = getServiceClient();

    // Verify the token exists (FK + avoids orphan rows from random POSTs).
    const { data: page } = await supabase
      .from("proof_pages")
      .select("token")
      .eq("token", token)
      .single();
    if (!page) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    // Keep the MAX progress for this (token, take, session).
    const { data: existing } = await supabase
      .from("proof_watch")
      .select("max_pct, seconds_watched, is_preview")
      .eq("token", token)
      .eq("take", take)
      .eq("session_id", sessionId)
      .maybeSingle();

    await supabase.from("proof_watch").upsert(
      {
        token,
        take,
        session_id: sessionId,
        max_pct: Math.max(existing?.max_pct ?? 0, pct),
        seconds_watched: Math.max(existing?.seconds_watched ?? 0, seconds),
        is_preview: existing?.is_preview || preview,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "token,take,session_id" }
    );
  } catch {
    // Tracking darf die Seite nie stören.
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
