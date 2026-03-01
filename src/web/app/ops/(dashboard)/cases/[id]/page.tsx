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

const URGENCY_COLORS: Record<string, string> = {
  notfall: "bg-red-500",
  dringend: "bg-amber-500",
  normal: "bg-gray-400",
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
  const urgencyDot = URGENCY_COLORS[caseData.urgency] ?? "bg-gray-400";

  return (
    <>
      {/* Compact header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/ops/cases" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${urgencyDot}`} />
            <h1 className="text-lg font-bold text-gray-900">{caseData.category}</h1>
          </div>
          <span className="text-xs text-gray-400">
            {formatDate(caseData.created_at)} &middot; {SOURCE_LABELS[caseData.source] ?? caseData.source}
          </span>
        </div>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
          {caseId}
        </span>
      </div>

      {/* Two-column layout — fits on one screen */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: form (all fields, always editable) */}
        <div className="lg:col-span-3">
          <CaseDetailForm initialData={caseData} />
        </div>

        {/* Right: contact + timeline + attachments */}
        <div className="lg:col-span-2 space-y-4">
          {/* Contact card */}
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

          {/* Timeline */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Verlauf</h2>
            <CaseTimeline events={caseEvents} status={caseData.status} />
          </section>

          {/* Attachments */}
          <AttachmentsSection caseId={caseData.id} />
        </div>
      </div>
    </>
  );
}
