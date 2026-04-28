import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * POST /api/bigben-pub/reserve — Table reservation for Big Ben Pub.
 *
 * 1. Saves to pub_reservations (status = pending)
 * 2. Push notification to Paul (owner) — he confirms in the app
 *
 * NO SMS to the guest at submit time. Guest only receives an SMS once
 * Paul actually confirms in the app (via /api/bigben-pub/reservations/[id]
 * PATCH). Sending a "request received" SMS at submit would be misread as
 * confirmation and creates a confusing two-SMS flow.
 */

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
      // Check guest no-show history
      let noShowNote = note || null;
      if (phone && phone !== "—") {
        const { count } = await supabase
          .from("pub_reservations")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenant.id)
          .eq("guest_phone", phone)
          .eq("status", "no_show");
        if (count && count >= 2) {
          noShowNote = `\uD83D\uDD34 ${count} previous no-shows${note ? " | " + note : ""}`;
        } else if (count && count === 1) {
          noShowNote = `\u26A0\uFE0F 1 previous no-show${note ? " | " + note : ""}`;
        }
      }

      await supabase.from("pub_reservations").insert({
        tenant_id: tenant.id,
        guest_name: name,
        guest_phone: phone,
        reservation_date: date,
        reservation_time: time,
        party_size: parseInt(guests, 10) || 2,
        note: noShowNote,
        source,
        status: "pending",
      });
    }

    // Format date for display (used in push notification body)
    const dateObj = new Date(date + "T12:00:00");
    const dateStr = dateObj.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // Push notification to Paul (no guest SMS — that fires only on confirm)
    if (tenant) {
      import("@/src/lib/push/sendOpsPush").then(({ sendOpsPush }) =>
        sendOpsPush({
          tenantId: tenant.id,
          eventType: "case", // reuse "case" type — Paul has notify_all_cases=true
          title: "New Reservation",
          body: `${name} — ${dateStr} at ${time}, ${guests} ${Number(guests) === 1 ? "guest" : "guests"}`,
          url: "/ops/reservations",
          tag: `reservation-${date}-${name}`,
        })
      ).catch(() => {});
    }

    console.log(
      JSON.stringify({
        ...base,
        decision: "saved_pending",
        name,
        date,
        time,
        guests,
        source,
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
