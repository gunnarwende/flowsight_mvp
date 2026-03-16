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

  return (
    <>
      {/* Minimal header: back + category + case ID + meta */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/ops/cases" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span className="text-xs hidden sm:inline">Leitzentrale</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 truncate">{caseData.category}</h1>
          <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:inline">
            {SOURCE_LABELS[caseData.source] ?? caseData.source} · {formatDate(caseData.created_at)}
          </span>
        </div>
        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0">
          {caseId}
        </span>
      </div>

      {/* Overview card — single operational surface */}
      <CaseDetailForm initialData={caseData} isProspect={isProspect} caseEvents={caseEvents} />

      {/* Attachments — separate section below */}
      {!isProspect && (
        <div className="mt-4">
          <AttachmentsSection caseId={caseData.id} />
        </div>
      )}
    </>
  );
}
