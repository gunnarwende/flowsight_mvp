import { notFound } from "next/navigation";
import { getCustomer, getAllCustomerSlugs } from "@/src/lib/customers/registry";
import type { Metadata } from "next";
import type {
  CustomerSite,
  GalleryCategory,
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
  return {
    title: `${c.companyName} — ${c.tagline}`,
    description: c.metaDescription,
    keywords: c.seoKeywords,
  };
}

// ── Page ──────────────────────────────────────────────────────────
export default async function CustomerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCustomer(slug);
  if (!c) notFound();

  return (
    <div className="min-h-screen bg-white text-navy-900">
      {/* ── Notdienst Banner ──────────────────────────── */}
      {c.emergency?.enabled && <EmergencyBanner emergency={c.emergency} />}

      {/* ── Navigation ────────────────────────────────── */}
      <Nav company={c} />

      {/* ── Hero ──────────────────────────────────────── */}
      <HeroSection company={c} />

      {/* ── Dienstleistungen ──────────────────────────── */}
      <ServicesSection services={c.services} companyName={c.companyName} />

      {/* ── Referenzgalerie ───────────────────────────── */}
      <GallerySection gallery={c.gallery} companyName={c.companyName} />

      {/* ── Google Bewertungen ────────────────────────── */}
      {c.reviews && <ReviewsSection reviews={c.reviews} />}

      {/* ── Einzugsgebiet ─────────────────────────────── */}
      <ServiceAreaSection area={c.serviceArea} companyName={c.companyName} />

      {/* ── Team ──────────────────────────────────────── */}
      {c.team.length > 0 && (
        <TeamSection team={c.team} companyName={c.companyName} />
      )}

      {/* ── Firmengeschichte ──────────────────────────── */}
      {c.history && c.history.length > 0 && (
        <HistorySection history={c.history} companyName={c.companyName} />
      )}

      {/* ── Zertifizierungen + Partner ────────────────── */}
      {(c.certifications || c.brandPartners) && (
        <TrustSection
          certifications={c.certifications}
          partners={c.brandPartners}
        />
      )}

      {/* ── Karriere ──────────────────────────────────── */}
      {c.careers && c.careers.length > 0 && (
        <CareersSection careers={c.careers} companyName={c.companyName} />
      )}

      {/* ── Kontakt ───────────────────────────────────── */}
      <ContactSection company={c} />

      {/* ── Footer ────────────────────────────────────── */}
      <Footer company={c} />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/* ── Emergency Banner ──────────────────────────────────────────── */
function EmergencyBanner({
  emergency,
}: {
  emergency: NonNullable<CustomerSite["emergency"]>;
}) {
  return (
    <div className="bg-red-600 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-base">🚨</span>
          <span>{emergency.label}</span>
        </div>
        <a
          href={`tel:${emergency.phoneRaw}`}
          className="rounded-md bg-white/20 px-4 py-1.5 text-sm font-bold transition-colors hover:bg-white/30"
        >
          {emergency.phone}
        </a>
      </div>
    </div>
  );
}

/* ── Navigation ────────────────────────────────────────────────── */
function Nav({ company: c }: { company: CustomerSite }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href={`/kunden/${c.slug}`} className="text-xl font-bold text-navy-900">
          {c.companyName}
        </a>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#leistungen" className="text-sm text-gray-600 transition-colors hover:text-navy-900">
            Leistungen
          </a>
          <a href="#galerie" className="text-sm text-gray-600 transition-colors hover:text-navy-900">
            Referenzen
          </a>
          <a href="#team" className="text-sm text-gray-600 transition-colors hover:text-navy-900">
            Team
          </a>
          <a href="#kontakt" className="text-sm text-gray-600 transition-colors hover:text-navy-900">
            Kontakt
          </a>
          <a
            href={`tel:${c.contact.phoneRaw}`}
            className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-800"
          >
            {c.contact.phone}
          </a>
        </div>
        {/* Mobile CTA */}
        <a
          href={`tel:${c.contact.phoneRaw}`}
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white md:hidden"
        >
          Anrufen
        </a>
      </div>
    </nav>
  );
}

