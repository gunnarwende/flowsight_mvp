import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { AttachmentsSection } from "./AttachmentsSection";
import { CaseDetailForm } from "./CaseDetailForm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CaseDetail {
  id: string;
  tenant_id: string;
  source: string;
  created_at: string;
  updated_at: string;
  contact_phone: string | null;
  contact_email: string | null;
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
}

// ---------------------------------------------------------------------------
// Page (Server Component — fetches data, passes to Client form)
// ---------------------------------------------------------------------------

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authClient = await getAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) redirect("/ops/login");

  const { id } = await params;

  const supabase = getServiceClient();
  const { data: row, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) notFound();

  const caseData = row as CaseDetail;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ops/cases" className="font-bold text-lg">
            FlowSight Ops
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 text-sm">
            Case {caseData.id.slice(0, 8)}
          </span>
        </div>
        <span className="text-slate-400 text-sm">{user.email}</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Link
          href="/ops/cases"
          className="text-slate-500 hover:text-slate-300 text-sm mb-4 inline-block"
        >
          &larr; Zurück zur Liste
        </Link>

        <CaseDetailForm initialData={caseData} />
        <div className="mt-6">
          <AttachmentsSection caseId={caseData.id} />
        </div>
      </main>
    </div>
  );
}
