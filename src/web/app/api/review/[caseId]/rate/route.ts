import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { validateVerifyToken } from "@/src/lib/sms/verifySmsToken";

// POST /api/review/[caseId]/rate — Save customer rating + optional text from review surface
export async function POST(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;

  let rating: number;
  let text: string | null = null;
  let token: string | null = null;
  try {
    const body = await req.json();
    rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }
    if (typeof body.text === "string" && body.text.trim().length > 0) {
      text = body.text.trim().slice(0, 2000);
    }
    if (typeof body.token === "string") {
      token = body.token;
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Get case data for token validation + push notification
  const { data: caseRow } = await supabase
    .from("cases")
    .select("tenant_id, reporter_name, created_at")
    .eq("id", caseId)
    .single();

  if (!caseRow) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  // Token validation — prevents unauthenticated rating spam
  if (!token || !validateVerifyToken(caseId, caseRow.created_at, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const updatePayload: Record<string, unknown> = {
    review_rating: rating,
    review_received_at: new Date().toISOString(),
  };
  if (text !== null) {
    updatePayload.review_text = text;
  }

  const { error } = await supabase
    .from("cases")
    .update(updatePayload)
    .eq("id", caseId);

  if (error) {
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }

  // Track event (B7: negative reviews flagged)
  const isNegativeReview = rating <= 3;
  await supabase.from("case_events").insert({
    case_id: caseId,
    event_type: "review_rated",
    title: isNegativeReview
      ? `⚠️ Negatives Feedback: ${rating} Stern${rating !== 1 ? "e" : ""}`
      : `Kundenbewertung: ${rating} Stern${rating !== 1 ? "e" : ""}`,
    metadata: {
      ...(text ? { text_preview: text.slice(0, 200) } : {}),
      is_negative: isNegativeReview,
    },
  });

  // Push notification to tenant staff (best-effort)
  // B7: Negative reviews (≤3★) get urgent title to alert the business immediately
  if (caseRow?.tenant_id) {
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const name = caseRow.reporter_name ?? "Kunde";
    const isNegative = rating <= 3;
    const title = isNegative
      ? `⚠️ Negatives Feedback (${rating}★)`
      : `Bewertung erhalten: ${stars}`;
    const bodyText = text
      ? `${name}: ${text.slice(0, 80)}${text.length > 80 ? "…" : ""}`
      : `${name} hat ${rating} Sterne vergeben`;
    import("@/src/lib/push/sendOpsPush").then(({ sendOpsPush }) =>
      sendOpsPush({
        tenantId: caseRow.tenant_id,
        eventType: isNegative ? "notfall" : "review", // Negative = urgent event type for louder push
        title,
        body: bodyText,
        url: `/ops/cases/${caseId}`,
        tag: `review-${caseId}`,
      })
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
