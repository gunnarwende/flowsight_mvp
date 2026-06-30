import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";
import { stravaConfigured, webhookVerifyToken, appOrigin } from "@/src/lib/leben/strava";

// ---------------------------------------------------------------------------
// Strava Push-Subscription verwalten (Webhook fuer Auto-Import).
//   GET    = bestehende Subscription anzeigen
//   POST   = Subscription anlegen (Strava validiert sofort den Webhook-GET)
//   DELETE = Subscription entfernen
// Hinweis: braucht eine oeffentlich erreichbare URL (Produktion), nicht localhost.
// ---------------------------------------------------------------------------

const PUSH = "https://www.strava.com/api/v3/push_subscriptions";

async function adminGuard() {
  const scope = await resolveTenantScope();
  return Boolean(scope?.isAdmin);
}

export async function GET() {
  if (!(await adminGuard())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!stravaConfigured()) return NextResponse.json({ error: "strava_not_configured" }, { status: 503 });

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    client_secret: process.env.STRAVA_CLIENT_SECRET!,
  });
  const res = await fetch(`${PUSH}?${params.toString()}`);
  const data = await res.json().catch(() => null);
  return NextResponse.json({ subscriptions: data });
}

export async function POST(req: NextRequest) {
  if (!(await adminGuard())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!stravaConfigured()) return NextResponse.json({ error: "strava_not_configured" }, { status: 503 });

  const callbackUrl = `${appOrigin(req)}/api/ceo/leben/strava/webhook`;
  const res = await fetch(PUSH, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      callback_url: callbackUrl,
      verify_token: webhookVerifyToken(),
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json({ error: "subscribe_failed", detail: data, callbackUrl }, { status: res.status });
  }

  if (data?.id) {
    const supabase = getServiceClient();
    await supabase
      .from("life_settings")
      .upsert({ key: "strava_subscription", value: data, updated_at: new Date().toISOString() }, { onConflict: "key" });
  }
  return NextResponse.json({ ok: true, subscription: data });
}

export async function DELETE() {
  if (!(await adminGuard())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!stravaConfigured()) return NextResponse.json({ error: "strava_not_configured" }, { status: 503 });

  const supabase = getServiceClient();
  const { data: row } = await supabase
    .from("life_settings")
    .select("value")
    .eq("key", "strava_subscription")
    .maybeSingle();

  const subId = (row?.value as { id?: number } | null)?.id;
  if (!subId) return NextResponse.json({ ok: true, note: "no_subscription" });

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    client_secret: process.env.STRAVA_CLIENT_SECRET!,
  });
  await fetch(`${PUSH}/${subId}?${params.toString()}`, { method: "DELETE" });
  await supabase.from("life_settings").delete().eq("key", "strava_subscription");
  return NextResponse.json({ ok: true });
}
