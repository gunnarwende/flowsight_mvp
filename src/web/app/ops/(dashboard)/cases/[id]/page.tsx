import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";
import { CaseDetailForm } from "./CaseDetailForm";
import { PrintButton } from "./PrintButton";
import { DeleteButton } from "./DeleteButton";
import { ScrollToTop } from "./ScrollToTop";
import type { CaseEvent } from "@/src/components/ops/CaseTimeline";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CaseDetail {
  id: string;
  tenant_id: string;
  seq_number: number | null;
  source: string;
  created_at: string;
  updated_at: string;
  reporter_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  street: string | null;
  house_number: string | null;
  plz: string;
  city: string;
  category: string;
  urgency: string;
  description: string;
  photo_url: string | null;
  status: string;
  assignee_text: string | null;
  scheduled_at: string | null;
  scheduled_end_at: string | null;
  internal_notes: string | null;
  review_sent_at: string | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SOURCE_LABELS: Record<string, string> = {
  voice: "Anruf",
  wizard: "Website-Formular",
  manual: "Manuell erfasst",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

// ---------------------------------------------------------------------------
// Page (Server Component)
// ---------------------------------------------------------------------------

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = getServiceClient();
  const scope = await resolveTenantScope();

  const [{ data: row, error }, { data: events }] = await Promise.all([
    supabase.from("cases").select("*").eq("id", id).single(),
    supabase.from("case_events").select("*").eq("case_id", id).order("created_at"),
  ]);

  if (error || !row) notFound();

  if (scope && !scope.isAdmin && scope.tenantId && row.tenant_id !== scope.tenantId) {
    notFound();
  }

  const caseData = row as CaseDetail;
  const caseEvents = (events ?? []) as CaseEvent[];

  const identity = await resolveTenantIdentityById(caseData.tenant_id);
  const caseId = formatCaseId(caseData.seq_number, identity?.caseIdPrefix);
  const isProspect = scope?.isProspect ?? false;
  const brandColor = identity?.primaryColor ?? "#64748b";
  // Auto-switch tenant when admin opens a case from a different tenant (e.g. via email deep-link).
  // Sets cookie and redirects to same page — on reload, sidebar shows the correct business.
  const isForeignTenant = scope?.isAdmin && scope.tenantId && caseData.tenant_id !== scope.tenantId;
  if (isForeignTenant) {
    const cookieStore = await cookies();
    cookieStore.set("fs_active_tenant", caseData.tenant_id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
    // Redirect to same page — forces layout to re-resolve with the new tenant cookie
    redirect(`/ops/cases/${id}`);
  }

  // Load tenant modules for notification settings (channel hints)
  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("modules")
    .eq("id", caseData.tenant_id)
    .single();
  const tenantModules = (tenantRow?.modules ?? {}) as Record<string, unknown>;

  // Resolve logged-in user for self-send guard + RBAC
  const authClient = await getAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  const userEmail = user?.email ?? "";

  // Look up staff record matching user's email for this tenant
  let currentStaffName: string | null = null;
  let staffRole: "admin" | "techniker" | undefined;
  if (userEmail && caseData.tenant_id) {
    const { data: staffMatch } = await supabase
      .from("staff")
      .select("display_name, role")
      .eq("tenant_id", caseData.tenant_id)
      .eq("email", userEmail)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (staffMatch) {
      currentStaffName = staffMatch.display_name;
      staffRole = staffMatch.role === "techniker" ? "techniker" : "admin";
    }
  }

  return (
    <>
      <ScrollToTop />
      {/* Header: compact — back + case ID + actions on one line, category below */}
      <div className="mb-4">
        {/* Row 1: Navigation + Case ID + Actions */}
        <div className="flex items-center justify-between">
          <Link href="/ops/cases" className="group flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0 rounded-lg px-2 py-1.5 -ml-2 hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span className="text-sm font-medium">Zurück</span>
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton />
            <DeleteButton caseId={caseData.id} isDeleted={!!caseData.is_deleted} />
            <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-bold tracking-wide">
              {caseId}
            </span>
          </div>
        </div>
        {/* Row 2: Category (full width, wraps naturally) */}
        <h1 className="text-lg font-bold text-gray-900 mt-2 leading-snug">{caseData.category}</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {SOURCE_LABELS[caseData.source] ?? caseData.source} · {formatDate(caseData.created_at)}
        </p>
      </div>

      {/* Tenant auto-switched via cookie when admin opens a foreign-tenant case */}

      {/* Case surface */}
      <CaseDetailForm
        initialData={caseData}
        isProspect={isProspect}
        caseEvents={caseEvents}
        brandColor={brandColor}
        currentStaffName={currentStaffName}
        staffRole={staffRole}
        notifySettings={{
          terminEmail: tenantModules.notify_termin_email !== false,
          terminSms: tenantModules.notify_termin_sms !== false,
          staffAssignment: tenantModules.notify_staff_assignment !== false,
        }}
      />

    </>
  );
}
