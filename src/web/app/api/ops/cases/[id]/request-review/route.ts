import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { sendReviewRequest } from "@/src/lib/email/resend";

// ---------------------------------------------------------------------------
// POST /api/ops/cases/[id]/request-review
// Gate: status=done AND contact_email present AND review_sent_at IS NULL
// ---------------------------------------------------------------------------

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // ── Auth ──────────────────────────────────────────────────────────────
  const supabaseAuth = await getAuthClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // ── Load case ─────────────────────────────────────────────────────────
  const supabase = getServiceClient();
  const { data: row, error: dbError } = await supabase
    .from("cases")
    .select("id, tenant_id, status, contact_email, review_sent_at")
    .eq("id", id)
    .single();

  if (dbError || !row) {
    return NextResponse.json({ error: "case_not_found" }, { status: 404 });
  }

  // ── Gate checks ───────────────────────────────────────────────────────
  if (row.status !== "done") {
    return NextResponse.json(
      { error: "case_not_done", status: row.status },
      { status: 400 },
    );
  }

  if (!row.contact_email) {
    return NextResponse.json({ error: "no_contact_email" }, { status: 400 });
  }

  if (row.review_sent_at) {
    return NextResponse.json(
      { error: "review_already_sent", sent_at: row.review_sent_at },
      { status: 409 },
    );
  }

  // ── Google Review URL ─────────────────────────────────────────────────
  const googleReviewUrl = process.env.GOOGLE_REVIEW_URL;
  if (!googleReviewUrl) {
    Sentry.captureMessage("GOOGLE_REVIEW_URL not configured", {
      level: "warning",
      tags: {
        _tag: "resend",
        area: "email",
        email_type: "review_request",
        case_id: id,
        error_code: "NO_REVIEW_URL",
      },
    });
    return NextResponse.json(
      { error: "review_url_not_configured" },
      { status: 500 },
    );
  }

  // ── Send review request email ─────────────────────────────────────────
  Sentry.setTag("area", "email");
  Sentry.setTag("case_id", id);
  Sentry.setTag("tenant_id", row.tenant_id);

  const sent = await sendReviewRequest({
    caseId: id,
    tenantId: row.tenant_id,
    contactEmail: row.contact_email,
    googleReviewUrl,
  });

  if (!sent) {
    return NextResponse.json({ error: "email_send_failed" }, { status: 502 });
  }

  // review_requested event (fire-and-forget)
  await supabase.from("case_events").insert({
    case_id: id,
    event_type: "review_requested",
    title: "Review-Anfrage an Kunden gesendet",
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

  return NextResponse.json({ ok: true });
}
