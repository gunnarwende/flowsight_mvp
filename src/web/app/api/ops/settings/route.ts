import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { resolveStaffRole } from "@/src/lib/staff/resolveStaffRole";

/**
 * GET /api/ops/settings — Current tenant settings (modules JSONB subset)
 * PATCH /api/ops/settings — Update tenant settings
 *
 * Only exposes safe, UI-editable keys. Never exposes full modules blob.
 */

const EDITABLE_KEYS = [
  "google_review_url",
  "default_appointment_duration_min",
  "notify_reporter_email",
  "notify_reporter_sms",
  "notify_termin_email",
  "notify_termin_sms",
  "notify_termin_reminder_sms",
  "notify_staff_assignment",
  "business_calendar_email",
] as const;

type EditableKey = (typeof EDITABLE_KEYS)[number];

async function checkTechnikerBlock(scope: { tenantId?: string | null; isProspect?: boolean }) {
  if (scope.tenantId && !scope.isProspect) {
    const authClient = await getAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (user?.email) {
      const ctx = await resolveStaffRole(user.email, scope.tenantId);
      if (ctx?.role === "techniker") return true;
    }
  }
  return false;
}

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await checkTechnikerBlock(scope)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getServiceClient();

  let query = supabase
    .from("tenants")
    .select("id, name, slug, case_id_prefix, modules")
    .limit(1);

  if (scope.tenantId) query = query.eq("id", scope.tenantId);

  const { data } = await query.single();
  if (!data) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const modules = (data.modules ?? {}) as Record<string, unknown>;

  return NextResponse.json({
    tenant_id: data.id,
    tenant_name: data.name,
    tenant_slug: data.slug,
    case_id_prefix: data.case_id_prefix,
    settings: {
      google_review_url: (modules.google_review_url as string) ?? "",
      default_appointment_duration_min: (modules.default_appointment_duration_min as number) ?? 60,
      notify_reporter_email: modules.notify_reporter_email !== false,
      notify_reporter_sms: modules.notify_reporter_sms !== false,
      notify_termin_email: modules.notify_termin_email !== false,
      notify_termin_sms: modules.notify_termin_sms !== false,
      notify_termin_reminder_sms: modules.notify_termin_reminder_sms !== false,
      notify_staff_assignment: modules.notify_staff_assignment !== false,
      business_calendar_email: (modules.business_calendar_email as string) ?? "",
    },
  });
}

export async function PATCH(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await checkTechnikerBlock(scope)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Fetch current modules
  let tenantQuery = supabase.from("tenants").select("id, modules").limit(1);
  if (scope.tenantId) tenantQuery = tenantQuery.eq("id", scope.tenantId);
  const { data: tenant } = await tenantQuery.single();
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const modules = { ...((tenant.modules ?? {}) as Record<string, unknown>) };

  // Only update whitelisted keys
  for (const key of EDITABLE_KEYS) {
    if (key in body) {
      const val = body[key];
      if (key === "google_review_url" || key === "business_calendar_email") {
        modules[key] = typeof val === "string" ? val.trim() : "";
      } else if (key === "default_appointment_duration_min") {
        const num = Number(val);
        modules[key] = Number.isFinite(num) && num > 0 && num <= 480 ? num : 60;
      } else if (
        key === "notify_reporter_email" || key === "notify_reporter_sms" ||
        key === "notify_termin_email" || key === "notify_termin_sms" ||
        key === "notify_termin_reminder_sms" || key === "notify_staff_assignment"
      ) {
        modules[key] = val === true;
      }
    }
  }

  const { error } = await supabase
    .from("tenants")
    .update({ modules })
    .eq("id", tenant.id);

  if (error) return NextResponse.json({ error: "Failed to save" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
