import { getServiceClient } from "@/src/lib/supabase/server";
import { validateShortVerifyToken, validateVerifyToken } from "@/src/lib/sms/verifySmsToken";
import CorrectionForm from "@/app/verify/[caseId]/CorrectionForm";

interface PageProps {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

/** Check if param looks like a UUID (8-4-4-4-12 hex) */
function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

/** Parse a short case ref like "JW-22" → { prefix: "JW", seq: 22 } */
function parseCaseRef(s: string): { prefix: string; seq: number } | null {
  const match = s.match(/^([A-Za-z]{1,5})-(\d+)$/);
  if (!match) return null;
  return { prefix: match[1].toUpperCase(), seq: parseInt(match[2], 10) };
}

/**
 * Short verify route: /v/[caseId]?t=<16 hex chars>
 * Accepts:
 *   - UUID:       /v/bf7c3640-a39a-4424-9d30-88422a0a6e7b?t=...
 *   - Short ref:  /v/JW-22?t=...  (prefix + seq_number)
 * Also accepts full ?token= for backwards compatibility.
 */
export default async function ShortVerifyPage({ params, searchParams }: PageProps) {
  const { caseId: caseParam } = await params;
  const sp = await searchParams;
  const shortToken = typeof sp.t === "string" ? sp.t : "";
  const fullToken = typeof sp.token === "string" ? sp.token : "";

  const shell = (content: React.ReactNode) => (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <span className="text-sm font-semibold text-gray-800">Service-Meldung</span>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
        {content}
      </main>
      <footer className="border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-400">
        Powered by FlowSight
      </footer>
    </div>
  );

  const supabase = getServiceClient();

  // Resolve case: UUID direct lookup or prefix-seq lookup
  let caseRow: { id: string; created_at: string; reporter_name: string | null; plz: string | null; city: string | null; street: string | null; house_number: string | null } | null = null;

  if (isUuid(caseParam)) {
    const { data } = await supabase
      .from("cases")
      .select("id, created_at, reporter_name, plz, city, street, house_number")
      .eq("id", caseParam)
      .single();
    caseRow = data;
  } else {
    const ref = parseCaseRef(caseParam);
    if (ref) {
      // Look up tenant by case_id_prefix, then case by tenant + seq_number
      const { data: tenants } = await supabase
        .from("tenants")
        .select("id")
        .eq("case_id_prefix", ref.prefix);
      if (tenants && tenants.length > 0) {
        const tenantIds = tenants.map((t: { id: string }) => t.id);
        const { data } = await supabase
          .from("cases")
          .select("id, created_at, reporter_name, plz, city, street, house_number")
          .in("tenant_id", tenantIds)
          .eq("seq_number", ref.seq)
          .single();
        caseRow = data;
      }
    }
  }

  if (!caseRow) {
    return shell(
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-lg font-semibold text-gray-800">Meldung nicht gefunden</p>
        <p className="mt-2 text-sm text-gray-500">
          Dieser Link ist ungueltig oder die Meldung existiert nicht mehr.
        </p>
      </div>
    );
  }

  // Validate: accept short token (?t=) or full token (?token=)
  // Token is always generated from the case UUID + created_at
  const isValid = shortToken
    ? validateShortVerifyToken(caseRow.id, caseRow.created_at, shortToken)
    : fullToken
      ? validateVerifyToken(caseRow.id, caseRow.created_at, fullToken)
      : false;

  if (!isValid) {
    return shell(
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-lg font-semibold text-red-800">Dieser Link ist ungueltig</p>
        <p className="mt-2 text-sm text-red-600">
          Bitte verwenden Sie den Link aus Ihrer SMS.
        </p>
      </div>
    );
  }

  // Pass the token the CorrectionForm needs for the API call (short or full)
  const tokenForApi = fullToken || shortToken;

  return shell(
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Meldung vervollstaendigen
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Bitte pruefen Sie Ihren Namen und Ihre Adresse und laden Sie bei Bedarf Fotos vom Schaden hoch.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <CorrectionForm
          caseId={caseRow.id}
          token={tokenForApi}
          initialName={caseRow.reporter_name ?? ""}
          initialPlz={caseRow.plz ?? ""}
          initialCity={caseRow.city ?? ""}
          initialStreet={caseRow.street ?? ""}
          initialHouseNumber={caseRow.house_number ?? ""}
        />
      </div>
    </div>
  );
}
