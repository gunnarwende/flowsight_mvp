import { NextResponse } from "next/server";
import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import { sendSms } from "@/src/lib/sms/sendSms";
import { SITE } from "@/src/lib/marketing/constants";

/**
 * POST /api/demo — Demo request from flowsight.ch marketing form.
 *
 * Sends a notification email to the Founder (MAIL_REPLY_TO).
 * No database writes, no case creation — just an email lead.
 */
export async function POST(req: Request) {
  const base: Record<string, unknown> = {
    _tag: "demo_request",
    stage: "api",
  };

  try {
    const body = await req.json();
    const name = (body.name ?? "").trim();
    const company = (body.company ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const website = (body.website ?? "").trim();
    const plz = (body.plz ?? "").trim();

    if (!name || !company || !phone || !plz) {
      return NextResponse.json(
        { error: "Kontaktperson, Firma, Telefon und PLZ sind Pflichtfelder." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.MAIL_REPLY_TO;
    const from = process.env.MAIL_FROM ?? "noreply@send.flowsight.ch";

    if (!apiKey || !to) {
      Sentry.captureMessage("Demo request: RESEND_API_KEY or MAIL_REPLY_TO missing", {
        level: "warning",
        tags: { _tag: "demo_request", decision: "skipped" },
      });
      console.log(
        JSON.stringify({ ...base, decision: "skipped", reason: "missing_env" })
      );
      // Still return 200 so the user sees "Danke" — we fix env, not UX.
      return NextResponse.json({ ok: true });
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to,
      subject: `[FlowSight] Testanfrage — ${company}`,
      text: [
        "Neue Testanfrage über flowsight.ch",
        "──────────────────────",
        `Name:    ${name}`,
        `Firma:   ${company}`,
        `Telefon: ${phone}`,
        `PLZ/Ort: ${plz}`,
        `Website: ${website || "–"}`,
        "──────────────────────",
        `Zeitpunkt: ${new Date().toLocaleString("de-CH", { timeZone: "Europe/Zurich" })}`,
        "",
        "Nächster Schritt: Scout-Check → Qualify → Provisioning",
      ].join("\n"),
    });

    if (error) {
      Sentry.captureException(error, {
        tags: {
          _tag: "demo_request",
          area: "email",
          provider: "resend",
          decision: "failed",
          error_code: "RESEND_API_ERROR",
        },
      });
      console.log(
        JSON.stringify({ ...base, decision: "failed", reason: "resend_api_error" })
      );
      return NextResponse.json({ ok: true }); // User sees success, we get Sentry alert
    }

    // ── SMS confirmation to prospect ──────────────────────────────────
    const smsBody = [
      `Guten Tag ${name},`,
      ``,
      `vielen Dank für Ihr Interesse an FlowSight. Wir prüfen jetzt, ob Lisa zu ${company} passt, und melden uns innerhalb von 24h persönlich.`,
      ``,
      `Ihr FlowSight-Team`,
    ].join("\n");

    const smsResult = await sendSms(phone, smsBody, "FlowSight");
    console.log(
      JSON.stringify({
        ...base,
        decision: "sent",
        company,
        sms: smsResult.sent ? "sent" : smsResult.reason,
      })
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { _tag: "demo_request", decision: "failed", error_code: "EXCEPTION" },
    });
    console.log(
      JSON.stringify({
        ...base,
        decision: "failed",
        reason: "exception",
        error: err instanceof Error ? err.message : "unknown",
      })
    );
    return NextResponse.json(
      { error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut." },
      { status: 500 }
    );
  }
}
