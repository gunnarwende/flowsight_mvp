import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * Send push notification to tenant staff — server-side helper.
 * Used by webhook, cases API, notify-assignees, etc.
 *
 * Does NOT throw — returns result silently. Push is best-effort.
 */
export async function sendOpsPush(opts: {
  tenantId: string;
  eventType: "notfall" | "assignment" | "review" | "negative_review" | "case";
  title: string;
  body: string;
  url?: string;
  tag?: string;
  targetUserId?: string;
}): Promise<{ sent: number; failed: number }> {
  try {
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublic || !vapidPrivate) {
      return { sent: 0, failed: 0 };
    }

    const supabase = getServiceClient();

    let query = supabase
      .from("ops_push_subscriptions")
      .select("endpoint, keys_p256dh, keys_auth, user_id, notify_notfall, notify_assignment, notify_review, notify_all_cases")
      .eq("tenant_id", opts.tenantId);

    if (opts.targetUserId) {
      query = query.eq("user_id", opts.targetUserId);
    }

    const { data: subs } = await query;
    if (!subs || subs.length === 0) return { sent: 0, failed: 0 };

    // Filter by preferences (negative_review always pushes — business-critical, no opt-out)
    const filtered = subs.filter((s) => {
      switch (opts.eventType) {
        case "notfall": return s.notify_notfall;
        case "negative_review": return true; // always push — cannot be disabled
        case "assignment": return s.notify_assignment;
        case "review": return s.notify_review;
        case "case": return s.notify_all_cases;
        default: return true;
      }
    });

    if (filtered.length === 0) return { sent: 0, failed: 0 };

    const webpush = await import("web-push");
    webpush.setVapidDetails("mailto:support@flowsight.ch", vapidPublic, vapidPrivate);

    const payload = JSON.stringify({
      title: opts.title,
      body: opts.body,
      url: opts.url ?? "/ops/cases",
      tag: opts.tag,
    });

    let sent = 0;
    let failed = 0;
    const expired: string[] = [];

    for (const sub of filtered) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
          payload,
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) expired.push(sub.endpoint);
        failed++;
      }
    }

    // Cleanup expired
    if (expired.length > 0) {
      await supabase.from("ops_push_subscriptions").delete().in("endpoint", expired);
    }

    return { sent, failed };
  } catch {
    return { sent: 0, failed: 0 };
  }
}
