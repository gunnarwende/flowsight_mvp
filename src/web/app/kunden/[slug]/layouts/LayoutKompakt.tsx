/**
 * LayoutKompakt — System B: VERTRAUEN / NÄHE
 *
 * App-like, mobile-first, review-driven, compact.
 * Everything important above-the-fold. Minimal scroll needed.
 *
 * Used for: Kleine Betriebe (1-5 MA), starke Reviews, lokal verankert
 * Example: Walter Leuthold (Solo, 4.9★, 44 Reviews)
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
    facade: "M3 21V3h18v18M9 7h6M9 11h6M9 15h6",
    tool: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
    water: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
    pipe: "M4 14h6m-6 4h6m4-8v12m0-12l4-4m-4 4l-4-4",
  };
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d={d[icon ?? "tool"] ?? d.tool} />
    </svg>
  );
}

export function LayoutKompakt({ company: c }: { company: CustomerSite }) {
  const accent = c.brandColor ?? "#203784";
  const wizardUrl = `/kunden/${c.slug}/meldung`;
  const heroImg = `/kunden/${c.slug}/hero.jpg`;
  const galleryMap = new Map((c.gallery ?? []).map((g) => [g.slug, g.images]));

  return (
    <div className="min-h-screen cs-font-dm-sans" data-color-mode="warm" style={{ backgroundColor: "var(--cs-surface, #faf8f5)" }}>

      {/* ── Nav: Ultra-minimal ─────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm border-b" style={{ backgroundColor: "var(--cs-surface, #faf8f5)", borderColor: "var(--cs-border)" }}>
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <span className="text-base font-bold text-gray-900">{c.companyName}</span>
          <a href={`tel:${c.contact.phoneRaw}`} className="rounded-full px-4 py-1.5 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>
            Anrufen
          </a>
        </div>
      </nav>

      {/* ── Hero: Review-first, Bild + Overlay ──────────────── */}
      <section className="relative overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImg} alt={c.companyName} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gray-900/85" />
        <div className="relative mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
          {/* Review badge — THE dominant element */}
          {c.reviews && c.reviews.averageRating >= 4.0 && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`h-8 w-8 ${i < Math.round(c.reviews!.averageRating) ? "text-amber-400" : "text-white/30"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mt-2 text-3xl font-bold">{c.reviews.averageRating}</p>
              <p className="text-sm text-white/70">aus {c.reviews.totalReviews} Bewertungen</p>
            </div>
          )}

          <h1 className="text-2xl font-bold leading-tight sm:text-4xl">{c.companyName}</h1>
          <p className="mt-2 text-base text-white/70">{c.contact.address.city} · {c.serviceArea.region}</p>

          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            <a href={`tel:${c.contact.phoneRaw}`} className="flex items-center justify-center gap-2 rounded-full py-3.5 text-base font-semibold text-white" style={{ backgroundColor: accent }}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              Jetzt anrufen
            </a>
            <a href={wizardUrl} className="flex items-center justify-center rounded-full border border-white/30 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
              Online melden
            </a>
          </div>
        </div>
      </section>

      {/* ── Reviews: 3 grosse lesbare Karten ────────────────── */}
      {c.reviews && c.reviews.highlights.length > 0 && (
        <AnimatedSection animation="slide">
          <section className="mx-auto max-w-lg px-4 py-12">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Was Kunden sagen</h2>
            <div className="space-y-4">
              {c.reviews.highlights.slice(0, 3).map((r, i) => (
                <div key={i} className="rounded-2xl border p-5" style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-card)" }}>
                  <div className="flex gap-0.5 mb-2">
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
          </section>
        </AnimatedSection>
      )}

      {/* ── Einzugsgebiet ──────────────────────────────────── */}
      <AnimatedSection animation="slide">
        <section className="mx-auto max-w-lg px-4 py-12">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Einsatzgebiet</h2>
          <p className="text-sm text-gray-500 mb-4">{c.serviceArea.region}</p>
          <div className="flex flex-wrap gap-2">
            {c.serviceArea.gemeinden.map((g) => (
              <span key={g} className="rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: `${accent}10`, color: accent }}>
                {g}
              </span>
            ))}
          </div>
          {c.contact.mapEmbedUrl && (
            <div className="mt-6 overflow-hidden rounded-2xl">
              <iframe src={c.contact.mapEmbedUrl} className="h-48 w-full border-0" loading="lazy" title="Standort" />
            </div>
          )}
        </section>
      </AnimatedSection>

      {/* ── Services: Kompakte Chips ────────────────────────── */}
      <AnimatedSection animation="slide">
        <section id="leistungen" className="mx-auto max-w-lg px-4 py-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Leistungen</h2>
          <div className="space-y-3">
            {c.services.map((s) => {
              const imgs = galleryMap.get(s.slug) ?? [];
              return (
                <ServiceCard
                  key={s.slug}
                  name={s.name}
                  summary={s.summary}
                  description={s.description}
                  bullets={s.bullets}
                  icon={<SvcIcon icon={s.icon} />}
                  images={imgs}
                  accent={accent}
                />
              );
            })}
          </div>
        </section>
      </AnimatedSection>

      {/* ── Kontakt ────────────────────────────────────────── */}
      <AnimatedSection animation="slide">
        <section id="kontakt" className="mx-auto max-w-lg px-4 py-12">
          <div className="rounded-2xl p-6 text-center text-white" style={{ backgroundColor: accent }}>
            <h2 className="text-xl font-bold">Kontakt</h2>
            <p className="mt-2 text-white/80">{c.contact.address.street}, {c.contact.address.zip} {c.contact.address.city}</p>
            <a href={`tel:${c.contact.phoneRaw}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-bold transition-opacity hover:opacity-90" style={{ color: accent }}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              {c.contact.phone}
            </a>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t py-6" style={{ borderColor: "var(--cs-border)" }}>
        <div className="mx-auto flex max-w-lg flex-col items-center gap-2 px-4 text-xs text-gray-400 sm:flex-row sm:justify-between">
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