/* ── Hero ───────────────────────────────────────────────────────── */
function HeroSection({ company: c }: { company: CustomerSite }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <div className="mb-4 inline-block rounded-full bg-gold-500/15 px-4 py-1.5 text-sm font-medium text-gold-400">
            Seit {c.history?.[0]?.year ?? "Jahrzehnten"} in {c.contact.address.city}
          </div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {c.companyName}
          </h1>
          <p className="mt-4 text-lg text-navy-200 sm:text-xl">
            {c.tagline}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href={`tel:${c.contact.phoneRaw}`}
              className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-8 py-4 text-base font-semibold text-navy-950 transition-all hover:bg-gold-400"
            >
              Jetzt anrufen: {c.contact.phone}
            </a>
            <a
              href="#kontakt"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Kontakt aufnehmen
            </a>
          </div>
          {c.emergency?.enabled && (
            <p className="mt-6 flex items-center gap-2 text-sm text-navy-300">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
              {c.emergency.label}
            </p>
          )}
        </div>
        {/* Hero image grid */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-3">
            {c.services
              .filter((s) => s.images && s.images.length > 0)
              .slice(0, 4)
              .map((s, i) => (
                <div
                  key={s.slug}
                  className={`overflow-hidden rounded-xl ${i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.images![0]}
                    alt={`${c.companyName} — ${s.name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Services ──────────────────────────────────────────────────── */
function ServicesSection({
  services,
  companyName,
}: {
  services: Service[];
  companyName: string;
}) {
  return (
    <section id="leistungen" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Unsere Leistungen
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Kompetenz aus einer Hand — von {companyName}
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.slug}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-gold-400 hover:shadow-lg hover:shadow-gold-500/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/5 text-navy-900 transition-colors group-hover:bg-gold-500/10 group-hover:text-gold-600">
                <ServiceIconSvg icon={s.icon} />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {s.summary}
              </p>
              {s.images && s.images.length > 0 && (
                <div className="mt-4 flex gap-1.5 overflow-hidden">
                  {s.images.slice(0, 3).map((img, i) => (
                    <div key={i} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                  {s.images.length > 3 && (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-500">
                      +{s.images.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Gallery ───────────────────────────────────────────────────── */
function GallerySection({
  gallery,
  companyName,
}: {
  gallery: GalleryCategory[];
  companyName: string;
}) {
  return (
    <section id="galerie" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Unsere Referenzen
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Einblicke in ausgewählte Projekte von {companyName}
          </p>
        </div>
        {gallery.map((cat) => (
          <div key={cat.slug} className="mt-12">
            <h3 className="mb-6 text-xl font-semibold">{cat.name}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {cat.images.map((img, i) => (
                <div
                  key={i}
                  className="group aspect-square overflow-hidden rounded-xl bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt ?? `${cat.name} Referenz ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Reviews ───────────────────────────────────────────────────── */
function ReviewsSection({
  reviews,
}: {
  reviews: NonNullable<CustomerSite["reviews"]>;
}) {
  return (
    <section className="bg-navy-900 py-20 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`h-7 w-7 ${i < Math.round(reviews.averageRating) ? "text-gold-400" : "text-navy-600"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-2xl font-bold">
            {reviews.averageRating} von 5 Sternen
          </p>
          <p className="mt-1 text-sm text-navy-300">
            Basierend auf {reviews.totalReviews} Google-Bewertungen
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {reviews.highlights.map((r, i) => (
            <div
              key={i}
              className="rounded-2xl border border-navy-700 bg-navy-800/50 p-6"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <svg
                    key={j}
                    className="h-4 w-4 text-gold-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-navy-200">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-navy-400">
                <span className="font-medium">{r.author}</span>
                {r.date && <span>{r.date}</span>}
              </div>
            </div>
          ))}
        </div>
        {reviews.googleUrl && (
          <div className="mt-8 text-center">
            <a
              href={reviews.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gold-400 transition-colors hover:text-gold-300"
            >
              Alle Bewertungen auf Google ansehen →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Service Area ──────────────────────────────────────────────── */
function ServiceAreaSection({
  area,
  companyName,
}: {
  area: CustomerSite["serviceArea"];
  companyName: string;
}) {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Unser Einzugsgebiet
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              {companyName} — {area.region}
            </p>
            {area.radiusDescription && (
              <p className="mt-2 text-sm text-gray-500">
                {area.radiusDescription}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {area.gemeinden.map((g) => (
              <span
                key={g}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-navy-900"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Team ──────────────────────────────────────────────────────── */
function TeamSection({
  team,
  companyName,
}: {
  team: CustomerSite["team"];
  companyName: string;
}) {
  return (
    <section id="team" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Unser Team</h2>
          <p className="mt-3 text-lg text-gray-600">
            Die Menschen hinter {companyName}
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-2">
          {team.map((m) => (
            <div
              key={m.name}
              className="rounded-2xl border border-gray-200 bg-white p-6 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy-900/5 text-2xl font-bold text-navy-900">
                {m.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{m.name}</h3>
              <p className="text-sm font-medium text-gold-600">{m.role}</p>
              {m.bio && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {m.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── History ───────────────────────────────────────────────────── */
function HistorySection({
  history,
  companyName,
}: {
  history: NonNullable<CustomerSite["history"]>;
  companyName: string;
}) {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {new Date().getFullYear() - history[0].year} Jahre Geschichte
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Die Geschichte von {companyName}
          </p>
        </div>
        <div className="relative mx-auto mt-14 max-w-2xl">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 h-full w-px bg-gray-300 sm:left-1/2" />
          {history.map((h, i) => (
            <div
              key={h.year}
              className={`relative mb-10 flex items-start gap-6 ${
                i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
              }`}
            >
              {/* Dot */}
              <div className="absolute left-6 z-10 -ml-2 mt-1 h-4 w-4 rounded-full border-2 border-gold-500 bg-white sm:left-1/2" />
              {/* Content */}
              <div className={`ml-14 sm:ml-0 sm:w-[calc(50%-2rem)] ${i % 2 === 0 ? "sm:pr-8 sm:text-right" : "sm:pl-8"}`}>
                <span className="text-sm font-bold text-gold-600">
                  {h.year}
                </span>
                <h3 className="mt-1 font-semibold">{h.title}</h3>
                {h.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {h.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Trust (Certifications + Partners) ─────────────────────────── */
function TrustSection({
  certifications,
  partners,
}: {
  certifications?: CustomerSite["certifications"];
  partners?: CustomerSite["brandPartners"];
}) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        {certifications && certifications.length > 0 && (
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Zertifizierungen
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-4 text-center"
                >
                  <p className="font-semibold text-navy-900">{cert.name}</p>
                  {cert.issuer && (
                    <p className="text-xs text-gray-500">{cert.issuer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {partners && partners.length > 0 && (
          <div className={`text-center ${certifications ? "mt-16" : ""}`}>
            <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-wider">
              Unsere Partner & Marken
            </h3>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
              {partners.map((p) => (
                <span
                  key={p.name}
                  className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-navy-900"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Careers ───────────────────────────────────────────────────── */
function CareersSection({
  careers,
  companyName,
}: {
  careers: NonNullable<CustomerSite["careers"]>;
  companyName: string;
}) {
  return (
    <section className="bg-navy-900 py-20 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Karriere bei {companyName}
          </h2>
          <p className="mt-3 text-lg text-navy-300">
            Werde Teil unseres Teams
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6">
          {careers.map((job) => (
            <div
              key={job.title}
              className="rounded-2xl border border-navy-700 bg-navy-800/50 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <span className="mt-1 inline-block rounded-full bg-gold-500/15 px-3 py-0.5 text-xs font-medium text-gold-400">
                    {job.type === "fulltime"
                      ? "Vollzeit"
                      : job.type === "apprentice"
                        ? "Lehrstelle"
                        : "Teilzeit"}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-navy-200">{job.description}</p>
              {job.requirements && (
                <ul className="mt-3 space-y-1">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-navy-300">
                      <span className="mt-1 text-gold-400">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contact ───────────────────────────────────────────────────── */
function ContactSection({ company: c }: { company: CustomerSite }) {
  return (
    <section id="kontakt" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Kontakt</h2>
            <p className="mt-3 text-lg text-gray-600">
              Wir freuen uns auf Ihre Anfrage
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900/5 text-navy-900">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">{c.companyName}</p>
                  <p className="text-sm text-gray-600">
                    {c.contact.address.street}
                    <br />
                    {c.contact.address.zip} {c.contact.address.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900/5 text-navy-900">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <a
                    href={`tel:${c.contact.phoneRaw}`}
                    className="font-semibold text-navy-900 hover:text-gold-600"
                  >
                    {c.contact.phone}
                  </a>
                </div>
              </div>
              {c.contact.email && (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900/5 text-navy-900">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <a
                    href={`mailto:${c.contact.email}`}
                    className="font-semibold text-navy-900 hover:text-gold-600"
                  >
                    {c.contact.email}
                  </a>
                </div>
              )}
              {c.contact.openingHours && (
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900/5 text-navy-900">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Öffnungszeiten</p>
                    {c.contact.openingHours.map((h, i) => (
                      <p key={i} className="text-sm text-gray-600">{h}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Map placeholder */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            <div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-gray-500">
              <div>
                <p className="text-4xl">📍</p>
                <p className="mt-2 font-medium">{c.contact.address.street}</p>
                <p>{c.contact.address.zip} {c.contact.address.city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────────── */
function Footer({ company: c }: { company: CustomerSite }) {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="font-semibold text-navy-900">{c.companyName}</p>
            <p className="text-sm text-gray-500">
              {c.contact.address.street}, {c.contact.address.zip}{" "}
              {c.contact.address.city}
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href={`tel:${c.contact.phoneRaw}`} className="hover:text-navy-900">
              {c.contact.phone}
            </a>
            {c.contact.email && (
              <a href={`mailto:${c.contact.email}`} className="hover:text-navy-900">
                {c.contact.email}
              </a>
            )}
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} {c.companyName}. Alle Rechte vorbehalten.
          <span className="mx-2">·</span>
          Website powered by{" "}
          <a href="https://flowsight.ch" className="text-gold-600 hover:text-gold-500">
            FlowSight
          </a>
        </div>
      </div>
    </footer>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ServiceIconSvg({ icon }: { icon?: ServiceIcon }) {
  const cls = "h-6 w-6";
  switch (icon) {
    case "bath":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M3.75 12a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25h.386c.51 0 .983.273 1.237.718L6.75 6.75M3.75 12v4.5a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25V12" />
        </svg>
      );
    case "flame":
    case "heating":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
        </svg>
      );
    case "roof":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case "solar":
    case "leaf":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      );
    case "pipe":
    case "water":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47m0 0a3.375 3.375 0 01-4.773 0L5 14.5m6.757 2.47a3.375 3.375 0 01-4.773 0" />
        </svg>
      );
    case "wrench":
    case "tool":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1m0 0L15.17 4.42A2.121 2.121 0 0118.17 1.42l2.83 2.83a2.121 2.121 0 01-3 3L10.42 14.17z" />
        </svg>
      );
    case "pump":
    case "snowflake":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1" />
        </svg>
      );
  }
}
