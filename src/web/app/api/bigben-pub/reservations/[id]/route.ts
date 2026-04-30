import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { sendSms } from "@/src/lib/sms/sendSms";

/**
 * PATCH /api/bigben-pub/reservations/[id] — Confirm or decline a reservation
 * Body: { status: "confirmed" | "declined" | "no_show" }
 * Sends SMS to guest on confirm/decline.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const scope = await resolveTenantScope();
  if (!scope || scope.isProspect) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getServiceClient();

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const newStatus = body.status;
  if (!newStatus || !["confirmed", "declined", "cancelled", "no_show"].includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Fetch reservation
  const { data: res, error: fetchErr } = await supabase
    .from("pub_reservations")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !res) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  // Update
  const update: Record<string, unknown> = { status: newStatus };
  if (newStatus === "confirmed") update.confirmed_at = new Date().toISOString();

  const { error: updateErr } = await supabase
    .from("pub_reservations")
    .update(update)
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // SMS to guest on confirm/decline (skip for manual/no-phone reservations)
  // Only send when status is actually CHANGING (guard against re-confirms)
  const statusChanged = res.status !== newStatus;
  if (statusChanged && res.guest_phone && res.guest_phone !== "—") {
    const dateObj = new Date(res.reservation_date + "T12:00:00");
    const dateStr = dateObj.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = res.reservation_time?.substring(0, 5) ?? "";

    if (newStatus === "confirmed") {
      await sendSms(
        res.guest_phone,
        `Confirmed! Your table at Big Ben Pub, ${dateStr} at ${timeStr} for ${res.party_size} guests. Alte Landstrasse 20, Oberrieden. See you there!`,
        "BigBenPub"
      );
    } else if (newStatus === "declined") {
      // Paul's wording (FB30, 30.04.): keep walk-ins as positive option,
      // drop "fully booked" / phone-callback framing — too rejection-y.
      // Hard cap: SMS must stay <=160 chars (single segment, otherwise
      // double-billed). Base template = 137 chars, leaves 23 chars for
      // first name. Truncate first name if longer to stay safe.
      const firstName = (res.guest_name ?? "there").split(" ")[0].slice(0, 22);
      await sendSms(
        res.guest_phone,
        `Hi ${firstName}, we're not taking more reservations but keep some tables free for walk-ins (first come, first served). Hope ok, see and take care!`,
        "BigBenPub"
      );
    }
  }

  console.log(JSON.stringify({
    _tag: "bigben_reservation_update",
    reservation_id: id,
    status: newStatus,
    guest: res.guest_name,
    sms: statusChanged && res.guest_phone && res.guest_phone !== "—" ? "sent" : "skipped",
  }));

  return NextResponse.json({ ok: true, status: newStatus });
}
