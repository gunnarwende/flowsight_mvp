import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";
import { CaseDetailForm } from "./CaseDetailForm";
import { AttachmentsSection } from "./AttachmentsSection";
import { CaseTimeline } from "@/src/components/ops/CaseTimeline";
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

const URGENCY_LABELS: Record<string, { text: string; className: string }> = {
  notfall: { text: "Notfall", className: "text-red-700 bg-red-50 border-red-200" },
  dringend: { text: "Dringend", className: "text-amber-700 bg-amber-50 border-amber-200" },
  normal: { text: "Normal", className: "text-gray-500 bg-gray-50 border-gray-200" },
};

const STATUS_LABELS_BETRIEB: Record<string, string> = {
  new: "Neu eingegangen",
  contacted: "In Bearbeitung",
  scheduled: "Termin steht",
  done: "Erledigt",
  archived: "Abgeschlossen",
};

function computeNextStep(c: CaseDetail): string {
  if (c.status === "new") return "Sichten und einordnen";
  if (c.status === "contacted" && !c.scheduled_at) return "Termin vereinbaren";
  if (c.status === "contacted" && c.scheduled_at) return "Termin best\u00e4tigen";
  if (c.status === "scheduled") return "Einsatz durchf\u00fchren";
  if (c.status === "done" && !c.review_sent_at) return "Review anfragen";
  if (c.status === "done") return "Abgeschlossen";
  return "";
}

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

function googleMapsUrl(street: string | null, houseNumber: string | null, plz: string, city: string): string {
  const parts = [street, houseNumber, plz, city, "Schweiz"].filter(Boolean);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(" "))}`;
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

  // Tenant isolation: non-admin can only see cases of their own tenant
  if (scope && !scope.isAdmin && scope.tenantId && row.tenant_id !== scope.tenantId) {
    notFound();
  }

  const caseData = row as CaseDetail;
  const caseEvents = (events ?? []) as CaseEvent[];

  // Resolve tenant identity for case ID prefix
  const identity = await resolveTenantIdentityById(caseData.tenant_id);
  const caseId = formatCaseId(caseData.seq_number, identity?.caseIdPrefix);
  const isProspect = scope?.isProspect ?? false;

  const nextStep = computeNextStep(caseData);
  const urgencyBarColor = caseData.urgency === "notfall" ? "bg-red-500" : caseData.urgency === "dringend" ? "bg-amber-400" : "bg-gray-200";

  return (
    <>
      {/* Compact header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/ops/cases" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span className="text-xs hidden sm:inline">Zentrale</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">{caseData.category}</h1>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            caseData.status === "new" ? "bg-blue-100 text-blue-700" :
            caseData.status === "contacted" ? "bg-sky-100 text-sky-700" :
            caseData.status === "scheduled" ? "bg-violet-100 text-violet-700" :
            caseData.status === "done" ? "bg-emerald-100 text-emerald-700" :
            "bg-gray-100 text-gray-500"
          }`}>
            {STATUS_LABELS_BETRIEB[caseData.status] ?? caseData.status}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(caseData.created_at)} &middot; {SOURCE_LABELS[caseData.source] ?? caseData.source}
          </span>
        </div>
        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">
          {caseId}
        </span>
      </div>

      {/* Lagekarte — enhanced Scan Head */}
      <div className={`bg-white border border-gray-200 border-l-[3px] ${urgencyBarColor === "bg-red-500" ? "border-l-red-500" : urgencyBarColor === "bg-amber-400" ? "border-l-amber-400" : "border-l-gray-200"} rounded-xl p-4 mb-4 shadow-sm`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6 text-sm">
          {/* Was */}
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-xs font-medium w-8 flex-shrink-0">Was</span>
            <span className="text-gray-900">
              <span className="font-semibold">{caseData.category}</span>
              {caseData.description && (
                <span className="text-gray-500"> — {caseData.description.length > 60 ? caseData.description.slice(0, 60) + "\u2026" : caseData.description}</span>
              )}
            </span>
          </div>
          {/* Wo */}
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-xs font-medium w-8 flex-shrink-0">Wo</span>
            <span className="text-gray-900">
              {[caseData.street, caseData.house_number].filter(Boolean).join(" ")}
              {(caseData.street || caseData.house_number) && ", "}
              {caseData.plz} {caseData.city}
            </span>
            <a
              href={googleMapsUrl(caseData.street, caseData.house_number, caseData.plz, caseData.city)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
              title="Google Maps"
            >
              <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
          {/* Wer */}
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-xs font-medium w-8 flex-shrink-0">Wer</span>
            <span className="text-gray-900">
              {caseData.assignee_text ? `\u2192 ${caseData.assignee_text}` : <span className="text-gray-400">Nicht zugewiesen</span>}
            </span>
          </div>
          {/* Wann */}
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-xs font-medium w-8 flex-shrink-0">Wann</span>
            <span className="text-gray-900">
              {caseData.scheduled_at
                ? new Date(caseData.scheduled_at).toLocaleDateString("de-CH", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" })
                : <span className="text-gray-400">Kein Termin</span>}
            </span>
          </div>
          {/* Prio */}
          {caseData.urgency !== "normal" && (
            <div className="flex items-baseline gap-2">
              <span className="text-gray-400 text-xs font-medium w-8 flex-shrink-0">Prio</span>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${URGENCY_LABELS[caseData.urgency]?.className ?? "text-gray-500"}`}>
                {URGENCY_LABELS[caseData.urgency]?.text ?? caseData.urgency}
              </span>
            </div>
          )}
        </div>

        {/* Nächster Schritt */}
        {nextStep && caseData.status !== "archived" && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <p className="text-sm text-amber-900 font-medium">
                N\u00e4chster Schritt: {nextStep}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Two-column layout — fits on one screen */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: form (all fields, always editable) */}
        <div className="lg:col-span-3">
          <CaseDetailForm initialData={caseData} isProspect={scope?.isProspect ?? false} caseEvents={caseEvents} />
        </div>

        {/* Right: contact + timeline + attachments */}
        <div className="lg:col-span-2 space-y-4">
          {/* Contact card — hidden for prospects (PII) */}
          {!isProspect && (
            <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h2 className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Kontakt</h2>
              <div className="space-y-2 text-sm">
                {caseData.reporter_name && (
                  <p className="font-medium text-gray-900">{caseData.reporter_name}</p>
                )}
                {caseData.contact_phone && (
                  <a href={`tel:${caseData.contact_phone}`} className="block text-blue-600 hover:underline">
                    {caseData.contact_phone}
                  </a>
                )}
                {caseData.contact_email && (
                  <a href={`mailto:${caseData.contact_email}`} className="block text-blue-600 hover:underline break-all">
                    {caseData.contact_email}
                  </a>
                )}
                <div className="pt-1">
                  <p className="text-gray-700">
                    {[caseData.street, caseData.house_number].filter(Boolean).join(" ") || "\u2014"}
                  </p>
                  <p className="text-gray-700">{caseData.plz} {caseData.city}</p>
                  <a
                    href={googleMapsUrl(caseData.street, caseData.house_number, caseData.plz, caseData.city)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Google Maps
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Timeline */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Verlauf</h2>
            <CaseTimeline events={caseEvents} status={caseData.status} />
          </section>

          {/* Attachments — hidden for prospects */}
          {!isProspect && <AttachmentsSection caseId={caseData.id} />}
        </div>
      </div>
    </>
  );
}
