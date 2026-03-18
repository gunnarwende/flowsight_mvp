import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { validateEinsatzToken } from "@/src/lib/sms/verifySmsToken";

// ---------------------------------------------------------------------------
// POST /api/einsatz/status
// Update case status from technician micro-surface (no login, HMAC-secured).
// Body: { caseRef: "WB-0042", token: "abc123", status: "in_arbeit"|"done" }
// ---------------------------------------------------------------------------

const ALLOWED_STATUSES = ["in_arbeit", "done"] as const;
const STATUS_LABELS: Record<string, string> = {
  in_arbeit: "In Arbeit",
  done: "Erledigt",
};

export async function POST(request: NextRequest) {
  let body: { caseRef?: string; token?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { caseRef, token, status } = body;
  if (!caseRef || !token || !status) {
    return NextResponse.json({ error: "caseRef, token, status required" }, { status: 400 });
  }

  if (!ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
    return NextResponse.json({ error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}` }, { status: 400 });
  }

  // Parse caseRef
  const match = caseRef.match(/^([A-Z]{1,4})-(\d+)$/i);
  if (!match) {
    return NextResponse.json({ error: "Invalid caseRef format" }, { status: 400 });
  }

  const seqNumber = parseInt(match[2], 10);
  const supabase = getServiceClient();

  // Look up case
  const { data: row } = await supabase
    .from("cases")
    .select("id, created_at, status")
    .eq("seq_number", seqNumber)
    .single();

  if (!row) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  // Validate HMAC token
  if (!validateEinsatzToken(row.id, row.created_at, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // Don't downgrade status (done → in_arbeit not allowed)
  if (row.status === "done" && status !== "done") {
    return NextResponse.json({ error: "Case already done" }, { status: 400 });
  }

  // Update status
  const { error: updateErr } = await supabase
    .from("cases")
    .update({ status })
    .eq("id", row.id);

  if (updateErr) {
    Sentry.captureException(updateErr, {
      tags: { area: "api", feature: "einsatz_status", case_id: row.id },
    });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Log event
  const oldStatus = row.status;
  if (oldStatus !== status) {
    await supabase.from("case_events").insert({
      case_id: row.id,
      event_type: "status_changed",
      title: `Status via Einsatz-Link: ${STATUS_LABELS[oldStatus] ?? oldStatus} → ${STATUS_LABELS[status] ?? status}`,
      metadata: { from: oldStatus, to: status, source: "einsatz_surface" },
    }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });
  }

  console.log(JSON.stringify({
    _tag: "einsatz_status",
    decision: "updated",
    case_id: row.id,
    from: oldStatus,
    to: status,
  }));

  return NextResponse.json({ ok: true, status });
}
