/**
 * LayoutKompakt — System B: VERTRAUEN
 *
 * HANDSCHRIFT: Rund, kompakt, weiche Schatten, DM Sans, App-artig.
 * KEINE shared ServiceCard. Services als Aufzählung.
 * KEINE generischen Phrasen.
 */

import { AnimatedSection } from "../AnimatedSection";
import { StickyMobileCTA } from "../StickyMobileCTA";
import type { CustomerSite } from "@/src/lib/customers/types";

export function LayoutKompakt({ company: c }: { company: CustomerSite }) {
  const accent = c.brandColor ?? "#203784";
  const wizardUrl = `/kunden/${c.slug}/meldung`;
  const heroImg = `/kunden/${c.slug}/hero.jpg`;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <span className="text-base font-bold text-gray-900">{c.companyName}</span>
          <a href={`tel:${c.contact.phoneRaw}`} className="rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-md" style={{ backgroundColor: accent }}>
            Anrufen
          </a>
        </div>
      </nav>

      {/* ── Hero: Review-first ───────────────────────────── */}
      <section className="relative overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImg} alt={c.companyName} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gray-900/85" />
        <div className="relative mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center px-5 py-14 text-center">
          {c.reviews && c.reviews.averageRating >= 4.0 && (
            <div className="mb-5">
              <div className="flex items-center justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`h-7 w-7 ${i < Math.round(c.reviews!.averageRating) ? "text-amber-400" : "text-white/20"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mt-1 text-2xl font-bold">{c.reviews.averageRating}</p>
              <p className="text-sm text-white/60">aus {c.reviews.totalReviews} Bewertungen</p>
            </div>
          )}
          <h1 className="text-2xl font-bold sm:text-3xl">{c.companyName}</h1>
          <p className="mt-1 text-sm text-white/60">{c.contact.address.city} · {c.serviceArea.region}</p>
          <div className="mt-7 flex w-full max-w-xs flex-col gap-2.5">
            <a href={`tel:${c.contact.phoneRaw}`} className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-lg" style={{ backgroundColor: accent }}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
              Jetzt anrufen
            </a>
            <a href={wizardUrl} className="flex items-center justify-center rounded-full border border-white/20 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
              Online melden
            </a>
          </div>
        </div>
      </section>

      {/* ── Bewertungen: 3 grosse Karten ─────────────────── */}
      {c.reviews && c.reviews.highlights.length > 0 && (
        <AnimatedSection animation="slide">
          <section className="mx-auto max-w-md px-4 py-10">
            <p className="text-sm font-bold text-gray-900 mb-4">Was Kunden sagen</p>
            <div className="space-y-3">
              {c.reviews.highlights.slice(0, 3).map((r, i) => (
                <div key={i} className="rounded-3xl bg-gray-50 p-5 shadow-sm">
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <svg key={j} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">&ldquo;{r.text}&rdquo;</p>
                  <p className="mt-2 text-xs font-medium text-gray-400">{r.author}</p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Einsatzgebiet ────────────────────────────────── */}
      <AnimatedSection animation="slide">
        <section className="mx-auto max-w-md px-4 py-10">
          <p className="text-sm font-bold text-gray-900 mb-3">Einsatzgebiet</p>
          <div className="flex flex-wrap gap-1.5">
            {c.serviceArea.gemeinden.map((g) => (
              <span key={g} className="rounded-full px-3 py-1 text-xs font-medium shadow-sm" style={{ backgroundColor: `${accent}08`, color: accent, border: `1px solid ${accent}20` }}>
                {g}
              </span>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ── Leistungen: Aufzählung, KEIN ServiceCard ─────── */}
      <AnimatedSection animation="slide">
        <section id="leistungen" className="mx-auto max-w-md px-4 py-10">
          <p className="text-sm font-bold text-gray-900 mb-4">Leistungen</p>
          <div className="space-y-2">
            {c.services.map((s) => (
              <div key={s.slug} className="rounded-2xl bg-gray-50 px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{s.summary}</p>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ── Kontakt ──────────────────────────────────────── */}
      <AnimatedSection animation="slide">
        <section id="kontakt" className="mx-auto max-w-md px-4 py-10">
          <div className="rounded-3xl p-6 text-center text-white shadow-lg" style={{ backgroundColor: accent }}>
            <p className="text-lg font-bold">{c.companyName}</p>
            <p className="mt-1 text-sm text-white/70">{c.contact.address.street}, {c.contact.address.zip} {c.contact.address.city}</p>
            <a href={`tel:${c.contact.phoneRaw}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold shadow-md" style={{ color: accent }}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
              {c.contact.phone}
            </a>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="py-6">
        <div className="mx-auto flex max-w-md flex-col items-center gap-1 px-4 text-[10px] text-gray-300 sm:flex-row sm:justify-between">
          <span>&copy; {new Date().getFullYear()} {c.companyName}</span>
          <div className="flex gap-3">
            <a href={`/kunden/${c.slug}/impressum`} className="hover:text-gray-500">Impressum</a>
            <a href={`/kunden/${c.slug}/datenschutz`} className="hover:text-gray-500">Datenschutz</a>
          </div>
        </div>
      </footer>

      <StickyMobileCTA phone={c.contact.phoneRaw} wizardUrl={wizardUrl} accent={accent} />
    </div>
  );
}
