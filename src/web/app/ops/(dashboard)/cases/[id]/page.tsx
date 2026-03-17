import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";
import { CaseDetailForm } from "./CaseDetailForm";
import { PrintButton } from "./PrintButton";
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

  return (
    <>
      {/* Header: back + category + meta + actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Link href="/ops/faelle" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span className="text-xs hidden sm:inline">Fallübersicht</span>
            </Link>
            <div className="flex items-baseline gap-2 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{caseData.category}</h1>
              <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline">
                {SOURCE_LABELS[caseData.source] ?? caseData.source} · {formatDate(caseData.created_at)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 ml-9 mt-0.5 sm:hidden">
            {SOURCE_LABELS[caseData.source] ?? caseData.source} · {formatDate(caseData.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <PrintButton />
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-sm font-semibold">
            {caseId}
          </span>
        </div>
      </div>

      {/* Case surface */}
      <CaseDetailForm
        initialData={caseData}
        isProspect={isProspect}
        caseEvents={caseEvents}
        brandColor={brandColor}
      />

    </>
  );
}
