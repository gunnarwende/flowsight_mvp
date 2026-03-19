import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

// POST /api/review/[caseId]/rate — Save customer rating from review surface
export async function POST(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;

  let rating: number;
  try {
    const body = await req.json();
    rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { error } = await supabase
    .from("cases")
    .update({
      review_rating: rating,
      review_received_at: new Date().toISOString(),
    })
    .eq("id", caseId);

  if (error) {
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }

  // Track event
  await supabase.from("case_events").insert({
    case_id: caseId,
    event_type: "review_rated",
    title: `Kundenbewertung: ${rating} Stern${rating !== 1 ? "e" : ""}`,
  });

  return NextResponse.json({ ok: true });
}
