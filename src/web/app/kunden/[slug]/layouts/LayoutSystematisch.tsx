/**
 * LayoutSystematisch — System C: PRÄZISION / KOMPETENZ
 *
 * Structured, grid-based, partner-driven, technical excellence.
 * Like an engineering firm's website. Information > emotion.
 *
 * Used for: Grössere Betriebe (5+ MA), breites Spektrum, viele Partner/Zertifikate
 * Example: Orlandini (17 Markenpartner, 5 Fachbereiche)
 */

import { ServiceCard } from "../ServiceCard";
import { AnimatedSection } from "../AnimatedSection";
import { StickyMobileCTA } from "../StickyMobileCTA";
import type { CustomerSite, ServiceIcon } from "@/src/lib/customers/types";

function SvcIcon({ icon }: { icon?: ServiceIcon }) {
  const d: Record<string, string> = {
    bath: "M7 21h10a2 2 0 002-2v-3H5v3a2 2 0 002 2zm-2-8h14M5 7a4 4 0 014-4h.01M5 7v4h14V7",
    flame: "M12 2c1 4-2 6-2 9a4 4 0 008 0c0-3-3-5-2-9M12 18a2 2 0 01-2-2c0-1 2-3 2-3s2 2 2 3a2 2 0 01-2 2z",
    heating: "M12 3v18m-6-6l6 6 6-6M6 9a6 6 0 0112 0",
    roof: "M3 21h18M5 21V11l7-7 7 7v10",
    tool: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
    water: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
    pipe: "M4 14h6m-6 4h6m4-8v12m0-12l4-4m-4 4l-4-4",
    snowflake: "M12 2v20m-7-3l7-7 7 7m-14-8l7-7 7 7",
    pump: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  };
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d={d[icon ?? "tool"] ?? d.tool} />
    </svg>
  );
}

