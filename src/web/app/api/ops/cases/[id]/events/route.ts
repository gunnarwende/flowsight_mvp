import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

// GET /api/ops/cases/[id]/events — Fetch timeline events for a case
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("case_events")
    .select("*")
    .eq("case_id", id)
    .order("created_at");

  if (error) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(data ?? []);
}
