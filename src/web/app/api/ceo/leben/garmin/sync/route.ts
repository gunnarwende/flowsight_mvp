import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { dispatch, isConnected, GARMIN_SYNC_WORKFLOW } from "@/src/lib/leben/garmin";

// POST /api/ceo/leben/garmin/sync — stoesst den Garmin-Abruf an (GitHub Actions).
// Der eigentliche Abruf laeuft in CI (garth); die App triggert nur.
export async function POST() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!(await isConnected())) {
    return NextResponse.json({ error: "not_connected" }, { status: 400 });
  }

  const result = await dispatch(GARMIN_SYNC_WORKFLOW, { limit: "30" });
  if (!result.ok) {
    return NextResponse.json({ error: "dispatch_failed", detail: result.body }, { status: 502 });
  }
  return NextResponse.json({ ok: true, dispatched: true, at: new Date().toISOString() });
}
