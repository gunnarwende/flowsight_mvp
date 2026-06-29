import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import { sendSms } from "@/src/lib/sms/sendSms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/cal/webhook — Cal.com → eCall-Bestätigungs-SMS (Stern 5, Self-Scheduling)
 *
 * Der Prospect bucht über Cal.com einen kurzen Rückruf-Slot (Founder-Verfügbarkeit:
 * abends / Samstag). Cal.com übernimmt Kalender + Mail-Bestätigung; DIESER Webhook
 * hängt nur das Eine an, das Cal.com (free) nicht macht: unsere eigene eCall-SMS
 * „Gunnar ruft Sie am … an." — bewährter Kanal (98 % Öffnungsrate).
 *
 * Sicherheit: Cal.com signiert den Body (HMAC-SHA256, Header `X-Cal-Signature-256`)
 * mit CAL_WEBHOOK_SECRET. Ohne gültige Signatur → 401 (kein Spoofing → keine Fake-SMS).
 *
 * Robust: nur BOOKING_CREATED löst aus; alles andere wird mit 200 quittiert (kein
 * Cal.com-Retry-Sturm). SMS-Fehler → Sentry, aber 200 (Buchung ist trotzdem gültig).
 * Phone wird aus mehreren möglichen Cal.com-Pfaden gelesen (responses / attendees).
 *
 * Env: CAL_WEBHOOK_SECRET (Pflicht). Sender = „FlowSight" (alphanumerisch, ≤11).
 */

const SMS_SENDER = "FlowSight";

interface CalAttendee {
  name?: string;
  email?: string;
  phoneNumber?: string;
  timeZone?: string;
}

interface CalResponseField {
  label?: string;
  value?: unknown;
}

interface CalBookingPayload {
  startTime?: string;
  attendees?: CalAttendee[];
  responses?: Record<string, CalResponseField | undefined>;
  organizer?: { name?: string; timeZone?: string };
}

interface CalWebhookBody {
  triggerEvent?: string;
  payload?: CalBookingPayload;
}

/** Verify Cal.com HMAC signature against the raw body. Timing-safe. */
function signatureValid(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(header, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Dig the prospect's phone out of the various shapes Cal.com may send. */
function extractPhone(payload: CalBookingPayload): string | null {
  // 1) attendee phoneNumber (SMS-attendee / phone-as-location bookings)
  const fromAttendee = payload.attendees?.find((a) => a.phoneNumber)?.phoneNumber;
  if (fromAttendee) return String(fromAttendee).trim();
  // 2) custom booking-form question (label/key contains "phone"/"telefon"/"nummer")
  const responses = payload.responses ?? {};
  for (const [key, field] of Object.entries(responses)) {
    const hay = `${key} ${field?.label ?? ""}`.toLowerCase();
    if (/(phone|telefon|natel|handy|nummer|tel)/.test(hay) && field?.value) {
      const val = Array.isArray(field.value) ? field.value[0] : field.value;
      if (val) return String(val).trim();
    }
  }
  return null;
}

/** „Sa, 05.07. um 10:00" in Europe/Zurich (de-CH). */
function formatSlot(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = new Intl.DateTimeFormat("de-CH", { weekday: "short", timeZone: "Europe/Zurich" }).format(d);
  const date = new Intl.DateTimeFormat("de-CH", { day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" }).format(d);
  const time = new Intl.DateTimeFormat("de-CH", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Zurich" }).format(d);
  return `${day}, ${date} um ${time}`;
}

export async function POST(req: Request) {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) {
    Sentry.captureMessage("Cal webhook hit but CAL_WEBHOOK_SECRET unset", {
      level: "error",
      tags: { area: "cal_webhook" },
    });
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }

  const raw = await req.text();
  if (!signatureValid(raw, req.headers.get("x-cal-signature-256"), secret)) {
    return NextResponse.json({ ok: false, reason: "bad_signature" }, { status: 401 });
  }

  let body: CalWebhookBody;
  try {
    body = JSON.parse(raw) as CalWebhookBody;
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  // Only the booking-created event triggers an SMS. Everything else: acknowledge.
  if (body.triggerEvent !== "BOOKING_CREATED") {
    return NextResponse.json({ ok: true, ignored: body.triggerEvent ?? "unknown" }, { status: 200 });
  }

  const payload = body.payload ?? {};
  const phone = extractPhone(payload);
  const slot = formatSlot(payload.startTime);

  if (!phone) {
    // No phone captured → nothing to text. Cal.com's own email still went out.
    Sentry.captureMessage("Cal booking without phone — no SMS sent", {
      level: "warning",
      tags: { area: "cal_webhook" },
      extra: { slot, hasResponses: Boolean(payload.responses) },
    });
    return NextResponse.json({ ok: true, sms: "skipped_no_phone" }, { status: 200 });
  }

  const when = slot ? ` am ${slot}` : " wie gebucht";
  const text = `Gunnar ruft Sie${when} an. Bis dann!`;

  try {
    const result = await sendSms(phone, text, SMS_SENDER);
    if (!result.sent) {
      Sentry.captureMessage("Cal booking confirm-SMS not sent", {
        level: "warning",
        tags: { area: "cal_webhook", provider: "ecall" },
        extra: { reason: result.reason, slot },
      });
    }
    return NextResponse.json({ ok: true, sms: result.sent ? "sent" : "failed" }, { status: 200 });
  } catch (err) {
    Sentry.captureException(err, { tags: { area: "cal_webhook" } });
    // Booking is valid regardless — don't make Cal.com retry into duplicate SMS.
    return NextResponse.json({ ok: true, sms: "error" }, { status: 200 });
  }
}
