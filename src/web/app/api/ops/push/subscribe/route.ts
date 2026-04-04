import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getAuthClient } from "@/src/lib/supabase/server-auth";

/**
 * POST /api/ops/push/subscribe — Save Web Push subscription for a tenant staff member.
 * Body: { endpoint, keys: { p256dh, auth } }
 */
export async function POST(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.tenantId || !scope.userId) {
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
  const { error } = await supabase.from("ops_push_subscriptions").upsert(
    {
      tenant_id: scope.tenantId,
      user_id: scope.userId,
      staff_email: user?.email ?? null,
      endpoint,
      keys_p256dh: keys.p256dh,
      keys_auth: keys.auth,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/ops/push/subscribe — Remove subscription.
 */
export async function DELETE(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";

  if (!endpoint) {
    return NextResponse.json({ error: "missing_endpoint" }, { status: 400 });
  }

  const supabase = getServiceClient();
  await supabase.from("ops_push_subscriptions").delete().eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}

/**
 * PATCH /api/ops/push/subscribe — Update notification preferences.
 * Body: { endpoint, notify_notfall?, notify_assignment?, notify_review?, notify_all_cases? }
 */
export async function PATCH(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";

  if (!endpoint) {
    return NextResponse.json({ error: "missing_endpoint" }, { status: 400 });
  }

  const updates: Record<string, boolean> = {};
  if (typeof body.notify_notfall === "boolean") updates.notify_notfall = body.notify_notfall;
  if (typeof body.notify_assignment === "boolean") updates.notify_assignment = body.notify_assignment;
  if (typeof body.notify_review === "boolean") updates.notify_review = body.notify_review;
  if (typeof body.notify_all_cases === "boolean") updates.notify_all_cases = body.notify_all_cases;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no_updates" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("ops_push_subscriptions")
    .update(updates)
    .eq("endpoint", endpoint)
    .eq("user_id", scope.userId);

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
