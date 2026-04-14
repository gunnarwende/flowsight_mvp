/**
 * LayoutSystematisch — System C: PRÄZISION
 *
 * HANDSCHRIFT: Scharf, eckig (rounded-md), keine Schatten, scharfe Borders,
 * Inter Font, Navy-Akzente, strukturiert, Grid-basiert.
 * KEINE shared ServiceCard. Eigene Service-Grid-Karten.
 * KEINE generischen Phrasen.
 */

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
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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

  const facts: { value: string; label: string }[] = [];
  if (c.services.length > 0) facts.push({ value: String(c.services.length), label: "Fachbereiche" });
  if (c.brandPartners && c.brandPartners.length > 0) facts.push({ value: String(c.brandPartners.length), label: "Partner" });
  if (yearsActive && yearsActive >= 5) facts.push({ value: `${yearsActive}+`, label: "Jahre" });
  if (c.emergency?.enabled) facts.push({ value: "24h", label: "Notdienst" });

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="h-[3px]" style={{ backgroundColor: accent }} />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="text-base font-bold" style={{ color: accent }}>{c.companyName}</span>
          <div className="hidden items-center gap-5 md:flex">
            <a href="#fachbereiche" className="text-xs font-medium text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-colors">Fachbereiche</a>
            {c.brandPartners && c.brandPartners.length > 0 && (
              <a href="#partner" className="text-xs font-medium text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-colors">Partner</a>
            )}
            <a href="#kontakt" className="text-xs font-medium text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-colors">Kontakt</a>
            <a href={`tel:${c.contact.phoneRaw}`} className="text-sm font-semibold text-gray-700">{c.contact.phone}</a>
            <a href={wizardUrl} className="rounded-md px-4 py-2 text-xs font-bold text-white uppercase tracking-wider" style={{ backgroundColor: accent }}>
              Anliegen melden
            </a>
          </div>
          <a href={`tel:${c.contact.phoneRaw}`} className="rounded-md px-3 py-1.5 text-xs font-bold text-white md:hidden" style={{ backgroundColor: accent }}>
            {c.contact.phone}
          </a>
        </div>
      </nav>

      {/* ── Hero: Dunkel + Fakten-Karten ─────────────────── */}
      <section className="relative overflow-hidden text-white" style={{ minHeight: "65vh" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImg} alt={c.companyName} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${accent}ee 0%, ${accent}bb 50%, ${accent}77 100%)` }} />
        <div className="relative mx-auto flex min-h-[65vh] max-w-6xl items-end px-6 pb-12 pt-20 sm:items-center sm:pb-20">
          <div className="max-w-lg">
            <h1 className="text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl">{c.companyName}</h1>
            <p className="mt-3 text-sm text-white/70 leading-relaxed sm:text-base">{c.tagline}</p>
            <div className="mt-6 flex gap-3">
              <a href={wizardUrl} className="rounded-md bg-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm border border-white/20 transition-colors hover:bg-white/25">
                Anliegen melden
              </a>
              <a href={`tel:${c.contact.phoneRaw}`} className="rounded-md border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10">
                Anrufen
              </a>
            </div>
          </div>
        </div>
        {/* Fact-Cards am unteren Rand */}
        {facts.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-auto flex max-w-6xl gap-px px-6">
              {facts.map((f) => (
                <div key={f.label} className="flex-1 bg-white/10 px-4 py-4 text-center backdrop-blur-sm first:rounded-tl-md last:rounded-tr-md border-t border-white/10">
                  <p className="text-xl font-bold sm:text-2xl">{f.value}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Fachbereiche: Eigene Grid-Karten, KEIN ServiceCard ── */}
      <AnimatedSection animation="scale">
        <section id="fachbereiche" className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Fachbereiche</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {c.services.map((s) => (
                <div key={s.slug} className="group border border-gray-200 rounded-md p-5 transition-all hover:border-gray-400 hover:shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md text-white" style={{ backgroundColor: accent }}>
                      <SvcIcon icon={s.icon} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{s.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Partner ──────────────────────────────────────── */}
      {c.brandPartners && c.brandPartners.length > 0 && (
        <AnimatedSection animation="scale">
          <section id="partner" className="border-y border-gray-200 py-10" style={{ backgroundColor: "#f8fafb" }}>
            <div className="mx-auto max-w-6xl px-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center mb-6">Partner & Marken</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {c.brandPartners.map((p) => (
                  <span key={p.name} className="rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Zertifikate ──────────────────────────────────── */}
      {c.certifications && c.certifications.length > 0 && (
        <AnimatedSection animation="scale">
          <section className="py-10">
            <div className="mx-auto max-w-6xl px-6 flex flex-wrap justify-center gap-4">
              {c.certifications.map((cert) => (
                <div key={cert.name} className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={accent}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">{cert.name}</span>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Karriere ─────────────────────────────────────── */}
      {c.careers && c.careers.length > 0 && (
        <AnimatedSection animation="scale">
          <section className="border-t border-gray-200 py-12" style={{ backgroundColor: "#f8fafb" }}>
            <div className="mx-auto max-w-4xl px-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Karriere</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {c.careers.map((job) => (
                  <div key={job.title} className="rounded-md border border-gray-200 bg-white p-4">
                    <p className="text-sm font-bold text-gray-900">{job.title}</p>
                    <span className="mt-1 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 uppercase">
                      {job.type === "fulltime" ? "Vollzeit" : job.type === "apprentice" ? "Lehrstelle" : "Teilzeit"}
                    </span>
                    <p className="mt-2 text-xs text-gray-500">{job.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Bewertungen ──────────────────────────────────── */}
      {c.reviews && c.reviews.highlights.length > 0 && (
        <AnimatedSection animation="scale">
          <section id="bewertungen" className="py-14">
            <div className="mx-auto max-w-6xl px-6">
              {c.reviews.averageRating >= 4.0 && (
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`h-5 w-5 ${i < Math.round(c.reviews!.averageRating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="mt-1 text-sm font-bold text-gray-900">{c.reviews.averageRating} / 5 · {c.reviews.totalReviews} Bewertungen</p>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {c.reviews.highlights.map((r, i) => (
                  <div key={i} className="rounded-md border border-gray-200 p-4">
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <svg key={j} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                    <p className="mt-2 text-[10px] font-medium text-gray-400">{r.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Einzugsgebiet ────────────────────────────────── */}
      <AnimatedSection animation="scale">
        <section className="border-t border-gray-200 py-12" style={{ backgroundColor: "#f8fafb" }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Einzugsgebiet</p>
                <p className="text-sm text-gray-600">{c.serviceArea.region}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.serviceArea.gemeinden.map((g) => (
                    <span key={g} className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-500">{g}</span>
                  ))}
                </div>
              </div>
              {c.contact.mapEmbedUrl && (
                <div className="overflow-hidden rounded-md border border-gray-200">
                  <iframe src={c.contact.mapEmbedUrl} className="h-48 w-full border-0" loading="lazy" title="Standort" />
                </div>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Kontakt ──────────────────────────────────────── */}
      <AnimatedSection animation="scale">
        <section id="kontakt" className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Kontakt</p>
                <p className="text-sm font-bold text-gray-900">{c.companyName}</p>
                <p className="mt-1 text-sm text-gray-500">{c.contact.address.street}, {c.contact.address.zip} {c.contact.address.city}</p>
                <p className="mt-2"><a href={`tel:${c.contact.phoneRaw}`} className="text-sm font-medium hover:underline" style={{ color: accent }}>{c.contact.phone}</a></p>
                {c.contact.email && <p className="mt-1"><a href={`mailto:${c.contact.email}`} className="text-sm text-gray-500 hover:underline">{c.contact.email}</a></p>}
              </div>
              <div className="flex flex-col gap-3 justify-center">
                <a href={wizardUrl} className="rounded-md py-3 text-center text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: accent }}>
                  Anliegen melden
                </a>
                <a href={`tel:${c.contact.phoneRaw}`} className="rounded-md border py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ borderColor: accent, color: accent }}>
                  Anrufen: {c.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-gray-200 py-6" style={{ backgroundColor: "#f8fafb" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-[10px] text-gray-400 uppercase tracking-wider sm:flex-row sm:justify-between">
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
