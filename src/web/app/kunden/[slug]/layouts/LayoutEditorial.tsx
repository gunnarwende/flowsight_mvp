/**
 * LayoutEditorial — System A: SUBSTANZ / TRADITION
 *
 * Magazine-style, vertical, image-dominant, lots of whitespace.
 * Like an architecture monograph, not a business website.
 *
 * Used for: Generationsbetriebe (>40 Jahre), Familientradition, Handwerks-Stolz
 * Example: Dörfler AG (seit 1926, 3. Generation)
 */

import { ServiceCard } from "../ServiceCard";
import { AnimatedSection } from "../AnimatedSection";
import { StickyMobileCTA } from "../StickyMobileCTA";
import type { CustomerSite, ServiceIcon } from "@/src/lib/customers/types";

// ── Service Icon (shared SVG helper, duplicated to keep layouts self-contained) ──
function SvcIcon({ icon }: { icon?: ServiceIcon }) {
  const d: Record<string, string> = {
    bath: "M7 21h10a2 2 0 002-2v-3H5v3a2 2 0 002 2zm-2-8h14M5 7a4 4 0 014-4h.01M5 7v4h14V7",
    flame: "M12 2c1 4-2 6-2 9a4 4 0 008 0c0-3-3-5-2-9M12 18a2 2 0 01-2-2c0-1 2-3 2-3s2 2 2 3a2 2 0 01-2 2z",
    heating: "M12 3v18m-6-6l6 6 6-6M6 9a6 6 0 0112 0",
    roof: "M3 21h18M5 21V11l7-7 7 7v10",
    tool: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
    water: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
    pipe: "M4 14h6m-6 4h6m4-8v12m0-12l4-4m-4 4l-4-4",
    solar: "M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z",
  };
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d={d[icon ?? "tool"] ?? d.tool} />
    </svg>
  );
}

// ── Laurel Wreath Badge (for "100 Jahre" etc.) ──
function LaurelBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
        {/* Left laurel branch */}
        <svg className="absolute left-0 top-0 h-full w-1/2 text-amber-600/70" viewBox="0 0 60 120" fill="none">
          <path d="M50 110 C45 95, 20 90, 25 75 C30 60, 15 55, 20 40 C25 25, 12 20, 18 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="22" cy="20" rx="8" ry="14" transform="rotate(-20 22 20)" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.8" />
          <ellipse cx="18" cy="42" rx="8" ry="13" transform="rotate(-30 18 42)" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.8" />
          <ellipse cx="22" cy="62" rx="8" ry="13" transform="rotate(-20 22 62)" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.8" />
          <ellipse cx="28" cy="80" rx="7" ry="12" transform="rotate(-10 28 80)" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.8" />
          <ellipse cx="38" cy="96" rx="7" ry="11" transform="rotate(5 38 96)" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.8" />
        </svg>
        {/* Right laurel branch (mirrored) */}
        <svg className="absolute right-0 top-0 h-full w-1/2 text-amber-600/70" viewBox="0 0 60 120" fill="none" style={{ transform: "scaleX(-1)" }}>
          <path d="M50 110 C45 95, 20 90, 25 75 C30 60, 15 55, 20 40 C25 25, 12 20, 18 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="22" cy="20" rx="8" ry="14" transform="rotate(-20 22 20)" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.8" />
          <ellipse cx="18" cy="42" rx="8" ry="13" transform="rotate(-30 18 42)" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.8" />
          <ellipse cx="22" cy="62" rx="8" ry="13" transform="rotate(-20 22 62)" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.8" />
          <ellipse cx="28" cy="80" rx="7" ry="12" transform="rotate(-10 28 80)" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.8" />
          <ellipse cx="38" cy="96" rx="7" ry="11" transform="rotate(5 38 96)" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.8" />
        </svg>
        {/* Number */}
        <span className="relative z-10 text-4xl font-bold text-gray-900 sm:text-5xl" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
          {number}
        </span>
      </div>
      <p className="mt-1 text-sm font-medium tracking-wide text-gray-500 uppercase">{label}</p>
    </div>
  );
}

