import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { sendSms } from "@/src/lib/sms/sendSms";

/**
 * POST /api/bigben-pub/reserve — Table reservation for Big Ben Pub.
 *
 * 1. Saves to pub_reservations (status = pending)
 * 2. SMS notification to Paul (owner)
 * 3. SMS confirmation to guest ("received, we'll confirm shortly")
 */

const PAUL_PHONE = process.env.BIGBEN_OWNER_PHONE ?? "";

export async function POST(req: Request) {
  const base = { _tag: "bigben_reservation", stage: "api" };

  try {
    const body = await req.json();
    const name = (body.name ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const date = (body.date ?? "").trim();
    const time = (body.time ?? "").trim();
    const guests = (body.guests ?? "").toString().trim();
    const note = (body.note ?? "").trim();
    const source = (body.source ?? "website").trim();

    if (!name || !phone || !date || !time || !guests) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    // ── Save to DB ────────────────────────────────────────────────
    const supabase = getServiceClient();
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", "bigben-pub")
      .single();

    if (tenant) {
      await supabase.from("pub_reservations").insert({
        tenant_id: tenant.id,
        guest_name: name,
        guest_phone: phone,
        reservation_date: date,
        reservation_time: time,
        party_size: parseInt(guests, 10) || 2,
        note: note || null,
        source,
        status: "pending",
      });
    }

    // Format date for display
    const dateObj = new Date(date + "T12:00:00");
    const dateStr = dateObj.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // ── SMS to guest (received, not yet confirmed) ─────────────────
    const guestSms = [
      `Hi ${name}!`,
      ``,
      `Your reservation request at Big Ben Pub:`,
      `${dateStr} at ${time}, ${guests} ${Number(guests) === 1 ? "guest" : "guests"}.`,
      ``,
      `Paul will confirm shortly.`,
      `Alte Landstrasse 20, 8942 Oberrieden`,
    ]
      .join("\n");

    const guestResult = await sendSms(phone, guestSms, "BigBenPub");

    // No SMS to Paul — he sees new reservations via badge in his app.
    // Saves SMS costs. Paul checks app regularly (push notification planned).

    console.log(
      JSON.stringify({
        ...base,
        decision: "sent",
        name,
        date,
        time,
        guests,
        source,
        sms_guest: guestResult.sent ? "sent" : guestResult.reason,
        db: tenant ? "saved" : "no_tenant",
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { _tag: "bigben_reservation", decision: "failed" },
    });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
