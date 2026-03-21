import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { sendAssignmentNotification } from "@/src/lib/email/resend";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";

// ---------------------------------------------------------------------------
// POST /api/ops/cases/[id]/notify-assignees
// Manually trigger assignment notification for specific staff members.
// Body: { names: string[] }
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const scope = await resolveTenantScope();
  if (!scope || scope.isProspect) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { names?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const names = body.names;
  if (!Array.isArray(names) || names.length === 0) {
    return NextResponse.json(
      { error: "names[] required (non-empty array of staff display_names)." },
      { status: 400 },
    );
  }

  try {
    const supabase = getServiceClient();

    // Fetch case
    const { data: row, error: caseErr } = await supabase
      .from("cases")
      .select("id, seq_number, tenant_id, category, city, urgency, description")
      .eq("id", id)
      .single();

    if (caseErr || !row) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    // Tenant isolation
    if (!scope.isAdmin && scope.tenantId && row.tenant_id !== scope.tenantId) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    // Resolve identity + staff
    const [identity, { data: staffMatches }] = await Promise.all([
      resolveTenantIdentityById(row.tenant_id),
      supabase
        .from("staff")
        .select("display_name, email")
        .eq("tenant_id", row.tenant_id)
        .in("display_name", names)
        .eq("is_active", true),
    ]);

    if (!identity) {
      return NextResponse.json({ error: "Tenant identity not found." }, { status: 500 });
    }

    const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://flowsight.ch";
    const caseLabel = formatCaseId(row.seq_number, identity.caseIdPrefix);

    const staffWithEmail = (staffMatches ?? []).filter(
      (s: { email: string | null }) => s.email,
    );

    if (staffWithEmail.length === 0) {
      return NextResponse.json(
        { error: "Keine E-Mail-Adresse für die genannten Zuständigen hinterlegt.", sent: 0 },
        { status: 400 },
      );
    }

    const results = await Promise.all(
      staffWithEmail.map((s: { display_name: string; email: string }) =>
        sendAssignmentNotification({
          caseId: id,
          caseLabel,
          tenantDisplayName: identity.displayName,
          staffName: s.display_name,
          staffEmail: s.email,
          category: row.category,
          city: row.city,
          urgency: row.urgency,
          description: row.description,
          deepLink: `${baseUrl}/ops/open/${id}`,
        }),
      ),
    );

    const sentCount = results.filter(Boolean).length;

    // Log event
    await supabase
      .from("case_events")
      .insert({
        case_id: id,
        event_type: "assignee_notified",
        title: `Zuständige benachrichtigt: ${staffWithEmail.map((s: { display_name: string }) => s.display_name).join(", ")}`,
        metadata: { names: staffWithEmail.map((s: { display_name: string }) => s.display_name), sent: sentCount },
      })
      .then(({ error: evErr }) => {
        if (evErr) Sentry.captureException(evErr);
      });

    console.log(
      JSON.stringify({
        _tag: "notify_assignees",
        decision: "sent",
        case_id: id,
        sent: sentCount,
        total: staffWithEmail.length,
      }),
    );

    return NextResponse.json({ sent: sentCount });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { area: "api", feature: "notify_assignees", case_id: id },
    });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
