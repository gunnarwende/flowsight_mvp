/**
 * LayoutEditorial — System A: SUBSTANZ
 *
 * HANDSCHRIFT: Eckig, grosszügig, Serif, keine Schatten, nur Borders.
 * KEINE shared ServiceCard. Eigene Service-Darstellung.
 * KEINE generischen Phrasen.
 */

import { AnimatedSection } from "../AnimatedSection";
import { StickyMobileCTA } from "../StickyMobileCTA";
import type { CustomerSite } from "@/src/lib/customers/types";

// ── Laurel Wreath ──
function LaurelBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">
        <svg className="absolute left-0 top-0 h-full w-1/2 text-amber-600/60" viewBox="0 0 60 120" fill="none">
          <path d="M50 110 C45 95, 20 90, 25 75 C30 60, 15 55, 20 40 C25 25, 12 20, 18 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="22" cy="20" rx="8" ry="14" transform="rotate(-20 22 20)" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.7" />
          <ellipse cx="18" cy="42" rx="8" ry="13" transform="rotate(-30 18 42)" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.7" />
          <ellipse cx="22" cy="62" rx="8" ry="13" transform="rotate(-20 22 62)" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.7" />
          <ellipse cx="28" cy="80" rx="7" ry="12" transform="rotate(-10 28 80)" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.7" />
          <ellipse cx="38" cy="96" rx="7" ry="11" transform="rotate(5 38 96)" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.7" />
        </svg>
        <svg className="absolute right-0 top-0 h-full w-1/2 text-amber-600/60" viewBox="0 0 60 120" fill="none" style={{ transform: "scaleX(-1)" }}>
          <path d="M50 110 C45 95, 20 90, 25 75 C30 60, 15 55, 20 40 C25 25, 12 20, 18 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <ellipse cx="22" cy="20" rx="8" ry="14" transform="rotate(-20 22 20)" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.7" />
          <ellipse cx="18" cy="42" rx="8" ry="13" transform="rotate(-30 18 42)" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.7" />
          <ellipse cx="22" cy="62" rx="8" ry="13" transform="rotate(-20 22 62)" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.7" />
          <ellipse cx="28" cy="80" rx="7" ry="12" transform="rotate(-10 28 80)" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.7" />
          <ellipse cx="38" cy="96" rx="7" ry="11" transform="rotate(5 38 96)" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.7" />
        </svg>
        <span className="relative z-10 text-3xl font-bold text-gray-900 sm:text-4xl" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
          {number}
        </span>
      </div>
      <p className="mt-1 text-xs tracking-widest text-gray-400 uppercase">{label}</p>
    </div>
  );
}

