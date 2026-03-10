import { getServiceClient } from "@/src/lib/supabase/server";
import { validateVerifyToken } from "@/src/lib/sms/verifySmsToken";

interface PageProps {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const { caseId } = await params;
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";

  // ── Invalid link shell ──────────────────────────────────────────────
  const invalidShell = (
    <div className="flex min-h-dvh items-center justify-center bg-[#e8eaed] p-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-900">Link ungueltig</p>
        <p className="mt-2 text-sm text-gray-500">
          Dieser Bewertungslink ist nicht mehr gueltig oder wurde bereits verwendet.
        </p>
      </div>
    </div>
  );

  // ── Load case ───────────────────────────────────────────────────────
  const supabase = getServiceClient();
  const { data: caseRow, error } = await supabase
    .from("cases")
    .select("id, created_at, tenant_id, reporter_name")
    .eq("id", caseId)
    .single();

  if (error || !caseRow) return invalidShell;

  // ── HMAC validation ─────────────────────────────────────────────────
  if (!validateVerifyToken(caseId, caseRow.created_at, token)) {
    return invalidShell;
  }

  // ── Resolve tenant name ─────────────────────────────────────────────
  let companyName = "Ihr Dienstleister";
  let googleReviewUrl: string | null = null;
  {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name, slug, modules")
      .eq("id", caseRow.tenant_id)
      .single();

    if (tenant?.name) companyName = tenant.name;

    const modules = tenant?.modules as Record<string, unknown> | null;
    if (typeof modules?.google_review_url === "string" && modules.google_review_url.length > 0) {
      googleReviewUrl = modules.google_review_url;
    }
  }

  // ── Derive initials ─────────────────────────────────────────────────
  const displayName = "Max Mustermann";
  const initial = displayName.charAt(0).toUpperCase();

  // ── Pre-filled review text ──────────────────────────────────────────
  const placeholderText =
    "Hervorragender Service! Schnelle Reaktion auf unseren Notfall. Das Team war professionell und hat das Problem sofort geloest. Sehr empfehlenswert!";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#e8eaed] p-4">
      {/* Google-style review card */}
      <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-xl">
        {/* Header — company name */}
        <div className="border-b border-gray-100 px-6 pt-6 pb-4">
          <h1 className="text-center text-[17px] font-medium text-gray-900">
            {companyName}
          </h1>
        </div>

        {/* User avatar + name */}
        <div className="flex flex-col items-center px-6 pt-5">
          {/* Avatar circle */}
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#e91e8c]">
            <span className="text-xl font-medium text-white">{initial}</span>
          </div>
          <p className="mt-2.5 text-[15px] font-medium text-gray-900">
            {displayName}
          </p>
          {/* Google disclosure */}
          <div className="mt-1 flex items-center gap-1">
            <p className="text-xs text-gray-500">
              Beitrag wird Google-weit veroeffentlicht
            </p>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gray-400"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 16v-4m0-4h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-1 px-6 pt-4 pb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="#fbbc04"
              className="cursor-pointer transition-transform hover:scale-110"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        {/* Text area */}
        <div className="px-6 pt-3">
          <textarea
            className="h-[120px] w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] leading-relaxed text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-400"
            placeholder="Beschreiben Sie Ihre Erfahrung..."
            defaultValue={placeholderText}
            readOnly
          />
        </div>

        {/* Add photos button */}
        <div className="px-6 pt-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-500">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Fotos und Videos hinzufuegen
          </button>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between px-6 pt-5 pb-6">
          <button
            type="button"
            className="text-[14px] font-medium text-blue-600 hover:text-blue-700"
          >
            Abbrechen
          </button>
          {googleReviewUrl ? (
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#1a73e8] px-6 py-2.5 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#1557b0]"
            >
              Posten
            </a>
          ) : (
            <button
              type="button"
              className="rounded-full bg-[#1a73e8] px-6 py-2.5 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#1557b0]"
            >
              Posten
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
