import { redirect } from "next/navigation";
import { getServiceClient } from "@/src/lib/supabase/server";
import { validateShortVerifyToken, generateVerifyToken } from "@/src/lib/sms/verifySmsToken";

interface PageProps {
  params: Promise<{ caseRef: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function parseCaseRef(s: string): { prefix: string; seq: number } | null {
  const match = s.match(/^([A-Za-z]{1,5})-(\d+)$/);
  if (!match) return null;
  return { prefix: match[1].toUpperCase(), seq: parseInt(match[2], 10) };
}

/**
 * Short review redirect: /r/[caseRef]?t=<16 hex chars>
 * Validates short token, then redirects to /review/[caseId]?token=<full token>
 */
export default async function ReviewShortRedirect({ params, searchParams }: PageProps) {
  const { caseRef } = await params;
  const sp = await searchParams;
  const shortToken = typeof sp.t === "string" ? sp.t : "";

  const invalid = (
    <div className="flex min-h-dvh items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 text-center shadow-lg">
        <p className="text-lg font-semibold text-gray-900">Link ung&uuml;ltig</p>
        <p className="mt-2 text-sm text-gray-500">
          Dieser Bewertungslink ist nicht mehr g&uuml;ltig.
        </p>
      </div>
    </div>
  );

  if (!shortToken) return invalid;

  const supabase = getServiceClient();
  let caseRow: { id: string; created_at: string } | null = null;

  if (isUuid(caseRef)) {
    const { data } = await supabase
      .from("cases")
      .select("id, created_at")
      .eq("id", caseRef)
      .single();
    caseRow = data;
  } else {
    const ref = parseCaseRef(caseRef);
    if (ref) {
      const { data: tenants } = await supabase
        .from("tenants")
        .select("id")
        .eq("case_id_prefix", ref.prefix);
      if (tenants && tenants.length > 0) {
        const tenantIds = tenants.map((t: { id: string }) => t.id);
        const { data } = await supabase
          .from("cases")
          .select("id, created_at")
          .in("tenant_id", tenantIds)
          .eq("seq_number", ref.seq)
          .single();
        caseRow = data;
      }
    }
  }

  if (!caseRow) return invalid;

  if (!validateShortVerifyToken(caseRow.id, caseRow.created_at, shortToken)) {
    return invalid;
  }

  // Generate full token for the review surface (it needs the long token for rate API)
  const fullToken = generateVerifyToken(caseRow.id, caseRow.created_at);
  redirect(`/review/${caseRow.id}?token=${fullToken}`);
}
