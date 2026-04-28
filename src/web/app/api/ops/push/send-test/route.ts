import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { sendOpsPush } from "@/src/lib/push/sendOpsPush";

/**
 * POST /api/ops/push/send-test
 * Sends a test notification to the calling user only (targetUserId scoped).
 * Used by the PushEnableCard's "Send test notification" button to verify
 * the full subscribe → deliver → display chain end-to-end.
 */
export async function POST() {
  const scope = await resolveTenantScope();
  if (!scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!scope.tenantId) {
    return NextResponse.json({ error: "No tenant scope" }, { status: 400 });
  }

  const result = await sendOpsPush({
    tenantId: scope.tenantId,
    eventType: "case",
    title: "Test notification",
    body: "If you see this, push delivery works end-to-end.",
    url: "/ops/pub-dashboard",
    tag: "push-test-" + Date.now(),
    targetUserId: scope.userId,
  });

  return NextResponse.json(result);
}
