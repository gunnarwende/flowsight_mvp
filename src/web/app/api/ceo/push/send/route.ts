import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * POST /api/ceo/push/send — Send push notification to all CEO subscriptions.
 * Body: { title, body, url?, tag? }
 * Auth: admin only (or internal via LIFECYCLE_TICK_SECRET)
 */
export async function POST(request: NextRequest) {
  // Auth: admin session OR Bearer token (for cron/internal use)
  const authHeader = request.headers.get("authorization");
  const tickSecret = process.env.LIFECYCLE_TICK_SECRET;
  const isBearerAuth = authHeader === `Bearer ${tickSecret}` && tickSecret;

  if (!isBearerAuth) {
    const scope = await resolveTenantScope();
    if (!scope?.isAdmin) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const title = typeof body.title === "string" ? body.title : "FlowSight";
  const message = typeof body.body === "string" ? body.body : "";
  const url = typeof body.url === "string" ? body.url : "/ceo/pulse";
  const tag = typeof body.tag === "string" ? body.tag : undefined;

  if (!message) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: "vapid_not_configured" }, { status: 500 });
  }

  // Dynamic import (web-push is server-only)
  const webpush = await import("web-push");
  webpush.setVapidDetails("mailto:support@flowsight.ch", vapidPublic, vapidPrivate);

  const supabase = getServiceClient();
  const { data: subs } = await supabase.from("ceo_push_subscriptions").select("endpoint, keys_p256dh, keys_auth");

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: "no_subscriptions" });
  }

  const payload = JSON.stringify({ title, body: message, url, tag });
  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
        },
        payload,
      );
      sent++;
    } catch (err: unknown) {
      failed++;
      // Remove expired subscriptions (410 Gone)
      if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
        await supabase.from("ceo_push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}
