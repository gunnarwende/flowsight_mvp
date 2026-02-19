import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { sendCaseNotification } from "@/src/lib/email/resend";

// ---------------------------------------------------------------------------
// Validation helpers (aligned with case_contract.md)
// ---------------------------------------------------------------------------

const VALID_SOURCES = ["wizard", "voice"] as const;
const VALID_URGENCIES = ["notfall", "dringend", "normal"] as const;

type CaseSource = (typeof VALID_SOURCES)[number];
type CaseUrgency = (typeof VALID_URGENCIES)[number];

interface CaseBody {
  tenant_id?: string;
  source: CaseSource;
  contact_phone?: string;
  contact_email?: string;
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
      contact_phone: hasPhone ? (b.contact_phone as string) : undefined,
      contact_email: hasEmail ? (b.contact_email as string) : undefined,
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

  try {
    const supabase = getServiceClient();

    const { data: row, error } = await supabase
      .from("cases")
      .insert({
        tenant_id: tenantId,
        source: data.source,
        contact_phone: data.contact_phone ?? null,
        contact_email: data.contact_email ?? null,
        plz: data.plz,
        city: data.city,
        category: data.category,
        urgency: data.urgency,
        description: data.description,
        photo_url: data.photo_url ?? null,
        raw_payload: data.raw_payload ?? null,
      })
      .select("id, tenant_id, source, urgency, category, city, created_at")
      .single();

    if (error) {
      Sentry.captureException(error, {
        tags: { area: "api", feature: "cases", tenant_id: tenantId },
      });
      return NextResponse.json(
        { error: "Failed to create case." },
        { status: 500 }
      );
    }

    Sentry.setTag("source", data.source);
    Sentry.setTag("tenant_id", tenantId);
    Sentry.setTag("case_id", row.id);
    console.log(JSON.stringify({
      _tag: "cases_api",
      decision: "created",
      source: data.source,
      tenant_id: tenantId,
      case_id: row.id,
    }));

    // Fire-and-forget email notification (non-blocking)
    // Log "attempted" synchronously BEFORE the async call — guarantees
    // visibility in serverless even if the function freezes after response.
    console.log(JSON.stringify({
      _tag: "email",
      provider: "resend",
      decision: "attempted",
      case_id: row.id,
      tenant_id: tenantId,
      source: data.source,
    }));
    sendCaseNotification({
      caseId: row.id,
      tenantId,
      source: data.source,
      category: data.category,
      urgency: data.urgency,
      city: data.city,
      plz: data.plz,
      description: data.description,
    }).catch(() => {
      // Already captured in Sentry inside sendCaseNotification
    });

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { area: "api", feature: "cases" },
    });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
