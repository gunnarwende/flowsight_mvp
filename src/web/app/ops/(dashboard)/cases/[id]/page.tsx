import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/src/lib/supabase/server";
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
  voice: "Voice Agent",
  wizard: "Website-Formular",
  manual: "Manuell erfasst",
};

function formatCaseId(seq: number | null): string {
  if (seq === null) return "—";
  return `FS-${String(seq).padStart(4, "0")}`;
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
  const [{ data: row, error }, { data: events }] = await Promise.all([
    supabase.from("cases").select("*").eq("id", id).single(),
    supabase.from("case_events").select("*").eq("case_id", id).order("created_at"),
  ]);

  if (error || !row) notFound();

  const caseData = row as CaseDetail;
  const caseEvents = (events ?? []) as CaseEvent[];
  const caseId = formatCaseId(caseData.seq_number);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/ops/cases" className="hover:text-gray-700 transition-colors">
          Fälle
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{caseId}</span>
      </nav>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {caseData.category} — {caseData.description.length > 60 ? caseData.description.slice(0, 60) + "..." : caseData.description}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Erstellt am {formatDate(caseData.created_at)} via {SOURCE_LABELS[caseData.source] ?? caseData.source}
          </p>
        </div>
        <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium self-start">
          {caseId}
        </span>
      </div>

      {/* Two-column layout — items-start keeps sidebar aligned to top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case detail form (editable fields) */}
          <CaseDetailForm initialData={caseData} />

          {/* Timeline */}
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Verlauf</h2>
            <CaseTimeline events={caseEvents} />
          </section>

          {/* Attachments */}
          <AttachmentsSection caseId={caseData.id} />
        </div>

        {/* Sidebar — stacked cards, aligned to top of main content */}
        <div className="space-y-5">
          {/* Contact card */}
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Kontakt</h2>
            <div className="space-y-3">
              {/* Name */}
              <div className="flex items-start gap-3">
                <span className="text-slate-400 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </span>
                <span className="text-sm text-gray-900 font-medium">
                  {caseData.reporter_name ?? <span className="text-gray-400 font-normal">Kein Name</span>}
                </span>
              </div>

              {/* Phone */}
              {caseData.contact_phone && (
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </span>
                  <a
                    href={`tel:${caseData.contact_phone}`}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                  >
                    {caseData.contact_phone}
                  </a>
                </div>
              )}

              {/* Email */}
              {caseData.contact_email && (
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <a
                    href={`mailto:${caseData.contact_email}`}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all"
                  >
                    {caseData.contact_email}
                  </a>
                </div>
              )}

              {/* Address + Maps link */}
              <div className="flex items-start gap-3">
                <span className="text-slate-400 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm text-gray-900">
                    {[caseData.street, caseData.house_number].filter(Boolean).join(" ") || "\u2014"}
                  </p>
                  <p className="text-sm text-gray-900">
                    {caseData.plz} {caseData.city}
                  </p>
                  <a
                    href={googleMapsUrl(caseData.street, caseData.house_number, caseData.plz, caseData.city)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1 rounded-md mt-2 transition-colors font-medium"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    In Google Maps öffnen
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Notes card — always visible (empty state if no notes yet) */}
          <section className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">Notizen</h2>
            {caseData.internal_notes ? (
              <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                {caseData.internal_notes}
              </p>
            ) : (
              <p className="text-sm text-amber-600/60 italic">
                Noch keine Notizen. Klicke auf &quot;Bearbeiten&quot; um Notizen hinzuzufügen.
              </p>
            )}
          </section>

          {/* Quick info card */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Info</h2>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Erstellt</span>
                <span className="text-slate-900 font-medium">{formatDate(caseData.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Aktualisiert</span>
                <span className="text-slate-900 font-medium">{formatDate(caseData.updated_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Zuständig</span>
                <span className="text-slate-900 font-medium">{caseData.assignee_text ?? "\u2014"}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
