import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

// POST /api/review/[caseId]/track — fire-and-forget CTA click tracking
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const supabase = getServiceClient();

  await supabase.from("case_events").insert({
    case_id: caseId,
    event_type: "review_cta_clicked",
    title: "Google-Bewertung ge\u00f6ffnet",
  });

  return NextResponse.json({ ok: true });
}
