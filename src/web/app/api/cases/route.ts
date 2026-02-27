import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { sendCaseNotification, sendReporterConfirmation } from "@/src/lib/email/resend";
import { notify } from "@/src/lib/notify/router";
import { hasModule } from "@/src/lib/tenants/hasModule";

// ---------------------------------------------------------------------------
// Validation helpers (aligned with case_contract.md)
// ---------------------------------------------------------------------------

const VALID_SOURCES = ["wizard", "voice", "manual"] as const;
const VALID_URGENCIES = ["notfall", "dringend", "normal"] as const;

type CaseSource = (typeof VALID_SOURCES)[number];
type CaseUrgency = (typeof VALID_URGENCIES)[number];

interface CaseBody {
  tenant_id?: string;
  source: CaseSource;
  reporter_name?: string;
  contact_phone?: string;
  contact_email?: string;
  street?: string;
  house_number?: string;
  plz: string;
  city: string;
  category: string;
  urgency: CaseUrgency;
  description: string;
  photo_url?: string;
  raw_payload?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Input normalization (aliases → canonical fields)
// ---------------------------------------------------------------------------

function normalizeAliases(raw: Record<string, unknown>): Record<string, unknown> {
  const b = { ...raw };

  // phone / email → contact_phone / contact_email
  if (!b.contact_phone && b.phone) b.contact_phone = b.phone;
  if (!b.contact_email && b.email) b.contact_email = b.email;

  // message → description
  if (!b.description && b.message) b.description = b.message;

  return b;
}

// ---------------------------------------------------------------------------
// Validation (runs AFTER normalization)
// ---------------------------------------------------------------------------

interface ValidationError {
  error: string;
  missing_fields: string[];
  allowed_values: Record<string, readonly string[]>;
}

function validateBody(
  body: unknown
):
  | { ok: true; data: CaseBody }
  | { ok: false; detail: ValidationError } {
  if (!body || typeof body !== "object") {
    return {
      ok: false,
      detail: {
        error: "Request body must be a JSON object.",
        missing_fields: [],
        allowed_values: {
          source: VALID_SOURCES,
          urgency: VALID_URGENCIES,
        },
      },
    };
  }

  const b = normalizeAliases(body as Record<string, unknown>);
  const missing: string[] = [];

  // source
  const validSource = VALID_SOURCES.includes(b.source as CaseSource);
  if (!validSource) missing.push("source");

  // contact: at least one required
  const hasPhone = typeof b.contact_phone === "string" && b.contact_phone.length > 0;
  const hasEmail = typeof b.contact_email === "string" && b.contact_email.length > 0;
  if (!hasPhone && !hasEmail) missing.push("contact_phone/contact_email");

  // required strings
  const REQUIRED_STRINGS = ["plz", "city", "category", "description"] as const;
  for (const field of REQUIRED_STRINGS) {
    if (typeof b[field] !== "string" || (b[field] as string).trim().length === 0) {
      missing.push(field);
    }
  }

  // street + house_number: required for wizard, optional for voice + manual
  if (b.source === "wizard") {
    if (typeof b.street !== "string" || (b.street as string).trim().length === 0) {
      missing.push("street");
    }
    if (typeof b.house_number !== "string" || (b.house_number as string).trim().length === 0) {
      missing.push("house_number");
    }
  }

  // urgency
  const validUrgency = VALID_URGENCIES.includes(b.urgency as CaseUrgency);
  if (!validUrgency) missing.push("urgency");

  if (missing.length > 0) {
    return {
      ok: false,
      detail: {
        error: `Missing or invalid fields: ${missing.join(", ")}. Aliases accepted: phone→contact_phone, email→contact_email, message→description.`,
        missing_fields: missing,
        allowed_values: {
          source: VALID_SOURCES,
          urgency: VALID_URGENCIES,
        },
      },
    };
  }

  return {
    ok: true,
    data: {
      tenant_id: typeof b.tenant_id === "string" ? b.tenant_id : undefined,
      source: b.source as CaseSource,
      reporter_name: typeof b.reporter_name === "string" && b.reporter_name.trim() ? b.reporter_name.trim() : undefined,
      contact_phone: hasPhone ? (b.contact_phone as string) : undefined,
      contact_email: hasEmail ? (b.contact_email as string) : undefined,
      street: typeof b.street === "string" && b.street.trim() ? b.street.trim() : undefined,
      house_number: typeof b.house_number === "string" && b.house_number.trim() ? b.house_number.trim() : undefined,
      plz: (b.plz as string).trim(),
      city: (b.city as string).trim(),
      category: (b.category as string).trim(),
      urgency: b.urgency as CaseUrgency,
      description: (b.description as string).trim(),
      photo_url: typeof b.photo_url === "string" ? b.photo_url : undefined,
      raw_payload:
        b.raw_payload && typeof b.raw_payload === "object"
          ? (b.raw_payload as Record<string, unknown>)
          : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// POST /api/cases
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const validation = validateBody(body);
  if (!validation.ok) {
    return NextResponse.json(validation.detail, { status: 400 });
  }

  const data = validation.data;

  // Resolve tenant_id: body > FALLBACK_TENANT_ID
  const tenantId = data.tenant_id ?? process.env.FALLBACK_TENANT_ID;
  if (!tenantId) {
    return NextResponse.json(
      { error: "tenant_id not provided and FALLBACK_TENANT_ID not configured." },
      { status: 400 }
    );
  }

  // Module check: website_wizard for wizard source
  if (data.source === "wizard" && !(await hasModule(tenantId, "website_wizard"))) {
    return NextResponse.json(
      { error: "Module 'website_wizard' not enabled for this tenant." },
      { status: 403 }
    );
  }

  try {
    const supabase = getServiceClient();

    // Build insert payload — street/house_number are optional columns
    // that may not exist if the address migration hasn't been applied yet.
    const insertPayload: Record<string, unknown> = {
      tenant_id: tenantId,
      source: data.source,
      reporter_name: data.reporter_name ?? null,
      contact_phone: data.contact_phone ?? null,
      contact_email: data.contact_email ?? null,
      plz: data.plz,
      city: data.city,
      category: data.category,
      urgency: data.urgency,
      description: data.description,
      photo_url: data.photo_url ?? null,
      raw_payload: data.raw_payload ?? null,
    };
    if (data.street) insertPayload.street = data.street;
    if (data.house_number) insertPayload.house_number = data.house_number;

    const { data: row, error } = await supabase
      .from("cases")
      .insert(insertPayload)
      .select("id, tenant_id, source, urgency, category, city, created_at")
      .single();

    if (error) {
      Sentry.captureException(error, {
        tags: { _tag: "cases_api", area: "api", feature: "cases", tenant_id: tenantId, stage: "db", error_code: "DB_INSERT_ERROR", decision: "failed" },
      });
      await notify({ severity: "RED", code: "CASE_CREATE_FAILED", refs: { source: data.source } });
      return NextResponse.json(
        { error: "Failed to create case." },
        { status: 500 }
      );
    }

    Sentry.setTag("source", data.source);
    Sentry.setTag("tenant_id", tenantId);
    Sentry.setTag("case_id", row.id);

    // case_created event (fire-and-forget, errors → Sentry)
    const SOURCE_LABELS: Record<string, string> = { wizard: "Website-Formular", voice: "Voice Agent", manual: "Manuell erfasst" };
    await supabase.from("case_events").insert({
      case_id: row.id,
      event_type: "case_created",
      title: `Fall erstellt via ${SOURCE_LABELS[data.source] ?? data.source}`,
      metadata: { source: data.source },
    }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });

    // Reporter confirmation (no log — result merged into notification log below)
    let reporterEmailSent: boolean | undefined;
    if (data.contact_email) {
      reporterEmailSent = await sendReporterConfirmation({
        caseId: row.id,
        tenantId,
        contactEmail: data.contact_email,
        category: data.category,
      });
    }

    // MUST await — fire-and-forget causes Vercel to kill the invocation
    // before the Resend API call + console.log complete (msgLen=0 bug).
    // resend.ts owns the single console.log: _tag:"resend", decision, case_id, etc.
    const emailSent = await sendCaseNotification({
      caseId: row.id,
      tenantId,
      source: data.source,
      category: data.category,
      urgency: data.urgency,
      city: data.city,
      plz: data.plz,
      description: data.description,
      contactPhone: data.contact_phone,
      contactEmail: data.contact_email,
      reporterEmailSent,
    });

    // Email events (fire-and-forget)
    if (emailSent) {
      await supabase.from("case_events").insert({
        case_id: row.id,
        event_type: "email_notification_sent",
        title: "Benachrichtigung an Betrieb gesendet",
      }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });
    }
    if (reporterEmailSent) {
      await supabase.from("case_events").insert({
        case_id: row.id,
        event_type: "reporter_confirmation_sent",
        title: "Bestätigung an Melder gesendet",
      }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });
    }

    // Notify: system failures only (email dispatch fail → RED alert)
    if (!emailSent) {
      const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://flowsight-mvp.vercel.app";
      await notify({ severity: "RED", code: "EMAIL_DISPATCH_FAILED", refs: { case_id: row.id }, opsLink: `${baseUrl}/ops/cases/${row.id}` });
    }

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { _tag: "cases_api", area: "api", feature: "cases", stage: "db", error_code: "UNEXPECTED", decision: "failed" },
    });
    await notify({ severity: "RED", code: "CASE_CREATE_FAILED", refs: { source: data.source } });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
