import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";
import { CaseDetailForm } from "./CaseDetailForm";
import { AttachmentsSection } from "./AttachmentsSection";
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
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/ops/faelle" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span className="text-xs hidden sm:inline">Fallübersicht</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 truncate">{caseData.category}</h1>
          <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:inline">
            {SOURCE_LABELS[caseData.source] ?? caseData.source} · {formatDate(caseData.created_at)}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {}}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors print:hidden"
            title="Drucken / Exportieren"
            data-print-trigger
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
          </button>
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">
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

      {/* Attachments — integrated below */}
      {!isProspect && (
        <div className="mt-1">
          <AttachmentsSection caseId={caseData.id} />
        </div>
      )}

      {/* Print: trigger script */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('click', function(e) {
          if (e.target.closest('[data-print-trigger]')) window.print();
        });
      ` }} />
    </>
  );
}
