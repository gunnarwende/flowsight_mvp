import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { validateVerifyToken, validateShortVerifyToken } from "@/src/lib/sms/verifySmsToken";

/**
 * POST /api/verify/[caseId]
 * Public endpoint — HMAC-protected, no auth required.
 * Updates case address fields after SMS verification.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const reporterName = typeof body.reporter_name === "string" ? body.reporter_name.trim() : "";
  const plz = typeof body.plz === "string" ? body.plz.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const street = typeof body.street === "string" ? body.street.trim() : "";
  const houseNumber = typeof body.house_number === "string" ? body.house_number.trim() : "";

  // Validate required fields
  if (!/^\d{4}$/.test(plz)) {
    return NextResponse.json({ error: "invalid_plz", detail: "PLZ muss 4 Ziffern sein" }, { status: 400 });
  }
  if (city.length === 0) {
    return NextResponse.json({ error: "invalid_city", detail: "Ort darf nicht leer sein" }, { status: 400 });
  }

  // Load case for HMAC validation
  const supabase = getServiceClient();
  const { data: caseRow, error: loadError } = await supabase
    .from("cases")
    .select("id, created_at")
    .eq("id", caseId)
    .single();

  if (loadError || !caseRow) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // HMAC validation — accept full (64 hex) or short (16 hex) tokens
  const isFullToken = token.length === 64;
  const isValid = isFullToken
    ? validateVerifyToken(caseId, caseRow.created_at, token)
    : validateShortVerifyToken(caseId, caseRow.created_at, token);

  if (!isValid) {
    return NextResponse.json({ error: "invalid_token" }, { status: 403 });
  }

  // Update case
  const updatePayload: Record<string, string | null> = { plz, city };
  if (reporterName.length > 0) updatePayload.reporter_name = reporterName;
  if (street.length > 0) updatePayload.street = street;
  if (houseNumber.length > 0) updatePayload.house_number = houseNumber;

  const { error: updateError } = await supabase
    .from("cases")
    .update(updatePayload)
    .eq("id", caseId);

  if (updateError) {
    Sentry.captureException(updateError, {
      tags: {
        _tag: "sms_verify",
        area: "sms",
        case_id: caseId,
        stage: "db_update",
        error_code: "DB_UPDATE_ERROR",
      },
    });
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  // Audit event
  await supabase
    .from("case_events")
    .insert({
      case_id: caseId,
      event_type: "address_corrected",
      title: "Daten per SMS-Link korrigiert",
      metadata: { reporter_name: reporterName || null, plz, city, street: street || null, house_number: houseNumber || null },
    })
    .then(({ error: evErr }) => {
      if (evErr) Sentry.captureException(evErr);
    });

  return NextResponse.json({ ok: true });
}
