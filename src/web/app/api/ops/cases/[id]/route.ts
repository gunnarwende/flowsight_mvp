import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";

// ---------------------------------------------------------------------------
// Allowed values for ops fields
// ---------------------------------------------------------------------------

const VALID_STATUSES = ["new", "contacted", "scheduled", "done", "archived"] as const;

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  scheduled: "Geplant",
  done: "Erledigt",
  archived: "Archiviert",
};

const OPS_UPDATABLE_FIELDS = [
  "status",
  "assignee_text",
  "scheduled_at",
  "internal_notes",
  "contact_email",
  "street",
  "house_number",
  "reporter_name",
] as const;

type OpsField = (typeof OPS_UPDATABLE_FIELDS)[number];

// ---------------------------------------------------------------------------
// Auth helper: verify user is authenticated
// ---------------------------------------------------------------------------

async function getAuthenticatedUser() {
  const supabase = await getAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ---------------------------------------------------------------------------
// GET /api/ops/cases/[id] — fetch single case (authenticated)
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const supabase = getServiceClient();
    const [{ data: row, error }, { data: events }] = await Promise.all([
      supabase.from("cases").select("*").eq("id", id).single(),
      supabase.from("case_events").select("*").eq("case_id", id).order("created_at"),
    ]);

    if (error || !row) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    return NextResponse.json({ ...row, events: events ?? [] });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { area: "api", feature: "ops_cases" },
    });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/ops/cases/[id] — update ops fields only (authenticated)
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Allowlist: only ops-managed fields
  const update: Record<string, unknown> = {};
  for (const field of OPS_UPDATABLE_FIELDS) {
    if (field in body) {
      update[field] = body[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      {
        error: "No updatable fields provided.",
        allowed_fields: OPS_UPDATABLE_FIELDS,
      },
      { status: 400 }
    );
  }

  // Validate status value
  if (
    "status" in update &&
    !VALID_STATUSES.includes(update.status as (typeof VALID_STATUSES)[number])
  ) {
    return NextResponse.json(
      {
        error: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`,
        allowed_values: { status: VALID_STATUSES },
      },
      { status: 400 }
    );
  }

  try {
    const supabase = getServiceClient();

    // Read old status before update (for status_changed event)
    let oldStatus: string | undefined;
    if ("status" in update) {
      const { data: old } = await supabase.from("cases").select("status").eq("id", id).single();
      oldStatus = old?.status;
    }

    const { data: row, error } = await supabase
      .from("cases")
      .update(update)
      .eq("id", id)
      .select(
        "id, status, assignee_text, scheduled_at, internal_notes, contact_email, street, house_number, reporter_name, updated_at"
      )
      .single();

    if (error || !row) {
      Sentry.captureException(error ?? new Error("Case not found for update"), {
        tags: { area: "api", feature: "ops_cases", case_id: id },
      });
      return NextResponse.json(
        { error: "Case not found or update failed." },
        { status: 404 }
      );
    }

    // Insert events (fire-and-forget, errors → Sentry)
    if ("status" in update && oldStatus && oldStatus !== update.status) {
      const newStatus = update.status as string;
      await supabase.from("case_events").insert({
        case_id: id,
        event_type: "status_changed",
        title: `Status geändert: ${STATUS_LABELS[oldStatus] ?? oldStatus} → ${STATUS_LABELS[newStatus] ?? newStatus}`,
        metadata: { from: oldStatus, to: newStatus, user_id: user.id },
      }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });
    }

    const nonStatusFields = Object.keys(update).filter((f) => f !== "status");
    if (nonStatusFields.length > 0) {
      await supabase.from("case_events").insert({
        case_id: id,
        event_type: "fields_updated",
        title: `Felder aktualisiert: ${nonStatusFields.join(", ")}`,
        metadata: { fields: nonStatusFields, user_id: user.id },
      }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });
    }

    // Structured log — no PII
    const updatedFields = Object.keys(update) as OpsField[];
    console.log(
      JSON.stringify({
        _tag: "ops_cases_api",
        decision: "updated",
        case_id: id,
        user_id: user.id,
        fields: updatedFields,
      })
    );

    return NextResponse.json(row);
  } catch (err) {
    Sentry.captureException(err, {
      tags: { area: "api", feature: "ops_cases", case_id: id },
    });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
