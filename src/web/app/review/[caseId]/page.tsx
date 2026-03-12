import { getServiceClient } from "@/src/lib/supabase/server";
import { validateVerifyToken } from "@/src/lib/sms/verifySmsToken";
import { getCustomer } from "@/src/lib/customers/registry";
import { ReviewSurfaceClient } from "./ReviewSurfaceClient";

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
    <div className="flex min-h-dvh items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-900">Link ung&uuml;ltig</p>
        <p className="mt-2 text-sm text-gray-500">
          Dieser Bewertungslink ist nicht mehr g&uuml;ltig oder wurde bereits verwendet.
        </p>
      </div>
    </div>
  );

  // ── Load case ───────────────────────────────────────────────────────
  const supabase = getServiceClient();
  const { data: caseRow, error } = await supabase
    .from("cases")
    .select("id, created_at, tenant_id, category, plz, city")
    .eq("id", caseId)
    .single();

  if (error || !caseRow) return invalidShell;

  // ── HMAC validation ─────────────────────────────────────────────────
  if (!validateVerifyToken(caseId, caseRow.created_at, token)) {
    return invalidShell;
  }

  // ── Resolve tenant ─────────────────────────────────────────────────
  let companyName = "Ihr Dienstleister";
  let googleReviewUrl: string | null = null;
  let tenantSlug: string | null = null;
  {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name, slug, modules")
      .eq("id", caseRow.tenant_id)
      .single();

    if (tenant?.name) companyName = tenant.name;
    if (tenant?.slug) tenantSlug = tenant.slug;

    const modules = tenant?.modules as Record<string, unknown> | null;
    if (typeof modules?.google_review_url === "string" && modules.google_review_url.length > 0) {
      googleReviewUrl = modules.google_review_url;
    }
  }

  // ── Brand color from customer registry ──────────────────────────────
  const customer = tenantSlug ? getCustomer(tenantSlug) : undefined;
  const brandColor = customer?.brandColor ?? "#d4a853"; // FlowSight gold as fallback

  // ── Track surface opened (fire-and-forget) ─────────────────────────
  await supabase.from("case_events").insert({
    case_id: caseId,
    event_type: "review_surface_opened",
    title: "Bewertungsseite ge\u00f6ffnet",
  }).then(() => {});

  // ── Display values ─────────────────────────────────────────────────
  const location = [caseRow.plz, caseRow.city].filter(Boolean).join(" ") || "\u2014";
  const caseDate = new Date(caseRow.created_at).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Zurich",
  });

  const defaultReviewText = [
    "Sehr kompetenter und zuverl\u00e4ssiger Service.",
    "Schnelle Reaktion, saubere Arbeit, faire Preise.",
    "Jederzeit wieder \u2014 klare Empfehlung!",
  ].join("\n");

  return (
    <ReviewSurfaceClient
      companyName={companyName}
      brandColor={brandColor}
      category={caseRow.category || "\u2014"}
      location={location}
      caseDate={caseDate}
      defaultText={defaultReviewText}
      googleReviewUrl={googleReviewUrl}
      trackUrl={`/api/review/${caseId}/track`}
    />
  );
}
