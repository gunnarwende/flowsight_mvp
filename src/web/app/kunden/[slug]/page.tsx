import { notFound } from "next/navigation";
import { getCustomer, getAllCustomerSlugs } from "@/src/lib/customers/registry";
import { ImageGallery } from "./ImageGallery";
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

  const accent = c.brandColor ?? "#2b6cb0";
  // Wizard URL — linked throughout the page
  const wizardUrl = `/${c.slug}/meldung`;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Nav company={c} accent={accent} wizardUrl={wizardUrl} />
      <HeroSection company={c} accent={accent} wizardUrl={wizardUrl} />
      <ServicesSection services={c.services} gallery={c.gallery} companyName={c.companyName} accent={accent} />
      {c.reviews && <ReviewsSection reviews={c.reviews} accent={accent} />}
      <ServiceAreaSection area={c.serviceArea} companyName={c.companyName} accent={accent} />
      {c.team.length > 0 && <TeamSection team={c.team} companyName={c.companyName} accent={accent} />}
      {c.history && c.history.length > 0 && <HistorySection history={c.history} companyName={c.companyName} accent={accent} />}
      {(c.certifications || c.brandPartners) && <TrustSection certifications={c.certifications} partners={c.brandPartners} accent={accent} />}
      {c.careers && c.careers.length > 0 && <CareersSection careers={c.careers} companyName={c.companyName} contact={c.contact} accent={accent} />}
      <ContactSection company={c} accent={accent} wizardUrl={wizardUrl} />
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
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href={`/kunden/${c.slug}`} className="text-xl font-bold" style={{ color: accent }}>
          {c.companyName}
        </a>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#leistungen" className="text-sm text-gray-600 transition-colors hover:text-gray-900">Leistungen</a>
          <a href="#team" className="text-sm text-gray-600 transition-colors hover:text-gray-900">Team</a>
          <a href="#kontakt" className="text-sm text-gray-600 transition-colors hover:text-gray-900">Kontakt</a>
          <a href={wizardUrl} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent }}>
            Schaden melden
          </a>
          <a href={`tel:${c.contact.phoneRaw}`} className="rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90" style={{ borderColor: accent, color: accent }}>
            {c.contact.phone}
          </a>
          {c.emergency?.enabled && (
            <a href={`tel:${c.emergency.phoneRaw}`} className="rounded-lg bg-[#c41e3a] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
              {c.emergency.label}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <a href={wizardUrl} className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Melden</a>
          {c.emergency?.enabled && (
            <a href={`tel:${c.emergency.phoneRaw}`} className="rounded-lg bg-[#c41e3a] px-4 py-2 text-sm font-bold text-white">Notfall</a>
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

  return (
    <section className="relative overflow-hidden bg-gray-900 text-white">
      <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, ${accent} 0%, transparent 60%)` }} />
      <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          {foundedYear && (
            <div className="mb-6 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
              Seit {foundedYear} in {c.contact.address.city}
            </div>
          )}
          <h1 className="text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">{c.companyName}</h1>
          <p className="mt-5 text-xl text-gray-300 sm:text-2xl">{c.tagline}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href={wizardUrl} className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent }}>
              Schaden online melden
            </a>
            <a href={`tel:${c.contact.phoneRaw}`} className="inline-flex items-center justify-center rounded-xl border border-white/20 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10">
              Anrufen: {c.contact.phone}
            </a>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
          {yearsActive && (
            <div><p className="text-3xl font-bold text-white">{yearsActive}+</p><p className="mt-1 text-sm text-gray-400">Jahre Erfahrung</p></div>
          )}
          <div><p className="text-3xl font-bold text-white">{c.services.length}</p><p className="mt-1 text-sm text-gray-400">Fachbereiche</p></div>
          <div><p className="text-3xl font-bold text-white">{c.serviceArea.gemeinden.length}+</p><p className="mt-1 text-sm text-gray-400">Gemeinden</p></div>
          <div><p className="text-3xl font-bold text-white">3. Gen.</p><p className="mt-1 text-sm text-gray-400">Familienbetrieb</p></div>
        </div>
      </div>
    </section>
  );
}

/* ── Services + Integrated Gallery ─────────────────────────────────
   Click service → expand with description + scrollable gallery.
   Gallery merged here — no separate Referenzen section.            */
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
  // Merge gallery images into services by slug
  const galleryMap = new Map(gallery.map((g) => [g.slug, g.images]));

  return (
    <section id="leistungen" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Unsere Leistungen</h2>
          <p className="mt-3 text-lg text-gray-600">Kompetenz aus einer Hand — von {companyName}</p>
        </div>
        <div className="mt-14 space-y-4">
          {services.map((s) => {
            const imgs = galleryMap.get(s.slug) ?? [];
            return (
              <details key={s.slug} className="group rounded-2xl border border-gray-200 bg-white">
                <summary className="flex cursor-pointer items-center gap-4 p-6 [&::-webkit-details-marker]:hidden">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: accent }}>
                    <ServiceIconSvg icon={s.icon} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{s.name}</h3>
                    <p className="mt-0.5 text-sm text-gray-600">{s.summary}</p>
                  </div>
                  {imgs.length > 0 && (
                    <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                      {imgs.slice(0, 2).map((img, i) => (
                        <div key={i} className="h-10 w-10 overflow-hidden rounded-lg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.src} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                      {imgs.length > 2 && (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-500">
                          +{imgs.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  <svg className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                  {s.description && (
                    <p className="mb-5 max-w-3xl leading-relaxed text-gray-600">{s.description}</p>
                  )}
                  {imgs.length > 0 && (
                    <div>
                      <p className="mb-3 text-sm font-medium text-gray-500">Referenzbilder — klicken zum Vergrössern</p>
                      <ImageGallery images={imgs} height={180} />
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Reviews ───────────────────────────────────────────────────────
   Real data: star rating + review quotes.                          */
function ReviewsSection({
  reviews,
  accent,
}: {
  reviews: NonNullable<CustomerSite["reviews"]>;
  accent: string;
}) {
  return (
    <section className="bg-gray-900 py-20 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className={`h-7 w-7 ${i < Math.round(reviews.averageRating) ? "text-amber-400" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-2xl font-bold">{reviews.averageRating} von 5 Sternen</p>
          <p className="mt-1 text-sm text-gray-400">Basierend auf {reviews.totalReviews} Google-Bewertungen</p>
        </div>

        {reviews.highlights.length > 0 && (
          <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-6 sm:flex-row sm:justify-center">
            {reviews.highlights.map((r, i) => (
              <div key={i} className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-gray-200">&ldquo;{r.text}&rdquo;</p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span className="font-medium">{r.author}</span>
                  {r.date && <span>{r.date}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {reviews.googleUrl && (
          <div className="mt-8 text-center">
            <a href={reviews.googleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
              Alle Bewertungen auf Google ansehen →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Service Area ──────────────────────────────────────────────────── */
function ServiceAreaSection({ area, companyName, accent }: { area: CustomerSite["serviceArea"]; companyName: string; accent: string }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="overflow-hidden rounded-2xl bg-gray-900 text-white">
          <div className="grid lg:grid-cols-2">
            <div className="p-10 lg:p-14">
              <h2 className="text-3xl font-bold sm:text-4xl">Ihr lokaler Partner</h2>
              <p className="mt-2 text-lg text-gray-300">{companyName} — {area.region}</p>
              {area.radiusDescription && <p className="mt-4 leading-relaxed text-gray-300">{area.radiusDescription}</p>}
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">Wir sind vor Ort in</p>
                <p className="leading-relaxed text-gray-300">{area.gemeinden.join(" · ")}</p>
              </div>
            </div>
            <div className="flex items-center justify-center bg-gray-800/50 p-10">
              <div className="text-center">
                <p className="text-6xl">📍</p>
                <p className="mt-4 text-lg font-semibold">{area.region}</p>
                <p className="mt-1 text-sm text-gray-400">{area.gemeinden.length} Gemeinden</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Team ────────────────────────────────────────────────────────── */
function TeamSection({ team, companyName, accent }: { team: CustomerSite["team"]; companyName: string; accent: string }) {
  return (
    <section id="team" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Unser Team</h2>
          <p className="mt-3 text-lg text-gray-600">Die Menschen hinter {companyName}</p>
        </div>
        <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-3">
          {team.map((m) => (
            <div key={m.name} className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
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
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Qualität, der Sie vertrauen können</h2>
          <p className="mt-3 text-lg text-gray-600">Zertifiziert und im Verbund mit führenden Marken</p>
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
    <section className="bg-gray-900 py-20 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Karriere bei {companyName}</h2>
          <p className="mt-3 text-lg text-gray-400">Werde Teil unseres Teams</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6">
          {careers.map((job) => (
            <details key={job.title} className="group rounded-2xl border border-gray-700 bg-gray-800/50">
              <summary className="flex cursor-pointer items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <span className="mt-1 inline-block rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium text-white/70">
                    {job.type === "fulltime" ? "Vollzeit" : job.type === "apprentice" ? "Lehrstelle" : "Teilzeit"}
                  </span>
                </div>
                <svg className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="border-t border-gray-700 px-6 pb-6 pt-4">
                <p className="text-sm leading-relaxed text-gray-300">{job.description}</p>
                {job.requirements && (
                  <>
                    <p className="mb-2 mt-4 text-sm font-semibold text-gray-200">Anforderungen:</p>
                    <ul className="space-y-1.5">
                      {job.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><span style={{ color: accent }}>•</span>{r}</li>
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
                  <a href={`tel:${contact.phoneRaw}`} className="inline-flex items-center justify-center rounded-lg border border-gray-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700">
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
        <div className="mb-12 rounded-2xl p-8 text-center text-white" style={{ backgroundColor: accent }}>
          <h2 className="text-2xl font-bold sm:text-3xl">Schaden melden — schnell und unkompliziert</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Nutzen Sie unseren digitalen Assistenten, um Ihren Schaden direkt zu erfassen. Wir melden uns umgehend bei Ihnen.
          </p>
          <a href={wizardUrl} className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold transition-opacity hover:opacity-90" style={{ color: accent }}>
            Jetzt Schaden melden →
          </a>
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
              </ContactRow>
              {c.contact.email && (
                <ContactRow icon="mail" accent={accent}>
                  <a href={`mailto:${c.contact.email}`} className="font-semibold hover:underline" style={{ color: accent }}>{c.contact.email}</a>
                </ContactRow>
              )}
              {c.contact.openingHours && (
                <ContactRow icon="clock" accent={accent}>
                  <p className="font-semibold">Öffnungszeiten</p>
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
                <div className="text-center"><p className="text-4xl">📍</p><p className="mt-2 font-medium">{c.contact.address.street}</p><p>{c.contact.address.zip} {c.contact.address.city}</p></div>
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
            <span className="text-gray-300">·</span>
            <span>Website powered by <a href="https://flowsight.ch" className="text-gray-500 hover:text-gray-700">FlowSight</a></span>
          </div>
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
    case "bath": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M3.75 12a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25h.386c.51 0 .983.273 1.237.718L6.75 6.75M3.75 12v4.5a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25V12" /></svg>);
    case "flame": case "heating": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg>);
    case "roof": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>);
    case "solar": case "leaf": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>);
    case "pipe": case "water": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47m0 0a3.375 3.375 0 01-4.773 0L5 14.5m6.757 2.47a3.375 3.375 0 01-4.773 0" /></svg>);
    case "wrench": case "tool": return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1m0 0L15.17 4.42A2.121 2.121 0 0118.17 1.42l2.83 2.83a2.121 2.121 0 01-3 3L10.42 14.17z" /></svg>);
    default: return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1" /></svg>);
  }
}
