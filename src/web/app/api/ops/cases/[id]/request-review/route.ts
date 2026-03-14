import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { sendReviewRequest } from "@/src/lib/email/resend";
import { sendSms } from "@/src/lib/sms/sendSms";
import { getTenantSmsConfig } from "@/src/lib/tenants/getTenantSmsConfig";
import { generateVerifyToken } from "@/src/lib/sms/verifySmsToken";

// ---------------------------------------------------------------------------
// POST /api/ops/cases/[id]/request-review
// Gate: status=done AND (contact_email OR contact_phone)
// Max 2 requests per case, 7-day cooldown between requests (NS3)
// Allowed: admin, tenant, prospect (prospect can trigger reviews)
// ---------------------------------------------------------------------------

const MAX_REVIEW_REQUESTS = 2;
const RESEND_COOLDOWN_DAYS = 7;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // ── Auth (tenant-scoped) ───────────────────────────────────────────────
  const scope = await resolveTenantScope();
  if (!scope) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // ── Load case ─────────────────────────────────────────────────────────
  const supabase = getServiceClient();
  const { data: row, error: dbError } = await supabase
    .from("cases")
    .select("id, created_at, tenant_id, status, contact_email, contact_phone, review_sent_at")
    .eq("id", id)
    .single();

  if (dbError || !row) {
    return NextResponse.json({ error: "case_not_found" }, { status: 404 });
  }

  // ── Tenant isolation ────────────────────────────────────────────────
  if (!scope.isAdmin && scope.tenantId && row.tenant_id !== scope.tenantId) {
    return NextResponse.json({ error: "case_not_found" }, { status: 404 });
  }

  // ── Gate checks ───────────────────────────────────────────────────────
  if (row.status !== "done") {
    return NextResponse.json(
      { error: "case_not_done", status: row.status },
      { status: 400 },
    );
  }

  if (!row.contact_email && !row.contact_phone) {
    return NextResponse.json({ error: "no_contact_info" }, { status: 400 });
  }

  // ── Resend logic (NS3): max 2 requests, 7-day cooldown ──────────────
  const { data: reviewEvents } = await supabase
    .from("case_events")
    .select("created_at")
    .eq("case_id", id)
    .eq("event_type", "review_requested")
    .order("created_at", { ascending: false });

  const reviewCount = reviewEvents?.length ?? 0;

  if (reviewCount >= MAX_REVIEW_REQUESTS) {
    return NextResponse.json(
      { error: "max_reviews_reached", count: reviewCount },
      { status: 409 },
    );
  }

  if (reviewCount > 0 && reviewEvents?.[0]) {
    const lastSent = new Date(reviewEvents[0].created_at);
    const daysSince = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < RESEND_COOLDOWN_DAYS) {
      return NextResponse.json(
        { error: "cooldown_active", days_remaining: Math.ceil(RESEND_COOLDOWN_DAYS - daysSince) },
        { status: 429 },
      );
    }
  }

  // Check for explicit skip
  const { data: skipEvents } = await supabase
    .from("case_events")
    .select("id")
    .eq("case_id", id)
    .eq("event_type", "review_skipped")
    .limit(1);

  if (skipEvents && skipEvents.length > 0) {
    return NextResponse.json(
      { error: "review_skipped" },
      { status: 409 },
    );
  }

  // ── Tenant info (name + modules) ─────────────────────────────────────
  let googleReviewUrl: string | undefined;
  let tenantDisplayName: string | undefined;
  {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name, modules")
      .eq("id", row.tenant_id)
      .single();

    tenantDisplayName = tenant?.name ?? undefined;
    const modules = tenant?.modules as Record<string, unknown> | null;
    if (typeof modules?.google_review_url === "string" && modules.google_review_url.length > 0) {
      googleReviewUrl = modules.google_review_url;
    }
  }
  if (!googleReviewUrl) {
    googleReviewUrl = process.env.GOOGLE_REVIEW_URL;
  }
  // google_review_url is optional — our own review surface is always the primary link.
  // The Google URL only appears as a "Posten" button on the review surface itself.

  // ── Build review surface URL (always the primary link) ────────────────
  const baseUrl =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://flowsight.ch";
  const reviewToken = generateVerifyToken(id, row.created_at);
  const reviewSurfaceUrl = `${baseUrl}/review/${id}?token=${reviewToken}`;

  // ── Send review request (email preferred, SMS fallback) ──────────────
  Sentry.setTag("case_id", id);
  Sentry.setTag("tenant_id", row.tenant_id);

  let sent = false;
  let channel: "email" | "sms" = "email";

  if (row.contact_email) {
    Sentry.setTag("area", "email");
    sent = await sendReviewRequest({
      caseId: id,
      tenantId: row.tenant_id,
      tenantDisplayName,
      contactEmail: row.contact_email,
      reviewSurfaceUrl,
      googleReviewUrl,
    });
    channel = "email";
  }

  if (!sent && row.contact_phone) {
    Sentry.setTag("area", "sms");
    channel = "sms";
    const smsConfig = await getTenantSmsConfig(row.tenant_id);
    const senderName = smsConfig?.senderName ?? "FlowSight";
    const smsBody = [
      `${senderName}: Wie war unser Service?`,
      ``,
      `Wir hoffen, Sie waren zufrieden. Über eine kurze Bewertung würden wir uns sehr freuen:`,
      reviewSurfaceUrl,
      ``,
      `Vielen Dank für Ihr Vertrauen — Ihr Service-Team`,
    ].join("\n");
    const smsResult = await sendSms(row.contact_phone, smsBody, senderName);
    sent = smsResult.sent;
  }

  if (!sent) {
    return NextResponse.json({ error: "review_send_failed", channel }, { status: 502 });
  }

  // review_requested event (fire-and-forget)
  await supabase.from("case_events").insert({
    case_id: id,
    event_type: "review_requested",
    title: `Review-Anfrage via ${channel === "email" ? "E-Mail" : "SMS"} gesendet`,
    metadata: { channel },
  }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });

  // ── Set review_sent_at ────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from("cases")
    .update({ review_sent_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    Sentry.captureException(updateError, {
      tags: {
        _tag: "resend",
        area: "email",
        email_type: "review_request",
        case_id: id,
        stage: "db",
        error_code: "DB_UPDATE_ERROR",
      },
    });
    // Email was sent, so return success with a warning
    return NextResponse.json({ ok: true, warning: "email_sent_but_timestamp_failed" });
  }

  return NextResponse.json({ ok: true, channel });
}
