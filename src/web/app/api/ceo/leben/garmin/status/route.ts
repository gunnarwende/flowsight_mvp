import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { isConnected, getSetting } from "@/src/lib/leben/garmin";

// GET /api/ceo/leben/garmin/status — Verbindungs-Status fuer die UI.
export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const connected = await isConnected().catch(() => false);
  const lastSync = await getSetting<{ at?: string; count?: number }>("garmin_last_sync").catch(() => null);
  const dispatchReady = Boolean(process.env.GH_DISPATCH_TOKEN);

  return NextResponse.json({
    connected,
    lastSync: lastSync?.at ?? null,
    lastCount: lastSync?.count ?? null,
    dispatchReady,
  });
}