export function LayoutEditorial({ company: c }: { company: CustomerSite }) {
  const accent = c.brandColor ?? "#2b6cb0";
  const wizardUrl = `/kunden/${c.slug}/meldung`;
  const heroImg = `/kunden/${c.slug}/hero.jpg`;
  const foundedYear = c.history?.[0]?.year;
  const yearsActive = foundedYear ? new Date().getFullYear() - foundedYear : null;
  const galleryMap = new Map((c.gallery ?? []).map((g) => [g.slug, g.images]));
  const serif = "var(--font-source-serif), Georgia, serif";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f5", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: "rgba(250,248,245,0.95)" }}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <span className="text-base font-semibold text-gray-800" style={{ fontFamily: serif }}>{c.companyName}</span>
          <a href={`tel:${c.contact.phoneRaw}`} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">{c.contact.phone}</a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <AnimatedSection animation="fade">
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-8 sm:pt-24">
          <div className="flex flex-col items-center text-center">
            {yearsActive && yearsActive >= 20 && (
              <LaurelBadge
                number={yearsActive >= 100 ? "100" : String(Math.floor(yearsActive / 10) * 10)}
                label={yearsActive >= 100 ? "Jahre Tradition" : "Jahre Erfahrung"}
              />
            )}
            <h1 className="mt-8 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-[3.5rem]" style={{ fontFamily: serif }}>
              {c.companyName}
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-gray-500" style={{ fontSize: "1.125rem" }}>{c.tagline}</p>
            <div className="mt-10 flex gap-5">
              <a href={wizardUrl} className="border-2 px-8 py-3 text-sm font-semibold tracking-wide text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent, borderColor: accent }}>
                Anliegen melden
              </a>
              <a href={`tel:${c.contact.phoneRaw}`} className="border-2 px-8 py-3 text-sm font-semibold tracking-wide transition-colors hover:bg-gray-50" style={{ borderColor: "#d1ccc4", color: "#6b6560" }}>
                Anrufen
              </a>
            </div>
          </div>
          <div className="mt-16 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImg} alt={c.companyName} className="w-full h-56 sm:h-72 lg:h-[26rem] object-cover" />
          </div>
        </section>
      </AnimatedSection>

      {/* ── Geschichte ───────────────────────────────────── */}
      {c.history && c.history.length >= 2 && (
        <AnimatedSection animation="fade">
          <section className="mx-auto max-w-3xl px-6 py-24">
            <div className="space-y-10">
              {c.history.map((h) => (
                <div key={h.year} className="flex gap-8">
                  <div className="flex-shrink-0 w-20 text-right pt-1">
                    <span className="text-lg font-bold" style={{ color: accent, fontFamily: serif }}>{h.year}</span>
                  </div>
                  <div className="border-l pl-8 pb-2" style={{ borderColor: "#e0d8cf" }}>
                    <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: serif }}>{h.title}</h3>
                    {h.description && <p className="mt-2 text-base leading-relaxed text-gray-500">{h.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Services: Bild + Fliessttext, KEIN ServiceCard ── */}
      <AnimatedSection animation="fade">
        <section id="leistungen" className="mx-auto max-w-4xl px-6 py-24">
          <div className="space-y-24">
            {c.services.map((s) => {
              const imgs = galleryMap.get(s.slug) ?? [];
              const firstImg = imgs[0]?.src;
              return (
                <article key={s.slug}>
                  {firstImg && (
                    <div className="overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={firstImg} alt={s.name} className="w-full h-48 sm:h-64 lg:h-72 object-cover" />
                    </div>
                  )}
                  <h3 className="mt-8 text-2xl font-bold text-gray-900" style={{ fontFamily: serif }}>{s.name}</h3>
                  <p className="mt-4 text-base leading-relaxed text-gray-500" style={{ fontSize: "1.0625rem" }}>{s.summary}</p>
                  {s.description && (
                    <p className="mt-3 text-base leading-relaxed text-gray-400">{s.description}</p>
                  )}
                  {s.bullets && s.bullets.length > 0 && (
                    <ul className="mt-5 space-y-2">
                      {s.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </AnimatedSection>

      {/* ── Bewertungen: 1 Zitat ─────────────────────────── */}
      {c.reviews && c.reviews.highlights.length > 0 && (
        <AnimatedSection animation="fade">
          <section className="py-24" style={{ backgroundColor: "#f3ede5" }}>
            <div className="mx-auto max-w-2xl px-6 text-center">
              <blockquote className="text-xl leading-relaxed text-gray-700 italic sm:text-2xl" style={{ fontFamily: serif }}>
                &ldquo;{c.reviews.highlights[0].text}&rdquo;
              </blockquote>
              <p className="mt-6 text-sm text-gray-400">{c.reviews.highlights[0].author}</p>
              {c.reviews.averageRating >= 4.0 && (
                <div className="mt-4 flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`h-4 w-4 ${i < Math.round(c.reviews!.averageRating) ? "text-amber-500" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-xs text-gray-400">{c.reviews.totalReviews} Bewertungen</span>
                </div>
              )}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Team ─────────────────────────────────────────── */}
      {c.team.length > 1 && (
        <AnimatedSection animation="fade">
          <section className="mx-auto max-w-3xl px-6 py-24">
            <div className="grid gap-12 sm:grid-cols-2">
              {c.team.map((m) => (
                <div key={m.name} className="flex items-center gap-6">
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image} alt={m.name} className="h-20 w-20 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg text-xl font-bold text-white" style={{ backgroundColor: accent }}>
                      {m.name.split(" ").map(n => n[0]).join("")}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-gray-900" style={{ fontFamily: serif }}>{m.name}</p>
                    <p className="text-sm text-gray-400">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Partner + Zertifikate ────────────────────────── */}
      {(c.certifications || c.brandPartners) && (
        <AnimatedSection animation="fade">
          <section className="mx-auto max-w-4xl px-6 py-16">
            {c.certifications && c.certifications.length > 0 && (
              <div className="flex flex-wrap justify-center gap-5">
                {c.certifications.map((cert) => (
                  <div key={cert.name} className="flex items-center gap-3 border px-5 py-3" style={{ borderColor: "#e0d8cf" }}>
                    <span className="text-sm font-semibold text-gray-700">{cert.name}</span>
                    {cert.issuer && <span className="text-xs text-gray-400">{cert.issuer}</span>}
                  </div>
                ))}
              </div>
            )}
            {c.brandPartners && c.brandPartners.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                {c.brandPartners.map((p) => (
                  <span key={p.name} className="border px-4 py-2 text-sm text-gray-500" style={{ borderColor: "#e0d8cf" }}>
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </section>
        </AnimatedSection>
      )}

      {/* ── Einzugsgebiet ────────────────────────────────── */}
      <AnimatedSection animation="fade">
        <section className="mx-auto max-w-3xl px-6 py-24">
          <p className="text-sm tracking-widest text-gray-400 uppercase">Einzugsgebiet</p>
          <p className="mt-2 text-lg text-gray-700" style={{ fontFamily: serif }}>{c.serviceArea.region}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {c.serviceArea.gemeinden.map((g) => (
              <span key={g} className="border px-3 py-1 text-sm text-gray-500" style={{ borderColor: "#e0d8cf" }}>
                {g}
              </span>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ── Kontakt ──────────────────────────────────────── */}
      <AnimatedSection animation="fade">
        <section id="kontakt" className="mx-auto max-w-3xl px-6 py-24 border-t" style={{ borderColor: "#e0d8cf" }}>
          <p className="text-lg font-semibold text-gray-900" style={{ fontFamily: serif }}>{c.companyName}</p>
          <p className="mt-2 text-base text-gray-500">{c.contact.address.street}, {c.contact.address.zip} {c.contact.address.city}</p>
          <p className="mt-1"><a href={`tel:${c.contact.phoneRaw}`} className="text-base hover:underline" style={{ color: accent }}>{c.contact.phone}</a></p>
          {c.contact.email && <p className="mt-1"><a href={`mailto:${c.contact.email}`} className="text-base text-gray-500 hover:underline">{c.contact.email}</a></p>}
          <a href={wizardUrl} className="mt-8 inline-block border-2 px-8 py-3 text-sm font-semibold tracking-wide text-white transition-opacity hover:opacity-90" style={{ backgroundColor: accent, borderColor: accent }}>
            Anliegen melden
          </a>
        </section>
      </AnimatedSection>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t py-8" style={{ borderColor: "#e0d8cf" }}>
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-6 text-xs text-gray-400 sm:flex-row sm:justify-between">
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