export function LayoutSystematisch({ company: c }: { company: CustomerSite }) {
  const accent = c.brandColor ?? "#1a5276";
  const wizardUrl = `/kunden/${c.slug}/meldung`;
  const heroImg = `/kunden/${c.slug}/hero.jpg`;
  const foundedYear = c.history?.[0]?.year;
  const yearsActive = foundedYear ? new Date().getFullYear() - foundedYear : null;
  const galleryMap = new Map((c.gallery ?? []).map((g) => [g.slug, g.images]));

  // Key facts for hero cards
  const keyFacts: { value: string; label: string }[] = [];
  if (c.services.length > 0) keyFacts.push({ value: String(c.services.length), label: "Fachbereiche" });
  if (c.brandPartners && c.brandPartners.length > 0) keyFacts.push({ value: String(c.brandPartners.length), label: "Partner" });
  if (yearsActive && yearsActive >= 5) keyFacts.push({ value: `${yearsActive}+`, label: "Jahre" });
  if (c.emergency?.enabled) keyFacts.push({ value: "24h", label: "Notdienst" });

  return (
    <div className="min-h-screen cs-font-inter" data-color-mode="cool" style={{ backgroundColor: "var(--cs-surface, #ffffff)" }}>

      {/* ── Nav: Full with links ────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="h-0.5" style={{ backgroundColor: accent }} />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="text-lg font-bold" style={{ color: accent }}>{c.companyName}</span>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#leistungen" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Leistungen</a>
            {c.brandPartners && c.brandPartners.length > 0 && (
              <a href="#partner" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Partner</a>
            )}
            {c.reviews && <a href="#bewertungen" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Bewertungen</a>}
            <a href="#kontakt" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Kontakt</a>
            <a href={`tel:${c.contact.phoneRaw}`} className="text-sm font-semibold text-gray-700">{c.contact.phone}</a>
            <a href={wizardUrl} className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: accent }}>
              Anliegen melden
            </a>
          </div>
          <a href={`tel:${c.contact.phoneRaw}`} className="rounded-lg px-4 py-2 text-sm font-bold text-white md:hidden" style={{ backgroundColor: accent }}>
            {c.contact.phone}
          </a>
        </div>
      </nav>

      {/* ── Hero: Vollbild + Key-Fact-Karten ────────────────── */}
      <section className="relative overflow-hidden text-white" style={{ minHeight: "70vh" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImg} alt={c.companyName} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}ee 0%, ${accent}cc 40%, ${accent}88 100%)` }} />
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center px-6 py-20">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{c.companyName}</h1>
            <p className="mt-4 text-lg text-white/80">{c.tagline}</p>
            <div className="mt-8 flex gap-4">
              <a href={wizardUrl} className="rounded-lg px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                Anliegen melden
              </a>
              <a href={`tel:${c.contact.phoneRaw}`} className="rounded-lg border border-white/30 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10">
                Anrufen
              </a>
            </div>
          </div>
          {/* Key Fact Cards — right side on desktop, below on mobile */}
          {keyFacts.length > 0 && (
            <div className="absolute bottom-8 right-6 hidden gap-3 lg:flex">
              {keyFacts.map((f) => (
                <div key={f.label} className="rounded-xl bg-white/10 px-5 py-4 text-center backdrop-blur-sm border border-white/10">
                  <p className="text-2xl font-bold">{f.value}</p>
                  <p className="text-xs text-white/70">{f.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Mobile key facts */}
        {keyFacts.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-6 lg:hidden">
            {keyFacts.map((f) => (
              <div key={f.label} className="flex-shrink-0 rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur-sm border border-white/10">
                <p className="text-lg font-bold">{f.value}</p>
                <p className="text-[10px] text-white/70">{f.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Services: 3-Col Grid mit Hover ──────────────────── */}
      <AnimatedSection animation="scale">
        <section id="leistungen" className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Unsere Fachbereiche</h2>
              <p className="mt-2 text-gray-500">Kompetenz aus einer Hand</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {c.services.map((s) => {
                const imgs = galleryMap.get(s.slug) ?? [];
                return (
                  <ServiceCard key={s.slug} name={s.name} summary={s.summary} description={s.description} bullets={s.bullets} icon={<SvcIcon icon={s.icon} />} images={imgs} accent={accent} />
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Partner-Leiste (prominent!) ──────────────────────── */}
      {c.brandPartners && c.brandPartners.length > 0 && (
        <AnimatedSection animation="scale">
          <section id="partner" className="border-y py-12" style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-section-alt)" }}>
            <div className="mx-auto max-w-6xl px-6">
              <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-gray-400">Unsere Partner & Marken</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {c.brandPartners.map((p) => (
                  <a key={p.name} href={p.url ?? "#"} target={p.url ? "_blank" : undefined} rel={p.url ? "noopener noreferrer" : undefined} className="rounded-lg border px-5 py-3 text-sm font-semibold text-gray-700 transition-all hover:shadow-md hover:border-gray-300" style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-card)" }}>
                    {p.name}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Zertifikate ────────────────────────────────────── */}
      {c.certifications && c.certifications.length > 0 && (
        <AnimatedSection animation="scale">
          <section className="py-12">
            <div className="mx-auto max-w-6xl px-6">
              <div className="flex flex-wrap justify-center gap-6">
                {c.certifications.map((cert) => (
                  <div key={cert.name} className="flex items-center gap-3 rounded-lg border px-5 py-3" style={{ borderColor: "var(--cs-border)" }}>
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={accent}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{cert.name}</p>
                      {cert.issuer && <p className="text-xs text-gray-400">{cert.issuer}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Karriere ───────────────────────────────────────── */}
      {c.careers && c.careers.length > 0 && (
        <AnimatedSection animation="scale">
          <section className="py-12" style={{ backgroundColor: "var(--cs-section-alt)" }}>
            <div className="mx-auto max-w-4xl px-6">
              <h2 className="text-center text-2xl font-bold text-gray-900">Karriere bei {c.companyName}</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {c.careers.map((job) => (
                  <div key={job.title} className="rounded-xl border p-5" style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-card)" }}>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {job.type === "fulltime" ? "Vollzeit" : job.type === "apprentice" ? "Lehrstelle" : "Teilzeit"}
                    </span>
                    <p className="mt-2 text-sm text-gray-500">{job.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Reviews ────────────────────────────────────────── */}
      {c.reviews && c.reviews.highlights.length > 0 && (
        <AnimatedSection animation="scale">
          <section id="bewertungen" className="py-16">
            <div className="mx-auto max-w-6xl px-6">
              <div className="text-center">
                {c.reviews.averageRating >= 4.0 && (
                  <>
                    <div className="mb-2 flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`h-6 w-6 ${i < Math.round(c.reviews!.averageRating) ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xl font-bold text-gray-900">{c.reviews.averageRating} von 5</p>
                    <p className="text-sm text-gray-500">{c.reviews.totalReviews} Bewertungen</p>
                  </>
                )}
              </div>
              <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {c.reviews.highlights.map((r, i) => (
                  <div key={i} className="rounded-xl border p-5" style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-card)" }}>
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">&ldquo;{r.text}&rdquo;</p>
                    <p className="mt-3 text-xs font-medium text-gray-500">{r.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Einzugsgebiet ──────────────────────────────────── */}
      <AnimatedSection animation="scale">
        <section className="py-12" style={{ backgroundColor: "var(--cs-section-alt)" }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Einzugsgebiet</h2>
                <p className="mt-2 text-gray-500">{c.serviceArea.region}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.serviceArea.gemeinden.map((g) => (
                    <span key={g} className="rounded-full border px-3 py-1 text-sm text-gray-600" style={{ borderColor: "var(--cs-border)" }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              {c.contact.mapEmbedUrl && (
                <div className="overflow-hidden rounded-xl">
                  <iframe src={c.contact.mapEmbedUrl} className="h-56 w-full border-0" loading="lazy" title="Standort" />
                </div>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Kontakt ────────────────────────────────────────── */}
      <AnimatedSection animation="scale">
        <section id="kontakt" className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Kontakt</h2>
                <div className="mt-6 space-y-3">
                  <p className="font-semibold text-gray-900">{c.companyName}</p>
                  <p className="text-gray-600">{c.contact.address.street}, {c.contact.address.zip} {c.contact.address.city}</p>
                  <p><a href={`tel:${c.contact.phoneRaw}`} className="font-medium hover:underline" style={{ color: accent }}>{c.contact.phone}</a></p>
                  {c.contact.email && <p><a href={`mailto:${c.contact.email}`} className="hover:underline" style={{ color: accent }}>{c.contact.email}</a></p>}
                  {c.contact.openingHours && c.contact.openingHours.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Öffnungszeiten</p>
                      {c.contact.openingHours.map((h, i) => <p key={i} className="text-sm text-gray-600">{h}</p>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start justify-center gap-4">
                <a href={wizardUrl} className="w-full rounded-lg py-4 text-center text-base font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto sm:px-8" style={{ backgroundColor: accent }}>
                  Anliegen melden
                </a>
                <a href={`tel:${c.contact.phoneRaw}`} className="w-full rounded-lg border py-4 text-center text-base font-semibold transition-colors hover:bg-gray-50 sm:w-auto sm:px-8" style={{ borderColor: accent, color: accent }}>
                  {c.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t py-8" style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-section-alt)" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-xs text-gray-400 sm:flex-row sm:justify-between">
          <span>&copy; {new Date().getFullYear()} {c.companyName}</span>
          <div className="flex gap-4">
            <a href={`/kunden/${c.slug}/impressum`} className="hover:text-gray-600">Impressum</a>
            <a href={`/kunden/${c.slug}/datenschutz`} className="hover:text-gray-600">Datenschutz</a>
          </div>
        </div>
      </footer>

      <StickyMobileCTA phone={c.contact.phoneRaw} wizardUrl={wizardUrl} accent={accent} />
    </div>
  );
}
