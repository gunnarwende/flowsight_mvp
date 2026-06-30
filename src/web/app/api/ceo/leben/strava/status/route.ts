import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";
import { stravaConfigured, getTokenRow } from "@/src/lib/leben/strava";

// GET /api/ceo/leben/strava/status — Verbindungs-Status fuer die UI.
export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const configured = stravaConfigured();
  const token = configured ? await getTokenRow().catch(() => null) : null;

  let webhookActive = false;
  if (configured) {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("life_settings")
      .select("value")
      .eq("key", "strava_subscription")
      .maybeSingle();
    webhookActive = Boolean((data?.value as { id?: number } | null)?.id);
  }

  return NextResponse.json({
    configured,
    connected: Boolean(token),
    athlete_name: token?.athlete_name ?? null,
    webhookActive,
  });
}
