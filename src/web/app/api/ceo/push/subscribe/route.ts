import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getAuthClient } from "@/src/lib/supabase/server-auth";

/**
 * POST /api/ceo/push/subscribe — Save Web Push subscription.
 * Body: { endpoint, keys: { p256dh, auth } }
 */
export async function POST(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  const keys = body.keys as { p256dh?: string; auth?: string } | undefined;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
  }

  const authClient = await getAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  const supabase = getServiceClient();
  const { error } = await supabase.from("ceo_push_subscriptions").upsert(
    {
      endpoint,
      keys_p256dh: keys.p256dh,
      keys_auth: keys.auth,
      user_email: user?.email ?? null,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/ceo/push/subscribe — Remove subscription.
 * Body: { endpoint }
 */
export async function DELETE(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";

  if (!endpoint) {
    return NextResponse.json({ error: "missing_endpoint" }, { status: 400 });
  }

  const supabase = getServiceClient();
  await supabase.from("ceo_push_subscriptions").delete().eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}
