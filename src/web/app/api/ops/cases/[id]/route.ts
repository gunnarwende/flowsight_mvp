import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { sendAssignmentNotification } from "@/src/lib/email/resend";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";
import { resolveStaffRole } from "@/src/lib/staff/resolveStaffRole";

// ---------------------------------------------------------------------------
// Allowed values for ops fields
// ---------------------------------------------------------------------------

const VALID_STATUSES = ["new", "scheduled", "in_arbeit", "warten", "done", "archived"] as const;

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  scheduled: "Geplant",
  in_arbeit: "In Arbeit",
  warten: "Warten",
  done: "Erledigt",
  archived: "Abgeschlossen",
};

const FIELD_LABELS: Record<string, string> = {
  urgency: "Priorität",
  category: "Kategorie",
  description: "Beschreibung",
  plz: "PLZ",
  city: "Ort",
  street: "Strasse",
  house_number: "Hausnummer",
  assignee_text: "Zuständig",
  scheduled_at: "Termin",
  scheduled_end_at: "Termin-Ende",
  internal_notes: "Notizen",
  contact_email: "E-Mail",
  contact_phone: "Telefon",
  reporter_name: "Melder",
};

const VALID_URGENCIES = ["notfall", "dringend", "normal"] as const;

const OPS_UPDATABLE_FIELDS = [
  "status",
  "urgency",
  "category",
  "plz",
  "city",
  "description",
  "assignee_text",
  "scheduled_at",
  "scheduled_end_at",
  "internal_notes",
  "contact_email",
  "contact_phone",
  "street",
  "house_number",
  "reporter_name",
] as const;

type OpsField = (typeof OPS_UPDATABLE_FIELDS)[number];

/** Techniker can update these fields but NOT assignee_text */
const TECHNIKER_UPDATABLE_FIELDS = [
  "status",
  "urgency",
  "category",
  "description",
  "scheduled_at",
  "scheduled_end_at",
  "internal_notes",
] as const;

// ---------------------------------------------------------------------------
// GET /api/ops/cases/[id] — fetch single case (authenticated)
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const scope = await resolveTenantScope();
  if (!scope) {
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

    // Tenant isolation: non-admin can only see cases of their own tenant
    if (!scope.isAdmin && scope.tenantId && row.tenant_id !== scope.tenantId) {
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
  const scope = await resolveTenantScope();
  if (!scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prospects can only change status (no other fields)
  const PROSPECT_ALLOWED_FIELDS: readonly string[] = ["status"];

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Resolve staff role for RBAC
  let staffRole: "admin" | "techniker" | null = null;
  if (scope.tenantId && !scope.isProspect) {
    const authClient = await getAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (user?.email) {
      const ctx = await resolveStaffRole(user.email, scope.tenantId);
      if (ctx) staffRole = ctx.role;
    }
  }

  // Allowlist: prospects get restricted fields, techniker limited, others get full ops fields
  const allowedFields: readonly string[] = scope.isProspect
    ? PROSPECT_ALLOWED_FIELDS
    : staffRole === "techniker"
      ? TECHNIKER_UPDATABLE_FIELDS
      : OPS_UPDATABLE_FIELDS;
  const update: Record<string, unknown> = {};
  for (const field of allowedFields) {
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

  // Validate urgency value
  if (
    "urgency" in update &&
    !VALID_URGENCIES.includes(update.urgency as (typeof VALID_URGENCIES)[number])
  ) {
    return NextResponse.json(
      {
        error: `Invalid urgency. Allowed: ${VALID_URGENCIES.join(", ")}`,
        allowed_values: { urgency: VALID_URGENCIES },
      },
      { status: 400 }
    );
  }


  try {
    const supabase = getServiceClient();

    // Tenant isolation check: read case first to verify tenant ownership
    const { data: existing } = await supabase.from("cases").select("status, tenant_id, assignee_text").eq("id", id).single();
    if (!existing) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }
    if (!scope.isAdmin && scope.tenantId && existing.tenant_id !== scope.tenantId) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    // Read old status before update (for status_changed event)
    const oldStatus = "status" in update ? existing.status : undefined;

    const { data: row, error } = await supabase
      .from("cases")
      .update(update)
      .eq("id", id)
      .select(
        "id, seq_number, status, urgency, category, plz, city, description, assignee_text, scheduled_at, scheduled_end_at, internal_notes, contact_email, contact_phone, street, house_number, reporter_name, updated_at"
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
        metadata: { from: oldStatus, to: newStatus, user_id: scope.userId },
      }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });
    }

    const nonStatusFields = Object.keys(update).filter((f) => f !== "status");
    if (nonStatusFields.length > 0) {
      const humanFields = nonStatusFields.map(f => FIELD_LABELS[f] ?? f);
      const title = humanFields.length === 1
        ? `${humanFields[0]} aktualisiert`
        : `${humanFields.join(", ")} aktualisiert`;
      await supabase.from("case_events").insert({
        case_id: id,
        event_type: "fields_updated",
        title,
        metadata: { fields: nonStatusFields, user_id: scope.userId },
      }).then(({ error: evErr }) => { if (evErr) Sentry.captureException(evErr); });
    }

    // ── Assignment notification (fire-and-forget) ───────────────────
    let assignmentSent = false;
    if (
      "assignee_text" in update &&
      update.assignee_text &&
      update.assignee_text !== existing.assignee_text
    ) {
      // Look up staff email + tenant identity
      const [{ data: staffMatch }, identity, { data: tenantRow }] = await Promise.all([
        supabase
          .from("staff")
          .select("email")
          .eq("tenant_id", existing.tenant_id)
          .eq("display_name", update.assignee_text as string)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle(),
        resolveTenantIdentityById(existing.tenant_id),
        supabase.from("tenants").select("modules").eq("id", existing.tenant_id).single(),
      ]);

      const modules = (tenantRow?.modules ?? {}) as Record<string, unknown>;
      const notifyEnabled = modules.notify_staff_assignment !== false;

      if (staffMatch?.email && notifyEnabled && identity) {
        const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://flowsight.ch";
        const caseLabel = formatCaseId(row.seq_number, identity.caseIdPrefix);
        assignmentSent = await sendAssignmentNotification({
          caseId: id,
          caseLabel,
          tenantDisplayName: identity.displayName,
          staffName: update.assignee_text as string,
          staffEmail: staffMatch.email,
          category: row.category,
          city: row.city,
          urgency: row.urgency,
          description: row.description,
          deepLink: `${baseUrl}/ops/cases/${id}`,
        });
      }
    }

    // Structured log — no PII
    const updatedFields = Object.keys(update) as OpsField[];
    console.log(
      JSON.stringify({
        _tag: "ops_cases_api",
        decision: "updated",
        case_id: id,
        user_id: scope.userId,
        fields: updatedFields,
        ...(assignmentSent && { assignment_sent: true }),
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