// ── Main Layout ──
export function LayoutEditorial({ company: c }: { company: CustomerSite }) {
  const accent = c.brandColor ?? "#2b6cb0";
  const wizardUrl = `/kunden/${c.slug}/meldung`;
  const heroImg = `/kunden/${c.slug}/hero.jpg`;
  const foundedYear = c.history?.[0]?.year;
  const yearsActive = foundedYear ? new Date().getFullYear() - foundedYear : null;
  const galleryMap = new Map((c.gallery ?? []).map((g) => [g.slug, g.images]));

  return (
    <div className="min-h-screen cs-font-source-serif" data-color-mode="warm" style={{ backgroundColor: "var(--cs-surface, #faf8f5)" }}>

      {/* ── Nav: Minimal ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: "var(--cs-surface, #faf8f5)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
            {c.companyName}
          </span>
          <a href={`tel:${c.contact.phoneRaw}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {c.contact.phone}
          </a>
        </div>
      </nav>

      {/* ── Hero: Editorial ──────────────────────────────────── */}
      <AnimatedSection animation="fade">
        <section className="mx-auto max-w-5xl px-6 pt-12 pb-8 sm:pt-20 sm:pb-12">
          <div className="flex flex-col items-center text-center">
            {/* Laurel Wreath */}
            {yearsActive && yearsActive >= 20 && (
              <LaurelBadge
                number={yearsActive >= 100 ? "100" : String(Math.floor(yearsActive / 10) * 10)}
                label={yearsActive >= 100 ? "Jahre Tradition" : "Jahre Erfahrung"}
              />
            )}

            <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
              {c.companyName}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-gray-500">{c.tagline}</p>

            <div className="mt-8 flex gap-4">
              <a href={wizardUrl} className="rounded-2xl px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent }}>
                Anliegen melden
              </a>
              <a href={`tel:${c.contact.phoneRaw}`} className="rounded-2xl border px-7 py-3.5 text-base font-semibold transition-colors hover:bg-gray-50" style={{ borderColor: accent, color: accent }}>
                Anrufen
              </a>
            </div>
          </div>

          {/* Hero Image — below text, with rounded corners, breathing room */}
          <div className="mt-12 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImg} alt={c.companyName} className="w-full h-64 sm:h-80 lg:h-[28rem] object-cover" />
          </div>
        </section>
      </AnimatedSection>

      {/* ── Geschichte (wenn vorhanden, als Herzstück) ──────── */}
      {c.history && c.history.length >= 2 && (
        <AnimatedSection animation="fade">
          <section className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
              Unsere Geschichte
            </h2>
            <div className="mt-10 space-y-8">
              {c.history.map((h) => (
                <div key={h.year} className="flex gap-6">
                  <div className="flex-shrink-0 w-16 text-right">
                    <span className="text-lg font-bold" style={{ color: accent }}>{h.year}</span>
                  </div>
                  <div className="border-l-2 pl-6 pb-2" style={{ borderColor: `${accent}30` }}>
                    <h3 className="font-semibold text-gray-900">{h.title}</h3>
                    {h.description && <p className="mt-1 text-sm text-gray-500 leading-relaxed">{h.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Services: Vertikal, Bild-dominiert ──────────────── */}
      <AnimatedSection animation="fade">
        <section id="leistungen" className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
            Unsere Leistungen
          </h2>
          <div className="mt-10 space-y-16">
            {c.services.map((s, i) => {
              const imgs = galleryMap.get(s.slug) ?? [];
              const firstImg = imgs[0]?.src;
              return (
                <div key={s.slug}>
                  {firstImg && (
                    <div className="overflow-hidden rounded-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={firstImg} alt={s.name} className="w-full h-48 sm:h-64 lg:h-80 object-cover" />
                    </div>
                  )}
                  <div className="mt-5 flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: accent }}>
                      <SvcIcon icon={s.icon} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{s.name}</h3>
                      <p className="mt-2 text-gray-500 leading-relaxed">{s.summary}</p>
                      {s.description && (
                        <ServiceCard
                          name={s.name}
                          summary=""
                          description={s.description}
                          bullets={s.bullets}
                          icon={<SvcIcon icon={s.icon} />}
                          images={imgs}
                          accent={accent}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </AnimatedSection>

      {/* ── Reviews: 1 grosses Zitat ────────────────────────── */}
      {c.reviews && c.reviews.highlights.length > 0 && (
        <AnimatedSection animation="fade">
          <section id="bewertungen" className="py-16" style={{ backgroundColor: "var(--cs-section-alt, #f5f0ea)" }}>
            <div className="mx-auto max-w-3xl px-6 text-center">
              {c.reviews.averageRating >= 4.0 && (
                <div className="mb-4 flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`h-6 w-6 ${i < Math.round(c.reviews!.averageRating) ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}
              <blockquote className="text-xl leading-relaxed text-gray-700 italic sm:text-2xl" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
                &ldquo;{c.reviews.highlights[0].text}&rdquo;
              </blockquote>
              <p className="mt-4 text-sm font-medium text-gray-500">{c.reviews.highlights[0].author}</p>
              {c.reviews.totalReviews > 1 && (
                <p className="mt-6 text-sm text-gray-400">
                  {c.reviews.googleUrl ? (
                    <a href={c.reviews.googleUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                      {c.reviews.totalReviews} Bewertungen auf Google &rarr;
                    </a>
                  ) : `${c.reviews.totalReviews} Bewertungen`}
                </p>
              )}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Team (nur wenn 2+ Mitglieder) ───────────────────── */}
      {c.team.length > 1 && (
        <AnimatedSection animation="fade">
          <section className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
              Unser Team
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {c.team.map((m) => (
                <div key={m.name} className="flex items-center gap-5">
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image} alt={m.name} className="h-20 w-20 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white" style={{ backgroundColor: accent }}>
                      {m.name.split(" ").map(n => n[0]).join("")}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.role}</p>
                    {m.bio && <p className="mt-1 text-sm text-gray-400">{m.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Trust (Zertifikate + Partner) ───────────────────── */}
      {(c.certifications || c.brandPartners) && (
        <AnimatedSection animation="fade">
          <section className="mx-auto max-w-5xl px-6 py-16">
            {c.certifications && c.certifications.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6">
                {c.certifications.map((cert) => (
                  <div key={cert.name} className="flex items-center gap-3 rounded-xl border px-5 py-3" style={{ borderColor: "var(--cs-border, #e5e7eb)", backgroundColor: "var(--cs-card, #ffffff)" }}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={accent}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{cert.name}</p>
                      {cert.issuer && <p className="text-xs text-gray-400">{cert.issuer}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {c.brandPartners && c.brandPartners.length > 0 && (
              <div className="mt-10">
                <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-gray-400">Unsere Partner</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {c.brandPartners.map((p) => (
                    <span key={p.name} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600" style={{ borderColor: "var(--cs-border)" }}>
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </AnimatedSection>
      )}

      {/* ── Einzugsgebiet ──────────────────────────────────── */}
      <AnimatedSection animation="fade">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
            Unser Einzugsgebiet
          </h2>
          <p className="mt-3 text-gray-500">{c.serviceArea.region}{c.serviceArea.radiusDescription ? ` — ${c.serviceArea.radiusDescription}` : ""}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {c.serviceArea.gemeinden.map((g) => (
              <span key={g} className="rounded-full border px-3 py-1 text-sm text-gray-600" style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-card)" }}>
                {g}
              </span>
            ))}
          </div>
          {c.contact.mapEmbedUrl && (
            <div className="mt-8 overflow-hidden rounded-2xl">
              <iframe src={c.contact.mapEmbedUrl} className="h-64 w-full border-0" loading="lazy" title="Standort" />
            </div>
          )}
        </section>
      </AnimatedSection>

      {/* ── Kontakt ────────────────────────────────────────── */}
      <AnimatedSection animation="fade">
        <section id="kontakt" className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
            Kontakt
          </h2>
          <div className="mt-8 space-y-3 text-gray-600">
            <p className="font-semibold text-gray-900">{c.companyName}</p>
            <p>{c.contact.address.street}, {c.contact.address.zip} {c.contact.address.city}</p>
            <p><a href={`tel:${c.contact.phoneRaw}`} className="hover:underline" style={{ color: accent }}>{c.contact.phone}</a></p>
            {c.contact.email && <p><a href={`mailto:${c.contact.email}`} className="hover:underline" style={{ color: accent }}>{c.contact.email}</a></p>}
          </div>
          <div className="mt-8">
            <a href={wizardUrl} className="inline-flex rounded-2xl px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent }}>
              Anliegen melden
            </a>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t py-8" style={{ borderColor: "var(--cs-border)" }}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 text-xs text-gray-400 sm:flex-row sm:justify-between">
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
