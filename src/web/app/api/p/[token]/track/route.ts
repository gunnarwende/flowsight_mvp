import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/p/[token]/track
 *
 * Records a page-open on a proof page: bumps view_count, sets first/last
 * viewed timestamps. This is the "wurde überhaupt geöffnet"-Signal that drives
 * the tracking-gesteuerte Outreach-Kadenz (Tag 0/3/6-7). Detailed per-video
 * watch/device analytics come from Bunny Stream itself.
 *
 * Fire-and-forget from the client; always returns 200 (never blocks the page).
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;

  if (!/^[0-9a-f]{16,64}$/i.test(token)) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("proof_pages")
      .select("view_count, first_viewed_at")
      .eq("token", token)
      .single();

    if (data) {
      const now = new Date().toISOString();
      await supabase
        .from("proof_pages")
        .update({
          view_count: (data.view_count ?? 0) + 1,
          last_viewed_at: now,
          first_viewed_at: data.first_viewed_at ?? now,
        })
        .eq("token", token);
    }
  } catch {
    // Tracking darf die Seite nie stören.
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
