import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { backfill, getTokenRow } from "@/src/lib/leben/strava";

// POST /api/ceo/leben/strava/sync — manueller Abgleich (letzte ~30 Aktivitaeten).
// Normalfall ist der Webhook (automatisch); dies ist der "Jetzt aktualisieren"-Knopf.
export async function POST() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = await getTokenRow();
  if (!token) {
    return NextResponse.json({ error: "not_connected" }, { status: 400 });
  }
  try {
    const count = await backfill(50);
    return NextResponse.json({ ok: true, synced: count });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
