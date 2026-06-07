import { NextResponse } from "next/server";
import { saveCockpitDraft } from "@/src/lib/cockpit/cockpitSessions";
import type { CockpitDraft } from "@/src/lib/cockpit/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/aufbau/[token]/save — Autosave eines Cockpit-Strangs (OC6).
 *
 * Token-authed (Prospect ohne Login, wie /p/[token]). Body:
 *   { draftPatch: <vollständiger Strang>, progressPatch?: { <key>: boolean } }
 * Merge-Regel: Top-Level-Stränge werden ERSETZT (Client sendet den ganzen
 * Strang), `stepDone` + `progress` key-weise gemerged (siehe cockpitSessions.ts).
 *
 * Schreibt NUR in `draft` — nie live. Nur im Status "building" erlaubt.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  if (!/^[0-9a-f]{24}$/i.test(token)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as
    | { draftPatch?: CockpitDraft; progressPatch?: Record<string, boolean> }
    | null;
  if (!body || typeof body !== "object" || typeof body.draftPatch !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await saveCockpitDraft({
      token,
      draftPatch: body.draftPatch ?? {},
      progressPatch: body.progressPatch,
    });
    if (!result.ok) {
      // not_found → 404; locked (bereits abgesendet) → 409
      const status = result.reason === "not_found" ? 404 : 409;
      return NextResponse.json({ error: result.reason }, { status });
    }
    return NextResponse.json({
      ok: true,
      progress: result.session?.progress ?? {},
      updated_at: result.session?.updated_at ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
