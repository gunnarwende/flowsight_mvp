import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { sendSms } from "@/src/lib/sms/sendSms";

/**
 * POST /api/bigben-pub/reserve — Table reservation for Big Ben Pub.
 *
 * Sends SMS confirmation to guest + notification SMS to Paul.
 * No DB write for now — Paul gets all info via SMS.
 */

const PAUL_PHONE = process.env.BIGBEN_OWNER_PHONE ?? "";
const FOUNDER_PHONE = process.env.FOUNDER_PHONE ?? "";

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

    if (!name || !phone || !date || !time || !guests) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    // Format date for display
    const dateObj = new Date(date + "T12:00:00");
    const dateStr = dateObj.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // ── SMS to guest ──────────────────────────────────────────────
    const guestSms = [
      `Hi ${name},`,
      ``,
      `Your table at Big Ben Pub is reserved:`,
      `${dateStr} at ${time}, ${guests} ${Number(guests) === 1 ? "guest" : "guests"}.`,
      note ? `Note: ${note}` : "",
      ``,
      `Alte Landstrasse 20, 8942 Oberrieden`,
      `See you there!`,
    ]
      .filter(Boolean)
      .join("\n");

    const guestResult = await sendSms(phone, guestSms, "BigBenPub");

    // ── SMS to Paul (owner) ───────────────────────────────────────
    const ownerSms = [
      `NEW BOOKING`,
      `${dateStr} at ${time}`,
      `${guests} guests — ${name}`,
      `Phone: ${phone}`,
      note ? `Note: ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Send to Paul if configured
    if (PAUL_PHONE) {
      await sendSms(PAUL_PHONE, ownerSms, "BigBenPub");
    }
    // Also notify founder
    if (FOUNDER_PHONE) {
      await sendSms(FOUNDER_PHONE, ownerSms, "BigBenPub");
    }

    console.log(
      JSON.stringify({
        ...base,
        decision: "sent",
        name,
        date,
        time,
        guests,
        sms_guest: guestResult.sent ? "sent" : guestResult.reason,
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { _tag: "bigben_reservation", decision: "failed" },
    });
    console.log(
      JSON.stringify({
        ...base,
        decision: "failed",
        error: err instanceof Error ? err.message : "unknown",
      }),
    );
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
