import type { Metadata } from "next";
import { getServiceClient } from "@/src/lib/supabase/server";
import ProofClient from "./ProofClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

// Privat: NIE indexieren (token-geschützt, ein Link pro Prospect).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Ihr persönlicher Einblick",
};

interface ProofRow {
  token: string;
  tenant_slug: string;
  company_name: string;
  contact_name: string | null;
  contact_salutation: string | null;
  variant: "notruf" | "preis";
  videos: { t1?: string; t2?: string; t2_portrait?: string; t3?: string; t4?: string };
  bunny_library_id: string | null;
  status: string;
  expires_at: string | null;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#0b1f33] text-slate-100">
      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-6 sm:py-10">{children}</main>
      <footer className="px-4 py-6 text-center text-xs text-slate-500">
        FlowSight · Oberrieden
      </footer>
    </div>
  );
}

function Invalid({ message }: { message: string }) {
  return (
    <Shell>
      <div className="mx-auto mt-16 max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-lg font-semibold text-white">Dieser Link ist nicht mehr aktiv</p>
        <p className="mt-3 text-sm text-slate-400">{message}</p>
      </div>
    </Shell>
  );
}

export default async function ProofPage({ params }: PageProps) {
  const { token } = await params;

  // Token-Format-Guard (24 hex) bevor DB-Hit
  if (!/^[0-9a-f]{16,64}$/i.test(token)) {
    return <Invalid message="Der Link ist unvollständig oder ungültig." />;
  }

  const supabase = getServiceClient();
  const { data } = await supabase
    .from("proof_pages")
    .select(
      "token, tenant_slug, company_name, contact_name, contact_salutation, variant, videos, bunny_library_id, status, expires_at"
    )
    .eq("token", token)
    .single();

  const row = data as ProofRow | null;

  if (!row) {
    return <Invalid message="Dieser Link existiert nicht (mehr)." />;
  }
  if (row.status !== "active") {
    return (
      <Invalid message="Dieser Einblick wurde inzwischen archiviert. Melden Sie sich kurz bei mir, dann schalte ich ihn wieder frei." />
    );
  }
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return (
      <Invalid message="Dieser Einblick ist abgelaufen. Melden Sie sich kurz bei mir, dann schicke ich Ihnen einen frischen Link." />
    );
  }

  const libraryId = row.bunny_library_id || "";
  const videos = row.videos || {};

  return (
    <Shell>
      <ProofClient
        token={row.token}
        slug={row.tenant_slug}
        companyName={row.company_name}
        salutation={row.contact_salutation}
        variant={row.variant}
        libraryId={libraryId}
        videos={videos}
      />
    </Shell>
  );
}
