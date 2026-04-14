import { notFound } from "next/navigation";
import { getCustomer, getAllCustomerSlugs } from "@/src/lib/customers/registry";
import { ServiceCard } from "./ServiceCard";
import type { Metadata } from "next";
import type {
  CustomerSite,
  Service,
  ServiceIcon,
} from "@/src/lib/customers/types";

// ── Static generation ─────────────────────────────────────────────
export function generateStaticParams() {
  return getAllCustomerSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCustomer(slug);
  if (!c) return {};
  const title = `${c.companyName} — ${c.tagline}`;
  return {
    title,
    description: c.metaDescription,
    keywords: c.seoKeywords,
    openGraph: {
      title,
      description: c.metaDescription,
      url: `https://flowsight.ch/kunden/${slug}`,
      siteName: c.companyName,
      locale: "de_CH",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: c.metaDescription,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────
const SHOW_RATING_THRESHOLD = 4.0;
const SHOW_HISTORY_MIN_ENTRIES = 2;
const SHOW_HISTORY_MIN_YEARS = 20;

function shouldShowHistory(history?: CustomerSite["history"]): boolean {
  if (!history || history.length < SHOW_HISTORY_MIN_ENTRIES) return false;
  const years = new Date().getFullYear() - history[0].year;
  return years >= SHOW_HISTORY_MIN_YEARS;
}

// ── Default section order ─────────────────────────────────────────
const DEFAULT_SECTION_ORDER = [
  "services", "reviews", "serviceArea", "team", "history", "trust", "careers", "contact",
];

// ── Font class mapping ───────────────────────────────────────────
const FONT_CLASS: Record<string, string> = {
  geist: "cs-font-geist",
  inter: "cs-font-inter",
  "dm-sans": "cs-font-dm-sans",
  "source-serif": "cs-font-source-serif",
};

// ── Page ──────────────────────────────────────────────────────────
export default async function CustomerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCustomer(slug);
  if (!c) notFound();

  const accent = c.brandColor ?? "#2b6cb0";
  const wizardUrl = `/kunden/${c.slug}/meldung`;
  const theme = c.theme;
  const colorMode = theme?.colorMode ?? "neutral";
  const fontClass = FONT_CLASS[theme?.fontFamily ?? "geist"] ?? "";
  const heroStyle = theme?.heroStyle ?? "classic";
  const sectionOrder = theme?.sectionOrder ?? DEFAULT_SECTION_ORDER;

  // Section registry — maps keys to conditional JSX
  const sectionMap: Record<string, React.ReactNode> = {
    services: <ServicesSection key="services" services={c.services} gallery={c.gallery} companyName={c.companyName} accent={accent} />,
    reviews: c.reviews ? <ReviewsSection key="reviews" reviews={c.reviews} accent={accent} /> : null,
    serviceArea: <ServiceAreaSection key="serviceArea" area={c.serviceArea} companyName={c.companyName} mapUrl={c.contact.mapEmbedUrl} />,
    team: c.team.length > 1 ? <TeamSection key="team" team={c.team} teamPhoto={c.teamPhoto} companyName={c.companyName} accent={accent} /> : null,
    history: shouldShowHistory(c.history) ? <HistorySection key="history" history={c.history!} companyName={c.companyName} accent={accent} /> : null,
    trust: (c.certifications || c.brandPartners) ? <TrustSection key="trust" certifications={c.certifications} partners={c.brandPartners} accent={accent} /> : null,
    careers: (c.careers && c.careers.length > 0) ? <CareersSection key="careers" careers={c.careers} companyName={c.companyName} contact={c.contact} accent={accent} /> : null,
    contact: <ContactSection key="contact" company={c} accent={accent} wizardUrl={wizardUrl} />,
  };

  // Hero dispatcher
  const heroElement = heroStyle === "split"
    ? <HeroSplit company={c} accent={accent} wizardUrl={wizardUrl} />
    : heroStyle === "center"
      ? <HeroCenter company={c} accent={accent} wizardUrl={wizardUrl} />
      : <HeroSection company={c} accent={accent} wizardUrl={wizardUrl} />;

  return (
    <div
      className={`min-h-screen text-gray-900 ${fontClass}`}
      data-color-mode={colorMode}
      style={{ backgroundColor: "var(--cs-surface, #ffffff)" }}
    >
      <Nav company={c} accent={accent} wizardUrl={wizardUrl} />
      {heroElement}
      {sectionOrder.map((key) => sectionMap[key] ?? null)}
      <Footer company={c} />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/* ── Navigation ──────────────────────────────────────────────────── */
function Nav({ company: c, accent, wizardUrl }: { company: CustomerSite; accent: string; wizardUrl: string }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      {/* Brand accent bar */}
      <div className="h-1" style={{ backgroundColor: accent }} />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href={`/kunden/${c.slug}`} className="text-xl font-bold" style={{ color: accent }}>
          {c.companyName}
        </a>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#leistungen" className="text-sm text-gray-600 transition-colors hover:text-gray-900">Leistungen</a>
          {c.reviews && <a href="#bewertungen" className="text-sm text-gray-600 transition-colors hover:text-gray-900">Bewertungen</a>}
          {c.team.length > 1 && <a href="#team" className="text-sm text-gray-600 transition-colors hover:text-gray-900">Team</a>}
          <a href="#kontakt" className="text-sm text-gray-600 transition-colors hover:text-gray-900">Kontakt</a>
          <a href={`tel:${c.contact.phoneRaw}`} className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            {c.contact.phone}
          </a>
          {c.emergency?.enabled ? (
            <a href={`tel:${c.emergency.phoneRaw}`} className="rounded-lg bg-[#c41e3a] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90">
              {c.emergency.label}
            </a>
          ) : (
            <a href={wizardUrl} className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent }}>
              Anliegen melden
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          {c.emergency?.enabled ? (
            <a href={`tel:${c.emergency.phoneRaw}`} className="rounded-lg bg-[#c41e3a] px-4 py-2 text-sm font-bold text-white">Notfall</a>
          ) : (
            <a href={`tel:${c.contact.phoneRaw}`} className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: accent }}>
              {c.contact.phone}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────── */
function HeroSection({ company: c, accent, wizardUrl }: { company: CustomerSite; accent: string; wizardUrl: string }) {
  const foundedYear = c.history?.[0]?.year;
  const yearsActive = foundedYear ? new Date().getFullYear() - foundedYear : null;
  // Hero image: dedicated hero file or first gallery image as fallback
  const heroImg = `/kunden/${c.slug}/hero.jpg`;

  return (
    <section className="relative overflow-hidden text-white" style={{ minHeight: "70vh" }}>
      {heroImg ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImg} alt={`${c.companyName} — ${c.tagline}`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/55" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gray-900" />
          <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${accent} 0%, transparent 60%)` }} />
        </>
      )}
      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center px-6 py-20">
        <div className="max-w-2xl">
          {foundedYear && (
            <div className="mb-6 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              Seit {foundedYear} in {c.contact.address.city}
            </div>
          )}
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{c.companyName}</h1>
          <p className="mt-4 text-lg text-white/80 sm:text-xl">{c.tagline}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a href={wizardUrl} className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent }}>
              Anliegen melden
            </a>
            <a href={`tel:${c.contact.phoneRaw}`} className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
              Anrufen: {c.contact.phone}
            </a>
          </div>
          {/* Stats row */}
          <div className="mt-12 flex flex-wrap gap-8 border-t border-white/15 pt-6">
            {yearsActive && yearsActive >= 5 && (
              <div><p className="text-2xl font-bold">{yearsActive}+</p><p className="text-xs text-white/60">Jahre Erfahrung</p></div>
            )}
            {c.reviews && c.reviews.averageRating >= SHOW_RATING_THRESHOLD && (
              <div><p className="text-2xl font-bold">{c.reviews.averageRating}&#9733;</p><p className="text-xs text-white/60">{c.reviews.totalReviews} Bewertungen</p></div>
            )}
            <div><p className="text-2xl font-bold">{c.services.length}</p><p className="text-xs text-white/60">Fachbereiche</p></div>
            <div><p className="text-2xl font-bold">{c.serviceArea.gemeinden.length}+</p><p className="text-xs text-white/60">Gemeinden</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Hero Split — TRADITION profile ─────────────────────────────
   Image right, text left on solid background. Warm, dignified.    */
function HeroSplit({ company: c, accent, wizardUrl }: { company: CustomerSite; accent: string; wizardUrl: string }) {
  const foundedYear = c.history?.[0]?.year;
  const yearsActive = foundedYear ? new Date().getFullYear() - foundedYear : null;
  const heroImg = `/kunden/${c.slug}/hero.jpg`;

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "70vh" }}>
      <div className="mx-auto flex min-h-[70vh] max-w-6xl">
        {/* Left: Text on solid background */}
        <div className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-12 lg:pr-16" style={{ backgroundColor: "var(--cs-surface, #faf8f5)" }}>
          {foundedYear && (
            <div className="mb-5 inline-block self-start rounded-full px-4 py-1.5 text-sm font-medium" style={{ backgroundColor: `${accent}15`, color: accent }}>
              Seit {foundedYear} in {c.contact.address.city}
            </div>
          )}
          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">{c.companyName}</h1>
          <p className="mt-4 text-lg" style={{ color: "var(--cs-text-muted, #6b7280)" }}>{c.tagline}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a href={wizardUrl} className="inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent }}>
              Anliegen melden
            </a>
            <a href={`tel:${c.contact.phoneRaw}`} className="inline-flex items-center justify-center rounded-xl border px-7 py-3.5 text-base font-semibold transition-colors hover:bg-gray-50" style={{ borderColor: accent, color: accent }}>
              {c.contact.phone}
            </a>
          </div>
          {/* Stats */}
          <div className="mt-10 flex flex-wrap gap-6 border-t pt-5" style={{ borderColor: "var(--cs-border, #e5e7eb)" }}>
            {yearsActive && yearsActive >= 5 && (
              <div><p className="text-xl font-bold text-gray-900">{yearsActive}+</p><p className="text-xs" style={{ color: "var(--cs-text-muted)" }}>Jahre Erfahrung</p></div>
            )}
            {c.reviews && c.reviews.averageRating >= SHOW_RATING_THRESHOLD && (
              <div><p className="text-xl font-bold text-gray-900">{c.reviews.averageRating}&#9733;</p><p className="text-xs" style={{ color: "var(--cs-text-muted)" }}>{c.reviews.totalReviews} Bewertungen</p></div>
            )}
            <div><p className="text-xl font-bold text-gray-900">{c.services.length}</p><p className="text-xs" style={{ color: "var(--cs-text-muted)" }}>Fachbereiche</p></div>
          </div>
        </div>
        {/* Right: Image */}
        <div className="hidden lg:block lg:w-[45%] relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImg} alt={`${c.companyName}`} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
      {/* Mobile: image below as banner */}
      <div className="lg:hidden relative h-56">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImg} alt={`${c.companyName}`} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </section>
  );
}

/* ── Hero Center — NAEHE profile ───────────────────────────────
   Fullscreen image, centered text, stronger overlay. Intimate.   */
function HeroCenter({ company: c, accent, wizardUrl }: { company: CustomerSite; accent: string; wizardUrl: string }) {
  const foundedYear = c.history?.[0]?.year;
  const heroImg = `/kunden/${c.slug}/hero.jpg`;

  return (
    <section className="relative overflow-hidden text-white" style={{ minHeight: "70vh" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={heroImg} alt={`${c.companyName} — ${c.tagline}`} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gray-900/85" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        {foundedYear && (
          <div className="mb-5 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            Seit {foundedYear} in {c.contact.address.city}
          </div>
        )}
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">{c.companyName}</h1>
        <p className="mt-4 text-lg text-white/75 sm:text-xl max-w-xl">{c.tagline}</p>
        {/* Prominent review badge */}
        {c.reviews && c.reviews.averageRating >= SHOW_RATING_THRESHOLD && c.reviews.totalReviews >= 10 && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 backdrop-blur-sm">
            <span className="text-xl font-bold">{c.reviews.averageRating}&#9733;</span>
            <span className="text-sm text-white/80">aus {c.reviews.totalReviews} Bewertungen</span>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a href={wizardUrl} className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent }}>
            Anliegen melden
          </a>
          <a href={`tel:${c.contact.phoneRaw}`} className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
            {c.contact.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Services — Card Layout ───────────────────────────────────────
   Icon → Name → 2-sentence Summary → "Mehr" → Reference images.
   Click on card → opens full detail overlay.                       */
function ServicesSection({
  services,
  gallery,
  companyName,
  accent,
}: {
  services: Service[];
  gallery: CustomerSite["gallery"];
  companyName: string;
  accent: string;
}) {
  const galleryMap = new Map(gallery.map((g) => [g.slug, g.images]));

  return (
    <section id="leistungen" className="py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Unsere Leistungen</h2>
          <p className="mt-3 text-lg text-gray-600">Kompetenz aus einer Hand — von {companyName}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const imgs = galleryMap.get(s.slug) ?? [];
            return (
              <ServiceCard
                key={s.slug}
                name={s.name}
                summary={s.summary}
                description={s.description}
                bullets={s.bullets}
                icon={<ServiceIconSvg icon={s.icon} />}
                images={imgs}
                accent={accent}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Reviews ───────────────────────────────────────────────────────
   Rating < 4.0 → don't show score, only show positive quotes.      */
function ReviewsSection({
  reviews,
  accent,
}: {
  reviews: NonNullable<CustomerSite["reviews"]>;
  accent: string;
}) {
  const showScore = reviews.averageRating >= SHOW_RATING_THRESHOLD;
  return (
    <section id="bewertungen" className="border-y border-gray-100 bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          {showScore && (
            <>
              <div className="mb-3 flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`h-7 w-7 ${i < Math.round(reviews.averageRating) ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-2xl font-bold text-gray-900">{reviews.averageRating} von 5 Sternen</p>
              {reviews.totalReviews >= 5 && (
                <p className="mt-1 text-sm text-gray-500">Basierend auf {reviews.totalReviews} Bewertungen</p>
              )}
            </>
          )}
          {!showScore && (
            <>
              <h2 className="text-2xl font-bold text-gray-900">Was unsere Kunden sagen</h2>
              {reviews.totalReviews >= 5 && (
                <p className="mt-1 text-sm text-gray-500">{reviews.totalReviews} Bewertungen</p>
              )}
            </>
          )}
        </div>

        {reviews.highlights.length > 0 ? (
          <div className={`mx-auto mt-12 max-w-5xl ${reviews.highlights.length <= 2 ? "flex flex-col items-center gap-6 sm:flex-row sm:justify-center" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {reviews.highlights.map((r, i) => (
              <div key={i} className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${reviews.highlights.length <= 2 ? "w-full max-w-md" : ""}`}>
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;{r.text}&rdquo;</p>
                <p className="mt-4 text-xs font-medium text-gray-500">{r.author}</p>
              </div>
            ))}
          </div>
        ) : reviews.googleUrl ? (
          <div className="mt-10 text-center">
            <a
              href={reviews.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow-md"
            >
              <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              Alle Bewertungen auf Google ansehen
            </a>
          </div>
        ) : null}

      </div>
    </section>
  );
}

/* ── Service Area ──────────────────────────────────────────────────── */
function ServiceAreaSection({ area, companyName, mapUrl }: { area: CustomerSite["serviceArea"]; companyName: string; mapUrl?: string }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="grid lg:grid-cols-2">
            <div className="p-10 lg:p-14">
              <h2 className="text-3xl font-bold sm:text-4xl">Ihr lokaler Partner</h2>
              <p className="mt-2 text-lg text-gray-600">{companyName} — {area.region}</p>
              {area.radiusDescription && <p className="mt-4 leading-relaxed text-gray-500">{area.radiusDescription}</p>}
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">Wir sind vor Ort in</p>
                <div className="flex flex-wrap gap-2">
                  {area.gemeinden.map((g) => (
                    <span key={g} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">{g}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="min-h-[300px] bg-gray-100 lg:min-h-0">
              {mapUrl ? (
                <iframe src={mapUrl} className="h-full w-full border-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Standort" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-5xl">&#128205;</p>
                    <p className="mt-3 text-lg font-semibold text-gray-600">{area.region}</p>
                    <p className="text-sm">{area.gemeinden.length} Gemeinden</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Team ────────────────────────────────────────────────────────── */
function TeamSection({ team, teamPhoto, companyName, accent }: { team: CustomerSite["team"]; teamPhoto?: string; companyName: string; accent: string }) {
  // Two-column layout when team photo is available and team is large
  if (teamPhoto && team.length > 4) {
    return (
      <section id="team" className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Unser Team</h2>
            <p className="mt-3 text-lg text-gray-600">Die Menschen hinter {companyName}</p>
          </div>
          <div className="mt-14 grid items-start gap-10 lg:grid-cols-2">
            {/* Left: team members grid */}
            <div className="grid grid-cols-2 gap-4">
              {team.map((m) => (
                <div key={m.name} className="rounded-xl border border-gray-200 bg-white px-4 py-5 text-center shadow-sm transition-shadow hover:shadow-md">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: accent }}>
                    {m.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-gray-900">{m.name}</h3>
                  <p className="text-xs font-medium" style={{ color: accent }}>{m.role}</p>
                  {m.bio && <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{m.bio}</p>}
                </div>
              ))}
            </div>
            {/* Right: team photo */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamPhoto} alt={`Team ${companyName}`} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default: card grid (no photo)
  const gridCls = team.length === 1 ? "flex justify-center"
    : team.length === 2 ? "grid max-w-2xl grid-cols-2 gap-8"
    : team.length <= 3 ? "grid max-w-4xl grid-cols-3 gap-8"
    : "grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4";

  return (
    <section id="team" className="border-t border-gray-100 bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Unser Team</h2>
          <p className="mt-3 text-lg text-gray-600">Die Menschen hinter {companyName}</p>
        </div>
        <div className={`mx-auto mt-14 ${gridCls}`}>
          {team.map((m) => (
            <div key={m.name} className="w-full max-w-xs rounded-2xl border border-gray-200 bg-white p-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold text-white" style={{ backgroundColor: accent }}>
                {m.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{m.name}</h3>
              <p className="text-sm font-medium" style={{ color: accent }}>{m.role}</p>
              {m.bio && <p className="mt-3 text-sm leading-relaxed text-gray-600">{m.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── History ──────────────────────────────────────────────────────── */
function HistorySection({ history, companyName, accent }: { history: NonNullable<CustomerSite["history"]>; companyName: string; accent: string }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{new Date().getFullYear() - history[0].year} Jahre Geschichte</h2>
          <p className="mt-3 text-lg text-gray-600">Die Geschichte von {companyName}</p>
        </div>
        <div className="relative mx-auto mt-14 max-w-2xl">
          <div className="absolute left-6 top-0 h-full w-px bg-gray-200 sm:left-1/2" />
          {history.map((h, i) => (
            <div key={h.year} className={`relative mb-10 flex items-start gap-6 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
              <div className="absolute left-6 z-10 -ml-2 mt-1 h-4 w-4 rounded-full border-2 bg-white sm:left-1/2" style={{ borderColor: accent }} />
              <div className={`ml-14 sm:ml-0 sm:w-[calc(50%-2rem)] ${i % 2 === 0 ? "sm:pr-8 sm:text-right" : "sm:pl-8"}`}>
                <span className="text-sm font-bold" style={{ color: accent }}>{h.year}</span>
                <h3 className="mt-1 font-semibold">{h.title}</h3>
                {h.description && <p className="mt-1 text-sm text-gray-600">{h.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Trust ────────────────────────────────────────────────────────── */
function TrustSection({ certifications, partners, accent }: { certifications?: CustomerSite["certifications"]; partners?: CustomerSite["brandPartners"]; accent: string }) {
  return (
    <section className="border-t border-gray-100 bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Qualit&auml;t, der Sie vertrauen k&ouml;nnen</h2>
          <p className="mt-3 text-lg text-gray-600">Zertifiziert und im Verbund mit f&uuml;hrenden Marken</p>
        </div>
        {certifications && certifications.length > 0 && (
          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-6">
            {certifications.map((cert) => (
              <div key={cert.name} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: accent }}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">{cert.name}</p>
                  {cert.issuer && <p className="text-xs text-gray-500">{cert.issuer}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        {partners && partners.length > 0 && (
          <div className="mt-14">
            <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-gray-400">Wir arbeiten mit den Besten</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {partners.map((p) => (
                <a key={p.name} href={p.url ?? "#"} target={p.url ? "_blank" : undefined} rel={p.url ? "noopener noreferrer" : undefined} className="group rounded-xl border border-gray-200 bg-white px-6 py-4 text-center transition-all hover:shadow-md">
                  <p className="text-base font-semibold text-gray-700 transition-colors group-hover:text-gray-900">{p.name}</p>
                  {p.url && <p className="mt-0.5 text-xs text-gray-400 transition-colors group-hover:text-gray-500">{p.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</p>}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Careers ──────────────────────────────────────────────────────── */
function CareersSection({ careers, companyName, contact, accent }: { careers: NonNullable<CustomerSite["careers"]>; companyName: string; contact: CustomerSite["contact"]; accent: string }) {
  return (
    <section className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Karriere bei {companyName}</h2>
          <p className="mt-3 text-lg text-gray-600">Werde Teil unseres Teams</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6">
          {careers.map((job) => (
            <details key={job.title} className="group rounded-2xl border border-gray-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <span className="mt-1 inline-block rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600">
                    {job.type === "fulltime" ? "Vollzeit" : job.type === "apprentice" ? "Lehrstelle" : "Teilzeit"}
                  </span>
                </div>
                <svg className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                <p className="text-sm leading-relaxed text-gray-700">{job.description}</p>
                {job.requirements && (
                  <>
                    <p className="mb-2 mt-4 text-sm font-semibold text-gray-900">Anforderungen:</p>
                    <ul className="space-y-1.5">
                      {job.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><span style={{ color: accent }}>&#8226;</span>{r}</li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {contact.email && (
                    <a href={`mailto:${contact.email}?subject=Bewerbung: ${job.title}`} className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent }}>
                      Jetzt bewerben
                    </a>
                  )}
                  <a href={`tel:${contact.phoneRaw}`} className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                    Fragen? {contact.phone}
                  </a>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contact ─────────────────────────────────────────────────────── */
function ContactSection({ company: c, accent, wizardUrl }: { company: CustomerSite; accent: string; wizardUrl: string }) {
  return (
    <section id="kontakt" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Wizard CTA */}
        <div className="mb-12 overflow-hidden rounded-2xl" style={{ backgroundColor: accent }}>
          <div className="p-8 text-center text-white sm:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Anliegen melden — schnell und unkompliziert</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Nutzen Sie unseren digitalen Assistenten, um Ihr Anliegen direkt zu erfassen. Wir melden uns umgehend bei Ihnen.
            </p>
            <a href={wizardUrl} className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold transition-opacity hover:opacity-90" style={{ color: accent }}>
              Jetzt Anliegen melden &rarr;
            </a>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Kontakt</h2>
            <p className="mt-3 text-lg text-gray-600">Wir freuen uns auf Ihre Anfrage</p>
            <div className="mt-8 space-y-5">
              <ContactRow icon="pin" accent={accent}>
                <p className="font-semibold">{c.companyName}</p>
                <p className="text-sm text-gray-600">{c.contact.address.street}<br />{c.contact.address.zip} {c.contact.address.city}</p>
              </ContactRow>
              <ContactRow icon="phone" accent={accent}>
                <a href={`tel:${c.contact.phoneRaw}`} className="font-semibold hover:underline" style={{ color: accent }}>{c.contact.phone}</a>
                {c.emergency?.enabled && (
                  <p className="text-sm text-gray-500">Notfall: <a href={`tel:${c.emergency.phoneRaw}`} className="font-medium text-[#c41e3a]">{c.emergency.phone}</a></p>
                )}
              </ContactRow>
              {c.contact.email && (
                <ContactRow icon="mail" accent={accent}>
                  <a href={`mailto:${c.contact.email}`} className="font-semibold hover:underline" style={{ color: accent }}>{c.contact.email}</a>
                </ContactRow>
              )}
              {c.contact.openingHours && (
                <ContactRow icon="clock" accent={accent}>
                  <p className="font-semibold">&Ouml;ffnungszeiten</p>
                  {c.contact.openingHours.map((h, i) => (<p key={i} className="text-sm text-gray-600">{h}</p>))}
                </ContactRow>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            {c.contact.mapEmbedUrl ? (
              <iframe src={c.contact.mapEmbedUrl} className="h-full min-h-[350px] w-full border-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Standort ${c.companyName}`} />
            ) : (
              <div className="flex h-full min-h-[350px] items-center justify-center bg-gray-100 text-gray-500">
                <div className="text-center"><p className="text-4xl">&#128205;</p><p className="mt-2 font-medium">{c.contact.address.street}</p><p>{c.contact.address.zip} {c.contact.address.city}</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ icon, accent, children }: { icon: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: accent }}>
        {icon === "pin" && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>}
        {icon === "phone" && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>}
        {icon === "mail" && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
        {icon === "clock" && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────────────── */
function Footer({ company: c }: { company: CustomerSite }) {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="font-semibold">{c.companyName}</p>
            <p className="text-sm text-gray-500">{c.contact.address.street}, {c.contact.address.zip} {c.contact.address.city}</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href={`tel:${c.contact.phoneRaw}`} className="hover:text-gray-900">{c.contact.phone}</a>
            {c.contact.email && <a href={`mailto:${c.contact.email}`} className="hover:text-gray-900">{c.contact.email}</a>}
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-gray-200 pt-6 text-xs text-gray-400 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {c.companyName}. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-4">
            <a href={`/kunden/${c.slug}/impressum`} className="hover:text-gray-600">Impressum</a>
            <a href={`/kunden/${c.slug}/datenschutz`} className="hover:text-gray-600">Datenschutz</a>
            <span className="text-gray-300">&middot;</span>
            <span>Technologie-Partner: <a href="https://flowsight.ch" className="text-gray-500 hover:text-gray-700">flowsight.ch</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ServiceIconSvg({ icon, size = "md" }: { icon?: ServiceIcon; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  switch (icon) {
    // Sanitäre Anlagen — bathtub/shower
    case "bath": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M3.75 12a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25h.386c.51 0 .983.273 1.237.718L6.75 6.75M3.75 12v4.5a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25V12" /></svg>);
    // Reparaturen & Wartung — wrench + screwdriver
    case "wrench": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008z" /></svg>);
    // Heizung
    case "flame": case "heating": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg>);
    // Spenglerei Dach — house/roof
    case "roof": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>);
    // Spenglerei am Haus — building facade
    case "facade": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>);
    // Solar / Leaf
    case "solar": case "leaf": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>);
    // Wasserenthärtung — water droplet
    case "water": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75c0 0-6.75 7.5-6.75 11.25a6.75 6.75 0 0013.5 0C18.75 11.25 12 3.75 12 3.75z" /></svg>);
    // Pipe
    case "pipe": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47m0 0a3.375 3.375 0 01-4.773 0L5 14.5m6.757 2.47a3.375 3.375 0 01-4.773 0" /></svg>);
    // Lüftung / Klima — snowflake
    case "snowflake": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-3 3m3-3l3 3m-3 15l-3-3m3 3l3-3M3 12h18m-18 0l3-3m-3 3l3 3m15-3l-3-3m3 3l-3 3" /></svg>);
    // Wärmepumpe — pump
    case "pump": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811z" /></svg>);
    // Tool (generic)
    case "tool": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1m0 0L15.17 4.42A2.121 2.121 0 0118.17 1.42l2.83 2.83a2.121 2.121 0 01-3 3L10.42 14.17z" /></svg>);
    default: return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1" /></svg>);
  }
}
