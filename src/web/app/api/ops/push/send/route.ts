import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * POST /api/ops/push/send — Send push notification to tenant staff.
 *
 * Body: {
 *   tenant_id: string,          // required
 *   event_type: "notfall" | "assignment" | "review" | "case", // for preference filtering
 *   title: string,
 *   body: string,
 *   url?: string,               // deep-link (default: /ops/cases)
 *   tag?: string,               // dedup tag
 *   target_user_id?: string,    // if set, only send to this user (for assignments)
 * }
 *
 * Auth: internal only (called from webhook/cases API, not from client).
 * Uses service client — no user auth needed.
 */
export async function POST(request: NextRequest) {
  // Simple auth: only callable from same server (check internal header or skip auth for now)
  // In production, add Bearer token check like CEO push/send

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const tenantId = typeof body.tenant_id === "string" ? body.tenant_id : "";
  const eventType = typeof body.event_type === "string" ? body.event_type : "case";
  const title = typeof body.title === "string" ? body.title : "Leitsystem";
  const message = typeof body.body === "string" ? body.body : "";
  const url = typeof body.url === "string" ? body.url : "/ops/cases";
  const tag = typeof body.tag === "string" ? body.tag : undefined;
  const targetUserId = typeof body.target_user_id === "string" ? body.target_user_id : undefined;

  if (!tenantId || !message) {
    return NextResponse.json({ error: "tenant_id and body required" }, { status: 400 });
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ ok: true, sent: 0, reason: "vapid_not_configured" });
  }

  const supabase = getServiceClient();

  // Get subscriptions for this tenant, filtered by event preferences
  let query = supabase
    .from("ops_push_subscriptions")
    .select("endpoint, keys_p256dh, keys_auth, user_id, notify_notfall, notify_assignment, notify_review, notify_all_cases")
    .eq("tenant_id", tenantId);

  // If targeting a specific user (assignment), only send to them
  if (targetUserId) {
    query = query.eq("user_id", targetUserId);
  }

  const { data: subs } = await query;

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: "no_subscriptions" });
  }

  // Filter by notification preferences
  const filtered = subs.filter((s) => {
    switch (eventType) {
      case "notfall": return s.notify_notfall;
      case "assignment": return s.notify_assignment;
      case "review": return s.notify_review;
      case "case": return s.notify_all_cases;
      default: return true;
    }
  });

  if (filtered.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: "all_muted" });
  }

  const webpush = await import("web-push");
  webpush.setVapidDetails("mailto:support@flowsight.ch", vapidPublic, vapidPrivate);

  const payload = JSON.stringify({ title, body: message, url, tag });
  let sent = 0;
  let failed = 0;
  const expired: string[] = [];

  for (const sub of filtered) {
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
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 410 || status === 404) {
        expired.push(sub.endpoint);
      }
      failed++;
    }
  }

  // Clean up expired subscriptions
  if (expired.length > 0) {
    await supabase
      .from("ops_push_subscriptions")
      .delete()
      .in("endpoint", expired);
  }

  return NextResponse.json({ ok: true, sent, failed, expired: expired.length });
}
