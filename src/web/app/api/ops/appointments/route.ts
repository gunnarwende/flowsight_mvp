import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { generateIcs } from "@/src/lib/ics/generateIcs";
import { sendAppointmentIcsEmail } from "@/src/lib/email/resend";

/**
 * GET /api/ops/appointments — List appointments (optionally filtered by case_id or staff_id)
 * POST /api/ops/appointments — Create a new appointment + send ICS email
 */

export async function GET(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get("case_id");
  const staffId = searchParams.get("staff_id");
  const dateFrom = searchParams.get("from");
  const dateTo = searchParams.get("to");

  const supabase = getServiceClient();
  let query = supabase
    .from("appointments")
    .select("*, staff:staff_id(id, display_name, role), case_info:case_id(category, reporter_name, street, house_number, plz, city)")
    .order("scheduled_at", { ascending: true });

  if (scope.tenantId) query = query.eq("tenant_id", scope.tenantId);
  if (caseId) query = query.eq("case_id", caseId);
  if (staffId) query = query.eq("staff_id", staffId);
  if (dateFrom) query = query.gte("scheduled_at", dateFrom);
  if (dateTo) query = query.lte("scheduled_at", dateTo);

  // Exclude cancelled by default
  if (!searchParams.has("include_cancelled")) {
    query = query.neq("status", "cancelled");
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (scope.isProspect) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { case_id, staff_id, scheduled_at, duration_min, notes, tenant_id } = body;

  if (!case_id || !staff_id || !scheduled_at) {
    return NextResponse.json(
      { error: "case_id, staff_id, scheduled_at required" },
      { status: 400 }
    );
  }

  const effectiveTenantId = scope.isAdmin ? (tenant_id ?? scope.tenantId) : scope.tenantId;
  if (!effectiveTenantId) {
    return NextResponse.json({ error: "tenant_id required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Generate ICS UID for this appointment
  const icsUid = `${crypto.randomUUID()}@flowsight.ch`;
  const effectiveDuration = duration_min ?? 60;

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      tenant_id: effectiveTenantId,
      case_id,
      staff_id,
      scheduled_at,
      duration_min: effectiveDuration,
      notes: notes ?? null,
      ics_uid: icsUid,
      ics_sequence: 0,
    })
    .select("*, staff:staff_id(id, display_name, role, email)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch case info for ICS email context (fire-and-forget on failure)
  const { data: caseRow } = await supabase
    .from("cases")
    .select("seq_number, category, city, plz, street, house_number")
    .eq("id", case_id)
    .single();

  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("name, case_id_prefix")
    .eq("id", effectiveTenantId)
    .single();

  // Generate and send ICS email
  const staffInfo = data.staff as { id: string; display_name: string; role: string; email?: string } | null;
  const location = [caseRow?.street, caseRow?.house_number, caseRow?.plz, caseRow?.city]
    .filter(Boolean)
    .join(" ");

  const caseLabel = caseRow?.seq_number
    ? `${tenantRow?.case_id_prefix ?? "FS"}-${String(caseRow.seq_number).padStart(4, "0")}`
    : case_id.slice(0, 8);

  const icsContent = generateIcs({
    uid: icsUid,
    sequence: 0,
    summary: `${caseLabel} — ${caseRow?.category ?? "Einsatz"}`,
    description: notes ?? undefined,
    location: location || undefined,
    startAt: new Date(scheduled_at),
    durationMin: effectiveDuration,
    organizerName: tenantRow?.name,
    organizerEmail: process.env.RESEND_FROM ?? "noreply@flowsight.ch",
    attendeeName: staffInfo?.display_name,
    attendeeEmail: staffInfo?.email ?? undefined,
    method: "REQUEST",
  });

  // Send ICS email (fire-and-forget — don't block API response)
  sendAppointmentIcsEmail({
    appointmentId: data.id,
    caseId: case_id,
    seqNumber: caseRow?.seq_number,
    caseIdPrefix: tenantRow?.case_id_prefix ?? "FS",
    tenantDisplayName: tenantRow?.name,
    staffName: staffInfo?.display_name ?? "Techniker",
    staffEmail: staffInfo?.email ?? undefined,
    scheduledAt: scheduled_at,
    durationMin: effectiveDuration,
    category: caseRow?.category,
    city: caseRow?.city,
    notes: notes ?? undefined,
    icsContent,
    method: "REQUEST",
  }).catch(() => {}); // fire-and-forget

  return NextResponse.json(data, { status: 201 });
}
