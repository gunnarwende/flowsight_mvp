import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";
import { sendTerminConfirmationToMelder } from "@/src/lib/email/resend";
import { sendSms } from "@/src/lib/sms/sendSms";

// ---------------------------------------------------------------------------
// POST /api/ops/cases/[id]/notify-melder
// Send termin confirmation to the reporter (Melder) via email + SMS
// ---------------------------------------------------------------------------

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const base: Record<string, unknown> = {
    _tag: "notify_melder",
    case_id: id,
  };

  // ── Auth ──────────────────────────────────────────────────────────────
  const supabaseAuth = await getAuthClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "unauthorized" }));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Load case ─────────────────────────────────────────────────────────
  const supabase = getServiceClient();
  const { data: row, error: dbError } = await supabase
    .from("cases")
    .select("id, tenant_id, seq_number, scheduled_at, scheduled_end_at, category, city, contact_phone, contact_email, reporter_name")
    .eq("id", id)
    .single();

  if (dbError || !row) {
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "case_not_found" }));
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  if (!row.scheduled_at) {
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "no_scheduled_at" }));
    return NextResponse.json({ error: "No termin scheduled" }, { status: 400 });
  }

  // Block sending past appointments — prevent accidental wrong-date notifications
  if (new Date(row.scheduled_at).getTime() < Date.now()) {
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "termin_in_past" }));
    return NextResponse.json({ error: "Termin liegt in der Vergangenheit" }, { status: 400 });
  }

  if (!row.contact_email && !row.contact_phone) {
    console.log(JSON.stringify({ ...base, decision: "skipped", reason: "no_contact" }));
    return NextResponse.json({ error: "No contact info" }, { status: 400 });
  }

  // ── Load tenant identity + modules ────────────────────────────────────
  const [identity, { data: tenantRow }] = await Promise.all([
    resolveTenantIdentityById(row.tenant_id),
    supabase.from("tenants").select("modules, phone").eq("id", row.tenant_id).single(),
  ]);

  const modules = (tenantRow?.modules ?? {}) as Record<string, unknown>;
  const tenantDisplayName = identity?.displayName ?? "Ihr Servicebetrieb";
  const caseLabel = formatCaseId(row.seq_number, identity?.caseIdPrefix);
  const smsEnabled = modules.sms === true;
  const senderName = typeof modules.sms_sender_name === "string" ? modules.sms_sender_name : tenantDisplayName;
  const tenantPhone = typeof tenantRow?.phone === "string" ? tenantRow.phone : undefined;

  let emailSent = false;
  let smsSent = false;

  // ── Send email ────────────────────────────────────────────────────────
  if (row.contact_email && modules.notify_termin_email !== false) {
    emailSent = await sendTerminConfirmationToMelder(
      {
        caseLabel,
        tenantDisplayName,
        reporterName: row.reporter_name ?? undefined,
        category: row.category,
        scheduledAt: row.scheduled_at,
        scheduledEndAt: row.scheduled_end_at,
        tenantPhone,
      },
      row.contact_email,
    );
  }

  // ── Send SMS ──────────────────────────────────────────────────────────
  // If no email was sent (e.g. voice cases without email), SMS is the primary channel
  // and should send even without the general sms module flag.
  const smsAsPrimary = !emailSent && !!row.contact_phone;
  if (row.contact_phone && (smsAsPrimary || (smsEnabled && modules.notify_termin_sms !== false))) {
    const start = new Date(row.scheduled_at);
    const day = start.toLocaleDateString("de-CH", { weekday: "short", timeZone: "Europe/Zurich" }).replace(/\.$/, "");
    const date = start.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" });
    const time = start.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });

    let endTime = "";
    if (row.scheduled_end_at) {
      const end = new Date(row.scheduled_end_at);
      endTime = `–${end.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" })}`;
    }

    const phoneStr = tenantPhone ? ` Bei Fragen: ${tenantPhone}.` : "";
    const smsBody = `${senderName}: Ihr Termin am ${day} ${date}, ${time}${endTime}.${phoneStr}`;

    const result = await sendSms(row.contact_phone, smsBody, senderName);
    smsSent = result.sent;
  }

  // ── Log event ─────────────────────────────────────────────────────────
  await supabase.from("case_events").insert({
    case_id: id,
    event_type: "melder_termin_notified",
    title: "Terminbestätigung an Kunden gesendet",
    metadata: { email_sent: emailSent, sms_sent: smsSent, user_id: user.id },
  }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });

  console.log(JSON.stringify({
    ...base,
    decision: "sent",
    email_sent: emailSent,
    sms_sent: smsSent,
  }));

  return NextResponse.json({ ok: true, email_sent: emailSent, sms_sent: smsSent });
}
